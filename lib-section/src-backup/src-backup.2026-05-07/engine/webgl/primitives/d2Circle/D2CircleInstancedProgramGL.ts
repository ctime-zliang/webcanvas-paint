import { WebGL } from '../../WebGL'
import { DataBufferGL, FLOAT_32_ARRAY_BYTESIZE } from '../../buffer/DataBufferGL'
import { InstancedProgramGL } from '../../program/InstancedProgramGL'
import { D2CircleShaderGL } from './D2CircleShaderGL'
import { D2CircleDataGL } from './D2CircleDataGL'

const INIT_INDEX_DATA: Array<number> = [0, 1, 2]

export class D2CircleInstancedProgramGL extends InstancedProgramGL {
	private readonly _a_objPosition: number
	private readonly _a_param: number
	private readonly _a_strokeColor: number
	private readonly _a_fillColor: number
	private readonly _u_matrix: WebGLUniformLocation
	constructor(webGL: WebGL) {
		super(webGL, D2CircleShaderGL.createVS(), D2CircleShaderGL.createFS(), new Float32Array(INIT_INDEX_DATA))
		this._a_objPosition = this.getWebGLAttributeLocation(`a_objPosition`)
		this._a_param = this.getWebGLAttributeLocation(`a_param`)
		this._a_strokeColor = this.getWebGLAttributeLocation(`a_strokeColor`)
		this._a_fillColor = this.getWebGLAttributeLocation(`a_fillColor`)
		this._u_matrix = this.getWebGLUniformLocation(`u_matrix`)
	}

	public render(ptsDataBuf: DataBufferGL, ptNums: number, viewMatrix4Data: Float32Array, zoomRatio: number): void {
		if (ptNums <= 0) {
			return
		}
		const gl: WebGL2RenderingContext = this.webGL.gl
		gl.useProgram(this.webGLProgram)
		this.setEnable()
		/* ... */
		gl.bindBuffer(ptsDataBuf.webglBufferType, ptsDataBuf.webglBuffer)
		gl.vertexAttribPointer(this._a_objPosition, 4, gl.FLOAT, false, D2CircleDataGL.STRIDE, 1 * FLOAT_32_ARRAY_BYTESIZE)
		gl.vertexAttribPointer(this._a_param, 4, gl.FLOAT, false, D2CircleDataGL.STRIDE, 5 * FLOAT_32_ARRAY_BYTESIZE)
		gl.vertexAttribPointer(this._a_strokeColor, 4, gl.FLOAT, false, D2CircleDataGL.STRIDE, 9 * FLOAT_32_ARRAY_BYTESIZE)
		gl.vertexAttribPointer(this._a_fillColor, 4, gl.FLOAT, false, D2CircleDataGL.STRIDE, 13 * FLOAT_32_ARRAY_BYTESIZE)
		/* ... */
		gl.uniformMatrix4fv(this._u_matrix, false, viewMatrix4Data)
		/* ... */
		this.instancedArrays.drawArraysInstancedANGLE(gl.TRIANGLES, 0, INIT_INDEX_DATA.length, ptNums)
		this.setDisable()
	}
}
