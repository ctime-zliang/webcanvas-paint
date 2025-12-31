import { EFrameCommand } from '../../../../config/CommandEnum'
import { Constant } from '../../../../Constant'
import { CanvasMatrix4 } from '../../../../engine/algorithm/geometry/matrix/CanvasMatrix4'
import { Matrix4 } from '../../../../engine/algorithm/geometry/matrix/Matrix4'
import { Vector2 } from '../../../../engine/algorithm/geometry/vector/Vector2'
import { Vector3 } from '../../../../engine/algorithm/geometry/vector/Vector3'
import { DrawLayerShapeManager } from '../../../../objects/shapes/manager/DrawLayerShapeManager'
import { D2TextShapeManager } from '../../../../objects/shapes/manager/primitive2d/D2TextShapeManager'
import { buildD2TextShape, D2TextShape } from '../../../../objects/shapes/primitive2d/D2TextShape'
import { InputInfo } from '../../../InputInfo'
import { DrawD2Shape } from '../DrawD2Shape'

export class DrawD2TextShape extends DrawD2Shape {
	private _shapeInstances: Array<D2TextShape>
	constructor() {
		super()
		this._shapeInstances = []
	}

	public get shapeInstances(): Array<D2TextShape> {
		return this._shapeInstances
	}
	public set shapeInstances(value: Array<D2TextShape>) {
		this._shapeInstances = value
	}

	public completeDraw(): Array<D2TextShape> {
		const drawedItems: Array<D2TextShape> = []
		if (this.shapeInstances.length) {
			for (let i: number = 0; i < this.shapeInstances.length; i++) {
				const targetShapeItem: D2TextShape = this.shapeInstances[i]
				const elementItemId: string = Constant.globalIdenManager.getElementIden()
				const newTargetShapeItem: D2TextShape = D2TextShapeManager.getInstance().createShapeItem(
					elementItemId,
					this.selectedDrawLayerShapeItem.model.layerItemId,
					new Vector2(this.inputInfo.moveRealScenePhysicsX, this.inputInfo.moveRealScenePhysicsY),
					targetShapeItem.content,
					targetShapeItem.fontFamily,
					targetShapeItem.fontStyle,
					targetShapeItem.fontSize,
					targetShapeItem.fontWeight,
					targetShapeItem.strokeColor,
					1.0,
					targetShapeItem.bgColor,
					targetShapeItem.paddingSurrounded
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
			const diffMatrix4: Matrix4 = CanvasMatrix4.setTranslate(new Vector3(diffX, diffY, 0))
			this.shapeInstances[i].transform(diffMatrix4)
		}
	}

	public createShapes(x: number, y: number, textContent: string): void {
		this.selectedDrawLayerShapeItem = DrawLayerShapeManager.getInstance().getFirstSelectedItem()
		if (!this.selectedDrawLayerShapeItem) {
			console.warn(`[draw d2-element] please activate a draw-layer first.`)
			return
		}
		const textShape: D2TextShape = buildD2TextShape(
			this.selectedDrawLayerShapeItem.model.layerItemId,
			new Vector2(0, 0),
			textContent,
			undefined,
			undefined,
			undefined,
			undefined,
			undefined,
			0.5,
			undefined,
			undefined,
			(elementShapeItem: D2TextShape): void => {
				const x: number = this.inputInfo ? this.inputInfo.moveRealScenePhysicsX : 0
				const y: number = this.inputInfo ? this.inputInfo.moveRealScenePhysicsY : 0
				elementShapeItem.transform(CanvasMatrix4.setTranslate(new Vector3(x, y, 0)))
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
