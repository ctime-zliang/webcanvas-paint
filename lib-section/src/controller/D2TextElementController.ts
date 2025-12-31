import { EFrameCommand } from '../config/CommandEnum'
import { EOperationAction } from '../config/OperationProfile'
import { Color } from '../engine/common/Color'
import { ED2FontStyle } from '../engine/config/PrimitiveProfile'
import { D2TextShapeManager } from '../objects/shapes/manager/primitive2d/D2TextShapeManager'
import { D2TextShape } from '../objects/shapes/primitive2d/D2TextShape'
import { D2TextModel } from '../objects/models/primitive2d/D2TextModel'
import { TRectSurrounded } from '../engine/types/Primitive'
import { getHashIden } from '../engine/utils/Utils'
import { BBox2 } from '../engine/algorithm/geometry/bbox/BBox2'
import { TFontTriangleVertexData } from '../manager/TextGraphicsManager'
import { Helper } from '../utils/Helper'
import { TextLayout } from '../algorithm/geometry/TextLayout'
import { Vector2 } from '../engine/algorithm/geometry/vector/Vector2'
import { BaseInterface } from './BaseInterface'
import { Constant } from '../Constant'
import { OutProfileMessage } from '../utils/OutMessage'
import { TD2TextVertexData } from '../types/Element'

export class D2TextElementController extends BaseInterface {
	constructor() {
		super()
	}

	/**
	 * 创建 D2-Text-Shape
	 */
	public createD2TextElementItem(
		layerItemId: string,
		position: Vector2,
		content: string,
		fontFamily: string = 'auto',
		fontStyle: ED2FontStyle = ED2FontStyle.NORMAL,
		fontSize: number = 10,
		fontWeight: number = 100,
		strokeColor: Color = Color.WHITE,
		alpha: number = 1.0,
		bgColor: Color = null!,
		paddingSurrounded: TRectSurrounded = { top: 1, right: 1, bottom: 1, left: 1 },
		rotation: number = 0,
		isFlipX: boolean = false,
		isFlipY: boolean = false
	): string {
		const checkResult: { code: number; title: string } = Helper.checkDrawLayer(layerItemId)
		if (checkResult.code !== 0) {
			console.error(`error: target layer does not exist or has been deleted.`)
			return null!
		}
		const elementItemId: string = Constant.globalIdenManager.getElementIden()
		const targetShapeItem: D2TextShape = D2TextShapeManager.getInstance().createShapeItem(
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
		Constant.messageTool.messageBus.publish(EFrameCommand.RENDER_FRAME, null)
		OutProfileMessage.dispatchOperationProfileChangeMessage(EOperationAction.CREATE_ELEMENT, {})
		return targetShapeItem.model.elementItemId
	}

	/**
	 * 创建 D2-Text-Shape
	 */
	public createD2TextElementItemByVertexData(
		layerItemId: string,
		textVertexData: TD2TextVertexData,
		position: Vector2,
		strokeColor: Color = Color.WHITE,
		alpha: number = 1.0,
		bgColor: Color | null = null!,
		paddingSurrounded: TRectSurrounded = { top: 1, right: 1, bottom: 1, left: 1 }
	): string {
		const checkResult: { code: number; title: string } = Helper.checkDrawLayer(layerItemId)
		if (checkResult.code !== 0) {
			console.error(`error: target layer does not exist or has been deleted.`)
			return null!
		}
		const { bbox2: bbox22, vertexDataArray: vertexDataArray2 } = TextLayout.translateVertexData(position, textVertexData.vertexDataArray)
		const elementItemId: string = Constant.globalIdenManager.getElementIden()
		const targetShapeItem: D2TextShape = D2TextShapeManager.getInstance().createShapeItemByVertexData(
			elementItemId,
			layerItemId,
			{ ...textVertexData, bbox2: bbox22, vertexDataArray: vertexDataArray2 },
			position,
			strokeColor,
			alpha,
			bgColor,
			paddingSurrounded
		)
		Constant.messageTool.messageBus.publish(EFrameCommand.RENDER_FRAME, null)
		OutProfileMessage.dispatchOperationProfileChangeMessage(EOperationAction.CREATE_ELEMENT, {})
		return targetShapeItem.model.elementItemId
	}

	/**
	 * 创建 D2-Text 顶点数据
	 */
	public async createD2TextVertexDataItem(
		content: string,
		fontFamily: string = 'auto',
		fontStyle: ED2FontStyle = ED2FontStyle.NORMAL,
		fontSize: number = 10,
		fontWeight: number = 100
	): Promise<TD2TextVertexData> {
		return new Promise((resolve, reject): void => {
			const hashIden: string = getHashIden()
			Constant.textFontService.addVectorizeTextTask(
				hashIden,
				content,
				fontSize,
				[0, 0],
				{
					fontFamily,
					fontWeight,
					fontStyle,
				},
				(textStrId: string, bbox2: BBox2, vertexDataArray: Array<Array<TFontTriangleVertexData>>): void => {
					resolve({
						content,
						fontSize,
						fontFamily,
						fontWeight,
						fontStyle,
						bbox2,
						vertexDataArray,
					})
				}
			)
		})
	}

	/**
	 * 设置文本图元字符串内容
	 */
	public setElementItemContent(elementItemId: string, elementItemContent: string): void {
		let targetElement: D2TextShape = null!
		targetElement = D2TextShapeManager.getInstance().getItemById(elementItemId)
		if (!targetElement) {
			return
		}
		if (!(targetElement.model as D2TextModel).hasMeta) {
			throw new Error(`primitives created directly from vertex data are prohibited from accessing metadata.`)
		}
		targetElement.content = elementItemContent
		D2TextShapeManager.getInstance().refreshGraphicsPostions(targetElement.model as D2TextModel)
		OutProfileMessage.dispatchOperationProfileChangeMessage(EOperationAction.MODIFY_ELEMENT, {})
	}

	public quit(): void {}
}
