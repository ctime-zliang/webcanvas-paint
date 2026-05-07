import { BBox2 } from '../engine/algorithm/geometry/bbox/BBox2'
import { Canvas, TFontCanvasRenderMetrics } from '../engine/modules/d2Canvas2Svg/Canvas'
import { createDefaultOptional, TOptional } from '../engine/modules/d2Canvas2Svg/Config'
import { EPixelFilterResult } from '../engine/modules/d2Canvas2Svg/pixelFilter/PixelFilter'
import { TextLayout, TTextLayoutFontProfile } from '../algorithm/geometry/TextLayout'
import { TextGraphicTemplate, TextGraphicsManager, TFontPolygonBbox2, TFontTriangleVertexData } from '../manager/TextGraphicsManager'
import { WorkerManager } from '../manager/WorkerManager'
import { Constant } from '../Constant'
import { BaseInterface } from '../controller/BaseInterface'
import { createFontArray } from './Utils'

type TtaskDataItem = {
	textStrId: string
	textContent: string
	profile: TTextLayoutFontProfile
	optional?: Record<keyof TOptional, any>
}

type TFlushCallback = (params: {
	textStrId: string
	width: number
	height: number
	initBbox2: BBox2
	vertexDataArray: Array<Array<TFontTriangleVertexData>>
}) => void

export const POINT_ARRAY_OCCUPY_SIZE: number = 2

export class TextFontService extends BaseInterface {
	private _canvasInstance: Canvas
	private _rawString: string
	private _worker: Worker
	private _workerId: string
	private _pixelFilterType: EPixelFilterResult
	private _taskDataList: Array<TtaskDataItem>
	private _isRuning: boolean
	private _flushCallbacks: Array<TFlushCallback>
	constructor(type: EPixelFilterResult = EPixelFilterResult.TRIANGLE) {
		super()
		this._canvasInstance = new Canvas()
		this._pixelFilterType = type
		this._taskDataList = []
		this._flushCallbacks = []
		this._isRuning = false
		const { worker, id } = WorkerManager.getInstance().createWorker(`D2CanvasPixel2Svg`)
		this._worker = worker
		this._workerId = id
		this._worker.onmessage = this.workerMessageHandler.bind(this)
	}

	public addVectorizeTextTask<K extends keyof TOptional>(
		textStrId: string,
		textContent: string,
		profile: TTextLayoutFontProfile,
		optional?: Record<K, any>,
		flushCallback?: TFlushCallback
	): void {
		this._taskDataList.push({
			textStrId,
			textContent,
			profile,
			optional: optional as Record<keyof TOptional, any>,
		})
		this._flushCallbacks.push(flushCallback ? flushCallback : null!)
		if (this._taskDataList.length && !this._isRuning) {
			const itemData: TtaskDataItem = this._taskDataList.shift()!
			this.vectorizeText(itemData.textStrId, itemData.textContent, itemData.profile, itemData.optional)
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
		profile: TTextLayoutFontProfile,
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
							fontCanvasRenderWidthRatio: 0.5,
							fontCanvasRenderHeightRatio: 1.0,
						}
						vertexDataArray[rowIndex][colIndex] = {
							positions: [],
							indices: [],
						}
					} else {
						hasCanvasRendered = true
						this._rawString = text
						const { xCut, yCut } = this.calcRender()
						const imageData: Uint8ClampedArray = this._canvasInstance.ctx.getImageData(0, 0, xCut, yCut).data
						textPolygonBbox2Arrays[rowIndex][colIndex] = { minX: 0, minY: 0, maxX: 0, maxY: 0 }
						textCanvasRenderMetricsArray[rowIndex][colIndex] = this._canvasInstance.getText2RectMap(text)
						vertexDataArray[rowIndex][colIndex] = {
							positions: [],
							indices: [],
						}
						imagePixelArray[rowIndex][colIndex] = imageData
						imageCutArray[rowIndex][colIndex] = { xCut, yCut }
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
					profile,
					textArray,
					textPolygonBbox2Arrays,
					textCanvasRenderMetricsArray,
					vertexDataArray,
					imagePixelArray,
					imageCutArray,
				},
			})
		} else {
			this.flushLayout(textStrId, textArray, textPolygonBbox2Arrays, textCanvasRenderMetricsArray, vertexDataArray, profile)
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
				profile: TTextLayoutFontProfile
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
			payload.data.textArray,
			payload.data.textPolygonBbox2Arrays,
			payload.data.textCanvasRenderMetricsArray,
			payload.data.vertexDataArray,
			payload.data.profile
		)
	}

	private flushLayout(
		elementModelItemId: string,
		textArray: Array<Array<string>>,
		textPolygonBbox2Arrays: Array<Array<TFontPolygonBbox2>>,
		textCanvasRenderMetricsArray: Array<Array<TFontCanvasRenderMetrics>>,
		vertexDataArray: Array<Array<TFontTriangleVertexData>>,
		profile: TTextLayoutFontProfile
	): void {
		const {
			width,
			height,
			initBbox2,
			vertexDataArray: vertexDataArrayUpdated,
		} = TextLayout.worldComposing(textArray, textPolygonBbox2Arrays, textCanvasRenderMetricsArray, vertexDataArray, profile)
		this._isRuning = false
		const flushCallback: TFlushCallback = this._flushCallbacks.shift()!
		if (flushCallback instanceof Function) {
			flushCallback({ textStrId: elementModelItemId, width, height, initBbox2, vertexDataArray: vertexDataArrayUpdated })
		}
		if (this._taskDataList.length && !this._isRuning) {
			const itemData: TtaskDataItem = this._taskDataList.shift()!
			this.vectorizeText(itemData.textStrId, itemData.textContent, itemData.profile, itemData.optional)
		}
	}

	private calcRender(): {
		xCut: number
		yCut: number
	} {
		const lineHeight: number = Math.round(1 * this._canvasInstance.canvasBaseFontPixelSize)
		this._canvasInstance.clearCanvas()
		return this._canvasInstance.renderTextContent(this._rawString, lineHeight)
	}

	private resetStatus(): void {
		this._canvasInstance.clearCanvas()
	}
}
