import { ED2ElementType } from '../../../../config/D2ElementProfile'
import { ShapeElementViewBase } from './elementBase/ShapeElementViewBase'
import { StructureItemBase } from '../../structure/primitive2d/elementBase/StructureItemBase'
import { MaskColor } from '../../utils/Mask'
import { TElement2DImageJSONViewData } from '../../../../types/Element'
import { ElementShapeItemBase } from '../../../../objects/shapes/primitive2d/elementBase/ElementShapeItemBase'
import { D2ImageShape } from '../../../../objects/shapes/primitive2d/D2ImageShape'
import { BaseD2Texture } from '../../structure/primitive2d/BaseD2Texture'
import { EDrawLayerCode } from '../../../../config/DrawLayerProfile'
import { BaseD2Line } from '../../structure/primitive2d/BaseD2Line'
import { ECanvas2DLineCap } from '../../../../engine/config/PrimitiveProfile'
import { px2mm } from '../../../../engine/math/Calculation'
import { InsConfig } from '../../../../engine/common/InsConfig'
import { Color } from '../../../../engine/common/Color'
import { Vector2 } from '../../../../engine/algorithm/geometry/vector/Vector2'

export class D2ImageView extends ShapeElementViewBase {
	private _baseD2Texture: BaseD2Texture
	private _maskPrimitive: StructureItemBase
	private _upOutLinePrimitiveN: StructureItemBase
	private _rightOutLinePrimitiveN: StructureItemBase
	private _bottomOutLinePrimitiveN: StructureItemBase
	private _leftOutLinePrimitiveN: StructureItemBase
	private _upOutLinePrimitiveH: StructureItemBase
	private _rightOutLinePrimitiveH: StructureItemBase
	private _bottomOutLinePrimitiveH: StructureItemBase
	private _leftOutLinePrimitiveH: StructureItemBase
	constructor(shapeObject: ElementShapeItemBase) {
		super(shapeObject)
		this.type = shapeObject.getType()
		this.layerItemId = shapeObject.model.layerItemId
		this._baseD2Texture = null!
		this._maskPrimitive = null!
		this._upOutLinePrimitiveN = null!
		this._rightOutLinePrimitiveN = null!
		this._bottomOutLinePrimitiveN = null!
		this._leftOutLinePrimitiveN = null!
		this._upOutLinePrimitiveH = null!
		this._rightOutLinePrimitiveH = null!
		this._bottomOutLinePrimitiveH = null!
		this._leftOutLinePrimitiveH = null!
	}

	public modify(shapeObjectItem: D2ImageShape): void {
		const { status } = shapeObjectItem
		const { layerItemId } = shapeObjectItem.model
		const elementItemType: ED2ElementType = shapeObjectItem.getType()
		if (!shapeObjectItem.isContentReady()) {
			return
		}
		this.layerItemId = layerItemId
		this.status = status
		if (!this._baseD2Texture) {
			this.delete()
			switch (elementItemType) {
				case ED2ElementType.D2Image: {
					this._baseD2Texture = new BaseD2Texture(layerItemId, this)
					break
				}
			}
		}
		const shapeObjectItemJson: TElement2DImageJSONViewData = shapeObjectItem.toJSON()
		if (this.hightlight) {
			this.hightlighting()
		} else {
			this.normalview()
		}
		if (this._baseD2Texture) {
			this._baseD2Texture.modify(shapeObjectItem.toJSON())
		}
		if (this._maskPrimitive) {
			this._maskPrimitive.modify({
				status: shapeObjectItemJson.status,
				layerItemId: this._maskPrimitive.layerItemId,
				startPoint: new Vector2(
					(shapeObjectItemJson.leftUp.x + shapeObjectItemJson.leftDown.x) / 2,
					(shapeObjectItemJson.leftUp.y + shapeObjectItemJson.leftDown.y) / 2
				).toJSON(),
				endPoint: new Vector2(
					(shapeObjectItemJson.rightUp.x + shapeObjectItemJson.rightDown.x) / 2,
					(shapeObjectItemJson.rightUp.y + shapeObjectItemJson.rightDown.y) / 2
				).toJSON(),
				strokeWidth: shapeObjectItemJson.height,
				strokeColorData: MaskColor.createStrokeColor().toRGBAJSON(),
				alpha: 0.35,
				lineCap: ECanvas2DLineCap.SQUARE,
				isSolid: true,
				segSize: 0,
				gapSize: 0,
				isFixedStrokeWidth: false,
			})
		}
		const upOutLinePrimitive: StructureItemBase = this._upOutLinePrimitiveN || this._upOutLinePrimitiveH
		const rightOutLinePrimitive: StructureItemBase = this._rightOutLinePrimitiveN || this._rightOutLinePrimitiveH
		const bottomOutLinePrimitive: StructureItemBase = this._bottomOutLinePrimitiveN || this._bottomOutLinePrimitiveH
		const leftOutLinePrimitive: StructureItemBase = this._leftOutLinePrimitiveN || this._leftOutLinePrimitiveH
		const lineLayerItemId: string = this.hightlight ? this._upOutLinePrimitiveH.layerItemId : this.layerItemId
		const lineStrokeWidth: number = this.hightlight ? 3 : 3
		const lineColor: Color = this.hightlight ? Color.GREEN_YELLOW : new Color(102, 248, 247)
		if (upOutLinePrimitive) {
			upOutLinePrimitive.modify({
				status: shapeObjectItemJson.status,
				layerItemId: lineLayerItemId,
				startPoint: shapeObjectItemJson.leftUp,
				endPoint: shapeObjectItemJson.rightUp,
				strokeWidth: px2mm(lineStrokeWidth, InsConfig.DPI[0]),
				strokeColorData: lineColor,
				alpha: 0.95,
				lineCap: ECanvas2DLineCap.ROUND,
				isSolid: !this.hightlight,
				segSize: 1,
				gapSize: 0.5,
				isFixedStrokeWidth: true,
			})
		}
		if (rightOutLinePrimitive) {
			rightOutLinePrimitive.modify({
				status: shapeObjectItemJson.status,
				layerItemId: lineLayerItemId,
				startPoint: shapeObjectItemJson.rightUp,
				endPoint: shapeObjectItemJson.rightDown,
				strokeWidth: px2mm(lineStrokeWidth, InsConfig.DPI[0]),
				strokeColorData: lineColor,
				alpha: 0.95,
				lineCap: ECanvas2DLineCap.ROUND,
				isSolid: !this.hightlight,
				segSize: 1,
				gapSize: 0.5,
				isFixedStrokeWidth: true,
			})
		}
		if (bottomOutLinePrimitive) {
			bottomOutLinePrimitive.modify({
				status: shapeObjectItemJson.status,
				layerItemId: lineLayerItemId,
				startPoint: shapeObjectItemJson.rightDown,
				endPoint: shapeObjectItemJson.leftDown,
				strokeWidth: px2mm(lineStrokeWidth, InsConfig.DPI[0]),
				strokeColorData: lineColor,
				alpha: 0.95,
				lineCap: ECanvas2DLineCap.ROUND,
				isSolid: !this.hightlight,
				segSize: 1,
				gapSize: 0.5,
				isFixedStrokeWidth: true,
			})
		}
		if (leftOutLinePrimitive) {
			leftOutLinePrimitive.modify({
				status: shapeObjectItemJson.status,
				layerItemId: lineLayerItemId,
				startPoint: shapeObjectItemJson.leftDown,
				endPoint: shapeObjectItemJson.leftUp,
				strokeWidth: px2mm(lineStrokeWidth, InsConfig.DPI[0]),
				strokeColorData: lineColor,
				alpha: 0.95,
				lineCap: ECanvas2DLineCap.ROUND,
				isSolid: false,
				segSize: 1,
				gapSize: 0.5,
				isFixedStrokeWidth: true,
			})
		}
	}

	public delete(): void {
		this._baseD2Texture && this._baseD2Texture.delete()
		this._maskPrimitive && this._maskPrimitive.delete()
		this._upOutLinePrimitiveN && this._upOutLinePrimitiveN.delete()
		this._rightOutLinePrimitiveN && this._rightOutLinePrimitiveN.delete()
		this._bottomOutLinePrimitiveN && this._bottomOutLinePrimitiveN.delete()
		this._leftOutLinePrimitiveN && this._leftOutLinePrimitiveN.delete()
		this._upOutLinePrimitiveH && this._upOutLinePrimitiveH.delete()
		this._rightOutLinePrimitiveH && this._rightOutLinePrimitiveH.delete()
		this._bottomOutLinePrimitiveH && this._bottomOutLinePrimitiveH.delete()
		this._leftOutLinePrimitiveH && this._leftOutLinePrimitiveH.delete()
	}

	public normalview(): void {
		this._maskPrimitive && this._maskPrimitive.delete()
		this._maskPrimitive = null!
		this._upOutLinePrimitiveH && this._upOutLinePrimitiveH.delete()
		this._upOutLinePrimitiveH = null!
		if (!this._upOutLinePrimitiveN) {
			this._upOutLinePrimitiveN = new BaseD2Line(this.layerItemId, this)
		}
		this._rightOutLinePrimitiveH && this._rightOutLinePrimitiveH.delete()
		this._rightOutLinePrimitiveH = null!
		if (!this._rightOutLinePrimitiveN) {
			this._rightOutLinePrimitiveN = new BaseD2Line(this.layerItemId, this)
		}
		this._bottomOutLinePrimitiveH && this._bottomOutLinePrimitiveH.delete()
		this._bottomOutLinePrimitiveH = null!
		if (!this._bottomOutLinePrimitiveN) {
			this._bottomOutLinePrimitiveN = new BaseD2Line(this.layerItemId, this)
		}
		this._leftOutLinePrimitiveH && this._leftOutLinePrimitiveH.delete()
		this._leftOutLinePrimitiveH = null!
		if (!this._leftOutLinePrimitiveN) {
			this._leftOutLinePrimitiveN = new BaseD2Line(this.layerItemId, this)
		}
	}

	public hightlighting(): void {
		if (!this._maskPrimitive) {
			this._maskPrimitive = new BaseD2Line(EDrawLayerCode.MaskLayer, this)
		}
		this._upOutLinePrimitiveN && this._upOutLinePrimitiveN.delete()
		this._upOutLinePrimitiveN = null!
		if (!this._upOutLinePrimitiveH) {
			this._upOutLinePrimitiveH = new BaseD2Line(EDrawLayerCode.MaskLayer, this)
		}
		this._rightOutLinePrimitiveN && this._rightOutLinePrimitiveN.delete()
		this._rightOutLinePrimitiveN = null!
		if (!this._rightOutLinePrimitiveH) {
			this._rightOutLinePrimitiveH = new BaseD2Line(EDrawLayerCode.MaskLayer, this)
		}
		this._bottomOutLinePrimitiveN && this._bottomOutLinePrimitiveN.delete()
		this._bottomOutLinePrimitiveN = null!
		if (!this._bottomOutLinePrimitiveH) {
			this._bottomOutLinePrimitiveH = new BaseD2Line(EDrawLayerCode.MaskLayer, this)
		}
		this._leftOutLinePrimitiveN && this._leftOutLinePrimitiveN.delete()
		this._leftOutLinePrimitiveN = null!
		if (!this._leftOutLinePrimitiveH) {
			this._leftOutLinePrimitiveH = new BaseD2Line(EDrawLayerCode.MaskLayer, this)
		}
	}
}
