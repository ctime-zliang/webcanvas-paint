import { Constant } from '../../../../Constant'
import { Vector2 } from '../../../../engine/algorithm/geometry/vector/Vector2'
import { DrawLayerShapeManager } from '../../../../objects/shapes/manager/DrawLayerShapeManager'
import { D2CircleShapeManager } from '../../../../objects/shapes/manager/primitive2d/D2CircleShapeManager'
import { buildD2CircleShape, D2CircleShape } from '../../../../objects/shapes/primitive2d/D2CircleShape'
import { InputInfo } from '../../../InputInfo'
import { DrawD2Shape } from '../DrawD2Shape'

export class DrawD2CircleShape extends DrawD2Shape {
	private _shapeInstances: Array<D2CircleShape>
	constructor() {
		super()
		this._shapeInstances = []
	}

	public get shapeInstances(): Array<D2CircleShape> {
		return this._shapeInstances
	}
	public set shapeInstances(value: Array<D2CircleShape>) {
		this._shapeInstances = value
	}

	public completeDraw(): Array<D2CircleShape> {
		const drawedItems: Array<D2CircleShape> = []
		if (this.shapeInstances.length) {
			for (let i: number = 0; i < this.shapeInstances.length; i++) {
				const targetShapeItem: D2CircleShape = this.shapeInstances[i]
				const elementItemId: string = Constant.globalIdenManager.getElementIden()
				const newTargetShapeItem: D2CircleShape = D2CircleShapeManager.getInstance().createShapeItem(
					elementItemId,
					this.selectedDrawLayerShapeItem.model.layerItemId,
					targetShapeItem.centerPoint,
					targetShapeItem.radius,
					targetShapeItem.strokeWidth,
					targetShapeItem.strokeColor,
					targetShapeItem.isFill,
					targetShapeItem.fillColor
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
			const centerPoint: Vector2 = this.shapeInstances[i].centerPoint
			const nowPoint: Vector2 = new Vector2(inputInfo.moveScenePhysicsX, inputInfo.moveScenePhysicsY)
			this.shapeInstances[i].radius = nowPoint.sub(centerPoint).length
		}
	}

	public createShapes(x: number, y: number): void {
		this.selectedDrawLayerShapeItem = DrawLayerShapeManager.getInstance().getFirstSelectedItem()
		if (!this.selectedDrawLayerShapeItem) {
			console.warn(`[draw d2-element] please activate a draw-layer first.`)
			return
		}
		this.shapeInstances.push(
			buildD2CircleShape(
				this.selectedDrawLayerShapeItem.model.layerItemId,
				new Vector2(x, y),
				0,
				this.strokeWidth,
				this.strokeColor,
				this.isFill,
				this.fillColor
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
