import { TypedArray32, TypedArrayN } from '../../types/Common'
import { WebGL } from '../WebGL'

export const FLOAT_32_ARRAY_BYTESIZE: number = 4

export interface IWebGLBufferBuidler {
	createWebGLArrayBufferBySize(bufferSize32: number, glUsage: GLenum): WebGLBuffer
	createWebGLArrayBufferByBuffer(data: ArrayBuffer | TypedArray32, glUsage: GLenum): WebGLBuffer
	createWebGLElementBufferBySize(bufferSize32: number, glUsage: GLenum): WebGLBuffer
	createWebGLElementBufferByBuffer(data: ArrayBuffer | TypedArray32, glUsage: GLenum): WebGLBuffer
}

export class DataBufferGL {
	private _webGL: WebGL
	private _webglBuffer: WebGLBuffer
	private _bufferSize32: number
	private _glBufferTypeEnum: 'ARRAY_BUFFER' | 'ELEMENT_ARRAY_BUFFER'
	private _glBufferType: GLenum
	private _glUsage: GLenum
	constructor(webGL: WebGL, bufferSize32: number, glBufferTypeEnum: 'ARRAY_BUFFER' | 'ELEMENT_ARRAY_BUFFER', glUsage: GLenum) {
		this._webGL = webGL
		this._bufferSize32 = bufferSize32
		this._glBufferTypeEnum = glBufferTypeEnum
		this._glUsage = glUsage
		this._webglBuffer = null!
		this._glBufferType = 0
		if (this._glBufferTypeEnum === 'ARRAY_BUFFER') {
			this._glBufferType = this._webGL.gl.ARRAY_BUFFER
			this._webglBuffer = this._webGL.createWebGLArrayBufferBySize(this._bufferSize32, this._glUsage)
		} else if (this._glBufferTypeEnum === 'ELEMENT_ARRAY_BUFFER') {
			this._glBufferType = this._webGL.gl.ELEMENT_ARRAY_BUFFER
			this._webglBuffer = this._webGL.createWebGLElementBufferBySize(this._bufferSize32, this._glUsage)
		}
	}

	public get bufferSize32(): number {
		return this._bufferSize32
	}

	public get webglBufferType(): GLenum {
		return this._glBufferType
	}

	public get webglBuffer(): WebGLBuffer {
		return this._webglBuffer
	}

	public destroy(): void {
		this._webGL.gl.deleteBuffer(this._webglBuffer)
	}

	public setSize(bufferSize32: number): void {
		if (bufferSize32 === this._bufferSize32) {
			return
		}
		this._bufferSize32 = bufferSize32
		if (this._glBufferTypeEnum === 'ARRAY_BUFFER') {
			this._webglBuffer = this._webGL.createWebGLArrayBufferBySize(this._bufferSize32, this._glUsage)
		} else if (this._glBufferTypeEnum === 'ELEMENT_ARRAY_BUFFER') {
			this._webglBuffer = this._webGL.createWebGLElementBufferBySize(this._bufferSize32, this._glUsage)
		}
		this.setBuffer(this._webglBuffer)
	}

	public extSize(bufferSize32: number): void {
		if (bufferSize32 === this._bufferSize32) {
			return
		}
		this._bufferSize32 += bufferSize32
		const dataBufferGL: DataBufferGL = new DataBufferGL(this._webGL, this._bufferSize32, this._glBufferTypeEnum, this._glUsage)
		this.setBuffer(dataBufferGL.webglBuffer)
	}

	private setBuffer(webglBuffer: WebGLBuffer) {
		this._webGL.gl.deleteBuffer(this._webglBuffer)
		this._webglBuffer = webglBuffer
	}

	public submitData(data: TypedArrayN): void {
		this._webGL.gl.bindBuffer(this._glBufferType, this._webglBuffer)
		this._webGL.gl.bufferData(this._glBufferType, data, this._glUsage)
		this._webGL.gl.bindBuffer(this._glBufferType, null)
	}
}
