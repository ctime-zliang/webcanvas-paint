import { EFrameCommand } from '../config/CommandEnum'
import { DrawLayerShapeManager } from '../objects/shapes/manager/DrawLayerShapeManager'
import { Helper } from '../utils/Helper'
import { TDrawLayerItemResult } from '../types/Common'
import { EOperationAction } from '../config/OperationProfile'
import { DrawLayerShape } from '../objects/shapes/DrawLayerShape'
import { ElementShapeItemBase } from '../objects/shapes/primitive2d/elementBase/ElementShapeItemBase'
import { BaseInterface } from './BaseInterface'
import { Constant } from '../Constant'
import { OutProfileMessage } from '../utils/OutMessage'

export class DrawLayerController extends BaseInterface {
	constructor() {
		super()
	}

	/**
	 * 获取所有绘制图层结果
	 */
	public getAllDrawLayerResults(): Array<TDrawLayerItemResult> {
		return Helper.getAllDrawLayerShapes().map((layerItem: DrawLayerShape): TDrawLayerItemResult => {
			return {
				layerItemId: layerItem.model.layerItemId,
				layerItemName: layerItem.model.layerItemName,
				layerItemStatus: layerItem.status,
				layerItemType: layerItem.model.layerItemType,
				layerItemOpacity: layerItem.model.layerItemOpacity,
			}
		})
	}

	/**
	 * 创建单个绘制图层
	 */
	public createDrawLayerShapeItem(layerItemName: string = 'untitled draw-layer'): string {
		const drawLayerShapeItem: DrawLayerShape = DrawLayerShapeManager.getInstance().createContentShapeItem(layerItemName)
		Constant.messageTool.messageBus.publish(EFrameCommand.RENDER_FRAME, null)
		OutProfileMessage.dispatchOperationProfileChangeMessage(EOperationAction.CREATED_DRAWLAYER, {
			targetItemId: drawLayerShapeItem.model.layerItemId,
		})
		return drawLayerShapeItem.model.layerItemId
	}

	/**
	 * 删除单个绘制图层
	 */
	public deleteDrawLayerShapeItem(layerItemId: string): void {
		DrawLayerShapeManager.getInstance().deleteContentShapeItem(layerItemId)
		Constant.messageTool.messageBus.publish(EFrameCommand.RENDER_FRAME, { elementPriority: true })
		OutProfileMessage.dispatchOperationProfileChangeMessage(EOperationAction.DELETED_DRAWLAYER, {
			targetItemId: layerItemId,
		})
	}

	/**
	 * 获取第一个被选中的绘制图层的图层 ID
	 */
	public getActiveDrawLayerShapeItemId(): string {
		return DrawLayerShapeManager.getInstance().getFirstSelectedItem().layerItemId
	}

	/**
	 * 设置指定图层 ID 对应的图层为选中状态
	 */
	public setActiveDrawLayerShapeItem(layerItemId: string): void {
		DrawLayerShapeManager.getInstance().setActiveItem(layerItemId)
		Constant.messageTool.messageBus.publish(EFrameCommand.RENDER_FRAME, null)
		OutProfileMessage.dispatchOperationProfileChangeMessage(EOperationAction.SWITCH_ACTIVE_DRAWLAYER, {
			targetItemId: layerItemId,
		})
	}

	/**
	 * 清除所有选中的绘制图层的选中状态
	 */
	public clearAllDrawLayersSelectedStatus(): void {
		DrawLayerShapeManager.getInstance().selectedLayersId = new Set([])
		OutProfileMessage.dispatchOperationProfileChangeMessage(EOperationAction.CLEAR_ALL_ACTIVE_DRAWLAYER, {})
	}

	/**
	 * 删除指定图层 ID 对应的绘制图层中的所有图元
	 */
	public deleteDrawLayerElements(layerItemId: string): void {
		const allElementShapes: Array<ElementShapeItemBase> = Helper.getAllElementShapes()
		for (let i: number = 0; i < allElementShapes.length; i++) {
			if (allElementShapes[i].model.layerItemId !== layerItemId) {
				continue
			}
			Helper.deleteElementShapeItem(allElementShapes[i])
			Constant.selectManager.clearSelectItemById(allElementShapes[i].elementItemId)
		}
		Constant.messageTool.messageBus.publish(EFrameCommand.RENDER_FRAME, null)
		OutProfileMessage.dispatchOperationProfileChangeMessage(EOperationAction.CLEAR_ALL_DRAWLAYER_ELEMENTS, {
			targetItemId: layerItemId,
		})
	}

	/**
	 * 删除所有绘制层图元和绘制层
	 */
	public deleteAllDrawLayers(): void {
		const allDrawLayers: Array<TDrawLayerItemResult> = Constant.drawLayerController.getAllDrawLayerResults()
		for (let i: number = 0; i < allDrawLayers.length; i++) {
			Constant.drawLayerController.deleteDrawLayerElements(allDrawLayers[i].layerItemId)
			Constant.drawLayerController.deleteDrawLayerShapeItem(allDrawLayers[i].layerItemId)
		}
	}

	public quit(): void {
		this.deleteAllDrawLayers()
	}
}
