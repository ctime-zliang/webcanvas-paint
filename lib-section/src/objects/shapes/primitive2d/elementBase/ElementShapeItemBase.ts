import { Constant } from '../../../../Constant'
import { EPrimitiveStatus } from '../../../../engine/config/PrimitiveProfile'
import { ElementModelItemBase } from '../../../models/primitive2d/elementBase/ElementModelItemBase'
import { ElementShapeBase } from './ElementShapeBase'

export abstract class ElementShapeItemBase extends ElementShapeBase {
	private _model: ElementModelItemBase
	constructor() {
		super()
		this._model = null!
	}

	public get elementItemId(): string {
		return this._model.elementItemId
	}

	public get model(): ElementModelItemBase {
		return this._model
	}
	public set model(value: ElementModelItemBase) {
		this._model = value
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
