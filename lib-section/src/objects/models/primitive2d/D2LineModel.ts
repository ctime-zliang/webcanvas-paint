import { ED2ElementType } from '../../../config/D2ElementProfile'
import { BBox2 } from '../../../engine/algorithm/geometry/bbox/BBox2'
import { Vector2 } from '../../../engine/algorithm/geometry/vector/Vector2'
import { Color } from '../../../engine/common/Color'
import { ECanvasD2LineCap } from '../../../engine/config/PrimitiveProfile'
import { Primitive } from '../../../algorithm/geometry/primitives/Primitive'
import { Line } from '../../../algorithm/geometry/primitives/Line'
import { D2ElementModelItemBase } from './elementBase/D2ElementModelItemBase'
import { Constant } from '../../../Constant'
import { BBox2Creator } from '../../../algorithm/geometry/BBox2Creator'
import { D2DashedSegUtils } from './utils/D2DashedSegUtils'
import { D2LineToolkit } from '../../../algorithm/geometry/D2LineToolkit'

export type TBuildD2LineModelOptionalParam = {
	strokeWidth: number
	strokeColor: Color
	alpha: number
	isSolid: boolean
	lineCap: ECanvasD2LineCap
	rectBorderRadius: number
	isFixedStrokeWidth: boolean
	isEnableSelect: boolean
}

export function createBuildD2LineModelOptionalParam(optional: Partial<TBuildD2LineModelOptionalParam> = {}): TBuildD2LineModelOptionalParam {
	return {
		strokeWidth: 1,
		strokeColor: Color.WHITE,
		alpha: 1.0,
		isSolid: true,
		lineCap: ECanvasD2LineCap.ROUND,
		rectBorderRadius: 0,
		isFixedStrokeWidth: false,
		isEnableSelect: true,
		...optional,
	}
}

export function buildD2LineModel(
	layerItemId: string,
	startPoint: Vector2,
	endPoint: Vector2,
	optional: Partial<TBuildD2LineModelOptionalParam> = {}
): D2LineModel {
	const locSetting: TBuildD2LineModelOptionalParam = createBuildD2LineModelOptionalParam(optional)
	const elementItemId: string = Constant.globalIdenManager.getElementIden()
	const elementModelItem: D2LineModel = new D2LineModel(
		elementItemId,
		layerItemId,
		startPoint,
		endPoint,
		locSetting.strokeWidth,
		locSetting.strokeColor,
		locSetting.alpha,
		locSetting.isSolid,
		locSetting.lineCap,
		locSetting.rectBorderRadius,
		locSetting.isFixedStrokeWidth,
		locSetting.isEnableSelect
	)
	return elementModelItem
}

export class D2LineModel extends D2ElementModelItemBase {
	private _startPoint: Vector2
	private _endPoint: Vector2
	private _strokeWidth: number
	private _strokeColor: Color
	private _isSolid: boolean
	private _lineCap: ECanvasD2LineCap
	private _segSize: number
	private _gapSize: number
	private _rectBorderRadius: number
	private _fixedStrokeWidth: boolean
	constructor(
		elementItemId: string,
		layerItemId: string,
		startPoint: Vector2,
		endPoint: Vector2,
		strokeWidth: number = 1,
		strokeColor: Color = new Color(0, 0, 0, 1),
		alpha: number = 1.0,
		isSolid: boolean = true,
		lineCap: ECanvasD2LineCap = ECanvasD2LineCap.ROUND,
		rectBorderRadius: number = 0,
		isFixedStrokeWidth: boolean = false,
		isEnableSelect: boolean = true
	) {
		super(elementItemId, layerItemId)
		this._startPoint = startPoint
		this._endPoint = endPoint
		this._strokeWidth = strokeWidth
		this._strokeColor = strokeColor
		this._lineCap = lineCap
		this._isSolid = isSolid
		const { segSize, gapSize } = D2DashedSegUtils.updateDashedSegProfile(this._lineCap, this._strokeWidth)
		this._segSize = segSize
		this._gapSize = gapSize
		this._rectBorderRadius = rectBorderRadius
		this._fixedStrokeWidth = isFixedStrokeWidth
		this.modelType = ED2ElementType.D2Line
		this.alpha = alpha
		this.isEnableSelect = isEnableSelect
		this.bbox2 = BBox2Creator.createD2LineBbox2(this._startPoint, this._endPoint, this._strokeWidth)
	}

	public get startPoint(): Vector2 {
		return this._startPoint
	}
	public set startPoint(value: Vector2) {
		this._startPoint = value
		this.bbox2 = BBox2Creator.createD2LineBbox2(this._startPoint, this._endPoint, this._strokeWidth)
	}

	public get endPoint(): Vector2 {
		return this._endPoint
	}
	public set endPoint(value: Vector2) {
		this._endPoint = value
		this.bbox2 = BBox2Creator.createD2LineBbox2(this._startPoint, this._endPoint, this._strokeWidth)
	}

	public get strokeWidth(): number {
		return this._strokeWidth
	}
	public set strokeWidth(value: number) {
		this._strokeWidth = value
		this.bbox2 = BBox2Creator.createD2LineBbox2(this._startPoint, this._endPoint, this._strokeWidth)
	}

	public get strokeColor(): Color {
		return this._strokeColor
	}
	public set strokeColor(value: Color) {
		this._strokeColor = value
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

	public get rectBorderRadius(): number {
		return this._rectBorderRadius
	}
	public set rectBorderRadius(value: number) {
		if (value >= this.strokeWidth * 0.5) {
			value = this.strokeWidth * 0.5
		}
		if (value <= 0) {
			value = 0
		}
		this._rectBorderRadius = value
	}

	public get isFixedStrokeWidth(): boolean {
		return this._fixedStrokeWidth
	}
	public set isFixedStrokeWidth(value: boolean) {
		this._fixedStrokeWidth = value
	}

	public get length(): number {
		return this.startPoint.distance(this.endPoint)
	}
	public set length(value: number) {
		const direct: Vector2 = this.endPoint.sub(this.startPoint).normalize()
		const endPoint: Vector2 = this.startPoint.add(direct.mul(value))
		this.endPoint = endPoint
	}

	public get element(): Primitive {
		return new Line(this.startPoint, this.endPoint)
	}

	public getBBox2(): BBox2 {
		return this.bbox2
	}

	public updatePosition(value: Vector2): void {
		super.position = value
		this.bbox2 = BBox2Creator.createD2LineBbox2(this._startPoint, this._endPoint, this._strokeWidth)
	}

	public updateRotation(value: number): void {
		super.rotation = value
		this.bbox2 = BBox2Creator.createD2LineBbox2(this._startPoint, this._endPoint, this._strokeWidth)
	}

	public updateIsFlipX(value: boolean): void {
		super.isFlipX = value
		this.bbox2 = BBox2Creator.createD2LineBbox2(this._startPoint, this._endPoint, this._strokeWidth)
	}

	public updateIsFlipY(value: boolean): void {
		super.isFlipY = value
		this.bbox2 = BBox2Creator.createD2LineBbox2(this._startPoint, this._endPoint, this._strokeWidth)
	}

	public updateBBox2(): BBox2 {
		this.bbox2 = BBox2Creator.createD2LineBbox2(this.startPoint, this.endPoint, this.strokeWidth)
		return this.bbox2
	}

	public isInGraphical(x: number, y: number): boolean {
		if (this.isEnableSelect === false) {
			return false
		}
		return D2LineToolkit.isPointOnStrokeLine(
			new Vector2(x, y),
			this.startPoint,
			this.endPoint,
			this.strokeWidth,
			this.lineCap === ECanvasD2LineCap.ROUND,
			this.rectBorderRadius
		)
	}
}
