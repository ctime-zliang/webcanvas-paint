import { TFontCanvasRenderMetrics } from '../engine/modules/d2Canvas2Svg/Canvas'
import { TFontPolygonBbox2, TFontTriangleVertexData } from '../manager/TextGraphicsManager'

/**
 * 将文本内容拆解为按行列组织的字符数组及其关联的图形数据结构
 */
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
	/**
	 * 逐字符遍历, colIndex 独立维护列位置
	 */
	for (let i: number = 0, colIndex = i; i < filterRawString.length; i++) {
		const text: string = filterRawString[i]
		/**
		 * 过滤空字符和制表符(不参与渲染)
		 */
		if (text === '' || text === '\t') {
			continue
		}
		/**
		 * 换行符处理: 开辟新行, 重置列索引
		 */
		if (text === '\n' || text === '\r') {
			rowIndex += 1
			result.textArray[rowIndex] = []
			result.textPolygonBbox2Arrays[rowIndex] = []
			result.textCanvasRenderMetricsArray[rowIndex] = []
			result.vertexDataArray[rowIndex] = []
			colIndex = 0
			continue
		}
		/**
		 * 将字符存入当前行列位置, 并初始化对应的图形数据槽位
		 */
		result.textArray[rowIndex][colIndex] = text
		/**
		 * 后续由矢量化流程填充
		 */
		result.textPolygonBbox2Arrays[rowIndex][colIndex] = null!
		/**
		 * 后续由 Canvas 渲染度量填充
		 */
		result.textCanvasRenderMetricsArray[rowIndex][colIndex] = null!
		result.vertexDataArray[rowIndex][colIndex] = {
			/**
			 * 三角形顶点坐标(后续由三角化算法填充)
			 */
			positions: [],
			/**
			 * 三角形索引(后续由三角化算法填充)
			 */
			indices: [],
		}
		colIndex++
	}
	return result
}
