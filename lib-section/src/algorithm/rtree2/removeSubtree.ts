import { flatten } from './flatten'
import { insertSubtree } from './insertSubtree'
import { Rectangle } from './Rectangle'
import { TRtreeNodeItem, TSimpleRect } from './Rtree'
import { searchSubtree } from './searchSubtree'

/**
 * R-Tree 节点删除算法 (Remove Subtree)
 *
 * 实现 R-Tree 的删除操作, 包含以下关键步骤:
 * 		- 搜索目标节点 (FindLeaf):
 *    		从根节点出发, 利用 MBR 重叠检测进行剪枝, 定位待删除的叶子节点
 * 		- 删除节点:
 *    		从其父节点的 nodes 列表中 splice 移除目标节点
 * 		- MBR 重算 (CondenseTree - Part 1):
 *    		删除后, 沿路径自底向上使用 makeMBR 重新计算每个祖先节点的 MBR
 * 		- 下溢处理 (CondenseTree - Part 2):
 *    		如果删除导致某节点的子节点数 < minWidth, 该节点被"解散":
 *    			- 将该节点从其父节点中移除
 *    			- 将该节点下的所有叶子节点收集起来
 *    			- 将这些叶子节点重新插入到树中(Reinsertion)
 * 		- 根节点收缩:
 *    		如果根节点在操作后只剩 <= 1 个子节点, 进行"降高"处理:
 *    			- 将根节点下的所有叶子重新插入, 使树高度可能减少
 *
 * 删除模式:
 * 		- 精确删除 (obj 非 false): 删除 leaf === obj 的特定叶子节点
 * 		- 区域删除 (obj === false): 删除被 rect 包含的所有节点(含子树)
 */

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
	/**
	 * handleObj 是一个状态对象, 用于控制删除过程中不同阶段的行为:
	 * 		- ('target' in handleObj): 搜索阶段
	 *  		 - target 为 truthy: 精确删除模式, 寻找 leaf === target 的节点
	 *   		- target 为 falsy: 区域删除模式, 寻找被 rect 包含或为叶子的节点
	 * 		- ('nodes' in handleObj): 回溯重平衡阶段
	 *   		- handleObj.nodes 存储了需要重新插入的叶子节点
	 *   		- 进入此阶段表示删除已完成, 正在处理下溢 (underflow)
	 * 		- (既无 'target' 也无 'nodes'): MBR 更新阶段
	 *   		- 仅执行 MBR 重算, 无其他操作
	 */
	let handleObj: THandleObj = { x: rect.x, y: rect.y, w: rect.w, h: rect.h, target: obj }
	/**
	 * chooseStack:
	 * 		遍历路径栈, 记录从根到当前节点的路径(深度优先)
	 * chooseChildIndexStack:
	 * 		与 chooseStack 对应的子节点索引栈, 记录每一层下次应继续遍历的兄弟节点索引(用于回溯)
	 */
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
	/**
	 * 主循环: 深度优先遍历树结构
	 * 遍历策略:
	 * 		- 使用显式栈 (chooseStack + chooseChildIndexStack) 模拟递归
	 * 		- 从最右子节点向左遍历(lastItemIndex--)
	 * 		- 当需要深入子树时, 将当前位置入栈
	 * 		- 当需要回溯时, 从栈中弹出恢复上层位置
	 *
	 * TREE_LOOP 标签用于在找到并删除目标节点后立即跳出整个循环
	 */
	TREE_LOOP: while (chooseStack.length > 0) {
		tree = chooseStack.pop()!
		lastItemIndex = chooseChildIndexStack.pop()!
		if ('target' in handleObj) {
			/**
			 * 从尾到头遍历 itemTree 节点和其所有兄弟节点
			 */
			/**
			 * 遍历 tree.nodes[lastItemIndex] 到 tree.nodes[0], 利用 MBR 重叠检测进行空间剪枝
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
					if ((handleObj.target && 'leaf' in itemTree && itemTree.leaf === handleObj.target) || (!handleObj.target && ('leaf' in itemTree || Rectangle.containsRectangle(itemTree, handleObj)))) {
						const rmSelectedList: Array<TRtreeNodeItem> = tree.nodes.splice(lastItemIndex, 1)
						/**
						 * 基于上述判断条件, 此处需要再次判断 itemTree 是否为叶子节点
						 */
						if ('nodes' in itemTree) {
							/**
							 * 当满足上述判断中的 C2 && C1 - 2 时, 即 itemTree 为中间层节点
							 * 需要将 itemTree 下的所有叶子节点(包含所有层级)全部作为删除节点并返回
							 */
							/**
							 * 删除整个子树(区域删除):
							 * 		itemTree 是一个内部节点, 其 MBR 完全被 rect 包含
							 * 		使用 flatten 递归收集该子树下的所有叶子节点作为删除结果
							 */
							removedList = flatten(rmSelectedList)
						} else {
							/**
							 * 在上述判断条件场景下, 此时 itemTree 即为叶子节点, 即将 itemTree 自身作为删除节点并返回
							 */
							removedList = rmSelectedList
						}
						/**
						 * 使用 itemTree 剩下的兄弟节点列表 (tree.nodes) 重新刷新 itemTree 父节点的尺寸范围数据
						 */
						/**
						 * 删除后重算 MBR:
						 * 		移除节点后, 父节点的 MBR 可能缩小, 使用 makeMBR 基于剩余子节点重新计算精确的 MBR
						 */
						Rectangle.makeMBR(tree, tree.nodes)
						/**
						 * 删除 target 属性使 handleObj 进入 "回溯重平衡阶段", 跳出 TREE_LOOP 后, 外层逻辑 (Rtree.ts) 根据返回的 removedList, 判断删除是否成功
						 */
						delete handleObj.target
						break TREE_LOOP
					} else if ('nodes' in itemTree) {
						/**
						 * 如果 itemTree 为中间层节点或根节点, 则继续沿着树的最右侧往下遍历
						 * 		最右侧: 子节点列表的最后一个
						 */
						/**
						 * 继续深入子树:
						 * 		itemTree 是内部节点且与 rect 重叠, 但不满足删除条件
						 * 		需要继续向下搜索其子节点
						 *
						 * 入栈当前层的状态 (tree + lastItemIndex - 1), 以便搜索完 itemTree 的子树后能回溯到 itemTree 的前一个兄弟节点继续搜索
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
			 * 需要将该节点从其所在的节点集合 (tree.nodes) 中移除
			 * 同时将 itemTree 下的所有叶子节点 (handleObj.nodes) 重新插入到 tree 中
			 */
			/**
			 * 进入此分支的前提: 上一轮循环中某个子节点发生了下溢, 其所有叶子节点被收集到 handleObj.nodes 中, 该子节点已被清空
			 *
			 * 处理流程:
			 * 		- 从 tree.nodes 中移除已清空的子节点(由 lastItemIndex 定位)
			 * 		- 重算 tree 的 MBR
			 * 		- 将 handleObj.nodes 中的叶子节点重新插入到 tree 中
			 * 		- 检查 tree 自身是否也发生了下溢, 若是则继续上溯
			 */
			tree.nodes.splice(lastItemIndex, 1)
			/**
			 * 使用 itemTree 剩下的兄弟节点列表 (tree.nodes) 重新刷新 itemTree 父节点的尺寸范围数据
			 */
			Rectangle.makeMBR(tree, tree.nodes)
			const childNodes: Array<TRtreeNodeItem> = handleObj.nodes || []
			for (let k = 0; k < childNodes.length; k++) {
				// insertSubtree(childNodes[k], tree, minWidth, maxWidth)
				insertSubtree(childNodes[k], tree, maxWidth, minWidth)
			}
			handleObj.nodes = []
			if (chooseStack.length === 0 && tree.nodes.length <= 1) {
				/**
				 * 平衡子树的调整策略:
				 * 		当回溯到 root 节点时, 如果其子节点个数小于等于 1, 需要获取 tree 下的所有叶子节点, 即 handleObj.nodes
				 * 		将当前 tree 节点重新存入 chooseStack 中, 以便继续开启新一轮外循环, 继而使得 handleObj.nodes 将被重新插入到 tree.parent
				 */
				/**
				 * 根节点收缩(树降高):
				 * 		当回溯到根节点且其子节点数 <= 1 时, 说明树的高度可以减少(根节点只有一个子树没有存在的意义)
				 *
				 * 策略:
				 * 		收集根节点下的所有叶子, 清空根节点, 重新插入所有叶子
				 *
				 * 注意:
				 * 		此处使用 chooseChildIndexStack.push(0) 是因为在下一轮循环中 tree.nodes 已被清空, lastItemIndex = 0, 将用于 splice(0, 1) 操作(尽管此时已无元素可移除)
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
				/**
				 * 中间节点下溢 (Underflow):
				 * 		tree 不是根节点, 且其子节点数 < minWidth, 违反了 R-Tree 的填充率约束
				 * 处理策略:
				 * 		"解散"该节点
				 * 			- 收集该节点下的所有叶子节点到 handleObj.nodes
				 * 			- 清空该节点(使其成为空壳)
				 * 			- 在下一轮循环中, 父节点会将这个空壳移除, 并将 handleObj.nodes 中的叶子重新插入到更高层级的树中
				 *
				 * 这种"解散-重插"策略确保了重新插入的叶子会被放置到最优位置, 而不仅仅是简单合并到相邻兄弟节点(可能导致非最优的 MBR 扩展)
				 */
				handleObj.nodes = searchSubtree({ x: tree.x, y: tree.y, w: tree.w, h: tree.h }, tree)
				tree.nodes = []
				currentDepth -= 1
				continue
			}
			/**
			 * tree 的子节点数仍满足 minWidth 约束, 无需进一步调整
			 * 删除 handleObj.nodes 使 handleObj 进入"MBR 更新阶段"
			 */
			delete handleObj.nodes
			currentDepth -= 1
		} else {
			/**
			 * 使用 itemTree 的兄弟节点列表 (tree.nodes) 重新刷新 itemTree 父节点的尺寸范围数据
			 */
			/**
			 * 删除和重平衡均已完成, 只需自底向上逐层重算 MBR
			 */
			Rectangle.makeMBR(tree, tree.nodes)
		}
		currentDepth -= 1
	}
	return removedList
}
