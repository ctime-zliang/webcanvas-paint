import { RtreeDebug_profile } from './config'
import { RtreeDebug_getHashIden, RtreeDebug_updateRectangleAuxiliary } from './debug'
import { Rectangle } from './Rectangle'
import { TRtreeNodeItem, TSimpleRect } from './Rtree'

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
	 * 当 nodes[i] 为叶子节点时, 即退出整个查找循环(do-while)
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
		if (!first) {
			bestChoiceStack.push(nodes[bestChoiceIndex])
			nodes = nodes[bestChoiceIndex].nodes
			bestChoiceIndex = -1
		}
		first = false
		for (let i: number = nodes.length - 1; i >= 0; i--) {
			let childNode: TRtreeNodeItem = nodes[i]
			if ('leaf' in childNode) {
				bestChoiceIndex = -1
				break
			}

			// if (RtreeDebug_profile.isEnableDebug) {
			// 	RtreeDebug_updateRectangleAuxiliary(debugId0, childNode, '#440000')
			// }

			const ax: number = Math.min(childNode.x, currentNode.x)
			const ay: number = Math.min(childNode.y, currentNode.y)
			const bx: number = Math.max(childNode.x + childNode.w, currentNode.x + currentNode.w)
			const by: number = Math.max(childNode.y + childNode.h, currentNode.y + currentNode.h)
			const nw: number = bx - ax
			const nh: number = by - ay

			// if (RtreeDebug_profile.isEnableDebug) {
			// 	RtreeDebug_updateRectangleAuxiliary(debugId1, { x: ax, y: ay, w: nw, h: nh } as any, '#440000')
			// }

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
