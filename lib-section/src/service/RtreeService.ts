/**
 * RtreeService - R-Tree 空间索引刷新服务
 *
 * 更新策略: 先删后插
 * 		R-Tree 不支持原地修改节点的空间范围, 因此更新流程是:
 * 			- 遍历所有 R-Tree 项, 找出包围盒发生变化的项
 * 			- 使用旧的包围盒从 R-Tree 中移除这些项
 * 			- 使用新的包围盒重新插入这些项
 * 		分两步执行(先全部删除, 再全部插入)是为了避免在删除过程中改变树结构导致后续删除操作失败
 *
 * 性能特点:
 * 		- R-Tree 的查询时间复杂度为 O(log(n)), 远优于全量遍历的 O(n)
 * 		- 批量更新时先收集再操作, 减少树结构的频繁重构
 * 		- 通过消息总线解耦, 仅在需要时才触发更新
 */

import { EFrameCommand } from '../config/CommandEnum'
import { BBox2 } from '../engine/algorithm/geometry/bbox/BBox2'
import { TRtreeNodeItem } from '../algorithm/rtree2/Rtree'
import { RtreeItem } from '../utils/RtreeItem'
import { Constant } from '../Constant'
import { BaseInterface } from '../controller/BaseInterface'

export class RtreeService extends BaseInterface {
	constructor() {
		super()
		Constant.messageTool.messageBus.subscribe(EFrameCommand.REFRESH_RTREE, this.refreshRtree.bind(this))
	}

	public quit(): void {}

	private refreshRtree(): void {
		const updatedRtreeItems: Array<RtreeItem> = []
		const allRtreeItems: Set<RtreeItem> = Constant.rtree.getAllItems()
		for (let rtreeItem of allRtreeItems) {
			const newBBox2: BBox2 = rtreeItem.target.model.updateBBox2()
			const oldBBox2: BBox2 = rtreeItem.getBBox2()
			if (newBBox2 && oldBBox2 && !newBBox2.equals(oldBBox2)) {
				updatedRtreeItems.push(rtreeItem)
			}
		}
		for (let i: number = 0; i < updatedRtreeItems.length; i++) {
			const rtreeItem: RtreeItem = updatedRtreeItems[i]
			const oldBBox2: BBox2 = rtreeItem.getBBox2()
			const r: Array<TRtreeNodeItem> = Constant.rtree.remove({ x: oldBBox2.minX, y: oldBBox2.minY, w: oldBBox2.width, h: oldBBox2.height }, rtreeItem)
		}
		for (let i: number = 0; i < updatedRtreeItems.length; i++) {
			const rtreeItem: RtreeItem = updatedRtreeItems[i]
			const newBBox2: BBox2 = rtreeItem.target.model.updateBBox2()
			rtreeItem.updateBBox2(newBBox2)
			Constant.rtree.insertItemData({ x: newBBox2.minX, y: newBBox2.minY, w: newBBox2.width, h: newBBox2.height }, rtreeItem)
		}
	}
}
