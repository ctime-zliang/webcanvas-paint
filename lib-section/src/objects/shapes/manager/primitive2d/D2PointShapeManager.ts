import { BaseManager } from '../../../../manager/BaseManage'
import { Color } from '../../../../engine/common/Color'
import { RtreeItem } from '../../../../utils/RtreeItem'
import { TRtreeNodeItem } from '../../../../algorithm/rtree2/Rtree'
import { ED2PointShape } from '../../../../engine/config/PrimitiveProfile'
import { D2PointModelManager } from '../../../models/manager/primitive2d/D2PointModelManager'
import { D2PointModel } from '../../../models/primitive2d/D2PointModel'
import { D2PointShape } from '../../primitive2d/D2PointShape'
import { Vector2 } from '../../../../engine/algorithm/geometry/vector/Vector2'
import { Constant } from '../../../../Constant'

export class D2PointShapeManager extends BaseManager<D2PointShape> {
	private static instance: D2PointShapeManager
	public static getInstance(): D2PointShapeManager {
		if (D2PointShapeManager.instance === undefined) {
			D2PointShapeManager.instance = new D2PointShapeManager()
		}
		return D2PointShapeManager.instance
	}

	private _rteeItems: Map<string, RtreeItem>
	constructor() {
		super()
		this._rteeItems = new Map()
	}

	public createShapeItem(
		elementItemId: string,
		layerItemId: string,
		centerPoint: Vector2,
		size: number = 1,
		shape: ED2PointShape = ED2PointShape.DOT,
		strokeColor: Color = Color.RED,
		alpha: number = 1.0,
		isEnableScale: boolean = false,
		isEnableSelect: boolean = false
	): D2PointShape {
		const elementModelItem: D2PointModel = D2PointModelManager.getInstance().createModelItem(
			elementItemId,
			layerItemId,
			centerPoint,
			size,
			shape,
			strokeColor,
			alpha,
			isEnableScale,
			isEnableSelect
		)
		const elementShapeItem: D2PointShape = new D2PointShape(elementModelItem)
		const op: boolean = this.addCache(elementShapeItem)
		return elementShapeItem
	}

	public deleteShapeItem(elementItemId: string): void {
		const elementShapeItem: D2PointShape = this.items.get(elementItemId)!
		if (!elementShapeItem) {
			return
		}
		const op: boolean = this.deleteCache(elementItemId)
		if (op === false) {
			return
		}
		D2PointModelManager.getInstance().deleteModelItem(elementItemId)
		elementShapeItem.setDelete()
	}

	public quit(): void {
		super.quit()
		D2PointShapeManager.instance = undefined!
	}

	private addCache(elementShapeItem: D2PointShape): boolean {
		this.items.set(elementShapeItem.model.elementItemId, elementShapeItem)
		const rtreeItem: RtreeItem = new RtreeItem(elementShapeItem)
		this._rteeItems.set(elementShapeItem.model.elementItemId, rtreeItem)
		Constant.rtree.insertItemData(RtreeItem.getSimpleRectFromModelBbox2(elementShapeItem), rtreeItem)
		return true
	}

	private deleteCache(elementItemId: string): boolean {
		const targetShapeItem: D2PointShape = this.items.get(elementItemId)!
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
