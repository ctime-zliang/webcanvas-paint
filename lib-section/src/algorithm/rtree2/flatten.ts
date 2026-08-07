import { TRtreeNodeItem } from './Rtree'

/**
 * R-Tree 子树扁平化工具 (Flatten)
 * 提供将 R-Tree 子树中的所有叶子节点"拍平"为一维数组的工具函数
 *
 * 使用场景:
 * 		- 区域删除时, 将被删除的整个子树下的所有叶子节点收集到结果集中
 * 		- 需要统计或枚举某个子树包含的所有空间对象时
 *
 * 算法: 基于栈的迭代式后序遍历
 * 		- 将树的节点逐个出栈, 如果是内部节点则将其子节点入栈
 * 		- 如果是叶子节点则加入结果数组
 * 		- 直到栈为空(所有节点均已访问)
 */

export function flatten(trees: Array<TRtreeNodeItem>): Array<TRtreeNodeItem> {
	const result: Array<TRtreeNodeItem> = []
	/**
	 * 使用 slice 创建副本以避免修改原数组
	 * 		迭代过程中 treesCopy 会被 concat 不断扩展(加入子节点), 同时通过 pop 不断缩小, 直到为空
	 *
	 * 遍历逻辑:
	 * 		- current.nodes 存在 (truthy), 即内部节点, 将其子节点列表拼接到 treesCopy
	 * 		- current.leaf 存在 (truthy), 即叶子节点, 加入结果
	 * 		- 两者都不存在, 即跳过(理论上不应出现)
	 */
	let treesCopy: Array<TRtreeNodeItem> = trees.slice()
	while (treesCopy.length) {
		const current: TRtreeNodeItem = treesCopy.pop()!
		if (current.nodes) {
			treesCopy = treesCopy.concat(current.nodes)
			continue
		}
		if (current.leaf) {
			result.push(current)
			continue
		}
	}
	return result
}
