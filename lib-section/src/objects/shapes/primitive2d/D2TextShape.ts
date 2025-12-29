import { ED2ElementType } from '../../../config/D2ElementProfile'
import { Constant } from '../../../Constant'
import { BBox2 } from '../../../engine/algorithm/geometry/bbox/BBox2'
import { Matrix4 } from '../../../engine/algorithm/geometry/matrix/Matrix4'
import { Vector2 } from '../../../engine/algorithm/geometry/vector/Vector2'
import { Color } from '../../../engine/common/Color'
import { ED2FontStyle, EPrimitiveStatus } from '../../../engine/config/PrimitiveProfile'
import { TRectSurrounded } from '../../../engine/types/Primitive'
import { TFontTriangleVertexData } from '../../../manager/TextGraphicsManager'
import { POINT_ARRAY_OCCUPY_SIZE } from '../../../service/TextFontService'
import { TElement2DTextJSONViewData } from '../../../types/Element'
import { buildD2TextModel, D2TextModel } from '../../models/primitive2d/D2TextModel'
import { ElementShapeItemBase } from './elementBase/ElementShapeItemBase'

export function buildD2TextShape(
	layerItemId: string,
	position: Vector2,
	content: string,
	fontFamily: string = 'auto',
	fontStyle: ED2FontStyle = ED2FontStyle.NORMAL,
	fontSize: number = 10,
	fontWeight: number = 100,
	strokeColor: Color = Color.WHITE,
	alpha: number = 1.0,
	bgColor: Color | null = null!,
	paddingSurrounded: TRectSurrounded = { top: 1, right: 1, bottom: 1, left: 1 },
	flushCallback?: (elementShapeItem: D2TextShape) => void
): D2TextShape {
	const elementModelItem: D2TextModel = buildD2TextModel(
		layerItemId,
		position,
		content,
		fontFamily,
		fontStyle,
		fontSize,
		fontWeight,
		strokeColor,
		alpha,
		bgColor,
		paddingSurrounded
	)
	const elementShapeItem: D2TextShape = new D2TextShape(elementModelItem)
	Constant.textFontService.addVectorizeTextTask(
		elementModelItem.elementItemId,
		elementModelItem.content,
		elementModelItem.fontSize,
		elementModelItem.position.toArray(),
		{
			fontFamily: elementModelItem.fontFamily,
			fontWeight: elementModelItem.fontWeight,
			fontStyle: elementModelItem.fontStyle,
		},
		(textStrId: string, bbox2: BBox2, vertexDataArray: Array<Array<TFontTriangleVertexData>>): void => {
			elementShapeItem.flushVertexDataArray(vertexDataArray)
			elementShapeItem.updateBBox2(bbox2)
			elementShapeItem.setContentReadyStatus(true)
			elementShapeItem.updateRender()
			if (elementShapeItem.isContentReady()) {
				flushCallback && flushCallback(elementShapeItem)
			}
		}
	)
	return elementShapeItem
}

export class D2TextShape extends ElementShapeItemBase {
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
		;(this.model as D2TextModel).position = value
		this.refreshRender()
	}

	public get content(): string {
		return (this.model as D2TextModel).content
	}
	public set content(value: string) {
		;(this.model as D2TextModel).content = value
		this.refreshRender()
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

	public get bgColor(): Color | null {
		return (this.model as D2TextModel).bgColor
	}
	public set bgColor(value: Color | null) {
		;(this.model as D2TextModel).bgColor = value
		this.refreshRender()
	}

	public get alpha(): number {
		return (this.model as D2TextModel).alpha
	}
	public set alpha(value: number) {
		;(this.model as D2TextModel).alpha = value
		this.refreshRender()
	}

	public get paddingSurrounded(): TRectSurrounded {
		return (this.model as D2TextModel).paddingSurrounded
	}
	public set paddingSurrounded(value: TRectSurrounded) {
		;(this.model as D2TextModel).paddingSurrounded = value
		this.refreshRender()
	}

	public get rotation(): number {
		return (this.model as D2TextModel).rotation
	}
	public set rotation(value: number) {
		;(this.model as D2TextModel).rotation = value
		this.refreshRender()
	}

	public get isFlipX(): boolean {
		return (this.model as D2TextModel).isFlipX
	}
	public set isFlipX(value: boolean) {
		;(this.model as D2TextModel).isFlipX = value
		this.refreshRender()
	}

	public get isFlipY(): boolean {
		return (this.model as D2TextModel).isFlipY
	}
	public set isFlipY(value: boolean) {
		;(this.model as D2TextModel).isFlipY = value
		this.refreshRender()
	}

	public isSelect(x: number, y: number): boolean {
		return this.model.isInGraphical(x, y)
	}

	public updateRender(): void {
		;(this.model as D2TextModel).updateRefreshToken()
		this.refreshRender()
	}

	public updateBBox2(bbox2: BBox2): void {
		;(this.model as D2TextModel).bbox2 = bbox2
		this.refreshRender()
	}

	public flushVertexDataArray(vertexDataArray: Array<Array<TFontTriangleVertexData>>): void {
		;(this.model as D2TextModel).updateVertexData(vertexDataArray)
	}

	public setContentReadyStatus(status: boolean): void {
		;(this.model as D2TextModel).contentReady = status
	}

	public isContentReady(): boolean {
		return (this.model as D2TextModel).contentReady
	}

	public transform(value: Matrix4): void {
		const elementModelItem: D2TextModel = this.model as D2TextModel
		const allPositions: Array<number> = elementModelItem.getVertexData().positions
		for (let j: number = 0; j < allPositions.length; j += POINT_ARRAY_OCCUPY_SIZE) {
			const v1: Vector2 = new Vector2(allPositions[j], allPositions[j + 1]).multiplyMatrix4(value)
			allPositions[j] = v1.x
			allPositions[j + 1] = v1.y
		}
		const lbv0: Vector2 = new Vector2(elementModelItem.bbox2.minX, elementModelItem.bbox2.minY)
		const rtv0: Vector2 = new Vector2(elementModelItem.bbox2.maxX, elementModelItem.bbox2.maxY)
		const lbv1: Vector2 = lbv0.multiplyMatrix4(value)
		const rtv1: Vector2 = rtv0.multiplyMatrix4(value)
		const newBbox2: BBox2 = new BBox2(lbv1.x, lbv1.y, rtv1.x, rtv1.y)
		this.updateBBox2(newBbox2)
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
			strokeColorData: elementModelItem.strokeColor ? elementModelItem.strokeColor.toRGBAJSON() : null!,
			strokeWidth: 0,
			bbox2: elementModelItem.bbox2.toJSON(),
			/* ... */
			position: elementModelItem.position.toJSON(),
			hasMeta: elementModelItem.hasMeta,
			refreshToken: elementModelItem.refreshToken,
			content: elementModelItem.content,
			fontFamily: elementModelItem.fontFamily,
			fontStyle: elementModelItem.fontStyle,
			fontSize: elementModelItem.fontSize,
			fontWeight: elementModelItem.fontWeight,
			bgColorData: elementModelItem.bgColor ? elementModelItem.bgColor.toRGBAJSON() : null!,
			paddingSurrounded: elementModelItem.paddingSurrounded,
			vertexData: elementModelItem.getVertexData(),
		}
	}
}
