import { DrawLayerView } from '../../shapes/DrawLayerView'
import { StructureItemBase } from './elementBase/StructureItemBase'
import { TElement2DTextJSONViewData } from '../../../../types/Element'
import { ShapeElementViewBase } from '../../shapes/primitive2d/elementBase/ShapeElementViewBase'

export class BaseD2Text extends StructureItemBase {
	private parent: ShapeElementViewBase
	constructor(layerItemId: string, parent: ShapeElementViewBase) {
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
		drawLayerViewItem.layerPayloads.deletedD2TextProfileItem(this.belongId)
	}
}
