import { flatten } from './flatten'
import { insertSubtree } from './insertSubtree'
import { Rectangle } from './Rectangle'
import { TRtreeNodeItem, TSimpleRect } from './Rtree'
import { searchSubtree } from './searchSubtree'

type THandleObj = {
	x: number
	y: number
	w: number
	h: number
	target?: any
	nodes?: Array<TRtreeNodeItem>
}

export function removeSubtree(rect: TSimpleRect, obj: any, root: TRtreeNodeItem, maxWidth: number, minWidth: number): Array<TRtreeNodeItem> {
	let removedList: Array<TRtreeNodeItem> = []
	if (!rect || !Rectangle.overlapRectangle(rect, root)) {
		return removedList
	}
	let handleObj: THandleObj = { x: rect.x, y: rect.y, w: rect.w, h: rect.h, target: obj }
	let chooseStack: Array<TRtreeNodeItem> = []
	let chooseChildIndexStack: Array<number> = []
	let lastItemIndex: number = -1
	let currentDepth: number = 1
	let tree: TRtreeNodeItem = null!
	let itemTree: TRtreeNodeItem = null!

	chooseStack.push(root)
	chooseChildIndexStack.push(root.nodes.length - 1)
	/**
	 * 逐级遍历子节点树
	 * 		将当前遍历到的节点记作 tree
	 * 		将当前遍历到的节点的子节点记作 itemTree
	 * 		将当前遍历到的节点的子节点索引记作 lastItemIndex
	 * 			即 itemTree 在 tree.nodes 中的索引即为 lastItemIndex
	 */
	TREE_LOOP: while (chooseStack.length > 0) {
		tree = chooseStack.pop()!
		lastItemIndex = chooseChildIndexStack.pop()!
		if ('target' in handleObj) {
			/**
			 * 从尾到头遍历 itemTree 节点和其所有兄弟节点
			 */
			while (lastItemIndex >= 0) {
				itemTree = tree.nodes[lastItemIndex]
				/**
				 * 如果 itemTree 的覆盖范围与传入的 RECT 尺寸数据有重叠
				 * 即传入的 RECT 尺寸范围命中当前子节点 itemTree 分支
				 * 如果二者的范围没有重叠, 则沿着 itemTree 的兄弟节点往前遍历
				 */
				if (Rectangle.overlapRectangle(handleObj, itemTree)) {
					/**
					 * 如果满足(或):
					 * 		- C1: 当前指定了某个删除对象 && itemTree 为叶子节点 && itemTree 绑定的对象为传入的指定删除对象
					 * 		- C2: 当前未指定必须删除的对象 && (C1-1: itemTree 为叶子节点 ||C1-2: itemTree 的尺寸范围包含于传入的尺寸范围内)
					 * 则将 itemTree 从所在的 nodes 列表中删除
					 */
					if (
						(handleObj.target && 'leaf' in itemTree && itemTree.leaf === handleObj.target) ||
						(!handleObj.target && ('leaf' in itemTree || Rectangle.containsRectangle(itemTree, handleObj)))
					) {
						const rmSelectedList: Array<TRtreeNodeItem> = tree.nodes.splice(lastItemIndex, 1)
						/**
						 * 基于上述判断条件, 此处需要再次判断 itemTree 是否为叶子节点
						 */
						if ('nodes' in itemTree) {
							/**
							 * 当满足上述判断中的 C2 && C1-2 时, 即 itemTree 为中间层节点
							 * 需要将 itemTree 下的所有叶子节点(包含所有层级)全部作为删除节点并返回
							 */
							removedList = flatten(rmSelectedList)
						} else {
							/**
							 * 在上述判断条件场景下, 此时 itemTree 即为叶子节点, 即将 itemTree 自身作为删除节点并返回
							 */
							removedList = rmSelectedList
						}
						/**
						 * 使用 itemTree 剩下的兄弟节点列表(tree.nodes)重新刷新 itemTree 父节点的尺寸范围数据
						 */
						Rectangle.makeMBR(tree, tree.nodes)
						delete handleObj.target
						break TREE_LOOP
					} else if ('nodes' in itemTree) {
						/**
						 * 如果 itemTree 为中间层节点或根节点, 则继续沿着树的最右侧往下遍历
						 * 		最右侧: 子节点列表的最后一个
						 */
						currentDepth++
						/**
						 * 循环 CHILDS_LOOP 的作用是遍历 itemTree 节点和其所有兄弟节点, 记作 CHILDS_LOOP@NODES
						 * 在此循环结束后, 如果未满足移除查找条件, 则需要继续通过循环 TREE_LOOP 将 CHILDS_LOOP@NODES 的父节点的前一个节点的子节点列表作为新循环 CHILDS_LOOP 的遍历列表
						 * 即 lastItemIndex - 1 代表 CHILDS_LOOP@NODES 的父节点的前一个节点的索引
						 */
						chooseChildIndexStack.push(lastItemIndex - 1)
						chooseStack.push(tree)
						tree = itemTree
						lastItemIndex = itemTree.nodes.length - 1
					}
				}
				lastItemIndex--
			}
		} else if ('nodes' in handleObj) {
			/**
			 * 如果 itemTree 的子节点个数小于节点最小阈值
			 * 需要将该节点从其所在的节点集合(tree.nodes)中移除
			 * 同时将 itemTree 下的所有叶子节点(handleObj.nodes)重新插入到 tree 中
			 */
			tree.nodes.splice(lastItemIndex, 1)
			/**
			 * 使用 itemTree 剩下的兄弟节点列表(tree.nodes)重新刷新 itemTree 父节点的尺寸范围数据
			 */
			Rectangle.makeMBR(tree, tree.nodes)
			const childNodes: Array<TRtreeNodeItem> = handleObj.nodes || []
			for (let k = 0; k < childNodes.length; k++) {
				insertSubtree(childNodes[k], tree, minWidth, maxWidth)
			}
			handleObj.nodes = []
			if (chooseStack.length === 0 && tree.nodes.length <= 1) {
				/**
				 * 平衡子树的调整策略
				 *
				 * 当回溯到 root 节点时, 如果其子节点个数小于等于 1
				 * 需要获取 tree 下的所有叶子节点, 即 handleObj.nodes
				 * 将当前 tree 节点重新存入 chooseStack 中, 以便继续开启新一轮外循环
				 * 继而使得 handleObj.nodes 将被重新插入到 tree.parent
				 */
				handleObj.nodes = searchSubtree({ x: tree.x, y: tree.y, w: tree.w, h: tree.h }, tree)
				tree.nodes = []
				chooseStack.push(tree)
				chooseChildIndexStack.push(0)
				currentDepth -= 1
				continue
			}
			if (chooseStack.length > 0 && tree.nodes.length < minWidth) {
				/**
				 * 平衡子树的调整策略
				 *
				 * 在回溯过程中, 如果当前遍历的节点 tree 为非 root 节点, 且其子节点个数小于最小阈值
				 * 需要获取 tree 下的所有叶子节点, 即 handleItem.nodes
				 * 在随即的下一轮外循环中, handleItem.nodes 将被重新插入到 tree.parent
				 */
				handleObj.nodes = searchSubtree({ x: tree.x, y: tree.y, w: tree.w, h: tree.h }, tree)
				tree.nodes = []
				currentDepth -= 1
				continue
			}
			delete handleObj.nodes
			currentDepth -= 1
		} else {
			/**
			 * 使用 itemTree 的兄弟节点列表(tree.nodes)重新刷新 itemTree 父节点的尺寸范围数据
			 */
			Rectangle.makeMBR(tree, tree.nodes)
		}
		currentDepth -= 1
	}
	return removedList
}
