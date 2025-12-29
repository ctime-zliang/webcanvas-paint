import { WebGL } from '../WebGL'

export abstract class ProgramGL {
	private readonly _webGL: WebGL
	private _webGLProgram: WebGLProgram
	private _attributeLocaltions: Array<number>
	private _disabledAttributeLocaltions: Set<number>
	constructor(webGL: WebGL, vs: string, fs: string) {
		this._webGL = webGL
		this._webGLProgram = this._webGL.createProgram(vs, fs)
		this._attributeLocaltions = []
		this._disabledAttributeLocaltions = new Set()
	}

	public get webGL(): WebGL {
		return this._webGL
	}

	public get webGLProgram(): WebGLProgram {
		return this._webGLProgram
	}

	public get attributeLocaltions(): Array<number> {
		return this._attributeLocaltions
	}

	public get disabledAttributeLocaltions(): Set<number> {
		return this._disabledAttributeLocaltions
	}

	public abstract render(...args: Array<any>): void

	protected getWebGLAttributeLocation(name: string): number {
		const loc: number = this._webGL.getWebGLAttributeLocation(this._webGLProgram, name)
		this.attributeLocaltions.push(loc)
		return loc
	}

	protected getWebGLUniformLocation(name: string): WebGLUniformLocation {
		const loc: WebGLUniformLocation = this._webGL.getWebGLUniformLocation(this._webGLProgram, name)
		return loc
	}

	protected setEnable(): void {
		for (let loc of this.attributeLocaltions) {
			this._webGL.gl.enableVertexAttribArray(loc)
		}
		for (let loc of this._disabledAttributeLocaltions) {
			this._webGL.gl.enableVertexAttribArray(loc)
			this._webGL.gl.vertexAttrib4f(loc, 0, 0, 0, 1)
		}
	}

	protected setDisable(): void {
		for (let loc of this.attributeLocaltions) {
			this._webGL.gl.disableVertexAttribArray(loc)
		}
	}

	protected setEnableLoction(loc: number): void {
		this._disabledAttributeLocaltions.delete(loc)
	}

	protected setDisableLoction(loc: number): void {
		this._disabledAttributeLocaltions.add(loc)
	}
}
