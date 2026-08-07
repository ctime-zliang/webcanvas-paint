import { BBox2 } from '../../engine/algorithm/geometry/bbox/BBox2'
import { TFontCanvasRenderMetrics } from '../../engine/modules/d2Canvas2Svg/Canvas'
import { CANVAS_DRAW_TEXT_STD_MM } from '../../engine/modules/d2Canvas2Svg/Config'
import { TFontPolygonBbox2, TFontTriangleVertexData } from '../../manager/TextGraphicsManager'
import { POINT_ARRAY_OCCUPY_SIZE } from '../../service/TextFontService'

export type TTextLayoutFontProfile = {
	fontSize: number
	lineHeight: number
}
export class TextLayout {
	/**
	 * 段落文本字符排版
	 */
	public static worldComposing(
		textArray: Array<Array<string>>,
		textPolygonBbox2Arrays: Array<Array<TFontPolygonBbox2>>,
		textCanvasRenderMetricsArray: Array<Array<TFontCanvasRenderMetrics>>,
		vertexDataArray: Array<Array<TFontTriangleVertexData>>,
		profile: TTextLayoutFontProfile
	): {
		width: number
		height: number
		initBbox2: BBox2
		vertexDataArray: Array<Array<TFontTriangleVertexData>>
	} {
		const { fontSize, lineHeight } = profile
		const FONT_SCALE: number = fontSize / CANVAS_DRAW_TEXT_STD_MM
		const { outerRectBbox2 } = TextLayout.calculateOuterRectBbox2(textPolygonBbox2Arrays)
		const lineHeight2: number = lineHeight || fontSize
		Bbox2Calculator.clear()
		let [offsetX, offsetY]: [number, number] = [0, 0]
		for (let rowIndex: number = 0; rowIndex < textArray.length; rowIndex++) {
			const colSize: number = textArray[rowIndex].length
			offsetX = 0
			offsetY += rowIndex <= 0 ? Math.abs(lineHeight2 - fontSize) / 2 : lineHeight2
			for (let colIndex: number = 0; colIndex < colSize; colIndex++) {
				offsetX += colIndex <= 0 ? -offsetX : fontSize * textCanvasRenderMetricsArray[rowIndex][colIndex - 1].fontCanvasRenderWidthRatio
				const vertextData: TFontTriangleVertexData = vertexDataArray[rowIndex][colIndex]
				for (let j: number = 0; j < vertextData.positions.length; j += POINT_ARRAY_OCCUPY_SIZE) {
					vertextData.positions[j] -= outerRectBbox2.minX
					vertextData.positions[j + 1] -= outerRectBbox2.maxY
					vertextData.positions[j] *= FONT_SCALE
					vertextData.positions[j + 1] *= FONT_SCALE
					vertextData.positions[j] += offsetX
					vertextData.positions[j + 1] -= offsetY
					Bbox2Calculator.calculate(0, 0, vertextData.positions[j], vertextData.positions[j + 1])
				}
			}
		}
		Bbox2Calculator.cache.d2TextShapeBboxMinY -= Math.abs(lineHeight2 - fontSize) / 2
		const bbox2: BBox2 = Bbox2Calculator.generateBbox2()
		return {
			width: bbox2.width,
			height: bbox2.height,
			initBbox2: bbox2,
			vertexDataArray,
		}
	}

	/**
	 * 计算该段文本在初始(未排版)状态下的包围盒
	 * 		在未排版的情况下, 所有文本将以基线对齐的方式"堆叠"在同一坐标位置, 此时计算出该区域的最大包围盒
	 */
	public static calculateOuterRectBbox2(textPolygonBbox2Arrays: Array<Array<TFontPolygonBbox2>>): {
		outerRectBbox2: { minX: number; minY: number; maxX: number; maxY: number }
	} {
		let [minX, minY, maxX, maxY]: [number, number, number, number] = [0, 0, 0, 0]
		for (let rowIndex: number = 0; rowIndex < textPolygonBbox2Arrays.length; rowIndex++) {
			const colSize: number = textPolygonBbox2Arrays[rowIndex].length
			for (let colIndex: number = 0; colIndex < colSize; colIndex++) {
				const textPolygonBbox2: TFontPolygonBbox2 = textPolygonBbox2Arrays[rowIndex][colIndex]
				if (textPolygonBbox2) {
					if (rowIndex === 0 && colIndex === 0) {
						minX = textPolygonBbox2.minX
						maxX = textPolygonBbox2.maxX
						minY = textPolygonBbox2.minY
						maxY = textPolygonBbox2.maxY
					}
					minX = minX >= textPolygonBbox2.minX ? textPolygonBbox2.minX : minX
					maxX = maxX <= textPolygonBbox2.maxX ? textPolygonBbox2.maxX : maxX
					minY = minY >= textPolygonBbox2.minY ? textPolygonBbox2.minY : minY
					maxY = maxY <= textPolygonBbox2.maxY ? textPolygonBbox2.maxY : maxY
				}
			}
		}
		return {
			outerRectBbox2: {
				minX,
				maxX,
				minY,
				maxY,
			},
		}
	}

	public static translateVertexData(vertexDataArray: Array<Array<TFontTriangleVertexData>>): {
		bbox2: BBox2
		vertexDataArray: Array<Array<TFontTriangleVertexData>>
	} {
		const vertexDataArray2: Array<Array<TFontTriangleVertexData>> = []
		let [d2TextShapeBboxMinX, d2TextShapeBboxMaxX, d2TextShapeBboxMinY, d2TextShapeBboxMaxY]: [number, number, number, number] = [undefined!, undefined!, undefined!, undefined!]
		for (let rowIndex: number = 0; rowIndex < vertexDataArray.length; rowIndex++) {
			vertexDataArray2[rowIndex] = []
			for (let colIndex: number = 0; colIndex < vertexDataArray[rowIndex].length; colIndex++) {
				const vertextData: TFontTriangleVertexData = vertexDataArray[rowIndex][colIndex]
				const vertextData2: TFontTriangleVertexData = {
					indices: [...vertextData.indices],
					positions: [],
				}
				for (let j: number = 0; j < vertextData.positions.length; j += POINT_ARRAY_OCCUPY_SIZE) {
					vertextData2.positions.push(vertextData.positions[j], vertextData.positions[j + 1])
					const x: number = vertextData2.positions[j]
					const y: number = vertextData2.positions[j + 1]
					if (typeof d2TextShapeBboxMinX === 'undefined') {
						d2TextShapeBboxMinX = d2TextShapeBboxMaxX = x
						d2TextShapeBboxMinY = d2TextShapeBboxMaxY = y
					}
					d2TextShapeBboxMinX = d2TextShapeBboxMinX >= x ? x : d2TextShapeBboxMinX
					d2TextShapeBboxMaxX = d2TextShapeBboxMaxX <= x ? x : d2TextShapeBboxMaxX
					d2TextShapeBboxMinY = d2TextShapeBboxMinY >= y ? y : d2TextShapeBboxMinY
					d2TextShapeBboxMaxY = d2TextShapeBboxMaxY <= y ? y : d2TextShapeBboxMaxY
				}
				vertexDataArray2[rowIndex][colIndex] = vertextData2
			}
		}
		return {
			bbox2: new BBox2(d2TextShapeBboxMinX, d2TextShapeBboxMinY, d2TextShapeBboxMaxX, d2TextShapeBboxMaxY),
			vertexDataArray: vertexDataArray2,
		}
	}
}

class Bbox2Calculator {
	public static cache: {
		d2TextShapeBboxMinX: number
		d2TextShapeBboxMaxX: number
		d2TextShapeBboxMinY: number
		d2TextShapeBboxMaxY: number
	} = {
		d2TextShapeBboxMinX: undefined!,
		d2TextShapeBboxMaxX: undefined!,
		d2TextShapeBboxMinY: undefined!,
		d2TextShapeBboxMaxY: undefined!,
	}

	public static calculate(initX: number, initY: number, setX: number, setY: number): void {
		if (typeof Bbox2Calculator.cache.d2TextShapeBboxMinX === 'undefined') {
			Bbox2Calculator.cache.d2TextShapeBboxMinX = Bbox2Calculator.cache.d2TextShapeBboxMaxX = initX
			Bbox2Calculator.cache.d2TextShapeBboxMinY = Bbox2Calculator.cache.d2TextShapeBboxMaxY = initY
		}
		Bbox2Calculator.cache.d2TextShapeBboxMinX = Bbox2Calculator.cache.d2TextShapeBboxMinX >= setX ? setX : Bbox2Calculator.cache.d2TextShapeBboxMinX
		Bbox2Calculator.cache.d2TextShapeBboxMaxX = Bbox2Calculator.cache.d2TextShapeBboxMaxX <= setX ? setX : Bbox2Calculator.cache.d2TextShapeBboxMaxX
		Bbox2Calculator.cache.d2TextShapeBboxMinY = Bbox2Calculator.cache.d2TextShapeBboxMinY >= setY ? setY : Bbox2Calculator.cache.d2TextShapeBboxMinY
		Bbox2Calculator.cache.d2TextShapeBboxMaxY = Bbox2Calculator.cache.d2TextShapeBboxMaxY <= setY ? setY : Bbox2Calculator.cache.d2TextShapeBboxMaxY
	}

	public static generateBbox2(): BBox2 {
		return new BBox2(Bbox2Calculator.cache.d2TextShapeBboxMinX, Bbox2Calculator.cache.d2TextShapeBboxMinY, Bbox2Calculator.cache.d2TextShapeBboxMaxX, Bbox2Calculator.cache.d2TextShapeBboxMaxY)
	}

	public static clear(): void {
		Bbox2Calculator.cache.d2TextShapeBboxMinX = undefined!
		Bbox2Calculator.cache.d2TextShapeBboxMaxX = undefined!
		Bbox2Calculator.cache.d2TextShapeBboxMinY = undefined!
		Bbox2Calculator.cache.d2TextShapeBboxMaxY = undefined!
	}
}
