import { ED2ElementType } from '../../../config/D2ElementProfile'
import { BBox2 } from '../../../engine/algorithm/geometry/bbox/BBox2'
import { Color } from '../../../engine/common/Color'
import { ESweep } from '../../../engine/config/CommonProfile'
import { ECanvas2DLineCap } from '../../../engine/config/PrimitiveProfile'
import { Primitive } from '../../../algorithm/geometry/primitives/Primitive'
import { Line } from '../../../algorithm/geometry/primitives/Line'
import { updateDashedSegProfile } from '../../../utils/Utils'
import { ElementModelItemBase } from './elementBase/ElementModelItemBase'
import { Vector2 } from '../../../engine/algorithm/geometry/vector/Vector2'
import { createD2ArcBbox2 } from '../../../algorithm/geometry/utils/bbox2Utils'
import { D2CrossRelationShips } from '../../../algorithm/geometry/D2CrossRelationShips'
import { Constant } from '../../../Constant'

export function buildD2ArcModel(
	layerItemId: string,
	centerPoint: Vector2,
	radius: number,
	startAngle: number,
	endAngle: number,
	sweep: ESweep,
	strokeWidth: number = 1,
	strokeColor: Color = new Color(0, 0, 0, 1),
	isFill: boolean = false,
	fillColor: Color = Color.createByAlpha(0),
	alpha: number = 1.0,
	isSolid: boolean = true,
	lineCap: ECanvas2DLineCap = ECanvas2DLineCap.ROUND,
	isFixedStrokeWidth: boolean = false
): D2ArcModel {
	const elementItemId: string = Constant.globalIdenManager.getElementIden()
	const elementModelItem: D2ArcModel = new D2ArcModel(
		elementItemId,
		layerItemId,
		centerPoint,
		radius,
		startAngle,
		endAngle,
		sweep,
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

export class D2ArcModel extends ElementModelItemBase {
	private _centerPoint: Vector2
	private _radius: number
	private _startAngle: number
	private _endAngle: number
	private _sweep: ESweep
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
		startAngle: number,
		endAngle: number,
		sweep: ESweep,
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
		this.modelType = ED2ElementType.D2Arc
		this._centerPoint = centerPoint
		this._radius = radius
		this._startAngle = startAngle
		this._endAngle = endAngle
		this._sweep = sweep
		this._strokeWidth = strokeWidth
		this._strokeColor = strokeColor
		this._fillColor = fillColor
		this._lineCap = lineCap
		this._isSolid = isSolid
		this._isFill = isFill
		const { segSize, gapSize } = updateDashedSegProfile(this._lineCap, this._strokeWidth)
		this._segSize = segSize
		this._gapSize = gapSize
		this._fixedStrokeWidth = isFixedStrokeWidth
		if (!bbox2) {
			this.bbox2 = createD2ArcBbox2(this._centerPoint, this._radius, this._strokeWidth)
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

	public get startAngle(): number {
		return this._startAngle
	}
	public set startAngle(value: number) {
		this._startAngle = value
	}

	public get endAngle(): number {
		return this._endAngle
	}
	public set endAngle(value: number) {
		this._endAngle = value
	}

	public get sweep(): ESweep {
		return this._sweep
	}
	public set sweep(value: ESweep) {
		this._sweep = value
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

	public get startPoint(): Vector2 {
		return this.centerPoint.add(new Vector2(Math.cos(this.startAngle), Math.sin(this.startAngle)).mul(this.radius))
	}

	public get endPoint(): Vector2 {
		return this.centerPoint.add(new Vector2(Math.cos(this.endAngle), Math.sin(this.endAngle)).mul(this.radius))
	}

	public get lineCap(): ECanvas2DLineCap {
		return this._lineCap
	}
	public set lineCap(value: ECanvas2DLineCap) {
		this._lineCap = value
		const { segSize, gapSize } = updateDashedSegProfile(this._lineCap, this._strokeWidth)
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
		this.bbox2 = createD2ArcBbox2(this.centerPoint, this.radius, this.strokeWidth)
		return this.bbox2
	}

	public isInGraphical(x: number, y: number): boolean {
		return D2CrossRelationShips.pointAndArc(
			new Vector2(x, y),
			this.startAngle,
			this.endAngle,
			this.sweep,
			this.radius,
			this.centerPoint,
			this.strokeWidth,
			this.isFill
		)
	}
}
