import { WebGL } from '../../WebGL'
import { DataBufferGL, FLOAT_32_ARRAY_BYTESIZE } from '../../buffer/DataBufferGL'
import { InstancedProgramGL } from '../../program/InstancedProgramGL'
import { D2PointShaderGL } from './D2PointShaderGL'
import { D2PointDataGL } from './D2PointDataGL'

const INIT_INDEX_DATA: Array<number> = [0, 1, 2]

export class D2PointInstancedProgramGL extends InstancedProgramGL {
	private readonly _a_objPosition: number
	private readonly _a_param: number
	private readonly _a_color: number
	private readonly _u_matrix: WebGLUniformLocation
	private readonly _u_zoomRatio: WebGLUniformLocation
	constructor(webGL: WebGL) {
		super(webGL, D2PointShaderGL.createVS(), D2PointShaderGL.createFS(), new Float32Array(INIT_INDEX_DATA))
		this._a_objPosition = this.getWebGLAttributeLocation(`a_objPosition`)
		this._a_param = this.getWebGLAttributeLocation(`a_param`)
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
		gl.vertexAttribPointer(this._a_objPosition, 4, gl.FLOAT, false, D2PointDataGL.STRIDE, 1 * FLOAT_32_ARRAY_BYTESIZE)
		gl.vertexAttribPointer(this._a_param, 4, gl.FLOAT, false, D2PointDataGL.STRIDE, 5 * FLOAT_32_ARRAY_BYTESIZE)
		gl.vertexAttribPointer(this._a_color, 4, gl.FLOAT, false, D2PointDataGL.STRIDE, 9 * FLOAT_32_ARRAY_BYTESIZE)
		/* ... */
		gl.uniformMatrix4fv(this._u_matrix, false, viewMatrix4Data)
		gl.uniform1f(this._u_zoomRatio, zoomRatio)
		/* ... */
		this.instancedArrays.drawArraysInstancedANGLE(gl.TRIANGLES, 0, INIT_INDEX_DATA.length, ptNums)
		this.setDisable()
	}
}
