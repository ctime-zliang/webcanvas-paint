import { EFrameCommand } from '../../../../config/CommandEnum'
import { Constant } from '../../../../Constant'
import { CanvasMatrix4 } from '../../../../engine/algorithm/geometry/matrix/CanvasMatrix4'
import { Matrix4 } from '../../../../engine/algorithm/geometry/matrix/Matrix4'
import { Vector2 } from '../../../../engine/algorithm/geometry/vector/Vector2'
import { Vector3 } from '../../../../engine/algorithm/geometry/vector/Vector3'
import { DrawLayerShapeManager } from '../../../../objects/shapes/manager/DrawLayerShapeManager'
import { D2ImageShapeManager } from '../../../../objects/shapes/manager/primitive2d/D2ImageShapeManager'
import { buildD2ImageShape, D2ImageShape } from '../../../../objects/shapes/primitive2d/D2ImageShape'
import { InputInfo } from '../../../InputInfo'
import { DrawD2Shape } from '../DrawD2Shape'

export class DrawD2ImageShape extends DrawD2Shape {
	private _shapeInstances: Array<D2ImageShape>
	constructor() {
		super()
		this._shapeInstances = []
	}

	public get shapeInstances(): Array<D2ImageShape> {
		return this._shapeInstances
	}
	public set shapeInstances(value: Array<D2ImageShape>) {
		this._shapeInstances = value
	}

	public completeDraw(): Array<D2ImageShape> {
		const drawedItems: Array<D2ImageShape> = []
		if (this.shapeInstances.length) {
			for (let i: number = 0; i < this.shapeInstances.length; i++) {
				const targetShapeItem: D2ImageShape = this.shapeInstances[i]
				const elementItemId: string = Constant.globalIdenManager.getElementIden()
				const newTargetShapeItem: D2ImageShape = D2ImageShapeManager.getInstance().createShapeItem(
					elementItemId,
					this.selectedDrawLayerShapeItem.model.layerItemId,
					new Vector2(this.inputInfo.moveRealScenePhysicsX, this.inputInfo.moveRealScenePhysicsY),
					targetShapeItem.fileHashUuid,
					targetShapeItem.imageDataURL,
					targetShapeItem.width,
					targetShapeItem.height
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

	public updateShapes(inputInfo: InputInfo, diffX: number, diffY: number): void {
		for (let i: number = 0; i < this.shapeInstances.length; i++) {
			const moveMatrix4: Matrix4 = CanvasMatrix4.setTranslateByVector3(new Vector3(diffX, diffY, 0))
			this.shapeInstances[i].transform(moveMatrix4)
		}
	}

	public createShapes(x: number, y: number, fileHashUuid: string, imageDataURL: string, width: number, height: number): void {
		this.selectedDrawLayerShapeItem = DrawLayerShapeManager.getInstance().getFirstSelectedItem()
		if (!this.selectedDrawLayerShapeItem) {
			console.warn(`[draw d2-element] please activate a draw-layer first.`)
			return
		}
		const textShape: D2ImageShape = buildD2ImageShape(
			this.selectedDrawLayerShapeItem.model.layerItemId,
			new Vector2(x, y),
			fileHashUuid,
			imageDataURL,
			width,
			height,
			0,
			undefined!,
			0.75,
			0,
			false,
			false,
			(elementShapeItem: D2ImageShape): void => {
				const x: number = this.inputInfo ? this.inputInfo.moveRealScenePhysicsX : 0
				const y: number = this.inputInfo ? this.inputInfo.moveRealScenePhysicsY : 0
				elementShapeItem.position = new Vector2(x, y)
				Constant.messageTool.messageBus.publish(EFrameCommand.RENDER_FRAME, null)
			}
		)
		this.shapeInstances.push(textShape)
	}

	public destoryShapes(): void {
		for (let i: number = 0; i < this.shapeInstances.length; i++) {
			this.shapeInstances[i].setDelete()
		}
		this.shapeInstances.length = 0
	}

	public isShapeInsatncesContentReady(): boolean {
		for (let i: number = 0; i < this.shapeInstances.length; i++) {
			if (!this.shapeInstances[i].isContentReady()) {
				return false
			}
		}
		return true
	}

	public quit(): void {
		this._shapeInstances = undefined!
	}
}
