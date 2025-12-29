import { DrawLayerView } from '../../shapes/DrawLayerView'
import { StructureItemBase } from './elementBase/StructureItemBase'
import { TElement2DArcJSONViewData } from '../../../../types/Element'
import { ShapeElementViewBase } from '../../shapes/primitive2d/elementBase/ShapeElementViewBase'

export class BaseD2Arc extends StructureItemBase {
	private parent: ShapeElementViewBase
	constructor(layerItemId: string, parent: ShapeElementViewBase) {
		super(layerItemId)
		this.parent = parent
	}

	public modify(data: TElement2DArcJSONViewData): void {
		const drawLayerViewItem: DrawLayerView = this.getDrawLayerViewItem(this.layerItemId)
		if (this.belongId === null) {
			this.belongId = drawLayerViewItem.layerPayloads.addD2ArcProfileItem(data)
		} else {
			drawLayerViewItem.layerPayloads.updateD2ArcProfileItem(this.belongId, data)
		}
	}

	public delete(): void {
		const drawLayerViewItem: DrawLayerView = this.getDrawLayerViewItem(this.layerItemId)
		drawLayerViewItem.layerPayloads.deletedD2ArcProfileItem(this.belongId)
	}
}
