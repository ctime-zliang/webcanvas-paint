import { D2LineModelManager } from '../../../models/manager/primitive2d/D2LineModelManager'
import { BaseManager } from '../../../../manager/BaseManage'
import { Color } from '../../../../engine/common/Color'
import { RtreeItem } from '../../../../utils/RtreeItem'
import { D2LineModel } from '../../../models/primitive2d/D2LineModel'
import { D2LineShape } from '../../primitive2d/D2LineShape'
import { TRtreeNodeItem } from '../../../../algorithm/rtree2/Rtree'
import { ECanvas2DLineCap } from '../../../../engine/config/PrimitiveProfile'
import { Vector2 } from '../../../../engine/algorithm/geometry/vector/Vector2'
import { Constant } from '../../../../Constant'

export class D2LineShapeManager extends BaseManager<D2LineShape> {
	private static instance: D2LineShapeManager
	public static getInstance(): D2LineShapeManager {
		if (D2LineShapeManager.instance === undefined) {
			D2LineShapeManager.instance = new D2LineShapeManager()
		}
		return D2LineShapeManager.instance
	}

	private _rteeItems: Map<string, RtreeItem>
	constructor() {
		super()
		this._rteeItems = new Map()
	}

	public createShapeItem(
		elementItemId: string,
		layerItemId: string,
		startPoint: Vector2,
		endPoint: Vector2,
		strokeWidth: number = 1,
		strokeColor: Color = new Color(0, 0, 0, 1),
		alpha: number = 1.0,
		isSolid: boolean = true,
		lineCap: ECanvas2DLineCap = ECanvas2DLineCap.ROUND,
		isFixedStrokeWidth: boolean = false
	): D2LineShape {
		const elementModelItem: D2LineModel = D2LineModelManager.getInstance().createModelItem(
			elementItemId,
			layerItemId,
			startPoint,
			endPoint,
			strokeWidth,
			strokeColor,
			alpha,
			isSolid,
			lineCap,
			isFixedStrokeWidth
		)
		const elementShapeItem: D2LineShape = new D2LineShape(elementModelItem)
		const op: boolean = this.addCache(elementShapeItem)
		return elementShapeItem
	}

	public deleteShapeItem(elementItemId: string): void {
		const elementShapeItem: D2LineShape = this.items.get(elementItemId)!
		if (!elementShapeItem) {
			return
		}
		const op: boolean = this.deleteCache(elementItemId)
		if (op === false) {
			return
		}
		D2LineModelManager.getInstance().deleteModelItem(elementItemId)
		elementShapeItem.setDelete()
	}

	public quit(): void {
		super.quit()
		D2LineShapeManager.instance = undefined!
	}

	private addCache(elementShapeItem: D2LineShape): boolean {
		this.items.set(elementShapeItem.model.elementItemId, elementShapeItem)
		const rtreeItem: RtreeItem = new RtreeItem(elementShapeItem)
		this._rteeItems.set(elementShapeItem.model.elementItemId, rtreeItem)
		Constant.rtree.insertItemData(RtreeItem.getSimpleRectFromModelBbox2(elementShapeItem), rtreeItem)
		return true
	}

	private deleteCache(elementItemId: string): boolean {
		const targetShapeItem: D2LineShape = this.items.get(elementItemId)!
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
