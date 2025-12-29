import { ED2ElementType } from '../../../../config/D2ElementProfile'
import { ShapeElementViewBase } from './elementBase/ShapeElementViewBase'
import { MaskColor } from '../../utils/Mask'
import { EDrawLayerCode } from '../../../../config/DrawLayerProfile'
import { TElement2DArcJSONViewData } from '../../../../types/Element'
import { ElementShapeItemBase } from '../../../../objects/shapes/primitive2d/elementBase/ElementShapeItemBase'
import { StructureItemBase } from '../../structure/primitive2d/elementBase/StructureItemBase'
import { D2ArcShape } from '../../../../objects/shapes/primitive2d/D2ArcShape'
import { BaseD2Arc } from '../../structure/primitive2d/BaseD2Arc'

export class D2ArcView extends ShapeElementViewBase {
	private _mainPrimitive: StructureItemBase
	private _maskPrimitive: StructureItemBase
	constructor(shapeObject: ElementShapeItemBase) {
		super(shapeObject)
		this.type = shapeObject.getType()
		this.layerItemId = shapeObject.model.layerItemId
		this._mainPrimitive = null!
		this._maskPrimitive = null!
	}

	public modify(shapeObjectItem: D2ArcShape): void {
		const { status, fillColor } = shapeObjectItem
		const { layerItemId } = shapeObjectItem.model
		const elementItemType: ED2ElementType = shapeObjectItem.getType()
		this.status = status
		if (!this._mainPrimitive) {
			this.delete()
			switch (elementItemType) {
				case ED2ElementType.D2Arc: {
					this._mainPrimitive = new BaseD2Arc(layerItemId, this)
					break
				}
			}
		}
		if (this.hightlight) {
			this.hightlighting()
		} else {
			this.normalview()
		}
		if (this._mainPrimitive) {
			this._mainPrimitive.modify(shapeObjectItem.toJSON())
		}
		if (this._maskPrimitive) {
			const maskElementItemData: TElement2DArcJSONViewData = {
				...shapeObjectItem.toJSON(),
				layerItemId: this._maskPrimitive.layerItemId,
			}
			maskElementItemData.strokeColorData = MaskColor.createStrokeColor().toRGBAJSON()
			maskElementItemData.fillColorData = MaskColor.createFillColor(fillColor.toRGBAJSON()).toRGBAJSON()
			this._maskPrimitive.modify(maskElementItemData as any)
		}
	}

	public delete(): void {
		this._mainPrimitive && this._mainPrimitive.delete()
		this._maskPrimitive && this._maskPrimitive.delete()
	}

	public normalview(): void {
		this._maskPrimitive && this._maskPrimitive.delete()
		this._maskPrimitive = null!
	}

	public hightlighting(): void {
		if (!this._maskPrimitive) {
			this._maskPrimitive = new BaseD2Arc(EDrawLayerCode.MaskLayer, this)
		}
	}
}
