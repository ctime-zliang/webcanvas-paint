import { BaseManager } from '../../../../manager/BaseManage'
import { createBuildD2ArcModelOptionalParam, D2ArcModel, TBuildD2ArcModelOptionalParam } from '../../primitive2d/D2ArcModel'
import { ESweep } from '../../../../engine/config/CommonProfile'
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
		startRadian: number,
		endRadian: number,
		sweep: ESweep,
		optional: Partial<TBuildD2ArcModelOptionalParam> = {}
	): D2ArcModel {
		const locSetting: TBuildD2ArcModelOptionalParam = createBuildD2ArcModelOptionalParam(optional)
		const elementModelItem: D2ArcModel = new D2ArcModel(
			elementItemId,
			layerItemId,
			centerPoint,
			radius,
			startRadian,
			endRadian,
			sweep,
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
