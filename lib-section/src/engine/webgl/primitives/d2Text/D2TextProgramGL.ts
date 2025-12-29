import { WebGL } from '../../WebGL'
import { DataBufferGL, FLOAT_32_ARRAY_BYTESIZE } from '../../buffer/DataBufferGL'
import { ProgramGL } from '../../program/ProgramGL'
import { D2TextShaderGL } from './D2TextShaderGL'
import { D2TextDataGL } from './D2TextDataGL'

export class D2TextProgramGL extends ProgramGL {
	private readonly _a_objPosition: number
	private readonly _a_param: number
	private readonly _a_color: number
	private readonly _u_matrix: WebGLUniformLocation
	constructor(webGL: WebGL) {
		super(webGL, D2TextShaderGL.createVS(), D2TextShaderGL.createFS())
		this._a_objPosition = this.getWebGLAttributeLocation(`a_objPosition`)
		this._a_param = this.getWebGLAttributeLocation(`a_param`)
		this._a_color = this.getWebGLAttributeLocation(`a_color`)
		this._u_matrix = this.getWebGLUniformLocation(`u_matrix`)
	}

	public render(
		ptsDataBuf: DataBufferGL,
		indicesDataBuf: DataBufferGL,
		indicesNums: number,
		viewMatrix4Data: Float32Array,
		zoomRatio: number
	): void {
		const gl: WebGL2RenderingContext = this.webGL.gl
		gl.useProgram(this.webGLProgram)
		this.setEnable()
		/* ... */
		gl.bindBuffer(ptsDataBuf.webglBufferType, ptsDataBuf.webglBuffer)
		gl.vertexAttribPointer(this._a_objPosition, 3, gl.FLOAT, false, D2TextDataGL.STRIDE, 1 * FLOAT_32_ARRAY_BYTESIZE)
		gl.vertexAttribPointer(this._a_param, 4, gl.FLOAT, false, D2TextDataGL.STRIDE, 4 * FLOAT_32_ARRAY_BYTESIZE)
		gl.vertexAttribPointer(this._a_color, 4, gl.FLOAT, false, D2TextDataGL.STRIDE, 8 * FLOAT_32_ARRAY_BYTESIZE)
		/* ... */
		gl.uniformMatrix4fv(this._u_matrix, false, viewMatrix4Data)
		/* ... */
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesDataBuf.webglBuffer)
		gl.drawElements(gl.TRIANGLES, indicesNums, gl.UNSIGNED_SHORT, 0)
		this.setDisable()
	}
}
