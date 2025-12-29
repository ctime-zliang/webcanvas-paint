import { EPlaneStatus } from '../../engine/config/PlaneProfile'
import { TPlaneJSONData } from '../../engine/types/Plane'
import { DrawLayerModel } from '../models/DrawLayerModel'
import { DrawLayerShapeItemBase } from './DrawLayerShapeItemBase'

export class DrawLayerShape extends DrawLayerShapeItemBase {
	constructor(model: DrawLayerModel) {
		super()
		this.model = model
		this.refreshRender()
	}

	public get layerItemName(): string {
		return (this.model as DrawLayerModel).layerItemName
	}
	public set layerItemName(value: string) {
		;(this.model as DrawLayerModel).layerItemName = value
		this.refreshRender()
	}

	public get layerItemOpacity(): number {
		return (this.model as DrawLayerModel).layerItemOpacity
	}
	public set layerItemOpacity(value: number) {
		;(this.model as DrawLayerModel).layerItemOpacity = value
		this.refreshRender()
	}

	public get groupId(): string | undefined {
		return (this.model as DrawLayerModel).groupId
	}
	public set groupId(value: string | undefined) {
		;(this.model as DrawLayerModel).groupId = value
		this.refreshRender()
	}

	public getType(): number {
		return this.model.layerItemType
	}

	public getStatus(): EPlaneStatus {
		return this.status
	}

	public toJSON(): TPlaneJSONData {
		const itemModel: DrawLayerModel = this.model as DrawLayerModel
		return {
			status: this.status,
			layerItemType: itemModel.layerItemType,
			layerItemId: itemModel.layerItemId,
			layerItemName: itemModel.layerItemName,
			layerItemOpacity: itemModel.layerItemOpacity,
			groupId: itemModel.groupId!,
		}
	}
}
