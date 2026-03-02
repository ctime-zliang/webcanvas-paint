import { D2ShapeElementViewBase } from './elementBase/D2ShapeElementViewBase'
import { StructureItemBase } from '../../structure/primitive2d/elementBase/StructureItemBase'
import { TElement2DTextJSONViewData } from '../../../../types/Element'
import { D2ElementShapeItemBase } from '../../../../objects/shapes/primitive2d/elementBase/D2ElementShapeItemBase'
import { ECanvasD2LineCap } from '../../../../engine/config/PrimitiveProfile'
import { BaseD2Text } from '../../structure/primitive2d/BaseD2Text'
import { D2TextShape } from '../../../../objects/shapes/primitive2d/D2TextShape'
import { BaseD2Line } from '../../structure/primitive2d/BaseD2Line'
import { Vector2 } from '../../../../engine/algorithm/geometry/vector/Vector2'
import { EDrawLayerCode } from '../../../../config/DrawLayerProfile'
import { MaskColor } from '../../utils/Mask'

export class D2TextView extends D2ShapeElementViewBase {
	private _mainPrimitive: StructureItemBase
	private _fillRegionPrimitiveNormal: StructureItemBase
	private _fillRegionPrimitiveHightlight: StructureItemBase
	constructor(shapeObject: D2ElementShapeItemBase) {
		super(shapeObject)
		this._mainPrimitive = null!
		this._fillRegionPrimitiveNormal = null!
		this._fillRegionPrimitiveHightlight = null!
		this.type = shapeObject.getType()
		this.layerItemId = shapeObject.model.layerItemId
	}

	public modify(shapeObjectItem: D2TextShape): void {
		const { status } = shapeObjectItem
		const { layerItemId } = shapeObjectItem.model
		this.layerItemId = layerItemId
		this.status = status
		const shapeObjectItemJson: TElement2DTextJSONViewData = shapeObjectItem.toJSON()
		if (this.killed) {
			this.delete()
		} else if (this.hightlight) {
			this.hightlighting()
		} else {
			this.normalview(shapeObjectItem)
		}
		if (this._mainPrimitive) {
			this._mainPrimitive.modify(shapeObjectItemJson)
		}
		const radius: number = Math.min(
			shapeObjectItemJson.styleSetting.borderRadius,
			Math.abs(shapeObjectItemJson.width / 2),
			Math.abs(shapeObjectItemJson.height / 2)
		)
		const leftUp: Vector2 = Vector2.createByJSONData(shapeObjectItemJson.leftUp)
		const rightUp: Vector2 = Vector2.createByJSONData(shapeObjectItemJson.rightUp)
		const rightDown: Vector2 = Vector2.createByJSONData(shapeObjectItemJson.rightDown)
		const leftDown: Vector2 = Vector2.createByJSONData(shapeObjectItemJson.leftDown)
		const topNorDirect: Vector2 = rightUp.sub(leftUp).normalize() // 向右
		const rightNorDirect: Vector2 = rightDown.sub(rightUp).normalize() // 向下
		const bottomNorDirect: Vector2 = leftDown.sub(rightDown).normalize() // 向左
		const leftNorDirect: Vector2 = leftUp.sub(leftDown).normalize() // 向上
		const topBorderLineStartPoint: Vector2 = leftUp.add(topNorDirect.scale(radius))
		const topBorderLineEndPoint: Vector2 = rightUp.add(topNorDirect.rotate(Math.PI).scale(radius))
		const rightBorderLineStartPoint: Vector2 = rightUp.add(rightNorDirect.scale(radius))
		const rightBorderLineEndPoint: Vector2 = rightDown.add(rightNorDirect.rotate(Math.PI).scale(radius))
		const bottomBorderLineStartPoint: Vector2 = rightDown.add(bottomNorDirect.scale(radius))
		const bottomBorderLineEndPoint: Vector2 = leftDown.add(bottomNorDirect.rotate(Math.PI).scale(radius))
		const leftBorderLineStartPoint: Vector2 = leftDown.add(leftNorDirect.scale(radius))
		const leftBorderLineEndPoint: Vector2 = leftUp.add(leftNorDirect.rotate(Math.PI).scale(radius))
		const leftUpBorderArcCenterPoint: Vector2 = leftBorderLineEndPoint.add(topNorDirect.scale(radius))
		const rightUpBorderArcCenterPoint: Vector2 = rightBorderLineStartPoint.add(topNorDirect.rotate(Math.PI).scale(radius))
		const rightBottomBorderArcCenterPoint: Vector2 = rightBorderLineEndPoint.add(bottomNorDirect.scale(radius))
		const leftBottomBorderArcCenterPoint: Vector2 = leftBorderLineStartPoint.add(bottomNorDirect.rotate(Math.PI).scale(radius))
		const topCenterPoint: Vector2 = leftUp.add(rightUp).scale(0.5)
		const rightCenterPoint: Vector2 = rightDown.add(rightUp).scale(0.5)
		const bottomCenterPoint: Vector2 = leftDown.add(rightDown).scale(0.5)
		const leftCenterPoint: Vector2 = leftDown.add(leftUp).scale(0.5)
		if (this._fillRegionPrimitiveNormal) {
			this._fillRegionPrimitiveNormal.modify({
				status: shapeObjectItemJson.status,
				layerItemId: shapeObjectItemJson.layerItemId,
				startPoint: leftCenterPoint,
				endPoint: rightCenterPoint,
				strokeWidth: topCenterPoint.sub(bottomCenterPoint).length,
				strokeColorData: shapeObjectItemJson.styleSetting.backgourdColor.toRGBAJSON(),
				alpha: shapeObjectItemJson.alpha,
				lineCap: ECanvasD2LineCap.SQUARE,
				isSolid: true,
				segSize: 0,
				gapSize: 0,
				rectBorderRadius: (rightCenterPoint.sub(leftCenterPoint).length - topBorderLineEndPoint.sub(topBorderLineStartPoint).length) / 2,
				isFixedStrokeWidth: false,
			})
		}
		if (shapeObjectItemJson.contentReady && this._fillRegionPrimitiveHightlight) {
			this._fillRegionPrimitiveHightlight.modify({
				status: shapeObjectItemJson.status,
				layerItemId: shapeObjectItemJson.layerItemId,
				startPoint: leftCenterPoint,
				endPoint: rightCenterPoint,
				strokeWidth: topCenterPoint.sub(bottomCenterPoint).length,
				strokeColorData: MaskColor.createStrokeColor(0.25).toRGBAJSON(),
				alpha: shapeObjectItemJson.alpha,
				lineCap: ECanvasD2LineCap.SQUARE,
				isSolid: true,
				segSize: 0,
				gapSize: 0,
				rectBorderRadius: (rightCenterPoint.sub(leftCenterPoint).length - topBorderLineEndPoint.sub(topBorderLineStartPoint).length) / 2,
				isFixedStrokeWidth: false,
			})
		}
	}

	public delete(): void {
		if (this._mainPrimitive) {
			this._mainPrimitive.delete()
		}
		if (this._fillRegionPrimitiveHightlight) {
			this._fillRegionPrimitiveHightlight.delete()
			this._fillRegionPrimitiveHightlight = null!
		}
		if (this._fillRegionPrimitiveNormal) {
			this._fillRegionPrimitiveNormal.delete()
			this._fillRegionPrimitiveNormal = undefined!
		}
	}

	public normalview(shapeObjectItem: D2TextShape): void {
		if (!this._mainPrimitive) {
			this._mainPrimitive = new BaseD2Text(this.layerItemId, this)
		}
		if (this._fillRegionPrimitiveHightlight) {
			this._fillRegionPrimitiveHightlight.delete()
			this._fillRegionPrimitiveHightlight = undefined!
		}
		if (!this._fillRegionPrimitiveNormal) {
			this._fillRegionPrimitiveNormal = new BaseD2Line(this.layerItemId, this)
		}
	}

	public hightlighting(): void {
		if (!this._fillRegionPrimitiveHightlight) {
			this._fillRegionPrimitiveHightlight = new BaseD2Line(EDrawLayerCode.MaskLayer, this)
		}
	}
}
