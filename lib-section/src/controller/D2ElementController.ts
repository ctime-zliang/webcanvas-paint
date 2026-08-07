import { EFrameCommand } from '../config/CommandEnum'
import { D2LineShapeManager } from '../objects/shapes/manager/primitive2d/D2LineShapeManager'
import { Helper } from '../utils/Helper'
import { D2CircleShapeManager } from '../objects/shapes/manager/primitive2d/D2CircleShapeManager'
import { TElement2DTextJSONViewData, TElementJSONData, TElementShapeType, TFillElementShapeType } from '../types/Element'
import { EOperationAction } from '../config/OperationProfile'
import { Color } from '../engine/common/Color'
import { D2ElementShapeItemBase } from '../objects/shapes/primitive2d/elementBase/D2ElementShapeItemBase'
import { D2CircleShape } from '../objects/shapes/primitive2d/D2CircleShape'
import { D2LineShape } from '../objects/shapes/primitive2d/D2LineShape'
import { EPointerEventName, EventsManager, TPointEventHandler } from '../manager/EventsManager'
import { D2ArcShapeManager } from '../objects/shapes/manager/primitive2d/D2ArcShapeManager'
import { D2ArcShape } from '../objects/shapes/primitive2d/D2ArcShape'
import { ESweep } from '../engine/config/CommonProfile'
import { ED2ElementType, ED2ElementUpdateAttr, ED2ElementUpdateProperty } from '../config/D2ElementProfile'
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
import { TBuildD2LineModelOptionalParam } from '../objects/models/primitive2d/D2LineModel'
import { TBuildD2RectModelOptionalParam } from '../objects/models/primitive2d/D2RectModel'
import { TBuildD2PointModelOptionalParam } from '../objects/models/primitive2d/D2PointModel'
import { TBuildD2ImageModelOptionalParam } from '../objects/models/primitive2d/D2ImageModel'
import { TBuildD2CircleModelOptionalParam } from '../objects/models/primitive2d/D2CircleModel'
import { TBuildD2ArcModelOptionalParam } from '../objects/models/primitive2d/D2ArcModel'

export class D2ElementController extends BaseInterface {
	constructor() {
		super()
	}

	/**
	 * 获取画布内所有图元结果
	 */
	public getAllD2ElementShapeResults(): Array<TElementJSONData> {
		return Helper.getAllElementShapes().map((elementItem: D2ElementShapeItemBase): TElementJSONData => {
			return elementItem.toJSON()
		})
	}

	/**
	 * 获取画布内所有被选中的图元结果
	 */
	public getAllSelectedD2ElementShapeResults(): Array<TElementJSONData> {
		return Constant.selectManager.getAllSelectItems().map((elementItem: D2ElementShapeItemBase): TElementJSONData => {
			return elementItem.toJSON()
		})
	}

	/**
	 * 创建 D2-Line-Shape
	 */
	public createD2LineElementShapeItem(layerItemId: string, startPoint: Vector2, endPoint: Vector2, optional: Partial<TBuildD2LineModelOptionalParam> = {}): string {
		const checkResult: { code: number; title: string } = Helper.checkDrawLayer(layerItemId)
		if (checkResult.code !== 0) {
			console.error(`error: target layer does not exist or has been deleted.`)
			return null!
		}
		const elementItemId: string = Constant.globalIdenManager.getElementIden()
		const targetShapeItem: D2LineShape = D2LineShapeManager.getInstance().createShapeItem(elementItemId, layerItemId, startPoint, endPoint, optional)
		Constant.messageTool.messageBus.publish(EFrameCommand.RENDER_FRAME, null)
		OutProfileMessage.dispatchOperationProfileChangeMessage(EOperationAction.CREATE_ELEMENT, {})
		return targetShapeItem.model.elementItemId
	}

	/**
	 * 创建 D2-Circle-Shape
	 */
	public createD2CircleElementShapeItem(layerItemId: string, centerPoint: Vector2, optional: Partial<TBuildD2CircleModelOptionalParam> = {}): string {
		const checkResult: { code: number; title: string } = Helper.checkDrawLayer(layerItemId)
		if (checkResult.code !== 0) {
			console.error(`error: target layer does not exist or has been deleted.`)
			return null!
		}
		const elementItemId: string = Constant.globalIdenManager.getElementIden()
		const targetShapeItem: D2CircleShape = D2CircleShapeManager.getInstance().createShapeItem(elementItemId, layerItemId, centerPoint, optional)
		Constant.messageTool.messageBus.publish(EFrameCommand.RENDER_FRAME, null)
		OutProfileMessage.dispatchOperationProfileChangeMessage(EOperationAction.CREATE_ELEMENT, {})
		return targetShapeItem.model.elementItemId
	}

	/**
	 * 创建 D2-Point-Shape
	 */
	public createD2PointElementShapeItem(layerItemId: string, centerPoint: Vector2, optional: Partial<TBuildD2PointModelOptionalParam> = {}): string {
		const checkResult: { code: number; title: string } = Helper.checkDrawLayer(layerItemId)
		if (checkResult.code !== 0) {
			console.error(`error: target layer does not exist or has been deleted.`)
			return null!
		}
		const elementItemId: string = Constant.globalIdenManager.getElementIden()
		const targetShapeItem: D2PointShape = D2PointShapeManager.getInstance().createShapeItem(elementItemId, layerItemId, centerPoint, optional)
		Constant.messageTool.messageBus.publish(EFrameCommand.RENDER_FRAME, null)
		OutProfileMessage.dispatchOperationProfileChangeMessage(EOperationAction.CREATE_ELEMENT, {})
		return targetShapeItem.model.elementItemId
	}

	/**
	 * 创建 D2-Arc-Shape
	 */
	public createD2ArcElementShapeItem(layerItemId: string, centerPoint: Vector2, radius: number, startRadian: number, endRadian: number, sweep: ESweep, optional: Partial<TBuildD2ArcModelOptionalParam> = {}): string {
		const checkResult: { code: number; title: string } = Helper.checkDrawLayer(layerItemId)
		if (checkResult.code !== 0) {
			console.error(`error: target layer does not exist or has been deleted.`)
			return null!
		}
		const elementItemId: string = Constant.globalIdenManager.getElementIden()
		const targetShapeItem: D2ArcShape = D2ArcShapeManager.getInstance().createShapeItem(elementItemId, layerItemId, centerPoint, radius, startRadian, endRadian, sweep, optional)
		Constant.messageTool.messageBus.publish(EFrameCommand.RENDER_FRAME, null)
		OutProfileMessage.dispatchOperationProfileChangeMessage(EOperationAction.CREATE_ELEMENT, {})
		return targetShapeItem.model.elementItemId
	}

	/**
	 * 创建 D2-Image-Shape
	 */
	public createD2ImageElementItem(layerItemId: string, position: Vector2, fileHashUuid: string, imageDataURL: string, width: number, height: number, optional: Partial<TBuildD2ImageModelOptionalParam> = {}): string {
		const checkResult: { code: number; title: string } = Helper.checkDrawLayer(layerItemId)
		if (checkResult.code !== 0) {
			console.error(`error: target layer does not exist or has been deleted.`)
			return null!
		}
		const elementItemId: string = Constant.globalIdenManager.getElementIden()
		const targetShapeItem: D2ImageShape = D2ImageShapeManager.getInstance().createShapeItem(elementItemId, layerItemId, position, fileHashUuid, imageDataURL, width, height, optional)
		Constant.messageTool.messageBus.publish(EFrameCommand.RENDER_FRAME, null)
		OutProfileMessage.dispatchOperationProfileChangeMessage(EOperationAction.CREATE_ELEMENT, {})
		return targetShapeItem.model.elementItemId
	}

	/**
	 * 创建 D2-Rect-Shape
	 */
	public createD2RectElementShapeItem(layerItemId: string, position: Vector2, width: number, height: number, optional: Partial<TBuildD2RectModelOptionalParam> = {}): string {
		const checkResult: { code: number; title: string } = Helper.checkDrawLayer(layerItemId)
		if (checkResult.code !== 0) {
			console.error(`error: target layer does not exist or has been deleted.`)
			return null!
		}
		const elementItemId: string = Constant.globalIdenManager.getElementIden()
		const targetShapeItem: D2RectShape = D2RectShapeManager.getInstance().createShapeItem(elementItemId, layerItemId, position, width, height, optional)
		Constant.messageTool.messageBus.publish(EFrameCommand.RENDER_FRAME, null)
		OutProfileMessage.dispatchOperationProfileChangeMessage(EOperationAction.CREATE_ELEMENT, {})
		return targetShapeItem.model.elementItemId
	}

	/**
	 * 获取图元 JSON 数据
	 */
	public getD2ElementShapeItemJSONData(elementItemId: string, markShapeType?: ED2ElementType): any {
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
	public updateD2ElementShapeItemAttrByJSONData(elementItemId: string, jsonData: Partial<{ [key in ED2ElementUpdateAttr]: any }>, markShapeType?: ED2ElementType): void {
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
					const iTargetElement: D2ImageShape | D2RectShape = targetElement as D2ImageShape | D2RectShape
					iTargetElement.isFlipX = jsonData[key]
					break
				}
				case ED2ElementUpdateAttr.IS_FILP_Y: {
					const iTargetElement: D2ImageShape | D2RectShape = targetElement as D2ImageShape | D2RectShape
					iTargetElement.isFlipY = jsonData[key]
					break
				}
				case ED2ElementUpdateAttr.ROTATION: {
					const iTargetElement: D2ImageShape | D2RectShape | D2PointShape = targetElement as D2ImageShape | D2RectShape | D2PointShape
					iTargetElement.rotation = jsonData[key]
					break
				}
				case ED2ElementUpdateAttr.BORDER_RADIUS: {
					const iTargetElement: D2RectShape = targetElement as D2RectShape
					iTargetElement.borderRadius = jsonData[key]
					break
				}
				case ED2ElementUpdateAttr.STROKE_COLOR: {
					const iTargetElement: TElementShapeType = targetElement as TElementShapeType
					iTargetElement.strokeColor = jsonData[key]
					break
				}
				case ED2ElementUpdateAttr.FILL_COLOR: {
					const iTargetElement: TFillElementShapeType = targetElement as TFillElementShapeType
					if (jsonData[key] === undefined || jsonData[key] === null) {
						iTargetElement.fillColor = Color.createByAlpha(0)
						iTargetElement.isFill = false
					} else {
						iTargetElement.fillColor = jsonData[key]
						iTargetElement.isFill = true
					}
					break
				}
				case ED2ElementUpdateAttr.LINE_CAP: {
					const iTargetElement: D2LineShape | D2ArcShape | D2CircleShape = targetElement as D2LineShape | D2ArcShape | D2CircleShape
					iTargetElement.lineCap = jsonData[key]
					break
				}
				case ED2ElementUpdateAttr.IS_SOLID: {
					const iTargetElement: D2LineShape | D2ArcShape | D2CircleShape = targetElement as D2LineShape | D2ArcShape | D2CircleShape
					iTargetElement.isSolid = jsonData[key]
					break
				}
				case ED2ElementUpdateAttr.ELEMENT_ITEM_NAME: {
					const iTargetElement: any = targetElement as any
					iTargetElement.elementItemName = jsonData[key]
					break
				}
				case ED2ElementUpdateAttr.POSITION: {
					const iTargetElement: D2ImageShape | D2TextShape | D2RectShape = targetElement as D2ImageShape | D2TextShape | D2RectShape
					iTargetElement.position = jsonData[key]
					break
				}
				default: {
					console.warn('unkown shape attr: ', key)
				}
			}
			Constant.selectManager.clearSelectItemById(targetElement.elementItemId)
		}
		Constant.messageTool.messageBus.publish(EFrameCommand.RENDER_FRAME, null)
		OutProfileMessage.dispatchOperationProfileChangeMessage(EOperationAction.MODIFY_ELEMENT, {})
	}

	/**
	 * 更新图元特征属性
	 */
	public updateD2ElementShapeItemPropertyByJSONData(elementItemId: string, jsonData: Partial<{ [key in ED2ElementUpdateProperty]: any }>, markShapeType?: ED2ElementType): void {
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
				case ED2ElementUpdateProperty.IS_SELECTABLE: {
					const iTargetElement: D2ImageShape | D2RectShape = targetElement as D2ImageShape | D2RectShape
					iTargetElement.isSelectable = jsonData[key]
					break
				}
				default: {
					console.warn('unkown shape property: ', key)
				}
			}
			Constant.selectManager.clearSelectItemById(targetElement.elementItemId)
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
