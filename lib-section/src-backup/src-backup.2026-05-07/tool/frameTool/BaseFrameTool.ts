import { Camera } from '../../engine/common/Camera'
import { BaseAuxiliary } from '../auxiliary/BaseAuxiliary'
import { InputInfo } from '../InputInfo'
import { Tool } from '../Tool'

export abstract class BaseFrameTool extends Tool<InputInfo> {
	private _camera: Camera
	private _isMouseRightDwon: boolean
	private _isMouseMiddleDwon: boolean
	private _isMouseLeftDwon: boolean
	private _mouseRightPrevSourceNativePixelX: number
	private _mouseRightPrevSourceNativePixelY: number
	private _mouseMiddlePrevSourceNativePixelX: number
	private _mouseMiddlePrevSourceNativePixelY: number
	private _mouseLeftPrevSourceNativePixelX: number
	private _mouseLeftPrevSourceNativePixelY: number
	private _auxiliaryTool: BaseAuxiliary
	constructor() {
		super()
		this._camera = Camera.getInstance()
		this._isMouseRightDwon = false
		this._isMouseMiddleDwon = false
		this._isMouseLeftDwon = false
		this._mouseRightPrevSourceNativePixelX = 0
		this._mouseRightPrevSourceNativePixelY = 0
		this._mouseMiddlePrevSourceNativePixelX = 0
		this._mouseMiddlePrevSourceNativePixelY = 0
		this._mouseLeftPrevSourceNativePixelX = 0
		this._mouseLeftPrevSourceNativePixelY = 0
		this._auxiliaryTool = null!
	}

	public get camera(): Camera {
		return this._camera
	}

	public get isMouseRightDwon(): boolean {
		return this._isMouseRightDwon
	}
	public set isMouseRightDwon(value: boolean) {
		this._isMouseRightDwon = value
	}

	public get isMouseMiddleDwon(): boolean {
		return this._isMouseMiddleDwon
	}
	public set isMouseMiddleDwon(value: boolean) {
		this._isMouseMiddleDwon = value
	}

	public get isMouseLeftDwon(): boolean {
		return this._isMouseLeftDwon
	}
	public set isMouseLeftDwon(value: boolean) {
		this._isMouseLeftDwon = value
	}

	public get mouseRightPrevSourceNativePixelX(): number {
		return this._mouseRightPrevSourceNativePixelX
	}
	public set mouseRightPrevSourceNativePixelX(value: number) {
		this._mouseRightPrevSourceNativePixelX = value
	}

	public get mouseRightPrevSourceNativePixelY(): number {
		return this._mouseRightPrevSourceNativePixelY
	}
	public set mouseRightPrevSourceNativePixelY(value: number) {
		this._mouseRightPrevSourceNativePixelY = value
	}

	public get mouseMiddlePrevSourceNativePixelX(): number {
		return this._mouseMiddlePrevSourceNativePixelX
	}
	public set mouseMiddlePrevSourceNativePixelX(value: number) {
		this._mouseMiddlePrevSourceNativePixelX = value
	}

	public get mouseMiddlePrevSourceNativePixelY(): number {
		return this._mouseMiddlePrevSourceNativePixelY
	}
	public set mouseMiddlePrevSourceNativePixelY(value: number) {
		this._mouseMiddlePrevSourceNativePixelY = value
	}

	public get mouseLeftPrevSourceNativePixelX(): number {
		return this._mouseLeftPrevSourceNativePixelX
	}
	public set mouseLeftPrevSourceNativePixelX(value: number) {
		this._mouseLeftPrevSourceNativePixelX = value
	}

	public get mouseLeftPrevSourceNativePixelY(): number {
		return this._mouseLeftPrevSourceNativePixelY
	}
	public set mouseLeftPrevSourceNativePixelY(value: number) {
		this._mouseLeftPrevSourceNativePixelY = value
	}

	public get auxiliaryTool(): BaseAuxiliary {
		return this._auxiliaryTool
	}
	public set auxiliaryTool(value: BaseAuxiliary) {
		this._auxiliaryTool = value
	}

	public quit(): void {
		this._camera = undefined!
	}

	protected abstract zoomCanvas(inputInfo: InputInfo, setDelta?: number): void
}
