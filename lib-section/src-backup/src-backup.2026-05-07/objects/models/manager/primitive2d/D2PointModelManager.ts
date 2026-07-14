import { BaseManager } from '../../../../manager/BaseManage'
import { Color } from '../../../../engine/common/Color'
import { ED2PointShape } from '../../../../engine/config/PrimitiveProfile'
import { D2PointModel, TBuildD2PointModelOptionalParam } from '../../primitive2d/D2PointModel'
import { Vector2 } from '../../../../engine/algorithm/geometry/vector/Vector2'

export class D2PointModelManager extends BaseManager<D2PointModel> {
	private static instance: D2PointModelManager
	public static getInstance(): D2PointModelManager {
		if (D2PointModelManager.instance === undefined) {
			D2PointModelManager.instance = new D2PointModelManager()
		}
		return D2PointModelManager.instance
	}

	constructor() {
		super()
	}

	public createModelItem(
		elementItemId: string,
		layerItemId: string,
		centerPoint: Vector2,
		optional: Partial<TBuildD2PointModelOptionalParam> = {}
	): D2PointModel {
		const locSetting: TBuildD2PointModelOptionalParam = {
			size: 1.0,
			shape: ED2PointShape.DOT,
			strokeColor: Color.RED,
			alpha: 1.0,
			isEnableScale: false,
			isEnableSelect: true,
			...optional,
		}
		const elementModelItem: D2PointModel = new D2PointModel(
			elementItemId,
			layerItemId,
			centerPoint,
			locSetting.size,
			locSetting.shape,
			locSetting.strokeColor,
			locSetting.alpha,
			locSetting.isEnableScale,
			locSetting.isEnableSelect
		)
		this.items.set(elementModelItem.elementItemId, elementModelItem)
		return elementModelItem
	}

	public deleteModelItem(elementItemId: string): void {
		const elementModelItem: D2PointModel = this.items.get(elementItemId)!
		if (!elementModelItem) {
			return
		}
		this.items.delete(elementModelItem.elementItemId)
	}

	public quit(): void {
		super.quit()
		D2PointModelManager.instance = undefined!
	}
}
