import { EFrameCommand } from '../config/CommandEnum'
import { D2LineShapeManager } from '../objects/shapes/manager/primitive2d/D2LineShapeManager'
import { Helper } from '../utils/Helper'
import { D2CircleShapeManager } from '../objects/shapes/manager/primitive2d/D2CircleShapeManager'
import { TElement2DTextJSONViewData, TElementJSONData, TElementShapeType, TFillElementShapeType } from '../types/Element'
import { EOperationAction } from '../config/OperationProfile'
import { Color } from '../engine/common/Color'
import { ElementShapeItemBase } from '../objects/shapes/primitive2d/elementBase/ElementShapeItemBase'
import { D2CircleShape } from '../objects/shapes/primitive2d/D2CircleShape'
import { D2LineShape } from '../objects/shapes/primitive2d/D2LineShape'
import { EPointerEventName, EventsManager, TPointEventHandler } from '../manager/EventsManager'
import { D2ArcShapeManager } from '../objects/shapes/manager/primitive2d/D2ArcShapeManager'
import { D2ArcShape } from '../objects/shapes/primitive2d/D2ArcShape'
import { ESweep } from '../engine/config/CommonProfile'
import { ED2ElementType, ED2ElementUpdateAttr } from '../config/D2ElementProfile'
import { ECanvas2DLineCap, ED2PointShape } from '../engine/config/PrimitiveProfile'
import { D2TextShape } from '../objects/shapes/primitive2d/D2TextShape'
import { D2ImageShapeManager } from '../objects/shapes/manager/primitive2d/D2ImageShapeManager'
import { D2ImageShape } from '../objects/shapes/primitive2d/D2ImageShape'
import { D2PointShape } from '../objects/shapes/primitive2d/D2PointShape'
import { D2PointShapeManager } from '../objects/shapes/manager/primitive2d/D2PointShapeManager'
import { D2RectShapeManager } from '../objects/shapes/manager/primitive2d/D2RectShapeManager'
import { D2RectShape } from '../objects/shapes/primitive2d/D2RectShape'
import { Vector2 } from '../engine/algorithm/geometry/vector/Vector2'
import { BaseInterface } from './BaseInterface'
import { Constant } from '../Constant'
import { OutProfileMessage } from '../utils/OutMessage'

export class D2ElementController extends BaseInterface {
	constructor() {
		super()
	}

	/**
	 * 获取画布内所有图元结果
	 */
	public getAllD2ElementShapeResults(): Array<TElementJSONData> {
		return Helper.getAllElementShapes().map((elementItem: ElementShapeItemBase): TElementJSONData => {
			return elementItem.toJSON()
		})
	}

	/**
	 * 获取画布内所有被选中的图元结果
	 */
	public getAllSelectedD2ElementShapeResults(): Array<TElementJSONData> {
		return Constant.selectManager.getAllSelectItems().map((elementItem: ElementShapeItemBase): TElementJSONData => {
			return elementItem.toJSON()
		})
	}

	/**
	 * 创建 D2-Line-Shape
	 */
	public createD2LineElementShapeItem(
		layerItemId: string,
		startPoint: Vector2,
		endPoint: Vector2,
		strokeWidth: number = 1,
		strokeColor: Color = new Color(0, 0, 0, 1),
		alpha: number = 1.0,
		isSolid: boolean = true,
		lineCap: ECanvas2DLineCap = ECanvas2DLineCap.ROUND,
		isFixedStrokeWidth: boolean = false
	): string {
		const checkResult: { code: number; title: string } = Helper.checkDrawLayer(layerItemId)
		if (checkResult.code !== 0) {
			console.error(`error: target layer does not exist or has been deleted.`)
			return null!
		}
		const elementItemId: string = Constant.globalIdenManager.getElementIden()
		const targetShapeItem: D2LineShape = D2LineShapeManager.getInstance().createShapeItem(
			elementItemId,
			layerItemId,
			startPoint,
			endPoint,
			strokeWidth,
			strokeColor,
			alpha,
			isSolid,
			lineCap,
			isFixedStrokeWidth
		)
		Constant.messageTool.messageBus.publish(EFrameCommand.RENDER_FRAME, null)
		OutProfileMessage.dispatchOperationProfileChangeMessage(EOperationAction.CREATE_ELEMENT, {})
		return targetShapeItem.model.elementItemId
	}

	/**
	 * 创建 D2-Circle-Shape
	 */
	public createD2CircleElementShapeItem(
		layerItemId: string,
		centerPoint: Vector2,
		radius: number,
		strokeWidth: number,
		strokeColor: Color = new Color(1, 0, 0, 1),
		isFill: boolean = false,
		fillColor: Color = new Color(0, 0, 0, 0),
		alpha: number = 1.0,
		isSolid: boolean = true,
		lineCap: ECanvas2DLineCap = ECanvas2DLineCap.ROUND,
		isFixedStrokeWidth: boolean = false
	): string {
		const checkResult: { code: number; title: string } = Helper.checkDrawLayer(layerItemId)
		if (checkResult.code !== 0) {
			console.error(`error: target layer does not exist or has been deleted.`)
			return null!
		}
		const elementItemId: string = Constant.globalIdenManager.getElementIden()
		const targetShapeItem: D2CircleShape = D2CircleShapeManager.getInstance().createShapeItem(
			elementItemId,
			layerItemId,
			centerPoint,
			radius,
			strokeWidth,
			strokeColor,
			isFill,
			fillColor,
			alpha,
			isSolid,
			lineCap,
			isFixedStrokeWidth
		)
		Constant.messageTool.messageBus.publish(EFrameCommand.RENDER_FRAME, null)
		OutProfileMessage.dispatchOperationProfileChangeMessage(EOperationAction.CREATE_ELEMENT, {})
		return targetShapeItem.model.elementItemId
	}

	/**
	 * 创建 D2-Point-Shape
	 */
	public createD2PointElementShapeItem(
		layerItemId: string,
		centerPoint: Vector2,
		size: number,
		shape: ED2PointShape = ED2PointShape.DOT,
		strokeColor: Color = new Color(1, 0, 0, 1),
		alpha: number = 1.0,
		isEnableScale: boolean = false,
		isEnableSelect: boolean = false
	): string {
		const checkResult: { code: number; title: string } = Helper.checkDrawLayer(layerItemId)
		if (checkResult.code !== 0) {
			console.error(`error: target layer does not exist or has been deleted.`)
			return null!
		}
		const elementItemId: string = Constant.globalIdenManager.getElementIden()
		const targetShapeItem: D2PointShape = D2PointShapeManager.getInstance().createShapeItem(
			elementItemId,
			layerItemId,
			centerPoint,
			size,
			shape,
			strokeColor,
			alpha,
			isEnableScale,
			isEnableSelect
		)
		Constant.messageTool.messageBus.publish(EFrameCommand.RENDER_FRAME, null)
		OutProfileMessage.dispatchOperationProfileChangeMessage(EOperationAction.CREATE_ELEMENT, {})
		return targetShapeItem.model.elementItemId
	}

	/**
	 * 创建 D2-Arc-Shape
	 */
	public createD2ArcElementShapeItem(
		layerItemId: string,
		centerPoint: Vector2,
		radius: number,
		startAngle: number,
		endAngle: number,
		sweep: ESweep,
		strokeWidth: number = 1,
		strokeColor: Color = new Color(0, 0, 0, 1),
		isFill: boolean = false,
		fillColor: Color = Color.createByAlpha(0),
		alpha: number = 1.0,
		isSolid: boolean = true,
		lineCap: ECanvas2DLineCap = ECanvas2DLineCap.ROUND,
		isFixedStrokeWidth: boolean = false
	): string {
		const checkResult: { code: number; title: string } = Helper.checkDrawLayer(layerItemId)
		if (checkResult.code !== 0) {
			console.error(`error: target layer does not exist or has been deleted.`)
			return null!
		}
		const elementItemId: string = Constant.globalIdenManager.getElementIden()
		const targetShapeItem: D2ArcShape = D2ArcShapeManager.getInstance().createShapeItem(
			elementItemId,
			layerItemId,
			centerPoint,
			radius,
			startAngle,
			endAngle,
			sweep,
			strokeWidth,
			strokeColor,
			isFill,
			fillColor,
			alpha,
			isSolid,
			lineCap,
			isFixedStrokeWidth
		)
		Constant.messageTool.messageBus.publish(EFrameCommand.RENDER_FRAME, null)
		OutProfileMessage.dispatchOperationProfileChangeMessage(EOperationAction.CREATE_ELEMENT, {})
		return targetShapeItem.model.elementItemId
	}

	/**
	 * 创建 D2-Image-Shape
	 */
	public createD2ImageElementItem(
		layerItemId: string,
		position: Vector2,
		fileHashUuid: string,
		imageDataURL: string,
		width: number,
		height: number,
		strokeWidth: number = 0,
		strokeColor: Color = new Color(0, 0, 0, 1),
		alpha: number = 1.0
	): string {
		const checkResult: { code: number; title: string } = Helper.checkDrawLayer(layerItemId)
		if (checkResult.code !== 0) {
			console.error(`error: target layer does not exist or has been deleted.`)
			return null!
		}
		const elementItemId: string = Constant.globalIdenManager.getElementIden()
		const targetShapeItem: D2ImageShape = D2ImageShapeManager.getInstance().createShapeItem(
			elementItemId,
			layerItemId,
			position,
			fileHashUuid,
			imageDataURL,
			width,
			height,
			strokeWidth,
			strokeColor,
			alpha
		)
		Constant.messageTool.messageBus.publish(EFrameCommand.RENDER_FRAME, null)
		OutProfileMessage.dispatchOperationProfileChangeMessage(EOperationAction.CREATE_ELEMENT, {})
		return targetShapeItem.model.elementItemId
	}

	/**
	 * 创建 D2-Rect-Shape
	 */
	public createD2RectElementShapeItem(
		layerItemId: string,
		position: Vector2,
		width: number,
		height: number,
		strokeWidth: number = 1,
		strokeColor: Color = new Color(0, 0, 0, 1),
		isFill: boolean = false,
		fillColor: Color = new Color(0, 0, 0, 1),
		alpha: number = 1.0,
		isSolid: boolean = true,
		borderRadius: number = 0,
		isFixedStrokeWidth: boolean = false
	): string {
		const checkResult: { code: number; title: string } = Helper.checkDrawLayer(layerItemId)
		if (checkResult.code !== 0) {
			console.error(`error: target layer does not exist or has been deleted.`)
			return null!
		}
		const elementItemId: string = Constant.globalIdenManager.getElementIden()
		const targetShapeItem: D2RectShape = D2RectShapeManager.getInstance().createShapeItem(
			elementItemId,
			layerItemId,
			position,
			width,
			height,
			strokeWidth,
			strokeColor,
			isFill,
			fillColor,
			alpha,
			isSolid,
			borderRadius,
			isFixedStrokeWidth
		)
		Constant.messageTool.messageBus.publish(EFrameCommand.RENDER_FRAME, null)
		OutProfileMessage.dispatchOperationProfileChangeMessage(EOperationAction.CREATE_ELEMENT, {})
		return targetShapeItem.model.elementItemId
	}

	/**
	 * 获取图元 JSON 数据
	 */
	public getD2ElementShapeItemJSONData(elementItemId: string, markShapeType?: ED2ElementType): TElementJSONData {
		let targetElement: TElementShapeType = null!
		if (!markShapeType) {
			targetElement = Helper.getAllElementShapes().filter((elementItem: TElementShapeType): boolean => {
				return elementItem.model.elementItemId === elementItemId
			})[0]
		} else {
			targetElement = Helper.getMarkedElementShapeItem(elementItemId, markShapeType)
		}
		if (!targetElement) {
			return null!
		}
		if (targetElement instanceof D2TextShape) {
			const jsonData: TElement2DTextJSONViewData = targetElement.toJSON()
			if (!jsonData.hasMeta) {
				return {
					...jsonData,
					content: undefined!,
					fontFamily: undefined!,
					fontSize: undefined!,
					fontStyle: undefined!,
					fontWeight: undefined!,
					vertexData: undefined!,
				}
			}
			return {
				...jsonData,
				vertexData: undefined!,
			}
		}
		return targetElement.toJSON()
	}

	/**
	 * 设置图元状态 - 显示/非显示
	 */
	public setD2ElementShapeItemVisible(elementItemId: string, visible: boolean, markShapeType?: ED2ElementType): void {
		let targetElement: TElementShapeType = null!
		if (!markShapeType) {
			targetElement = Helper.getAllElementShapes().filter((elementItem: TElementShapeType): boolean => {
				return elementItem.model.elementItemId === elementItemId
			})[0]
		} else {
			targetElement = Helper.getMarkedElementShapeItem(elementItemId, markShapeType)
		}
		if (!targetElement) {
			return
		}
		if (visible) {
			targetElement.setVisible()
		} else {
			targetElement.setUnVisible()
		}
		Constant.messageTool.messageBus.publish(EFrameCommand.RENDER_FRAME, null)
		OutProfileMessage.dispatchOperationProfileChangeMessage(EOperationAction.MODIFY_ELEMENT, {})
	}

	/**
	 * 设置图元状态 - 高亮/非高亮
	 */
	public setD2ElementShapeItemHightlight(elementItemId: string, hightlight: boolean, markShapeType?: ED2ElementType): void {
		let targetElement: TElementShapeType = null!
		if (!markShapeType) {
			targetElement = Helper.getAllElementShapes().filter((elementItem: TElementShapeType): boolean => {
				return elementItem.model.elementItemId === elementItemId
			})[0]
		} else {
			targetElement = Helper.getMarkedElementShapeItem(elementItemId, markShapeType)
		}
		if (!targetElement) {
			return
		}
		if (hightlight) {
			targetElement.setHightlight()
		} else {
			targetElement.setUnHightlight()
		}
		Constant.messageTool.messageBus.publish(EFrameCommand.RENDER_FRAME, null)
		OutProfileMessage.dispatchOperationProfileChangeMessage(EOperationAction.MODIFY_ELEMENT, {})
	}

	/**
	 * 更新图元属性
	 */
	public updateD2ElementShapeItemByJSONData(
		elementItemId: string,
		jsonData: Partial<{ [key in ED2ElementUpdateAttr]: any }>,
		markShapeType?: ED2ElementType
	): void {
		let targetElement: TElementShapeType = null!
		if (!markShapeType) {
			targetElement = Helper.getAllElementShapes().filter((elementItem: TElementShapeType): boolean => {
				return elementItem.model.elementItemId === elementItemId
			})[0]
		} else {
			targetElement = Helper.getMarkedElementShapeItem(elementItemId, markShapeType)
		}
		if (!targetElement) {
			return
		}
		const allKeys: Array<string> = Object.keys(jsonData)
		for (let i: number = 0; i < allKeys.length; i++) {
			const key: string = allKeys[i]
			if (typeof (targetElement as any)[key] === 'undefined') {
				continue
			}
			switch (key) {
				case ED2ElementUpdateAttr.IS_FILP_X: {
					;(targetElement as D2ImageShape).isFlipX = jsonData[key]
					break
				}
				case ED2ElementUpdateAttr.IS_FILP_Y: {
					;(targetElement as D2ImageShape).isFlipY = jsonData[key]
					break
				}
				case ED2ElementUpdateAttr.ROTATION: {
					;(targetElement as D2ImageShape).rotation = jsonData[key]
					break
				}
				case ED2ElementUpdateAttr.STROKE_COLOR: {
					;(targetElement as TElementShapeType).strokeColor = jsonData[key]
					break
				}
				case ED2ElementUpdateAttr.FILL_COLOR: {
					if (jsonData[key] === undefined || jsonData[key] === null) {
						;(targetElement as TFillElementShapeType).fillColor = Color.createByAlpha(0)
						;(targetElement as TFillElementShapeType).isFill = false
					} else {
						;(targetElement as TFillElementShapeType).fillColor = jsonData[key]
						;(targetElement as TFillElementShapeType).isFill = true
					}
					break
				}
				case ED2ElementUpdateAttr.LINE_CAP: {
					;(targetElement as any).lineCap = jsonData[key]
					break
				}
				case ED2ElementUpdateAttr.IS_SOLID: {
					;(targetElement as any).isSolid = jsonData[key]
					break
				}
				case ED2ElementUpdateAttr.ELEMENT_ITEM_NAME: {
					;(targetElement as TElementShapeType).elementItemName = jsonData[key]
					break
				}
				default: {
					console.warn('unkown shape prop: ', key)
				}
			}
		}
		Constant.messageTool.messageBus.publish(EFrameCommand.RENDER_FRAME, null)
		OutProfileMessage.dispatchOperationProfileChangeMessage(EOperationAction.MODIFY_ELEMENT, {})
	}

	/**
	 * 删除图元
	 */
	public deleteD2ElementShapeItemById(elementItemId: string, markShapeType?: ED2ElementType): void {
		let targetElement: TElementShapeType = null!
		if (!markShapeType) {
			targetElement = Helper.getAllElementShapes().filter((elementItem: TElementShapeType): boolean => {
				return elementItem.model.elementItemId === elementItemId
			})[0]
		} else {
			targetElement = Helper.getMarkedElementShapeItem(elementItemId, markShapeType)
		}
		if (!targetElement) {
			return
		}
		if (!markShapeType) {
			Helper.deleteElementShapeItem(targetElement)
		} else {
			Helper.deleteMarkedElementShapeItem(targetElement.elementItemId, markShapeType)
		}
		Constant.selectManager.clearSelectItemById(targetElement.elementItemId)
		Constant.messageTool.messageBus.publish(EFrameCommand.RENDER_FRAME, null)
		OutProfileMessage.dispatchOperationProfileChangeMessage(EOperationAction.DELETE_ELEMENT, {})
	}

	/**
	 * 为图元增加事件
	 */
	public bindD2ElementShapeItemEvent(elementItemId: string, eventName: EPointerEventName, callback: TPointEventHandler): string {
		const targetElement: TElementShapeType = Helper.getElementShapeItemById(elementItemId)
		if (!targetElement) {
			return null!
		}
		const eventHandlerId: string = EventsManager.getInstance().appendEventItem(elementItemId, eventName, callback)
		return eventHandlerId
	}

	/**
	 * 为图元移除指定事件
	 */
	public removeD2ElementShapeItemEvent(elementItemId: string, eventName: EPointerEventName, eventHandlerId: string): void {
		EventsManager.getInstance().removeEventItem(elementItemId, eventName, eventHandlerId)
	}

	/**
	 * 为图元清空所有事件
	 */
	public clearD2ElementShapeItemAllEvents(elementItemId: string): void {
		EventsManager.getInstance().removeAllEvents(elementItemId)
	}

	public quit(): void {}
}
