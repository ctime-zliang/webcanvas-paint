import { createCanvasImageDataArray, View3DUint8Clamped } from '../../engine/math/NDArray'
import { PixelFilter, TPixelProgressResult } from '../../engine/modules/d2Canvas2Svg/pixelFilter/PixelFilter'
import { TD2PointItem } from '../../engine/types/Common'
import { TFontPolygonBbox2, TFontTriangleVertexData } from '../../manager/TextGraphicsManager'
import { taskDataList, TTaskDataItem, TWorkeRequestBody } from './CacheData'

const D2CANVAS_PIXEL2SVG_WORKER_ID: string = `VectorizeText`
const POINT_ARRAY_OCCUPY_SIZE: number = 2

self.onmessage = (event: MessageEvent): void => {
	const payload: { ID: string; data: TWorkeRequestBody } = event.data
	if (!payload.ID || payload.ID !== D2CANVAS_PIXEL2SVG_WORKER_ID) {
		return
	}
	taskDataList.push({ ...payload.data, isRuning: false, pixelFilter: null! })
	main()
}

function main(): void {
	consumeTask()
}

function consumeTask(): void {
	if (taskDataList.length <= 0) {
		return
	}
	const taskDataItem: TTaskDataItem = taskDataList.shift()!
	taskDataItem.isRuning = true
	if (!taskDataItem.pixelFilter) {
		taskDataItem.pixelFilter = new PixelFilter(taskDataItem.pixelFilterType)
	}
	const { textArray, textPolygonBbox2Arrays, textCanvasRenderMetricsArray, imageCutArray, imagePixelArray, vertexDataArray } = taskDataItem
	for (let rowIndex: number = 0, textIndex = -1; rowIndex < textArray.length; rowIndex++) {
		const colSize: number = textArray[rowIndex].length
		for (let colIndex: number = 0; colIndex < colSize; colIndex++) {
			textIndex++
			if (imagePixelArray[rowIndex][colIndex]) {
				const cutValueOfCell: { xCut: number; yCut: number } = imageCutArray[rowIndex][colIndex]
				const pixels: View3DUint8Clamped = getPixels(imagePixelArray[rowIndex][colIndex], cutValueOfCell.xCut, cutValueOfCell.yCut)
				const pixelProgressResult: TPixelProgressResult = taskDataItem.pixelFilter.process(pixels)
				const { templateTriangleVertexData, templatePolygonBbox2 } = flatAllTrianglesVertexData(pixelProgressResult.triangles!)
				vertexDataArray[rowIndex][colIndex] = templateTriangleVertexData
				textPolygonBbox2Arrays[rowIndex][colIndex] = templatePolygonBbox2
				imagePixelArray[rowIndex][colIndex] = null!
				imageCutArray[rowIndex][colIndex] = null!
				continue
			}
		}
	}
	self.postMessage({
		ID: D2CANVAS_PIXEL2SVG_WORKER_ID,
		data: {
			taskId: taskDataItem.taskId,
			textStrId: taskDataItem.textStrId,
			optional: taskDataItem.optional,
			pixelFilterType: taskDataItem.pixelFilterType,
			fontSize: taskDataItem.fontSize,
			startPointData: taskDataItem.startPointData,
			/* ... */
			textArray,
			textPolygonBbox2Arrays,
			textCanvasRenderMetricsArray,
			vertexDataArray,
		},
	})
	consumeTask()
}

/**
 * 阵列化当前字符的像素数据
 */
function getPixels(imageData: Uint8ClampedArray, xCut: number, yCut: number): View3DUint8Clamped {
	/**
	 * 以 Canvas2D 画布内的有效像素数据为基础建立三维数组 3D-NDArray
	 */
	const pixels: View3DUint8Clamped = createCanvasImageDataArray(imageData, [yCut, xCut, 4])
	return pixels.pick(-1, -1, 0).transpose(1, 0)
}

/**
 * 将一个完整字符的所有多边形转换成三角形顶点数组
 * 计算该完整字符的 BBOX2
 */
function flatAllTrianglesVertexData(sourceTriangles: { indices: Array<Array<number>>; positions: Array<TD2PointItem> }): {
	templateTriangleVertexData: TFontTriangleVertexData
	templatePolygonBbox2: TFontPolygonBbox2
} {
	const templateTriangleVertexData: TFontTriangleVertexData = {
		positions: [],
		indices: [],
	}
	const allPositions: Array<number> = []
	for (let i: number = 0; i < sourceTriangles.positions.length; i++) {
		for (let j: number = 0; j < sourceTriangles.positions[i].length; j++) {
			templateTriangleVertexData.positions.push(sourceTriangles.positions[i][j])
			allPositions.push(sourceTriangles.positions[i][j])
		}
	}
	for (let i: number = 0; i < sourceTriangles.indices.length; i++) {
		for (let j: number = 0; j < sourceTriangles.indices[i].length; j++) {
			templateTriangleVertexData.indices.push(sourceTriangles.indices[i][j])
		}
	}
	let minX: number = 0
	let minY: number = 0
	let maxX: number = 0
	let maxY: number = 0
	for (let i: number = 0; i < allPositions.length; i += POINT_ARRAY_OCCUPY_SIZE) {
		const x: number = allPositions[i]
		const y: number = allPositions[i + 1]
		if (i === 0) {
			maxX = minX = x
			maxY = minY = y
		}
		minX = minX >= x ? x : minX
		maxX = maxX <= x ? x : maxX
		minY = minY >= y ? y : minY
		maxY = maxY <= y ? y : maxY
	}
	return {
		templateTriangleVertexData,
		templatePolygonBbox2: {
			minX,
			maxX,
			minY,
			maxY,
		},
	}
}
