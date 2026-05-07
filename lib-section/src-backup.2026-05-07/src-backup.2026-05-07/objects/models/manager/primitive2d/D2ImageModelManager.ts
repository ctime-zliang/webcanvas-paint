import { BaseManager } from '../../../../manager/BaseManage'
import { createBuildD2ImageModelOptionalParam, D2ImageModel, TBuildD2ImageModelOptionalParam } from '../../primitive2d/D2ImageModel'
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
		optional: Partial<TBuildD2ImageModelOptionalParam> = {}
	): D2ImageModel {
		const locSetting: TBuildD2ImageModelOptionalParam = createBuildD2ImageModelOptionalParam(optional)
		const elementModelItem: D2ImageModel = new D2ImageModel(
			elementItemId,
			layerItemId,
			fileHashUuid,
			imageDataURL,
			position,
			width,
			height,
			locSetting.isShowStroke,
			locSetting.strokeWidth,
			locSetting.strokeColor,
			locSetting.alpha,
			locSetting.rotation,
			locSetting.isFlipX,
			locSetting.isFlipY,
			locSetting.isEnableSelect
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
