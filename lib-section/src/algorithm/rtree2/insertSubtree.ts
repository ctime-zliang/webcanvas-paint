import { RtreeDebug_profile } from './config'
import { RtreeDebug_getHashIden, RtreeDebug_removeRectangleAuxiliary, RtreeDebug_updateRectangleAuxiliary } from './debug'
import { linearSplit } from './linearSplit'
import { Rectangle } from './Rectangle'
import { TRtreeNodeItem } from './Rtree'
import { chooseLeafSubtree } from './chooseLeafSubtree'

export function insertSubtree(willInsertNode: TRtreeNodeItem, root: TRtreeNodeItem, maxWidth: number, minWidth: number): void {
	/**
	 * 当 root 节点的子节点集合为空时, 执行插入时首先填充根节点
	 */
	if (root.nodes.length === 0) {
		root.x = willInsertNode.x
		root.y = willInsertNode.y
		root.w = willInsertNode.w
		root.h = willInsertNode.h
		root.nodes.push(willInsertNode)
		// if (RtreeDebug_profile.isEnableDebug) {
		// 	RtreeDebug_updateRectangleAuxiliary(root.id!, root)
		// }
		return
	}
	/**
	 * 将目标节点插入到当前树中
	 * 获取从 root 节点到 willInsertNode 最终所在的 nodes 的直接父节点的位置
	 */
	let nodeDeepthPath: Array<TRtreeNodeItem> = chooseLeafSubtree(willInsertNode, root)
	let nowHandleObj: TRtreeNodeItem | Array<TRtreeNodeItem> = willInsertNode
	let bc: TRtreeNodeItem = undefined!
	let bcChild: TRtreeNodeItem = undefined!
	let expandRect: { x: number; y: number; w: number; h: number } = null!
	while (nodeDeepthPath.length > 0) {
		if (bc && 'nodes' in bc && bc.nodes.length === 0) {
			expandRect = null!
			/**
			 * 将当前节点缓存, 并将当前节点的父节点从 nodeDeepthPath 取出并赋值给 bc
			 * 即 bcChild.parent = bc
			 */
			bcChild = bc
			bc = nodeDeepthPath.pop()!
			for (let t: number = 0; t < bc.nodes.length; t++) {
				/**
				 * 此处的 bcChild 即为上一轮循环中被对其 nodes 列表进行了裂变处理的 bc
				 * 此时, bcChild 的 nodes 为空, 需要从 bcChild.parent 将其删除
				 */
				if (bc.nodes[t] === bcChild) {
					const item: Array<TRtreeNodeItem> = bc.nodes.splice(t, 1)
					// if (RtreeDebug_profile.isEnableDebug) {
					// 	RtreeDebug_removeRectangleAuxiliary(item[0].id!)
					// }
					break
				} else if (bc.nodes[t].nodes.length === 0) {
					const item: Array<TRtreeNodeItem> = bc.nodes.splice(t, 1)
					// if (RtreeDebug_profile.isEnableDebug) {
					// 	RtreeDebug_removeRectangleAuxiliary(item[0].id!)
					// }
					break
				}
			}
		} else {
			bc = nodeDeepthPath.pop()!
		}
		if (expandRect) {
			// if (RtreeDebug_profile.isEnableDebug) {
			// 	RtreeDebug_updateRectangleAuxiliary(bc.id!, bc)
			// }
			Rectangle.expandRectangle(bc, expandRect)
			// if (RtreeDebug_profile.isEnableDebug) {
			// 	RtreeDebug_updateRectangleAuxiliary(bc.id!, bc)
			// }
			expandRect = { x: bc.x, y: bc.y, w: bc.w, h: bc.h }
		} else {
			if ('leaf' in nowHandleObj || 'nodes' in nowHandleObj || Array.isArray(nowHandleObj)) {
				expandRect = null!
				/**
				 * 将 nowHandleObj 插入到子节点列表
				 */
				if (Array.isArray(nowHandleObj)) {
					for (let ai: number = 0; ai < nowHandleObj.length; ai++) {
						// if (RtreeDebug_profile.isEnableDebug) {
						// 	RtreeDebug_updateRectangleAuxiliary(bc.id!, bc)
						// }
						Rectangle.expandRectangle(bc, nowHandleObj[ai])
						// if (RtreeDebug_profile.isEnableDebug) {
						// 	RtreeDebug_updateRectangleAuxiliary(bc.id!, bc)
						// }
					}
					bc.nodes = bc.nodes.concat(nowHandleObj)
				} else {
					// if (RtreeDebug_profile.isEnableDebug) {
					// 	RtreeDebug_updateRectangleAuxiliary(bc.id!, bc)
					// }
					Rectangle.expandRectangle(bc, nowHandleObj)
					// if (RtreeDebug_profile.isEnableDebug) {
					// 	RtreeDebug_updateRectangleAuxiliary(bc.id!, bc)
					// }
					bc.nodes.push(nowHandleObj)
				}
				/**
				 * 在将当前传入的节点插入到指定的父节点的 nodes 列表中后
				 * 检查该指定的父节点的 nodes 长度是否超过限制
				 * 如果
				 * 		大于设定的最大子节点个数
				 * 则
				 * 		将该指定的父节点的 nodes 列表进行裂变, 拆成两颗子树
				 * 否则
				 * 		以当前指定的父节点的 RECT 数据, 更新该指定的父节点的父节点的 RECT 数据
				 *
				 * 如果进入到刷新 RECT 数据的流程后
				 * 由于 nodeDeepthPath 是一个深度 path 数组, 在后续的遍历过程中, 会逐轮以子节点的 RECT 更新父节点的 RECT 数据
				 * 也即会一直进入 if (expandRect) 语句块逻辑
				 */
				if (bc.nodes.length <= maxWidth) {
					expandRect = { x: bc.x, y: bc.y, w: bc.w, h: bc.h }
				} else {
					/**
					 * 裂变子树
					 * 		列表后的 nodes 即为空
					 * 		在后续的处理中, 裂变的结果将重新插入到原所在的父节点的 nodes 中
					 */
					let fissionList: Array<TRtreeNodeItem> = linearSplit(bc.nodes, minWidth)
					// if (RtreeDebug_profile.isEnableDebug) {
					// 	fissionList[0].id = 'node-' + RtreeDebug_getHashIden() + '-a'
					// 	fissionList[1].id = 'node-' + RtreeDebug_getHashIden() + '-b'
					// 	fissionList.forEach((item: TRtreeNodeItem, index: number): void => {
					// 		RtreeDebug_updateRectangleAuxiliary(item.id!, item)
					// 	})
					// }
					/**
					 * 当 nodeDeepthPath 为空, 即表示大循环遍历过程已退回到 root 节点
					 * 此时 root 已从 nodeDeepthPath 弹出并赋值给 bc
					 * 需要将裂变结果中的节点之一挂载到 root 节点
					 * 将 root 节点重新存入 nodeDeepthPath 中以便重新开启新一轮大循环, 以便并在新一轮大循环中将裂变结果中的另一个根节点插入到 root 节点(树)中
					 *
					 * 如果 nodeDeepthPath 不为空, 即大循环遍历过程正处于树的中间某一层节点, 当前节点即 bc 所指向的引用
					 * 在下一轮大循环中, 将裂变结果插入到 bc.parent 中
					 */
					if (nodeDeepthPath.length <= 0) {
						/**
						 * 将裂变结果列表的第一个根节点添加到 bc(即 root) 的 nodes 列表中
						 */
						bc.nodes.push(fissionList[0])
						nodeDeepthPath.push(bc)
						nowHandleObj = fissionList[1]
					} else {
						nowHandleObj = fissionList
					}
				}
			}
		}
	}
}
