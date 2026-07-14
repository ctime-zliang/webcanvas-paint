import { EPlaneType } from '../../engine/config/PlaneProfile'
import { DrawLayerBaseItemModel } from './DrawLayerBaseItemModel'

export class DrawLayerModel extends DrawLayerBaseItemModel {
	constructor(layerItemId: string, layerItemName: string, layerItemType: EPlaneType) {
		super(layerItemId, layerItemName, layerItemType)
	}
}
