import { DrawLayerController as _DrawLayerController } from './controller/DrawLayerController'
import { D2ElementController as _D2ElementController } from './controller/D2ElementController'
import { D2TextElementController as _D2TextElementController } from './controller/D2TextElementController'
import { CanvasController as _CanvasController } from './controller/CanvasController'
import { OperationController as _OperationController } from './controller/OperationController'
import { TSystemConfigJSONData } from './controller/systemConfig/SystemConfig'
import { ViewInit } from './view/ViewInit'
import { CoreInit, EnvirInit, LayerInit, D2ToolInit } from './init/Init'
import { InputInfo } from './tool/InputInfo'
import { MessageTool } from './tool/MessageTool'
import { InsConfig } from './engine/common/InsConfig'
import { FloatPanel } from './helper/FloatPanel'
import { BaseDrawToolManager } from './tool/draw/BaseDrawToolManager'

import { ESweep } from './engine/config/CommonProfile'
import { ECommandAction } from './tool/history/command/Config'
import { EDrawD2ToolCommand, EFrameCommand } from './config/CommandEnum'
import { EOperationAction } from './config/OperationProfile'
import { ED2ElementType } from './config/D2ElementProfile'
import { ECanvas2DLineCap, ED2FontStyle, ED2PointShape } from './engine/config/PrimitiveProfile'

import {
	TD2TextVertexData,
	TElement2DArcJSONViewData,
	TElement2DCircleJSONViewData,
	TElement2DImageJSONViewData,
	TElement2DLineJSONViewData,
	TElement2DPointJSONViewData,
	TElement2DRectJSONViewData,
	TElement2DTextJSONViewData,
	TElementJSONData,
} from './types/Element'
import { TColorRGBAJSON } from './engine/common/Color'
import { TDOMGetBoundingClientRectResult, TDrawLayerItemResult } from './types/Common'
import { TFontTriangleVertexData } from './manager/TextGraphicsManager'
import { TD2EdgeItem, TD2PointItem, TD2TriangleIndicesItem } from './engine/types/Common'
import { Constant, createConstant, destoryConstant } from './Constant'
import { EOutEventCommand, OutProfileMessage, TCanvasProfileData, TOpeartionProfileData } from './utils/OutMessage'
import { EPointerEventName } from './manager/EventsManager'
import { MAX_ZOOM_RATIO, MIN_ZOOM_RATIO } from './config/Config'
import { Vector2 } from './engine/algorithm/geometry/vector/Vector2'

export * from './engine/common/Color'
export * from './engine/math/Decimals'
export * from './engine/math/Calculation'
export * from './engine/math/Angles'
export * from './engine/math/Doublekit'
export * from './engine/algorithm/geometry/Euler'
export * from './engine/algorithm/geometry/Quaternion'
export * from './engine/algorithm/geometry/vector/Vector2'
export * from './engine/algorithm/geometry/vector/Vector3'
export * from './engine/algorithm/geometry/matrix/Matrix'
export * from './engine/algorithm/geometry/matrix/Matrix3'
export * from './engine/algorithm/geometry/matrix/Matrix4'
export * from './engine/algorithm/geometry/matrix/CanvasMatrix4'
export { getHashIden } from './engine/utils/Utils'
export * from './engine/algorithm/geometry/bbox/BBox2'

export * from './algorithm/geometry/primitives/Arc'
export * from './algorithm/geometry/primitives/Line'
export * from './algorithm/geometry/primitives/Polyline'
export * from './algorithm/geometry/primitives/PolylineGroup'
export * from './algorithm/geometry/primitives/Triangle'
export { nextFrameTick } from './utils/Utils'

export type InputInfoData = InputInfo
export type D2ElementController = _D2ElementController
export type DrawLayerController = _DrawLayerController
export type D2TextElementController = _D2TextElementController
export type CanvasController = _CanvasController
export type OperationController = _OperationController

export type DOMGetBoundingClientRectResult = TDOMGetBoundingClientRectResult
export type ColorRGBAJSON = TColorRGBAJSON
export type DrawLayerItemResult = TDrawLayerItemResult
export type CanvasProfileData = TCanvasProfileData
export type SystemConfigJSONData = TSystemConfigJSONData
export type OpeartionProfileData = TOpeartionProfileData
export type FontTriangleVertexData = TFontTriangleVertexData
export type D2PointItem = TD2PointItem
export type D2EdgeItem = TD2EdgeItem
export type D2TriangleIndicesItem = TD2TriangleIndicesItem
export type D2TextVertexData = TD2TextVertexData

export type ElementJSONData = TElementJSONData
export type Element2DLineJSONViewData = TElement2DLineJSONViewData
export type Element2DCircleJSONViewData = TElement2DCircleJSONViewData
export type Element2DPointJSONViewData = TElement2DPointJSONViewData
export type Element2DArcJSONViewData = TElement2DArcJSONViewData
export type Element2DTextJSONViewData = TElement2DTextJSONViewData
export type Element2DImageJSONViewData = TElement2DImageJSONViewData
export type Element2DRectJSONViewData = TElement2DRectJSONViewData

export type DrawD2ToolCommand = EDrawD2ToolCommand
export const DRAW_D2TOOL_COMMAND = { ...EDrawD2ToolCommand }

export type OperationAction = EOperationAction
export const OPERATION_ACRION = { ...EOperationAction }

export type CommandAction = ECommandAction
export const HISTORY_CMD_ACTION = { ...ECommandAction }

export type CanvasLineCap = ECanvas2DLineCap
export const CANVAS_LINE_CAP = { ...ECanvas2DLineCap }

export type PointerEventName = EPointerEventName
export const POINT_EVENT_NAME = { ...EPointerEventName }

export type Sweep = ESweep
export const SWEEP = { ...ESweep }

export type D2ElementType = ED2ElementType
export const D2ELEMENT_TYPE = { ...ED2ElementType }

export type D2FontStyle = ED2FontStyle
export const D2FONT_STYLE = { ...ED2FontStyle }

export type D2PointShape = ED2PointShape
export const D2POINT_SHAPE = { ...ED2PointShape }

export const Helper = {
	FloatPanel,
}

export class WebCanvas {
	private _isInit: boolean
	private _canvasElement: HTMLCanvasElement
	private _drawD2ToolManager: BaseDrawToolManager
	constructor(canvasElement: HTMLCanvasElement) {
		this._isInit = false
		this._canvasElement = canvasElement
		this._drawD2ToolManager = null!
		createConstant()
	}

	public async init(): Promise<boolean> {
		if (this._isInit) {
			console.log(`Do not allow duplicate initialization.`)
			return Constant.environment.isQuit
		}
		this._isInit = true
		Constant.environment.init(this._canvasElement)
		await CoreInit.init()
		await ViewInit.init()
		await EnvirInit.init(this._canvasElement)
		await LayerInit.init()
		const { drawD2ToolManager } = D2ToolInit.d2Init(this._canvasElement)
		this._drawD2ToolManager = drawD2ToolManager
		this._canvasElement.focus()
		Constant.environment.isQuit = false
		return Constant.environment.isQuit
	}

	public get isQuit(): boolean {
		return Constant.environment ? Constant.environment.isQuit : true
	}

	public get messageTool(): MessageTool {
		if (this.checkIsQuit()) {
			return null!
		}
		return Constant.messageTool
	}

	public get drawLayerController(): _DrawLayerController {
		if (this.checkIsQuit()) {
			return null!
		}
		return Constant.drawLayerController
	}

	public get d2ElementController(): _D2ElementController {
		if (this.checkIsQuit()) {
			return null!
		}
		return Constant.d2ElementController
	}

	public get d2TextElementController(): _D2TextElementController {
		if (this.checkIsQuit()) {
			return null!
		}
		return Constant.d2TextElementController
	}

	public get canvasController(): _CanvasController {
		if (this.checkIsQuit()) {
			return null!
		}
		return Constant.canvasController
	}

	public get operationController(): _OperationController {
		if (this.checkIsQuit()) {
			return null!
		}
		return Constant.operationController
	}

	public resetCanvasStatus(): void {
		if (this.checkIsQuit()) {
			return null!
		}
		Constant.canvasController.resetCanvasStatus()
		Constant.messageTool.messageBus.publish(EFrameCommand.RENDER_FRAME, null)
		OutProfileMessage.dispatchCanvasProfileChangeMessage()
	}

	public getCanvasRect(): TDOMGetBoundingClientRectResult {
		if (this.checkIsQuit()) {
			return null!
		}
		return this._canvasElement.getBoundingClientRect().toJSON()
	}

	public getDPI(): [number, number] {
		if (this.checkIsQuit()) {
			return null!
		}
		return [...InsConfig.DPI]
	}

	public getSystemConfig(): TSystemConfigJSONData {
		if (this.checkIsQuit()) {
			return null!
		}
		return Constant.systemConfig.toJSON()
	}
	public setSystemConfig(moduleName: 'Interactive' | 'CanvasAidedDesign' | 'Theme' | string, key: any, value?: any): void {
		if (this.checkIsQuit()) {
			return null!
		}
		Constant.systemConfig.update(moduleName, key, value)
		Constant.messageTool.messageBus.publish(EFrameCommand.RENDER_FRAME, null)
	}

	public getCanvasProfileData(): TCanvasProfileData {
		if (this.checkIsQuit()) {
			return null!
		}
		return OutProfileMessage.createCanvasProfileData({})
	}

	public setCanvasZoomRatio(ratio: number, domCanvasSourceNativePixelPosition: Vector2): void {
		if (ratio <= MIN_ZOOM_RATIO) {
			ratio = MIN_ZOOM_RATIO
		}
		if (ratio >= MAX_ZOOM_RATIO) {
			ratio = MIN_ZOOM_RATIO
		}
		Constant.canvasController.setZoomCanvasBySourceNativePixelPosition(ratio, domCanvasSourceNativePixelPosition.toVector3())
	}

	public setCanvasStaticRest(): void {
		Constant.messageTool.messageBus.publish(EFrameCommand.SET_STATIC_REST, null)
	}

	public setDrawD2ToolCommand(type: EDrawD2ToolCommand, data: { [key: string]: any } = {}): void {
		this._drawD2ToolManager.update({ type, data })
	}

	public forceRender(): void {
		Constant.messageTool.messageBus.publish(EFrameCommand.RENDER_FRAME, null)
	}

	public addInputsChangeListener(callback: (data: InputInfo) => void): void {
		Constant.messageTool.messageBus.subscribe(EOutEventCommand.INPUTS_CHANGE, callback)
	}
	public addCanvasProfileChangeListener(callback: (data: TCanvasProfileData) => void): void {
		Constant.messageTool.messageBus.subscribe(EOutEventCommand.CANVASPROFILE_CHANGE, callback)
	}
	public addOperationProfileChangeListener(callback: (data: TOpeartionProfileData) => void): void {
		Constant.messageTool.messageBus.subscribe(EOutEventCommand.OPERATION_CHANGE, callback)
	}

	public quit(): void {
		Constant.environment.isQuit = true
		window.cancelAnimationFrame(Constant.environment.launcher.rAFId)
		destoryConstant()
		D2ToolInit.d2Quit()
		this._canvasElement = undefined!
	}

	private checkIsQuit(): boolean {
		if (Constant.environment.isQuit) {
			console.warn(`The canvas instance has been destroyed, please create a new instance.`)
			return true
		}
		return false
	}
}

export function createCanvasElement(containerElement: HTMLElement): HTMLCanvasElement {
	if (containerElement.childNodes.length) {
		throw new Error(`you must provide a container that does not contain any child nodes.`)
	}
	const containerClientRect: TDOMGetBoundingClientRectResult = containerElement.getBoundingClientRect()
	const canvasElement: HTMLCanvasElement = document.createElement('canvas')
	canvasElement.width = containerClientRect.width
	canvasElement.height = containerClientRect.height
	canvasElement.style.position = 'absolute'
	containerElement.appendChild(canvasElement)
	return canvasElement
}
