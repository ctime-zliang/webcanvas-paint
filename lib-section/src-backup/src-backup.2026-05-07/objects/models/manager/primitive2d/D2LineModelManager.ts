import { BaseManager } from '../../../../manager/BaseManage'
import { createBuildD2LineModelOptionalParam, D2LineModel, TBuildD2LineModelOptionalParam } from '../../primitive2d/D2LineModel'
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

	public createModelItem(elementItemId: string, layerItemId: string, startPoint: Vector2, endPoint: Vector2, optional: Partial<TBuildD2LineModelOptionalParam> = {}): D2LineModel {
		const locSetting: TBuildD2LineModelOptionalParam = createBuildD2LineModelOptionalParam(optional)
		const elementModelItem: D2LineModel = new D2LineModel(
			elementItemId,
			layerItemId,
			startPoint,
			endPoint,
			locSetting.strokeWidth,
			locSetting.strokeColor,
			locSetting.alpha,
			locSetting.isSolid,
			locSetting.lineCap,
			locSetting.rectBorderRadius,
			locSetting.isFixedStrokeWidth,
			locSetting.isEnableSelect
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
