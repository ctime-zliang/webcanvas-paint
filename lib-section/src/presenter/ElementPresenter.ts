import { Scene } from '../engine/common/Scene'
import { ElementShapeItemBase } from '../objects/shapes/primitive2d/elementBase/ElementShapeItemBase'
import { DrawLayerViewManager } from '../view/manager/DrawLayerViewManager'
import { ShapeViewManager } from '../view/manager/ShapeViewManager'
import { Presenter } from './Presenter'

export class ElementPresenter extends Presenter {
	private _scene: Scene
	constructor(scene: Scene) {
		super()
		this._scene = scene
	}

	public notify(elements: Set<ElementShapeItemBase>): void {
		ShapeViewManager.getInstance().handleModify(this._scene, elements)
		DrawLayerViewManager.getInstance().handleRefreshView(this._scene)
	}

	public quit(): void {
		ShapeViewManager.getInstance().quit()
		DrawLayerViewManager.getInstance().quit()
	}
}
