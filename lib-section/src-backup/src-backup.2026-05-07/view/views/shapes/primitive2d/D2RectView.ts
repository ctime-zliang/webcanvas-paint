import { D2ShapeElementViewBase } from './elementBase/D2ShapeElementViewBase'
import { BaseD2Line } from '../../structure/primitive2d/BaseD2Line'
import { StructureItemBase } from '../../structure/primitive2d/elementBase/StructureItemBase'
import { MaskColor } from '../../utils/Mask'
import { EDrawLayerCode } from '../../../../config/DrawLayerProfile'
import { TElement2DRectJSONViewData } from '../../../../types/Element'
import { D2ElementShapeItemBase } from '../../../../objects/shapes/primitive2d/elementBase/D2ElementShapeItemBase'
import { D2RectShape } from '../../../../objects/shapes/primitive2d/D2RectShape'
import { ECanvasD2LineCap } from '../../../../engine/config/PrimitiveProfile'
import { Vector2 } from '../../../../engine/algorithm/geometry/vector/Vector2'
import { BaseD2Arc } from '../../structure/primitive2d/BaseD2Arc'
import { ESweep } from '../../../../engine/config/CommonProfile'
import { D2ArcToolkit } from '../../../../algorithm/geometry/D2ArcToolkit'
import { ED2ElementType } from '../../../../config/D2ElementProfile'

export class D2RectView extends D2ShapeElementViewBase {
	private _fillRegionPrimitiveNormal: StructureItemBase
	private _topBorderLinePrimitiveNormal: StructureItemBase
	private _rightBorderLinePrimitiveNormal: StructureItemBase
	private _bottomBorderLinePrimitiveNormal: StructureItemBase
	private _leftBorderLinePrimitiveNormal: StructureItemBase
	private _topBorderLinePrimitiveHightlight: StructureItemBase
	private _rightBorderLinePrimitiveHightlight: StructureItemBase
	private _bottomBorderLinePrimitiveHightlight: StructureItemBase
	private _leftBorderLinePrimitiveHightlight: StructureItemBase
	private _leftUpBorderArcPrimitiveNormal: StructureItemBase
	private _rightUpBorderArcPrimitiveNormal: StructureItemBase
	private _rightBottomBorderArcPrimitiveNormal: StructureItemBase
	private _leftBottomBorderArcPrimitiveNormal: StructureItemBase
	private _leftUpBorderArcPrimitiveHightlight: StructureItemBase
	private _rightUpBorderArcPrimitiveHightlight: StructureItemBase
	private _rightBottomBorderArcPrimitiveHightlight: StructureItemBase
	private _leftBottomBorderArcPrimitiveHightlight: StructureItemBase
	constructor(shapeObject: D2ElementShapeItemBase) {
		super(shapeObject)
		this._fillRegionPrimitiveNormal = null!
		this._topBorderLinePrimitiveNormal = null!
		this._rightBorderLinePrimitiveNormal = null!
		this._bottomBorderLinePrimitiveNormal = null!
		this._leftBorderLinePrimitiveNormal = null!
		this._topBorderLinePrimitiveHightlight = null!
		this._rightBorderLinePrimitiveHightlight = null!
		this._bottomBorderLinePrimitiveHightlight = null!
		this._leftBorderLinePrimitiveHightlight = null!
		this._leftUpBorderArcPrimitiveNormal = null!
		this._rightUpBorderArcPrimitiveNormal = null!
		this._rightBottomBorderArcPrimitiveNormal = null!
		this._leftBottomBorderArcPrimitiveNormal = null!
		this._leftUpBorderArcPrimitiveHightlight = null!
		this._rightUpBorderArcPrimitiveHightlight = null!
		this._rightBottomBorderArcPrimitiveHightlight = null!
		this._leftBottomBorderArcPrimitiveHightlight = null!
		this.type = shapeObject.getType()
		this.layerItemId = shapeObject.model.layerItemId
	}

	public modify(shapeObjectItem: D2RectShape): void {
		const { status } = shapeObjectItem
		const { layerItemId } = shapeObjectItem.model
		this.layerItemId = layerItemId
		this.status = status
		const shapeObjectItemJson: TElement2DRectJSONViewData = shapeObjectItem.toJSON()
		if (this.killed) {
			this.delete()
		} else if (this.hightlight) {
			this.hightlighting()
		} else {
			this.normalview(shapeObjectItem, shapeObjectItemJson.isFill)
		}
		const radius: number = Math.min(shapeObjectItemJson.borderRadius, Math.abs(shapeObjectItemJson.width / 2), Math.abs(shapeObjectItemJson.height / 2))
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
		const halfStrokeWidth: number = shapeObjectItem.strokeWidth * 0.5
		const topCenterPoint: Vector2 = leftUp.add(rightUp).scale(0.5).add(rightNorDirect.scale(halfStrokeWidth))
		const rightCenterPoint: Vector2 = rightDown.add(rightUp).scale(0.5).add(topNorDirect.rotate(Math.PI).scale(halfStrokeWidth))
		const bottomCenterPoint: Vector2 = leftDown.add(rightDown).scale(0.5).add(rightNorDirect.rotate(Math.PI).scale(halfStrokeWidth))
		const leftCenterPoint: Vector2 = leftDown.add(leftUp).scale(0.5).add(topNorDirect.scale(halfStrokeWidth))
		if (this._fillRegionPrimitiveNormal) {
			this._fillRegionPrimitiveNormal.modify({
				status: shapeObjectItemJson.status,
				layerItemId: shapeObjectItemJson.layerItemId,
				startPoint: leftCenterPoint,
				endPoint: rightCenterPoint,
				strokeWidth: topCenterPoint.sub(bottomCenterPoint).length,
				strokeColorData: shapeObjectItemJson.fillColorData,
				alpha: shapeObjectItemJson.alpha,
				lineCap: ECanvasD2LineCap.SQUARE,
				isSolid: shapeObjectItemJson.isSolid,
				segSize: shapeObjectItemJson.segSize,
				gapSize: shapeObjectItemJson.gapSize,
				rectBorderRadius: (rightCenterPoint.sub(leftCenterPoint).length - topBorderLineEndPoint.sub(topBorderLineStartPoint).length) / 2,
				isFixedStrokeWidth: shapeObjectItemJson.isFixedStrokeWidth,
			})
		}
		if (this._topBorderLinePrimitiveNormal) {
			this._topBorderLinePrimitiveNormal.modify({
				status: shapeObjectItemJson.status,
				layerItemId: shapeObjectItemJson.layerItemId,
				startPoint: topBorderLineStartPoint.toJSON(),
				endPoint: topBorderLineEndPoint.toJSON(),
				strokeWidth: shapeObjectItemJson.strokeWidth,
				strokeColorData: shapeObjectItemJson.strokeColorData,
				alpha: shapeObjectItemJson.alpha,
				lineCap: ECanvasD2LineCap.ROUND,
				isSolid: shapeObjectItemJson.isSolid,
				segSize: shapeObjectItemJson.segSize,
				gapSize: shapeObjectItemJson.gapSize,
				isFixedStrokeWidth: shapeObjectItemJson.isFixedStrokeWidth,
			})
		}
		if (this._rightBorderLinePrimitiveNormal) {
			this._rightBorderLinePrimitiveNormal.modify({
				status: shapeObjectItemJson.status,
				layerItemId: shapeObjectItemJson.layerItemId,
				startPoint: rightBorderLineStartPoint.toJSON(),
				endPoint: rightBorderLineEndPoint.toJSON(),
				strokeWidth: shapeObjectItemJson.strokeWidth,
				strokeColorData: shapeObjectItemJson.strokeColorData,
				alpha: shapeObjectItemJson.alpha,
				lineCap: ECanvasD2LineCap.ROUND,
				isSolid: shapeObjectItemJson.isSolid,
				segSize: shapeObjectItemJson.segSize,
				gapSize: shapeObjectItemJson.gapSize,
				isFixedStrokeWidth: shapeObjectItemJson.isFixedStrokeWidth,
			})
		}
		if (this._bottomBorderLinePrimitiveNormal) {
			this._bottomBorderLinePrimitiveNormal.modify({
				status: shapeObjectItemJson.status,
				layerItemId: shapeObjectItemJson.layerItemId,
				startPoint: bottomBorderLineStartPoint.toJSON(),
				endPoint: bottomBorderLineEndPoint.toJSON(),
				strokeWidth: shapeObjectItemJson.strokeWidth,
				strokeColorData: shapeObjectItemJson.strokeColorData,
				alpha: shapeObjectItemJson.alpha,
				lineCap: ECanvasD2LineCap.ROUND,
				isSolid: shapeObjectItemJson.isSolid,
				segSize: shapeObjectItemJson.segSize,
				gapSize: shapeObjectItemJson.gapSize,
				isFixedStrokeWidth: shapeObjectItemJson.isFixedStrokeWidth,
			})
		}
		if (this._leftBorderLinePrimitiveNormal) {
			this._leftBorderLinePrimitiveNormal.modify({
				status: shapeObjectItemJson.status,
				layerItemId: shapeObjectItemJson.layerItemId,
				startPoint: leftBorderLineStartPoint.toJSON(),
				endPoint: leftBorderLineEndPoint.toJSON(),
				strokeWidth: shapeObjectItemJson.strokeWidth,
				strokeColorData: shapeObjectItemJson.strokeColorData,
				alpha: shapeObjectItemJson.alpha,
				lineCap: ECanvasD2LineCap.ROUND,
				isSolid: shapeObjectItemJson.isSolid,
				segSize: shapeObjectItemJson.segSize,
				gapSize: shapeObjectItemJson.gapSize,
				isFixedStrokeWidth: shapeObjectItemJson.isFixedStrokeWidth,
			})
		}
		if (this._topBorderLinePrimitiveHightlight) {
			this._topBorderLinePrimitiveHightlight.modify({
				status: shapeObjectItemJson.status,
				layerItemId: EDrawLayerCode.MaskLayer,
				startPoint: topBorderLineStartPoint.toJSON(),
				endPoint: topBorderLineEndPoint.toJSON(),
				strokeWidth: shapeObjectItemJson.strokeWidth,
				strokeColorData: MaskColor.createStrokeColor().toRGBAJSON(),
				alpha: shapeObjectItemJson.alpha,
				lineCap: ECanvasD2LineCap.ROUND,
				isSolid: shapeObjectItemJson.isSolid,
				segSize: shapeObjectItemJson.segSize,
				gapSize: shapeObjectItemJson.gapSize,
				isFixedStrokeWidth: shapeObjectItemJson.isFixedStrokeWidth,
			})
		}
		if (this._rightBorderLinePrimitiveHightlight) {
			this._rightBorderLinePrimitiveHightlight.modify({
				status: shapeObjectItemJson.status,
				layerItemId: EDrawLayerCode.MaskLayer,
				startPoint: rightBorderLineStartPoint.toJSON(),
				endPoint: rightBorderLineEndPoint.toJSON(),
				strokeWidth: shapeObjectItemJson.strokeWidth,
				strokeColorData: MaskColor.createStrokeColor().toRGBAJSON(),
				alpha: shapeObjectItemJson.alpha,
				lineCap: ECanvasD2LineCap.ROUND,
				isSolid: shapeObjectItemJson.isSolid,
				segSize: shapeObjectItemJson.segSize,
				gapSize: shapeObjectItemJson.gapSize,
				isFixedStrokeWidth: shapeObjectItemJson.isFixedStrokeWidth,
			})
		}
		if (this._bottomBorderLinePrimitiveHightlight) {
			this._bottomBorderLinePrimitiveHightlight.modify({
				status: shapeObjectItemJson.status,
				layerItemId: EDrawLayerCode.MaskLayer,
				startPoint: bottomBorderLineStartPoint.toJSON(),
				endPoint: bottomBorderLineEndPoint.toJSON(),
				strokeWidth: shapeObjectItemJson.strokeWidth,
				strokeColorData: MaskColor.createStrokeColor().toRGBAJSON(),
				alpha: shapeObjectItemJson.alpha,
				lineCap: ECanvasD2LineCap.ROUND,
				isSolid: shapeObjectItemJson.isSolid,
				segSize: shapeObjectItemJson.segSize,
				gapSize: shapeObjectItemJson.gapSize,
				isFixedStrokeWidth: shapeObjectItemJson.isFixedStrokeWidth,
			})
		}
		if (this._leftBorderLinePrimitiveHightlight) {
			this._leftBorderLinePrimitiveHightlight.modify({
				status: shapeObjectItemJson.status,
				layerItemId: EDrawLayerCode.MaskLayer,
				startPoint: leftBorderLineStartPoint.toJSON(),
				endPoint: leftBorderLineEndPoint.toJSON(),
				strokeWidth: shapeObjectItemJson.strokeWidth,
				strokeColorData: MaskColor.createStrokeColor().toRGBAJSON(),
				alpha: shapeObjectItemJson.alpha,
				lineCap: ECanvasD2LineCap.ROUND,
				isSolid: shapeObjectItemJson.isSolid,
				segSize: shapeObjectItemJson.segSize,
				gapSize: shapeObjectItemJson.gapSize,
				isFixedStrokeWidth: shapeObjectItemJson.isFixedStrokeWidth,
			})
		}
		const { startRadian: leftUpArcStartRadian, endRadian: leftUpArcEndRadian } = D2ArcToolkit.calculateRadianProfileByPoint(leftUpBorderArcCenterPoint, topBorderLineStartPoint, leftBorderLineEndPoint, ESweep.CCW)
		const { startRadian: rightUpArcStartRadian, endRadian: rightUpArcEndRadian } = D2ArcToolkit.calculateRadianProfileByPoint(rightUpBorderArcCenterPoint, rightBorderLineStartPoint, topBorderLineEndPoint, ESweep.CCW)
		const { startRadian: rightBottomArcStartRadian, endRadian: rightBottomArcEndRadian } = D2ArcToolkit.calculateRadianProfileByPoint(
			rightBottomBorderArcCenterPoint,
			bottomBorderLineStartPoint,
			rightBorderLineEndPoint,
			ESweep.CCW
		)
		const { startRadian: leftBottomArcStartRadian, endRadian: leftBottomArcEndRadian } = D2ArcToolkit.calculateRadianProfileByPoint(
			leftBottomBorderArcCenterPoint,
			leftBorderLineStartPoint,
			bottomBorderLineEndPoint,
			ESweep.CCW
		)
		if (this._leftUpBorderArcPrimitiveNormal) {
			this._leftUpBorderArcPrimitiveNormal.modify({
				status: shapeObjectItemJson.status,
				layerItemId: shapeObjectItemJson.layerItemId,
				centerPoint: leftUpBorderArcCenterPoint,
				startRadian: leftUpArcStartRadian,
				endRadian: leftUpArcEndRadian,
				sweep: shapeObjectItemJson.width * shapeObjectItemJson.height < 0 ? ESweep.CW : ESweep.CCW,
				radius: radius,
				strokeWidth: shapeObjectItemJson.strokeWidth,
				strokeColorData: shapeObjectItemJson.strokeColorData,
				isFill: false,
				fillColorData: null!,
				alpha: shapeObjectItemJson.alpha,
				lineCap: ECanvasD2LineCap.ROUND,
				isSolid: shapeObjectItemJson.isSolid,
				segSize: shapeObjectItemJson.segSize,
				gapSize: shapeObjectItemJson.gapSize,
				isFixedStrokeWidth: shapeObjectItemJson.isFixedStrokeWidth,
			})
		}
		if (this._rightUpBorderArcPrimitiveNormal) {
			this._rightUpBorderArcPrimitiveNormal.modify({
				status: shapeObjectItemJson.status,
				layerItemId: shapeObjectItemJson.layerItemId,
				centerPoint: rightUpBorderArcCenterPoint,
				startRadian: rightUpArcStartRadian,
				endRadian: rightUpArcEndRadian,
				sweep: shapeObjectItemJson.width * shapeObjectItemJson.height < 0 ? ESweep.CW : ESweep.CCW,
				radius: radius,
				strokeWidth: shapeObjectItemJson.strokeWidth,
				strokeColorData: shapeObjectItemJson.strokeColorData,
				isFill: false,
				fillColorData: null!,
				alpha: shapeObjectItemJson.alpha,
				lineCap: ECanvasD2LineCap.ROUND,
				isSolid: shapeObjectItemJson.isSolid,
				segSize: shapeObjectItemJson.segSize,
				gapSize: shapeObjectItemJson.gapSize,
				isFixedStrokeWidth: shapeObjectItemJson.isFixedStrokeWidth,
			})
		}
		if (this._rightBottomBorderArcPrimitiveNormal) {
			this._rightBottomBorderArcPrimitiveNormal.modify({
				status: shapeObjectItemJson.status,
				layerItemId: shapeObjectItemJson.layerItemId,
				centerPoint: rightBottomBorderArcCenterPoint,
				startRadian: rightBottomArcStartRadian,
				endRadian: rightBottomArcEndRadian,
				sweep: shapeObjectItemJson.width * shapeObjectItemJson.height < 0 ? ESweep.CW : ESweep.CCW,
				radius: radius,
				strokeWidth: shapeObjectItemJson.strokeWidth,
				strokeColorData: shapeObjectItemJson.strokeColorData,
				isFill: false,
				fillColorData: null!,
				alpha: shapeObjectItemJson.alpha,
				lineCap: ECanvasD2LineCap.ROUND,
				isSolid: shapeObjectItemJson.isSolid,
				segSize: shapeObjectItemJson.segSize,
				gapSize: shapeObjectItemJson.gapSize,
				isFixedStrokeWidth: shapeObjectItemJson.isFixedStrokeWidth,
			})
		}
		if (this._leftBottomBorderArcPrimitiveNormal) {
			this._leftBottomBorderArcPrimitiveNormal.modify({
				status: shapeObjectItemJson.status,
				layerItemId: shapeObjectItemJson.layerItemId,
				centerPoint: leftBottomBorderArcCenterPoint,
				startRadian: leftBottomArcStartRadian,
				endRadian: leftBottomArcEndRadian,
				sweep: shapeObjectItemJson.width * shapeObjectItemJson.height < 0 ? ESweep.CW : ESweep.CCW,
				radius: radius,
				strokeWidth: shapeObjectItemJson.strokeWidth,
				strokeColorData: shapeObjectItemJson.strokeColorData,
				isFill: false,
				fillColorData: null!,
				alpha: shapeObjectItemJson.alpha,
				lineCap: ECanvasD2LineCap.ROUND,
				isSolid: shapeObjectItemJson.isSolid,
				segSize: shapeObjectItemJson.segSize,
				gapSize: shapeObjectItemJson.gapSize,
				isFixedStrokeWidth: shapeObjectItemJson.isFixedStrokeWidth,
			})
		}
		if (this._leftUpBorderArcPrimitiveHightlight) {
			this._leftUpBorderArcPrimitiveHightlight.modify({
				status: shapeObjectItemJson.status,
				layerItemId: EDrawLayerCode.MaskLayer,
				centerPoint: leftUpBorderArcCenterPoint,
				startRadian: leftUpArcStartRadian,
				endRadian: leftUpArcEndRadian,
				sweep: shapeObjectItemJson.width * shapeObjectItemJson.height < 0 ? ESweep.CW : ESweep.CCW,
				radius: radius,
				strokeWidth: shapeObjectItemJson.strokeWidth,
				strokeColorData: MaskColor.createStrokeColor().toRGBAJSON(),
				isFill: false,
				fillColorData: null!,
				alpha: shapeObjectItemJson.alpha,
				lineCap: ECanvasD2LineCap.ROUND,
				isSolid: shapeObjectItemJson.isSolid,
				segSize: shapeObjectItemJson.segSize,
				gapSize: shapeObjectItemJson.gapSize,
				isFixedStrokeWidth: shapeObjectItemJson.isFixedStrokeWidth,
			})
		}
		if (this._rightUpBorderArcPrimitiveHightlight) {
			this._rightUpBorderArcPrimitiveHightlight.modify({
				status: shapeObjectItemJson.status,
				layerItemId: EDrawLayerCode.MaskLayer,
				centerPoint: rightUpBorderArcCenterPoint,
				startRadian: rightUpArcStartRadian,
				endRadian: rightUpArcEndRadian,
				sweep: shapeObjectItemJson.width * shapeObjectItemJson.height < 0 ? ESweep.CW : ESweep.CCW,
				radius: radius,
				strokeWidth: shapeObjectItemJson.strokeWidth,
				strokeColorData: MaskColor.createStrokeColor().toRGBAJSON(),
				isFill: false,
				fillColorData: null!,
				alpha: shapeObjectItemJson.alpha,
				lineCap: ECanvasD2LineCap.ROUND,
				isSolid: shapeObjectItemJson.isSolid,
				segSize: shapeObjectItemJson.segSize,
				gapSize: shapeObjectItemJson.gapSize,
				isFixedStrokeWidth: shapeObjectItemJson.isFixedStrokeWidth,
			})
		}
		if (this._rightBottomBorderArcPrimitiveHightlight) {
			this._rightBottomBorderArcPrimitiveHightlight.modify({
				status: shapeObjectItemJson.status,
				layerItemId: EDrawLayerCode.MaskLayer,
				centerPoint: rightBottomBorderArcCenterPoint,
				startRadian: rightBottomArcStartRadian,
				endRadian: rightBottomArcEndRadian,
				sweep: shapeObjectItemJson.width * shapeObjectItemJson.height < 0 ? ESweep.CW : ESweep.CCW,
				radius: radius,
				strokeWidth: shapeObjectItemJson.strokeWidth,
				strokeColorData: MaskColor.createStrokeColor().toRGBAJSON(),
				isFill: false,
				fillColorData: null!,
				alpha: shapeObjectItemJson.alpha,
				lineCap: ECanvasD2LineCap.ROUND,
				isSolid: shapeObjectItemJson.isSolid,
				segSize: shapeObjectItemJson.segSize,
				gapSize: shapeObjectItemJson.gapSize,
				isFixedStrokeWidth: shapeObjectItemJson.isFixedStrokeWidth,
			})
		}
		if (this._leftBottomBorderArcPrimitiveHightlight) {
			this._leftBottomBorderArcPrimitiveHightlight.modify({
				status: shapeObjectItemJson.status,
				layerItemId: EDrawLayerCode.MaskLayer,
				centerPoint: leftBottomBorderArcCenterPoint,
				startRadian: leftBottomArcStartRadian,
				endRadian: leftBottomArcEndRadian,
				sweep: shapeObjectItemJson.width * shapeObjectItemJson.height < 0 ? ESweep.CW : ESweep.CCW,
				radius: radius,
				strokeWidth: shapeObjectItemJson.strokeWidth,
				strokeColorData: MaskColor.createStrokeColor().toRGBAJSON(),
				isFill: false,
				fillColorData: null!,
				alpha: shapeObjectItemJson.alpha,
				lineCap: ECanvasD2LineCap.ROUND,
				isSolid: shapeObjectItemJson.isSolid,
				segSize: shapeObjectItemJson.segSize,
				gapSize: shapeObjectItemJson.gapSize,
				isFixedStrokeWidth: shapeObjectItemJson.isFixedStrokeWidth,
			})
		}
	}

	public delete(): void {
		if (this._fillRegionPrimitiveNormal) {
			this._fillRegionPrimitiveNormal.delete()
			this._fillRegionPrimitiveNormal = undefined!
		}
		if (this._topBorderLinePrimitiveNormal) {
			this._topBorderLinePrimitiveNormal.delete()
			this._topBorderLinePrimitiveNormal = undefined!
		}
		if (this._rightBorderLinePrimitiveNormal) {
			this._rightBorderLinePrimitiveNormal.delete()
			this._rightBorderLinePrimitiveNormal = undefined!
		}
		if (this._bottomBorderLinePrimitiveNormal) {
			this._bottomBorderLinePrimitiveNormal.delete()
			this._bottomBorderLinePrimitiveNormal = undefined!
		}
		if (this._leftBorderLinePrimitiveNormal) {
			this._leftBorderLinePrimitiveNormal.delete()
			this._leftBorderLinePrimitiveNormal = undefined!
		}
		if (this._topBorderLinePrimitiveHightlight) {
			this._topBorderLinePrimitiveHightlight.delete()
			this._topBorderLinePrimitiveHightlight = undefined!
		}
		if (this._rightBorderLinePrimitiveHightlight) {
			this._rightBorderLinePrimitiveHightlight.delete()
			this._rightBorderLinePrimitiveHightlight = undefined!
		}
		if (this._bottomBorderLinePrimitiveHightlight) {
			this._bottomBorderLinePrimitiveHightlight.delete()
			this._bottomBorderLinePrimitiveHightlight = undefined!
		}
		if (this._leftBorderLinePrimitiveHightlight) {
			this._leftBorderLinePrimitiveHightlight.delete()
			this._leftBorderLinePrimitiveHightlight = undefined!
		}
		if (this._leftUpBorderArcPrimitiveNormal) {
			this._leftUpBorderArcPrimitiveNormal.delete()
			this._leftUpBorderArcPrimitiveNormal = undefined!
		}
		if (this._rightUpBorderArcPrimitiveNormal) {
			this._rightUpBorderArcPrimitiveNormal.delete()
			this._rightUpBorderArcPrimitiveNormal = undefined!
		}
		if (this._rightBottomBorderArcPrimitiveNormal) {
			this._rightBottomBorderArcPrimitiveNormal.delete()
			this._rightBottomBorderArcPrimitiveNormal = undefined!
		}
		if (this._leftBottomBorderArcPrimitiveNormal) {
			this._leftBottomBorderArcPrimitiveNormal.delete()
			this._leftBottomBorderArcPrimitiveNormal = undefined!
		}
		if (this._leftUpBorderArcPrimitiveHightlight) {
			this._leftUpBorderArcPrimitiveHightlight.delete()
		}
		if (this._rightUpBorderArcPrimitiveHightlight) {
			this._rightUpBorderArcPrimitiveHightlight.delete()
			this._rightUpBorderArcPrimitiveHightlight = undefined!
		}
		if (this._rightBottomBorderArcPrimitiveHightlight) {
			this._rightBottomBorderArcPrimitiveHightlight.delete()
			this._rightBottomBorderArcPrimitiveHightlight = undefined!
		}
		if (this._leftBottomBorderArcPrimitiveHightlight) {
			this._leftBottomBorderArcPrimitiveHightlight.delete()
			this._leftBottomBorderArcPrimitiveHightlight = undefined!
		}
	}

	public normalview(shapeObjectItem: D2RectShape, isFill: boolean): void {
		if (this._topBorderLinePrimitiveHightlight) {
			this._topBorderLinePrimitiveHightlight.delete()
			this._topBorderLinePrimitiveHightlight = undefined!
		}
		if (this._rightBorderLinePrimitiveHightlight) {
			this._rightBorderLinePrimitiveHightlight.delete()
			this._rightBorderLinePrimitiveHightlight = undefined!
		}
		if (this._bottomBorderLinePrimitiveHightlight) {
			this._bottomBorderLinePrimitiveHightlight.delete()
			this._bottomBorderLinePrimitiveHightlight = undefined!
		}
		if (this._leftBorderLinePrimitiveHightlight) {
			this._leftBorderLinePrimitiveHightlight.delete()
			this._leftBorderLinePrimitiveHightlight = undefined!
		}
		if (this._leftUpBorderArcPrimitiveHightlight) {
			this._leftUpBorderArcPrimitiveHightlight.delete()
			this._leftUpBorderArcPrimitiveHightlight = undefined!
		}
		if (this._rightUpBorderArcPrimitiveHightlight) {
			this._rightUpBorderArcPrimitiveHightlight.delete()
			this._rightUpBorderArcPrimitiveHightlight = undefined!
		}
		if (this._rightBottomBorderArcPrimitiveHightlight) {
			this._rightBottomBorderArcPrimitiveHightlight.delete()
			this._rightBottomBorderArcPrimitiveHightlight = undefined!
		}
		if (this._leftBottomBorderArcPrimitiveHightlight) {
			this._leftBottomBorderArcPrimitiveHightlight.delete()
			this._leftBottomBorderArcPrimitiveHightlight = undefined!
		}
		const elementItemType: ED2ElementType = shapeObjectItem.getType()
		switch (elementItemType) {
			case ED2ElementType.D2Rect: {
				if (!this._fillRegionPrimitiveNormal && isFill) {
					this._fillRegionPrimitiveNormal = new BaseD2Line(this.layerItemId, this)
				}
				if (!this._topBorderLinePrimitiveNormal) {
					this._topBorderLinePrimitiveNormal = new BaseD2Line(this.layerItemId, this)
				}
				if (!this._rightBorderLinePrimitiveNormal) {
					this._rightBorderLinePrimitiveNormal = new BaseD2Line(this.layerItemId, this)
				}
				if (!this._bottomBorderLinePrimitiveNormal) {
					this._bottomBorderLinePrimitiveNormal = new BaseD2Line(this.layerItemId, this)
				}
				if (!this._leftBorderLinePrimitiveNormal) {
					this._leftBorderLinePrimitiveNormal = new BaseD2Line(this.layerItemId, this)
				}
				if (!this._leftUpBorderArcPrimitiveNormal) {
					this._leftUpBorderArcPrimitiveNormal = new BaseD2Arc(this.layerItemId, this)
				}
				if (!this._rightUpBorderArcPrimitiveNormal) {
					this._rightUpBorderArcPrimitiveNormal = new BaseD2Arc(this.layerItemId, this)
				}
				if (!this._rightBottomBorderArcPrimitiveNormal) {
					this._rightBottomBorderArcPrimitiveNormal = new BaseD2Arc(this.layerItemId, this)
				}
				if (!this._leftBottomBorderArcPrimitiveNormal) {
					this._leftBottomBorderArcPrimitiveNormal = new BaseD2Arc(this.layerItemId, this)
				}
				break
			}
			case ED2ElementType.D2AssistRect: {
				if (!this._fillRegionPrimitiveNormal && isFill) {
					this._fillRegionPrimitiveNormal = new BaseD2Line(EDrawLayerCode.MaskLayer, this)
				}
				if (!this._topBorderLinePrimitiveNormal) {
					this._topBorderLinePrimitiveNormal = new BaseD2Line(EDrawLayerCode.MaskLayer, this)
				}
				if (!this._rightBorderLinePrimitiveNormal) {
					this._rightBorderLinePrimitiveNormal = new BaseD2Line(EDrawLayerCode.MaskLayer, this)
				}
				if (!this._bottomBorderLinePrimitiveNormal) {
					this._bottomBorderLinePrimitiveNormal = new BaseD2Line(EDrawLayerCode.MaskLayer, this)
				}
				if (!this._leftBorderLinePrimitiveNormal) {
					this._leftBorderLinePrimitiveNormal = new BaseD2Line(EDrawLayerCode.MaskLayer, this)
				}
				if (!this._leftUpBorderArcPrimitiveNormal) {
					this._leftUpBorderArcPrimitiveNormal = new BaseD2Arc(EDrawLayerCode.MaskLayer, this)
				}
				if (!this._rightUpBorderArcPrimitiveNormal) {
					this._rightUpBorderArcPrimitiveNormal = new BaseD2Arc(EDrawLayerCode.MaskLayer, this)
				}
				if (!this._rightBottomBorderArcPrimitiveNormal) {
					this._rightBottomBorderArcPrimitiveNormal = new BaseD2Arc(EDrawLayerCode.MaskLayer, this)
				}
				if (!this._leftBottomBorderArcPrimitiveNormal) {
					this._leftBottomBorderArcPrimitiveNormal = new BaseD2Arc(EDrawLayerCode.MaskLayer, this)
				}
				break
			}
		}
	}

	public hightlighting(): void {
		if (!this._topBorderLinePrimitiveHightlight) {
			this._topBorderLinePrimitiveHightlight = new BaseD2Line(EDrawLayerCode.MaskLayer, this)
		}
		if (!this._rightBorderLinePrimitiveHightlight) {
			this._rightBorderLinePrimitiveHightlight = new BaseD2Line(EDrawLayerCode.MaskLayer, this)
		}
		if (!this._bottomBorderLinePrimitiveHightlight) {
			this._bottomBorderLinePrimitiveHightlight = new BaseD2Line(EDrawLayerCode.MaskLayer, this)
		}
		if (!this._leftBorderLinePrimitiveHightlight) {
			this._leftBorderLinePrimitiveHightlight = new BaseD2Line(EDrawLayerCode.MaskLayer, this)
		}
		if (!this._leftUpBorderArcPrimitiveHightlight) {
			this._leftUpBorderArcPrimitiveHightlight = new BaseD2Arc(EDrawLayerCode.MaskLayer, this)
		}
		if (!this._rightUpBorderArcPrimitiveHightlight) {
			this._rightUpBorderArcPrimitiveHightlight = new BaseD2Arc(EDrawLayerCode.MaskLayer, this)
		}
		if (!this._rightBottomBorderArcPrimitiveHightlight) {
			this._rightBottomBorderArcPrimitiveHightlight = new BaseD2Arc(EDrawLayerCode.MaskLayer, this)
		}
		if (!this._leftBottomBorderArcPrimitiveHightlight) {
			this._leftBottomBorderArcPrimitiveHightlight = new BaseD2Arc(EDrawLayerCode.MaskLayer, this)
		}
	}
}
