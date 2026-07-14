import { EFrameCommand } from '../config/CommandEnum'
import { EOperationAction } from '../config/OperationProfile'
import { Color } from '../engine/common/Color'
import { ED2FontStyle } from '../engine/config/PrimitiveProfile'
import { D2TextShapeManager } from '../objects/shapes/manager/primitive2d/D2TextShapeManager'
import { D2TextShape } from '../objects/shapes/primitive2d/D2TextShape'
import {
	D2TextModel,
	TBuildD2TextModelOptionalStyleSettingParam,
	TBuildD2TextModelOptionalParam,
	createD2TextModelStyleDefaultSetting,
	DEFAULT_FONT_SIZE,
} from '../objects/models/primitive2d/D2TextModel'
import { getHashIden } from '../engine/utils/Utils'
import { Helper } from '../utils/Helper'
import { TextLayout } from '../algorithm/geometry/TextLayout'
import { Vector2 } from '../engine/algorithm/geometry/vector/Vector2'
import { BaseInterface } from './BaseInterface'
import { Constant } from '../Constant'
import { OutProfileMessage } from '../utils/OutMessage'
import { TD2TextVertexData, TElement2DTextJSONViewData } from '../types/Element'

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
		optional: Partial<TBuildD2TextModelOptionalParam> & Partial<{ styleSetting: Partial<TBuildD2TextModelOptionalStyleSettingParam> }> = {},
		callback?: (jsonData: TElement2DTextJSONViewData) => void
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
			optional,
			callback
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
		optional: Partial<{
			strokeColor: Color
			alpha: number
			styleSetting: Partial<TBuildD2TextModelOptionalStyleSettingParam>
		}> = {}
	): string {
		const checkResult: { code: number; title: string } = Helper.checkDrawLayer(layerItemId)
		if (checkResult.code !== 0) {
			console.error(`error: target layer does not exist or has been deleted.`)
			return null!
		}
		const { bbox2: bbox22, vertexDataArray: vertexDataArray2 } = TextLayout.translateVertexData(textVertexData.vertexDataArray)
		const elementItemId: string = Constant.globalIdenManager.getElementIden()
		const targetShapeItem: D2TextShape = D2TextShapeManager.getInstance().createShapeItemByVertexData(
			elementItemId,
			layerItemId,
			position,
			{ ...textVertexData, initBbox2: bbox22, vertexDataArray: vertexDataArray2 },
			optional
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
		optional: Partial<{
			fontFamily: string
			fontStyle: ED2FontStyle
			fontSize: number
			fontWeight: number
			lineHeight: number
			rotation: number
			isFlipX: boolean
			isFlipY: boolean
		}>
	): Promise<TD2TextVertexData> {
		const fontSize: number = optional.fontSize || DEFAULT_FONT_SIZE
		const styleSetting: TBuildD2TextModelOptionalStyleSettingParam = createD2TextModelStyleDefaultSetting(fontSize)
		const locSetting: {
			fontFamily: string
			fontStyle: ED2FontStyle
			fontSize: number
			fontWeight: number
			lineHeight: number
			rotation: number
			isFlipX: boolean
			isFlipY: boolean
		} = {
			fontFamily: 'auto',
			fontStyle: ED2FontStyle.NORMAL,
			fontSize,
			fontWeight: 100,
			lineHeight: styleSetting.lineHeight,
			rotation: 0,
			isFlipX: false,
			isFlipY: false,
			...optional,
		}
		return new Promise((_): void => {
			const hashIden: string = getHashIden()
			Constant.textFontService.addVectorizeTextTask(
				hashIden,
				content,
				{
					fontSize: locSetting.fontSize,
					lineHeight: locSetting.lineHeight,
				},
				{
					fontFamily: locSetting.fontFamily,
					fontWeight: locSetting.fontWeight,
					fontStyle: locSetting.fontStyle,
				},
				({ width, height, initBbox2, vertexDataArray }): void => {
					_({
						content,
						fontSize: locSetting.fontSize,
						fontFamily: locSetting.fontFamily,
						fontWeight: locSetting.fontWeight,
						fontStyle: locSetting.fontStyle,
						width,
						height,
						initBbox2,
						vertexDataArray,
					})
				}
			)
		})
	}

	/**
	 * 设置文本图元字符串内容
	 */
	public updateD2TextElementItemContent(
		elementItemId: string,
		elementItemContent: string,
		callback?: (jsonData: TElement2DTextJSONViewData) => void
	): void {
		let targetElement: D2TextShape = null!
		targetElement = D2TextShapeManager.getInstance().getItemById(elementItemId)
		if (!targetElement) {
			return
		}
		targetElement.updateContent(elementItemContent)
		D2TextShapeManager.getInstance().refreshGraphicsPostions(targetElement.model as D2TextModel, callback)
		OutProfileMessage.dispatchOperationProfileChangeMessage(EOperationAction.MODIFY_ELEMENT, {})
	}

	public quit(): void {}
}
