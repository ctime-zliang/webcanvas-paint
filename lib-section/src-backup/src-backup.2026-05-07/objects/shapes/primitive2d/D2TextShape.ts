import { ED2ElementType } from '../../../config/D2ElementProfile'
import { Constant } from '../../../Constant'
import { Matrix4 } from '../../../engine/algorithm/geometry/matrix/Matrix4'
import { Vector2 } from '../../../engine/algorithm/geometry/vector/Vector2'
import { Color } from '../../../engine/common/Color'
import { ED2FontStyle, EPrimitiveStatus } from '../../../engine/config/PrimitiveProfile'
import { TFontTriangleVertexData } from '../../../manager/TextGraphicsManager'
import { TElement2DTextJSONViewData } from '../../../types/Element'
import {
	buildD2TextModel,
	D2TextModel,
	TBuildD2TextModelOptionalStyleSettingParam,
	TBuildD2TextModelOptionalParam,
} from '../../models/primitive2d/D2TextModel'
import { D2ElementShapeItemBase } from './elementBase/D2ElementShapeItemBase'

export function buildD2TextShape(
	layerItemId: string,
	position: Vector2,
	content: string,
	optional: Partial<TBuildD2TextModelOptionalParam> & Partial<{ styleSetting: TBuildD2TextModelOptionalStyleSettingParam }> = {},
	flushCallback?: (elementShapeItem: D2TextShape) => void
): D2TextShape {
	const elementModelItem: D2TextModel = buildD2TextModel(layerItemId, position, content, optional)
	const elementShapeItem: D2TextShape = new D2TextShape(elementModelItem)
	Constant.textFontService.addVectorizeTextTask(
		elementModelItem.elementItemId,
		elementModelItem.content,
		{
			fontSize: elementModelItem.fontSize,
			lineHeight: elementModelItem.styleSetting.lineHeight,
		},
		{
			fontFamily: elementModelItem.fontFamily,
			fontWeight: elementModelItem.fontWeight,
			fontStyle: elementModelItem.fontStyle,
		},
		({ initBbox2, width, height, vertexDataArray }): void => {
			elementShapeItem.setContentReadyStatus(true)
			elementShapeItem.flushVertexDataMixins(vertexDataArray, width, height)
			elementShapeItem.updateCacheTransform()
			elementShapeItem.updateRender()
			if (elementShapeItem.isContentReady()) {
				flushCallback && flushCallback(elementShapeItem)
			}
		}
	)
	return elementShapeItem
}

export class D2TextShape extends D2ElementShapeItemBase {
	constructor(model: D2TextModel) {
		super()
		this.model = model
		this.refreshRender()
	}

	public get elementItemName(): string {
		return (this.model as D2TextModel).elementItemName
	}
	public set elementItemName(value: string) {
		;(this.model as D2TextModel).elementItemName = value
		this.refreshRender()
	}

	public get refreshToken(): string {
		return (this.model as D2TextModel).refreshToken
	}
	public set refreshToken(value: string) {
		;(this.model as D2TextModel).refreshToken = value
		this.refreshRender()
	}

	public get position(): Vector2 {
		return (this.model as D2TextModel).position
	}
	public set position(value: Vector2) {
		;(this.model as D2TextModel).updatePosition(value)
		this.refreshRender()
	}

	public get content(): string {
		return (this.model as D2TextModel).content
	}

	public get fontFamily(): string {
		return (this.model as D2TextModel).fontFamily
	}
	public set fontFamily(value: string) {
		;(this.model as D2TextModel).fontFamily = value
		this.refreshRender()
	}

	public get fontStyle(): ED2FontStyle {
		return (this.model as D2TextModel).fontStyle
	}
	public set fontStyle(value: ED2FontStyle) {
		;(this.model as D2TextModel).fontStyle = value
		this.refreshRender()
	}

	public get fontSize(): number {
		return (this.model as D2TextModel).fontSize
	}
	public set fontSize(value: number) {
		;(this.model as D2TextModel).fontSize = value
		this.refreshRender()
	}

	public get fontWeight(): number {
		return (this.model as D2TextModel).fontWeight
	}
	public set fontWeight(value: number) {
		;(this.model as D2TextModel).fontWeight = value
		this.refreshRender()
	}

	public get strokeColor(): Color {
		return (this.model as D2TextModel).strokeColor
	}
	public set strokeColor(value: Color) {
		;(this.model as D2TextModel).strokeColor = value
		this.refreshRender()
	}

	public get alpha(): number {
		return (this.model as D2TextModel).alpha
	}
	public set alpha(value: number) {
		;(this.model as D2TextModel).alpha = value
		this.refreshRender()
	}

	public get rotation(): number {
		return (this.model as D2TextModel).rotation
	}
	public set rotation(value: number) {
		;(this.model as D2TextModel).updateRotation(value)
		this.refreshRender()
	}

	public get isFlipX(): boolean {
		return (this.model as D2TextModel).isFlipX
	}
	public set isFlipX(value: boolean) {
		;(this.model as D2TextModel).updateIsFlipX(value)
		this.refreshRender()
	}

	public get isFlipY(): boolean {
		return (this.model as D2TextModel).isFlipY
	}
	public set isFlipY(value: boolean) {
		;(this.model as D2TextModel).updateIsFlipY(value)
		this.refreshRender()
	}

	public get styleSetting(): TBuildD2TextModelOptionalStyleSettingParam {
		return (this.model as D2TextModel).styleSetting
	}
	public set styleSetting(value: TBuildD2TextModelOptionalStyleSettingParam) {
		;(this.model as D2TextModel).styleSetting = value
		this.refreshRender()
	}

	public get leftUp(): Vector2 {
		return (this.model as D2TextModel).leftUp
	}

	public get rightUp(): Vector2 {
		return (this.model as D2TextModel).rightUp
	}

	public get leftDown(): Vector2 {
		return (this.model as D2TextModel).leftDown
	}

	public get rightDown(): Vector2 {
		return (this.model as D2TextModel).rightDown
	}

	public isSelect(x: number, y: number): boolean {
		if (!this.isSelectable) {
			return false
		}
		return this.model.isInGraphical(x, y)
	}

	public updateRender(): void {
		;(this.model as D2TextModel).updateRefreshToken()
		this.refreshRender()
	}

	public updateCacheTransform(): void {
		const model: D2TextModel = this.model as D2TextModel
		model.updatePosition(model.transformCache.position)
		model.updateRotation(model.transformCache.rotation)
		model.updateIsFlipX(model.transformCache.isFlipX)
		model.updateIsFlipY(model.transformCache.isFlipY)
		this.refreshRender()
	}

	public flushVertexDataMixins(vertexDataArray: Array<Array<TFontTriangleVertexData>>, width: number, height: number): void {
		const model: D2TextModel = this.model as D2TextModel
		model.updateVertexData(vertexDataArray)
		model.width = width
		model.height = height
		this.refreshRender()
	}

	public setContentReadyStatus(status: boolean): void {
		;(this.model as D2TextModel).contentReady = status
	}

	public updateContent(content: string): void {
		;(this.model as D2TextModel).updateContent(content)
		this.refreshRender()
	}

	public isContentReady(): boolean {
		return (this.model as D2TextModel).contentReady
	}

	public transform(value: Matrix4): void {
		this.position = this.position.multiplyMatrix4(value)
		this.updateRender()
	}

	public getType(): ED2ElementType {
		return ED2ElementType.D2Text
	}

	public getStatus(): EPrimitiveStatus {
		return this.status
	}

	public toJSON(): TElement2DTextJSONViewData {
		const elementModelItem: D2TextModel = this.model as D2TextModel
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
			contentReady: elementModelItem.contentReady,
			/* ... */
			position: elementModelItem.position.toJSON(),
			refreshToken: elementModelItem.refreshToken,
			content: elementModelItem.content,
			fontFamily: elementModelItem.fontFamily,
			fontStyle: elementModelItem.fontStyle,
			fontSize: elementModelItem.fontSize,
			fontWeight: elementModelItem.fontWeight,
			width: elementModelItem.width,
			height: elementModelItem.height,
			leftUp: elementModelItem.leftUp.toJSON(),
			rightUp: elementModelItem.rightUp.toJSON(),
			leftDown: elementModelItem.leftDown.toJSON(),
			rightDown: elementModelItem.rightDown.toJSON(),
			styleSetting: elementModelItem.styleSetting,
			vertexData: elementModelItem.getVertexData(),
		}
	}
}
