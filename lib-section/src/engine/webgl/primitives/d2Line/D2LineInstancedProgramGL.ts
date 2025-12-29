import { WebGL } from '../../WebGL'
import { DataBufferGL, FLOAT_32_ARRAY_BYTESIZE } from '../../buffer/DataBufferGL'
import { InstancedProgramGL } from '../../program/InstancedProgramGL'
import { D2LineShaderGL } from './D2LineShaderGL'
import { D2LineDataGL } from './D2LineDataGL'

const INIT_INDEX_DATA: Array<number> = [0, 1, 2, 3, 4, 5]

export class D2LineInstancedProgramGL extends InstancedProgramGL {
	private readonly _a_objPositionS: number
	private readonly _a_objPositionE: number
	private readonly _a_param: number
	private readonly _a_profile: number
	private readonly _a_color: number
	private readonly _u_matrix: WebGLUniformLocation
	private readonly _u_zoomRatio: WebGLUniformLocation
	constructor(webGL: WebGL) {
		super(webGL, D2LineShaderGL.createVS(), D2LineShaderGL.createFS(), new Float32Array(INIT_INDEX_DATA))
		this._a_objPositionS = this.getWebGLAttributeLocation(`a_objPositionS`)
		this._a_objPositionE = this.getWebGLAttributeLocation(`a_objPositionE`)
		this._a_param = this.getWebGLAttributeLocation(`a_param`)
		this._a_profile = this.getWebGLAttributeLocation(`a_profile`)
		this._a_color = this.getWebGLAttributeLocation(`a_color`)
		this._u_matrix = this.getWebGLUniformLocation(`u_matrix`)
		this._u_zoomRatio = this.getWebGLUniformLocation(`u_zoomRatio`)
	}

	public render(ptsDataBuf: DataBufferGL, ptNums: number, viewMatrix4Data: Float32Array, zoomRatio: number): void {
		const gl: WebGL2RenderingContext = this.webGL.gl
		gl.useProgram(this.webGLProgram)
		this.setEnable()
		/* ... */
		gl.bindBuffer(ptsDataBuf.webglBufferType, ptsDataBuf.webglBuffer)
		gl.vertexAttribPointer(this._a_objPositionS, 3, gl.FLOAT, false, D2LineDataGL.STRIDE, 1 * FLOAT_32_ARRAY_BYTESIZE)
		gl.vertexAttribPointer(this._a_objPositionE, 3, gl.FLOAT, false, D2LineDataGL.STRIDE, 4 * FLOAT_32_ARRAY_BYTESIZE)
		gl.vertexAttribPointer(this._a_param, 4, gl.FLOAT, false, D2LineDataGL.STRIDE, 7 * FLOAT_32_ARRAY_BYTESIZE)
		gl.vertexAttribPointer(this._a_profile, 4, gl.FLOAT, false, D2LineDataGL.STRIDE, 11 * FLOAT_32_ARRAY_BYTESIZE)
		gl.vertexAttribPointer(this._a_color, 4, gl.FLOAT, false, D2LineDataGL.STRIDE, 15 * FLOAT_32_ARRAY_BYTESIZE)
		/* ... */
		gl.uniformMatrix4fv(this._u_matrix, false, viewMatrix4Data)
		gl.uniform1f(this._u_zoomRatio, zoomRatio)
		/* ... */
		this.instancedArrays.drawArraysInstancedANGLE(gl.TRIANGLES, 0, INIT_INDEX_DATA.length, ptNums)
		this.setDisable()
	}
}
