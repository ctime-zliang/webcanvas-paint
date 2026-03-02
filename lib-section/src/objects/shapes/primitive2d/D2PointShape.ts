import { ED2ElementType } from '../../../config/D2ElementProfile'
import { Matrix4 } from '../../../engine/algorithm/geometry/matrix/Matrix4'
import { Vector2 } from '../../../engine/algorithm/geometry/vector/Vector2'
import { Color } from '../../../engine/common/Color'
import { ED2PointShape, EPrimitiveStatus } from '../../../engine/config/PrimitiveProfile'
import { TElement2DPointJSONViewData } from '../../../types/Element'
import { buildD2PointModel, D2PointModel, TBuildD2PointModelOptionalParam } from '../../models/primitive2d/D2PointModel'
import { D2ElementShapeItemBase } from './elementBase/D2ElementShapeItemBase'

export function buildD2PointShape(layerItemId: string, centerPoint: Vector2, optional: Partial<TBuildD2PointModelOptionalParam> = {}): D2PointShape {
	const elementModelItem: D2PointModel = buildD2PointModel(layerItemId, centerPoint, optional)
	const elementShapeItem: D2PointShape = new D2PointShape(elementModelItem)
	return elementShapeItem
}

export class D2PointShape extends D2ElementShapeItemBase {
	constructor(model: D2PointModel) {
		super()
		this.model = model
		this.refreshRender()
	}

	public get elementItemName(): string {
		return (this.model as D2PointModel).elementItemName
	}
	public set elementItemName(value: string) {
		;(this.model as D2PointModel).elementItemName = value
		this.refreshRender()
	}

	public get centerPoint(): Vector2 {
		return (this.model as D2PointModel).centerPoint
	}
	public set centerPoint(value: Vector2) {
		;(this.model as D2PointModel).centerPoint = value
		this.refreshRender()
	}

	public get size(): number {
		return (this.model as D2PointModel).size
	}
	public set size(value: number) {
		if (value < 0) {
			value = -value
		}
		;(this.model as D2PointModel).size = value
		this.refreshRender()
	}

	public get shape(): ED2PointShape {
		return (this.model as D2PointModel).shape
	}
	public set shape(value: ED2PointShape) {
		;(this.model as D2PointModel).shape = value
		this.refreshRender()
	}

	public get alpha(): number {
		return (this.model as D2PointModel).alpha
	}
	public set alpha(value: number) {
		;(this.model as D2PointModel).alpha = value
		this.refreshRender()
	}

	public get rotation(): number {
		return (this.model as D2PointModel).rotation
	}
	public set rotation(value: number) {
		;(this.model as D2PointModel).updateRotation(value)
		this.refreshRender()
	}

	public get strokeColor(): Color {
		return (this.model as D2PointModel).strokeColor
	}
	public set strokeColor(value: Color) {
		;(this.model as D2PointModel).strokeColor = value
		this.refreshRender()
	}

	public get isEnableScale(): boolean {
		return (this.model as D2PointModel).isEnableScale
	}
	public set isEnableScale(value: boolean) {
		;(this.model as D2PointModel).isEnableScale = value
		this.refreshRender()
	}

	public get isEnableSelect(): boolean {
		return (this.model as D2PointModel).isEnableSelect
	}
	public set isEnableSelect(value: boolean) {
		;(this.model as D2PointModel).isEnableSelect = value
		this.refreshRender()
	}

	public isSelect(x: number, y: number): boolean {
		if (!this.isSelectable) {
			return false
		}
		return this.model.isInGraphical(x, y)
	}

	public transform(value: Matrix4): void {
		this.centerPoint = this.centerPoint.multiplyMatrix4(value)
		this.refreshRender()
	}

	public getType(): ED2ElementType {
		return ED2ElementType.D2Point
	}

	public getStatus(): EPrimitiveStatus {
		return this.status
	}

	public toJSON(): TElement2DPointJSONViewData {
		const elementModelItem: D2PointModel = this.model as D2PointModel
		return {
			type: this.getType(),
			modelType: this.model.modelType,
			status: this.status,
			layerItemId: elementModelItem.layerItemId,
			elementItemId: elementModelItem.elementItemId,
			elementItemName: elementModelItem.elementItemName,
			alpha: elementModelItem.alpha,
			rotation: elementModelItem.rotation,
			isFlipX: elementModelItem.isFlipX,
			isFlipY: elementModelItem.isFlipY,
			strokeColorData: elementModelItem.strokeColor ? elementModelItem.strokeColor.toRGBAJSON() : null!,
			strokeWidth: 0,
			bbox2: elementModelItem.bbox2.toJSON(),
			/* ... */
			centerPoint: elementModelItem.centerPoint.toJSON(),
			size: elementModelItem.size,
			shape: elementModelItem.shape,
			isEnableScale: elementModelItem.isEnableScale,
			isEnableSelect: elementModelItem.isEnableSelect,
		}
	}
}
