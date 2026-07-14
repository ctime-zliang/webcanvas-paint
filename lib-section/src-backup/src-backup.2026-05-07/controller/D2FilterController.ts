import { BBox2 } from '../engine/algorithm/geometry/bbox/BBox2'
import { RtreeItem } from '../utils/RtreeItem'
import { DrawLayerShapeManager } from '../objects/shapes/manager/DrawLayerShapeManager'
import { D2ElementShapeItemBase } from '../objects/shapes/primitive2d/elementBase/D2ElementShapeItemBase'
import { DrawLayerShape } from '../objects/shapes/DrawLayerShape'
import { TRtreeNodeItem } from '../algorithm/rtree2/Rtree'
import { BaseInterface } from './BaseInterface'
import { Constant } from '../Constant'

export class D2FilterController extends BaseInterface {
	constructor() {
		super()
	}

	/**
	 * 获取点选图元集合
	 */
	public pointSelectBeforeFilter(x: number, y: number): Set<D2ElementShapeItemBase> {
		const selectedDrawLayerShapeItem: DrawLayerShape = DrawLayerShapeManager.getInstance().getFirstSelectedItem()
		const results: Set<D2ElementShapeItemBase> = new Set()
		if (!selectedDrawLayerShapeItem) {
			return results
		}
		const rtreeResults: Array<TRtreeNodeItem> = Constant.rtree.search({ x: x, y: y, w: 0, h: 0 })
		for (let i: number = 0; i < rtreeResults.length; i++) {
			const rtreeItem: RtreeItem = rtreeResults[i].leaf
			const elementItem: D2ElementShapeItemBase = rtreeItem.target
			if (elementItem.isSelect(x, y) && elementItem.model.layerItemId === selectedDrawLayerShapeItem.layerItemId) {
				results.add(elementItem)
			}
		}
		return results
	}

	/**
	 * 获取框选图元集合
	 */
	public boxSelectBeforeFilter(bbox2: BBox2): Set<D2ElementShapeItemBase> {
		const selectedDrawLayerShapeItem: DrawLayerShape = DrawLayerShapeManager.getInstance().getFirstSelectedItem()
		const results: Set<D2ElementShapeItemBase> = new Set()
		if (!selectedDrawLayerShapeItem) {
			return results
		}
		const rtreeResults: Array<TRtreeNodeItem> = Constant.rtree.search({ x: bbox2.minX, y: bbox2.minY, w: bbox2.width, h: bbox2.height })
		for (let i: number = 0; i < rtreeResults.length; i++) {
			const rtreeItem: RtreeItem = rtreeResults[i].leaf
			const elementItem: D2ElementShapeItemBase = rtreeItem.target
			if (!elementItem.isSelectable) {
				continue
			}
			const elementItemBBox2: BBox2 = elementItem.model.bbox2
			if (elementItemBBox2.isBeWrappedByBBox2(bbox2) && elementItem.model.layerItemId === selectedDrawLayerShapeItem.layerItemId) {
				if (elementItem.model.isEnableSelect === false) {
					continue
				}
				results.add(elementItem)
			}
		}
		return results
	}

	public quit(): void {}
}
