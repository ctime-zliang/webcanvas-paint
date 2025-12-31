import { BaseManager } from '../../../../manager/BaseManage'
import { Color } from '../../../../engine/common/Color'
import { RtreeItem } from '../../../../utils/RtreeItem'
import { TRtreeNodeItem } from '../../../../algorithm/rtree2/Rtree'
import { D2TextModelManager } from '../../../models/manager/primitive2d/D2TextModelManager'
import { D2TextModel } from '../../../models/primitive2d/D2TextModel'
import { D2TextShape } from '../../primitive2d/D2TextShape'
import { ED2FontStyle } from '../../../../engine/config/PrimitiveProfile'
import { BBox2 } from '../../../../engine/algorithm/geometry/bbox/BBox2'
import { TRectSurrounded } from '../../../../engine/types/Primitive'
import { TFontTriangleVertexData } from '../../../../manager/TextGraphicsManager'
import { EFrameCommand } from '../../../../config/CommandEnum'
import { Vector2 } from '../../../../engine/algorithm/geometry/vector/Vector2'
import { Constant } from '../../../../Constant'
import { TD2TextVertexData } from '../../../../types/Element'

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
		fontFamily: string = 'auto',
		fontStyle: ED2FontStyle = ED2FontStyle.NORMAL,
		fontSize: number = 10,
		fontWeight: number = 100,
		strokeColor: Color = Color.WHITE,
		alpha: number = 1.0,
		bgColor: Color | null = null!,
		paddingSurrounded: TRectSurrounded = { top: 1, right: 1, bottom: 1, left: 1 },
		rotation: number = 0,
		isFlipX: boolean = false,
		isFlipY: boolean = false
	): D2TextShape {
		const elementModelItem: D2TextModel = D2TextModelManager.getInstance().createModelItem(
			elementItemId,
			layerItemId,
			position,
			content,
			fontFamily,
			fontStyle,
			fontSize,
			fontWeight,
			strokeColor,
			alpha,
			bgColor,
			paddingSurrounded,
			rotation,
			isFlipX,
			isFlipY
		)
		elementModelItem.hasMeta = true
		const elementShapeItem: D2TextShape = new D2TextShape(elementModelItem)
		const op: boolean = this.addCache(elementShapeItem)
		this.refreshGraphicsPostions(elementModelItem)
		return elementShapeItem
	}

	public createShapeItemByVertexData(
		elementItemId: string,
		layerItemId: string,
		textVertexData: TD2TextVertexData,
		position: Vector2,
		strokeColor: Color = Color.WHITE,
		alpha: number = 1.0,
		bgColor: Color | null = null!,
		paddingSurrounded: TRectSurrounded = { top: 1, right: 1, bottom: 1, left: 1 },
		rotation: number = 0,
		isFlipX: boolean = false,
		isFlipY: boolean = false
	): D2TextShape {
		const elementModelItem: D2TextModel = D2TextModelManager.getInstance().createModelItem(
			elementItemId,
			layerItemId,
			position,
			textVertexData.content,
			textVertexData.fontFamily,
			textVertexData.fontStyle,
			textVertexData.fontSize,
			textVertexData.fontWeight,
			strokeColor,
			alpha,
			bgColor,
			paddingSurrounded,
			rotation,
			isFlipX,
			isFlipY
		)
		elementModelItem.hasMeta = false
		const elementShapeItem: D2TextShape = new D2TextShape(elementModelItem)
		const op: boolean = this.addCache(elementShapeItem)
		elementShapeItem.flushVertexDataArray(textVertexData.vertexDataArray)
		elementShapeItem.updateBBox2(textVertexData.bbox2)
		elementShapeItem.setContentReadyStatus(true)
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

	public refreshGraphicsPostions(elementModelItem: D2TextModel): void {
		Constant.textFontService.addVectorizeTextTask(
			elementModelItem.elementItemId,
			elementModelItem.content,
			elementModelItem.fontSize,
			elementModelItem.position.toArray(),
			{
				fontFamily: elementModelItem.fontFamily,
				fontWeight: elementModelItem.fontWeight,
				fontStyle: elementModelItem.fontStyle,
			},
			(textStrId: string, bbox2: BBox2, vertexDataArray: Array<Array<TFontTriangleVertexData>>): void => {
				const elementShapeItem: D2TextShape = this.items.get(textStrId)!
				if (!elementShapeItem) {
					return
				}
				elementShapeItem.flushVertexDataArray(vertexDataArray)
				elementShapeItem.updateBBox2(bbox2)
				elementShapeItem.setContentReadyStatus(true)
				elementShapeItem.updateRender()
				if (elementShapeItem.isContentReady()) {
					const rtreeItem: RtreeItem = new RtreeItem(elementShapeItem)
					this._rteeItems.set(elementShapeItem.model.elementItemId, rtreeItem)
					Constant.rtree.insertItemData(RtreeItem.getSimpleRectFromModelBbox2(elementShapeItem), rtreeItem)
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
