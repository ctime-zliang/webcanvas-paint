import { Constant } from '../../../../Constant'
import { Vector2 } from '../../../../engine/algorithm/geometry/vector/Vector2'
import { DrawLayerShapeManager } from '../../../../objects/shapes/manager/DrawLayerShapeManager'
import { D2LineShapeManager } from '../../../../objects/shapes/manager/primitive2d/D2LineShapeManager'
import { buildD2LineShape, D2LineShape } from '../../../../objects/shapes/primitive2d/D2LineShape'
import { InputInfo } from '../../../InputInfo'
import { DrawD2Shape } from '../DrawD2Shape'

export class DrawD2LineShape extends DrawD2Shape {
	private _shapeInstances: Array<D2LineShape>
	constructor() {
		super()
		this._shapeInstances = []
	}

	public get shapeInstances(): Array<D2LineShape> {
		return this._shapeInstances
	}
	public set shapeInstances(value: Array<D2LineShape>) {
		this._shapeInstances = value
	}

	public completeDraw(): Array<D2LineShape> {
		const drawedItems: Array<D2LineShape> = []
		if (this.shapeInstances.length) {
			for (let i: number = 0; i < this.shapeInstances.length; i++) {
				const targetShapeItem: D2LineShape = this.shapeInstances[i]
				const elementItemId: string = Constant.globalIdenManager.getElementIden()
				const newTargetShapeItem: D2LineShape = D2LineShapeManager.getInstance().createShapeItem(
					elementItemId,
					this.selectedDrawLayerShapeItem.model.layerItemId,
					targetShapeItem.startPoint,
					targetShapeItem.endPoint,
					targetShapeItem.strokeWidth,
					targetShapeItem.strokeColor
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
			this.shapeInstances[i].endPoint = new Vector2(inputInfo.moveScenePhysicsX, inputInfo.moveScenePhysicsY)
		}
	}

	public createShapes(x: number, y: number): void {
		this.selectedDrawLayerShapeItem = DrawLayerShapeManager.getInstance().getFirstSelectedItem()
		if (!this.selectedDrawLayerShapeItem) {
			console.warn(`[draw d2-element] please activate a draw-layer first.`)
			return
		}
		this.shapeInstances.push(
			buildD2LineShape(
				this.selectedDrawLayerShapeItem.model.layerItemId,
				new Vector2(x, y),
				new Vector2(x, y),
				this.strokeWidth,
				this.strokeColor
			)
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
