import { EPlaneType } from '../../engine/config/PlaneProfile'

export class DrawLayerBaseItemModel {
	private _layerItemType: number
	private _layerItemName: string
	private _layerItemOpacity: number
	private _groupId: string | undefined
	private _layerItemId: string
	constructor(layerItemId: string, layerItemName: string, layerItemType: EPlaneType) {
		this._layerItemType = undefined as any
		this._layerItemName = layerItemName
		this._layerItemOpacity = 1
		this._groupId = undefined as any
		this._layerItemId = layerItemId
		this._layerItemType = layerItemType
	}

	public get layerItemType(): number {
		return this._layerItemType
	}
	public set layerItemType(value: number) {
		this._layerItemType = value
	}

	public get layerItemName(): string {
		return this._layerItemName
	}
	public set layerItemName(value: string) {
		this._layerItemName = value
	}

	public get layerItemOpacity(): number {
		return this._layerItemOpacity
	}
	public set layerItemOpacity(value: number) {
		this._layerItemOpacity = value
	}

	public get groupId(): string | undefined {
		return this._groupId
	}
	public set groupId(value: string | undefined) {
		this._groupId = value
	}

	public get layerItemId(): string {
		return this._layerItemId
	}
	public set layerItemId(value: string) {
		this._layerItemId = value
	}
}
