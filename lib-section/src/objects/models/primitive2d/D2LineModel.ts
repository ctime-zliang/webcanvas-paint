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

export function buildD2LineModel(
	layerItemId: string,
	startPoint: Vector2,
	endPoint: Vector2,
	strokeWidth: number = 1,
	strokeColor: Color = new Color(0, 0, 0, 1),
	alpha: number = 1.0,
	isSolid: boolean = true,
	lineCap: ECanvas2DLineCap = ECanvas2DLineCap.ROUND,
	isFixedStrokeWidth: boolean = false
): D2LineModel {
	const elementItemId: string = Constant.globalIdenManager.getElementIden()
	const elementModelItem: D2LineModel = new D2LineModel(
		elementItemId,
		layerItemId,
		startPoint,
		endPoint,
		strokeWidth,
		strokeColor,
		alpha,
		isSolid,
		lineCap,
		isFixedStrokeWidth
	)
	return elementModelItem
}

export class D2LineModel extends ElementModelItemBase {
	private _startPoint: Vector2
	private _endPoint: Vector2
	private _strokeWidth: number
	private _strokeColor: Color
	private _isSolid: boolean
	private _lineCap: ECanvas2DLineCap
	private _segSize: number
	private _gapSize: number
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
		lineCap: ECanvas2DLineCap = ECanvas2DLineCap.ROUND,
		isFixedStrokeWidth: boolean = false,
		bbox2?: BBox2
	) {
		super(elementItemId, layerItemId)
		this.modelType = ED2ElementType.D2Line
		this._startPoint = startPoint
		this._endPoint = endPoint
		this._strokeWidth = strokeWidth
		this._strokeColor = strokeColor
		this._lineCap = lineCap
		this._isSolid = isSolid
		const { segSize, gapSize } = D2DashedSegUtils.updateDashedSegProfile(this._lineCap, this._strokeWidth)
		this._segSize = segSize
		this._gapSize = gapSize
		this._fixedStrokeWidth = isFixedStrokeWidth
		if (!bbox2) {
			this.bbox2 = BBox2Creator.createD2LineBbox2(this._startPoint, this._endPoint, this._strokeWidth)
		}
		this.alpha = alpha
	}

	public get startPoint(): Vector2 {
		return this._startPoint
	}
	public set startPoint(value: Vector2) {
		this._startPoint = value
	}

	public get endPoint(): Vector2 {
		return this._endPoint
	}
	public set endPoint(value: Vector2) {
		this._endPoint = value
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

	public get length(): number {
		return this.startPoint.distance(this.endPoint)
	}
	public set length(value: number) {
		const direct: Vector2 = this.endPoint.sub(this.startPoint).normalize()
		const endPoint: Vector2 = this.startPoint.add(direct.mul(value))
		this.endPoint = endPoint
	}

	public get direct(): Vector2 {
		return this.endPoint.sub(this.startPoint).normalize()
	}

	public get centerPoint(): Vector2 {
		const startPoint: Vector2 = this.startPoint
		const endPoint: Vector2 = this.endPoint
		return new Vector2((endPoint.x - startPoint.x) / 2, (endPoint.y - startPoint.y) / 2)
	}

	public get element(): Primitive {
		return new Line(this.startPoint, this.endPoint)
	}

	public getBBox2(): BBox2 {
		return this.bbox2
	}

	public updateBBox2(): BBox2 {
		this.bbox2 = BBox2Creator.createD2LineBbox2(this.startPoint, this.endPoint, this.strokeWidth)
		return this.bbox2
	}

	public isInGraphical(x: number, y: number): boolean {
		return D2CrossRelationShips.pointAndLine(new Vector2(x, y), this.startPoint, this.endPoint, this.strokeWidth)
	}
}
