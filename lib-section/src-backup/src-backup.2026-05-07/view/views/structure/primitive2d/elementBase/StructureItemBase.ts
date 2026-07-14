import { DrawLayerViewManager } from '../../../../manager/DrawLayerViewManager'
import { DrawLayerView } from '../../../shapes/DrawLayerView'
import { StructureBase } from './StructureBase'

export abstract class StructureItemBase extends StructureBase {
	private _elementItemId: string
	private _layerItemId: string
	private _belongId: string
	constructor(layerItemId: string) {
		super()
		this._elementItemId = null!
		this._layerItemId = layerItemId
		this._belongId = null!
	}

	public get elementItemId(): string {
		return this._elementItemId
	}
	public set elementItemId(value: string) {
		this._elementItemId = value
	}

	public get belongId(): string {
		return this._belongId
	}
	public set belongId(value: string) {
		this._belongId = value
	}

	public get layerItemId(): string {
		return this._layerItemId
	}
	public set layerItemId(value: string) {
		this._layerItemId = value
	}

	public getDrawLayerViewItem(layerItemId: string): DrawLayerView {
		return DrawLayerViewManager.getInstance().items.get(layerItemId) as DrawLayerView
	}
}
