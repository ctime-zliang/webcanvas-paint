import { BBox2 } from '../../engine/algorithm/geometry/bbox/BBox2'
import { Vector2 } from '../../engine/algorithm/geometry/vector/Vector2'
import { TFontCanvasRenderMetrics } from '../../engine/modules/d2Canvas2Svg/Canvas'
import { Color } from '../../engine/common/Color'
import { TFontPolygonBbox2, TFontTriangleVertexData } from '../../manager/TextGraphicsManager'
import { buildD2AssistLineShapeSimplify } from '../../objects/assist/primitive2d/D2AssistLineShape'
import { POINT_ARRAY_OCCUPY_SIZE } from '../../service/TextFontService'

export class TextLayout {
	/**
	 * 段落文本字符排版
	 */
	static worldComposing(
		startPointData: Array<number>,
		textArray: Array<Array<string>>,
		textPolygonBbox2Arrays: Array<Array<TFontPolygonBbox2>>,
		textCanvasRenderMetricsArray: Array<Array<TFontCanvasRenderMetrics>>,
		vertexDataArray: Array<Array<TFontTriangleVertexData>>,
		fontSize: number,
		fontScale: number
	): {
		bbox2: BBox2
		vertexDataArray: Array<Array<TFontTriangleVertexData>>
	} {
		const { outerRectBbox2 } = TextLayout.calculateOuterRectBbox2(textPolygonBbox2Arrays)
		let offsetX: number = 0
		let offsetY: number = 0
		let d2TextShapeBboxMinX: number = undefined!
		let d2TextShapeBboxMaxX: number = undefined!
		let d2TextShapeBboxMinY: number = undefined!
		let d2TextShapeBboxMaxY: number = undefined!
		const rowSize: number = textArray.length
		for (let rowIndex: number = rowSize - 1, textIndex = -1; rowIndex >= 0; rowIndex--) {
			const colSize: number = textArray[rowIndex].length
			offsetX = 0
			offsetY += (outerRectBbox2.maxY - outerRectBbox2.minY) * fontScale
			for (let colIndex: number = 0; colIndex < colSize; colIndex++) {
				textIndex++
				let translateX: number = 0
				let translateY: number = 0
				if (colIndex <= 0) {
					offsetX = 0
				} else {
					offsetX += fontSize * textCanvasRenderMetricsArray[rowIndex][colIndex - 1].fontCanvasRenderAreaRaitoW
				}
				translateX = offsetX + startPointData[0]
				translateY = offsetY + startPointData[1]
				const vertextData: TFontTriangleVertexData = vertexDataArray[rowIndex][colIndex]
				for (let j: number = 0; j < vertextData.positions.length; j += POINT_ARRAY_OCCUPY_SIZE) {
					/**
					 * 将字符三角形顶点坐标平移
					 * 		使得字符 FontBbox2 左上角对齐坐标原点(防止后续缩放变换时文本变形)
					 */
					vertextData.positions[j] = vertextData.positions[j] - outerRectBbox2.minX
					vertextData.positions[j + 1] = vertextData.positions[j + 1] - outerRectBbox2.maxY
					/**
					 * 将字符尺寸缩放至预设大小
					 */
					vertextData.positions[j] = vertextData.positions[j] * fontScale
					vertextData.positions[j + 1] = vertextData.positions[j + 1] * fontScale
					/**
					 * 将字符三角形顶点坐标平移
					 */
					vertextData.positions[j] = vertextData.positions[j] + translateX
					vertextData.positions[j + 1] = vertextData.positions[j + 1] + translateY
					const x: number = vertextData.positions[j]
					const y: number = vertextData.positions[j + 1]
					if (typeof d2TextShapeBboxMinX === 'undefined') {
						d2TextShapeBboxMinX = d2TextShapeBboxMaxX = x
						d2TextShapeBboxMinY = d2TextShapeBboxMaxY = y
					}
					d2TextShapeBboxMinX = d2TextShapeBboxMinX >= x ? x : d2TextShapeBboxMinX
					d2TextShapeBboxMaxX = d2TextShapeBboxMaxX <= x ? x : d2TextShapeBboxMaxX
					d2TextShapeBboxMinY = d2TextShapeBboxMinY >= y ? y : d2TextShapeBboxMinY
					d2TextShapeBboxMaxY = d2TextShapeBboxMaxY <= y ? y : d2TextShapeBboxMaxY
				}
			}
		}
		// buildD2AssistLineShapeSimplify(
		// 	new Vector2(d2TextShapeBboxMinX, d2TextShapeBboxMinY),
		// 	new Vector2(d2TextShapeBboxMaxX, d2TextShapeBboxMaxY),
		// 	Color.CADE_BLUE
		// )
		return {
			bbox2: new BBox2(d2TextShapeBboxMinX, d2TextShapeBboxMinY, d2TextShapeBboxMaxX, d2TextShapeBboxMaxY),
			vertexDataArray,
		}
	}

	/**
	 * 计算该段文本在初始(未排版)状态下的包围盒
	 * 		在未排版的情况下, 所有文本将以基线对齐的方式"堆叠"在同一坐标位置, 此时计算出该区域的最大包围盒
	 */
	static calculateOuterRectBbox2(textPolygonBbox2Arrays: Array<Array<TFontPolygonBbox2>>): {
		outerRectBbox2: { minX: number; minY: number; maxX: number; maxY: number }
	} {
		let minX: number = 0
		let minY: number = 0
		let maxX: number = 0
		let maxY: number = 0
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

	static translateVertexData(
		startPoint: Vector2,
		vertexDataArray: Array<Array<TFontTriangleVertexData>>
	): {
		bbox2: BBox2
		vertexDataArray: Array<Array<TFontTriangleVertexData>>
	} {
		const vertexDataArray2: Array<Array<TFontTriangleVertexData>> = []
		let d2TextShapeBboxMinX: number = undefined!
		let d2TextShapeBboxMaxX: number = undefined!
		let d2TextShapeBboxMinY: number = undefined!
		let d2TextShapeBboxMaxY: number = undefined!
		for (let rowIndex: number = 0, textIndex = -1; rowIndex < vertexDataArray.length; rowIndex++) {
			vertexDataArray2[rowIndex] = []
			for (let colIndex: number = 0; colIndex < vertexDataArray[rowIndex].length; colIndex++) {
				textIndex++
				const vertextData: TFontTriangleVertexData = vertexDataArray[rowIndex][colIndex]
				const vertextData2: TFontTriangleVertexData = {
					indices: [...vertextData.indices],
					positions: [],
				}
				for (let j: number = 0; j < vertextData.positions.length; j += POINT_ARRAY_OCCUPY_SIZE) {
					vertextData2.positions.push(vertextData.positions[j] + startPoint.x, vertextData.positions[j + 1] + startPoint.y)
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
