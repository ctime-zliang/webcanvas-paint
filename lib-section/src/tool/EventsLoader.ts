import { InputInfo } from './InputInfo'
import { Tool } from './Tool'
import { ToolChain } from './ToolChain'
import { SyncCanvasRect } from '../utils/SyncCanvasRect'
import { TDOMGetBoundingClientRectResult } from '../types/Common'
import { InsConfig } from '../engine/common/InsConfig'
import { Camera } from '../engine/common/Camera'
import { Vector3 } from '../engine/algorithm/geometry/vector/Vector3'
import { px2mm } from '../engine/math/Calculation'
import { TD2PointItem } from '../engine/types/Common'
import { Vector2 } from '../engine/algorithm/geometry/vector/Vector2'
import { Constant } from '../Constant'

/**
 * 输入:
 * 		相对于 <canvas /> 左上角的原生像素坐标
 * 输出:
 * 		场景像素坐标
 *
 * 通常将相机的可视范围与当前 <canvas /> 的尺寸完全重合
 * 则在任意时刻, 相机可视范围的中心点与当前 <canvas /> 的中心点也重合
 */
export function setCanvasNativePixelPos2ScenePixelPos(sourceNativePixelX: number, sourceNativePixelY: number): TD2PointItem {
	const camera: Camera = Camera.getInstance()
	/**
	 * 指定坐标点相对于 <canvas /> 左上角的像素坐标值
	 * 指定坐标点相对于相机可视范围左上角的像素坐标值
	 * 		X 轴向右为正/Y 轴向上为正
	 */
	const pointA: Vector3 = new Vector3(sourceNativePixelX, sourceNativePixelY, 0)
	/**
	 * 当前相机可视范围的中心点相对于可视范围左上角的像素坐标值
	 * 		在画布尺寸保持不变的情况下, 此坐标通常为固定值
	 */
	const pointB: Vector3 = new Vector3(camera.width / 2, -camera.height / 2, 0)
	/**
	 * 指定点相对于相机可视范围内中心点的像素坐标值
	 * 指定点相对于 <canvas /> 中心点的像素坐标值
	 */
	const rcPoint: Vector3 = pointA.sub(pointB)
	/**
	 * 指定坐标点相对于<画布视图原点>的像素坐标值
	 */
	const roPoint: Vector3 = rcPoint.multiplyMatrix4(camera.getLookMatrix4().multiply4(camera.getZoomMatrix4()).getInverseMatrix())
	return [roPoint.x, roPoint.y]
}

/**
 * 输入:
 * 		相对于 <canvas /> 左上角的原生像素坐标
 * 输出:
 * 		场景物理坐标
 */
export function setCanvasNativePixelPos2ScenePhysicsPos(sourceNativePixelX: number, sourceNativePixelY: number): [number, number] {
	const DPI: [number, number] = InsConfig.DPI
	const [scenePixelX, scenePixelY] = setCanvasNativePixelPos2ScenePixelPos(sourceNativePixelX, sourceNativePixelY)
	const scenePhysicsX: number = px2mm(scenePixelX, DPI[0])
	const scenePhysicsY: number = px2mm(scenePixelY, DPI[0])
	return [scenePhysicsX, scenePhysicsY]
}

export function updateMouseInputInfo(inputInfo: InputInfo): void {
	const DPI: [number, number] = InsConfig.DPI
	const offsetOfCanvasViewPosition: [number, number] = setCanvasNativePixelPos2ScenePixelPos(
		inputInfo.moveSourceNativePixelX,
		-inputInfo.moveSourceNativePixelY
	)
	inputInfo.moveScenePixelX = offsetOfCanvasViewPosition[0]
	inputInfo.moveScenePixelY = offsetOfCanvasViewPosition[1]
	inputInfo.moveRealScenePhysicsX = inputInfo.moveScenePhysicsX = px2mm(inputInfo.moveScenePixelX, DPI[0])
	inputInfo.moveRealScenePhysicsY = inputInfo.moveScenePhysicsY = px2mm(inputInfo.moveScenePixelY, DPI[1])
	if (Constant.systemConfig.canvasAidedDesign.alignGrid) {
		const offset: Vector2 = Constant.adsorption.adsorpGrid(new Vector2(inputInfo.moveRealScenePhysicsX, inputInfo.moveRealScenePhysicsY))
		// inputInfo.moveScenePhysicsX = offset.x
		// inputInfo.moveScenePhysicsY = offset.y
	}
	if (inputInfo.type === 'mousedown') {
		if (inputInfo.leftMouseDown) {
			inputInfo.leftDownScenePixelX = inputInfo.moveScenePixelX
			inputInfo.leftDownScenePixelY = inputInfo.moveScenePixelY
			inputInfo.leftDownScenePhysicsX = inputInfo.moveScenePhysicsX
			inputInfo.leftDownScenePhysicsY = inputInfo.moveScenePhysicsY
			inputInfo.leftDownRealScenePhysicsX = inputInfo.moveRealScenePhysicsX
			inputInfo.leftDownRealScenePhysicsY = inputInfo.moveRealScenePhysicsY
		}
		if (inputInfo.middleMouseDown) {
			inputInfo.middleDownScenePixelX = inputInfo.moveScenePixelX
			inputInfo.middleDownScenePixelY = inputInfo.moveScenePixelY
			inputInfo.middleDownScenePhysicsX = inputInfo.moveScenePhysicsX
			inputInfo.middleDownScenePhysicsY = inputInfo.moveScenePhysicsY
			inputInfo.middleDownRealScenePhysicsX = inputInfo.moveRealScenePhysicsX
			inputInfo.middleDownRealScenePhysicsY = inputInfo.moveRealScenePhysicsY
		}
		if (inputInfo.rightMouseDown) {
			inputInfo.rightDownScenePixelX = inputInfo.moveScenePixelX
			inputInfo.rightDownScenePixelY = inputInfo.moveScenePixelY
			inputInfo.rightDownScenePhysicsX = inputInfo.moveScenePhysicsX
			inputInfo.rightDownScenePhysicsY = inputInfo.moveScenePhysicsY
			inputInfo.rightDownRealScenePhysicsX = inputInfo.moveRealScenePhysicsX
			inputInfo.rightDownRealScenePhysicsY = inputInfo.moveRealScenePhysicsY
		}
	}
	if (inputInfo.type === 'mouseup') {
		inputInfo.leftDownScenePixelX = null!
		inputInfo.leftDownScenePixelY = null!
		inputInfo.middleDownScenePixelX = null!
		inputInfo.middleDownScenePixelY = null!
		inputInfo.rightDownScenePixelX = null!
		inputInfo.rightDownScenePixelY = null!
		inputInfo.leftDownScenePhysicsX = null!
		inputInfo.leftDownScenePhysicsY = null!
		inputInfo.middleDownScenePhysicsX = null!
		inputInfo.middleDownScenePhysicsY = null!
		inputInfo.rightDownScenePhysicsX = null!
		inputInfo.rightDownScenePhysicsY = null!
		inputInfo.leftDownRealScenePhysicsX = null!
		inputInfo.leftDownRealScenePhysicsY = null!
		inputInfo.middleDownRealScenePhysicsX = null!
		inputInfo.middleDownRealScenePhysicsY = null!
		inputInfo.rightDownRealScenePhysicsX = null!
		inputInfo.rightDownRealScenePhysicsY = null!
	}
}

const MOUSE_LEFT_BUTTONS: number = 1
const MOUSE_RIGHT_BUTTONS: number = 2
const MOUSE_MIDDLE_BUTTONS: number = 4

export class EventsLoader extends ToolChain<InputInfo> {
	private _canvasElement: HTMLCanvasElement
	private _inputInfo: InputInfo
	private _viewResizeHandlerScopeHandler: () => void
	private _keyDownHandlerScopeHandler: (e: KeyboardEvent) => void
	private _keyUpHandlerScopeHandler: (e: KeyboardEvent) => void
	private _mouseDownHandlerScopeHandler: (e: MouseEvent) => void
	private _mouseMoveHandlerScopeHandler: (e: MouseEvent) => void
	private _mouseUpHandlerScopeHandler: (e: MouseEvent) => void
	private _contextmenuHandlerScopeHandler: (e: MouseEvent) => void
	private _mouseWheelHandlerScopeHandler: (e: WheelEvent) => void
	private _mouseLeaveHandlerScopeHandler: (e: MouseEvent) => void
	private _mouseEnterHandlerScopeHandler: (e: MouseEvent) => void
	constructor(canvasElement: HTMLCanvasElement) {
		super()
		this._canvasElement = canvasElement
		this._inputInfo = new InputInfo()
		this._viewResizeHandlerScopeHandler = this.viewResizeHandler.bind(this)
		this._keyDownHandlerScopeHandler = this.keyDownHandler.bind(this)
		this._keyUpHandlerScopeHandler = this.keyUpHandler.bind(this)
		this._mouseDownHandlerScopeHandler = this.mouseDownHandler.bind(this)
		this._mouseMoveHandlerScopeHandler = this.mouseMoveHandler.bind(this)
		this._mouseUpHandlerScopeHandler = this.mouseUpHandler.bind(this)
		this._contextmenuHandlerScopeHandler = this.contextmenuHandler.bind(this)
		this._mouseWheelHandlerScopeHandler = this.mouseWheelHandler.bind(this)
		this._mouseLeaveHandlerScopeHandler = this.mouseLeaveHandler.bind(this)
		this._mouseEnterHandlerScopeHandler = this.mouseEnterHandler.bind(this)
	}

	public init(): void {
		this.bindEvent()
	}

	public get inputInfo(): InputInfo {
		return this._inputInfo
	}

	public get canvasElement(): HTMLCanvasElement {
		return this._canvasElement
	}

	public getWindowRatio(ratio: number = window.devicePixelRatio): number {
		return ratio > 1 ? ratio : 1
	}

	public bindEvent(): void {
		const canvasElement: HTMLCanvasElement = this.canvasElement
		window.addEventListener('resize', this._viewResizeHandlerScopeHandler)
		window.addEventListener('keydown', this._keyDownHandlerScopeHandler)
		window.addEventListener('keyup', this._keyUpHandlerScopeHandler)
		canvasElement.addEventListener('mousedown', this._mouseDownHandlerScopeHandler, false)
		canvasElement.addEventListener('mousemove', this._mouseMoveHandlerScopeHandler, false)
		canvasElement.addEventListener('mouseup', this._mouseUpHandlerScopeHandler, false)
		canvasElement.addEventListener('contextmenu', this._contextmenuHandlerScopeHandler, false)
		canvasElement.addEventListener('wheel', this._mouseWheelHandlerScopeHandler, false)
		canvasElement.addEventListener('mouseleave', this._mouseLeaveHandlerScopeHandler, false)
		canvasElement.addEventListener('mouseenter', this._mouseEnterHandlerScopeHandler, false)
	}

	public quit(): void {
		const canvasElement: HTMLCanvasElement = this.canvasElement
		window.removeEventListener('resize', this._viewResizeHandlerScopeHandler)
		window.removeEventListener('keydown', this._keyDownHandlerScopeHandler)
		window.removeEventListener('keyup', this._keyUpHandlerScopeHandler)
		canvasElement.removeEventListener('mousedown', this._mouseDownHandlerScopeHandler, false)
		canvasElement.removeEventListener('mousemove', this._mouseMoveHandlerScopeHandler, false)
		canvasElement.removeEventListener('mouseup', this._mouseUpHandlerScopeHandler, false)
		canvasElement.removeEventListener('contextmenu', this._contextmenuHandlerScopeHandler, false)
		canvasElement.removeEventListener('wheel', this._mouseWheelHandlerScopeHandler, false)
		canvasElement.removeEventListener('mouseleave', this._mouseLeaveHandlerScopeHandler, false)
		canvasElement.removeEventListener('mouseenter', this._mouseEnterHandlerScopeHandler, false)
		this._canvasElement = undefined!
		this._inputInfo = undefined!
	}

	private viewResizeHandler(): void {
		SyncCanvasRect.syncCanvasRectByWindow(this.canvasElement)
		const canvasRect: TDOMGetBoundingClientRectResult = this.canvasElement.getBoundingClientRect().toJSON()
		Constant.environment.updateCanvasRectSize(canvasRect.width, canvasRect.height, canvasRect.left, canvasRect.top)
		const handlerAction = (nextTool: Tool<InputInfo>): void => {
			nextTool.viewResizeHandler(this.inputInfo, {
				distX: canvasRect.width - Constant.environment.canvasWidth,
				distY: canvasRect.height - Constant.environment.canvasHeight,
				canvasRect,
			})
		}
		this.handler(handlerAction)
	}

	private prepareSystemEventInputInfo(e: MouseEvent): void {
		e.preventDefault()
		const sourceOffsetX: number = e.offsetX * this.getWindowRatio()
		const sourceOffsetY: number = e.offsetY * this.getWindowRatio()
		this.inputInfo.mouseTimeStamp = e.timeStamp
		this.inputInfo.type = e.type
		this.inputInfo.moveSourceNativePixelX = sourceOffsetX
		this.inputInfo.moveSourceNativePixelY = sourceOffsetY
		this.inputInfo.ctrlKey = !!e.ctrlKey
		this.inputInfo.altKey = !!e.altKey
		this.inputInfo.shiftKey = !!e.shiftKey
		this.inputInfo.metaKey = !!e.metaKey
		this.inputInfo.deltaSourceNativePixelX = (e as any).deltaX || 0
		this.inputInfo.deltaSourceNativePixelY = (e as any).deltaY || 0
		if (e.type === 'mousedown') {
			if (this.inputInfo.leftMouseDown === false) {
				this.inputInfo.leftDownSourceNativePixelX = sourceOffsetX
				this.inputInfo.leftDownSourceNativePixelY = sourceOffsetY
			}
			if (this.inputInfo.middleMouseDown === false) {
				this.inputInfo.middleDownSourceNativePixelX = sourceOffsetX
				this.inputInfo.middleDownSourceNativePixelY = sourceOffsetY
			}
			if (this.inputInfo.leftMouseDown === false) {
				this.inputInfo.rightDownSourceNativePixelX = sourceOffsetX
				this.inputInfo.rightDownSourceNativePixelY = sourceOffsetY
			}
			this.inputInfo.leftMouseDown = (e.buttons & MOUSE_LEFT_BUTTONS) > 0
			this.inputInfo.rightMouseDown = (e.buttons & MOUSE_RIGHT_BUTTONS) > 0
			this.inputInfo.middleMouseDown = (e.buttons & MOUSE_MIDDLE_BUTTONS) > 0
		}
		if (e.type === 'mouseup') {
			this.inputInfo.leftMouseDown = (e.buttons & MOUSE_LEFT_BUTTONS) > 0
			this.inputInfo.rightMouseDown = (e.buttons & MOUSE_RIGHT_BUTTONS) > 0
			this.inputInfo.middleMouseDown = (e.buttons & MOUSE_MIDDLE_BUTTONS) > 0
			if (this.inputInfo.leftMouseDown === false) {
				this.inputInfo.leftDownSourceNativePixelX = null!
				this.inputInfo.leftDownSourceNativePixelY = null!
			}
			if (this.inputInfo.middleMouseDown === false) {
				this.inputInfo.middleDownSourceNativePixelX = null!
				this.inputInfo.middleDownSourceNativePixelY = null!
			}
			if (this.inputInfo.leftMouseDown === false) {
				this.inputInfo.rightDownSourceNativePixelX = null!
				this.inputInfo.rightDownSourceNativePixelY = null!
			}
		}
		updateMouseInputInfo(this.inputInfo)
	}

	private prepareKeyboardEventInputInfo(e: KeyboardEvent): void {
		e.preventDefault()
		this.inputInfo.type = e.type
		this.inputInfo.keyCode = e.keyCode
		this.inputInfo.ctrlKey = !!e.ctrlKey
		this.inputInfo.altKey = !!e.altKey
		this.inputInfo.shiftKey = !!e.shiftKey
		this.inputInfo.metaKey = !!e.metaKey
		updateMouseInputInfo(this.inputInfo)
	}

	private keyDownHandler(e: KeyboardEvent): void {
		this.prepareKeyboardEventInputInfo(e)
		const handlerAction = (nextTool: Tool<InputInfo>): void => {
			nextTool.keyDownHandler(this.inputInfo)
		}
		this.handler(handlerAction)
	}

	private keyUpHandler(e: KeyboardEvent): void {
		this.prepareKeyboardEventInputInfo(e)
		const handlerAction = (nextTool: Tool<InputInfo>): void => {
			nextTool.keyUpHandler(this.inputInfo)
		}
		this.handler(handlerAction)
	}

	private mouseDownHandler(e: MouseEvent): void {
		this._canvasElement.focus()
		window.focus()
		this.prepareSystemEventInputInfo(e)
		let handlerAction
		if (e.button === 0) {
			handlerAction = (nextTool: Tool<InputInfo>): void => {
				nextTool.mouseLeftDownHandler(this.inputInfo)
			}
		} else if (e.button === 1) {
			handlerAction = (nextTool: Tool<InputInfo>): void => {
				nextTool.mouseMiddleDownHandler(this.inputInfo)
			}
		} else if (e.button === 2) {
			handlerAction = (nextTool: Tool<InputInfo>): void => {
				nextTool.mouseRightDownHandler(this.inputInfo)
			}
		}
		handlerAction && this.handler(handlerAction)
	}

	private mouseMoveHandler(e: MouseEvent): void {
		this.prepareSystemEventInputInfo(e)
		const handlerAction = (nextTool: Tool<InputInfo>): void => {
			nextTool.mouseMoveHandler(this.inputInfo)
		}
		this.handler(handlerAction)
	}

	private mouseUpHandler(e: MouseEvent): void {
		this.prepareSystemEventInputInfo(e)
		let handlerAction
		if (e.button === 0) {
			handlerAction = (nextTool: Tool<InputInfo>): void => {
				nextTool.mouseLeftUpHandler(this.inputInfo)
			}
		} else if (e.button === 1) {
			handlerAction = (nextTool: Tool<InputInfo>): void => {
				nextTool.mouseMiddleUpHandler(this.inputInfo)
			}
		} else if (e.button === 2) {
			handlerAction = (nextTool: Tool<InputInfo>): void => {
				nextTool.mouseRightUpHandler(this.inputInfo)
			}
		}
		handlerAction && this.handler(handlerAction)
	}

	private mouseWheelHandler(e: MouseEvent): void {
		this.prepareSystemEventInputInfo(e)
		const handlerAction = (nextTool: Tool<InputInfo>): void => {
			nextTool.mouseWheelHandler(this.inputInfo)
		}
		this.handler(handlerAction)
	}

	private mouseLeaveHandler(e: MouseEvent): void {
		this.prepareSystemEventInputInfo(e)
		const handlerAction = (nextTool: Tool<InputInfo>): void => {
			nextTool.mouseLeaveHandler(this.inputInfo)
		}
		this.handler(handlerAction)
	}

	private mouseEnterHandler(e: MouseEvent): void {
		this.prepareSystemEventInputInfo(e)
		const handlerAction = (nextTool: Tool<InputInfo>): void => {
			nextTool.mouseEnterHandler(this.inputInfo)
		}
		this.handler(handlerAction)
	}

	private contextmenuHandler(e: MouseEvent): void {
		e.preventDefault()
	}
}
