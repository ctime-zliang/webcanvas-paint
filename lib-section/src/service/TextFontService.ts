import { BBox2 } from '../engine/algorithm/geometry/bbox/BBox2'
import { Canvas, TFontCanvasRenderMetrics } from '../engine/modules/d2Canvas2Svg/Canvas'
import { createDefaultOptional, TOptional } from '../engine/modules/d2Canvas2Svg/Config'
import { EPixelFilterResult } from '../engine/modules/d2Canvas2Svg/pixelFilter/PixelFilter'
import { createFontArray } from '../algorithm/geometry/primitives/FontArray'
import { TextLayout } from '../algorithm/geometry/TextLayout'
import { TextGraphicTemplate, TextGraphicsManager, TFontPolygonBbox2, TFontTriangleVertexData } from '../manager/TextGraphicsManager'
import { WorkerManager } from '../manager/WorkerManager'
import { Constant } from '../Constant'
import { BaseInterface } from '../controller/BaseInterface'

export const POINT_ARRAY_OCCUPY_SIZE: number = 2

export class TextFontService extends BaseInterface {
	private _canvasInstance: Canvas
	private _rawString: string
	private _worker: Worker
	private _workerId: string
	private _pixelFilterType: EPixelFilterResult
	private _taskDataList: Array<{
		textStrId: string
		textContent: string
		fontSize: number
		startPointData: Array<number>
		optional?: Record<keyof TOptional, any>
	}>
	private _isRuning: boolean
	private _flushCallbacks: Array<(textStrId: string, bbox2: BBox2, vertexDataArray: Array<Array<TFontTriangleVertexData>>) => void>
	constructor(type: EPixelFilterResult = EPixelFilterResult.TRIANGLE) {
		super()
		this._canvasInstance = new Canvas()
		this._pixelFilterType = type
		this._taskDataList = []
		this._flushCallbacks = []
		this._isRuning = false
		const workerRes: { worker: Worker; id: string } = WorkerManager.getInstance().createWorker(`D2CanvasPixel2Svg`)
		this._worker = workerRes.worker
		this._workerId = workerRes.id
		this._worker.onmessage = this.workerMessageHandler.bind(this)
	}

	public addVectorizeTextTask<K extends keyof TOptional>(
		textStrId: string,
		textContent: string,
		fontSize: number,
		startPointData: Array<number>,
		optional?: Record<K, any>,
		flushCallback?: (textStrId: string, bbox2: BBox2, vertexDataArray: Array<Array<TFontTriangleVertexData>>) => void
	): void {
		this._taskDataList.push({
			textStrId,
			textContent,
			fontSize,
			startPointData,
			optional: optional as Record<keyof TOptional, any>,
		})
		this._flushCallbacks.push(flushCallback ? flushCallback : null!)
		if (this._taskDataList.length && !this._isRuning) {
			const itemData: {
				textStrId: string
				textContent: string
				fontSize: number
				startPointData: Array<number>
				optional?: Record<keyof TOptional, any>
			} = this._taskDataList.shift()!
			if (itemData) {
				this.vectorizeText(itemData.textStrId, itemData.textContent, itemData.fontSize, itemData.startPointData, itemData.optional)
			}
		}
	}

	public quit(): void {
		this._canvasInstance = undefined!
		this._taskDataList = undefined!
		this._flushCallbacks = undefined!
		WorkerManager.getInstance().destroyWorker(this._workerId)
		this._worker = undefined!
		this._workerId = undefined!
	}

	private vectorizeText<K extends keyof TOptional>(
		textStrId: string,
		textContent: string,
		fontSize: number,
		startPointData: Array<number>,
		optional?: Record<K, any>
	): void {
		this._isRuning = true
		const taskId: string = Constant.globalIdenManager.getHashIden()
		const iOptional: TOptional = {
			...createDefaultOptional(),
			...((optional as TOptional) || {}),
		}
		this._canvasInstance.setContextProfile({
			fontFamily: iOptional.fontFamily,
			fontVariant: iOptional.fontVariant,
			fontWeight: iOptional.fontWeight,
			fontStyle: iOptional.fontStyle,
		})
		const { textArray, textPolygonBbox2Arrays, textCanvasRenderMetricsArray, vertexDataArray } = createFontArray(textContent)
		const imagePixelArray: Array<Array<Uint8ClampedArray>> = []
		const imageCutArray: Array<Array<{ xCut: number; yCut: number }>> = []
		let hasCanvasRendered: boolean = false
		for (let rowIndex: number = 0; rowIndex < textArray.length; rowIndex++) {
			const colSize: number = textArray[rowIndex].length
			if (typeof imagePixelArray[rowIndex] === 'undefined') {
				imagePixelArray[rowIndex] = []
			}
			if (typeof imageCutArray[rowIndex] === 'undefined') {
				imageCutArray[rowIndex] = []
			}
			for (let colIndex: number = 0; colIndex < colSize; colIndex++) {
				const text: string = textArray[rowIndex][colIndex]
				const textGraphicTemplate: TextGraphicTemplate = TextGraphicsManager.getInstance().getTextGraphicCache(
					text,
					iOptional.fontFamily,
					iOptional.fontStyle,
					iOptional.fontWeight
				)
				if (textGraphicTemplate) {
					textPolygonBbox2Arrays[rowIndex][colIndex] = textGraphicTemplate.fontPolygonBbox2
					textCanvasRenderMetricsArray[rowIndex][colIndex] = textGraphicTemplate.fontCanvasRenderMetrics
					vertexDataArray[rowIndex][colIndex] = textGraphicTemplate.triangleVertexData
				} else {
					if (text === ' ') {
						textPolygonBbox2Arrays[rowIndex][colIndex] = null!
						textCanvasRenderMetricsArray[rowIndex][colIndex] = {
							fontCanvasRenderAreaRaitoW: 0.5,
							fontCanvasRenderAreaRaitoH: 1.0,
						}
						vertexDataArray[rowIndex][colIndex] = {
							positions: [],
							indices: [],
						}
					} else {
						hasCanvasRendered = true
						this._rawString = text
						const rect: {
							xCut: number
							yCut: number
						} = this.calcRender()
						const imageData: Uint8ClampedArray = this._canvasInstance.ctx.getImageData(0, 0, rect.xCut, rect.yCut).data
						textPolygonBbox2Arrays[rowIndex][colIndex] = { minX: 0, minY: 0, maxX: 0, maxY: 0 }
						textCanvasRenderMetricsArray[rowIndex][colIndex] = this._canvasInstance.getText2RectMap(text)
						vertexDataArray[rowIndex][colIndex] = {
							positions: [],
							indices: [],
						}
						imagePixelArray[rowIndex][colIndex] = imageData
						imageCutArray[rowIndex][colIndex] = rect
					}
				}
				this.resetStatus()
			}
		}
		if (hasCanvasRendered) {
			this._worker.postMessage({
				ID: 'VectorizeText',
				data: {
					taskId,
					textStrId,
					optional: { ...iOptional },
					pixelFilterType: this._pixelFilterType,
					fontSize,
					startPointData,
					/* ... */
					textArray,
					textPolygonBbox2Arrays,
					textCanvasRenderMetricsArray,
					vertexDataArray,
					imagePixelArray,
					imageCutArray,
				},
			})
		} else {
			this.flushLayout(textStrId, startPointData, textArray, textPolygonBbox2Arrays, textCanvasRenderMetricsArray, vertexDataArray, fontSize)
		}
	}

	private workerMessageHandler(event: MessageEvent): void {
		const payload: {
			ID: string
			data: {
				taskId: string
				textStrId: string
				optional: TOptional
				pixelFilterType: EPixelFilterResult
				fontSize: number
				startPointData: Array<number>
				outerRectBbox2: {
					minX: number
					maxX: number
					minY: number
					maxY: number
				}
				/* ... */
				textArray: Array<Array<string>>
				textPolygonBbox2Arrays: Array<Array<TFontPolygonBbox2>>
				textCanvasRenderMetricsArray: Array<Array<TFontCanvasRenderMetrics>>
				vertexDataArray: Array<Array<TFontTriangleVertexData>>
			}
		} = event.data
		const { textArray, vertexDataArray, textPolygonBbox2Arrays, textCanvasRenderMetricsArray, optional } = payload.data
		for (let rowIndex: number = 0; rowIndex < textArray.length; rowIndex++) {
			const colSize: number = textArray[rowIndex].length
			for (let colIndex: number = 0; colIndex < colSize; colIndex++) {
				const textGraphicTemplate: TextGraphicTemplate = new TextGraphicTemplate(
					vertexDataArray[rowIndex][colIndex],
					textPolygonBbox2Arrays[rowIndex][colIndex],
					textCanvasRenderMetricsArray[rowIndex][colIndex],
					optional.fontFamily!,
					optional.fontStyle!,
					optional.fontWeight!
				)
				TextGraphicsManager.getInstance().addTextGraphicCache(textArray[rowIndex][colIndex], textGraphicTemplate)
			}
		}
		this.flushLayout(
			payload.data.textStrId,
			payload.data.startPointData,
			payload.data.textArray,
			payload.data.textPolygonBbox2Arrays,
			payload.data.textCanvasRenderMetricsArray,
			payload.data.vertexDataArray,
			payload.data.fontSize
		)
	}

	private flushLayout(
		elementModelItemId: string,
		startPointData: Array<number>,
		textArray: Array<Array<string>>,
		textPolygonBbox2Arrays: Array<Array<TFontPolygonBbox2>>,
		textCanvasRenderMetricsArray: Array<Array<TFontCanvasRenderMetrics>>,
		vertexDataArray: Array<Array<TFontTriangleVertexData>>,
		fontSize: number
	): void {
		const { bbox2, vertexDataArray: vertexDataArrayUpdated } = TextLayout.worldComposing(
			startPointData,
			textArray,
			textPolygonBbox2Arrays,
			textCanvasRenderMetricsArray,
			vertexDataArray,
			fontSize,
			fontSize / this._canvasInstance.canvasBaseFontSize
		)
		this._isRuning = false
		const flushCallback: (textStrId: string, bbox2: BBox2, vertexDataArray: Array<Array<TFontTriangleVertexData>>) => void =
			this._flushCallbacks.shift()!
		if (flushCallback instanceof Function) {
			flushCallback(elementModelItemId, bbox2, vertexDataArrayUpdated)
		}
		if (this._taskDataList.length && !this._isRuning) {
			const itemData: {
				textStrId: string
				textContent: string
				fontSize: number
				startPointData: Array<number>
				optional?: Record<keyof TOptional, any>
			} = this._taskDataList.shift()!
			if (itemData) {
				this.vectorizeText(itemData.textStrId, itemData.textContent, itemData.fontSize, itemData.startPointData, itemData.optional)
			}
		}
	}

	private calcRender(): {
		xCut: number
		yCut: number
	} {
		const lineHeight: number = Math.round(1.25 * this._canvasInstance.canvasBaseFontSize)
		this._canvasInstance.clearCanvas()
		return this._canvasInstance.renderTextContent(this._rawString, lineHeight)
	}

	private resetStatus(): void {
		this._canvasInstance.clearCanvas()
	}
}
