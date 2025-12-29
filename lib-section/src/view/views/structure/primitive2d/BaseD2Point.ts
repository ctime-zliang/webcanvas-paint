import { DrawLayerView } from '../../shapes/DrawLayerView'
import { StructureItemBase } from './elementBase/StructureItemBase'
import { TElement2DPointJSONViewData } from '../../../../types/Element'
import { ShapeElementViewBase } from '../../shapes/primitive2d/elementBase/ShapeElementViewBase'

export class BaseD2Point extends StructureItemBase {
	private parent: ShapeElementViewBase
	constructor(layerItemId: string, parent: ShapeElementViewBase) {
		super(layerItemId)
		this.parent = parent
	}

	public modify(data: TElement2DPointJSONViewData): void {
		const drawLayerViewItem: DrawLayerView = this.getDrawLayerViewItem(this.layerItemId)
		if (this.belongId === null) {
			this.belongId = drawLayerViewItem.layerPayloads.addD2PointProfileItem(data)
		} else {
			drawLayerViewItem.layerPayloads.updateD2PointProfileItem(this.belongId, data)
		}
	}

	public delete(): void {
		const drawLayerViewItem: DrawLayerView = this.getDrawLayerViewItem(this.layerItemId)
		drawLayerViewItem.layerPayloads.deletedD2PointProfileItem(this.belongId)
	}
}
