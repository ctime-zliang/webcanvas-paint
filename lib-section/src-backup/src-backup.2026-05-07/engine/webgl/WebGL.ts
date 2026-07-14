import { Renderer } from '../common/Renderer'
import { ECoreRenderMode } from '../config/CommonProfile'
import { TypedArray32 } from '../types/Common'
import { IWebGLBufferBuidler } from './buffer/DataBufferGL'

export class WebGL extends Renderer implements IWebGLBufferBuidler {
	private _frameBufferStack: Array<WebGLFramebuffer>
	private _bufferSize: number
	constructor(canvasElement: HTMLCanvasElement) {
		super(canvasElement)
		this.gl = canvasElement.getContext('webgl', {
			depth: false,
			antialias: true,
			stencil: false,
			aplha: false,
			premultipliedAplha: false,
		}) as WebGL2RenderingContext
		if (!this.gl) {
			throw new Error(`failed to initialize WebGL.`)
		}
		this._frameBufferStack = []
		this.gl.viewport(0, 0, 1, 1)
		this._bufferSize = 0
	}

	public get bufferSize(): number {
		return this._bufferSize
	}
	public set bufferSize(value: number) {
		this._bufferSize = value
	}

	/**
	 * 创建 WebGL [ARRAY_BUFFER/ELEMENT_ARRAY_BUFFER] 缓冲区并初始化填充 null
	 *      - 绑定缓冲区对象
	 *          标记此对象内存空间的"使用目标" gl.ARRAY_BUFFER | gl.ELEMENT_ARRAY_BUFFER
	 *      - 写入缓冲区对象
	 *          无法直接向创建的缓冲区写入数据, 而只能向"使用目标"派发数据, 从而间接地实现向缓冲区填充数据
	 *          因此向缓冲区写入数据之前, 需要将其与特定的"使用目标"关联
	 *          (亦可以将"使用目标"类比于向缓冲区空间输送数据的"管道")
	 */
	public createWebGLArrayBufferBySize(bufferSize32: number, glUsage: GLenum) {
		const webGLBuffer: WebGLBuffer = this.gl.createBuffer()!
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, webGLBuffer)
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(bufferSize32), glUsage)
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null)
		return webGLBuffer
	}
	public createWebGLArrayBufferByBuffer(data: ArrayBuffer | TypedArray32, glUsage: GLenum) {
		const webGLBuffer: WebGLBuffer = this.gl.createBuffer()!
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, webGLBuffer)
		this.gl.bufferData(this.gl.ARRAY_BUFFER, data, glUsage)
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null)
		return webGLBuffer
	}
	public createWebGLElementBufferBySize(bufferSize32: number, glUsage: GLenum) {
		const webGLBuffer: WebGLBuffer = this.gl.createBuffer()!
		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, webGLBuffer)
		this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Float32Array(bufferSize32), glUsage)
		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null)
		return webGLBuffer
	}
	public createWebGLElementBufferByBuffer(data: ArrayBuffer | TypedArray32, glUsage: GLenum) {
		const webGLBuffer: WebGLBuffer = this.gl.createBuffer()!
		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, webGLBuffer)
		this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, data, glUsage)
		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null)
		return webGLBuffer
	}

	public clearCanvas(): void {
		const { width, height, origin } = this
		this.gl.viewport(0, 0, width, height)
		this.gl.clearColor(0.0, 0.0, 0.0, 1.0)
		this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT)
	}

	public setRenderMode(mode: ECoreRenderMode): void {
		if (mode === ECoreRenderMode.D2) {
			this.mode = mode
			this.gl.disable(this.gl.DEPTH_TEST)
			this.gl.disable(this.gl.CULL_FACE)
			this.gl.enable(this.gl.POLYGON_OFFSET_FILL)
			this.gl.polygonOffset(1.0, 1.0)
			this.gl.enable(this.gl.BLEND)
			this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA)
			return
		}
		if (mode === ECoreRenderMode.D3) {
			this.mode = mode
			this.gl.enable(this.gl.DEPTH_TEST)
			this.gl.enable(this.gl.CULL_FACE)
			this.gl.enable(this.gl.POLYGON_OFFSET_FILL)
			this.gl.polygonOffset(1.0, 1.0)
			this.gl.enable(this.gl.BLEND)
			this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA)
			return
		}
		throw new Error(`the preset rendering mode parameters are incorrect: ${mode}.`)
	}

	public getWebGLAttributeLocation(webGLProgram: WebGLProgram, name: string): number {
		const loc: number = this.gl.getAttribLocation(webGLProgram, name)
		if (loc < 0 || loc === null) {
			throw new Error(`failed to get attribute-location ${name} in ${webGLProgram}.`)
		}
		return loc
	}

	public getWebGLUniformLocation(webGLProgram: WebGLProgram, name: string): WebGLUniformLocation {
		const loc: WebGLUniformLocation = this.gl.getUniformLocation(webGLProgram, name)!
		if (loc === null) {
			throw new Error(`failed to get uniform-location ${name} in ${webGLProgram}.`)
		}
		return loc
	}

	public createShader(type: GLenum, sourceCode: string): WebGLShader {
		const shader: WebGLShader = this.gl.createShader(type)!
		if (shader === null) {
			throw new Error(`failed to get create webgl shader ${type}.`)
		}
		this.gl.shaderSource(shader, sourceCode)
		this.gl.compileShader(shader)
		if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
			const msg: string = this.gl.getShaderInfoLog(shader)!
			throw new Error(msg || `failed to get compile webgl shader ${type}.`)
		}
		return shader
	}

	public createProgram(vs: string, fs: string): WebGLProgram {
		const vertexShader: WebGLShader = this.createShader(this.gl.VERTEX_SHADER, vs)
		const fragmentShader: WebGLShader = this.createShader(this.gl.FRAGMENT_SHADER, fs)
		const webGLProgram: WebGLProgram = this.gl.createProgram()!
		if (webGLProgram === null) {
			throw new Error(`failed to get create webgl program.`)
		}
		this.gl.attachShader(webGLProgram, vertexShader)
		this.gl.attachShader(webGLProgram, fragmentShader)
		this.gl.linkProgram(webGLProgram)
		if (!this.gl.getProgramParameter(webGLProgram, this.gl.LINK_STATUS)) {
			const msg: string = this.gl.getProgramInfoLog(webGLProgram)!
			throw new Error(msg || `failed to get link webgl program.`)
		}
		return webGLProgram
	}

	public createRGBATexture(texImageSource: TexImageSource, minFilter: number, magFilter: number, wrapS: number, wrapT: number): WebGLTexture {
		const texture: WebGLTexture = this.gl.createTexture()!
		this.gl.bindTexture(this.gl.TEXTURE_2D, texture)
		this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, 1)
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, minFilter)
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, magFilter)
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, wrapS)
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, wrapT)
		this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, texImageSource)
		this.gl.bindTexture(this.gl.TEXTURE_2D, null)
		return texture
	}

	public createFrameBufferTexture(texture: WebGLTexture, width: number, height: number, depth: number): WebGLFramebuffer {
		const frameBuffer: WebGLFramebuffer = this.gl.createFramebuffer()!
		this.enterfb(frameBuffer)
		this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, texture, 0)
		if (depth) {
			const depthBuffer: WebGLRenderbuffer = this.gl.createRenderbuffer()!
			this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, depthBuffer)
			this.gl.renderbufferStorage(this.gl.RENDERBUFFER, this.gl.DEPTH_STENCIL, width, height)
			this.gl.framebufferRenderbuffer(this.gl.RENDERBUFFER, this.gl.DEPTH_STENCIL_ATTACHMENT, this.gl.RENDERBUFFER, depthBuffer)
		}
		this.leavefb()
		return frameBuffer
	}

	public getInstancedArrays(): ANGLE_instanced_arrays {
		const ext: ANGLE_instanced_arrays = this.gl.getExtension(`ANGLE_instanced_arrays`)!
		if (ext === null) {
			throw new Error(`failed to get webgl extension.`)
		}
		return ext
	}

	public enterfb(fb: WebGLFramebuffer): void {
		this._frameBufferStack.push(fb)
		this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, fb)
	}

	public leavefb(): void {
		this._frameBufferStack.pop()
		const fb: WebGLFramebuffer = this._frameBufferStack.length > 0 ? this._frameBufferStack[this._frameBufferStack.length - 1] : null!
		this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, fb)
	}

	public quit(): void {
		this._frameBufferStack = undefined!
		super.quit()
	}
}
