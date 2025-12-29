import { Vector3 } from '../../../algorithm/geometry/vector/Vector3'
import { Camera } from '../../../common/Camera'
import { D2AnyTestShaderGL } from './D2AnyTestShaderGL'
import { ProgramGL } from '../../program/ProgramGL'
import { WebGL } from '../../WebGL'
import { SceneGL } from '../../SceneGL'

const VERTEX_SIZE: number = 3
const COLOR_SIZE: number = 4

export class D2AnyTestProgramGL extends ProgramGL {
	private _posData: Array<number>
	private _posWebGLBuffer: WebGLBuffer
	private _colorData: Array<number>
	private _coloWebGLBuffer: WebGLBuffer
	private _viewWidth: number
	private _viewHeight: number
	private _origin: Vector3
	private readonly _a_objPosition: number
	private readonly _a_color: number
	private readonly _u_matrix: WebGLUniformLocation
	constructor(webGL: WebGL) {
		super(webGL, D2AnyTestShaderGL.createVS(), D2AnyTestShaderGL.createFS())
		this._viewWidth = 0
		this._viewHeight = 0
		this._a_objPosition = this.getWebGLAttributeLocation(`a_objPosition`)
		this._a_color = this.getWebGLAttributeLocation(`a_color`)
		this._u_matrix = null!
		// this._u_matrix = this.getWebGLUniformLocation(`u_matrix`)
		this._origin = Vector3.ORIGIN
		this._posData = []
		this._posWebGLBuffer = this.webGL.createWebGLArrayBufferByBuffer(new Float32Array(this._posData), this.webGL.gl.STATIC_DRAW)
		this._colorData = []
		this._coloWebGLBuffer = this.webGL.createWebGLArrayBufferByBuffer(new Float32Array(this._colorData), this.webGL.gl.STATIC_DRAW)
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
		gl.useProgram(this.webGLProgram)
		gl.enableVertexAttribArray(this._a_objPosition)
		gl.enableVertexAttribArray(this._a_color)
		this.setUniformData(scene)
		gl.bindBuffer(gl.ARRAY_BUFFER, this._posWebGLBuffer)
		gl.vertexAttribPointer(this._a_objPosition, VERTEX_SIZE, gl.FLOAT, false, 0, 0)
		gl.bindBuffer(gl.ARRAY_BUFFER, this._coloWebGLBuffer)
		gl.vertexAttribPointer(this._a_color, COLOR_SIZE, gl.FLOAT, false, 0, 0)
		gl.drawArrays(gl.TRIANGLES, 0, this._posData.length / VERTEX_SIZE)
		gl.disableVertexAttribArray(this._a_objPosition)
	}

	private flush(): void {
		const gl: WebGL2RenderingContext = this.webGL.gl
		/* ... */
		gl.bindBuffer(gl.ARRAY_BUFFER, this._posWebGLBuffer)
		// prettier-ignore
		this._posData = [
			-0.5, +0.5, 1.0,
			-0.5, -0.5, 1.0,
			+0.5, -0.5, 1.0,
			-0.5, +0.5, 1.0,
			+0.5, -0.5, 1.0,
			+0.5, +0.5, 1.0
		]
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this._posData), gl.STATIC_DRAW)
		gl.bindBuffer(gl.ARRAY_BUFFER, null)
		/* ... */
		gl.bindBuffer(gl.ARRAY_BUFFER, this._coloWebGLBuffer)
		// prettier-ignore
		this._colorData = [
			0.1, 0.0, 0.0, 1.0,
			0.4, 0.0, 0.0, 1.0,
			0.7, 0.0, 0.0, 1.0,
			0.0, 1.0, 0.0, 1.0,
			0.0, 1.0, 0.0, 1.0,
			0.0, 1.0, 0.0, 1.0,
		]
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this._colorData), gl.STATIC_DRAW)
		gl.bindBuffer(gl.ARRAY_BUFFER, null)
	}

	private setUniformData(scene: SceneGL): void {
		const camera: Camera = scene.camera
		const gl: WebGL2RenderingContext = this.webGL.gl
		gl.uniformMatrix4fv(this._u_matrix, false, new Float32Array(camera.getViewMatrix4().data))
	}
}
