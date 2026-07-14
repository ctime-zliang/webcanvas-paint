import { Constant } from '../Constant'
import { BaseInterface } from '../controller/BaseInterface'
import { TexImageSourceManager, TexImageSourceTemplate } from '../manager/TexImageSourceManager'
import { ECoreEngineType } from '../engine/config/CommonProfile'

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
			if (Constant.systemConfig.coreEngineType === ECoreEngineType.WEBGL || Constant.systemConfig.coreEngineType === ECoreEngineType.WEBGPU) {
				const fileHashUuid: string = (image as HTMLImageElement).dataset.fileHashUuid!
				const texImageSourceTemplate: TexImageSourceTemplate = new TexImageSourceTemplate(fileHashUuid, image as HTMLImageElement)
				TexImageSourceManager.getInstance().addTexImageSourceCache(fileHashUuid, texImageSourceTemplate)
				self.flushImageData(imageId, texImageSourceTemplate.fileHashUuid, image)
				return
			}
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
