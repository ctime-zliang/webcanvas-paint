import { BaseManager } from '../../../../manager/BaseManage'
import { Color } from '../../../../engine/common/Color'
import { RtreeItem } from '../../../../utils/RtreeItem'
import { D2ArcShape } from '../../primitive2d/D2ArcShape'
import { D2ArcModel } from '../../../models/primitive2d/D2ArcModel'
import { D2ArcModelManager } from '../../../models/manager/primitive2d/D2ArcModelManager'
import { ESweep } from '../../../../engine/config/CommonProfile'
import { TRtreeNodeItem } from '../../../../algorithm/rtree2/Rtree'
import { ECanvas2DLineCap } from '../../../../engine/config/PrimitiveProfile'
import { Vector2 } from '../../../../engine/algorithm/geometry/vector/Vector2'
import { Constant } from '../../../../Constant'

export class D2ArcShapeManager extends BaseManager<D2ArcShape> {
	private static instance: D2ArcShapeManager
	public static getInstance(): D2ArcShapeManager {
		if (D2ArcShapeManager.instance === undefined) {
			D2ArcShapeManager.instance = new D2ArcShapeManager()
		}
		return D2ArcShapeManager.instance
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
		startAngle: number,
		endAngle: number,
		sweep: ESweep,
		strokeWidth: number = 1,
		strokeColor: Color = new Color(0, 0, 0, 1),
		isFill: boolean = false,
		fillColor: Color = Color.createByAlpha(0),
		alpha: number = 1.0,
		isSolid: boolean = true,
		lineCap: ECanvas2DLineCap = ECanvas2DLineCap.ROUND,
		isFixedStrokeWidth: boolean = false
	): D2ArcShape {
		const elementModelItem: D2ArcModel = D2ArcModelManager.getInstance().createModelItem(
			elementItemId,
			layerItemId,
			centerPoint,
			radius,
			startAngle,
			endAngle,
			sweep,
			strokeWidth,
			strokeColor,
			isFill,
			fillColor,
			alpha,
			isSolid,
			lineCap,
			isFixedStrokeWidth
		)
		const elementShapeItem: D2ArcShape = new D2ArcShape(elementModelItem)
		const op: boolean = this.addCache(elementShapeItem)
		return elementShapeItem
	}

	public deleteShapeItem(elementItemId: string): void {
		const elementShapeItem: D2ArcShape = this.items.get(elementItemId)!
		if (!elementShapeItem) {
			return
		}
		const op: boolean = this.deleteCache(elementItemId)
		if (op === false) {
			return
		}
		D2ArcModelManager.getInstance().deleteModelItem(elementItemId)
		elementShapeItem.setDelete()
	}

	public quit(): void {
		super.quit()
		D2ArcShapeManager.instance = undefined!
	}

	private addCache(elementShapeItem: D2ArcShape): boolean {
		this.items.set(elementShapeItem.model.elementItemId, elementShapeItem)
		const rtreeItem: RtreeItem = new RtreeItem(elementShapeItem)
		this._rteeItems.set(elementShapeItem.model.elementItemId, rtreeItem)
		Constant.rtree.insertItemData(RtreeItem.getSimpleRectFromModelBbox2(elementShapeItem), rtreeItem)
		return true
	}

	private deleteCache(elementItemId: string): boolean {
		const targetShapeItem: D2ArcShape = this.items.get(elementItemId)!
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
