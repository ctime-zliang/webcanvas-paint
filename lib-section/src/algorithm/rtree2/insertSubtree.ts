import { RtreeDebug_profile } from './config'
import { RtreeDebug_getHashIden, RtreeDebug_removeRectangleAuxiliary, RtreeDebug_updateRectangleAuxiliary } from './debug'
import { linearSplit } from './linearSplit'
import { Rectangle } from './Rectangle'
import { TRtreeNodeItem } from './Rtree'
import { chooseLeafSubtree } from './chooseLeafSubtree'

/**
 * R-Tree 节点插入算法 (Insert Subtree)
 * 实现 R-Tree 的核心插入操作, 包含以下关键步骤:
 * 		- 选择叶子位置 (ChooseLeaf):
 *    			通过 chooseLeafSubtree 从根到叶子选择最优插入路径
 * 		- 插入节点:
 *    		将新节点添加到目标叶子父节点的 nodes 列表中
 * 		- 溢出处理 (Overflow Treatment):
 *    		如果插入后节点的子节点数超过 maxWidth, 触发线性分裂 (linearSplit), 将该节点的子节点拆分为两组, 生成两个新的内部节点
 * 		- 向上传播 (Propagation):
 *    		分裂结果需要向上插入到父节点, 可能导致连锁分裂直至根节点
 * 			如果根节点也发生分裂, 则创建新的根节点(树高度 +1)
 * 		- MBR 更新 (Adjust Tree):
 *    		沿路径自底向上逐层更新每个祖先节点的 MBR, 确保每个内部节点的 MBR 仍然紧密包含其所有子节点
 */

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
	/**
	 * nowHandleObj: 当前待处理的对象
	 *   	- 初始时为 willInsertNode (待插入的叶子节点)
	 *   	- 分裂后可能为 TRtreeNodeItem 数组(两个分裂子树)
	 *   	- 或单个 TRtreeNodeItem (分裂在根节点时的第二个子树)
	 *
	 * bc: 当前正在处理的父节点(从 nodeDeepthPath 弹出)
	 * bcChild: 上一轮循环中因 nodes 为空而需要被移除的节点
	 * expandRect: 用于向上传播 MBR 更新的矩形缓存
	 *   	- 为 null 时表示当前轮需要执行插入操作
	 *   	- 非 null 时表示当前轮只需执行 MBR 扩展
	 */
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
			/**
			 * MBR 向上传播阶段:
			 * 		当 expandRect 非空时, 表示下层节点已完成插入且未发生分裂, 此时只需要将下层节点的 MBR 信息逐层向上传播, 确保每个祖先节点的 MBR 能正确包含所有后代节点
			 *
			 * expandRectangle(bc, expandRect):
			 * 		将 bc 的 MBR 扩展以包含 expandRect, 然后用 bc 的新 MBR 作为下一轮向上传播的 expandRect
			 */
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
					/**
					 * 数组情况:
					 * 		- 分裂产生的两个子树需要同时插入到父节点
					 * 		- 逐一扩展父节点 bc 的 MBR 以包含每个分裂子树
					 */
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
					/**
					 * 单节点情况:
					 * 		- 将叶子节点或单个分裂子树插入到父节点
					 */
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
					/**
					 * 未溢出:
					 * 		设置 expandRect 为当前节点的 MBR, 后续循环将进入 MBR 向上传播分支
					 */
					expandRect = { x: bc.x, y: bc.y, w: bc.w, h: bc.h }
				} else {
					/**
					 * 裂变子树
					 * 		列表后的 nodes 即为空
					 * 		在后续的处理中, 裂变的结果将重新插入到原所在的父节点的 nodes 中
					 */
					/**
					 * 溢出处理 - 线性分裂(Linear Split):
					 * 		当 bc.nodes.length > maxWidth 时, 需要将 bc 的子节点集合 拆分成两个组, 生成两个新的内部节点
					 *
					 * linearSplit 算法:
					 * 		- pickLinear: 选择两个"种子"节点(在某维度上距离最远的两个节点)
					 * 		- pickNext: 逐个将剩余节点分配到两个组中, 基于代价最小化策略
					 *
					 * 分裂后 bc.nodes 被清空(linearSplit 通过 splice 逐个移出所有元素), 返回的 fissionList 包含两个新的内部节点, 各自持有一部分原子节点
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
						 * 根节点分裂(树增高):
						 * 		当分裂传播到根节点时, 需要将根节点"提升":
						 * 			- 将 fissionList[0] 作为 bc(root) 的第一个子节点
						 * 			- 将 bc(root) 重新入栈, 在下一轮循环中将 fissionList[1] 也插入
						 * 			- 最终 root 将拥有两个子节点(即树的高度增加了 1 层)
						 * 		这是 R-Tree 高度增长的唯一方式, 确保了树的平衡性
						 */
						/**
						 * 将裂变结果列表的第一个根节点添加到 bc (即 root) 的 nodes 列表中
						 */
						bc.nodes.push(fissionList[0])
						nodeDeepthPath.push(bc)
						nowHandleObj = fissionList[1]
					} else {
						/**
						 * 中间层分裂:
						 * 		- bc 不是根节点, 将两个分裂结果作为数组传递给 nowHandleObj, 在下一轮循环中, 它们将被插入到 bc 的父节点中
						 * 		- 这可能引发连锁分裂 (cascade split) 直至根节点
						 */
						nowHandleObj = fissionList
					}
				}
			}
		}
	}
}
