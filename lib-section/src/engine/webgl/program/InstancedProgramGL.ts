import { WebGL } from '../WebGL'
import { ProgramGL } from './ProgramGL'

export abstract class InstancedProgramGL extends ProgramGL {
	private _instancedArrays: ANGLE_instanced_arrays
	private _a_indexLoction: number
	private _indexWebGLBuffer: WebGLBuffer
	constructor(webGL: WebGL, vs: string, fs: string, indexData: Float32Array) {
		super(webGL, vs, fs)
		this._instancedArrays = this.webGL.getInstancedArrays()
		this._a_indexLoction = this.webGL.getWebGLAttributeLocation(this.webGLProgram, 'a_index')
		this._indexWebGLBuffer = this.webGL.gl.createBuffer()!
		this.webGL.gl.bindBuffer(this.webGL.gl.ARRAY_BUFFER, this._indexWebGLBuffer)
		this.webGL.gl.bufferData(this.webGL.gl.ARRAY_BUFFER, indexData, this.webGL.gl.STATIC_DRAW)
		this.webGL.gl.vertexAttribPointer(this._a_indexLoction, 1, this.webGL.gl.FLOAT, false, 0, 0)
	}

	public get instancedArrays(): ANGLE_instanced_arrays {
		return this._instancedArrays
	}

	// protected getWebGLAttributeLocation(name: string): number {
	// 	return super.getWebGLAttributeLocation(name)
	// }

	// protected getWebGLUniformLocation(name: string): WebGLUniformLocation {
	// 	return super.getWebGLUniformLocation(name)
	// }

	protected setEnable(): void {
		this.webGL.gl.bindBuffer(this.webGL.gl.ARRAY_BUFFER, this._indexWebGLBuffer)
		this.webGL.gl.vertexAttribPointer(this._a_indexLoction, 1, this.webGL.gl.FLOAT, false, 0, 0)
		this.webGL.gl.enableVertexAttribArray(this._a_indexLoction)
		for (let loc of this.attributeLocaltions) {
			this._instancedArrays.vertexAttribDivisorANGLE(loc, 1)
		}
		super.setEnable()
	}

	protected setDisable(): void {
		this.webGL.gl.disableVertexAttribArray(this._a_indexLoction)
		for (let loc of this.attributeLocaltions) {
			this._instancedArrays.vertexAttribDivisorANGLE(loc, 0)
		}
		super.setDisable()
	}
}
