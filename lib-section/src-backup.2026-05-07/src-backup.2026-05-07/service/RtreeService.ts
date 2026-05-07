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
			const r: Array<TRtreeNodeItem> = Constant.rtree.remove(
				{ x: oldBBox2.minX, y: oldBBox2.minY, w: oldBBox2.width, h: oldBBox2.height },
				rtreeItem
			)
			// console.log(r)
		}
		for (let i: number = 0; i < updatedRtreeItems.length; i++) {
			const rtreeItem: RtreeItem = updatedRtreeItems[i]
			const newBBox2: BBox2 = rtreeItem.target.model.updateBBox2()
			rtreeItem.updateBBox2(newBBox2)
			Constant.rtree.insertItemData({ x: newBBox2.minX, y: newBBox2.minY, w: newBBox2.width, h: newBBox2.height }, rtreeItem)
		}
	}
}
