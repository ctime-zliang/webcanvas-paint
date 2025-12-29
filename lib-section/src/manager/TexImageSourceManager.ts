import { BaseManager } from './BaseManage'

export class TexImageSourceTemplate {
	private _fileHashUuid: string
	private _texImageSource: TexImageSource
	private _imageBitMap: ImageBitmap
	constructor(fileHashUuid: string, texImageSource: TexImageSource, imageBitMap: ImageBitmap) {
		this._fileHashUuid = fileHashUuid
		this._texImageSource = texImageSource
		this._imageBitMap = imageBitMap
	}

	public get fileHashUuid(): string {
		return this._fileHashUuid
	}

	public get texImageSource(): TexImageSource {
		return this._texImageSource
	}

	public get imageBitMap(): ImageBitmap {
		return this._imageBitMap
	}
}

export class TexImageSourceManager extends BaseManager<TexImageSourceTemplate> {
	private static instance: TexImageSourceManager
	public static getInstance(): TexImageSourceManager {
		if (TexImageSourceManager.instance === undefined) {
			TexImageSourceManager.instance = new TexImageSourceManager()
		}
		return TexImageSourceManager.instance
	}

	constructor() {
		super()
	}

	public addTexImageSourceCache(hashId: string, texImageSourceTemplate: TexImageSourceTemplate): void {
		this.items.set(hashId, texImageSourceTemplate)
	}

	public getTexImageSourceCache(hashId: string): TexImageSourceTemplate {
		let texImageSourceTemplate: TexImageSourceTemplate = this.items.get(hashId)!
		if (!texImageSourceTemplate) {
			return null!
		}
		return texImageSourceTemplate
	}

	public quit(): void {
		super.quit()
		TexImageSourceManager.instance = undefined!
	}
}
