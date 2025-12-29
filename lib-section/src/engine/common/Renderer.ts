import { ECoreRenderMode } from '../config/CommonProfile'
import { Vector3 } from '../algorithm/geometry/vector/Vector3'
import { BaseInterface } from './BaseInterface'

/**
 * 渲染器 基类
 */
export abstract class Renderer extends BaseInterface {
	private _canvasElement: HTMLCanvasElement
	private _ctx: CanvasRenderingContext2D
	private _gl: WebGL2RenderingContext
	private _width: number
	private _height: number
	private _origin: Vector3
	private _mode: ECoreRenderMode
	constructor(canvasElement: HTMLCanvasElement) {
		super()
		this._canvasElement = canvasElement
		this._ctx = null!
		this._gl = null!
		this._width = 0
		this._height = 0
		this._origin = Vector3.ORIGIN
		this._mode = ECoreRenderMode.D2
	}

	public get ctx(): CanvasRenderingContext2D {
		return this._ctx
	}
	public set ctx(value: CanvasRenderingContext2D) {
		this._ctx = value
	}

	public get gl(): WebGL2RenderingContext {
		return this._gl
	}
	public set gl(value: WebGL2RenderingContext) {
		this._gl = value
	}

	public get canvasElement(): HTMLCanvasElement {
		return this._canvasElement
	}

	public get width(): number {
		return this._width
	}

	public get height(): number {
		return this._height
	}

	public get origin(): Vector3 {
		return this._origin
	}
	public set origin(value: Vector3) {
		this._origin = value
	}

	public get mode(): ECoreRenderMode {
		return this._mode
	}
	public set mode(value: ECoreRenderMode) {
		this._mode = value
	}

	public updateRect(width: number, height: number): void {
		this._width = width
		this._height = height
	}

	public updateOrigin(origin: Vector3): void {
		this._origin = origin
	}

	public quit(): void {
		this._canvasElement = undefined!
		this._ctx = undefined!
		this._gl = undefined!
	}

	public abstract clearCanvas(): void

	public abstract setRenderMode(mode: ECoreRenderMode): void
}
