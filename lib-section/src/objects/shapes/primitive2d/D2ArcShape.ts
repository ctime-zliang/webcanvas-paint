import { ArcIdentify } from '../../../algorithm/geometry/ArcIdentify'
import { ED2ElementType } from '../../../config/D2ElementProfile'
import { Matrix4 } from '../../../engine/algorithm/geometry/matrix/Matrix4'
import { Vector2 } from '../../../engine/algorithm/geometry/vector/Vector2'
import { Color } from '../../../engine/common/Color'
import { ESweep } from '../../../engine/config/CommonProfile'
import { ECanvas2DLineCap, EPrimitiveStatus } from '../../../engine/config/PrimitiveProfile'
import { TElement2DArcJSONViewData } from '../../../types/Element'
import { buildD2ArcModel, D2ArcModel } from '../../models/primitive2d/D2ArcModel'
import { ElementShapeItemBase } from './elementBase/ElementShapeItemBase'

const arcIdentify: ArcIdentify = new ArcIdentify()

export function buildD2ArcShape(
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
): D2ArcShape {
	const elementModelItem: D2ArcModel = buildD2ArcModel(
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
	const elementShapeItem: D2ArcShape = new D2ArcShape(elementModelItem)
	return elementShapeItem
}

export class D2ArcShape extends ElementShapeItemBase {
	constructor(model: D2ArcModel) {
		super()
		this.model = model
		this.refreshRender()
	}

	public get elementItemName(): string {
		return (this.model as D2ArcModel).elementItemName
	}
	public set elementItemName(value: string) {
		;(this.model as D2ArcModel).elementItemName = value
		this.refreshRender()
	}

	public get centerPoint(): Vector2 {
		return (this.model as D2ArcModel).centerPoint
	}
	public set centerPoint(value: Vector2) {
		;(this.model as D2ArcModel).centerPoint = value
		this.refreshRender()
	}

	public get radius(): number {
		return (this.model as D2ArcModel).radius
	}
	public set radius(value: number) {
		if (value < 0) {
			value = -value
		}
		;(this.model as D2ArcModel).radius = value
		this.refreshRender()
	}

	public get startAngle(): number {
		return (this.model as D2ArcModel).startAngle
	}
	public set startAngle(value: number) {
		;(this.model as D2ArcModel).startAngle = arcIdentify.fixStartAngle(value, this.endAngle, this.radius, this.sweep)
		this.refreshRender()
	}

	public get endAngle(): number {
		return (this.model as D2ArcModel).endAngle
	}
	public set endAngle(value: number) {
		;(this.model as D2ArcModel).endAngle = arcIdentify.fixStartAngle(value, this.startAngle, this.radius, this.sweep)
		this.refreshRender()
	}

	public get sweep(): ESweep {
		return (this.model as D2ArcModel).sweep
	}
	public set sweep(value: ESweep) {
		;(this.model as D2ArcModel).sweep = value
		this.refreshRender()
	}

	public get strokeWidth(): number {
		return (this.model as D2ArcModel).strokeWidth
	}
	public set strokeWidth(value: number) {
		;(this.model as D2ArcModel).strokeWidth = value
		this.refreshRender()
	}

	public get strokeColor(): Color {
		return (this.model as D2ArcModel).strokeColor
	}
	public set strokeColor(value: Color) {
		;(this.model as D2ArcModel).strokeColor = value
		this.refreshRender()
	}

	public get fillColor(): Color {
		return (this.model as D2ArcModel).fillColor
	}
	public set fillColor(value: Color) {
		;(this.model as D2ArcModel).fillColor = value
		this.refreshRender()
	}

	public get lineCap(): ECanvas2DLineCap {
		return (this.model as D2ArcModel).lineCap
	}
	public set lineCap(value: ECanvas2DLineCap) {
		;(this.model as D2ArcModel).lineCap = value
		this.refreshRender()
	}

	public get isSolid(): boolean {
		return (this.model as D2ArcModel).isSolid
	}
	public set isSolid(value: boolean) {
		;(this.model as D2ArcModel).isSolid = value
		this.refreshRender()
	}

	public get isFill(): boolean {
		return (this.model as D2ArcModel).isFill
	}
	public set isFill(value: boolean) {
		;(this.model as D2ArcModel).isFill = value
		this.refreshRender()
	}

	public get segSize(): number {
		return (this.model as D2ArcModel).segSize
	}
	public set segSize(value: number) {
		;(this.model as D2ArcModel).segSize = value
		this.refreshRender()
	}

	public get gapSize(): number {
		return (this.model as D2ArcModel).gapSize
	}
	public set gapSize(value: number) {
		;(this.model as D2ArcModel).gapSize = value
		this.refreshRender()
	}

	public get isFixedStrokeWidth(): boolean {
		return (this.model as D2ArcModel).isFixedStrokeWidth
	}
	public set isFixedStrokeWidth(value: boolean) {
		;(this.model as D2ArcModel).isFixedStrokeWidth = value
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
		return ED2ElementType.D2Arc
	}

	public getStatus(): EPrimitiveStatus {
		return this.status
	}

	public toJSON(): TElement2DArcJSONViewData {
		const elementModelItem: D2ArcModel = this.model as D2ArcModel
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
			startAngle: elementModelItem.startAngle,
			endAngle: elementModelItem.endAngle,
			sweep: elementModelItem.sweep,
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
