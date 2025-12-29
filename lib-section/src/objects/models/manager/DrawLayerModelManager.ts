import { EDrawLayerCode } from '../../../config/DrawLayerProfile'
import { Constant } from '../../../Constant'
import { EPlaneType } from '../../../engine/config/PlaneProfile'
import { BaseManager } from '../../../manager/BaseManage'
import { DrawLayerBaseItemModel } from '../DrawLayerBaseItemModel'
import { DrawLayerModel } from '../DrawLayerModel'

export class DrawLayerModelManager extends BaseManager<DrawLayerBaseItemModel> {
	private static instance: DrawLayerModelManager
	public static getInstance(): DrawLayerModelManager {
		if (DrawLayerModelManager.instance === undefined) {
			DrawLayerModelManager.instance = new DrawLayerModelManager()
		}
		return DrawLayerModelManager.instance
	}

	constructor() {
		super()
	}

	public createControlItem(layerItemName: string): DrawLayerModel {
		const newLayerModelItem: DrawLayerModel = new DrawLayerModel(EDrawLayerCode.MaskLayer, layerItemName, EPlaneType.ControlPlane)
		this.items.set(newLayerModelItem.layerItemId, newLayerModelItem)
		return newLayerModelItem
	}

	public createContentItem(layerItemName: string): DrawLayerModel {
		const newLayerModelItem: DrawLayerModel = new DrawLayerModel(
			Constant.globalIdenManager.getDrawLayerIden(),
			layerItemName,
			EPlaneType.ContentPlane
		)
		this.items.set(newLayerModelItem.layerItemId, newLayerModelItem)
		return newLayerModelItem
	}

	public quit(): void {
		super.quit()
		DrawLayerModelManager.instance = undefined!
	}
}
