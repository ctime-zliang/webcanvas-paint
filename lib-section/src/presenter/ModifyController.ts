import { DrawLayerShapeItemBase } from '../objects/shapes/DrawLayerShapeItemBase'
import { ElementShapeItemBase } from '../objects/shapes/primitive2d/elementBase/ElementShapeItemBase'
import { ElementPresenter } from './ElementPresenter'
import { DrawLayerPresenter } from './DrawLayerPresenter'
import { BaseInterface } from '../controller/BaseInterface'

export class ModifyController extends BaseInterface {
	private _drawLayerPresenter: DrawLayerPresenter
	private _elementPresenter: ElementPresenter
	private _drawLayers: Set<DrawLayerShapeItemBase>
	private _elements: Set<ElementShapeItemBase>
	constructor() {
		super()
		this._drawLayers = new Set([])
		this._elements = new Set([])
		this._drawLayerPresenter = null!
		this._elementPresenter = null!
	}

	public setLayerPresenter(drawLayerPresenter: DrawLayerPresenter): void {
		this._drawLayerPresenter = drawLayerPresenter
	}

	public setElementPresenter(elementPresenter: ElementPresenter): void {
		this._elementPresenter = elementPresenter
	}

	public attachDrawLayer(drawLayerItem: DrawLayerShapeItemBase): void {
		this._drawLayers.add(drawLayerItem)
	}

	public attachElement(elementItem: ElementShapeItemBase): void {
		this._elements.add(elementItem)
	}

	public notify(isShouldHandleElementsPriority: boolean = false): void {
		if (isShouldHandleElementsPriority) {
			if (this._elementPresenter) {
				this._elementPresenter.notify(this._elements)
			}
			this._elements.clear()
			if (this._drawLayerPresenter) {
				this._drawLayerPresenter.notify(this._drawLayers)
			}
			this._drawLayers.clear()
			return
		}
		if (this._drawLayerPresenter) {
			this._drawLayerPresenter.notify(this._drawLayers)
		}
		this._drawLayers.clear()
		if (this._elementPresenter) {
			this._elementPresenter.notify(this._elements)
		}
		this._elements.clear()
	}

	public quit(): void {
		this._drawLayers.clear()
		this._drawLayers = undefined!
		this._elements.clear()
		this._elements = undefined!
		if (this._elementPresenter) {
			this._elementPresenter.quit()
			this._elementPresenter = undefined!
		}
		if (this._drawLayerPresenter) {
			this._drawLayerPresenter.quit()
			this._drawLayerPresenter = undefined!
		}
	}
}
