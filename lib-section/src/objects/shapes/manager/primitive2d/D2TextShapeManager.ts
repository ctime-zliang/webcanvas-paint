import { BaseManager } from '../../../../manager/BaseManage'
import { RtreeItem } from '../../../../utils/RtreeItem'
import { TRtreeNodeItem } from '../../../../algorithm/rtree2/Rtree'
import { D2TextModelManager } from '../../../models/manager/primitive2d/D2TextModelManager'
import { D2TextModel, TBuildD2TextModelOptionalParam } from '../../../models/primitive2d/D2TextModel'
import { D2TextShape } from '../../primitive2d/D2TextShape'
import { EFrameCommand } from '../../../../config/CommandEnum'
import { Vector2 } from '../../../../engine/algorithm/geometry/vector/Vector2'
import { Constant } from '../../../../Constant'
import { TD2TextVertexData, TElement2DTextJSONViewData } from '../../../../types/Element'

export class D2TextShapeManager extends BaseManager<D2TextShape> {
	private static instance: D2TextShapeManager
	public static getInstance(): D2TextShapeManager {
		if (D2TextShapeManager.instance === undefined) {
			D2TextShapeManager.instance = new D2TextShapeManager()
		}
		return D2TextShapeManager.instance
	}

	private _rteeItems: Map<string, RtreeItem>
	constructor() {
		super()
		this._rteeItems = new Map()
	}

	public createShapeItem(
		elementItemId: string,
		layerItemId: string,
		position: Vector2,
		content: string,
		optional: Partial<TBuildD2TextModelOptionalParam> = {},
		callback?: (jsonData: TElement2DTextJSONViewData) => void
	): D2TextShape {
		const elementModelItem: D2TextModel = D2TextModelManager.getInstance().createModelItem(elementItemId, layerItemId, position, content, optional)
		const elementShapeItem: D2TextShape = new D2TextShape(elementModelItem)
		const op: boolean = this.addCache(elementShapeItem)
		this.refreshGraphicsPostions(elementModelItem, callback)
		return elementShapeItem
	}

	public createShapeItemByVertexData(elementItemId: string, layerItemId: string, position: Vector2, textVertexData: TD2TextVertexData, optional: Partial<TBuildD2TextModelOptionalParam> = {}): D2TextShape {
		const elementModelItem: D2TextModel = D2TextModelManager.getInstance().createModelItem(elementItemId, layerItemId, position, textVertexData.content, { ...optional, ...textVertexData })
		const elementShapeItem: D2TextShape = new D2TextShape(elementModelItem)
		const op: boolean = this.addCache(elementShapeItem)
		elementShapeItem.setContentReadyStatus(true)
		elementShapeItem.flushVertexDataMixins(textVertexData.vertexDataArray, textVertexData.width, textVertexData.height)
		elementShapeItem.updateCacheTransform()
		elementShapeItem.updateRender()
		if (elementShapeItem.isContentReady()) {
			const rtreeItem: RtreeItem = new RtreeItem(elementShapeItem)
			this._rteeItems.set(elementShapeItem.model.elementItemId, rtreeItem)
			Constant.rtree.insertItemData(RtreeItem.getSimpleRectFromModelBbox2(elementShapeItem), rtreeItem)
		}
		Constant.messageTool.messageBus.publish(EFrameCommand.RENDER_FRAME, null)
		return elementShapeItem
	}

	public deleteShapeItem(elementItemId: string): void {
		const elementShapeItem: D2TextShape = this.items.get(elementItemId)!
		if (!elementShapeItem) {
			return
		}
		const op: boolean = this.deleteCache(elementItemId)
		if (op === false) {
			return
		}
		D2TextModelManager.getInstance().deleteModelItem(elementItemId)
		elementShapeItem.setDelete()
	}

	private addCache(elementShapeItem: D2TextShape): boolean {
		this.items.set(elementShapeItem.model.elementItemId, elementShapeItem)
		return true
	}

	private deleteCache(elementItemId: string): boolean {
		const targetShapeItem: D2TextShape = this.items.get(elementItemId)!
		if (!targetShapeItem) {
			return false
		}
		const rtreeItem: RtreeItem = this._rteeItems.get(elementItemId)!
		if (targetShapeItem.isContentReady()) {
			const deleteResults: Array<TRtreeNodeItem> = Constant.rtree.remove(RtreeItem.getSimpleRectFromModelBbox2(targetShapeItem), rtreeItem)
			if (!deleteResults.length) {
				return false
			}
		}
		this.items.delete(elementItemId)
		this._rteeItems.delete(elementItemId)
		return true
	}

	public refreshGraphicsPostions(elementModelItem: D2TextModel, callback?: (jsonData: TElement2DTextJSONViewData) => void): void {
		Constant.textFontService.addVectorizeTextTask(
			elementModelItem.elementItemId,
			elementModelItem.content,
			{
				fontSize: elementModelItem.fontSize,
				lineHeight: elementModelItem.styleSetting.lineHeight,
			},
			{
				fontFamily: elementModelItem.fontFamily,
				fontWeight: elementModelItem.fontWeight,
				fontStyle: elementModelItem.fontStyle,
			},
			({ textStrId, width, height, initBbox2, vertexDataArray }): void => {
				const elementShapeItem: D2TextShape = this.items.get(textStrId)!
				if (!elementShapeItem || elementShapeItem.killed) {
					return
				}
				elementShapeItem.setContentReadyStatus(true)
				elementShapeItem.flushVertexDataMixins(vertexDataArray, width, height)
				elementShapeItem.updateCacheTransform()
				elementShapeItem.updateRender()
				if (elementShapeItem.isContentReady()) {
					const rtreeItem: RtreeItem = new RtreeItem(elementShapeItem)
					this._rteeItems.set(elementShapeItem.model.elementItemId, rtreeItem)
					Constant.rtree.insertItemData(RtreeItem.getSimpleRectFromModelBbox2(elementShapeItem), rtreeItem)
					callback && callback(elementShapeItem.toJSON())
				}
				Constant.messageTool.messageBus.publish(EFrameCommand.RENDER_FRAME, null)
			}
		)
	}

	public quit(): void {
		super.quit()
		D2TextShapeManager.instance = undefined!
	}
}
