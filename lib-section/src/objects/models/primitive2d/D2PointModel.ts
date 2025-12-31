import { D2CrossRelationShips } from '../../../algorithm/geometry/D2CrossRelationShips'
import { BBox2Creator } from '../../../algorithm/geometry/utils/BBox2Creator'
import { ED2ElementType } from '../../../config/D2ElementProfile'
import { Constant } from '../../../Constant'
import { BBox2 } from '../../../engine/algorithm/geometry/bbox/BBox2'
import { Vector2 } from '../../../engine/algorithm/geometry/vector/Vector2'
import { Color } from '../../../engine/common/Color'
import { ED2PointShape } from '../../../engine/config/PrimitiveProfile'
import { ElementModelItemBase } from './elementBase/ElementModelItemBase'

export function buildD2PointModel(
	layerItemId: string,
	centerPoint: Vector2,
	size: number = 1.0,
	shape: ED2PointShape = ED2PointShape.DOT,
	strokeColor: Color = Color.RED,
	alpha: number = 1.0,
	isEnableScale: boolean = false,
	isEnableSelect: boolean = false
): D2PointModel {
	const elementItemId: string = Constant.globalIdenManager.getElementIden()
	const elementModelItem: D2PointModel = new D2PointModel(
		elementItemId,
		layerItemId,
		centerPoint,
		size,
		shape,
		strokeColor,
		alpha,
		isEnableScale,
		isEnableSelect
	)
	return elementModelItem
}

export class D2PointModel extends ElementModelItemBase {
	private _centerPoint: Vector2
	private _size: number
	private _shape: ED2PointShape
	private _strokeColor: Color = Color.RED
	private _isEnableScale: boolean
	private _isEnableSelect: boolean
	constructor(
		elementItemId: string,
		layerItemId: string,
		centerPoint: Vector2,
		size: number,
		shape: ED2PointShape = ED2PointShape.DOT,
		strokeColor: Color = Color.RED,
		alpha: number = 1.0,
		isEnableScale: boolean = false,
		isEnableSelect: boolean = false,
		bbox2?: BBox2
	) {
		super(elementItemId, layerItemId)
		this.modelType = ED2ElementType.D2Point
		this.alpha = alpha
		this._centerPoint = centerPoint
		this._size = size
		this._shape = shape
		this._strokeColor = strokeColor
		this._isEnableScale = isEnableScale
		this._isEnableSelect = isEnableSelect
		if (!bbox2) {
			this.bbox2 = BBox2Creator.createD2PointBbox2(this._centerPoint, this._size)
		}
	}

	public get centerPoint(): Vector2 {
		return this._centerPoint
	}
	public set centerPoint(value: Vector2) {
		this._centerPoint = value
	}

	public get size(): number {
		return this._size
	}
	public set size(value: number) {
		this._size = value
	}

	public get shape(): ED2PointShape {
		return this._shape
	}
	public set shape(value: ED2PointShape) {
		this._shape = value
	}

	public get strokeColor(): Color {
		return this._strokeColor
	}
	public set strokeColor(value: Color) {
		this._strokeColor = value
	}

	public get isEnableScale(): boolean {
		return this._isEnableScale
	}
	public set isEnableScale(value: boolean) {
		this._isEnableScale = value
	}

	public get isEnableSelect(): boolean {
		return this._isEnableSelect
	}
	public set isEnableSelect(value: boolean) {
		this._isEnableSelect = value
	}

	public getBBox2(): BBox2 {
		return this.bbox2
	}

	public updateBBox2(): BBox2 {
		this.bbox2 = BBox2Creator.createD2PointBbox2(this.centerPoint, this.size)
		return this.bbox2
	}

	public isInGraphical(x: number, y: number): boolean {
		if (this.isEnableSelect === false) {
			return false
		}
		return D2CrossRelationShips.pointAndCirlce(new Vector2(x, y), this.size, this.centerPoint, 0, true)
	}
}
