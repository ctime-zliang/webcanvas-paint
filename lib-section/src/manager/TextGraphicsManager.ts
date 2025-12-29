import { TFontCanvasRenderMetrics } from '../engine/modules/d2Canvas2Svg/Canvas'
import { ED2FontStyle } from '../engine/config/PrimitiveProfile'
import { BaseManager } from './BaseManage'

export type TFontTriangleVertexData = {
	positions: Array<number>
	indices: Array<number>
}

export type TFontPolygonBbox2 = {
	minX: number
	minY: number
	maxX: number
	maxY: number
}

export class TextGraphicTemplate {
	private _triangleVertexData: TFontTriangleVertexData
	private _fontPolygonBbox2: TFontPolygonBbox2
	private _fontCanvasRenderMetrics: TFontCanvasRenderMetrics
	private _fontFamily: string
	private _fontStyle: ED2FontStyle
	private _fontWeight: number
	constructor(
		triangleVertexData: TFontTriangleVertexData,
		fontPolygonBbox2: TFontPolygonBbox2,
		fontCanvasRenderMetrics: TFontCanvasRenderMetrics,
		fontFamily: string,
		fontStyle: ED2FontStyle,
		fontWeight: number
	) {
		this._triangleVertexData = this.createTriangleVertexData(triangleVertexData)
		this._fontPolygonBbox2 = this.createFontPolygonBbox2(fontPolygonBbox2)
		this._fontCanvasRenderMetrics = this.createFontCanvasRenderMetrics(fontCanvasRenderMetrics)
		this._fontFamily = fontFamily
		this._fontStyle = fontStyle
		this._fontWeight = fontWeight
	}

	public get triangleVertexData(): TFontTriangleVertexData {
		return this.createTriangleVertexData(this._triangleVertexData)
	}

	public get fontPolygonBbox2(): TFontPolygonBbox2 {
		return this.createFontPolygonBbox2(this._fontPolygonBbox2)
	}

	public get fontCanvasRenderMetrics(): TFontCanvasRenderMetrics {
		return this.createFontCanvasRenderMetrics(this._fontCanvasRenderMetrics)
	}

	public get fontFamily(): string {
		return this._fontFamily
	}

	public get fontStyle(): ED2FontStyle {
		return this._fontStyle
	}

	public get fontWeight(): number {
		return this._fontWeight
	}

	private createTriangleVertexData(triangleVertexData: TFontTriangleVertexData): TFontTriangleVertexData {
		const iTriangleVertexData: TFontTriangleVertexData = {
			positions: [],
			indices: [],
		}
		for (let j: number = 0; j < triangleVertexData.positions.length; j++) {
			iTriangleVertexData.positions[j] = triangleVertexData.positions[j]
		}
		for (let j: number = 0; j < triangleVertexData.indices.length; j++) {
			iTriangleVertexData.indices[j] = triangleVertexData.indices[j]
		}
		return iTriangleVertexData
	}

	private createFontPolygonBbox2(templateBbox2: TFontPolygonBbox2): TFontPolygonBbox2 {
		return { ...templateBbox2 }
	}

	private createFontCanvasRenderMetrics(templateRect: TFontCanvasRenderMetrics): TFontCanvasRenderMetrics {
		return { ...templateRect }
	}
}

export class TextGraphicsManager extends BaseManager<Array<TextGraphicTemplate>> {
	private static instance: TextGraphicsManager
	public static getInstance(): TextGraphicsManager {
		if (TextGraphicsManager.instance === undefined) {
			TextGraphicsManager.instance = new TextGraphicsManager()
		}
		return TextGraphicsManager.instance
	}

	constructor() {
		super()
	}

	public addTextGraphicCache(textStr: string, textGraphicTemplate: TextGraphicTemplate): void {
		let textGraphicCacheList: Array<TextGraphicTemplate> = this.items.get(textStr)!
		if (!textGraphicCacheList) {
			textGraphicCacheList = []
		}
		textGraphicCacheList.push(textGraphicTemplate)
		this.items.set(textStr, textGraphicCacheList)
	}

	public getTextGraphicCache(
		textStr: string,
		fontFamily: string = 'auto',
		fontStyle: ED2FontStyle = ED2FontStyle.NORMAL,
		fontWeight: number = 100
	): TextGraphicTemplate {
		let textGraphicCacheList: Array<TextGraphicTemplate> = this.items.get(textStr)!
		if (!textGraphicCacheList) {
			return null!
		}
		for (let i: number = 0; i < textGraphicCacheList.length; i++) {
			const textGraphicCache: TextGraphicTemplate = textGraphicCacheList[i]
			if (
				textGraphicCache.fontFamily === fontFamily &&
				textGraphicCache.fontStyle === fontStyle &&
				textGraphicCache.fontWeight === fontWeight
			) {
				return textGraphicCache
			}
		}
		return null!
	}

	public quit(): void {
		super.quit()
		TextGraphicsManager.instance = undefined!
	}
}
