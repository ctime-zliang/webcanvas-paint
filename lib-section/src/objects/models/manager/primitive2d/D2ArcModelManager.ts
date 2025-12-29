import { BaseManager } from '../../../../manager/BaseManage'
import { Color } from '../../../../engine/common/Color'
import { D2ArcModel } from '../../primitive2d/D2ArcModel'
import { ESweep } from '../../../../engine/config/CommonProfile'
import { ECanvas2DLineCap } from '../../../../engine/config/PrimitiveProfile'
import { Vector2 } from '../../../../engine/algorithm/geometry/vector/Vector2'

export class D2ArcModelManager extends BaseManager<D2ArcModel> {
	private static instance: D2ArcModelManager
	public static getInstance(): D2ArcModelManager {
		if (D2ArcModelManager.instance === undefined) {
			D2ArcModelManager.instance = new D2ArcModelManager()
		}
		return D2ArcModelManager.instance
	}

	constructor() {
		super()
	}

	public createModelItem(
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
	): D2ArcModel {
		const elementModelItem: D2ArcModel = new D2ArcModel(
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
		this.items.set(elementModelItem.elementItemId, elementModelItem)
		return elementModelItem
	}

	public deleteModelItem(elementItemId: string): void {
		const elementModelItem: D2ArcModel = this.items.get(elementItemId)!
		if (!elementModelItem) {
			return
		}
		this.items.delete(elementModelItem.elementItemId)
	}

	public quit(): void {
		super.quit()
		D2ArcModelManager.instance = undefined!
	}
}
