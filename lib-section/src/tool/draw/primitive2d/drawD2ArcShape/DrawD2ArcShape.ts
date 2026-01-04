import { D2ArcTransform } from '../../../../algorithm/geometry/D2ArcTransform'
import { Constant } from '../../../../Constant'
import { Vector2 } from '../../../../engine/algorithm/geometry/vector/Vector2'
import { DrawLayerShapeManager } from '../../../../objects/shapes/manager/DrawLayerShapeManager'
import { D2ArcShapeManager } from '../../../../objects/shapes/manager/primitive2d/D2ArcShapeManager'
import { buildD2ArcShape, D2ArcShape } from '../../../../objects/shapes/primitive2d/D2ArcShape'
import { buildD2LineShape, D2LineShape } from '../../../../objects/shapes/primitive2d/D2LineShape'
import { InputInfo } from '../../../InputInfo'
import { DrawD2Shape } from '../DrawD2Shape'

export class DrawD2ArcShape extends DrawD2Shape {
	private _shapeInstances: Array<D2ArcShape>
	private _firstInitD2Lines: Array<D2LineShape>
	private _pointsGroup: Array<[Vector2, Vector2, Vector2]>
	constructor() {
		super()
		this._shapeInstances = []
		this._firstInitD2Lines = []
		this._pointsGroup = []
	}

	public get shapeInstances(): Array<D2ArcShape> {
		return this._shapeInstances
	}
	public set shapeInstances(value: Array<D2ArcShape>) {
		this._shapeInstances = value
	}

	public get firstInitD2Lines(): Array<D2LineShape> {
		return this._firstInitD2Lines
	}
	public set firstInitD2Lines(value: Array<D2LineShape>) {
		this._firstInitD2Lines = value
	}

	public completeDraw(): Array<D2ArcShape> {
		const drawedItems: Array<D2ArcShape> = []
		if (this.shapeInstances.length) {
			for (let i: number = 0; i < this.shapeInstances.length; i++) {
				const targetShapeItem: D2ArcShape = this.shapeInstances[i]
				const elementItemId: string = Constant.globalIdenManager.getElementIden()
				const { startAngle, endAngle, radius, centerPoint, sweep } = D2ArcTransform.calculateD2ArcProfileByThreePoint(
					this._pointsGroup[i][0],
					this._pointsGroup[i][1],
					this._pointsGroup[i][2]
				)
				const newTargetShapeItem: D2ArcShape = D2ArcShapeManager.getInstance().createShapeItem(
					elementItemId,
					this.selectedDrawLayerShapeItem.model.layerItemId,
					centerPoint,
					radius,
					startAngle,
					endAngle,
					sweep,
					targetShapeItem.strokeWidth,
					targetShapeItem.strokeColor,
					targetShapeItem.isFill,
					targetShapeItem.fillColor
				)
				drawedItems.push(newTargetShapeItem)
				targetShapeItem.setDelete()
			}
		}
		this.clearFirstInitD2LineShapes()
		this.clearStartAndEndPoints()
		this.destoryShapes()
		return drawedItems
	}

	public cancelDraw(): void {
		this.clearFirstInitD2LineShapes()
		this.clearStartAndEndPoints()
		this.destoryShapes()
	}

	public clearStartAndEndPoints(): void {
		this._pointsGroup.length = 0
	}

	public clearFirstInitD2LineShapes(): void {
		for (let i: number = 0; i < this._firstInitD2Lines.length; i++) {
			this._firstInitD2Lines[i].setDelete()
		}
		this._firstInitD2Lines.length = 0
	}

	public updateFirstInitD2LineShapes(inputInfo: InputInfo): void {
		for (let i: number = 0; i < this._firstInitD2Lines.length; i++) {
			this._firstInitD2Lines[i].endPoint = new Vector2(inputInfo.moveScenePhysicsX, inputInfo.moveScenePhysicsY)
			this._pointsGroup[i][1] = new Vector2(inputInfo.moveScenePhysicsX, inputInfo.moveScenePhysicsY)
		}
	}

	public createFirstInitD2LineShapes(x: number, y: number): void {
		this.selectedDrawLayerShapeItem = DrawLayerShapeManager.getInstance().getFirstSelectedItem()
		if (!this.selectedDrawLayerShapeItem) {
			console.warn(`[draw d2-element] please activate a draw-layer first.`)
			return
		}
		this._firstInitD2Lines.push(
			buildD2LineShape(
				this.selectedDrawLayerShapeItem.model.layerItemId,
				new Vector2(x, y),
				new Vector2(x, y),
				this.strokeWidth,
				this.strokeColor
			)
		)
		this._pointsGroup.push([new Vector2(x, y), new Vector2(x, y), null!])
	}

	public updateShapes(inputInfo: InputInfo): void {
		for (let i: number = 0; i < this.shapeInstances.length; i++) {
			this._pointsGroup[i][2] = new Vector2(inputInfo.moveScenePhysicsX, inputInfo.moveScenePhysicsY)
			const { startAngle, endAngle, radius, centerPoint, sweep } = D2ArcTransform.calculateD2ArcProfileByThreePoint(
				this._pointsGroup[i][0],
				this._pointsGroup[i][1],
				this._pointsGroup[i][2]
			)
			this.shapeInstances[i].startAngle = startAngle
			this.shapeInstances[i].endAngle = endAngle
			this.shapeInstances[i].radius = radius
			this.shapeInstances[i].sweep = sweep
			this.shapeInstances[i].centerPoint = centerPoint
		}
	}

	public createShapes(x: number, y: number): void {
		this.selectedDrawLayerShapeItem = DrawLayerShapeManager.getInstance().getFirstSelectedItem()
		if (!this.selectedDrawLayerShapeItem) {
			console.warn(`[draw d2-element] please activate a draw-layer first.`)
			return
		}
		for (let i: number = 0; i < this._firstInitD2Lines.length; i++) {
			this._pointsGroup[i][2] = new Vector2(x + 0.005, y + 0.005)
			const { startAngle, endAngle, radius, centerPoint, sweep } = D2ArcTransform.calculateD2ArcProfileByThreePoint(
				this._pointsGroup[i][0],
				this._pointsGroup[i][1],
				this._pointsGroup[i][2]
			)
			this.shapeInstances.push(
				buildD2ArcShape(
					this.selectedDrawLayerShapeItem.model.layerItemId,
					centerPoint,
					radius,
					startAngle,
					endAngle,
					sweep,
					this.strokeWidth,
					this.strokeColor,
					this.isFill,
					this.fillColor
				)
			)
		}
	}

	public destoryShapes(): void {
		for (let i: number = 0; i < this.shapeInstances.length; i++) {
			this.shapeInstances[i].setDelete()
		}
		this.shapeInstances.length = 0
	}

	public quit(): void {
		this._shapeInstances = undefined!
		this._firstInitD2Lines = undefined!
		this._pointsGroup = undefined!
	}
}
