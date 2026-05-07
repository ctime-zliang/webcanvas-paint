import { DrawLayerView } from '../../shapes/DrawLayerView'
import { StructureItemBase } from './elementBase/StructureItemBase'
import { TElement2DTextJSONViewData } from '../../../../types/Element'
import { D2ShapeElementViewBase } from '../../shapes/primitive2d/elementBase/D2ShapeElementViewBase'

export class BaseD2Text extends StructureItemBase {
	private parent: D2ShapeElementViewBase
	constructor(layerItemId: string, parent: D2ShapeElementViewBase) {
		super(layerItemId)
		this.parent = parent
	}

	public modify(data: TElement2DTextJSONViewData): void {
		const drawLayerViewItem: DrawLayerView = this.getDrawLayerViewItem(this.layerItemId)
		if (this.belongId === null) {
			this.belongId = drawLayerViewItem.layerPayloads.addD2TextProfileItem(data)
		} else {
			drawLayerViewItem.layerPayloads.updateD2TextProfileItem(this.belongId, data)
		}
	}

	public delete(): void {
		const drawLayerViewItem: DrawLayerView = this.getDrawLayerViewItem(this.layerItemId)
		if (this.belongId !== null) {
			drawLayerViewItem.layerPayloads.deletedD2TextProfileItem(this.belongId)
		}
	}
}
