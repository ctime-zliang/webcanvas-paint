import { ED2ElementType } from '../../../config/D2ElementProfile'
import { Matrix4 } from '../../../engine/algorithm/geometry/matrix/Matrix4'
import { Vector2 } from '../../../engine/algorithm/geometry/vector/Vector2'
import { Color } from '../../../engine/common/Color'
import { ECanvasD2LineCap, EPrimitiveStatus } from '../../../engine/config/PrimitiveProfile'
import { TElement2DLineJSONViewData } from '../../../types/Element'
import { buildD2LineModel, D2LineModel, TBuildD2LineModelOptionalParam } from '../../models/primitive2d/D2LineModel'
import { D2ElementShapeItemBase } from './elementBase/D2ElementShapeItemBase'

export function buildD2LineShape(layerItemId: string, startPoint: Vector2, endPoint: Vector2, optional: Partial<TBuildD2LineModelOptionalParam> = {}): D2LineShape {
	const elementModelItem: D2LineModel = buildD2LineModel(layerItemId, startPoint, endPoint, optional)
	const elementShapeItem: D2LineShape = new D2LineShape(elementModelItem)
	return elementShapeItem
}

export class D2LineShape extends D2ElementShapeItemBase {
	constructor(model: D2LineModel) {
		super()
		this.model = model
		this.refreshRender()
	}

	public get elementItemName(): string {
		return (this.model as D2LineModel).elementItemName
	}
	public set elementItemName(value: string) {
		;(this.model as D2LineModel).elementItemName = value
		this.refreshRender()
	}

	public get startPoint(): Vector2 {
		return (this.model as D2LineModel).startPoint
	}
	public set startPoint(value: Vector2) {
		;(this.model as D2LineModel).startPoint = value
		this.refreshRender()
	}

	public get endPoint(): Vector2 {
		return (this.model as D2LineModel).endPoint
	}
	public set endPoint(value: Vector2) {
		;(this.model as D2LineModel).endPoint = value
		this.refreshRender()
	}

	public get strokeWidth(): number {
		return (this.model as D2LineModel).strokeWidth
	}
	public set strokeWidth(value: number) {
		;(this.model as D2LineModel).strokeWidth = value
		this.refreshRender()
	}

	public get length(): number {
		return (this.model as D2LineModel).length
	}
	public set length(value: number) {
		;(this.model as D2LineModel).length = value
		this.refreshRender()
	}

	public get strokeColor(): Color {
		return (this.model as D2LineModel).strokeColor
	}
	public set strokeColor(value: Color) {
		;(this.model as D2LineModel).strokeColor = value
		this.refreshRender()
	}

	public get lineCap(): ECanvasD2LineCap {
		return (this.model as D2LineModel).lineCap
	}
	public set lineCap(value: ECanvasD2LineCap) {
		;(this.model as D2LineModel).lineCap = value
		this.refreshRender()
	}

	public get isSolid(): boolean {
		return (this.model as D2LineModel).isSolid
	}
	public set isSolid(value: boolean) {
		;(this.model as D2LineModel).isSolid = value
		this.refreshRender()
	}

	public get segSize(): number {
		return (this.model as D2LineModel).segSize
	}
	public set segSize(value: number) {
		;(this.model as D2LineModel).segSize = value
		this.refreshRender()
	}

	public get gapSize(): number {
		return (this.model as D2LineModel).gapSize
	}
	public set gapSize(value: number) {
		;(this.model as D2LineModel).gapSize = value
		this.refreshRender()
	}

	public get isFixedStrokeWidth(): boolean {
		return (this.model as D2LineModel).isFixedStrokeWidth
	}
	public set isFixedStrokeWidth(value: boolean) {
		;(this.model as D2LineModel).isFixedStrokeWidth = value
		this.refreshRender()
	}

	public isSelect(x: number, y: number): boolean {
		if (!this.isSelectable) {
			return false
		}
		return this.model.isInGraphical(x, y)
	}

	public transform(value: Matrix4): void {
		const startPoint: Vector2 = this.startPoint.multiplyMatrix4(value)
		const endPoint: Vector2 = this.endPoint.multiplyMatrix4(value)
		this.startPoint = startPoint
		this.endPoint = endPoint
		this.refreshRender()
	}

	public getType(): ED2ElementType {
		return ED2ElementType.D2Line
	}

	public getStatus(): EPrimitiveStatus {
		return this.status
	}

	public toJSON(): TElement2DLineJSONViewData {
		const elementModelItem: D2LineModel = this.model as D2LineModel
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
			strokeWidth: elementModelItem.strokeWidth,
			bbox2: elementModelItem.bbox2.toJSON(),
			/* ... */
			startPoint: elementModelItem.startPoint.toJSON(),
			endPoint: elementModelItem.endPoint.toJSON(),
			lineCap: elementModelItem.lineCap,
			isSolid: elementModelItem.isSolid,
			segSize: elementModelItem.segSize,
			gapSize: elementModelItem.gapSize,
			rectBorderRadius: elementModelItem.rectBorderRadius,
			isFixedStrokeWidth: elementModelItem.isFixedStrokeWidth,
		}
	}
}
