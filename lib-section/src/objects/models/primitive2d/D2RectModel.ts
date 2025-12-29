import { ED2ElementType } from '../../../config/D2ElementProfile'
import { BBox2 } from '../../../engine/algorithm/geometry/bbox/BBox2'
import { Color } from '../../../engine/common/Color'
import { ECanvas2DLineCap } from '../../../engine/config/PrimitiveProfile'
import { updateDashedSegProfile } from '../../../utils/Utils'
import { ElementModelItemBase } from './elementBase/ElementModelItemBase'
import { Vector2 } from '../../../engine/algorithm/geometry/vector/Vector2'
import { createD2RectBbox2 } from '../../../algorithm/geometry/utils/bbox2Utils'
import { D2CrossRelationShips } from '../../../algorithm/geometry/D2CrossRelationShips'
import { Constant } from '../../../Constant'

export function buildD2RectModel(
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
	isFlipY: boolean = false
): D2RectModel {
	const elementItemId: string = Constant.globalIdenManager.getElementIden()
	const elementModelItem: D2RectModel = new D2RectModel(
		elementItemId,
		layerItemId,
		position,
		width,
		height,
		strokeWidth,
		strokeColor,
		isFill,
		fillColor,
		alpha,
		isSolid,
		borderRadius,
		isFixedStrokeWidth,
		rotation,
		isFlipX,
		isFlipY
	)
	return elementModelItem
}

export class D2RectModel extends ElementModelItemBase {
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
		bbox2?: BBox2
	) {
		super(elementItemId, layerItemId)
		this.modelType = ED2ElementType.D2Rect
		this._width = width
		this._height = height
		this._strokeWidth = strokeWidth
		this._strokeColor = strokeColor
		this._isFill = isFill
		this._fillColor = fillColor
		this._borderRadius = borderRadius
		this._isSolid = isSolid
		const { segSize, gapSize } = updateDashedSegProfile(ECanvas2DLineCap.ROUND, this._strokeWidth)
		this._segSize = segSize
		this._gapSize = gapSize
		this._fixedStrokeWidth = isFixedStrokeWidth
		this.position = position
		this.rotation = rotation
		this.isFlipX = isFlipX
		this.isFlipY = isFlipY
		this.alpha = alpha
		if (!bbox2) {
			this.bbox2 = createD2RectBbox2(this.position, this.strokeWidth, this._width, this._height)
		}
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
		this.bbox2 = createD2RectBbox2(this.position, this.strokeWidth, this.width, this.height)
		return this.bbox2
	}

	public isInGraphical(x: number, y: number): boolean {
		if (this.isFill) {
			return x >= this.bbox2.minX && x <= this.bbox2.maxX && y >= this.bbox2.minY && y <= this.bbox2.maxY
		}
		const upperLineStart: Vector2 = new Vector2(this.position.x, this.position.y)
		const upperLineEnd: Vector2 = new Vector2(this.position.x + this.width, this.position.y)
		const rightLineStart: Vector2 = new Vector2(this.position.x + this.width, this.position.y)
		const rightLineEnd: Vector2 = new Vector2(this.position.x + this.width, this.position.y - this.height)
		const bottomLineStart: Vector2 = new Vector2(this.position.x, this.position.y - this.height)
		const bottomLineEnd: Vector2 = new Vector2(this.position.x + this.width, this.position.y - this.height)
		const leftLineStart: Vector2 = new Vector2(this.position.x, this.position.y)
		const leftLineEnd: Vector2 = new Vector2(this.position.x, this.position.y - this.height)
		if (D2CrossRelationShips.pointAndLine(new Vector2(x, y), upperLineStart, upperLineEnd, this.strokeWidth)) {
			return true
		}
		if (D2CrossRelationShips.pointAndLine(new Vector2(x, y), rightLineStart, rightLineEnd, this.strokeWidth)) {
			return true
		}
		if (D2CrossRelationShips.pointAndLine(new Vector2(x, y), bottomLineStart, bottomLineEnd, this.strokeWidth)) {
			return true
		}
		if (D2CrossRelationShips.pointAndLine(new Vector2(x, y), leftLineStart, leftLineEnd, this.strokeWidth)) {
			return true
		}
		return false
	}
}
