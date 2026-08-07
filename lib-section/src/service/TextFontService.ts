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

/**
 * TextFontService - 文字矢量化服务
 *
 * 设计原理:
 * 		将文本字符串转化为可供 WebGL/WebGPU 渲染的三角形网格数据
 * 		由于 GPU 只能渲染三角形, 文字需要经过以下处理管线才能在 GPU 上绘制:
 *   	文本字符串
 *     		- 逐字符拆分
 *    		- Canvas 2D 光栅化渲染(得到像素数据)
 *     		- 像素轮廓提取 / 三角化(在 Web Worker 中执行)
 *     		- 三角形顶点数据(positions + indices)
 *     		- 文本布局排版(计算每个字符的世界坐标位置)
 *     		- 最终顶点数据输出
 *
 * 缓存策略:
 * 		每个字符的矢量化结果会缓存到 TextGraphicsManager 中, 下次遇到相同字符(相同字体、样式、粗细)时直接使用缓存,  无需重复进行 Canvas 渲染和像素处理
 *
 * Web Worker 异步处理:
 * 		像素数据的三角化是 CPU 密集型操作, 放在 Worker 中执行,  避免阻塞主线程导致界面卡顿
 * 		Worker 处理完成后通过 postMessage 回传结果
 */

type TtaskDataItem = {
	textStrId: string
	textContent: string
	profile: TTextLayoutFontProfile
	optional?: Record<keyof TOptional, any>
}

type TFlushCallback = (params: { textStrId: string; width: number; height: number; initBbox2: BBox2; vertexDataArray: Array<Array<TFontTriangleVertexData>> }) => void

/**
 * 单个顶点坐标占用的数组空间大小(x, y 两个分量)
 * 用于顶点数据的内存布局计算
 */
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

	public addVectorizeTextTask<K extends keyof TOptional>(textStrId: string, textContent: string, profile: TTextLayoutFontProfile, optional?: Record<K, any>, flushCallback?: TFlushCallback): void {
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

	/**
	 * 执行文本矢量化的核心方法
	 *
	 * 处理流程:
	 * 		- 合并默认配置和用户传入的可选配置
	 * 		- 设置 Canvas 的字体渲染属性
	 * 		- 调用 createFontArray 将文本拆分为字符数组并初始化数据结构
	 * 		- 逐字符处理:
	 *    		- 缓存命中  // 直接使用 TextGraphicsManager 中的已有数据
	 *    		- 空格字符  // 特殊处理(无需渲染, 仅占位)
	 *    		- 普通字符  // Canvas 渲染 → 提取像素数据 → 存入待处理数组
	 * 		- 判断是否有需要 Worker 处理的新字符:
	 *    		- 有: 将像素数据发送到 Worker 进行三角化
	 *    		- 无(全部命中缓存): 直接进入布局阶段
	 *
	 * 性能优化:
	 * 		- 缓存命中的字符无需重新渲染和三角化, 大幅减少计算量
	 * 		- 将 CPU 密集的像素处理放入 Worker, 不阻塞主线程
	 * 		- 每个字符独立处理, 支持字符级别的缓存复用
	 */
	private vectorizeText<K extends keyof TOptional>(textStrId: string, textContent: string, profile: TTextLayoutFontProfile, optional?: Record<K, any>): void {
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
				const textGraphicTemplate: TextGraphicTemplate = TextGraphicsManager.getInstance().getTextGraphicCache(text, iOptional.fontFamily, iOptional.fontStyle, iOptional.fontWeight)
				if (textGraphicTemplate) {
					textPolygonBbox2Arrays[rowIndex][colIndex] = textGraphicTemplate.fontPolygonBbox2
					textCanvasRenderMetricsArray[rowIndex][colIndex] = textGraphicTemplate.fontCanvasRenderMetrics
					vertexDataArray[rowIndex][colIndex] = textGraphicTemplate.triangleVertexData
				} else {
					if (text === ' ') {
						/**
						 * 空格处理
						 * 		空格不渲染图形, 仅提供宽度占位
						 * 		fontCanvasRenderWidthRatio = 0.5 表示空格宽度为标准字符的 50%
						 */
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
		this.flushLayout(payload.data.textStrId, payload.data.textArray, payload.data.textPolygonBbox2Arrays, payload.data.textCanvasRenderMetricsArray, payload.data.vertexDataArray, payload.data.profile)
	}

	private flushLayout(
		elementModelItemId: string,
		textArray: Array<Array<string>>,
		textPolygonBbox2Arrays: Array<Array<TFontPolygonBbox2>>,
		textCanvasRenderMetricsArray: Array<Array<TFontCanvasRenderMetrics>>,
		vertexDataArray: Array<Array<TFontTriangleVertexData>>,
		profile: TTextLayoutFontProfile
	): void {
		const { width, height, initBbox2, vertexDataArray: vertexDataArrayUpdated } = TextLayout.worldComposing(textArray, textPolygonBbox2Arrays, textCanvasRenderMetricsArray, vertexDataArray, profile)
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
