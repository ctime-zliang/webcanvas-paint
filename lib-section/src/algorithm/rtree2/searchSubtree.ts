import { Rectangle } from './Rectangle'
import { TRtreeNodeItem, TSimpleRect } from './Rtree'

export function searchSubtree(rect: TSimpleRect, root: TRtreeNodeItem): Array<TRtreeNodeItem> {
	const result: Array<TRtreeNodeItem> = []
	if (!Rectangle.overlapRectangle(rect, root)) {
		return result
	}
	/**
	 * hitStack 是一个元素类型为数组的数组
	 * 在任意一次 for 遍历过程中, 在满足条件的情况下, 某一节点的所有子节点将作为一个整体, 存入 hitStack 中
	 *
	 * 由于
	 * 		1. hitStack.pop()
	 * 		2. for 倒序遍历
	 * 遍历某一节点的子节点列表时, 都会从最左子节点开始
	 * 当某一个子节点 C(n) 满足条件时, 将 C(n) 的子节点列表作为一个整体存入 hitStack 中
	 * 当某一个子节点 C(n) 不满足条件时, 继续遍历 C(n) 的前一个兄弟节点
	 * 整个遍历过程将是一个类似"深度优先"的处理流程
	 */
	const hitStack: Array<Array<TRtreeNodeItem>> = []
	hitStack.push(root.nodes)
	while (hitStack.length > 0) {
		const nodes: Array<TRtreeNodeItem> = hitStack.pop()!
		for (let i: number = nodes.length - 1; i >= 0; i--) {
			let ltree: TRtreeNodeItem = nodes[i]
			if (Rectangle.overlapRectangle(rect, ltree)) {
				if ('nodes' in ltree) {
					hitStack.push(ltree.nodes)
				} else if ('leaf' in ltree) {
					result.push(ltree as TRtreeNodeItem)
				}
			}
		}
	}
	return result
}
