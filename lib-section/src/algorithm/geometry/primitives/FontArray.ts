import { TFontCanvasRenderMetrics } from '../../../engine/modules/d2Canvas2Svg/Canvas'
import { TFontPolygonBbox2, TFontTriangleVertexData } from '../../../manager/TextGraphicsManager'

export function createFontArray(textContent: string): {
	textArray: Array<Array<string>>
	textPolygonBbox2Arrays: Array<Array<TFontPolygonBbox2>>
	textCanvasRenderMetricsArray: Array<Array<TFontCanvasRenderMetrics>>
	vertexDataArray: Array<Array<TFontTriangleVertexData>>
} {
	const result: {
		textArray: Array<Array<string>>
		textPolygonBbox2Arrays: Array<Array<TFontPolygonBbox2>>
		textCanvasRenderMetricsArray: Array<Array<TFontCanvasRenderMetrics>>
		vertexDataArray: Array<Array<TFontTriangleVertexData>>
	} = {
		textArray: [[]],
		textPolygonBbox2Arrays: [[]],
		textCanvasRenderMetricsArray: [[]],
		vertexDataArray: [[]],
	}
	const filterRawString: string = textContent.trim()
	let rowIndex: number = 0
	for (let i: number = 0, colIndex = i; i < filterRawString.length; i++) {
		const text: string = filterRawString[i]
		if (text === '' || text === '\t') {
			continue
		}
		if (text === '\n' || text === '\r') {
			rowIndex += 1
			result.textArray[rowIndex] = []
			result.textPolygonBbox2Arrays[rowIndex] = []
			result.textCanvasRenderMetricsArray[rowIndex] = []
			result.vertexDataArray[rowIndex] = []
			colIndex = 0
			continue
		}
		result.textArray[rowIndex][colIndex] = text
		result.textPolygonBbox2Arrays[rowIndex][colIndex] = null!
		result.textCanvasRenderMetricsArray[rowIndex][colIndex] = null!
		result.vertexDataArray[rowIndex][colIndex] = {
			positions: [],
			indices: [],
		}
		colIndex++
	}
	return result
}
