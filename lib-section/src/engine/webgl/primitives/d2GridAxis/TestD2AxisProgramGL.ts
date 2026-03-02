import { Vector3 } from '../../../algorithm/geometry/vector/Vector3'
import { AxisParam } from '../../../common/AxisParam'
import { Camera } from '../../../common/Camera'
import { Vector2 } from '../../../algorithm/geometry/vector/Vector2'
import { CanvasMatrix4 } from '../../../algorithm/geometry/matrix/CanvasMatrix4'
import { TestD2AxisShaderGL } from './TestD2AxisShaderGL'
import { fillLineHorizontal, fillLineVertical } from './Utils'
import { ProgramGL } from '../../program/ProgramGL'
import { WebGL } from '../../WebGL'
import { SceneGL } from '../../SceneGL'
import { Matrix4 } from '../../../algorithm/geometry/matrix/Matrix4'

const VERTEX_SIZE: number = 3

export class TestD2AxisProgramGL extends ProgramGL {
	private _linePosData: Array<number>
	private _linePosWebGLBuffer: WebGLBuffer
	private _viewWidth: number
	private _viewHeight: number
	private _origin: Vector3
	private _ratio: number
	private readonly _a_objPosition: number
	private readonly _u_matrix: WebGLUniformLocation
	private readonly _u_origin: WebGLUniformLocation
	private readonly _u_deltaSize: WebGLUniformLocation
	private readonly _u_multiRatio: WebGLUniformLocation
	constructor(webGL: WebGL) {
		super(webGL, TestD2AxisShaderGL.createVS(), TestD2AxisShaderGL.createFS())
		this._viewWidth = 0
		this._viewHeight = 0
		this._a_objPosition = this.getWebGLAttributeLocation(`a_objPosition`)
		this._u_matrix = this.getWebGLUniformLocation(`u_matrix`)
		this._u_origin = this.getWebGLUniformLocation(`u_origin`)
		this._u_deltaSize = this.getWebGLUniformLocation(`u_deltaSize`)
		this._u_multiRatio = this.getWebGLUniformLocation(`u_multiRatio`)
		this._origin = Vector3.ORIGIN
		this._ratio = 1.0
		this._linePosData = []
		this._linePosWebGLBuffer = this.webGL.createWebGLArrayBufferByBuffer(new Float32Array(this._linePosData), this.webGL.gl.STATIC_DRAW)
		this.flush()
	}

	public updateCanvasRect(canvasWidth: number, canvasHeight: number): void {
		this._viewWidth = canvasWidth
		this._viewHeight = canvasHeight
		this.flush()
	}

	public render(scene: SceneGL): void {
		return
		const gl: WebGL2RenderingContext = this.webGL.gl
		const axisParam: AxisParam = AxisParam.getInstance()
		gl.useProgram(this.webGLProgram)
		gl.enableVertexAttribArray(this._a_objPosition)
		this.setUniformData(scene)
		gl.bindBuffer(gl.ARRAY_BUFFER, this._linePosWebGLBuffer)
		gl.vertexAttribPointer(this._a_objPosition, VERTEX_SIZE, gl.FLOAT, false, 0, 0)
		gl.drawArrays(gl.LINES, 0, this._linePosData.length / VERTEX_SIZE)
		gl.disableVertexAttribArray(this._a_objPosition)
	}

	private flush(): void {
		const gl: WebGL2RenderingContext = this.webGL.gl
		/* ... */
		gl.bindBuffer(gl.ARRAY_BUFFER, this._linePosWebGLBuffer)
		// prettier-ignore
		const v: Array<number> = [
			-3.0, +5, 0,   -3.0, -5, 0,
			-2.5, +5, 0,   -2.5, -5, 0,
			-2.0, +5, 0,   -2.0, -5, 0,
			-1.5, +5, 0,   -1.5, -5, 0,
			-1.0, +5, 0,   -1.0, -5, 0,
			-0.5, +5, 0,   -0.5, -5, 0,
			+0.0, +5, 0,   +0.0, -5, 0,
			+0.5, +5, 0,   +0.5, -5, 0,
			+1.0, +5, 0,   +1.0, -5, 0,
			+1.5, +5, 0,   +1.5, -5, 0,
			+2.0, +5, 0,   +2.0, -5, 0,
			+2.5, +5, 0,   +2.5, -5, 0,
			+3.0, +5, 0,   +3.0, -5, 0,
		]
		// prettier-ignore
		const h: Array<number> = [
			-5, -3.0, 1, +5, -3.0, 1, 
			-5, -2.5, 1, +5, -2.5, 1, 
			-5, -2.0, 1, +5, -2.0, 1, 
			-5, -1.5, 1, +5, -1.5, 1, 
			-5, -1.0, 1, +5, -1.0, 1, 
			-5,	-0.5, 1, +5, -0.5, 1, 
			-5, +0.0, 1, +5, +0.0, 1, 
			-5, +0.5, 1, +5, +0.5, 1, 
			-5, +1.0, 1, +5, +1.0, 1, 
			-5, +1.5, 1, +5, +1.5, 1,
			-5, +2.0, 1, +5, +2.0, 1, 
			-5, +2.5, 1, +5, +2.5, 1, 
			-5, +3.0, 1, +5, +3.0, 1,
		]
		this._linePosData = [...v, ...h]
		// this._linePosData = this.createLinePositionsData()
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this._linePosData), gl.STATIC_DRAW)
		gl.bindBuffer(gl.ARRAY_BUFFER, null)
	}

	private autoScale(scene: SceneGL) {
		const axisParam: AxisParam = AxisParam.getInstance()
		const axisParamOrigin: Vector2 = axisParam.origin
		const camera: Camera = scene.camera
		const minPixel: number = 25
		const maxPixel: number = 30
		const scale: number = camera.getZoomRatio()
		const min: number = Math.min(axisParam.axisStepX, axisParam.axisStepY)
		const pixel: number = min * scale * this._ratio
		if (pixel < minPixel) {
			this._ratio = maxPixel / (min * scale)
		}
		if (this._ratio > 1 && pixel > maxPixel) {
			this._ratio = minPixel / (min * scale)
		}
		if (this._ratio < 1) {
			this._ratio = 1
		}
		const c: Matrix4 = CanvasMatrix4.setScaleByValue(this._ratio, this._ratio, 1.0)
			.multiply4(CanvasMatrix4.setTranslateByVector3(new Vector3(axisParamOrigin.x, axisParamOrigin.y, 0)))
			.multiply4(camera.getLookMatrix4().multiply4(CanvasMatrix4.setScaleByValue(scale, scale, 1.0)))
		const c2: Matrix4 = CanvasMatrix4.setScaleByValue(this._ratio, this._ratio, 1.0).multiply4(CanvasMatrix4.setScaleByValue(scale, scale, 1.0))
		const f: number = this._ratio * scale
		const h: Vector2 = Vector2.ORIGIN.multiplyMatrix4(c)
		const _: number = axisParam.axisStepX * f
		const d: number = axisParam.axisStepY * f
		const m: number = h.x - (h.x % _)
		const g: number = h.y - (h.y % d)
		const O: Matrix4 = camera.getRectProjectionMatrix4()
		const s: Vector2 = h.multiplyMatrix4(O)
		this._origin = new Vector3(s.x, s.y, 0.0)
		const x: Matrix4 = c.multiply4(CanvasMatrix4.setTranslateByVector3(new Vector3(-m, -g, 0))).multiply4(O)
		const LL = new Vector2(axisParam.axisStepX, axisParam.axisStepY).multiplyMatrix4(c2.multiply4(O))
		return {
			matrix: x,
			deltaX: this._origin.x >= 0 ? Math.floor(this._origin.x / LL.x) : Math.ceil(this._origin.x / LL.x),
			deltaY: this._origin.y >= 0 ? Math.floor(this._origin.y / LL.y) : Math.ceil(this._origin.y / LL.y),
		}
	}

	private setUniformData(scene: SceneGL): void {
		const camera: Camera = scene.camera
		const axisParam: AxisParam = AxisParam.getInstance()
		const gl: WebGL2RenderingContext = this.webGL.gl
		const { matrix, deltaX, deltaY } = this.autoScale(scene)
		gl.uniform2fv(this._u_origin, new Float32Array([this._origin.x, this._origin.y]))
		gl.uniformMatrix4fv(this._u_matrix, false, new Float32Array(matrix.data))
		gl.uniform2fv(this._u_deltaSize, new Float32Array([deltaX, deltaY]))
		gl.uniform1f(this._u_multiRatio, axisParam.multiRatio)
		// gl.uniformMatrix4fv(this._u_matrix, false, new Float32Array(camera.getViewMatrix4().data)
	}

	private createLinePositionsData(): Array<number> {
		const positionsData: Array<number> = []
		const ratio: number = 20
		const axisParam: AxisParam = AxisParam.getInstance()
		const width: number = (this._viewWidth / ratio) * axisParam.axisStepX * 4
		const height: number = (this._viewHeight / ratio) * axisParam.axisStepY * 4
		for (let x: number = 0; x < width; x += axisParam.axisStepX) {
			fillLineVertical(positionsData, x, height)
		}
		for (let x: number = -axisParam.axisStepX; x > -width; x -= axisParam.axisStepX) {
			fillLineVertical(positionsData, x, height)
		}
		for (let y: number = 0; y < height; y += axisParam.axisStepY) {
			fillLineHorizontal(positionsData, y, width)
		}
		for (let y: number = -axisParam.axisStepY; y > -height; y -= axisParam.axisStepY) {
			fillLineHorizontal(positionsData, y, width)
		}
		return positionsData
	}
}
