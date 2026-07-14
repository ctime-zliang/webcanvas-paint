import { Constant } from '../../../../Constant'
import { EPrimitiveStatus } from '../../../../engine/config/PrimitiveProfile'
import { D2ElementModelItemBase } from '../../../models/primitive2d/elementBase/D2ElementModelItemBase'
import { D2ElementShapeBase } from './D2ElementShapeBase'

export abstract class D2ElementShapeItemBase extends D2ElementShapeBase {
	private _model: D2ElementModelItemBase
	private _isSelectable: boolean
	constructor() {
		super()
		this._model = null!
		this._isSelectable = true
	}

	public get elementItemId(): string {
		return this._model.elementItemId
	}

	public get model(): D2ElementModelItemBase {
		return this._model
	}
	public set model(value: D2ElementModelItemBase) {
		this._model = value
	}

	public get isSelectable(): boolean {
		return this._isSelectable
	}
	public set isSelectable(value: boolean) {
		this._isSelectable = value
	}

	public get alpha(): number {
		return this._model.alpha
	}
	public set alpha(value: number) {
		this._model.alpha = value
	}

	public get visible(): boolean {
		return this.isStatusMatch(EPrimitiveStatus.VISIBLE)
	}
	public set visible(value: boolean) {
		this.setStatusMatch(EPrimitiveStatus.VISIBLE, value)
		this.refreshRender()
	}

	public get hightlight(): boolean {
		return this.isStatusMatch(EPrimitiveStatus.HIGHTLIGHT)
	}
	public set hightlight(value: boolean) {
		this.setStatusMatch(EPrimitiveStatus.HIGHTLIGHT, value)
		this.refreshRender()
	}

	public get locked(): boolean {
		return this.isStatusMatch(EPrimitiveStatus.LOCKED)
	}
	public set locked(value: boolean) {
		this.setStatusMatch(EPrimitiveStatus.LOCKED, value)
		this.refreshRender()
	}

	public get killed(): boolean {
		return this.isStatusMatch(EPrimitiveStatus.KILLED)
	}
	public set killed(value: boolean) {
		this.setStatusMatch(EPrimitiveStatus.KILLED, value)
		this.refreshRender()
	}

	public setSelect(): void {
		this.visible = true
		this.hightlight = true
	}
	public setUnSelect(): void {
		this.visible = true
		this.hightlight = false
	}

	public setVisible(): void {
		this.visible = true
		this.hightlight = true
	}
	public setUnVisible(): void {
		this.visible = false
		this.hightlight = false
	}

	public setHightlight(): void {
		this.visible = true
		this.hightlight = true
	}
	public setUnHightlight(): void {
		this.visible = true
		this.hightlight = false
	}

	public setDelete(): void {
		this.killed = true
	}

	public refreshRender(): void {
		Constant.modifyController.attachElement(this)
	}
}
