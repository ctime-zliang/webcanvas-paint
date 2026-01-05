import { ED2ElementType } from '../../../config/D2ElementProfile'
import { BBox2 } from '../../../engine/algorithm/geometry/bbox/BBox2'
import { Vector2 } from '../../../engine/algorithm/geometry/vector/Vector2'
import { Color } from '../../../engine/common/Color'
import { ECanvas2DLineCap } from '../../../engine/config/PrimitiveProfile'
import { Primitive } from '../../../algorithm/geometry/primitives/Primitive'
import { Line } from '../../../algorithm/geometry/primitives/Line'
import { ElementModelItemBase } from './elementBase/ElementModelItemBase'
import { D2CrossRelationShips } from '../../../algorithm/geometry/D2CrossRelationShips'
import { Constant } from '../../../Constant'
import { BBox2Creator } from '../../../algorithm/geometry/utils/BBox2Creator'
import { D2DashedSegUtils } from './utils/D2DashedSegUtils'

export function buildD2CircleModel(
	layerItemId: string,
	centerPoint: Vector2,
	radius: number,
	strokeWidth: number = 1,
	strokeColor: Color = new Color(0, 0, 0, 1),
	isFill: boolean = false,
	fillColor: Color = Color.createByAlpha(0),
	alpha: number = 1.0,
	isSolid: boolean = true,
	lineCap: ECanvas2DLineCap = ECanvas2DLineCap.ROUND,
	isFixedStrokeWidth: boolean = false
): D2CircleModel {
	const elementItemId: string = Constant.globalIdenManager.getElementIden()
	const elementModelItem: D2CircleModel = new D2CircleModel(
		elementItemId,
		layerItemId,
		centerPoint,
		radius,
		strokeWidth,
		strokeColor,
		isFill,
		fillColor,
		alpha,
		isSolid,
		lineCap,
		isFixedStrokeWidth
	)
	return elementModelItem
}

export class D2CircleModel extends ElementModelItemBase {
	private _centerPoint: Vector2
	private _radius: number
	private _strokeWidth: number
	private _strokeColor: Color
	private _fillColor: Color
	private _isSolid: boolean
	private _lineCap: ECanvas2DLineCap
	private _isFill: boolean
	private _segSize: number
	private _gapSize: number
	private _fixedStrokeWidth: boolean
	constructor(
		elementItemId: string,
		layerItemId: string,
		centerPoint: Vector2,
		radius: number,
		strokeWidth: number,
		strokeColor: Color = new Color(0, 0, 0, 1),
		isFill: boolean = false,
		fillColor: Color = new Color(0, 0, 0, 0),
		alpha: number = 1.0,
		isSolid: boolean = true,
		lineCap: ECanvas2DLineCap = ECanvas2DLineCap.ROUND,
		isFixedStrokeWidth: boolean = false,
		bbox2?: BBox2
	) {
		super(elementItemId, layerItemId)
		this.modelType = ED2ElementType.D2Circle
		this._centerPoint = centerPoint
		this._radius = radius
		this._strokeWidth = strokeWidth
		this._strokeColor = strokeColor
		this._fillColor = fillColor
		this._lineCap = lineCap
		this._isFill = isFill
		this._isSolid = isSolid
		const { segSize, gapSize } = D2DashedSegUtils.updateDashedSegProfile(this._lineCap, this._strokeWidth)
		this._segSize = segSize
		this._gapSize = gapSize
		this._fixedStrokeWidth = isFixedStrokeWidth
		if (!bbox2) {
			this.bbox2 = BBox2Creator.createD2CircleBbox2(this._centerPoint, this._radius, this._strokeWidth)
		}
		this.alpha = alpha
	}

	public get centerPoint(): Vector2 {
		return this._centerPoint
	}
	public set centerPoint(value: Vector2) {
		this._centerPoint = value
	}

	public get radius(): number {
		return this._radius
	}
	public set radius(value: number) {
		this._radius = value
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

	public get fillColor(): Color {
		return this._fillColor
	}
	public set fillColor(value: Color) {
		this._fillColor = value
	}

	public get lineCap(): ECanvas2DLineCap {
		return this._lineCap
	}
	public set lineCap(value: ECanvas2DLineCap) {
		this._lineCap = value
		const { segSize, gapSize } = D2DashedSegUtils.updateDashedSegProfile(this._lineCap, this._strokeWidth)
		this._segSize = segSize
		this._gapSize = gapSize
	}

	public get isSolid(): boolean {
		return this._isSolid
	}
	public set isSolid(value: boolean) {
		this._isSolid = value
	}

	public get isFill(): boolean {
		return this._isFill
	}
	public set isFill(value: boolean) {
		this._isFill = value
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

	public get element(): Primitive {
		return new Line(new Vector2(0, 0), new Vector2(0, 0))
	}

	public getBBox2(): BBox2 {
		return this.bbox2
	}

	public updateBBox2(): BBox2 {
		this.bbox2 = BBox2Creator.createD2CircleBbox2(this.centerPoint, this.radius, this.strokeWidth)
		return this.bbox2
	}

	public isInGraphical(x: number, y: number): boolean {
		return D2CrossRelationShips.pointAndCirlce(new Vector2(x, y), this.radius, this.centerPoint, this.strokeWidth, this.isFill)
	}
}
