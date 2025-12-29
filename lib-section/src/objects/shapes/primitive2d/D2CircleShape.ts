import { ED2ElementType } from '../../../config/D2ElementProfile'
import { Matrix4 } from '../../../engine/algorithm/geometry/matrix/Matrix4'
import { Vector2 } from '../../../engine/algorithm/geometry/vector/Vector2'
import { Color } from '../../../engine/common/Color'
import { ECanvas2DLineCap, EPrimitiveStatus } from '../../../engine/config/PrimitiveProfile'
import { TElement2DCircleJSONViewData } from '../../../types/Element'
import { buildD2CircleModel, D2CircleModel } from '../../models/primitive2d/D2CircleModel'
import { ElementShapeItemBase } from './elementBase/ElementShapeItemBase'

export function buildD2CircleShape(
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
): D2CircleShape {
	const elementModelItem: D2CircleModel = buildD2CircleModel(
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
	const elementShapeItem: D2CircleShape = new D2CircleShape(elementModelItem)
	return elementShapeItem
}

export class D2CircleShape extends ElementShapeItemBase {
	constructor(model: D2CircleModel) {
		super()
		this.model = model
		this.refreshRender()
	}

	public get elementItemName(): string {
		return (this.model as D2CircleModel).elementItemName
	}
	public set elementItemName(value: string) {
		;(this.model as D2CircleModel).elementItemName = value
		this.refreshRender()
	}

	public get centerPoint(): Vector2 {
		return (this.model as D2CircleModel).centerPoint
	}
	public set centerPoint(value: Vector2) {
		;(this.model as D2CircleModel).centerPoint = value
		this.refreshRender()
	}

	public get radius(): number {
		return (this.model as D2CircleModel).radius
	}
	public set radius(value: number) {
		if (value < 0) {
			value = -value
		}
		;(this.model as D2CircleModel).radius = value
		this.refreshRender()
	}

	public get strokeWidth(): number {
		return (this.model as D2CircleModel).strokeWidth
	}
	public set strokeWidth(value: number) {
		;(this.model as D2CircleModel).strokeWidth = value
		this.refreshRender()
	}

	public get strokeColor(): Color {
		return (this.model as D2CircleModel).strokeColor
	}
	public set strokeColor(value: Color) {
		;(this.model as D2CircleModel).strokeColor = value
		this.refreshRender()
	}

	public get fillColor(): Color {
		return (this.model as D2CircleModel).fillColor
	}
	public set fillColor(value: Color) {
		;(this.model as D2CircleModel).fillColor = value
		this.refreshRender()
	}

	public get lineCap(): ECanvas2DLineCap {
		return (this.model as D2CircleModel).lineCap
	}
	public set lineCap(value: ECanvas2DLineCap) {
		;(this.model as D2CircleModel).lineCap = value
		this.refreshRender()
	}

	public get isSolid(): boolean {
		return (this.model as D2CircleModel).isSolid
	}
	public set isSolid(value: boolean) {
		;(this.model as D2CircleModel).isSolid = value
		this.refreshRender()
	}

	public get isFill(): boolean {
		return (this.model as D2CircleModel).isFill
	}
	public set isFill(value: boolean) {
		;(this.model as D2CircleModel).isFill = value
		this.refreshRender()
	}

	public get segSize(): number {
		return (this.model as D2CircleModel).segSize
	}
	public set segSize(value: number) {
		;(this.model as D2CircleModel).segSize = value
		this.refreshRender()
	}

	public get gapSize(): number {
		return (this.model as D2CircleModel).gapSize
	}
	public set gapSize(value: number) {
		;(this.model as D2CircleModel).gapSize = value
		this.refreshRender()
	}

	public get isFixedStrokeWidth(): boolean {
		return (this.model as D2CircleModel).isFixedStrokeWidth
	}
	public set isFixedStrokeWidth(value: boolean) {
		;(this.model as D2CircleModel).isFixedStrokeWidth = value
		this.refreshRender()
	}

	public isSelect(x: number, y: number): boolean {
		return this.model.isInGraphical(x, y)
	}

	public transform(value: Matrix4): void {
		const centerPoint: Vector2 = this.centerPoint.multiplyMatrix4(value)
		this.centerPoint = centerPoint
		this.refreshRender()
	}

	public updateRadius(x: number, y: number): void {
		const point: Vector2 = new Vector2(x, y)
		const centerPoint: Vector2 = this.centerPoint
		const distOfClickPointAndCenterPoint: number = point.sub(centerPoint).length
		this.radius = distOfClickPointAndCenterPoint
	}

	public removeFill(): void {
		this.fillColor = Color.createByAlpha(0, this.fillColor)
	}

	public getType(): ED2ElementType {
		return ED2ElementType.D2Circle
	}

	public getStatus(): EPrimitiveStatus {
		return this.status
	}

	public toJSON(): TElement2DCircleJSONViewData {
		const elementModelItem: D2CircleModel = this.model as D2CircleModel
		return {
			type: this.getType(),
			modelType: this.model.modelType,
			status: this.status,
			layerItemId: elementModelItem.layerItemId,
			elementItemId: elementModelItem.elementItemId,
			elementItemName: elementModelItem.elementItemName,
			alpha: elementModelItem.alpha,
			strokeColorData: elementModelItem.strokeColor ? elementModelItem.strokeColor.toRGBAJSON() : null!,
			strokeWidth: elementModelItem.strokeWidth,
			bbox2: elementModelItem.bbox2.toJSON(),
			/* ... */
			centerPoint: elementModelItem.centerPoint.toJSON(),
			radius: elementModelItem.radius,
			fillColorData: elementModelItem.isFill && elementModelItem.fillColor ? elementModelItem.fillColor.toRGBAJSON() : null!,
			lineCap: elementModelItem.lineCap,
			isSolid: elementModelItem.isSolid,
			isFill: elementModelItem.isFill,
			segSize: elementModelItem.segSize,
			gapSize: elementModelItem.gapSize,
			isFixedStrokeWidth: elementModelItem.isFixedStrokeWidth,
		}
	}
}
