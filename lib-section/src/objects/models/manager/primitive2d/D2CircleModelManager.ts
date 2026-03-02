import { BaseManager } from '../../../../manager/BaseManage'
import { createBuildD2CircleModelOptionalParam, D2CircleModel, TBuildD2CircleModelOptionalParam } from '../../primitive2d/D2CircleModel'
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
		optional: Partial<TBuildD2CircleModelOptionalParam> = {}
	): D2CircleModel {
		const locSetting: TBuildD2CircleModelOptionalParam = createBuildD2CircleModelOptionalParam(optional)
		const elementModelItem: D2CircleModel = new D2CircleModel(
			elementItemId,
			layerItemId,
			centerPoint,
			locSetting.radius,
			locSetting.strokeWidth,
			locSetting.strokeColor,
			locSetting.isFill,
			locSetting.fillColor,
			locSetting.alpha,
			locSetting.isSolid,
			locSetting.lineCap,
			locSetting.isFixedStrokeWidth,
			locSetting.isEnableSelect
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
