import { BaseManager } from '../../../../manager/BaseManage'
import { D2CircleModelManager } from '../../../models/manager/primitive2d/D2CircleModelManager'
import { Color } from '../../../../engine/common/Color'
import { RtreeItem } from '../../../../utils/RtreeItem'
import { D2CircleModel } from '../../../models/primitive2d/D2CircleModel'
import { D2CircleShape } from '../../primitive2d/D2CircleShape'
import { TRtreeNodeItem } from '../../../../algorithm/rtree2/Rtree'
import { ECanvas2DLineCap } from '../../../../engine/config/PrimitiveProfile'
import { Vector2 } from '../../../../engine/algorithm/geometry/vector/Vector2'
import { Constant } from '../../../../Constant'

export class D2CircleShapeManager extends BaseManager<D2CircleShape> {
	private static instance: D2CircleShapeManager
	public static getInstance(): D2CircleShapeManager {
		if (D2CircleShapeManager.instance === undefined) {
			D2CircleShapeManager.instance = new D2CircleShapeManager()
		}
		return D2CircleShapeManager.instance
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
		radius: number,
		strokeWidth: number = 1,
		strokeColor: Color = new Color(0, 0, 0, 1),
		isFill: boolean = false,
		fillColor: Color = Color.createByAlpha(0),
		alpha: number = 1.0,
		isSolid: boolean = true,
		lineCap: ECanvas2DLineCap = ECanvas2DLineCap.ROUND,
		isFixedStrokeWidth: boolean = false
	): D2CircleShape {
		const elementModelItem: D2CircleModel = D2CircleModelManager.getInstance().createModelItem(
			elementItemId,
			layerItemId,
			centerPoint,
			radius,
			strokeWidth,
			strokeColor,
			isFill,
			fillColor,
			alpha,
			isSolid,
			lineCap,
			isFixedStrokeWidth
		)
		const elementShapeItem: D2CircleShape = new D2CircleShape(elementModelItem)
		const op: boolean = this.addCache(elementShapeItem)
		return elementShapeItem
	}

	public deleteShapeItem(elementItemId: string): void {
		const elementShapeItem: D2CircleShape = this.items.get(elementItemId)!
		if (!elementShapeItem) {
			return
		}
		const op: boolean = this.deleteCache(elementItemId)
		if (op === false) {
			return
		}
		D2CircleModelManager.getInstance().deleteModelItem(elementItemId)
		elementShapeItem.setDelete()
	}

	public quit(): void {
		super.quit()
		D2CircleShapeManager.instance = undefined!
	}

	private addCache(elementShapeItem: D2CircleShape): boolean {
		this.items.set(elementShapeItem.model.elementItemId, elementShapeItem)
		const rtreeItem: RtreeItem = new RtreeItem(elementShapeItem)
		this._rteeItems.set(elementShapeItem.model.elementItemId, rtreeItem)
		Constant.rtree.insertItemData(RtreeItem.getSimpleRectFromModelBbox2(elementShapeItem), rtreeItem)
		return true
	}

	private deleteCache(elementItemId: string): boolean {
		const targetShapeItem: D2CircleShape = this.items.get(elementItemId)!
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
