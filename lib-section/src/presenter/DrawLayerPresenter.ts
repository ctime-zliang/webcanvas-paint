import { Scene } from '../engine/common/Scene'
import { DrawLayerShapeItemBase } from '../objects/shapes/DrawLayerShapeItemBase'
import { DrawLayerViewManager } from '../view/manager/DrawLayerViewManager'
import { Presenter } from './Presenter'

export class DrawLayerPresenter extends Presenter {
	private _scene: Scene
	constructor(scene: Scene) {
		super()
		this._scene = scene
	}

	public notify(drawLayers: Set<DrawLayerShapeItemBase>): void {
		DrawLayerViewManager.getInstance().handleModify(this._scene, drawLayers)
	}

	public quit(): void {
		DrawLayerViewManager.getInstance().quit()
	}
}
