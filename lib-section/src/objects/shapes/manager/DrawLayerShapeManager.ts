import { EDrawLayerCode } from '../../../config/DrawLayerProfile'
import { EDrawD2ToolCommand, EFrameCommand } from '../../../config/CommandEnum'
import { Helper } from '../../../utils/Helper'
import { BaseManager } from '../../../manager/BaseManage'
import { DrawLayerModelManager } from '../../models/manager/DrawLayerModelManager'
import { DrawLayerShape } from '../DrawLayerShape'
import { DrawLayerModel } from '../../models/DrawLayerModel'
import { ElementShapeItemBase } from '../primitive2d/elementBase/ElementShapeItemBase'
import { Constant } from '../../../Constant'

export class DrawLayerShapeManager extends BaseManager<DrawLayerShape> {
	private static instance: DrawLayerShapeManager
	public static getInstance(): DrawLayerShapeManager {
		if (DrawLayerShapeManager.instance === undefined) {
			DrawLayerShapeManager.instance = new DrawLayerShapeManager()
		}
		return DrawLayerShapeManager.instance
	}

	private _selectedLayersId: Set<string>
	constructor() {
		super()
	}

	public get selectedLayersId(): Set<string> {
		return this._selectedLayersId
	}
	public set selectedLayersId(value: Set<string>) {
		this._selectedLayersId = value
	}

	public createControlShapeItem(layerItemName: string): DrawLayerShape {
		const layerModelItem: DrawLayerModel = DrawLayerModelManager.getInstance().createControlItem(layerItemName) as DrawLayerModel
		const drawLayerShapeItem: DrawLayerShape = new DrawLayerShape(layerModelItem)
		this.addCache(drawLayerShapeItem)
		Constant.messageTool.messageBus.publish(EFrameCommand.SWITCH_DRAW_TOOL, { type: EDrawD2ToolCommand.BLANK_DROP })
		return drawLayerShapeItem
	}

	public createContentShapeItem(layerItemName: string): DrawLayerShape {
		const layerModelItem: DrawLayerModel = DrawLayerModelManager.getInstance().createContentItem(layerItemName) as DrawLayerModel
		const drawLayerShapeItem: DrawLayerShape = new DrawLayerShape(layerModelItem)
		this.addCache(drawLayerShapeItem)
		this.selectedLayersId = new Set([drawLayerShapeItem.model.layerItemId])
		Constant.messageTool.messageBus.publish(EFrameCommand.SWITCH_DRAW_TOOL, { type: EDrawD2ToolCommand.BLANK_DROP })
		return drawLayerShapeItem
	}

	public deleteContentShapeItem(layerItemId: string): void {
		const drawLayerShapeItem: DrawLayerShape = this.items.get(layerItemId)!
		if (!drawLayerShapeItem) {
			return
		}
		const allElementShapes: Array<ElementShapeItemBase> = Helper.getAllElementShapes()
		for (let i: number = 0; i < allElementShapes.length; i++) {
			if (allElementShapes[i].model.layerItemId !== layerItemId) {
				continue
			}
			Helper.deleteElementShapeItem(allElementShapes[i])
		}
		drawLayerShapeItem.setDelete()
		this.deleteCache(layerItemId)
	}

	public getAllContentShapeItems(): Array<DrawLayerShape> {
		const allItems: Map<string, DrawLayerShape> = this.items
		const results: Array<DrawLayerShape> = []
		allItems.forEach((item: DrawLayerShape): void => {
			if ([String(EDrawLayerCode.MaskLayer)].indexOf(item.layerItemId) <= -1) {
				results.push(item)
			}
		})
		return results
	}

	public getContentShapeItem(layerItemId: string): DrawLayerShape {
		const allItems: Map<string, DrawLayerShape> = this.items
		let targetItem: DrawLayerShape = null!
		allItems.forEach((item: DrawLayerShape): void => {
			if (item.layerItemId === layerItemId) {
				targetItem = item
			}
		})
		return targetItem
	}

	public getFirstSelectedItem(): DrawLayerShape {
		return this.items.get(Array.from(this.selectedLayersId)[0] as string) as DrawLayerShape
	}

	public setActiveItem(layerItemId: string): void {
		if (!this.items.has(layerItemId)) {
			return
		}
		this.selectedLayersId = new Set([layerItemId])
		Constant.messageTool.messageBus.publish(EFrameCommand.SWITCH_DRAW_TOOL, { type: EDrawD2ToolCommand.BLANK_DROP })
	}

	public quit(): void {
		super.quit()
		DrawLayerShapeManager.instance = undefined!
	}

	private addCache(drawLayerShapeItem: DrawLayerShape): void {
		this.items.set(drawLayerShapeItem.model.layerItemId, drawLayerShapeItem)
	}

	private deleteCache(drawLayerShapeId: string): void {
		this.items.delete(drawLayerShapeId)
		if (this.selectedLayersId.has(drawLayerShapeId)) {
			this.selectedLayersId.delete(drawLayerShapeId)
		}
	}
}
