import { BaseManager } from '../../../../manager/BaseManage'
import { D2ImageModel } from '../../primitive2d/D2ImageModel'
import { Color } from '../../../../engine/common/Color'
import { Vector2 } from '../../../../engine/algorithm/geometry/vector/Vector2'

export class D2ImageModelManager extends BaseManager<D2ImageModel> {
	private static instance: D2ImageModelManager
	public static getInstance(): D2ImageModelManager {
		if (D2ImageModelManager.instance === undefined) {
			D2ImageModelManager.instance = new D2ImageModelManager()
		}
		return D2ImageModelManager.instance
	}

	constructor() {
		super()
	}

	public createModelItem(
		elementItemId: string,
		layerItemId: string,
		fileHashUuid: string,
		imageDataURL: string,
		position: Vector2,
		width: number,
		height: number,
		strokeWidth: number = 0,
		strokeColor: Color = new Color(0, 0, 0, 1),
		alpha: number = 1.0,
		rotation: number = 0,
		isFlipX: boolean = false,
		isFlipY: boolean = false
	): D2ImageModel {
		const elementModelItem: D2ImageModel = new D2ImageModel(
			elementItemId,
			layerItemId,
			fileHashUuid,
			imageDataURL,
			position,
			width,
			height,
			strokeWidth,
			strokeColor,
			alpha,
			rotation,
			isFlipX,
			isFlipY
		)
		this.items.set(elementModelItem.elementItemId, elementModelItem)
		return elementModelItem
	}

	public deleteModelItem(elementItemId: string): void {
		const elementModelItem: D2ImageModel = this.items.get(elementItemId)!
		if (!elementModelItem) {
			return
		}
		this.items.delete(elementModelItem.elementItemId)
	}

	public quit(): void {
		super.quit()
		D2ImageModelManager.instance = undefined!
	}
}
