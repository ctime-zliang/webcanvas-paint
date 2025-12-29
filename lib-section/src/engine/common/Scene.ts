import { Camera } from './Camera'
import { Vector3 } from '../algorithm/geometry/vector/Vector3'
import { Renderer } from './Renderer'
import { Color } from './Color'
import { BaseInterface } from './BaseInterface'

/**
 * 场景控制器 基类
 */
export abstract class Scene extends BaseInterface {
	private _canvasElement: HTMLCanvasElement
	private _renderer: Renderer
	private _canvasBackgroundColor: Color
	private _camera: Camera
	constructor(canvasElement: HTMLCanvasElement) {
		super()
		this._canvasElement = canvasElement
		this._renderer = null!
		this._canvasBackgroundColor = new Color(0, 0, 0, 1)
		this._camera = null!
		this.updateCanvasStyle()
	}

	public get renderer(): Renderer {
		return this._renderer
	}
	public set renderer(value: Renderer) {
		this._renderer = value
	}

	public get canvasBackgroundColor(): Color {
		return this._canvasBackgroundColor
	}
	public set canvasBackgroundColor(value: Color) {
		this._canvasBackgroundColor = value
		this.updateCanvasStyle()
	}

	public get camera(): Camera {
		return this._camera
	}
	public set camera(value: Camera) {
		this._camera = value
	}

	public quit(): void {
		this._canvasElement = undefined!
		this._renderer = undefined!
		this._camera = undefined!
	}

	public updateCanvasStyle(): void {
		this._canvasElement.style.backgroundColor = Color.rgba2Hex(this.canvasBackgroundColor)
	}

	public abstract getWebGLTexture(imageSource: TexImageSource): WebGLTexture

	public abstract updateCanvasRect(width: number, height: number): any

	public abstract updateCanvasOrigin(origin: Vector3): any

	public abstract addControlPlaneItem(...args: any): any

	public abstract addContentPlaneItem(...args: any): any

	public abstract deleteControlPlaneItem(...args: any): any

	public abstract deleteContentPlaneItem(...args: any): any

	public abstract render(...args: any): any
}
