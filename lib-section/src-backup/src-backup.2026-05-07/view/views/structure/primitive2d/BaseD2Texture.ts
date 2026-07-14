import { TElement2DImageJSONViewData } from '../../../../types/Element'
import { DrawLayerView } from '../../shapes/DrawLayerView'
import { D2ShapeElementViewBase } from '../../shapes/primitive2d/elementBase/D2ShapeElementViewBase'
import { StructureItemBase } from './elementBase/StructureItemBase'

export class BaseD2Texture extends StructureItemBase {
	private parent: D2ShapeElementViewBase
	private _webGLTexture: WebGLTexture
	constructor(layerItemId: string, parent: D2ShapeElementViewBase) {
		super(layerItemId)
		this._webGLTexture = null!
		this.parent = parent
	}

	public modify(data: TElement2DImageJSONViewData): void {
		const drawLayerViewItem: DrawLayerView = this.getDrawLayerViewItem(this.layerItemId)
		if (this.belongId === null) {
			this._webGLTexture = drawLayerViewItem.plane.getScene().getWebGLTexture(data.texImageSource)
			this.belongId = drawLayerViewItem.layerPayloads.addD2ImageProfileItem({ ...data, texture: this._webGLTexture })
		} else {
			drawLayerViewItem.layerPayloads.updateD2ImageProfileItem(this.belongId, { ...data, texture: this._webGLTexture })
		}
	}

	public delete(): void {
		const drawLayerViewItem: DrawLayerView = this.getDrawLayerViewItem(this.layerItemId)
		if (this.belongId !== null) {
			drawLayerViewItem.layerPayloads.deletedD2ImageProfileItem(this.belongId)
		}
	}
}
