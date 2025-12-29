import { BaseManager } from '../../../../manager/BaseManage'
import { Color } from '../../../../engine/common/Color'
import { RtreeItem } from '../../../../utils/RtreeItem'
import { TRtreeNodeItem } from '../../../../algorithm/rtree2/Rtree'
import { D2RectShape } from '../../primitive2d/D2RectShape'
import { D2RectModelManager } from '../../../models/manager/primitive2d/D2RectModelManager'
import { D2RectModel } from '../../../models/primitive2d/D2RectModel'
import { Vector2 } from '../../../../engine/algorithm/geometry/vector/Vector2'
import { Constant } from '../../../../Constant'

export class D2RectShapeManager extends BaseManager<D2RectShape> {
	private static instance: D2RectShapeManager
	public static getInstance(): D2RectShapeManager {
		if (D2RectShapeManager.instance === undefined) {
			D2RectShapeManager.instance = new D2RectShapeManager()
		}
		return D2RectShapeManager.instance
	}

	private _rteeItems: Map<string, RtreeItem>
	constructor() {
		super()
		this._rteeItems = new Map()
	}

	public createShapeItem(
		elementItemId: string,
		layerItemId: string,
		position: Vector2,
		width: number,
		height: number,
		strokeWidth: number = 1,
		strokeColor: Color = new Color(0, 0, 0, 1),
		isFill: boolean = false,
		fillColor: Color = new Color(0, 0, 0, 1),
		alpha: number = 1.0,
		isSolid: boolean = true,
		borderRadius: number = 0,
		isFixedStrokeWidth: boolean = false
	): D2RectShape {
		const elementModelItem: D2RectModel = D2RectModelManager.getInstance().createModelItem(
			elementItemId,
			layerItemId,
			position,
			width,
			height,
			strokeWidth,
			strokeColor,
			isFill,
			fillColor,
			alpha,
			isSolid,
			borderRadius,
			isFixedStrokeWidth
		)
		const elementShapeItem: D2RectShape = new D2RectShape(elementModelItem)
		const op: boolean = this.addCache(elementShapeItem)
		return elementShapeItem
	}

	public deleteShapeItem(elementItemId: string): void {
		const elementShapeItem: D2RectShape = this.items.get(elementItemId)!
		if (!elementShapeItem) {
			return
		}
		const op: boolean = this.deleteCache(elementItemId)
		if (op === false) {
			return
		}
		D2RectModelManager.getInstance().deleteModelItem(elementItemId)
		elementShapeItem.setDelete()
	}

	public quit(): void {
		super.quit()
		D2RectShapeManager.instance = undefined!
	}

	private addCache(elementShapeItem: D2RectShape): boolean {
		this.items.set(elementShapeItem.model.elementItemId, elementShapeItem)
		const rtreeItem: RtreeItem = new RtreeItem(elementShapeItem)
		this._rteeItems.set(elementShapeItem.model.elementItemId, rtreeItem)
		Constant.rtree.insertItemData(RtreeItem.getSimpleRectFromModelBbox2(elementShapeItem), rtreeItem)
		return true
	}

	private deleteCache(elementItemId: string): boolean {
		const targetShapeItem: D2RectShape = this.items.get(elementItemId)!
		if (!targetShapeItem) {
			return false
		}
		const rtreeItem: RtreeItem = this._rteeItems.get(elementItemId)!
		const deleteResults: Array<TRtreeNodeItem> = Constant.rtree.remove(RtreeItem.getSimpleRectFromModelBbox2(targetShapeItem), rtreeItem)
		if (!deleteResults.length) {
			return false
		}
		this.items.delete(elementItemId)
		this._rteeItems.delete(elementItemId)
		return true
	}
}
