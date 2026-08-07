import { D2ShapeElementViewBase } from './elementBase/D2ShapeElementViewBase'
import { StructureItemBase } from '../../structure/primitive2d/elementBase/StructureItemBase'
import { MaskColor } from '../../utils/Mask'
import { TElement2DImageJSONViewData } from '../../../../types/Element'
import { D2ElementShapeItemBase } from '../../../../objects/shapes/primitive2d/elementBase/D2ElementShapeItemBase'
import { D2ImageShape } from '../../../../objects/shapes/primitive2d/D2ImageShape'
import { BaseD2Texture } from '../../structure/primitive2d/BaseD2Texture'
import { EDrawLayerCode } from '../../../../config/DrawLayerProfile'
import { BaseD2Line } from '../../structure/primitive2d/BaseD2Line'
import { ECanvasD2LineCap } from '../../../../engine/config/PrimitiveProfile'
import { Color } from '../../../../engine/common/Color'
import { Vector2 } from '../../../../engine/algorithm/geometry/vector/Vector2'

export class D2ImageView extends D2ShapeElementViewBase {
	private _baseD2Texture: BaseD2Texture
	private _maskPrimitive: StructureItemBase
	private _topBorderLinePrimitiveNormal: StructureItemBase
	private _rightBorderLinePrimitiveNormal: StructureItemBase
	private _bottomBorderLinePrimitiveNormal: StructureItemBase
	private _leftBorderLinePrimitiveNormal: StructureItemBase
	private _topBorderLinePrimitiveHightlight: StructureItemBase
	private _rightBorderLinePrimitiveHightlight: StructureItemBase
	private _bottomBorderLinePrimitiveHightlight: StructureItemBase
	private _leftBorderLinePrimitiveHightlight: StructureItemBase
	constructor(shapeObject: D2ElementShapeItemBase) {
		super(shapeObject)
		this._baseD2Texture = null!
		this._maskPrimitive = null!
		this._topBorderLinePrimitiveNormal = null!
		this._rightBorderLinePrimitiveNormal = null!
		this._bottomBorderLinePrimitiveNormal = null!
		this._leftBorderLinePrimitiveNormal = null!
		this._topBorderLinePrimitiveHightlight = null!
		this._rightBorderLinePrimitiveHightlight = null!
		this._bottomBorderLinePrimitiveHightlight = null!
		this._leftBorderLinePrimitiveHightlight = null!
		this.type = shapeObject.getType()
		this.layerItemId = shapeObject.model.layerItemId
	}

	public modify(shapeObjectItem: D2ImageShape): void {
		const { status } = shapeObjectItem
		const { layerItemId } = shapeObjectItem.model
		if (!shapeObjectItem.isContentReady()) {
			return
		}
		this.layerItemId = layerItemId
		this.status = status
		const shapeObjectItemJson: TElement2DImageJSONViewData = shapeObjectItem.toJSON()
		if (this.killed) {
			this.delete()
		} else if (this.hightlight) {
			this.hightlighting(shapeObjectItem)
		} else {
			this.normalview(shapeObjectItem)
		}
		if (this._baseD2Texture) {
			this._baseD2Texture.modify(shapeObjectItemJson)
		}
		if (this._maskPrimitive) {
			this._maskPrimitive.modify({
				status: shapeObjectItemJson.status,
				layerItemId: this._maskPrimitive.layerItemId,
				startPoint: new Vector2((shapeObjectItemJson.leftUp.x + shapeObjectItemJson.leftDown.x) / 2, (shapeObjectItemJson.leftUp.y + shapeObjectItemJson.leftDown.y) / 2).toJSON(),
				endPoint: new Vector2((shapeObjectItemJson.rightUp.x + shapeObjectItemJson.rightDown.x) / 2, (shapeObjectItemJson.rightUp.y + shapeObjectItemJson.rightDown.y) / 2).toJSON(),
				strokeWidth: shapeObjectItemJson.height,
				strokeColorData: MaskColor.createStrokeColor().toRGBAJSON(),
				alpha: 0.35,
				lineCap: ECanvasD2LineCap.SQUARE,
				isSolid: true,
				segSize: 0,
				gapSize: 0,
				isFixedStrokeWidth: false,
			})
		}
		const topBorderLinePrimitive: StructureItemBase = this._topBorderLinePrimitiveNormal || this._topBorderLinePrimitiveHightlight
		const rightBorderLinePrimitive: StructureItemBase = this._rightBorderLinePrimitiveNormal || this._rightBorderLinePrimitiveHightlight
		const bottomBorderLinePrimitive: StructureItemBase = this._bottomBorderLinePrimitiveNormal || this._bottomBorderLinePrimitiveHightlight
		const leftBorderLinePrimitive: StructureItemBase = this._leftBorderLinePrimitiveNormal || this._leftBorderLinePrimitiveHightlight
		const lineLayerItemId: string = this.hightlight && this._topBorderLinePrimitiveHightlight ? this._topBorderLinePrimitiveHightlight.layerItemId : this.layerItemId
		const lineColor: Color = this.hightlight ? Color.GREEN_YELLOW : new Color(102, 248, 247)
		if (topBorderLinePrimitive) {
			topBorderLinePrimitive.modify({
				status: shapeObjectItemJson.status,
				layerItemId: lineLayerItemId,
				startPoint: shapeObjectItemJson.leftUp,
				endPoint: shapeObjectItemJson.rightUp,
				strokeWidth: shapeObjectItemJson.strokeWidth,
				strokeColorData: lineColor.toRGBAJSON(),
				alpha: 0.95,
				lineCap: ECanvasD2LineCap.ROUND,
				isSolid: true,
				segSize: 0,
				gapSize: 0,
				isFixedStrokeWidth: true,
			})
		}
		if (rightBorderLinePrimitive) {
			rightBorderLinePrimitive.modify({
				status: shapeObjectItemJson.status,
				layerItemId: lineLayerItemId,
				startPoint: shapeObjectItemJson.rightUp,
				endPoint: shapeObjectItemJson.rightDown,
				strokeWidth: shapeObjectItemJson.strokeWidth,
				strokeColorData: lineColor.toRGBAJSON(),
				alpha: 0.95,
				lineCap: ECanvasD2LineCap.ROUND,
				isSolid: true,
				segSize: 0,
				gapSize: 0,
				isFixedStrokeWidth: true,
			})
		}
		if (bottomBorderLinePrimitive) {
			bottomBorderLinePrimitive.modify({
				status: shapeObjectItemJson.status,
				layerItemId: lineLayerItemId,
				startPoint: shapeObjectItemJson.rightDown,
				endPoint: shapeObjectItemJson.leftDown,
				strokeWidth: shapeObjectItemJson.strokeWidth,
				strokeColorData: lineColor.toRGBAJSON(),
				alpha: 0.95,
				lineCap: ECanvasD2LineCap.ROUND,
				isSolid: true,
				segSize: 0,
				gapSize: 0,
				isFixedStrokeWidth: true,
			})
		}
		if (leftBorderLinePrimitive) {
			leftBorderLinePrimitive.modify({
				status: shapeObjectItemJson.status,
				layerItemId: lineLayerItemId,
				startPoint: shapeObjectItemJson.leftDown,
				endPoint: shapeObjectItemJson.leftUp,
				strokeWidth: shapeObjectItemJson.strokeWidth,
				strokeColorData: lineColor.toRGBAJSON(),
				alpha: 0.95,
				lineCap: ECanvasD2LineCap.ROUND,
				isSolid: true,
				segSize: 0,
				gapSize: 0,
				isFixedStrokeWidth: true,
			})
		}
	}

	public delete(): void {
		if (this._baseD2Texture) {
			this._baseD2Texture.delete()
			this._baseD2Texture = undefined!
		}
		if (this._maskPrimitive) {
			this._maskPrimitive.delete()
			this._maskPrimitive = undefined!
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
	}

	public normalview(shapeObjectItem: D2ImageShape): void {
		this._maskPrimitive && this._maskPrimitive.delete()
		this._maskPrimitive = null!
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
		if (!this._baseD2Texture) {
			this._baseD2Texture = new BaseD2Texture(this.layerItemId, this)
		}
		if (shapeObjectItem.isShowStroke && !this._topBorderLinePrimitiveNormal) {
			this._topBorderLinePrimitiveNormal = new BaseD2Line(this.layerItemId, this)
		}
		if (shapeObjectItem.isShowStroke && !this._rightBorderLinePrimitiveNormal) {
			this._rightBorderLinePrimitiveNormal = new BaseD2Line(this.layerItemId, this)
		}
		if (shapeObjectItem.isShowStroke && !this._bottomBorderLinePrimitiveNormal) {
			this._bottomBorderLinePrimitiveNormal = new BaseD2Line(this.layerItemId, this)
		}
		if (shapeObjectItem.isShowStroke && !this._leftBorderLinePrimitiveNormal) {
			this._leftBorderLinePrimitiveNormal = new BaseD2Line(this.layerItemId, this)
		}
	}

	public hightlighting(shapeObjectItem: D2ImageShape): void {
		if (!this._maskPrimitive) {
			this._maskPrimitive = new BaseD2Line(EDrawLayerCode.MaskLayer, this)
		}
		if (this._topBorderLinePrimitiveNormal) {
			this._topBorderLinePrimitiveNormal.delete()
			this._topBorderLinePrimitiveNormal = null!
		}
		if (this._rightBorderLinePrimitiveNormal) {
			this._rightBorderLinePrimitiveNormal.delete()
			this._rightBorderLinePrimitiveNormal = null!
		}
		if (this._bottomBorderLinePrimitiveNormal) {
			this._bottomBorderLinePrimitiveNormal.delete()
			this._bottomBorderLinePrimitiveNormal = null!
		}
		if (this._leftBorderLinePrimitiveNormal) {
			this._leftBorderLinePrimitiveNormal.delete()
			this._leftBorderLinePrimitiveNormal = null!
		}
		if (shapeObjectItem.isShowStroke && !this._topBorderLinePrimitiveHightlight) {
			this._topBorderLinePrimitiveHightlight = new BaseD2Line(EDrawLayerCode.MaskLayer, this)
		}
		if (shapeObjectItem.isShowStroke && !this._rightBorderLinePrimitiveHightlight) {
			this._rightBorderLinePrimitiveHightlight = new BaseD2Line(EDrawLayerCode.MaskLayer, this)
		}
		if (shapeObjectItem.isShowStroke && !this._bottomBorderLinePrimitiveHightlight) {
			this._bottomBorderLinePrimitiveHightlight = new BaseD2Line(EDrawLayerCode.MaskLayer, this)
		}
		if (shapeObjectItem.isShowStroke && !this._leftBorderLinePrimitiveHightlight) {
			this._leftBorderLinePrimitiveHightlight = new BaseD2Line(EDrawLayerCode.MaskLayer, this)
		}
	}
}
