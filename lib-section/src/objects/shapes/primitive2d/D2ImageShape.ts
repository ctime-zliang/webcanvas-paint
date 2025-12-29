import { EFrameCommand } from '../../../config/CommandEnum'
import { ED2ElementType } from '../../../config/D2ElementProfile'
import { Constant } from '../../../Constant'
import { Matrix4 } from '../../../engine/algorithm/geometry/matrix/Matrix4'
import { Vector2 } from '../../../engine/algorithm/geometry/vector/Vector2'
import { Color } from '../../../engine/common/Color'
import { EPrimitiveStatus } from '../../../engine/config/PrimitiveProfile'
import { TElement2DImageJSONViewData } from '../../../types/Element'
import { buildD2ImageModel, D2ImageModel } from '../../models/primitive2d/D2ImageModel'
import { ElementShapeItemBase } from './elementBase/ElementShapeItemBase'

export function buildD2ImageShape(
	layerItemId: string,
	position: Vector2,
	fileHashUuid: string,
	imageDataURL: string,
	width: number,
	height: number,
	strokeWidth: number = 1,
	strokeColor: Color = new Color(0, 0, 0, 1),
	alpha: number = 1.0,
	rotation: number = 0,
	isFlipX: boolean = false,
	isFlipY: boolean = false,
	flushCallback?: (elementShapeItem: D2ImageShape) => void
): D2ImageShape {
	const elementModelItem: D2ImageModel = buildD2ImageModel(
		layerItemId,
		position,
		fileHashUuid,
		imageDataURL,
		width,
		height,
		strokeWidth,
		strokeColor,
		alpha,
		rotation,
		isFlipX,
		isFlipY
	)
	const elementShapeItem: D2ImageShape = new D2ImageShape(elementModelItem)
	Constant.imageReSourceService.addImageLoadTaskItem(
		elementModelItem.elementItemId,
		elementModelItem.fileHashUuid,
		elementModelItem.imageDataURL,
		(imageId: string, fileHashUuid: string, texImageSource: TexImageSource): void => {
			elementShapeItem.flushTexImageSource(texImageSource)
			elementShapeItem.setContentReadyStatus(true)
			if (elementShapeItem.isContentReady()) {
				flushCallback && flushCallback(elementShapeItem)
			}
			window.setTimeout((): void => {
				elementShapeItem.updateRender()
				Constant.messageTool.messageBus.publish(EFrameCommand.RENDER_FRAME, null)
			}, 1 / 60)
		}
	)
	return elementShapeItem
}

export class D2ImageShape extends ElementShapeItemBase {
	constructor(model: D2ImageModel) {
		super()
		this.model = model
		this.refreshRender()
	}

	public get elementItemName(): string {
		return (this.model as D2ImageModel).elementItemName
	}
	public set elementItemName(value: string) {
		;(this.model as D2ImageModel).elementItemName = value
		this.refreshRender()
	}

	public get fileHashUuid(): string {
		return (this.model as D2ImageModel).fileHashUuid
	}
	public set fileHashUuid(value: string) {
		;(this.model as D2ImageModel).fileHashUuid = value
		this.refreshRender()
	}

	public get texImageSource(): TexImageSource {
		return (this.model as D2ImageModel).texImageSource
	}
	public set texImageSource(value: TexImageSource) {
		;(this.model as D2ImageModel).texImageSource = value
		this.refreshRender()
	}

	public get imageDataURL(): string {
		return (this.model as D2ImageModel).imageDataURL
	}
	public set imageDataURL(value: string) {
		;(this.model as D2ImageModel).imageDataURL = value
		this.refreshRender()
	}

	public get position(): Vector2 {
		return (this.model as D2ImageModel).position
	}
	public set position(value: Vector2) {
		;(this.model as D2ImageModel).position = value
		this.refreshRender()
	}

	public get width(): number {
		return (this.model as D2ImageModel).width
	}
	public set width(value: number) {
		;(this.model as D2ImageModel).width = value
		this.refreshRender()
	}

	public get height(): number {
		return (this.model as D2ImageModel).height
	}
	public set height(value: number) {
		;(this.model as D2ImageModel).height = value
		this.refreshRender()
	}

	public get strokeWidth(): number {
		return (this.model as D2ImageModel).strokeWidth
	}
	public set strokeWidth(value: number) {
		;(this.model as D2ImageModel).strokeWidth = value
		this.refreshRender()
	}

	public get strokeColor(): Color {
		return (this.model as D2ImageModel).strokeColor
	}
	public set strokeColor(value: Color) {
		;(this.model as D2ImageModel).strokeColor = value
		this.refreshRender()
	}

	public get rotation(): number {
		return (this.model as D2ImageModel).rotation
	}
	public set rotation(value: number) {
		;(this.model as D2ImageModel).rotation = value
		this.refreshRender()
	}

	public get isFlipX(): boolean {
		return (this.model as D2ImageModel).isFlipX
	}
	public set isFlipX(value: boolean) {
		;(this.model as D2ImageModel).isFlipX = value
		this.refreshRender()
	}

	public get isFlipY(): boolean {
		return (this.model as D2ImageModel).isFlipY
	}
	public set isFlipY(value: boolean) {
		;(this.model as D2ImageModel).isFlipY = value
		this.refreshRender()
	}

	public get leftUp(): Vector2 {
		return (this.model as D2ImageModel).leftUp
	}

	public get rightUp(): Vector2 {
		return (this.model as D2ImageModel).rightUp
	}

	public get leftDown(): Vector2 {
		return (this.model as D2ImageModel).leftDown
	}

	public get rightDown(): Vector2 {
		return (this.model as D2ImageModel).rightDown
	}

	public isSelect(x: number, y: number): boolean {
		return this.model.isInGraphical(x, y)
	}

	public setContentReadyStatus(status: boolean): void {
		;(this.model as D2ImageModel).contentReady = status
	}

	public updateRender(): void {
		;(this.model as D2ImageModel).updateRefreshToken()
		this.refreshRender()
	}

	public flushTexImageSource(texImageSource: TexImageSource): void {
		;(this.model as D2ImageModel).updateTexImageSource(texImageSource)
	}

	public isContentReady(): boolean {
		return (this.model as D2ImageModel).contentReady
	}

	public transform(value: Matrix4): void {
		this.position = this.position.multiplyMatrix4(value)
		;(this.model as D2ImageModel).updateBBox2()
		this.refreshRender()
	}

	public updateBBox2(): void {
		;(this.model as D2ImageModel).updateBBox2()
		this.refreshRender()
	}

	public getType(): ED2ElementType {
		return ED2ElementType.D2Image
	}

	public getStatus(): EPrimitiveStatus {
		return this.status
	}

	public toJSON(): TElement2DImageJSONViewData {
		const elementModelItem: D2ImageModel = this.model as D2ImageModel
		return {
			type: this.getType(),
			modelType: this.model.modelType,
			status: this.status,
			layerItemId: elementModelItem.layerItemId,
			elementItemId: elementModelItem.elementItemId,
			elementItemName: elementModelItem.elementItemName,
			alpha: elementModelItem.alpha,
			strokeColorData: Color.RED.toRGBAJSON(),
			strokeWidth: 0,
			bbox2: elementModelItem.bbox2 ? elementModelItem.bbox2.toJSON() : null!,
			/* ... */
			refreshToken: elementModelItem.refreshToken,
			/* ... */
			texImageSource: elementModelItem.texImageSource,
			imageDataURL: elementModelItem.imageDataURL,
			fileHashUuid: elementModelItem.fileHashUuid,
			position: elementModelItem.position.toJSON(),
			width: elementModelItem.width,
			height: elementModelItem.height,
			rotation: elementModelItem.rotation,
			isFlipX: elementModelItem.isFlipX,
			isFlipY: elementModelItem.isFlipY,
			leftUp: elementModelItem.leftUp.toJSON(),
			rightUp: elementModelItem.rightUp.toJSON(),
			leftDown: elementModelItem.leftDown.toJSON(),
			rightDown: elementModelItem.rightDown.toJSON(),
		}
	}
}
