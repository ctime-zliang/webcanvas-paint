import { Matrix4 } from '../../../algorithm/geometry/matrix/Matrix4'
import { D2AxisShaderGL } from './D2AxisShaderGL'
import { Vector3 } from '../../../algorithm/geometry/vector/Vector3'
import { AxisParam } from '../../../common/AxisParam'
import { Camera } from '../../../common/Camera'
import { Vector2 } from '../../../algorithm/geometry/vector/Vector2'
import { CanvasMatrix4 } from '../../../algorithm/geometry/matrix/CanvasMatrix4'
import { ProgramGL } from '../../program/ProgramGL'
import { WebGL } from '../../WebGL'
import { SceneGL } from '../../SceneGL'

const VERTEX_SIZE: number = 3

export class D2AxisProgramGL extends ProgramGL {
	private _axisParamInstance: AxisParam
	private _linePosData: Array<number>
	private _linePosWebGLBuffer: WebGLBuffer
	private _dotPosData: Array<number>
	private _dotPosWebGLBuffer: WebGLBuffer
	private _viewWidth: number
	private _viewHeight: number
	private _ratio: number
	private _origin: Vector2
	private readonly _a_objPosition: number
	private readonly _u_antialias: WebGLUniformLocation
	private readonly _u_matrix: WebGLUniformLocation
	private readonly _u_gridSize: WebGLUniformLocation
	private readonly _u_moveCount: WebGLUniformLocation
	private readonly _u_origin: WebGLUniformLocation
	private readonly _u_gridColor: WebGLUniformLocation
	private readonly _u_multiGridColor: WebGLUniformLocation
	private readonly _u_gridDotColor: WebGLUniformLocation
	private readonly _u_axisColor: WebGLUniformLocation
	private readonly _u_multiRatio: WebGLUniformLocation
	private readonly _u_drawType: WebGLUniformLocation
	private readonly _u_isShowGrid: WebGLUniformLocation
	private readonly _u_isShowMultiGrid: WebGLUniformLocation
	private readonly _u_isShowGridDot: WebGLUniformLocation
	private readonly _u_isShowAxis: WebGLUniformLocation
	constructor(webGL: WebGL) {
		super(webGL, D2AxisShaderGL.createVS(), D2AxisShaderGL.createFS())
		this._axisParamInstance = AxisParam.getInstance()
		this._a_objPosition = this.getWebGLAttributeLocation(`a_objPosition`)
		this._u_antialias = this.getWebGLUniformLocation(`u_antialias`)
		this._u_matrix = this.getWebGLUniformLocation(`u_matrix`)
		this._u_gridSize = this.getWebGLUniformLocation(`u_gridSize`)
		this._u_moveCount = this.getWebGLUniformLocation(`u_moveCount`)
		this._u_origin = this.getWebGLUniformLocation(`u_origin`)
		this._u_gridColor = this.getWebGLUniformLocation(`u_gridColor`)
		this._u_multiGridColor = this.getWebGLUniformLocation(`u_multiGridColor`)
		this._u_gridDotColor = this.getWebGLUniformLocation(`u_gridDotColor`)
		this._u_axisColor = this.getWebGLUniformLocation(`u_axisColor`)
		this._u_multiRatio = this.getWebGLUniformLocation(`u_multiRatio`)
		this._u_drawType = this.getWebGLUniformLocation(`u_drawType`)
		this._u_isShowGrid = this.getWebGLUniformLocation(`u_isShowGrid`)
		this._u_isShowMultiGrid = this.getWebGLUniformLocation(`u_isShowMultiGrid`)
		this._u_isShowGridDot = this.getWebGLUniformLocation(`u_isShowGridDot`)
		this._u_isShowAxis = this.getWebGLUniformLocation(`u_isShowAxis`)
		this._viewWidth = 0
		this._viewHeight = 0
		this._ratio = 1.0
		this._origin = Vector2.ORIGIN
		this._linePosData = []
		this._dotPosData = []
		this._linePosWebGLBuffer = this.webGL.createWebGLArrayBufferByBuffer(new Float32Array(this._linePosData), this.webGL.gl.STATIC_DRAW)
		this._dotPosWebGLBuffer = this.webGL.createWebGLArrayBufferByBuffer(new Float32Array(this._dotPosData), this.webGL.gl.STATIC_DRAW)
		this.flush()
	}

	public setEnableColor(): void {}

	public setDisableColor(): void {}

	public updateCanvasRect(canvasWidth: number, canvasHeight: number): void {
		this._viewWidth = canvasWidth
		this._viewHeight = canvasHeight
		this.flush()
	}

	public render(scene: SceneGL): void {
		const gl: WebGL2RenderingContext = this.webGL.gl
		gl.useProgram(this.webGLProgram)
		gl.enableVertexAttribArray(this._a_objPosition)
		this.setUniformData(scene)
		this.drawLines()
		this.drawDots()
		gl.disableVertexAttribArray(this._a_objPosition)
	}

	private flush(): void {
		const gl: WebGL2RenderingContext = this.webGL.gl
		/* ... */
		gl.bindBuffer(gl.ARRAY_BUFFER, this._linePosWebGLBuffer)
		this._linePosData = D2AxisShaderGL.createLinePositionsData(this._viewWidth, this._viewHeight)
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this._linePosData), gl.STATIC_DRAW)
		gl.bindBuffer(gl.ARRAY_BUFFER, null)
		/* ... */
		gl.bindBuffer(gl.ARRAY_BUFFER, this._dotPosWebGLBuffer)
		this._dotPosData = D2AxisShaderGL.createDotPositionsData(this._viewWidth, this._viewHeight)
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this._dotPosData), gl.STATIC_DRAW)
		gl.bindBuffer(gl.ARRAY_BUFFER, null)
	}

	private calcTransform(scene: SceneGL): {
		matrix: Matrix4
		moveCountX: number
		moveCountY: number
	} {
		const axisParamOrigin: Vector2 = this._axisParamInstance.origin
		const camera: Camera = scene.camera
		const camraProjectionMatrix4: Matrix4 = camera.getRectProjectionMatrix4()
		const minPixel: number = 20
		const maxPixel: number = 30
		const scale: number = camera.getZoomRatio()
		const min: number = Math.min(this._axisParamInstance.axisStepX, this._axisParamInstance.axisStepY)
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
		const baseMatrix4: Matrix4 = CanvasMatrix4.setScaleByValue(this._ratio, this._ratio, 1.0)
			.multiply4(CanvasMatrix4.setTranslateByVector3(new Vector3(axisParamOrigin.x, axisParamOrigin.y, 0)))
			.multiply4(camera.getLookMatrix4().multiply4(camera.getZoomMatrix4()))
		const scaleRatio: number = this._ratio * scale
		const baseOrigin: Vector2 = Vector2.ORIGIN.multiplyMatrix4(baseMatrix4)
		const distX: number = baseOrigin.x - (baseOrigin.x % (this._axisParamInstance.axisStepX * scaleRatio))
		const distY: number = baseOrigin.y - (baseOrigin.y % (this._axisParamInstance.axisStepY * scaleRatio))
		this._origin = baseOrigin.multiplyMatrix4(camraProjectionMatrix4)
		const transform: Matrix4 = baseMatrix4
			.multiply4(CanvasMatrix4.setTranslateByVector3(new Vector3(-distX, -distY, 0)))
			.multiply4(camraProjectionMatrix4)
		const axisStepTransform: Vector2 = new Vector2(this._axisParamInstance.axisStepX, this._axisParamInstance.axisStepY).multiplyMatrix4(
			CanvasMatrix4.setScaleByValue(this._ratio, this._ratio, 1.0)
				.multiply4(CanvasMatrix4.setScaleByValue(scale, scale, 1.0))
				.multiply4(camraProjectionMatrix4)
		)
		return {
			matrix: transform,
			moveCountX: this._origin.x >= 0 ? Math.floor(this._origin.x / axisStepTransform.x) : Math.ceil(this._origin.x / axisStepTransform.x),
			moveCountY: this._origin.y >= 0 ? Math.floor(this._origin.y / axisStepTransform.y) : Math.ceil(this._origin.y / axisStepTransform.y),
		}
	}

	private setUniformData(scene: SceneGL): void {
		const gl: WebGL2RenderingContext = this.webGL.gl
		const { matrix, moveCountX, moveCountY } = this.calcTransform(scene)
		/* ... */
		gl.uniform2fv(
			this._u_antialias,
			new Float32Array([this._axisParamInstance.isAntialias ? 1.5 : 0.5, this._axisParamInstance.isAntialias ? 0.0 : 1.0])
		)
		gl.uniform2fv(this._u_gridSize, new Float32Array([this._axisParamInstance.axisStepX, this._axisParamInstance.axisStepY]))
		gl.uniform2fv(this._u_moveCount, new Float32Array([moveCountX, moveCountY]))
		gl.uniform2fv(this._u_origin, new Float32Array([this._origin.x, this._origin.y]))
		gl.uniform4fv(
			this._u_gridColor,
			new Float32Array([
				this._axisParamInstance.gridColor.r,
				this._axisParamInstance.gridColor.g,
				this._axisParamInstance.gridColor.b,
				this._axisParamInstance.gridAlpha,
			])
		)
		gl.uniform4fv(
			this._u_multiGridColor,
			new Float32Array([
				this._axisParamInstance.multiGridColor.r,
				this._axisParamInstance.multiGridColor.g,
				this._axisParamInstance.multiGridColor.b,
				this._axisParamInstance.multiGridAlpha,
			])
		)
		gl.uniform4fv(
			this._u_gridDotColor,
			new Float32Array([
				this._axisParamInstance.gridDotColor.r,
				this._axisParamInstance.gridDotColor.g,
				this._axisParamInstance.gridDotColor.b,
				this._axisParamInstance.gridDotAlpha,
			])
		)
		gl.uniform4fv(
			this._u_axisColor,
			new Float32Array([
				this._axisParamInstance.axisColor.r,
				this._axisParamInstance.axisColor.g,
				this._axisParamInstance.axisColor.b,
				this._axisParamInstance.axisAlpha,
			])
		)
		gl.uniform1f(this._u_multiRatio, this._axisParamInstance.multiRatio)
		gl.uniform1f(this._u_isShowGrid, this._axisParamInstance.isShowGrid ? 1.0 : 0.0)
		gl.uniform1f(this._u_isShowMultiGrid, this._axisParamInstance.isShowMultiGrid ? 1.0 : 0.0)
		gl.uniform1f(this._u_isShowAxis, this._axisParamInstance.isShowAxis ? 1.0 : 0.0)
		gl.uniform1f(this._u_isShowGridDot, this._axisParamInstance.isShowGridDot ? 1.0 : 0.0)
		gl.uniformMatrix4fv(this._u_matrix, false, new Float32Array(matrix.data))
	}

	private drawLines(): void {
		const gl: WebGL2RenderingContext = this.webGL.gl
		gl.uniform1f(this._u_drawType, 1.0)
		gl.bindBuffer(gl.ARRAY_BUFFER, this._linePosWebGLBuffer)
		gl.vertexAttribPointer(this._a_objPosition, VERTEX_SIZE, gl.FLOAT, false, 0, 0)
		gl.drawArrays(gl.LINES, 0, this._linePosData.length / VERTEX_SIZE)
	}

	private drawDots(): void {
		const gl: WebGL2RenderingContext = this.webGL.gl
		if (!this._axisParamInstance.isShowGridDot) {
			return
		}
		gl.uniform1f(this._u_drawType, 2.0)
		gl.bindBuffer(gl.ARRAY_BUFFER, this._dotPosWebGLBuffer)
		gl.vertexAttribPointer(this._a_objPosition, VERTEX_SIZE, gl.FLOAT, false, 0, 0)
		gl.drawArrays(gl.POINTS, 0, this._dotPosData.length / VERTEX_SIZE)
	}
}
