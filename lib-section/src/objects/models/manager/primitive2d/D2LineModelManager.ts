import { BaseManager } from '../../../../manager/BaseManage'
import { Color } from '../../../../engine/common/Color'
import { D2LineModel } from '../../primitive2d/D2LineModel'
import { ECanvas2DLineCap } from '../../../../engine/config/PrimitiveProfile'
import { Vector2 } from '../../../../engine/algorithm/geometry/vector/Vector2'

export class D2LineModelManager extends BaseManager<D2LineModel> {
	private static instance: D2LineModelManager
	public static getInstance(): D2LineModelManager {
		if (D2LineModelManager.instance === undefined) {
			D2LineModelManager.instance = new D2LineModelManager()
		}
		return D2LineModelManager.instance
	}

	constructor() {
		super()
	}

	public createModelItem(
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
	): D2LineModel {
		const elementModelItem: D2LineModel = new D2LineModel(
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
		this.items.set(elementModelItem.elementItemId, elementModelItem)
		return elementModelItem
	}

	public deleteModelItem(elementItemId: string): void {
		const elementModelItem: D2LineModel = this.items.get(elementItemId)!
		if (!elementModelItem) {
			return
		}
		this.items.delete(elementModelItem.elementItemId)
	}

	public quit(): void {
		super.quit()
		D2LineModelManager.instance = undefined!
	}
}
