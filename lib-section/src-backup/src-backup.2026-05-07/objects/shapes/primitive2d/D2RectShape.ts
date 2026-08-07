import { ED2ElementType } from '../../../config/D2ElementProfile'
import { Matrix4 } from '../../../engine/algorithm/geometry/matrix/Matrix4'
import { Vector2 } from '../../../engine/algorithm/geometry/vector/Vector2'
import { Color } from '../../../engine/common/Color'
import { EPrimitiveStatus } from '../../../engine/config/PrimitiveProfile'
import { TElement2DRectJSONViewData } from '../../../types/Element'
import { buildD2RectModel, D2RectModel, TBuildD2RectModelOptionalParam } from '../../models/primitive2d/D2RectModel'
import { D2ElementShapeItemBase } from './elementBase/D2ElementShapeItemBase'

export function buildD2RectShape(layerItemId: string, position: Vector2, width: number, height: number, optional: Partial<TBuildD2RectModelOptionalParam> = {}): D2RectShape {
	const elementModelItem: D2RectModel = buildD2RectModel(layerItemId, position, width, height, optional)
	const elementShapeItem: D2RectShape = new D2RectShape(elementModelItem)
	return elementShapeItem
}

export class D2RectShape extends D2ElementShapeItemBase {
	constructor(model: D2RectModel) {
		super()
		this.model = model
		this.refreshRender()
	}

	public get elementItemName(): string {
		return (this.model as D2RectModel).elementItemName
	}
	public set elementItemName(value: string) {
		;(this.model as D2RectModel).elementItemName = value
		this.refreshRender()
	}

	public get position(): Vector2 {
		return (this.model as D2RectModel).position
	}
	public set position(value: Vector2) {
		;(this.model as D2RectModel).updatePosition(value)
		this.refreshRender()
	}

	public get width(): number {
		return (this.model as D2RectModel).width
	}
	public set width(value: number) {
		;(this.model as D2RectModel).width = value
		this.refreshRender()
	}

	public get height(): number {
		return (this.model as D2RectModel).height
	}
	public set height(value: number) {
		;(this.model as D2RectModel).height = value
		this.refreshRender()
	}

	public get alpha(): number {
		return (this.model as D2RectModel).alpha
	}
	public set alpha(value: number) {
		;(this.model as D2RectModel).alpha = value
		this.refreshRender()
	}

	public get rotation(): number {
		return (this.model as D2RectModel).rotation
	}
	public set rotation(value: number) {
		;(this.model as D2RectModel).updateRotation(value)
		this.refreshRender()
	}

	public get isFlipX(): boolean {
		return (this.model as D2RectModel).isFlipX
	}
	public set isFlipX(value: boolean) {
		;(this.model as D2RectModel).updateIsFlipX(value)
		this.refreshRender()
	}

	public get isFlipY(): boolean {
		return (this.model as D2RectModel).isFlipY
	}
	public set isFlipY(value: boolean) {
		;(this.model as D2RectModel).updateIsFlipY(value)
		this.refreshRender()
	}

	public get strokeWidth(): number {
		return (this.model as D2RectModel).strokeWidth
	}
	public set strokeWidth(value: number) {
		;(this.model as D2RectModel).strokeWidth = value
		this.refreshRender()
	}

	public get strokeColor(): Color {
		return (this.model as D2RectModel).strokeColor
	}
	public set strokeColor(value: Color) {
		;(this.model as D2RectModel).strokeColor = value
		this.refreshRender()
	}

	public get isFill(): boolean {
		return (this.model as D2RectModel).isFill
	}
	public set isFill(value: boolean) {
		;(this.model as D2RectModel).isFill = value
		this.refreshRender()
	}

	public get fillColor(): Color {
		return (this.model as D2RectModel).fillColor
	}
	public set fillColor(value: Color) {
		;(this.model as D2RectModel).fillColor = value
		this.refreshRender()
	}

	public get borderRadius(): number {
		return (this.model as D2RectModel).borderRadius
	}
	public set borderRadius(value: number) {
		;(this.model as D2RectModel).borderRadius = value
		this.refreshRender()
	}

	public get isSolid(): boolean {
		return (this.model as D2RectModel).isSolid
	}
	public set isSolid(value: boolean) {
		;(this.model as D2RectModel).isSolid = value
		this.refreshRender()
	}

	public get segSize(): number {
		return (this.model as D2RectModel).segSize
	}
	public set segSize(value: number) {
		;(this.model as D2RectModel).segSize = value
		this.refreshRender()
	}

	public get gapSize(): number {
		return (this.model as D2RectModel).gapSize
	}
	public set gapSize(value: number) {
		;(this.model as D2RectModel).gapSize = value
		this.refreshRender()
	}

	public get isFixedStrokeWidth(): boolean {
		return (this.model as D2RectModel).isFixedStrokeWidth
	}
	public set isFixedStrokeWidth(value: boolean) {
		;(this.model as D2RectModel).isFixedStrokeWidth = value
		this.refreshRender()
	}

	public get leftUp(): Vector2 {
		return (this.model as D2RectModel).leftUp
	}

	public get rightUp(): Vector2 {
		return (this.model as D2RectModel).rightUp
	}

	public get leftDown(): Vector2 {
		return (this.model as D2RectModel).leftDown
	}

	public get rightDown(): Vector2 {
		return (this.model as D2RectModel).rightDown
	}

	public isSelect(x: number, y: number): boolean {
		if (!this.isSelectable) {
			return false
		}
		return this.model.isInGraphical(x, y)
	}

	public transform(value: Matrix4): void {
		this.position = this.position.multiplyMatrix4(value)
		;(this.model as D2RectModel).updateBBox2()
		this.refreshRender()
	}

	public updateBBox2(): void {
		;(this.model as D2RectModel).updateBBox2()
		this.refreshRender()
	}

	public getType(): ED2ElementType {
		return ED2ElementType.D2Rect
	}

	public getStatus(): EPrimitiveStatus {
		return this.status
	}

	public toJSON(): TElement2DRectJSONViewData {
		const elementModelItem: D2RectModel = this.model as D2RectModel
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
			position: elementModelItem.position.toJSON(),
			width: elementModelItem.width,
			height: elementModelItem.height,
			fillColorData: elementModelItem.isFill && elementModelItem.fillColor ? elementModelItem.fillColor.toRGBAJSON() : null!,
			isFill: elementModelItem.isFill,
			borderRadius: elementModelItem.borderRadius,
			isSolid: elementModelItem.isSolid,
			segSize: elementModelItem.segSize,
			gapSize: elementModelItem.gapSize,
			isFixedStrokeWidth: elementModelItem.isFixedStrokeWidth,
			leftUp: elementModelItem.leftUp.toJSON(),
			rightUp: elementModelItem.rightUp.toJSON(),
			leftDown: elementModelItem.leftDown.toJSON(),
			rightDown: elementModelItem.rightDown.toJSON(),
		}
	}
}
