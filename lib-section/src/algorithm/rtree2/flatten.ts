import { TRtreeNodeItem } from './Rtree'

export function flatten(trees: Array<TRtreeNodeItem>): Array<TRtreeNodeItem> {
	const result: Array<TRtreeNodeItem> = []
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
