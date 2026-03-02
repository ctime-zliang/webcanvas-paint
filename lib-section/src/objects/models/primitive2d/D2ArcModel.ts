import { ED2ElementType } from '../../../config/D2ElementProfile'
import { BBox2 } from '../../../engine/algorithm/geometry/bbox/BBox2'
import { Color } from '../../../engine/common/Color'
import { ESweep } from '../../../engine/config/CommonProfile'
import { ECanvasD2LineCap } from '../../../engine/config/PrimitiveProfile'
import { Primitive } from '../../../algorithm/geometry/primitives/Primitive'
import { Line } from '../../../algorithm/geometry/primitives/Line'
import { D2ElementModelItemBase } from './elementBase/D2ElementModelItemBase'
import { Vector2 } from '../../../engine/algorithm/geometry/vector/Vector2'
import { Constant } from '../../../Constant'
import { BBox2Creator } from '../../../algorithm/geometry/BBox2Creator'
import { D2DashedSegUtils } from './utils/D2DashedSegUtils'
import { D2ArcToolkit } from '../../../algorithm/geometry/D2ArcToolkit'

export type TBuildD2ArcModelOptionalParam = {
	strokeWidth: number
	strokeColor: Color
	isFill: boolean
	fillColor: Color
	alpha: number
	isSolid: boolean
	lineCap: ECanvasD2LineCap
	isFixedStrokeWidth: boolean
	isEnableSelect: boolean
}

export function createBuildD2ArcModelOptionalParam(optional: Partial<TBuildD2ArcModelOptionalParam> = {}): TBuildD2ArcModelOptionalParam {
	return {
		strokeWidth: 1,
		strokeColor: Color.RED,
		isFill: false,
		fillColor: Color.createByAlpha(0),
		alpha: 1.0,
		isSolid: true,
		lineCap: ECanvasD2LineCap.ROUND,
		isFixedStrokeWidth: false,
		isEnableSelect: true,
		...optional,
	}
}

export function buildD2ArcModel(
	layerItemId: string,
	centerPoint: Vector2,
	radius: number,
	startRadian: number,
	endRadian: number,
	sweep: ESweep,
	optional: Partial<TBuildD2ArcModelOptionalParam> = {}
): D2ArcModel {
	const locSetting: TBuildD2ArcModelOptionalParam = createBuildD2ArcModelOptionalParam(optional)
	const elementItemId: string = Constant.globalIdenManager.getElementIden()
	const elementModelItem: D2ArcModel = new D2ArcModel(
		elementItemId,
		layerItemId,
		centerPoint,
		radius,
		startRadian,
		endRadian,
		sweep,
		locSetting.strokeWidth,
		locSetting.strokeColor,
		locSetting.isFill,
		locSetting.fillColor,
		locSetting.alpha,
		locSetting.isSolid,
		locSetting.lineCap,
		locSetting.isFixedStrokeWidth,
		locSetting.isEnableSelect
	)
	return elementModelItem
}

export class D2ArcModel extends D2ElementModelItemBase {
	private _centerPoint: Vector2
	private _radius: number
	private _startRadian: number
	private _endRadian: number
	private _sweep: ESweep
	private _strokeWidth: number
	private _strokeColor: Color
	private _fillColor: Color
	private _isSolid: boolean
	private _lineCap: ECanvasD2LineCap
	private _isFill: boolean
	private _segSize: number
	private _gapSize: number
	private _fixedStrokeWidth: boolean
	constructor(
		elementItemId: string,
		layerItemId: string,
		centerPoint: Vector2,
		radius: number,
		startRadian: number,
		endRadian: number,
		sweep: ESweep,
		strokeWidth: number,
		strokeColor: Color = new Color(0, 0, 0, 1),
		isFill: boolean = false,
		fillColor: Color = new Color(0, 0, 0, 0),
		alpha: number = 1.0,
		isSolid: boolean = true,
		lineCap: ECanvasD2LineCap = ECanvasD2LineCap.ROUND,
		isFixedStrokeWidth: boolean = false,
		isEnableSelect: boolean = true
	) {
		super(elementItemId, layerItemId)
		this._centerPoint = centerPoint
		this._radius = radius
		this._startRadian = startRadian
		this._endRadian = endRadian
		this._sweep = sweep
		this._strokeWidth = strokeWidth
		this._strokeColor = strokeColor
		this._fillColor = fillColor
		this._lineCap = lineCap
		this._isSolid = isSolid
		this._isFill = isFill
		const { segSize, gapSize } = D2DashedSegUtils.updateDashedSegProfile(this._lineCap, this._strokeWidth)
		this._segSize = segSize
		this._gapSize = gapSize
		this._fixedStrokeWidth = isFixedStrokeWidth
		this.modelType = ED2ElementType.D2Arc
		this.alpha = alpha
		this.isEnableSelect = isEnableSelect
		this.bbox2 = BBox2Creator.createD2ArcBbox2(this._centerPoint, this._radius, this._strokeWidth)
	}

	public get centerPoint(): Vector2 {
		return this._centerPoint
	}
	public set centerPoint(value: Vector2) {
		this._centerPoint = value
		this.bbox2 = BBox2Creator.createD2ArcBbox2(this._centerPoint, this._radius, this._strokeWidth)
	}

	public get radius(): number {
		return this._radius
	}
	public set radius(value: number) {
		this._radius = value
		this.bbox2 = BBox2Creator.createD2ArcBbox2(this._centerPoint, this._radius, this._strokeWidth)
	}

	public get startRadian(): number {
		return this._startRadian
	}
	public set startRadian(value: number) {
		this._startRadian = value
	}

	public get endRadian(): number {
		return this._endRadian
	}
	public set endRadian(value: number) {
		this._endRadian = value
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
		this.bbox2 = BBox2Creator.createD2ArcBbox2(this._centerPoint, this._radius, this._strokeWidth)
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
		return this.centerPoint.add(new Vector2(Math.cos(this.startRadian), Math.sin(this.startRadian)).mul(this.radius))
	}

	public get endPoint(): Vector2 {
		return this.centerPoint.add(new Vector2(Math.cos(this.endRadian), Math.sin(this.endRadian)).mul(this.radius))
	}

	public get lineCap(): ECanvasD2LineCap {
		return this._lineCap
	}
	public set lineCap(value: ECanvasD2LineCap) {
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

	public updatePosition(value: Vector2): void {
		super.position = value
		this.bbox2 = BBox2Creator.createD2ArcBbox2(this._centerPoint, this._radius, this._strokeWidth)
	}

	public updateRotation(value: number): void {
		super.rotation = value
		this.bbox2 = BBox2Creator.createD2ArcBbox2(this._centerPoint, this._radius, this._strokeWidth)
	}

	public updateIsFlipX(value: boolean): void {
		super.isFlipX = value
		this.bbox2 = BBox2Creator.createD2ArcBbox2(this._centerPoint, this._radius, this._strokeWidth)
	}

	public updateIsFlipY(value: boolean): void {
		super.isFlipY = value
		this.bbox2 = BBox2Creator.createD2ArcBbox2(this._centerPoint, this._radius, this._strokeWidth)
	}

	public updateBBox2(): BBox2 {
		this.bbox2 = BBox2Creator.createD2ArcBbox2(this.centerPoint, this.radius, this.strokeWidth)
		return this.bbox2
	}

	public isInGraphical(x: number, y: number): boolean {
		if (this.isEnableSelect === false) {
			return false
		}
		return D2ArcToolkit.isPointOnArc4(
			new Vector2(x, y),
			this.startRadian,
			this.endRadian,
			this.sweep,
			this.radius,
			this.centerPoint,
			this.strokeWidth,
			this.isFill
		)
	}
}
