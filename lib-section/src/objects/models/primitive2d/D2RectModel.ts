import { ED2ElementType } from '../../../config/D2ElementProfile'
import { BBox2 } from '../../../engine/algorithm/geometry/bbox/BBox2'
import { Color } from '../../../engine/common/Color'
import { ECanvasD2LineCap } from '../../../engine/config/PrimitiveProfile'
import { D2ElementModelItemBase } from './elementBase/D2ElementModelItemBase'
import { Vector2 } from '../../../engine/algorithm/geometry/vector/Vector2'
import { Constant } from '../../../Constant'
import { BBox2Creator } from '../../../algorithm/geometry/BBox2Creator'
import { D2DashedSegUtils } from './utils/D2DashedSegUtils'
import { D2RectToolkit } from '../../../algorithm/geometry/D2RectToolkit'

export type TBuildD2RectModelOptionalParam = {
	strokeWidth: number
	strokeColor: Color
	isFill: boolean
	fillColor: Color
	alpha: number
	isSolid: boolean
	borderRadius: number
	isFixedStrokeWidth: boolean
	rotation: number
	isFlipX: boolean
	isFlipY: boolean
	isEnableSelect: boolean
}

export function createBuildD2RectModelOptionalParam(optional: Partial<TBuildD2RectModelOptionalParam> = {}): TBuildD2RectModelOptionalParam {
	return {
		strokeWidth: 1,
		strokeColor: Color.WHITE,
		isFill: false,
		fillColor: Color.WHITE,
		alpha: 1.0,
		isSolid: true,
		borderRadius: 0,
		isFixedStrokeWidth: false,
		rotation: 0,
		isFlipX: false,
		isFlipY: false,
		isEnableSelect: true,
		...optional,
	}
}

export function buildD2RectModel(
	layerItemId: string,
	position: Vector2,
	width: number,
	height: number,
	optional: Partial<TBuildD2RectModelOptionalParam> = {}
): D2RectModel {
	const locSetting: TBuildD2RectModelOptionalParam = createBuildD2RectModelOptionalParam(optional)
	const elementItemId: string = Constant.globalIdenManager.getElementIden()
	const elementModelItem: D2RectModel = new D2RectModel(
		elementItemId,
		layerItemId,
		position,
		width,
		height,
		locSetting.strokeWidth,
		locSetting.strokeColor,
		locSetting.isFill,
		locSetting.fillColor,
		locSetting.alpha,
		locSetting.isSolid,
		locSetting.borderRadius,
		locSetting.isFixedStrokeWidth,
		locSetting.rotation,
		locSetting.isFlipX,
		locSetting.isFlipY,
		locSetting.isEnableSelect
	)
	return elementModelItem
}

export class D2RectModel extends D2ElementModelItemBase {
	private _width: number
	private _height: number
	private _strokeWidth: number
	private _strokeColor: Color
	private _isFill: boolean
	private _fillColor: Color
	private _isSolid: boolean
	private _borderRadius: number
	private _segSize: number
	private _gapSize: number
	private _fixedStrokeWidth: boolean
	constructor(
		elementItemId: string,
		layerItemId: string,
		position: Vector2,
		width: number,
		height: number,
		strokeWidth: number = 1,
		strokeColor: Color = new Color(0, 0, 0, 1),
		isFill: boolean = false,
		fillColor: Color = new Color(0, 0, 0, 1),
		alpha: number = 1.0,
		isSolid: boolean = true,
		borderRadius: number = 0,
		isFixedStrokeWidth: boolean = false,
		rotation: number = 0,
		isFlipX: boolean = false,
		isFlipY: boolean = false,
		isEnableSelect: boolean = true
	) {
		super(elementItemId, layerItemId)
		this._width = width
		this._height = height
		this._strokeWidth = strokeWidth
		this._strokeColor = strokeColor
		this._isFill = isFill
		this._fillColor = fillColor
		this._borderRadius = borderRadius
		this._isSolid = isSolid
		const { segSize, gapSize } = D2DashedSegUtils.updateDashedSegProfile(ECanvasD2LineCap.ROUND, this._strokeWidth)
		this._segSize = segSize
		this._gapSize = gapSize
		this._fixedStrokeWidth = isFixedStrokeWidth
		this.modelType = ED2ElementType.D2Rect
		this.position = position
		this.rotation = rotation
		this.isFlipX = isFlipX
		this.isFlipY = isFlipY
		this.alpha = alpha
		this.isEnableSelect = isEnableSelect
		this.bbox2 = BBox2Creator.createD2RectBbox2(this.leftUp, this.rightUp, this.leftDown, this.rightDown)
	}

	public get width(): number {
		return this._width
	}
	public set width(value: number) {
		this._width = value
		this.bbox2 = BBox2Creator.createD2RectBbox2(this.leftUp, this.rightUp, this.leftDown, this.rightDown)
	}

	public get height(): number {
		return this._height
	}
	public set height(value: number) {
		this._height = value
		this.bbox2 = BBox2Creator.createD2RectBbox2(this.leftUp, this.rightUp, this.leftDown, this.rightDown)
	}

	public get strokeWidth(): number {
		return this._strokeWidth
	}
	public set strokeWidth(value: number) {
		this._strokeWidth = value
		this.bbox2 = BBox2Creator.createD2RectBbox2(this.leftUp, this.rightUp, this.leftDown, this.rightDown)
	}

	public get strokeColor(): Color {
		return this._strokeColor
	}
	public set strokeColor(value: Color) {
		this._strokeColor = value
	}

	public get isFill(): boolean {
		return this._isFill
	}
	public set isFill(value: boolean) {
		this._isFill = value
	}

	public get fillColor(): Color {
		return this._fillColor
	}
	public set fillColor(value: Color) {
		this._fillColor = value
	}

	public get borderRadius(): number {
		return this._borderRadius
	}
	public set borderRadius(value: number) {
		this._borderRadius = value
	}

	public get isSolid(): boolean {
		return this._isSolid
	}
	public set isSolid(value: boolean) {
		this._isSolid = value
	}

	public get segSize(): number {
		return this._segSize
	}
	public set segSize(value: number) {
		this._segSize = value
	}

	public get gapSize(): number {
		return this._gapSize
	}
	public set gapSize(value: number) {
		this._gapSize = value
	}

	public get isFixedStrokeWidth(): boolean {
		return this._fixedStrokeWidth
	}
	public set isFixedStrokeWidth(value: boolean) {
		this._fixedStrokeWidth = value
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
		this.bbox2 = BBox2Creator.createD2RectBbox2(this.leftUp, this.rightUp, this.leftDown, this.rightDown)
	}

	public updateRotation(value: number): void {
		super.rotation = value
		this.bbox2 = BBox2Creator.createD2RectBbox2(this.leftUp, this.rightUp, this.leftDown, this.rightDown)
	}

	public updateIsFlipX(value: boolean): void {
		super.isFlipX = value
		this.bbox2 = BBox2Creator.createD2RectBbox2(this.leftUp, this.rightUp, this.leftDown, this.rightDown)
	}

	public updateIsFlipY(value: boolean): void {
		super.isFlipY = value
		this.bbox2 = BBox2Creator.createD2RectBbox2(this.leftUp, this.rightUp, this.leftDown, this.rightDown)
	}

	public updateBBox2(): BBox2 {
		this.bbox2 = BBox2Creator.createD2RectBbox2(this.leftUp, this.rightUp, this.leftDown, this.rightDown)
		return this.bbox2
	}

	public isInGraphical(x: number, y: number): boolean {
		if (this.isEnableSelect === false) {
			return false
		}
		return D2RectToolkit.isPointOnRect([this.leftUp, this.rightUp, this.rightDown, this.leftDown], 0, new Vector2(x, y))
	}
}
