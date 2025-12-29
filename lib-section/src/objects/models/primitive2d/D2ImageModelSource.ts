import { ED2ElementType } from '../../../config/D2ElementProfile'
import { BBox2 } from '../../../engine/algorithm/geometry/bbox/BBox2'
import { ElementModelItemBase } from './elementBase/ElementModelItemBase'

export class D2ImageModelSource extends ElementModelItemBase {
	private _contentReady: boolean
	private _fileHashUuid: string
	private _texImageSource: TexImageSource
	private _imageDataURL: string
	constructor(fileHashUuid: string, imageDataURL: string) {
		super(undefined!, undefined!)
		this.modelType = ED2ElementType.D2Image
		this._contentReady = false
		this._fileHashUuid = fileHashUuid
		this._imageDataURL = imageDataURL
		this._texImageSource = null!
		this.bbox2 = new BBox2(0, 0, 0, 0)
	}

	public get contentReady(): boolean {
		return this._contentReady
	}
	public set contentReady(value: boolean) {
		this._contentReady = value
	}

	public get fileHashUuid(): string {
		return this._fileHashUuid
	}
	public set fileHashUuid(value: string) {
		this._fileHashUuid = value
	}

	public get texImageSource(): TexImageSource {
		return this._texImageSource
	}
	public set texImageSource(value: TexImageSource) {
		this._texImageSource = value
	}

	public get imageDataURL(): string {
		return this._imageDataURL
	}
	public set imageDataURL(value: string) {
		this._imageDataURL = value
	}

	public getBBox2(): BBox2 {
		return this.bbox2
	}

	public updateBBox2(): BBox2 {
		return this.bbox2
	}

	public isInGraphical(x: number, y: number): boolean {
		return this.bbox2.minX <= x && this.bbox2.maxX >= x && this.bbox2.minY <= y && this.bbox2.maxY >= y
	}

	public updateTexImageSource(texImageSource: TexImageSource): void {
		this.texImageSource = texImageSource
	}
}
