import { BaseInterface } from '../controller/BaseInterface'
import { TexImageSourceManager, TexImageSourceTemplate } from '../manager/TexImageSourceManager'

/**
 * ImageReSourceService - 图片资源异步加载服务
 *
 * 设计原理:
 * 		本服务采用 串行任务队列模式来管理图片的异步加载
 *
 * 核心机制:
 * 		- 任务入队: 调用 addImageLoadTaskItem 将图片加载请求加入队列
 * 		- 串行执行: 每次仅加载一张图片, 前一张加载完成后自动取出下一个任务
 * 		- 缓存复用: 加载前先检查 TexImageSourceManager 缓存, 避免重复加载同一图片
 * 		- 回调通知: 每张图片加载完成后, 通过对应的 flushCallback 通知调用方
 *
 * 与引擎的关系:
 * 		加载完成的图片会被存入 TexImageSourceManager 纹理缓存,  后续 WebGL/WebGPU 渲染引擎可直接从缓存取出 TexImageSource 用于纹理绑定
 */

/**
 * 图片加载完成后的刷新回调类型
 */
type TFlushCallback = (imageId: string, fileHashUuid: string, texImageSource: TexImageSource) => void

export class ImageReSourceService extends BaseInterface {
	private _taskDataList: Array<{
		imageId: string
		fileHashUuid: string
		imageDataURL: string
	}>
	private _isRuning: boolean
	private _flushCallbacks: Array<TFlushCallback>
	constructor() {
		super()
		this._isRuning = false
		this._taskDataList = []
		this._flushCallbacks = []
	}

	public addImageLoadTaskItem(imageId: string, fileHashUuid: string, imageDataURL: string, flushCallback?: TFlushCallback): void {
		this._taskDataList.push({
			imageId,
			fileHashUuid,
			imageDataURL,
		})
		this._flushCallbacks.push(flushCallback ? flushCallback : null!)
		if (this._taskDataList.length && !this._isRuning) {
			const itemData: {
				imageId: string
				fileHashUuid: string
				imageDataURL: string
			} = this._taskDataList.shift()!
			if (itemData) {
				this.loadImageDataURL(itemData.imageId, itemData.fileHashUuid, itemData.imageDataURL)
			}
		}
	}

	public quit(): void {
		this._taskDataList = undefined!
		this._flushCallbacks = undefined!
	}

	/**
	 * 执行单张图片的加载
	 *
	 * 加载流程:
	 * 		- 先查询 TexImageSourceManager 缓存, 如果已存在则直接使用缓存数据
	 * 		- 缓存未命中时, 创建 HTMLImageElement 并设置 crossOrigin 以支持跨域图片
	 * 		- 将 imageId 和 fileHashUuid 存储在 image.dataset 中,  以便在 onload 回调中获取(闭包引用的补充方案)
	 * 		- 图片加载成功后, 将其封装为 TexImageSourceTemplate 并存入全局缓存
	 * 		- 调用 flushImageData 通知调用方并触发下一个任务
	 */
	private loadImageDataURL(imageId: string, fileHashUuid: string, imageDataURL: string): void {
		const texImageSourceTemplate: TexImageSourceTemplate = TexImageSourceManager.getInstance().getTexImageSourceCache(fileHashUuid)
		if (texImageSourceTemplate) {
			this.flushImageData(imageId, texImageSourceTemplate.fileHashUuid, texImageSourceTemplate.texImageSource)
			return
		}
		const self = this
		const image: HTMLImageElement = new Image()
		image.crossOrigin = 'anonymous'
		image.dataset.imageId = imageId
		image.dataset.fileHashUuid = fileHashUuid
		image.onload = function (e: Event): void {
			const fileHashUuid: string = (image as HTMLImageElement).dataset.fileHashUuid!
			const texImageSourceTemplate: TexImageSourceTemplate = new TexImageSourceTemplate(fileHashUuid, image as HTMLImageElement)
			TexImageSourceManager.getInstance().addTexImageSourceCache(fileHashUuid, texImageSourceTemplate)
			self.flushImageData(imageId, texImageSourceTemplate.fileHashUuid, image)
		}
		image.onerror = function (e: string | Event): void {
			console.error(e)
		}
		image.src = imageDataURL
	}

	private flushImageData(imageId: string, fileHashUuid: string, texImageSourceTemplate: TexImageSource): void {
		const flushCallback: TFlushCallback = this._flushCallbacks.shift()!
		if (flushCallback instanceof Function) {
			flushCallback(imageId, fileHashUuid, texImageSourceTemplate)
		}
		if (this._taskDataList.length && !this._isRuning) {
			const itemData: {
				imageId: string
				fileHashUuid: string
				imageDataURL: string
			} = this._taskDataList.shift()!
			if (itemData) {
				this.loadImageDataURL(itemData.imageId, itemData.fileHashUuid, itemData.imageDataURL)
			}
		}
	}
}
