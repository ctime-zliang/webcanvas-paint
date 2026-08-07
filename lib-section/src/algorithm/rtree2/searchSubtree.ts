import { Rectangle } from './Rectangle'
import { TRtreeNodeItem, TSimpleRect } from './Rtree'

/**
 * R-Tree 范围搜索算法 (Search Subtree)
 *
 * 实现 R-Tree 的空间范围查询(Range Query / Window Query)
 *
 * 算法原理:
 * 		给定一个查询矩形 Q, 返回树中所有与 Q 重叠的叶子节点
 *
 * 搜索利用了 R-Tree 的空间层级结构进行剪枝:
 * 		- 如果某个内部节点的 MBR 与 Q 不重叠, 则该子树下的所有叶子节点也不可能与 Q 重叠(因为子节点的 MBR ⊆ 父节点的 MBR),因此可以安全地跳过整个子树
 *
 * 遍历策略: 基于栈的迭代式深度优先搜索 (DFS)
 * 		- 使用 hitStack 存储待遍历的子节点列表
 * 		- 每次从栈顶取出一个节点列表, 逐个检查:
 *   		- 内部节点且与 Q 重叠 → 将其子节点列表入栈(继续向下搜索)
 *   		- 叶子节点且与 Q 重叠 → 加入结果集
 *   		- 与 Q 不重叠 → 跳过(剪枝)
 *
 * 时间复杂度:
 * 		- 最好情况: O(log_M(N)), 当查询区域很小且数据分布均匀时
 * 		- 最坏情况: O(N), 当查询区域覆盖整棵树或数据高度重叠时
 * 		- 平均情况: O(N^(1 - 1 / d) + K), 其中 d 为维度数, K 为结果集大小
 *
 * 空间复杂度: O(树高度), 即栈的最大深度
 */

export function searchSubtree(rect: TSimpleRect, root: TRtreeNodeItem): Array<TRtreeNodeItem> {
	const result: Array<TRtreeNodeItem> = []
	/**
	 * 快速排除:
	 * 		如果查询矩形与根节点的 MBR 都不重叠, 则整棵树中不可能存在与查询矩形重叠的叶子节点, 直接返回空结果
	 */
	if (!Rectangle.overlapRectangle(rect, root)) {
		return result
	}
	/**
	 * hitStack 是一个元素类型为数组的数组
	 * 在任意一次 for 遍历过程中, 在满足条件的情况下, 某一节点的所有子节点将作为一个整体, 存入 hitStack 中
	 *
	 * 由于
	 * 		- hitStack.pop()
	 * 		- for 倒序遍历
	 * 遍历某一节点的子节点列表时, 都会从最左子节点开始
	 * 当某一个子节点 C(n) 满足条件时, 将 C(n) 的子节点列表作为一个整体存入 hitStack 中
	 * 当某一个子节点 C(n) 不满足条件时, 继续遍历 C(n) 的前一个兄弟节点
	 * 整个遍历过程将是一个类似"深度优先"的处理流程
	 */
	/**
	 * 迭代式深度优先搜索:
	 * 		hitStack 存储的是"待检查的节点列表"的集合
	 * 		每次从栈顶弹出一个列表, 遍历其中的每个节点:
	 * 			┌────────────────────────────────────────┐
	 * 			│ hitStack: [[root.nodes]]               │
	 * 			│                                        │
	 * 			│ pop → [nodeA, nodeB, nodeC]            │
	 * 			│   nodeA 与 Q 重叠且是内部节点            │
	 * 			│     → push(nodeA.nodes)                │
	 * 			│   nodeB 与 Q 不重叠                     │
	 * 			│     → 跳过(剪枝)                        │
	 * 			│   nodeC 与 Q 重叠且是叶子节点            │
	 * 			│     → 加入 result                       │
	 * 			│                                        │
	 * 			│ pop → [nodeA's children...]            │
	 * 			│   ... 继续搜索 ...                      │
	 * 			└────────────────────────────────────────┘
	 *
	 * 使用 pop(LIFO) 实现深度优先, 如果改为 shift(FIFO) 则变为广度优先(但效率较低)
	 */
	const hitStack: Array<Array<TRtreeNodeItem>> = []
	hitStack.push(root.nodes)
	while (hitStack.length > 0) {
		const nodes: Array<TRtreeNodeItem> = hitStack.pop()!
		for (let i: number = nodes.length - 1; i >= 0; i--) {
			let ltree: TRtreeNodeItem = nodes[i]
			if (Rectangle.overlapRectangle(rect, ltree)) {
				if ('nodes' in ltree) {
					/**
					 * 内部节点:
					 * 		其 MBR 与查询矩形重叠, 将其子节点列表入栈以便后续逐个检查
					 */
					hitStack.push(ltree.nodes)
				} else if ('leaf' in ltree) {
					/**
					 * 叶子节点:
					 * 		其 MBR 与查询矩形重叠, 该叶子是一个满足查询条件的空间对象, 加入结果集
					 */
					result.push(ltree as TRtreeNodeItem)
				}
			}
		}
	}
	return result
}
