import { TElement2DLineJSONViewData } from '../../../../types/Element'
import { DrawLayerView } from '../../shapes/DrawLayerView'
import { ShapeElementViewBase } from '../../shapes/primitive2d/elementBase/ShapeElementViewBase'
import { StructureItemBase } from './elementBase/StructureItemBase'

export class BaseD2Line extends StructureItemBase {
	private parent: ShapeElementViewBase
	constructor(layerItemId: string, parent: ShapeElementViewBase) {
		super(layerItemId)
		this.parent = parent
	}

	public modify(data: TElement2DLineJSONViewData): void {
		const drawLayerViewItem: DrawLayerView = this.getDrawLayerViewItem(this.layerItemId)
		if (this.belongId === null) {
			this.belongId = drawLayerViewItem.layerPayloads.addD2LineProfileItem(data)
		} else {
			drawLayerViewItem.layerPayloads.updateD2LineProfileItem(this.belongId, data)
		}
	}

	public delete(): void {
		const drawLayerViewItem: DrawLayerView = this.getDrawLayerViewItem(this.layerItemId)
		if (this.belongId !== null) {
			drawLayerViewItem.layerPayloads.deletedD2LineProfileItem(this.belongId)
		}
	}
}
