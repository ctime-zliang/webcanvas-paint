import { RtreeDebug_profile } from './config'
import { RtreeDebug_getHashIden, RtreeDebug_updateRectangleAuxiliary } from './debug'
import { Rectangle } from './Rectangle'
import { TRtreeNodeItem, TSimpleRect } from './Rtree'

/**
 * R-Tree 子树选择算法 (ChooseLeaf / ChooseSubtree)
 * 实现 R-Tree 插入操作中的关键步骤: 选择合适的叶子节点位置
 *
 * 		输出:
 * 			bestChoiceStack 是一个从 root 到目标叶子父节点的路径数组, 用于后续 insertSubtree 中自底向上的 MBR 更新和可能的分裂传播
 *
 * 算法目标:
 * 		给定一个待插入的节点, 从根节点出发, 逐层向下选择"最优子树",直到到达叶子层级, 返回从根到目标叶子父节点的完整路径
 *
 * 选择策略 (基于 Squarified R-Tree 启发式):
 * 		在每一层, 对所有子节点计算"如果将新节点插入该子树, MBR 的正方化代价增长量", 选择代价增长量最小的子节点继续向下遍历
 *
 * 选择 delta 最小的节点, 意味着:
 * 		- 插入后 MBR 面积增长最小(空间紧凑性)
 * 		- 插入后 MBR 形状仍趋近正方形(查询效率高)
 */

export function chooseLeafSubtree(currentNode: TSimpleRect, root: TRtreeNodeItem): Array<TRtreeNodeItem> {
	// let debugId0: string = ''
	// let debugId1: string = ''
	// if (RtreeDebug_profile.isEnableDebug) {
	// 	debugId0 = RtreeDebug_getHashIden()
	// 	debugId1 = RtreeDebug_getHashIden()
	// }
	/**
	 * 假设某一层的所有子节点 nodes 均为非叶子节点
	 * 将被插入的节点(itemData) 逐一包含进 nodes[i] 中, 生成矩形 R(i)
	 * 取该层 nodes 遍历过程中 R(i) 的面积最小时对应的节点项 nodes[i], 则判定其为最佳子节点, 并继续对该最佳子节点的子节点执行同样的操作
	 *
	 * 从当前的 root 逐层往下遍历, 直到遍历到叶子节点即终止循环
	 *
	 * 遍历树的某一层的所有节点 nodes
	 * 取 nodes[i] 的"正方化"面积值 SQ(i)
	 * 取 nodes[i] 和 itemData 构建的矩形 R[i] 的"正方化"面积值 SQ(di)
	 * 找到 SQ(di) 和 SQ(i) 的差的最小值并记录索引 bestChoiceIndex = i
	 *
	 * 在下一轮外循环中获取 nodes[bestChoiceIndex] 的所有子节点 nodes
	 * 并再次执行同样的遍历操作
	 *
	 * 当 nodes[i] 为叶子节点时, 即退出整个查找循环 (do-while)
	 *
	 * 遍历过程使用 bestChoiceStack 记录从 root 到 nodes[i] 的父节点的路径(节点集合)
	 */
	let bestChoiceIndex: number = -1
	let bestChoiceStack: Array<TRtreeNodeItem> = []
	let bestChoiceArea: number = undefined!
	let first: boolean = true
	let nodes: Array<TRtreeNodeItem> = root.nodes

	bestChoiceStack.push(root)

	do {
		/**
		 * do-while 循环逐层向下遍历树结构:
		 * 		- 第一次迭代: 从 root.nodes 开始
		 * 		- 后续迭代: 进入上一轮选出的最优子节点的 nodes
		 * 终止条件: bestChoiceIndex === -1, 即当前层的子节点都是叶子节点
		 */
		if (!first) {
			bestChoiceStack.push(nodes[bestChoiceIndex])
			nodes = nodes[bestChoiceIndex].nodes
			bestChoiceIndex = -1
		}
		first = false
		for (let i: number = nodes.length - 1; i >= 0; i--) {
			let childNode: TRtreeNodeItem = nodes[i]
			if ('leaf' in childNode) {
				/**
				 * 遇到叶子节点, 说明已到达叶子层级, 终止选择过程
				 * bestChoiceIndex 设为 -1 使外层 do-while 循环退出
				 */
				bestChoiceIndex = -1
				break
			}

			// if (RtreeDebug_profile.isEnableDebug) {
			// 	RtreeDebug_updateRectangleAuxiliary(debugId0, childNode, '#440000')
			// }

			/**
			 * 计算将 currentNode 合并入 childNode 后的新 MBR 尺寸:
			 * 		新矩形 = MBR(childNode, currentNode)
			 *   		左上角: (min(childNode.x, currentNode.x), min(childNode.y, currentNode.y))
			 *   		右下角: (max(childNode.x + w, currentNode.x + w), max(childNode.y + h, currentNode.y + h))
			 */
			const ax: number = Math.min(childNode.x, currentNode.x)
			const ay: number = Math.min(childNode.y, currentNode.y)
			const bx: number = Math.max(childNode.x + childNode.w, currentNode.x + currentNode.w)
			const by: number = Math.max(childNode.y + childNode.h, currentNode.y + currentNode.h)
			const nw: number = bx - ax
			const nh: number = by - ay

			// if (RtreeDebug_profile.isEnableDebug) {
			// 	RtreeDebug_updateRectangleAuxiliary(debugId1, { x: ax, y: ay, w: nw, h: nh } as any, '#440000')
			// }

			/**
			 * 计算正方化代价变化量:
			 * 		oldChildItemRatio: 子节点当前的 squarifiedRatio (fill = 当前子节点数 + 1)
			 * 		newChildItemRatio: 合并新节点后的 squarifiedRatio (fill = 当前子节点数 + 2)
			 * 		delta = |newRatio - oldRatio|
			 *
			 * fill 的 +1 和 +2 含义:
			 * 		- oldRatio 中 fill = nodes.length + 1 表示子节点当前容量(已有节点数 + 自身)
			 * 		- newRatio 中 fill = nodes.length + 2 表示插入新节点后的容量
			 */
			const oldChildItemRatio: number = Rectangle.squarifiedRatio(childNode.w, childNode.h, childNode.nodes.length + 1)
			const newChildItemRatio: number = Rectangle.squarifiedRatio(nw, nh, childNode.nodes.length + 2)
			if (bestChoiceIndex < 0 || Math.abs(newChildItemRatio - oldChildItemRatio) < bestChoiceArea) {
				bestChoiceArea = Math.abs(newChildItemRatio - oldChildItemRatio)
				bestChoiceIndex = i
			}
		}
	} while (bestChoiceIndex !== -1)

	return bestChoiceStack
}
