import { D2CircleToolkit } from '../../../algorithm/geometry/D2CircleToolkit'
import { BBox2Creator } from '../../../algorithm/geometry/BBox2Creator'
import { ED2ElementType } from '../../../config/D2ElementProfile'
import { Constant } from '../../../Constant'
import { BBox2 } from '../../../engine/algorithm/geometry/bbox/BBox2'
import { Vector2 } from '../../../engine/algorithm/geometry/vector/Vector2'
import { Color } from '../../../engine/common/Color'
import { ED2PointShape } from '../../../engine/config/PrimitiveProfile'
import { D2ElementModelItemBase } from './elementBase/D2ElementModelItemBase'

export type TBuildD2PointModelOptionalParam = {
	size: number
	shape: ED2PointShape
	strokeColor: Color
	alpha: number
	isEnableScale: boolean
	isEnableSelect: boolean
}

export function buildD2PointModel(layerItemId: string, centerPoint: Vector2, optional: Partial<TBuildD2PointModelOptionalParam> = {}): D2PointModel {
	const locSetting: TBuildD2PointModelOptionalParam = {
		size: 1.0,
		shape: ED2PointShape.DOT,
		strokeColor: Color.RED,
		alpha: 1.0,
		isEnableScale: false,
		isEnableSelect: true,
		...optional,
	}
	const elementItemId: string = Constant.globalIdenManager.getElementIden()
	const elementModelItem: D2PointModel = new D2PointModel(
		elementItemId,
		layerItemId,
		centerPoint,
		locSetting.size,
		locSetting.shape,
		locSetting.strokeColor,
		locSetting.alpha,
		locSetting.isEnableScale,
		locSetting.isEnableSelect
	)
	return elementModelItem
}

export class D2PointModel extends D2ElementModelItemBase {
	private _centerPoint: Vector2
	private _size: number
	private _shape: ED2PointShape
	private _strokeColor: Color = Color.RED
	private _isEnableScale: boolean
	constructor(
		elementItemId: string,
		layerItemId: string,
		centerPoint: Vector2,
		size: number,
		shape: ED2PointShape = ED2PointShape.DOT,
		strokeColor: Color = Color.RED,
		alpha: number = 1.0,
		isEnableScale: boolean = false,
		isEnableSelect: boolean = false
	) {
		super(elementItemId, layerItemId)
		this._centerPoint = centerPoint
		this._size = size
		this._shape = shape
		this._strokeColor = strokeColor
		this._isEnableScale = isEnableScale
		this.modelType = ED2ElementType.D2Point
		this.alpha = alpha
		this.isEnableSelect = isEnableSelect
		this.bbox2 = BBox2Creator.createD2PointBbox2(this._centerPoint, this._size)
	}

	public get centerPoint(): Vector2 {
		return this._centerPoint
	}
	public set centerPoint(value: Vector2) {
		this._centerPoint = value
		this.bbox2 = BBox2Creator.createD2PointBbox2(this._centerPoint, this._size)
	}

	public get size(): number {
		return this._size
	}
	public set size(value: number) {
		this._size = value
		this.bbox2 = BBox2Creator.createD2PointBbox2(this._centerPoint, this._size)
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

	public getBBox2(): BBox2 {
		return this.bbox2
	}

	public updatePosition(value: Vector2): void {
		super.position = value
		this.bbox2 = BBox2Creator.createD2PointBbox2(this._centerPoint, this._size)
	}

	public updateRotation(value: number): void {
		super.rotation = value
		this.bbox2 = BBox2Creator.createD2PointBbox2(this._centerPoint, this._size)
	}

	public updateIsFlipX(value: boolean): void {
		super.isFlipX = value
		this.bbox2 = BBox2Creator.createD2PointBbox2(this._centerPoint, this._size)
	}

	public updateIsFlipY(value: boolean): void {
		super.isFlipY = value
		this.bbox2 = BBox2Creator.createD2PointBbox2(this._centerPoint, this._size)
	}

	public updateBBox2(): BBox2 {
		this.bbox2 = BBox2Creator.createD2PointBbox2(this.centerPoint, this.size)
		return this.bbox2
	}

	public isInGraphical(x: number, y: number): boolean {
		if (this.isEnableSelect === false) {
			return false
		}
		return D2CircleToolkit.isPointOnCircle(new Vector2(x, y), this.size, this.centerPoint, 0, true)
	}
}
