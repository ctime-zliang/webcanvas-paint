import { ED2ElementType } from '../../../config/D2ElementProfile'
import { BBox2 } from '../../../engine/algorithm/geometry/bbox/BBox2'
import { Color } from '../../../engine/common/Color'
import { getHashIden } from '../../../engine/utils/Utils'
import { ED2FontStyle } from '../../../engine/config/PrimitiveProfile'
import { TRectSurrounded } from '../../../engine/types/Primitive'
import { D2TextModelVertex } from './D2TextModelVertex'
import { Vector2 } from '../../../engine/algorithm/geometry/vector/Vector2'
import { Constant } from '../../../Constant'

export function buildD2TextModel(
	layerItemId: string,
	position: Vector2,
	content: string,
	fontFamily: string = 'auto',
	fontStyle: ED2FontStyle = ED2FontStyle.NORMAL,
	fontSize: number = 10,
	fontWeight: number = 100,
	strokeColor: Color = Color.WHITE,
	alpha: number = 1.0,
	bgColor: Color | null = null!,
	paddingSurrounded: TRectSurrounded = { top: 1, right: 1, bottom: 1, left: 1 },
	rotation: number = 0,
	isFlipX: boolean = false,
	isFlipY: boolean = false
): D2TextModel {
	const elementItemId: string = Constant.globalIdenManager.getElementIden()
	const elementModelItem: D2TextModel = new D2TextModel(
		elementItemId,
		layerItemId,
		position,
		content,
		fontFamily,
		fontStyle,
		fontSize,
		fontWeight,
		strokeColor,
		alpha,
		bgColor,
		paddingSurrounded,
		rotation,
		isFlipX,
		isFlipY
	)
	return elementModelItem
}

export class D2TextModel extends D2TextModelVertex {
	private _refreshToken: string
	private _strokeColor: Color
	private _bgColor: Color | null
	private _paddingSurrounded: TRectSurrounded
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
		bgColor: Color | null = null!,
		paddingSurrounded: TRectSurrounded = { top: 1, right: 1, bottom: 1, left: 1 },
		rotation: number = 0,
		isFlipX: boolean = false,
		isFlipY: boolean = false
	) {
		super(content, fontSize, fontFamily, fontStyle, fontWeight)
		this.elementItemId = elementItemId
		this.layerItemId = layerItemId
		this.modelType = ED2ElementType.D2Text
		this._refreshToken = getHashIden()
		this._strokeColor = strokeColor
		this._bgColor = bgColor
		this._paddingSurrounded = paddingSurrounded
		this.bbox2 = new BBox2(0, 0, 0, 0)
		this.alpha = alpha
		this.position = position
		this.rotation = rotation
		this.isFlipX = isFlipX
		this.isFlipY = isFlipY
	}

	public get refreshToken(): string {
		return this._refreshToken
	}
	public set refreshToken(value: string) {
		this._refreshToken = value
	}

	public get strokeColor(): Color {
		return this._strokeColor
	}
	public set strokeColor(value: Color) {
		this._strokeColor = value
	}

	public get bgColor(): Color | null {
		return this._bgColor
	}
	public set bgColor(value: Color | null) {
		this._bgColor = value
	}

	public get paddingSurrounded(): TRectSurrounded {
		return this._paddingSurrounded
	}
	public set paddingSurrounded(value: TRectSurrounded) {
		this._paddingSurrounded = value
	}

	public updateRefreshToken(): void {
		this.refreshToken = getHashIden()
	}
}
