import { ED2ElementType } from '../../../../config/D2ElementProfile'
import { ShapeElementViewBase } from './elementBase/ShapeElementViewBase'
import { BaseD2Line } from '../../structure/primitive2d/BaseD2Line'
import { StructureItemBase } from '../../structure/primitive2d/elementBase/StructureItemBase'
import { MaskColor } from '../../utils/Mask'
import { EDrawLayerCode } from '../../../../config/DrawLayerProfile'
import { TElement2DLineJSONViewData } from '../../../../types/Element'
import { ElementShapeItemBase } from '../../../../objects/shapes/primitive2d/elementBase/ElementShapeItemBase'
import { D2LineShape } from '../../../../objects/shapes/primitive2d/D2LineShape'

export class D2LineView extends ShapeElementViewBase {
	private _mainPrimitive: StructureItemBase
	private _maskPrimitive: StructureItemBase
	constructor(shapeObject: ElementShapeItemBase) {
		super(shapeObject)
		this.type = shapeObject.getType()
		this.layerItemId = shapeObject.model.layerItemId
		this._mainPrimitive = null!
		this._maskPrimitive = null!
	}

	public modify(shapeObjectItem: D2LineShape): void {
		const { status } = shapeObjectItem
		const { layerItemId } = shapeObjectItem.model
		const elementItemType: ED2ElementType = shapeObjectItem.getType()
		this.layerItemId = layerItemId
		this.status = status
		if (!this._mainPrimitive) {
			this.delete()
			switch (elementItemType) {
				case ED2ElementType.D2Line: {
					this._mainPrimitive = new BaseD2Line(layerItemId, this)
					break
				}
				case ED2ElementType.D2AssistLine: {
					this._mainPrimitive = new BaseD2Line(EDrawLayerCode.MaskLayer, this)
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
			const maskElementItemData: TElement2DLineJSONViewData = {
				...shapeObjectItem.toJSON(),
				layerItemId: this._maskPrimitive.layerItemId,
			}
			maskElementItemData.strokeColorData = MaskColor.createStrokeColor().toRGBAJSON()
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
			this._maskPrimitive = new BaseD2Line(EDrawLayerCode.MaskLayer, this)
		}
	}
}
