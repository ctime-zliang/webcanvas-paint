import { ED2ElementType } from '../../../../config/D2ElementProfile'
import { ShapeElementViewBase } from './elementBase/ShapeElementViewBase'
import { StructureItemBase } from '../../structure/primitive2d/elementBase/StructureItemBase'
import { MaskColor } from '../../utils/Mask'
import { TElement2DTextJSONViewData } from '../../../../types/Element'
import { ElementShapeItemBase } from '../../../../objects/shapes/primitive2d/elementBase/ElementShapeItemBase'
import { ECanvas2DLineCap } from '../../../../engine/config/PrimitiveProfile'
import { BaseD2Text } from '../../structure/primitive2d/BaseD2Text'
import { D2TextShape } from '../../../../objects/shapes/primitive2d/D2TextShape'
import { BaseD2Line } from '../../structure/primitive2d/BaseD2Line'
import { EDrawLayerCode } from '../../../../config/DrawLayerProfile'
import { Vector2 } from '../../../../engine/algorithm/geometry/vector/Vector2'

export class D2TextView extends ShapeElementViewBase {
	private _mainPrimitive: StructureItemBase
	private _bgPrimitive: StructureItemBase
	private _maskPrimitive: StructureItemBase
	constructor(shapeObject: ElementShapeItemBase) {
		super(shapeObject)
		this.type = shapeObject.getType()
		this.layerItemId = shapeObject.model.layerItemId
		this._mainPrimitive = null!
		this._bgPrimitive = null!
		this._maskPrimitive = null!
	}

	public modify(shapeObjectItem: D2TextShape): void {
		const { status } = shapeObjectItem
		const { layerItemId } = shapeObjectItem.model
		const elementItemType: ED2ElementType = shapeObjectItem.getType()
		this.layerItemId = layerItemId
		this.status = status
		if (!this._mainPrimitive) {
			this.delete()
			switch (elementItemType) {
				case ED2ElementType.D2Text: {
					this._mainPrimitive = new BaseD2Text(layerItemId, this)
					this._bgPrimitive = new BaseD2Line(layerItemId, this)
					break
				}
			}
		}
		if (this.hightlight) {
			this.hightlighting()
		} else {
			this.normalview()
		}
		const shapeObjectItemJson: TElement2DTextJSONViewData = shapeObjectItem.toJSON()
		if (this._mainPrimitive) {
			this._mainPrimitive.modify(shapeObjectItemJson)
		}
		if (this._bgPrimitive && shapeObjectItemJson.bbox2 && shapeObjectItemJson.bgColorData) {
			this._bgPrimitive.modify({
				status: shapeObjectItemJson.status,
				layerItemId: shapeObjectItemJson.layerItemId,
				startPoint: new Vector2(
					shapeObjectItemJson.bbox2.minX - shapeObjectItemJson.paddingSurrounded.left,
					shapeObjectItemJson.bbox2.minY + (shapeObjectItemJson.bbox2.maxY - shapeObjectItemJson.bbox2.minY) / 2
				).toJSON(),
				endPoint: new Vector2(
					shapeObjectItemJson.bbox2.maxX + shapeObjectItemJson.paddingSurrounded.right,
					shapeObjectItemJson.bbox2.minY + (shapeObjectItemJson.bbox2.maxY - shapeObjectItemJson.bbox2.minY) / 2
				).toJSON(),
				strokeWidth:
					shapeObjectItemJson.bbox2.maxY -
					shapeObjectItemJson.bbox2.minY +
					shapeObjectItemJson.paddingSurrounded.top +
					shapeObjectItemJson.paddingSurrounded.bottom,
				strokeColorData: shapeObjectItemJson.bgColorData,
				alpha: 1.0,
				lineCap: ECanvas2DLineCap.SQUARE,
				isSolid: true,
				segSize: 0,
				gapSize: 0,
				isFixedStrokeWidth: false,
			})
		}
		if (this._maskPrimitive) {
			this._maskPrimitive.modify({
				status: shapeObjectItemJson.status,
				layerItemId: this._maskPrimitive.layerItemId,
				startPoint: new Vector2(
					shapeObjectItemJson.bbox2.minX - shapeObjectItemJson.paddingSurrounded.left,
					shapeObjectItemJson.bbox2.minY + (shapeObjectItemJson.bbox2.maxY - shapeObjectItemJson.bbox2.minY) / 2
				).toJSON(),
				endPoint: new Vector2(
					shapeObjectItemJson.bbox2.maxX + shapeObjectItemJson.paddingSurrounded.right,
					shapeObjectItemJson.bbox2.minY + (shapeObjectItemJson.bbox2.maxY - shapeObjectItemJson.bbox2.minY) / 2
				).toJSON(),
				strokeWidth:
					shapeObjectItemJson.bbox2.maxY -
					shapeObjectItemJson.bbox2.minY +
					shapeObjectItemJson.paddingSurrounded.top +
					shapeObjectItemJson.paddingSurrounded.bottom,
				strokeColorData: MaskColor.createStrokeColor().toRGBAJSON(),
				alpha: 0.35,
				lineCap: ECanvas2DLineCap.SQUARE,
				isSolid: true,
				segSize: 0,
				gapSize: 0,
				isFixedStrokeWidth: false,
			})
		}
	}

	public delete(): void {
		this._mainPrimitive && this._mainPrimitive.delete()
		this._bgPrimitive && this._bgPrimitive.delete()
		this._maskPrimitive && this._maskPrimitive.delete()
	}

	public normalview(): void {
		this._maskPrimitive && this._maskPrimitive.delete()
		this._maskPrimitive = null!
	}

	public hightlighting(): void {
		if (!this._maskPrimitive) {
			this._maskPrimitive = new BaseD2Line(EDrawLayerCode.MaskLayer, this)
		}
	}
}
