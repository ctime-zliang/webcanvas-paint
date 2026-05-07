import { Camera } from '../common/Camera'
import { Vector3 } from '../algorithm/geometry/vector/Vector3'
import { Scene } from '../common/Scene'
import { BitmapIndex } from '../common/BitmapIndex'
import { PlaneGL } from './PlaneGL'
import { D2AnyTestProgramGL } from './primitives/d2AnyTest/D2AnyTestProgramGL'
import { D2AxisProgramGL } from './primitives/d2GridAxis/D2AxisProgramGL'
import { TestD2AxisProgramGL } from './primitives/d2GridAxis/TestD2AxisProgramGL'
import { WebGL } from './WebGL'

export const MAX_PLANE_NUM: number = 1024

export class SceneGL extends Scene {
	private _indexMap: BitmapIndex
	private _webGL: WebGL
	private _contentPlanes: Map<number, PlaneGL>
	private _controlPlanes: Map<number, PlaneGL>
	private _d2AnyTestProgram: D2AnyTestProgramGL
	private _testD2AxisProgram: TestD2AxisProgramGL
	private _d2AxisProgram: D2AxisProgramGL
	private _textureMap: Map<TexImageSource, WebGLTexture>
	constructor(webGL: WebGL) {
		super(webGL.canvasElement)
		this.camera = Camera.getInstance()
		this._webGL = webGL
		this._indexMap = new BitmapIndex(MAX_PLANE_NUM)
		this._indexMap.markUsed(0)
		this._contentPlanes = new Map()
		this._controlPlanes = new Map()
		this._d2AnyTestProgram = new D2AnyTestProgramGL(this._webGL)
		this._testD2AxisProgram = new TestD2AxisProgramGL(this._webGL)
		this._d2AxisProgram = new D2AxisProgramGL(this._webGL)
		this._textureMap = new Map()
	}

	public get renderer(): WebGL {
		return this._webGL
	}

	public updateCanvasRect(canvasWidth: number, canvasHeight: number): void {
		this._webGL.updateRect(canvasWidth, canvasHeight)
		this._webGL.gl.viewport(0, 0, canvasWidth, canvasHeight)
		this._d2AnyTestProgram.updateCanvasRect(canvasWidth, canvasHeight)
		this._testD2AxisProgram.updateCanvasRect(canvasWidth, canvasHeight)
		this._d2AxisProgram.updateCanvasRect(canvasWidth, canvasHeight)
	}

	public updateCanvasOrigin(origin: Vector3): void {
		this._webGL.updateOrigin(origin)
	}

	public addControlPlaneItem(): PlaneGL {
		const planeId: number = this._indexMap.findEmpty(0)
		this._indexMap.markUsed(planeId)
		if (this._controlPlanes.has(planeId)) {
			return this._controlPlanes.get(planeId) as PlaneGL
		}
		const planeItem: PlaneGL = new PlaneGL(String(planeId), this)
		this._controlPlanes.set(planeId, planeItem)
		return planeItem
	}

	public addContentPlaneItem(): PlaneGL {
		const planeId: number = this._indexMap.findEmpty(0)
		this._indexMap.markUsed(planeId)
		if (this._contentPlanes.has(planeId)) {
			return this._contentPlanes.get(planeId) as PlaneGL
		}
		const planeItem: PlaneGL = new PlaneGL(String(planeId), this)
		this._contentPlanes.set(planeId, planeItem)
		return planeItem
	}

	public deleteControlPlaneItem(planeId: number): void {
		if (this._controlPlanes.has(planeId)) {
			this._controlPlanes.delete(planeId)
			return
		}
	}

	public deleteContentPlaneItem(planeId: number): void {
		if (this._contentPlanes.has(planeId)) {
			this._contentPlanes.delete(planeId)
			return
		}
	}

	public getWebGLTexture(texImageSource: TexImageSource): WebGLTexture {
		let texture: WebGLTexture = this._textureMap.get(texImageSource)!
		if (texture) {
			return texture
		}
		texture = this._webGL.createRGBATexture(
			texImageSource,
			this._webGL.gl.LINEAR,
			this._webGL.gl.LINEAR,
			this._webGL.gl.CLAMP_TO_EDGE,
			this._webGL.gl.CLAMP_TO_EDGE
		)
		this._textureMap.set(texImageSource, texture)
		return texture
	}

	public render(timeStamp: number): void {
		this._webGL.gl.clearColor(
			this.canvasBackgroundColor.r,
			this.canvasBackgroundColor.g,
			this.canvasBackgroundColor.b,
			this.canvasBackgroundColor.a
		)
		this._webGL.gl.clear(this._webGL.gl.COLOR_BUFFER_BIT | this._webGL.gl.DEPTH_BUFFER_BIT | this._webGL.gl.STENCIL_BUFFER_BIT)
		this._webGL.gl.viewport(0, 0, this._webGL.width, this._webGL.height)
		this._d2AnyTestProgram.render(this)
		this._testD2AxisProgram.render(this)
		this._d2AxisProgram.render(this)
		const allContentPlanes: Array<PlaneGL> = Array.from(this._contentPlanes.values())
		for (let i: number = 0; i < allContentPlanes.length; i++) {
			const planeItem: PlaneGL = allContentPlanes[i]
			planeItem.render()
		}
		const allControlPlanes: Array<PlaneGL> = Array.from(this._controlPlanes.values())
		for (let i: number = 0; i < allControlPlanes.length; i++) {
			const planeItem: PlaneGL = allControlPlanes[i]
			planeItem.render()
		}
	}

	public quit(): void {
		this._webGL = undefined!
		this._indexMap = undefined!
		const allContentPlanes: Array<PlaneGL> = Array.from(this._contentPlanes.values())
		for (let i: number = 0; i < allContentPlanes.length; i++) {
			const planeItem: PlaneGL = allContentPlanes[i]
			planeItem.quit()
		}
		const allControlPlanes: Array<PlaneGL> = Array.from(this._controlPlanes.values())
		for (let i: number = 0; i < allControlPlanes.length; i++) {
			const planeItem: PlaneGL = allControlPlanes[i]
			planeItem.quit()
		}
		this._contentPlanes.clear()
		this._contentPlanes = undefined!
		this._controlPlanes.clear()
		this._controlPlanes = undefined!
		this._d2AnyTestProgram = undefined!
		this._testD2AxisProgram = undefined!
		this._d2AxisProgram = undefined!
		this._textureMap.clear()
		this._textureMap = undefined!
		super.quit()
	}
}
