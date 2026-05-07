import { D2ShapeElementViewBase } from './elementBase/D2ShapeElementViewBase'
import { MaskColor } from '../../utils/Mask'
import { EDrawLayerCode } from '../../../../config/DrawLayerProfile'
import { TElement2DArcJSONViewData } from '../../../../types/Element'
import { D2ElementShapeItemBase } from '../../../../objects/shapes/primitive2d/elementBase/D2ElementShapeItemBase'
import { StructureItemBase } from '../../structure/primitive2d/elementBase/StructureItemBase'
import { D2ArcShape } from '../../../../objects/shapes/primitive2d/D2ArcShape'
import { BaseD2Arc } from '../../structure/primitive2d/BaseD2Arc'

export class D2ArcView extends D2ShapeElementViewBase {
	private _mainPrimitive: StructureItemBase
	private _maskPrimitive: StructureItemBase
	constructor(shapeObject: D2ElementShapeItemBase) {
		super(shapeObject)
		this._mainPrimitive = null!
		this._maskPrimitive = null!
		this.type = shapeObject.getType()
		this.layerItemId = shapeObject.model.layerItemId
	}

	public modify(shapeObjectItem: D2ArcShape): void {
		const { status, fillColor } = shapeObjectItem
		const { layerItemId } = shapeObjectItem.model
		this.layerItemId = layerItemId
		this.status = status
		const shapeObjectItemJson: TElement2DArcJSONViewData = shapeObjectItem.toJSON()
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
			const maskElementItemData: TElement2DArcJSONViewData = {
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

	public normalview(shapeObjectItem: D2ArcShape): void {
		if (this._maskPrimitive) {
			this._maskPrimitive.delete()
			this._maskPrimitive = undefined!
		}
		if (!this._mainPrimitive) {
			this._mainPrimitive = new BaseD2Arc(this.layerItemId, this)
		}
	}

	public hightlighting(): void {
		if (!this._maskPrimitive) {
			this._maskPrimitive = new BaseD2Arc(EDrawLayerCode.MaskLayer, this)
		}
	}
}
