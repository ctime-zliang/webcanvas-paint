import { Constant } from '../../Constant'
import { EPlaneStatus } from '../../engine/config/PlaneProfile'
import { DrawLayerBaseItemModel } from '../models/DrawLayerBaseItemModel'
import { DrawLayerShapeBase } from './DrawLayerShapeBase'

export abstract class DrawLayerShapeItemBase extends DrawLayerShapeBase {
	private _model: DrawLayerBaseItemModel
	constructor() {
		super()
		this._model = null!
	}

	public get layerItemId(): string {
		return this._model.layerItemId
	}

	public get model(): DrawLayerBaseItemModel {
		return this._model
	}
	public set model(value: DrawLayerBaseItemModel) {
		this._model = value
	}

	public refreshRender(): void {
		Constant.modifyController.attachDrawLayer(this)
	}

	public get visible(): boolean {
		return this.isStatusMatch(EPlaneStatus.VISIBLE)
	}
	public set visible(value: boolean) {
		this.setStatusMatch(EPlaneStatus.VISIBLE, value)
		this.refreshRender()
	}

	public get locked(): boolean {
		return this.isStatusMatch(EPlaneStatus.LOCKED)
	}
	public set locked(value: boolean) {
		this.setStatusMatch(EPlaneStatus.LOCKED, value)
		this.refreshRender()
	}

	public get killed(): boolean {
		return this.isStatusMatch(EPlaneStatus.KILLED)
	}
	public set killed(value: boolean) {
		this.setStatusMatch(EPlaneStatus.KILLED, value)
		this.refreshRender()
	}

	public setSelect(): void {}

	public setUnSelect(): void {}

	public setDelete(): void {
		this.killed = true
	}
}
