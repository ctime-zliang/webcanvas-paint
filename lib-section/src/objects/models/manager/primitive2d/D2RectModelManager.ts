import { BaseManager } from '../../../../manager/BaseManage'
import { Color } from '../../../../engine/common/Color'
import { D2RectModel } from '../../primitive2d/D2RectModel'
import { Vector2 } from '../../../../engine/algorithm/geometry/vector/Vector2'

export class D2RectModelManager extends BaseManager<D2RectModel> {
	private static instance: D2RectModelManager
	public static getInstance(): D2RectModelManager {
		if (D2RectModelManager.instance === undefined) {
			D2RectModelManager.instance = new D2RectModelManager()
		}
		return D2RectModelManager.instance
	}

	constructor() {
		super()
	}

	public createModelItem(
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
	): D2RectModel {
		const elementModelItem: D2RectModel = new D2RectModel(
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
		this.items.set(elementModelItem.elementItemId, elementModelItem)
		return elementModelItem
	}

	public deleteModelItem(elementItemId: string): void {
		const elementModelItem: D2RectModel = this.items.get(elementItemId)!
		if (!elementModelItem) {
			return
		}
		this.items.delete(elementModelItem.elementItemId)
	}

	public quit(): void {
		super.quit()
		D2RectModelManager.instance = undefined!
	}
}
