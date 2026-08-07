import { BaseManager } from '../../../../manager/BaseManage'
import { createBuildD2RectModelOptionalParam, D2RectModel, TBuildD2RectModelOptionalParam } from '../../primitive2d/D2RectModel'
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

	public createModelItem(elementItemId: string, layerItemId: string, position: Vector2, width: number, height: number, optional: Partial<TBuildD2RectModelOptionalParam> = {}): D2RectModel {
		const locSetting: TBuildD2RectModelOptionalParam = createBuildD2RectModelOptionalParam(optional)
		const elementModelItem: D2RectModel = new D2RectModel(
			elementItemId,
			layerItemId,
			position,
			width,
			height,
			locSetting.strokeWidth,
			locSetting.strokeColor,
			locSetting.isFill,
			locSetting.fillColor,
			locSetting.alpha,
			locSetting.isSolid,
			locSetting.borderRadius,
			locSetting.isFixedStrokeWidth,
			locSetting.rotation,
			locSetting.isFlipX,
			locSetting.isFlipY,
			locSetting.isEnableSelect
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
