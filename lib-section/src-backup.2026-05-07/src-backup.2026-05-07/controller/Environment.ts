import { EFrameCommand } from '../config/CommandEnum'
import { Camera, EProjectionType } from '../engine/common/Camera'
import { Vector3 } from '../engine/algorithm/geometry/vector/Vector3'
import { ECoreRenderMode } from '../engine/config/CommonProfile'
import { Launcher } from '../init/Launcher'
import { BaseInterface } from './BaseInterface'
import { Constant } from '../Constant'
import { OutProfileMessage } from '../utils/OutMessage'

export class Environment extends BaseInterface {
	private _isQuit: boolean
	private _launcher: Launcher
	private _canvasElement: HTMLCanvasElement
	private _origin: Vector3
	private _canvasWidth: number
	private _canvasHeight: number
	private _canvasLeft: number
	private _canvasTop: number
	constructor() {
		super()
		this._isQuit = true
		this._launcher = null!
		this._canvasElement = null!
		this._origin = new Vector3(0, 0, 1)
		this._canvasHeight = 0
		this._canvasWidth = 0
		this._canvasLeft = 0
		this._canvasTop = 0
	}

	public get isQuit(): boolean {
		return this._isQuit
	}
	public set isQuit(value: boolean) {
		this._isQuit = value
	}

	public get launcher(): Launcher {
		return this._launcher
	}

	public get origin(): Vector3 {
		return this._origin
	}
	public set origin(value: Vector3) {
		this._origin = value
	}

	public get canvasWidth(): number {
		return this._canvasWidth
	}
	public set canvasWidth(value: number) {
		this._canvasWidth = value
	}

	public get canvasHeight(): number {
		return this._canvasHeight
	}
	public set canvasHeight(value: number) {
		this._canvasHeight = value
	}

	public get canvasLeft(): number {
		return this._canvasLeft
	}
	public set canvasLeft(value: number) {
		this._canvasLeft = value
	}

	public get canvasTop(): number {
		return this._canvasTop
	}
	public set canvasTop(value: number) {
		this._canvasTop = value
	}

	public init(canvasElement: HTMLCanvasElement): void {
		this._canvasElement = canvasElement
		this._launcher = new Launcher()
		this._launcher.init(this._canvasElement)
	}

	public setRenderMode(mode: ECoreRenderMode): void {
		if (mode === ECoreRenderMode.D2) {
			Camera.getInstance().setProjectionType(EProjectionType.ORTH)
			this._launcher.scene.renderer.setRenderMode(mode)
			return
		}
		if (mode === ECoreRenderMode.D3) {
			Camera.getInstance().setProjectionType(EProjectionType.ORTH)
			this._launcher.scene.renderer.setRenderMode(mode)
			return
		}
		throw new Error(`the preset rendering mode parameters are incorrect: ${mode}.`)
	}

	/**
	 * 更新/设置画布尺寸
	 */
	public updateCanvasRectSize(canvasWidth: number, canvasHeight: number, canvasLeft: number, canvasTop: number): void {
		this._canvasElement.width = canvasWidth
		this._canvasElement.height = canvasHeight
		this._canvasWidth = canvasWidth
		this._canvasHeight = canvasHeight
		this._canvasLeft = canvasLeft
		this._canvasTop = canvasTop
		/**
		 * 设置 Canvas 的原点为当前画布区域的几何中心
		 */
		this.origin = new Vector3(canvasWidth / 2, -canvasHeight / 2, 0)
		/**
		 * 更新 Camera 尺寸
		 */
		Camera.getInstance().updateRect(canvasWidth, canvasHeight)
		/* ... */
		this._launcher.scene.updateCanvasRect(this.canvasWidth, this.canvasHeight)
		this._launcher.scene.updateCanvasOrigin(new Vector3(this.origin.x, this.origin.y, this.origin.z))
		Constant.messageTool.messageBus.publish(EFrameCommand.RENDER_FRAME, null)
		/* ... */
		OutProfileMessage.dispatchCanvasProfileChangeMessage()
	}

	/**
	 * 设置画布上的鼠标样式
	 */
	public updateCanvasMouseCursor(cursor: string): void {
		this._canvasElement.style.cursor = cursor
	}

	public quit(): void {
		this._launcher.quit()
		this._launcher = undefined!
		this._canvasElement = undefined!
		this._origin = undefined!
	}
}
