import { BBox2 } from '../../../engine/algorithm/geometry/bbox/BBox2'
import { Color } from '../../../engine/common/Color'
import { getHashIden } from '../../../engine/utils/Utils'
import { ED2FontStyle } from '../../../engine/config/PrimitiveProfile'
import { D2TextModelVertex } from './D2TextModelVertex'
import { Vector2 } from '../../../engine/algorithm/geometry/vector/Vector2'
import { Constant } from '../../../Constant'
import { BBox2Creator } from '../../../algorithm/geometry/BBox2Creator'
import { D2RectToolkit } from '../../../algorithm/geometry/D2RectToolkit'

export type TBuildD2TextModelOptionalParam = {
	fontFamily: string
	fontStyle: ED2FontStyle
	fontSize: number
	fontWeight: number
	strokeColor: Color
	alpha: number
	rotation: number
	isEnableSelect: boolean
}

export type TBuildD2TextModelOptionalStyleSettingParam = {
	backgourdColor: Color
	borderRadius: number
	padding: { left: number; top: number; bottom: number; right: number }
	lineHeight: number
}

export const DEFAULT_FONT_SIZE: number = 5

export function createD2TextModelStyleDefaultSetting(fontSize: number): TBuildD2TextModelOptionalStyleSettingParam {
	return {
		backgourdColor: new Color(0, 0, 0, 0),
		borderRadius: 0,
		padding: { left: 1, top: 1, bottom: 1, right: 1 },
		lineHeight: fontSize,
	}
}

export function createBuildD2TextModelOptionalParam(
	optional: Partial<TBuildD2TextModelOptionalParam & Partial<{ styleSetting: TBuildD2TextModelOptionalStyleSettingParam }>> = {},
	fontSize: number = DEFAULT_FONT_SIZE,
	styleSetting: TBuildD2TextModelOptionalStyleSettingParam = createD2TextModelStyleDefaultSetting(fontSize)
): TBuildD2TextModelOptionalParam & Partial<{ styleSetting: TBuildD2TextModelOptionalStyleSettingParam }> {
	return {
		fontFamily: 'auto',
		fontStyle: ED2FontStyle.NORMAL,
		fontSize,
		fontWeight: 100,
		strokeColor: Color.WHITE,
		alpha: 1.0,
		rotation: 0,
		isEnableSelect: true,
		...optional,
		styleSetting,
	}
}

export function buildD2TextModel(
	layerItemId: string,
	position: Vector2,
	content: string,
	optional: Partial<TBuildD2TextModelOptionalParam & Partial<{ styleSetting: TBuildD2TextModelOptionalStyleSettingParam }>> = {}
): D2TextModel {
	const fontSize: number = optional.fontSize || DEFAULT_FONT_SIZE
	const styleSetting: TBuildD2TextModelOptionalStyleSettingParam = {
		...createD2TextModelStyleDefaultSetting(fontSize),
		...(optional.styleSetting || {}),
	}
	const locSetting: TBuildD2TextModelOptionalParam & Partial<{ styleSetting: TBuildD2TextModelOptionalStyleSettingParam }> =
		createBuildD2TextModelOptionalParam(optional, fontSize, styleSetting)
	const elementItemId: string = Constant.globalIdenManager.getElementIden()
	const elementModelItem: D2TextModel = new D2TextModel(
		elementItemId,
		layerItemId,
		position,
		content,
		locSetting.fontFamily,
		locSetting.fontStyle,
		locSetting.fontSize,
		locSetting.fontWeight,
		locSetting.strokeColor,
		locSetting.alpha,
		locSetting.styleSetting,
		locSetting.rotation,
		false,
		false,
		locSetting.isEnableSelect
	)
	return elementModelItem
}

export class D2TextModel extends D2TextModelVertex {
	private _refreshToken: string
	private _width: number
	private _height: number
	private _strokeColor: Color
	private _styleSetting: TBuildD2TextModelOptionalStyleSettingParam
	constructor(
		elementItemId: string,
		layerItemId: string,
		position: Vector2,
		content: string,
		fontFamily: string = 'auto',
		fontStyle: ED2FontStyle = ED2FontStyle.NORMAL,
		fontSize: number = 10,
		fontWeight: number = 100,
		strokeColor: Color = Color.WHITE,
		alpha: number = 1.0,
		styleSetting: TBuildD2TextModelOptionalStyleSettingParam = createD2TextModelStyleDefaultSetting(fontSize),
		rotation: number = 0,
		isFlipX: boolean = false,
		isFlipY: boolean = false,
		isEnableSelect: boolean = true
	) {
		super(content, fontSize, fontFamily, fontStyle, fontWeight)
		this._refreshToken = getHashIden()
		this._width = 0
		this._height = 0
		this._strokeColor = strokeColor
		this._styleSetting = styleSetting
		this.elementItemId = elementItemId
		this.layerItemId = layerItemId
		this.bbox2 = new BBox2(0, 0, 0, 0)
		this.alpha = alpha
		this.position = position
		this.rotation = rotation
		this.isFlipX = isFlipX
		this.isFlipY = isFlipY
		this.isEnableSelect = isEnableSelect
		this.fixStyleSetting()
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

	public get strokeColor(): Color {
		return this._strokeColor
	}
	public set strokeColor(value: Color) {
		this._strokeColor = value
	}

	public get styleSetting(): TBuildD2TextModelOptionalStyleSettingParam {
		return this._styleSetting
	}
	public set styleSetting(value: TBuildD2TextModelOptionalStyleSettingParam) {
		this._styleSetting = value
		this.fixStyleSetting()
	}

	public get leftUp(): Vector2 {
		const leftPadding: number = this.contentReady ? this.styleSetting.padding.left || 0 : 0
		const topPadding: number = this.contentReady ? this.styleSetting.padding.top || 0 : 0
		return Vector2.ORIGIN.add(new Vector2(-leftPadding, topPadding)).multiplyMatrix4(this.matrix)
	}

	public get rightUp(): Vector2 {
		const rightPadding: number = this.contentReady ? this.styleSetting.padding.right || 0 : 0
		const topPadding: number = this.contentReady ? this.styleSetting.padding.top || 0 : 0
		return Vector2.ORIGIN.add(new Vector2(this.width, 0)).add(new Vector2(rightPadding, topPadding)).multiplyMatrix4(this.matrix)
	}

	public get rightDown(): Vector2 {
		const rightPadding: number = this.contentReady ? this.styleSetting.padding.right || 0 : 0
		const bottomPadding: number = this.contentReady ? this.styleSetting.padding.bottom || 0 : 0
		return Vector2.ORIGIN.add(new Vector2(this.width, -this.height)).add(new Vector2(rightPadding, -bottomPadding)).multiplyMatrix4(this.matrix)
	}

	public get leftDown(): Vector2 {
		const leftPadding: number = this.contentReady ? this.styleSetting.padding.left || 0 : 0
		const bottomPadding: number = this.contentReady ? this.styleSetting.padding.bottom || 0 : 0
		return Vector2.ORIGIN.add(new Vector2(0, -this.height)).add(new Vector2(-leftPadding, -bottomPadding)).multiplyMatrix4(this.matrix)
	}

	public updateRefreshToken(): void {
		this.refreshToken = getHashIden()
	}

	public updatePosition(value: Vector2): void {
		super.position = value
		this.bbox2 = BBox2Creator.createD2TextBbox2(this.leftUp, this.rightUp, this.leftDown, this.rightDown)
	}

	public updateRotation(value: number): void {
		super.rotation = value
		this.bbox2 = BBox2Creator.createD2TextBbox2(this.leftUp, this.rightUp, this.leftDown, this.rightDown)
	}

	public updateIsFlipX(value: boolean): void {
		super.isFlipX = value
		this.bbox2 = BBox2Creator.createD2TextBbox2(this.leftUp, this.rightUp, this.leftDown, this.rightDown)
	}

	public updateIsFlipY(value: boolean): void {
		super.isFlipY = value
		this.bbox2 = BBox2Creator.createD2TextBbox2(this.leftUp, this.rightUp, this.leftDown, this.rightDown)
	}

	public isInGraphical(x: number, y: number): boolean {
		if (this.isEnableSelect === false) {
			return false
		}
		return D2RectToolkit.isPointOnRect([this.leftUp, this.rightUp, this.rightDown, this.leftDown], 0, new Vector2(x, y))
	}

	private fixStyleSetting(): void {
		if (!this._styleSetting.lineHeight || this._styleSetting.lineHeight < this.fontSize) {
			this._styleSetting.lineHeight = this.fontSize
		}
		if (!this._styleSetting.padding.left || this._styleSetting.padding.left <= 0) {
			this._styleSetting.padding.left = 0
		}
		if (!this._styleSetting.padding.top || this._styleSetting.padding.top <= 0) {
			this._styleSetting.padding.top = 0
		}
		if (!this._styleSetting.padding.right || this._styleSetting.padding.right <= 0) {
			this._styleSetting.padding.right = 0
		}
		if (!this._styleSetting.padding.bottom || this._styleSetting.padding.bottom <= 0) {
			this._styleSetting.padding.bottom = 0
		}
		if (!this._styleSetting.lineHeight || this._styleSetting.lineHeight <= this.fontSize) {
			this._styleSetting.lineHeight = this.fontSize
		}
	}
}
