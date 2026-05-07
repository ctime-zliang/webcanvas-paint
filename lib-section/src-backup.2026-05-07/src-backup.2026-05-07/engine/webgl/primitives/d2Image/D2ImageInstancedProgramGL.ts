import { WebGL } from '../../WebGL'
import { DataBufferGL, FLOAT_32_ARRAY_BYTESIZE } from '../../buffer/DataBufferGL'
import { InstancedProgramGL } from '../../program/InstancedProgramGL'
import { D2ImageShaderGL } from './D2ImageShaderGL'
import { D2ImageDataGL } from './D2ImageDataGL'

const INIT_INDEX_DATA: Array<number> = [0, 1, 2, 3, 4, 5]

export class D2ImageInstancedProgramGL extends InstancedProgramGL {
	private readonly _a_leftPosition: number
	private readonly _a_rightPosition: number
	private readonly _a_param: number
	private readonly _u_matrix: WebGLUniformLocation
	private readonly _u_texture: WebGLUniformLocation
	// private readonly _u_zoomRatio: WebGLUniformLocation
	constructor(webGL: WebGL) {
		super(webGL, D2ImageShaderGL.createVS(), D2ImageShaderGL.createFS(), new Float32Array(INIT_INDEX_DATA))
		this._a_leftPosition = this.getWebGLAttributeLocation(`a_leftPosition`)
		this._a_rightPosition = this.getWebGLAttributeLocation(`a_rightPosition`)
		this._a_param = this.getWebGLAttributeLocation(`a_param`)
		this._u_matrix = this.getWebGLUniformLocation(`u_matrix`)
		this._u_texture = this.getWebGLUniformLocation(`u_texture`)
		// this._u_zoomRatio = this.getWebGLUniformLocation(`u_zoomRatio`)
	}

	public render(ptsDataBuf: DataBufferGL, ptNums: number, texture: WebGLTexture, viewMatrix4Data: Float32Array, zoomRatio: number): void {
		if (texture === null) {
			return
		}
		const gl: WebGL2RenderingContext = this.webGL.gl
		gl.useProgram(this.webGLProgram)
		this.setEnable()
		/* ... */
		gl.bindBuffer(ptsDataBuf.webglBufferType, ptsDataBuf.webglBuffer)
		gl.vertexAttribPointer(this._a_leftPosition, 4, gl.FLOAT, false, D2ImageDataGL.STRIDE, 1 * FLOAT_32_ARRAY_BYTESIZE)
		gl.vertexAttribPointer(this._a_rightPosition, 4, gl.FLOAT, false, D2ImageDataGL.STRIDE, 5 * FLOAT_32_ARRAY_BYTESIZE)
		gl.vertexAttribPointer(this._a_param, 4, gl.FLOAT, false, D2ImageDataGL.STRIDE, 9 * FLOAT_32_ARRAY_BYTESIZE)
		/* ... */
		gl.uniform1i(this._u_texture, 0)
		gl.activeTexture(gl.TEXTURE0)
		gl.bindTexture(gl.TEXTURE_2D, texture)
		/* ... */
		gl.uniformMatrix4fv(this._u_matrix, false, viewMatrix4Data)
		// gl.uniform1f(this._u_zoomRatio, zoomRatio)
		/* ... */
		this.instancedArrays.drawArraysInstancedANGLE(gl.TRIANGLES, 0, INIT_INDEX_DATA.length, ptNums)
		this.setDisable()
	}
}
