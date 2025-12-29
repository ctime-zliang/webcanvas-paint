import { Constant } from '../../../../Constant'
import { Vector2 } from '../../../../engine/algorithm/geometry/vector/Vector2'
import { Color } from '../../../../engine/common/Color'
import { ED2PointShape } from '../../../../engine/config/PrimitiveProfile'
import { DrawLayerShapeManager } from '../../../../objects/shapes/manager/DrawLayerShapeManager'
import { D2PointShapeManager } from '../../../../objects/shapes/manager/primitive2d/D2PointShapeManager'
import { buildD2PointShape, D2PointShape } from '../../../../objects/shapes/primitive2d/D2PointShape'
import { InputInfo } from '../../../InputInfo'
import { DrawD2Shape } from '../DrawD2Shape'

export class DrawD2PointShape extends DrawD2Shape {
	private _shapeInstances: Array<D2PointShape>
	constructor() {
		super()
		this._shapeInstances = []
	}

	public get shapeInstances(): Array<D2PointShape> {
		return this._shapeInstances
	}
	public set shapeInstances(value: Array<D2PointShape>) {
		this._shapeInstances = value
	}

	public completeDraw(): Array<D2PointShape> {
		const drawedItems: Array<D2PointShape> = []
		if (this.shapeInstances.length) {
			for (let i: number = 0; i < this.shapeInstances.length; i++) {
				const targetShapeItem: D2PointShape = this.shapeInstances[i]
				const elementItemId: string = Constant.globalIdenManager.getElementIden()
				const newTargetShapeItem: D2PointShape = D2PointShapeManager.getInstance().createShapeItem(
					elementItemId,
					this.selectedDrawLayerShapeItem.model.layerItemId,
					targetShapeItem.centerPoint,
					targetShapeItem.size,
					targetShapeItem.shape,
					targetShapeItem.strokeColor,
					targetShapeItem.alpha,
					targetShapeItem.isEnableScale,
					targetShapeItem.isEnableSelect
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
			this.shapeInstances[i].size = nowPoint.sub(centerPoint).length
		}
	}

	public createShapes(x: number, y: number): void {
		this.selectedDrawLayerShapeItem = DrawLayerShapeManager.getInstance().getFirstSelectedItem()
		if (!this.selectedDrawLayerShapeItem) {
			console.warn(`[draw d2-element] please activate a draw-layer first.`)
			return
		}
		this.shapeInstances.push(
			buildD2PointShape(
				this.selectedDrawLayerShapeItem.model.layerItemId,
				new Vector2(x, y),
				1.0,
				ED2PointShape.DOT,
				Color.RED,
				1.0,
				true,
				true
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
