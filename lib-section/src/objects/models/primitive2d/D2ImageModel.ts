import { createD2ImageBbox2 } from '../../../algorithm/geometry/utils/bbox2Utils'
import { ED2ElementType } from '../../../config/D2ElementProfile'
import { Constant } from '../../../Constant'
import { BBox2 } from '../../../engine/algorithm/geometry/bbox/BBox2'
import { Vector2 } from '../../../engine/algorithm/geometry/vector/Vector2'
import { Color } from '../../../engine/common/Color'
import { getHashIden } from '../../../engine/utils/Utils'
import { D2ImageModelSource } from './D2ImageModelSource'

export function buildD2ImageModel(
	layerItemId: string,
	position: Vector2,
	fileHashUuid: string,
	imageDataURL: string,
	width: number,
	height: number,
	strokeWidth: number = 0,
	strokeColor: Color = new Color(0, 0, 0, 1),
	alpha: number = 1.0,
	rotation: number = 0,
	isFlipX: boolean = false,
	isFlipY: boolean = false
): D2ImageModel {
	const elementItemId: string = Constant.globalIdenManager.getElementIden()
	const elementModelItem: D2ImageModel = new D2ImageModel(
		elementItemId,
		layerItemId,
		fileHashUuid,
		imageDataURL,
		position,
		width,
		height,
		strokeWidth,
		strokeColor,
		alpha,
		rotation,
		isFlipX,
		isFlipY
	)
	return elementModelItem
}

export class D2ImageModel extends D2ImageModelSource {
	private _refreshToken: string
	private _strokeWidth: number
	private _strokeColor: Color
	private _width: number
	private _height: number
	constructor(
		elementItemId: string,
		layerItemId: string,
		fileHashUuid: string,
		imageDataURL: string,
		position: Vector2,
		width: number,
		height: number,
		strokeWidth: number = 0,
		strokeColor: Color = new Color(0, 0, 0, 1),
		alpha: number = 1.0,
		rotation: number = 0,
		isFlipX: boolean = false,
		isFlipY: boolean = false
	) {
		super(fileHashUuid, imageDataURL)
		this.modelType = ED2ElementType.D2Image
		this.elementItemId = elementItemId
		this.layerItemId = layerItemId
		this._strokeWidth = strokeWidth
		this._strokeColor = strokeColor
		this._width = width
		this._height = height
		this.alpha = alpha
		this.position = position
		this.rotation = rotation
		this.isFlipX = isFlipX
		this.isFlipY = isFlipY
		this.bbox2 = createD2ImageBbox2(this.position, this._width, this._height)
	}

	public get refreshToken(): string {
		return this._refreshToken
	}
	public set refreshToken(value: string) {
		this._refreshToken = value
	}

	public get width(): number {
		return this._width
	}
	public set width(value: number) {
		this._width = value
	}

	public get height(): number {
		return this._height
	}
	public set height(value: number) {
		this._height = value
	}

	public get strokeWidth(): number {
		return this._strokeWidth
	}
	public set strokeWidth(value: number) {
		this._strokeWidth = value
	}

	public get strokeColor(): Color {
		return this._strokeColor
	}
	public set strokeColor(value: Color) {
		this._strokeColor = value
	}

	public get leftUp(): Vector2 {
		return Vector2.ORIGIN.multiplyMatrix4(this.matrix)
	}

	public get rightUp(): Vector2 {
		return Vector2.ORIGIN.add(new Vector2(this.width, 0)).multiplyMatrix4(this.matrix)
	}

	public get leftDown(): Vector2 {
		return Vector2.ORIGIN.add(new Vector2(0, -this.height)).multiplyMatrix4(this.matrix)
	}

	public get rightDown(): Vector2 {
		return Vector2.ORIGIN.add(new Vector2(this.width, -this.height)).multiplyMatrix4(this.matrix)
	}

	public getBBox2(): BBox2 {
		return this.bbox2
	}

	public updateBBox2(): BBox2 {
		this.bbox2 = createD2ImageBbox2(this.position, this._width, this._height)
		return this.bbox2
	}

	public isInGraphical(x: number, y: number): boolean {
		return this.bbox2.minX <= x && this.bbox2.maxX >= x && this.bbox2.minY <= y && this.bbox2.maxY >= y
	}

	public updateRefreshToken(): void {
		this.refreshToken = getHashIden()
	}
}
