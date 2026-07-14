import { DrawLayerView } from '../views/shapes/DrawLayerView'
import { Scene } from '../../engine/common/Scene'
import { EPlaneStatus } from '../../engine/config/PlaneProfile'
import { TPlaneJSONData } from '../../engine/types/Plane'
import { DrawLayerShapeItemBase } from '../../objects/shapes/DrawLayerShapeItemBase'
import { BaseManager } from '../../manager/BaseManage'

export class DrawLayerViewManager extends BaseManager<DrawLayerView> {
	private static instance: DrawLayerViewManager
	public static getInstance(): DrawLayerViewManager {
		if (DrawLayerViewManager.instance === undefined) {
			DrawLayerViewManager.instance = new DrawLayerViewManager()
		}
		return DrawLayerViewManager.instance
	}

	constructor() {
		super()
	}

	public handleRefreshView(scene: Scene): void {
		for (let [key, item] of this.items) {
			item.notify(scene)
		}
	}

	public handleModify(scene: Scene, drawLayers: Set<DrawLayerShapeItemBase>): void {
		for (let drawLayer of drawLayers) {
			if (drawLayer.killed) {
				this.deleteItem(drawLayer.model.layerItemId)
				continue
			}
			const drawLayerItemType: number = drawLayer.getType()
			const drawLayerStatus: EPlaneStatus = drawLayer.getStatus()
			const drawLayerItemData: TPlaneJSONData = drawLayer.toJSON()
			this.modifyItem(scene, drawLayer.model.layerItemId, drawLayerItemType, drawLayerStatus, drawLayerItemData)
		}
	}

	public modifyItem(
		scene: Scene,
		drawLayerItemId: string,
		drawLayerItemType: number,
		drawLayerStatus: EPlaneStatus,
		drawLayerItemData: TPlaneJSONData
	): void {
		const drawLayerItem: DrawLayerView = this.items.get(drawLayerItemId) as DrawLayerView
		if (!drawLayerItem) {
			const drawLayerViewItem: DrawLayerView = new DrawLayerView(
				scene,
				drawLayerItemId,
				drawLayerItemType,
				drawLayerItemData.layerItemName,
				drawLayerItemData.layerItemOpacity,
				drawLayerItemData.groupId
			)
			this.items.set(drawLayerViewItem.layerItemId, drawLayerViewItem)
			return
		}
		drawLayerItem.modify(drawLayerItemData)
	}

	public deleteItem(drawLayerItemId: string): void {
		const drawLayerViewItem: DrawLayerView = this.items.get(drawLayerItemId)!
		if (!drawLayerViewItem) {
			return
		}
		drawLayerViewItem.delete()
		this.items.delete(drawLayerItemId)
	}

	public quit(): void {
		super.quit()
		DrawLayerViewManager.instance = undefined!
	}
}
