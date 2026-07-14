import { D2RectToolkit } from '../../../algorithm/geometry/D2RectToolkit'
import { BBox2Creator } from '../../../algorithm/geometry/BBox2Creator'
import { Constant } from '../../../Constant'
import { BBox2 } from '../../../engine/algorithm/geometry/bbox/BBox2'
import { Vector2 } from '../../../engine/algorithm/geometry/vector/Vector2'
import { Color } from '../../../engine/common/Color'
import { getHashIden } from '../../../engine/utils/Utils'
import { D2ImageModelSource } from './D2ImageModelSource'

export type TBuildD2ImageModelOptionalParam = {
	isShowStroke: boolean
	strokeWidth: number
	strokeColor: Color
	alpha: number
	rotation: number
	isFlipX: boolean
	isFlipY: boolean
	isEnableSelect: boolean
}

export function createBuildD2ImageModelOptionalParam(optional: Partial<TBuildD2ImageModelOptionalParam> = {}): TBuildD2ImageModelOptionalParam {
	return {
		isShowStroke: false,
		strokeWidth: 0,
		strokeColor: new Color(0, 0, 0, 1),
		alpha: 1.0,
		rotation: 0,
		isFlipX: false,
		isFlipY: false,
		isEnableSelect: true,
		...optional,
	}
}

export function buildD2ImageModel(
	layerItemId: string,
	position: Vector2,
	fileHashUuid: string,
	imageDataURL: string,
	width: number,
	height: number,
	optional: Partial<TBuildD2ImageModelOptionalParam> = {}
): D2ImageModel {
	const locSetting: TBuildD2ImageModelOptionalParam = createBuildD2ImageModelOptionalParam(optional)
	const elementItemId: string = Constant.globalIdenManager.getElementIden()
	const elementModelItem: D2ImageModel = new D2ImageModel(
		elementItemId,
		layerItemId,
		fileHashUuid,
		imageDataURL,
		position,
		width,
		height,
		locSetting.isShowStroke,
		locSetting.strokeWidth,
		locSetting.strokeColor,
		locSetting.alpha,
		locSetting.rotation,
		locSetting.isFlipX,
		locSetting.isFlipY,
		locSetting.isEnableSelect
	)
	return elementModelItem
}

export class D2ImageModel extends D2ImageModelSource {
	private _refreshToken: string
	private _isShowStroke: boolean
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
		isShowStroke: boolean = false,
		strokeWidth: number = 0,
		strokeColor: Color = new Color(0, 0, 0, 1),
		alpha: number = 1.0,
		rotation: number = 0,
		isFlipX: boolean = false,
		isFlipY: boolean = false,
		isEnableSelect: boolean = true
	) {
		super(fileHashUuid, imageDataURL)
		this._isShowStroke = isShowStroke
		this._strokeWidth = strokeWidth
		this._strokeColor = strokeColor
		this._width = width
		this._height = height
		this.elementItemId = elementItemId
		this.layerItemId = layerItemId
		this.alpha = alpha
		this.position = position
		this.rotation = rotation
		this.isFlipX = isFlipX
		this.isFlipY = isFlipY
		this.isEnableSelect = isEnableSelect
		this.bbox2 = BBox2Creator.createD2ImageBbox2(this.leftUp, this.rightUp, this.leftDown, this.rightDown)
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

	public get isShowStroke(): boolean {
		return this._isShowStroke
	}
	public set isShowStroke(value: boolean) {
		this._isShowStroke = value
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

	public get rightDown(): Vector2 {
		return Vector2.ORIGIN.add(new Vector2(this.width, -this.height)).multiplyMatrix4(this.matrix)
	}

	public get leftDown(): Vector2 {
		return Vector2.ORIGIN.add(new Vector2(0, -this.height)).multiplyMatrix4(this.matrix)
	}

	public getBBox2(): BBox2 {
		return this.bbox2
	}

	public updatePosition(value: Vector2): void {
		super.position = value
		this.bbox2 = BBox2Creator.createD2ImageBbox2(this.leftUp, this.rightUp, this.leftDown, this.rightDown)
	}

	public updateRotation(value: number): void {
		super.rotation = value
		this.bbox2 = BBox2Creator.createD2ImageBbox2(this.leftUp, this.rightUp, this.leftDown, this.rightDown)
	}

	public updateIsFlipX(value: boolean): void {
		super.isFlipX = value
		this.bbox2 = BBox2Creator.createD2ImageBbox2(this.leftUp, this.rightUp, this.leftDown, this.rightDown)
	}

	public updateIsFlipY(value: boolean): void {
		super.isFlipY = value
		this.bbox2 = BBox2Creator.createD2ImageBbox2(this.leftUp, this.rightUp, this.leftDown, this.rightDown)
	}

	public updateBBox2(): BBox2 {
		this.bbox2 = BBox2Creator.createD2ImageBbox2(this.leftUp, this.rightUp, this.leftDown, this.rightDown)
		return this.bbox2
	}

	public isInGraphical(x: number, y: number): boolean {
		if (this.isEnableSelect === false) {
			return false
		}
		return D2RectToolkit.isPointOnRect([this.leftUp, this.rightUp, this.rightDown, this.leftDown], 0, new Vector2(x, y))
	}

	public updateRefreshToken(): void {
		this.refreshToken = getHashIden()
	}
}
