import { InputInfo } from '../InputInfo'
import { Tool } from '../Tool'
import { DIRECTION_KEY_MOVE_STEP, MOUSE_WHEEL_SCROLL_DIST, MOUSE_WHEEL_ZOOM_RATIO } from '../../config/Config'
import { EDIRECTION_KEY } from '../../config/NativeProfile'
import { EFrameCommand } from '../../config/CommandEnum'
import { TDOMGetBoundingClientRectResult } from '../../types/Common'
import { Vector2 } from '../../engine/algorithm/geometry/vector/Vector2'
import { Vector3 } from '../../engine/algorithm/geometry/vector/Vector3'
import { BaseFrameTool } from './BaseFrameTool'
import { Constant } from '../../Constant'
import { OutProfileMessage } from '../../utils/OutMessage'

export class D2FrameTool extends BaseFrameTool {
	private _lastCanvasOffset: Vector2
	constructor() {
		super()
		this._lastCanvasOffset = null!
	}

	public init(): void {
		this.nextTool = Constant.dropDragTool
		Constant.messageTool.messageBus.subscribe(EFrameCommand.SET_STATIC_REST, (): void => {
			this.isMouseLeftDwon = false
			this.isMouseMiddleDwon = false
			this.isMouseRightDwon = false
			Constant.selectManager.clearAllSelectItems()
		})
	}

	public viewResizeHandler(inputInfo: InputInfo, offset: { distX: number; distY: number; canvasRect: TDOMGetBoundingClientRectResult }): void {
		this.prepare(inputInfo)
		const newWidth: number = Constant.environment.canvasWidth
		const newHeight: number = Constant.environment.canvasHeight
		const oldWidth: number = newWidth - offset.distX
		const oldHeight: number = newHeight - offset.distY
		const oldRectVector2: Vector2 = new Vector2(oldWidth, oldHeight)
		const newRectVector2: Vector2 = new Vector2(newWidth, newHeight)
		const deltaVector2: Vector2 = newRectVector2.sub(oldRectVector2).mul(0.5, 0.5)
		const startVector2: Vector2 = new Vector2(Constant.environment.canvasLeft, Constant.environment.canvasTop)
		let offsetVector3: Vector3 = new Vector3(-deltaVector2.x, deltaVector2.y, 0)
		if (this._lastCanvasOffset !== null) {
			const off: Vector2 = startVector2.sub(this._lastCanvasOffset)
			if ((off.x < 0 && newWidth > oldWidth) || (off.x > 0 && newWidth < oldWidth)) {
				offsetVector3 = new Vector3(deltaVector2.x, deltaVector2.y, 0)
			}
			if ((off.y < 0 && newHeight > oldHeight) || (off.y > 0 && newHeight < oldHeight)) {
				offsetVector3 = new Vector3(deltaVector2.x, deltaVector2.y, 0)
			}
		}
		this._lastCanvasOffset = startVector2
		const cameraZoomRatio: number = this.camera.getZoomRatio()
		this.camera.setMoveIncrement(new Vector3(offsetVector3.x / cameraZoomRatio, offsetVector3.y / cameraZoomRatio, offsetVector3.z))
		OutProfileMessage.dispatchInputsChangeMessage(inputInfo)
	}

	public keyDownHandler(inputInfo: InputInfo): void {
		this.prepare(inputInfo)
		const handlerAction = (nextTool: Tool<InputInfo>): void => {
			nextTool.keyDownHandler(inputInfo)
		}
		if (inputInfo.ctrlKey) {
			if (inputInfo.keyCode === 187) {
				this.zoomCanvas(inputInfo, -100)
			} else if (inputInfo.keyCode === 189) {
				this.zoomCanvas(inputInfo, 100)
			}
		} else {
			const cameraZoomRatio: number = this.camera.getZoomRatio()
			switch (inputInfo.keyCode) {
				case EDIRECTION_KEY.LEFT: {
					if (Constant.systemConfig.interactive.enableCanvasTranslate && Constant.selectManager.items.size <= 0) {
						this.camera.setMoveIncrement(new Vector3(-DIRECTION_KEY_MOVE_STEP / cameraZoomRatio, 0, 0))
					}
					break
				}
				case EDIRECTION_KEY.UP: {
					if (Constant.systemConfig.interactive.enableCanvasTranslate && Constant.selectManager.items.size <= 0) {
						this.camera.setMoveIncrement(new Vector3(0, DIRECTION_KEY_MOVE_STEP / cameraZoomRatio, 0))
					}
					break
				}
				case EDIRECTION_KEY.RIGHT: {
					if (Constant.systemConfig.interactive.enableCanvasTranslate && Constant.selectManager.items.size <= 0) {
						this.camera.setMoveIncrement(new Vector3(DIRECTION_KEY_MOVE_STEP / cameraZoomRatio, 0, 0))
					}
					break
				}
				case EDIRECTION_KEY.DOWN: {
					if (Constant.systemConfig.interactive.enableCanvasTranslate && Constant.selectManager.items.size <= 0) {
						this.camera.setMoveIncrement(new Vector3(0, -DIRECTION_KEY_MOVE_STEP / cameraZoomRatio, 0))
					}
					break
				}
				default:
			}
		}
		OutProfileMessage.dispatchInputsChangeMessage(inputInfo)
		this.handler(handlerAction)
	}

	public keyUpHandler(inputInfo: InputInfo): void {
		this.prepare(inputInfo)
		const handlerAction = (nextTool: Tool<InputInfo>): void => {
			nextTool.keyUpHandler(inputInfo)
		}
		OutProfileMessage.dispatchInputsChangeMessage(inputInfo)
		this.handler(handlerAction)
	}

	public mouseLeftDownHandler(inputInfo: InputInfo): void {
		this.prepare(inputInfo)
		this.mouseLeftPrevSourceNativePixelX = inputInfo.moveSourceNativePixelX
		this.mouseLeftPrevSourceNativePixelY = inputInfo.moveSourceNativePixelY
		const handlerAction = (nextTool: Tool<InputInfo>): void => {
			nextTool.mouseLeftDownHandler(inputInfo)
		}
		this.isMouseLeftDwon = true
		OutProfileMessage.dispatchInputsChangeMessage(inputInfo)
		this.handler(handlerAction)
	}

	public mouseMiddleDownHandler(inputInfo: InputInfo): void {
		this.prepare(inputInfo)
		this.mouseMiddlePrevSourceNativePixelX = inputInfo.moveSourceNativePixelX
		this.mouseMiddlePrevSourceNativePixelY = inputInfo.moveSourceNativePixelY
		const handlerAction = (nextTool: Tool<InputInfo>): void => {
			nextTool.mouseMiddleDownHandler(inputInfo)
		}
		this.isMouseMiddleDwon = true
		OutProfileMessage.dispatchInputsChangeMessage(inputInfo)
		this.handler(handlerAction)
	}

	public mouseRightDownHandler(inputInfo: InputInfo): void {
		this.prepare(inputInfo)
		this.mouseRightPrevSourceNativePixelX = inputInfo.moveSourceNativePixelX
		this.mouseRightPrevSourceNativePixelY = inputInfo.moveSourceNativePixelY
		const handlerAction = (nextTool: Tool<InputInfo>): void => {
			nextTool.mouseRightDownHandler(inputInfo)
		}
		this.isMouseRightDwon = true
		OutProfileMessage.dispatchInputsChangeMessage(inputInfo)
		this.handler(handlerAction)
	}

	public mouseMoveHandler(inputInfo: InputInfo): void {
		this.prepare(inputInfo)
		const handlerAction = (nextTool: Tool<InputInfo>): void => {
			nextTool.mouseMoveHandler(inputInfo)
		}
		let isF: boolean = false
		let mousePrevSourceNativePixelX: number = 0
		let mousePrevSourceNativePixelY: number = 0
		if (Constant.systemConfig.interactive.enableCanvasTranslate) {
			if (Constant.systemConfig.interactive.enableCanvasTranslateByRightDownMove && this.isMouseRightDwon) {
				isF = true
				mousePrevSourceNativePixelX = this.mouseRightPrevSourceNativePixelX
				mousePrevSourceNativePixelY = this.mouseRightPrevSourceNativePixelY
			}
			if (
				!isF &&
				Constant.systemConfig.interactive.enableCanvasTranslateByLeftDownMove &&
				this.isMouseLeftDwon &&
				!Constant.systemConfig.interactive.enableCanvasSelection
			) {
				isF = true
				mousePrevSourceNativePixelX = this.mouseLeftPrevSourceNativePixelX
				mousePrevSourceNativePixelY = this.mouseLeftPrevSourceNativePixelY
			}
		}
		if (isF) {
			const cameraZoomRatio: number = this.camera.getZoomRatio()
			const offsetX: number = inputInfo.moveSourceNativePixelX - mousePrevSourceNativePixelX
			const offsetY: number = inputInfo.moveSourceNativePixelY - mousePrevSourceNativePixelY
			/**
			 * 鼠标左移 - offsetX 为负, 画面左移, 显示 X 轴负方向内容
			 * 鼠标右移 - offsetX 为正, 画面右移, 显示 X 轴正方向内容
			 * 鼠标上移 - offsetY 为负, 画面上移, 显示 Y 轴负方向内容
			 * 鼠标下移 - offsetY 为正, 画面下移, 显示 Y 轴正方向内容
			 */
			this.camera.setMoveIncrement(new Vector3(offsetX / cameraZoomRatio, -offsetY / cameraZoomRatio, 0))
			OutProfileMessage.dispatchCanvasProfileChangeMessage()
		}
		this.mouseRightPrevSourceNativePixelX =
			this.mouseMiddlePrevSourceNativePixelX =
			this.mouseLeftPrevSourceNativePixelX =
				inputInfo.moveSourceNativePixelX
		this.mouseRightPrevSourceNativePixelY =
			this.mouseMiddlePrevSourceNativePixelY =
			this.mouseLeftPrevSourceNativePixelY =
				inputInfo.moveSourceNativePixelY
		OutProfileMessage.dispatchInputsChangeMessage(inputInfo)
		this.handler(handlerAction)
	}

	public mouseLeftUpHandler(inputInfo: InputInfo): void {
		this.prepare(inputInfo)
		const handlerAction = (nextTool: Tool<InputInfo>): void => {
			nextTool.mouseLeftUpHandler(inputInfo)
		}
		this.isMouseLeftDwon = false
		OutProfileMessage.dispatchInputsChangeMessage(inputInfo)
		this.handler(handlerAction)
	}

	public mouseMiddleUpHandler(inputInfo: InputInfo): void {
		this.prepare(inputInfo)
		const handlerAction = (nextTool: Tool<InputInfo>): void => {
			nextTool.mouseMiddleUpHandler(inputInfo)
		}
		this.isMouseMiddleDwon = false
		OutProfileMessage.dispatchInputsChangeMessage(inputInfo)
		this.handler(handlerAction)
	}

	public mouseRightUpHandler(inputInfo: InputInfo): void {
		this.prepare(inputInfo)
		const handlerAction = (nextTool: Tool<InputInfo>): void => {
			nextTool.mouseRightUpHandler(inputInfo)
		}
		this.isMouseRightDwon = false
		OutProfileMessage.dispatchInputsChangeMessage(inputInfo)
		this.handler(handlerAction)
	}

	public mouseWheelHandler(inputInfo: InputInfo): void {
		this.prepare(inputInfo)
		if (inputInfo.altKey) {
			if (Constant.systemConfig.interactive.enableCanvasTranslate) {
				this.horizontalScrollCanvas(inputInfo)
			}
		} else if (inputInfo.ctrlKey) {
			if (Constant.systemConfig.interactive.enableCanvasTranslate) {
				this.verticalScrollCanvas(inputInfo)
			}
		} else {
			if (Constant.systemConfig.interactive.enableCanvasZoomChange) {
				this.zoomCanvas(inputInfo)
			}
		}
		const handlerAction = (nextTool: Tool<InputInfo>): void => {
			nextTool.mouseWheelHandler(inputInfo)
		}
		OutProfileMessage.dispatchInputsChangeMessage(inputInfo)
		this.handler(handlerAction)
	}

	public mouseLeaveHandler(inputInfo: InputInfo): void {
		this.prepare(inputInfo)
		const handlerAction = (nextTool: Tool<InputInfo>): void => {
			nextTool.mouseLeaveHandler(inputInfo)
		}
		OutProfileMessage.dispatchInputsChangeMessage(inputInfo)
		this.handler(handlerAction)
	}

	public mouseEnterHandler(inputInfo: InputInfo): void {
		this.prepare(inputInfo)
		const handlerAction = (nextTool: Tool<InputInfo>): void => {
			nextTool.mouseEnterHandler(inputInfo)
		}
		OutProfileMessage.dispatchInputsChangeMessage(inputInfo)
		this.handler(handlerAction)
	}

	public quit(): void {
		super.quit()
	}

	protected zoomCanvas(inputInfo: InputInfo, setDelta?: number): void {
		const delta: number = setDelta || inputInfo.deltaSourceNativePixelY
		let scale: number = 1
		if (delta < 0) {
			scale = MOUSE_WHEEL_ZOOM_RATIO
		} else {
			scale = 1 / MOUSE_WHEEL_ZOOM_RATIO
		}
		Constant.canvasController.setZoomCanvasBySourceNativePixelPosition(
			scale * this.camera.getZoomRatio(),
			new Vector3(inputInfo.moveSourceNativePixelX, -inputInfo.moveSourceNativePixelY, 0)
		)
		Constant.messageTool.messageBus.publish(EFrameCommand.RENDER_FRAME, null)
		OutProfileMessage.dispatchCanvasProfileChangeMessage()
	}

	private verticalScrollCanvas(inputInfo: InputInfo): void {
		const delta: number = inputInfo.deltaSourceNativePixelY
		let scrollDist: number = 1
		if (delta < 0) {
			scrollDist = MOUSE_WHEEL_SCROLL_DIST
		} else {
			scrollDist = -MOUSE_WHEEL_SCROLL_DIST
		}
		const cameraZoomRatio: number = this.camera.getZoomRatio()
		this.camera.setMoveIncrement(new Vector3(0, -scrollDist / cameraZoomRatio, 0))
		Constant.messageTool.messageBus.publish(EFrameCommand.RENDER_FRAME, null)
		OutProfileMessage.dispatchCanvasProfileChangeMessage()
	}

	private horizontalScrollCanvas(inputInfo: InputInfo): void {
		const delta: number = inputInfo.deltaSourceNativePixelY
		let scrollDist: number = 1
		if (delta < 0) {
			scrollDist = MOUSE_WHEEL_SCROLL_DIST
		} else {
			scrollDist = -MOUSE_WHEEL_SCROLL_DIST
		}
		const cameraZoomRatio: number = this.camera.getZoomRatio()
		this.camera.setMoveIncrement(new Vector3(scrollDist / cameraZoomRatio, 0, 0))
		Constant.messageTool.messageBus.publish(EFrameCommand.RENDER_FRAME, null)
		OutProfileMessage.dispatchCanvasProfileChangeMessage()
	}

	private prepare(inputInfo: InputInfo): void {}
}
