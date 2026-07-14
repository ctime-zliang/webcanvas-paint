import { ED2ElementType } from '../../../../config/D2ElementProfile'
import { D2ShapeElementViewBase } from './elementBase/D2ShapeElementViewBase'
import { BaseD2Line } from '../../structure/primitive2d/BaseD2Line'
import { StructureItemBase } from '../../structure/primitive2d/elementBase/StructureItemBase'
import { MaskColor } from '../../utils/Mask'
import { EDrawLayerCode } from '../../../../config/DrawLayerProfile'
import { TElement2DLineJSONViewData } from '../../../../types/Element'
import { D2ElementShapeItemBase } from '../../../../objects/shapes/primitive2d/elementBase/D2ElementShapeItemBase'
import { D2LineShape } from '../../../../objects/shapes/primitive2d/D2LineShape'

export class D2LineView extends D2ShapeElementViewBase {
	private _mainPrimitive: StructureItemBase
	private _maskPrimitive: StructureItemBase
	constructor(shapeObject: D2ElementShapeItemBase) {
		super(shapeObject)
		this._mainPrimitive = null!
		this._maskPrimitive = null!
		this.type = shapeObject.getType()
		this.layerItemId = shapeObject.model.layerItemId
	}

	public modify(shapeObjectItem: D2LineShape): void {
		const { status } = shapeObjectItem
		const { layerItemId } = shapeObjectItem.model
		this.layerItemId = layerItemId
		this.status = status
		const shapeObjectItemJson: TElement2DLineJSONViewData = shapeObjectItem.toJSON()
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
			const maskElementItemData: TElement2DLineJSONViewData = {
				...shapeObjectItemJson,
				layerItemId: this._maskPrimitive.layerItemId,
			}
			maskElementItemData.strokeColorData = MaskColor.createStrokeColor().toRGBAJSON()
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

	public normalview(shapeObjectItem: D2LineShape): void {
		if (this._maskPrimitive) {
			this._maskPrimitive.delete()
			this._maskPrimitive = undefined!
		}
		const elementItemType: ED2ElementType = shapeObjectItem.getType()
		switch (elementItemType) {
			case ED2ElementType.D2Line: {
				if (!this._mainPrimitive) {
					this._mainPrimitive = new BaseD2Line(this.layerItemId, this)
				}
				break
			}
			case ED2ElementType.D2AssistLine: {
				if (!this._mainPrimitive) {
					this._mainPrimitive = new BaseD2Line(EDrawLayerCode.MaskLayer, this)
				}
				break
			}
		}
	}

	public hightlighting(): void {
		if (!this._maskPrimitive) {
			this._maskPrimitive = new BaseD2Line(EDrawLayerCode.MaskLayer, this)
		}
	}
}
