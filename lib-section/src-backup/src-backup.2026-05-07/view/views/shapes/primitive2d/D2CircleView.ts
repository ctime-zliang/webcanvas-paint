import { D2ShapeElementViewBase } from './elementBase/D2ShapeElementViewBase'
import { BaseD2Circle } from '../../structure/primitive2d/BaseD2Circle'
import { MaskColor } from '../../utils/Mask'
import { EDrawLayerCode } from '../../../../config/DrawLayerProfile'
import { TElement2DCircleJSONViewData } from '../../../../types/Element'
import { D2ElementShapeItemBase } from '../../../../objects/shapes/primitive2d/elementBase/D2ElementShapeItemBase'
import { D2CircleShape } from '../../../../objects/shapes/primitive2d/D2CircleShape'
import { StructureItemBase } from '../../structure/primitive2d/elementBase/StructureItemBase'

export class D2CircleView extends D2ShapeElementViewBase {
	private _mainPrimitive: StructureItemBase
	private _maskPrimitive: StructureItemBase
	constructor(shapeObject: D2ElementShapeItemBase) {
		super(shapeObject)
		this._mainPrimitive = null!
		this._maskPrimitive = null!
		this.type = shapeObject.getType()
		this.layerItemId = shapeObject.model.layerItemId
	}

	public modify(shapeObjectItem: D2CircleShape): void {
		const { status, fillColor } = shapeObjectItem
		const { layerItemId } = shapeObjectItem.model
		this.layerItemId = layerItemId
		this.status = status
		const shapeObjectItemJson: TElement2DCircleJSONViewData = shapeObjectItem.toJSON()
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
		if (this._maskPrimitive) {
			const maskElementItemData: TElement2DCircleJSONViewData = {
				...shapeObjectItemJson,
				layerItemId: this._maskPrimitive.layerItemId,
			}
			maskElementItemData.strokeColorData = MaskColor.createStrokeColor().toRGBAJSON()
			maskElementItemData.fillColorData = MaskColor.createFillColor(fillColor.toRGBAJSON()).toRGBAJSON()
			this._maskPrimitive.modify(maskElementItemData as any)
		}
	}

	public delete(): void {
		if (this._mainPrimitive) {
			this._mainPrimitive.delete()
			this._mainPrimitive = undefined!
		}
		if (this._maskPrimitive) {
			this._maskPrimitive.delete()
			this._maskPrimitive = undefined!
		}
	}

	public normalview(shapeObjectItem: D2CircleShape): void {
		if (this._maskPrimitive) {
			this._maskPrimitive.delete()
			this._maskPrimitive = undefined!
		}
		if (!this._mainPrimitive) {
			this._mainPrimitive = new BaseD2Circle(this.layerItemId, this)
		}
	}

	public hightlighting(): void {
		if (!this._maskPrimitive) {
			this._maskPrimitive = new BaseD2Circle(EDrawLayerCode.MaskLayer, this)
		}
	}
}
