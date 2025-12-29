import { DrawLayerViewPayloads } from './DrawLayerViewPayloads'
import { Scene } from '../../../engine/common/Scene'
import { Plane } from '../../../engine/common/Plane'
import { EPlaneType, PLANE_INIT_STATUS } from '../../../engine/config/PlaneProfile'
import { TPlaneJSONData } from '../../../engine/types/Plane'
import { Context } from '../../../engine/common/Context'

export class DrawLayerView extends Context {
	private _scene: Scene
	private _plane: Plane
	private _layerItemType: EPlaneType
	private _layerItemName: string
	private _layerItemOpacity: number
	private _groupId: string | undefined
	private _layerItemId: string
	private _layerPayloads: DrawLayerViewPayloads
	constructor(scene: Scene, layerItemId: string, layerItemType: EPlaneType, layerItemName: string, layerItemOpacity: number, groupId: string) {
		super(PLANE_INIT_STATUS)
		this._scene = scene
		this._layerItemType = layerItemType
		this._layerItemId = layerItemId
		this._layerItemName = layerItemName
		this._layerItemOpacity = layerItemOpacity
		this._groupId = groupId
		if (this._layerItemType === EPlaneType.ControlPlane) {
			this._plane = scene.addControlPlaneItem(layerItemId)
		} else if (this._layerItemType === EPlaneType.ContentPlane) {
			this._plane = scene.addContentPlaneItem(layerItemId)
		} else {
			throw new Error(`error layer type.`)
		}
		this._layerPayloads = new DrawLayerViewPayloads(this)
	}

	public get plane(): Plane {
		return this._plane
	}

	public get scene(): Scene {
		return this._scene
	}

	public get layerItemType(): EPlaneType {
		return this._layerItemType
	}
	public set layerItemType(value: EPlaneType) {
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

	public get layerPayloads(): DrawLayerViewPayloads {
		return this._layerPayloads
	}
	public set layerPayloads(value: DrawLayerViewPayloads) {
		this._layerPayloads = value
	}

	public modify(layerItemData: TPlaneJSONData): void {
		this.layerItemName = layerItemData.layerItemName
		this.layerItemOpacity = layerItemData.layerItemOpacity
		this.groupId = layerItemData.groupId
	}

	public delete(): void {
		if (this.layerItemType === EPlaneType.ControlPlane) {
			this._scene.deleteControlPlaneItem(this.plane.planeId)
		} else if (this.layerItemType === EPlaneType.ContentPlane) {
			this._scene.deleteContentPlaneItem(this.plane.planeId)
		}
	}

	public notify(scene: Scene): void {
		this.layerPayloads.notify()
	}
}
