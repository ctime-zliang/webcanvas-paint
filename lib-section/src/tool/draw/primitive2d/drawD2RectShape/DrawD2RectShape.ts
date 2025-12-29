import { Constant } from '../../../../Constant'
import { Vector2 } from '../../../../engine/algorithm/geometry/vector/Vector2'
import { DrawLayerShapeManager } from '../../../../objects/shapes/manager/DrawLayerShapeManager'
import { D2RectShapeManager } from '../../../../objects/shapes/manager/primitive2d/D2RectShapeManager'
import { buildD2RectShape, D2RectShape } from '../../../../objects/shapes/primitive2d/D2RectShape'
import { InputInfo } from '../../../InputInfo'
import { DrawD2Shape } from '../DrawD2Shape'

export class DrawD2RectShape extends DrawD2Shape {
	private _shapeInstances: Array<D2RectShape>
	constructor() {
		super()
		this._shapeInstances = []
	}

	public get shapeInstances(): Array<D2RectShape> {
		return this._shapeInstances
	}
	public set shapeInstances(value: Array<D2RectShape>) {
		this._shapeInstances = value
	}

	public completeDraw(): Array<D2RectShape> {
		const drawedItems: Array<D2RectShape> = []
		if (this.shapeInstances.length) {
			for (let i: number = 0; i < this.shapeInstances.length; i++) {
				const targetShapeItem: D2RectShape = this.shapeInstances[i]
				const elementItemId: string = Constant.globalIdenManager.getElementIden()
				const newTargetShapeItem: D2RectShape = D2RectShapeManager.getInstance().createShapeItem(
					elementItemId,
					this.selectedDrawLayerShapeItem.model.layerItemId,
					targetShapeItem.position,
					targetShapeItem.width,
					targetShapeItem.height,
					targetShapeItem.strokeWidth,
					targetShapeItem.strokeColor,
					targetShapeItem.isFill,
					targetShapeItem.fillColor,
					targetShapeItem.alpha,
					targetShapeItem.isSolid,
					targetShapeItem.borderRadius,
					targetShapeItem.isFixedStrokeWidth
				)
				drawedItems.push(newTargetShapeItem)
				targetShapeItem.setDelete()
			}
		}
		this.destoryShapes()
		return drawedItems
	}

	public cancelDraw(): void {
		this.destoryShapes()
	}

	public updateShapes(inputInfo: InputInfo): void {
		for (let i: number = 0; i < this.shapeInstances.length; i++) {
			const width: number = inputInfo.moveScenePhysicsX - this.shapeInstances[i].position.x
			const height: number = inputInfo.moveScenePhysicsY - this.shapeInstances[i].position.y
			this.shapeInstances[i].width = width
			this.shapeInstances[i].height = -height
		}
	}

	public createShapes(x: number, y: number): void {
		this.selectedDrawLayerShapeItem = DrawLayerShapeManager.getInstance().getFirstSelectedItem()
		if (!this.selectedDrawLayerShapeItem) {
			console.warn(`[draw d2-element] please activate a draw-layer first.`)
			return
		}
		this.shapeInstances.push(
			buildD2RectShape(this.selectedDrawLayerShapeItem.model.layerItemId, new Vector2(x, y), 0, 0, this.strokeWidth, this.strokeColor, false)
		)
	}

	public destoryShapes(): void {
		for (let i: number = 0; i < this.shapeInstances.length; i++) {
			this.shapeInstances[i].setDelete()
		}
		this.shapeInstances.length = 0
	}

	public quit(): void {
		this._shapeInstances = undefined!
	}
}
