import { CANVAS_DRAW_TEXT_STD_MM, createDefaultOptional, TOptional } from './Config'

/**
 * TextMetrics 参数释义:
 *   	fontBoundingBoxAscent: 从文本基线到行框顶部的距离
 *   	fontBoundingBoxDescent: 从文本基线到行框底部的距离
 *   	actualBoundingBoxAscent: 从文本基线到顶线的距离
 *   	actualBoundingBoxDescent: 从文本基线到底线的距离
 *   	actualBoundingBoxLeft: 从水平对齐方式的对齐点到行框最左边的距离
 *   	actualBoundingBoxRight: 从水平对齐方式的对齐点到行框最右边的距离
 *
 *   	fontBoundingBoxAscent + fontBoundingBoxDescent: 字体完整高度
 *   	actualBoundingBoxAscent + actualBoundingBoxDescent: 实际渲染高度
 */

/**
 * 字体在 Canvas 上渲染后的归一化尺寸度量
 * 		fontCanvasRenderWidthRatio: 单字符平均宽度与基准字号的比值
 * 			例: Arial 12px 下 "A" 宽约 7px, ratio = 7/12 ≈ 0.583
 * 		fontCanvasRenderHeightRatio: 字体行高与基准字号的比值
 * 			例: Arial 的 ascent+descent 约 1.15 倍字号, ratio ≈ 1.15
 */
export type TFontCanvasRenderMetrics = {
	fontCanvasRenderWidthRatio: number
	fontCanvasRenderHeightRatio: number
}

export class Canvas {
	private _canvasBaseFontPixelSize: number
	private _canvasElement: HTMLCanvasElement
	private _width: number
	private _height: number
	private _ctx: CanvasRenderingContext2D
	private _fillTextStr: string
	private _profile: {
		xPos: number
		yPos: number
		zPos: number
	}
	private _optional: TOptional
	private _text2RectMap: Map<string, TFontCanvasRenderMetrics>
	constructor(optional?: TOptional) {
		this._fillTextStr = ''
		this._profile = {
			xPos: 0,
			yPos: 0,
			zPos: 0,
		}
		this._canvasBaseFontPixelSize = CANVAS_DRAW_TEXT_STD_MM
		this._canvasElement = document.createElement('canvas')
		this._ctx = this._canvasElement.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D
		this.updateCanvasRect(this._canvasBaseFontPixelSize * 4, this._canvasBaseFontPixelSize * 4)
		this._text2RectMap = new Map()
		this._optional = {
			...createDefaultOptional(),
			...((optional as TOptional) || {}),
		}
		// const canvasWraperElement = document.createElement('div')
		// canvasWraperElement.style.position = 'fixed'
		// canvasWraperElement.style.left = `0`
		// canvasWraperElement.style.top = `0`
		// canvasWraperElement.style.bottom = `0`
		// canvasWraperElement.style.right = `0`
		// canvasWraperElement.style.backgroundColor = '#ffffff'
		// canvasWraperElement.style.zIndex = '999999'
		// canvasWraperElement.appendChild(this._canvasElement)
		// document.body.appendChild(canvasWraperElement)
	}

	public get ctx(): CanvasRenderingContext2D {
		return this._ctx
	}

	public get width(): number {
		return this._width
	}
	public set width(value: number) {
		this._width = value
	}

	public get height(): number {
		return this._height
	}
	public set height(value: number) {
		this._height = value
	}

	public get canvasBaseFontPixelSize(): number {
		return this._canvasBaseFontPixelSize
	}

	public setContextProfile<K extends keyof TOptional>(optional: Record<K, any>): void {
		this._ctx.font = [
			(optional as TOptional).fontStyle || this._optional.fontFamily,
			(optional as TOptional).fontVariant || this._optional.fontVariant,
			(optional as TOptional).fontWeight || this._optional.fontWeight,
			this._canvasBaseFontPixelSize + 'px',
			(optional as TOptional).fontFamily,
		].join(' ')
		this._ctx.textAlign = 'left'
		this._ctx.textBaseline = 'alphabetic'
		this._ctx.direction = 'ltr'
	}

	public updateCanvasRect(canvasWidth: number, canvasHeight: number): void {
		this.width = canvasWidth
		this.height = canvasHeight
		this._canvasElement.width = canvasWidth
		this._canvasElement.height = canvasHeight
	}

	/**
	 * 获取指定文本的归一化渲染尺寸度量(从缓存中查找)
	 *
	 * 默认值含义:
	 *   	- fontCanvasRenderWidthRatio: 0.5  // 假定每字符宽度为字号的一半
	 *   	- fontCanvasRenderHeightRatio: 1.0  // 假定行高等于字号
	 */
	public getText2RectMap(text: string): TFontCanvasRenderMetrics {
		return (
			this._text2RectMap.get(text) || {
				fontCanvasRenderWidthRatio: 0.5,
				fontCanvasRenderHeightRatio: 1.0,
			}
		)
	}

	public clearCanvas(): void {
		this.ctx.clearRect(0, 0, this.width, this.height)
		this.ctx.fillStyle = '#000000'
		this.ctx.fillRect(0, 0, this.width, this.height)
		this.ctx.fillStyle = '#ffffff'
		this._text2RectMap.clear()
	}

	/**
	 * 渲染多行文本内容并返回裁剪边界
	 *
	 * 		输入:
	 * 			rawString: 原始文本(支持 '\n' 换行)
	 * 			renderLineHeight: 行高(像素)
	 * 		输出:
	 * 			{ xCut, yCut } - 文本内容的包围盒尺寸
	 *
	 * 算法流程:
	 *   	- 按换行符拆分文本为多行
	 *   	- 对每一行逐字符拼接(用于触发 fillTextContentByBuffer 测量)
	 *   	- 每行渲染位置: x = startOffsetX, y = startOffsetY + i * lineHeight
	 *   	- 追踪所有行中最大宽度作为 xCut
	 *   	- 总高度 = startOffsetY + lineHeight * 总行数
	 */
	public renderTextContent(
		rawString: string,
		renderLineHeight: number
	): {
		xCut: number
		yCut: number
	} {
		const allTextsOfLine: Array<string> = rawString.split('\n')
		const allTextSize: number = allTextsOfLine.length
		const lineHeight: number = renderLineHeight
		/**
		 * 左边距: 1 倍基准字号, 防止文字贴边
		 */
		const startOffsetX: number = this._canvasBaseFontPixelSize
		/**
		 * 顶部边距: 2 倍基准字号, 因为 alphabetic 基线上方有 ascent 高度
		 */
		const startOffsetY: number = this._canvasBaseFontPixelSize * 2
		let maxXCutWidth: number = 0
		for (let i: number = 0; i < allTextSize; i++) {
			const txt: string = allTextsOfLine[i]
			this._profile.xPos = 0
			this._profile.yPos = i * lineHeight
			this._profile.zPos = this._canvasBaseFontPixelSize
			this._fillTextStr = ''
			for (let j: number = 0; j < txt.length; j++) {
				this._fillTextStr += txt[j]
			}
			this.fillTextContentByBuffer(startOffsetX, startOffsetY)
			const width: number = Math.round(this._profile.xPos + 2 * startOffsetX) | 0
			if (maxXCutWidth < width) {
				maxXCutWidth = width
			}
		}
		const xCut: number = maxXCutWidth
		const yCut: number = startOffsetY + lineHeight * allTextSize
		return {
			xCut,
			yCut,
		}
	}

	/**
	 * 将缓冲区中的文本渲染到 Canvas 并测量其几何尺寸
	 *
	 * 		输入:
	 * 			startOffsetX: 渲染起始 X 偏移
	 * 			startOffsetY: 渲染起始 Y 偏移
	 *
	 * 核心算法:
	 *   	- 使用 fillText 将文本绘制到 Canvas(白色文字在黑色背景上)
	 *   	- 使用 measureText 获取精确的 TextMetrics
	 *   	- 计算归一化宽高比:
	 *      	- widthRatio  = 总像素宽度 / 字符数 / 基准字号
	 *        		即: 每个字符的平均宽度占基准字号的比例
	 *     		- heightRatio = (ascent + descent) / 基准字号
	 *        		即: 字体完整高度占基准字号的比例
	 *   	- 将结果缓存到 _text2RectMap
	 *   	- 累加 xPos(用于多段文本的连续排列)
	 */
	private fillTextContentByBuffer(startOffsetX: number, startOffsetY: number): void {
		if (this._fillTextStr !== '') {
			this._ctx.fillText(this._fillTextStr, startOffsetX + 0, startOffsetY + 0)
			const metrics: TextMetrics = this._ctx.measureText(this._fillTextStr)
			/**
			 * 归一化宽度比: 单字符平均宽度 / 基准字号
			 */
			const fontCanvasRenderWidthRatio: number = metrics.width / this._fillTextStr.length / this._canvasBaseFontPixelSize
			/**
			 * 归一化高度比: 字体总高度(ascent + descent) / 基准字号
			 */
			const fontCanvasRenderHeightRatio: number = (metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent) / this._canvasBaseFontPixelSize
			this._text2RectMap.set(this._fillTextStr, {
				fontCanvasRenderWidthRatio,
				fontCanvasRenderHeightRatio,
			})
			/**
			 * 累加水平偏移, 用于后续连续文本的定位
			 */
			const delta: number = metrics.width
			this._profile.xPos += delta
		}
	}
}
