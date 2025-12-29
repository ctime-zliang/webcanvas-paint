import { BaseManager } from '../../../../manager/BaseManage'
import { Color } from '../../../../engine/common/Color'
import { D2CircleModel } from '../../primitive2d/D2CircleModel'
import { ECanvas2DLineCap } from '../../../../engine/config/PrimitiveProfile'
import { Vector2 } from '../../../../engine/algorithm/geometry/vector/Vector2'

export class D2CircleModelManager extends BaseManager<D2CircleModel> {
	private static instance: D2CircleModelManager
	public static getInstance(): D2CircleModelManager {
		if (D2CircleModelManager.instance === undefined) {
			D2CircleModelManager.instance = new D2CircleModelManager()
		}
		return D2CircleModelManager.instance
	}

	constructor() {
		super()
	}

	public createModelItem(
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
	): D2CircleModel {
		const elementModelItem: D2CircleModel = new D2CircleModel(
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
		this.items.set(elementModelItem.elementItemId, elementModelItem)
		return elementModelItem
	}

	public deleteModelItem(elementItemId: string): void {
		const elementModelItem: D2CircleModel = this.items.get(elementItemId)!
		if (!elementModelItem) {
			return
		}
		this.items.delete(elementModelItem.elementItemId)
	}

	public quit(): void {
		super.quit()
		D2CircleModelManager.instance = undefined!
	}
}
