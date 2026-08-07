import { CANVAS_DRAW_TEXT_STD_MM, createDefaultOptional, TOptional } from './Config'

/**
 * TextMetrics 参数释义:
 * 		fontBoundingBoxAscent: 从文本基线到行框顶部的距离
 * 		fontBoundingBoxDescent: 从文本基线到行框底部的距离
 * 		actualBoundingBoxAscent: 从文本基线到顶线的距离
 * 		actualBoundingBoxDescent: 从文本基线到底线的距离
 * 		actualBoundingBoxLeft: 从水平对齐方式的对齐点到行框最左边的距离
 * 		actualBoundingBoxRight: 从水平对齐方式的对齐点到行框最右边的距离
 *
 * 		fontBoundingBoxAscent + fontBoundingBoxDescent  // 字体高度
 * 		actualBoundingBoxAscent + actualBoundingBoxDescent  // 实际渲染高度
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
		/* ... */
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
		const startOffsetX: number = this._canvasBaseFontPixelSize
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

	private fillTextContentByBuffer(startOffsetX: number, startOffsetY: number): void {
		if (this._fillTextStr !== '') {
			this._ctx.fillText(this._fillTextStr, startOffsetX + 0, startOffsetY + 0)
			const metrics: TextMetrics = this._ctx.measureText(this._fillTextStr)
			// console.log(metrics)
			const fontCanvasRenderWidthRatio: number = metrics.width / this._fillTextStr.length / this._canvasBaseFontPixelSize
			const fontCanvasRenderHeightRatio: number = (metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent) / this._canvasBaseFontPixelSize
			// const fontCanvasRenderBoxLeftRatio: number = metrics.actualBoundingBoxLeft / this._canvasBaseFontPixelSize
			this._text2RectMap.set(this._fillTextStr, {
				fontCanvasRenderWidthRatio,
				fontCanvasRenderHeightRatio,
			})
			const delta: number = metrics.width
			this._profile.xPos += delta
		}
	}
}
