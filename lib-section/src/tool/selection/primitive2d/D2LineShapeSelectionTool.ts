import { DIRECTION_KEY_MOVE_STEP } from '../../../config/Config'
import { EDIRECTION_KEY } from '../../../config/NativeProfile'
import { EOperationAction } from '../../../config/OperationProfile'
import { Matrix4 } from '../../../engine/algorithm/geometry/matrix/Matrix4'
import { ED2PointShape } from '../../../engine/config/PrimitiveProfile'
import { D2AssistPointShape, buildD2AssistPointShape } from '../../../objects/assist/primitive2d/D2AssistPointShape'
import { D2LineShape } from '../../../objects/shapes/primitive2d/D2LineShape'
import { TAllElementShapeType } from '../../../types/Element'
import { CommandProxy } from '../../history/command/primitive2d/CommandProxy'
import { ECommandAction } from '../../history/command/Config'
import { D2LineShapeCommand } from '../../history/command/primitive2d/D2LineShapeCommand'
import { InputInfo } from '../../InputInfo'
import { CanvasMatrix4 } from '../../../engine/algorithm/geometry/matrix/CanvasMatrix4'
import { D2SelectionTool } from './D2SelectionTool'
import { Vector2 } from '../../../engine/algorithm/geometry/vector/Vector2'
import { D2LineTransform } from '../../../algorithm/geometry/D2LineTransform'
import { Constant } from '../../../Constant'
import { OutProfileMessage } from '../../../utils/OutMessage'

export class D2LineShapeSelectionTool extends D2SelectionTool {
	private _shapeItemCommand: D2LineShapeCommand
	private _selectedItem: D2LineShape
	private _pointStart: D2AssistPointShape
	private _pointMiddle: D2AssistPointShape
	private _pointEnd: D2AssistPointShape
	private _isSelectedPointStart: boolean
	private _isSelectedPointMiddle: boolean
	private _isSelectedPointEnd: boolean
	constructor(selectedItem: D2LineShape) {
		super()
		this._shapeItemCommand = null!
		this._selectedItem = selectedItem
		this._pointStart = null!
		this._pointMiddle = null!
		this._pointEnd = null!
		this._isSelectedPointStart = false
		this._isSelectedPointMiddle = false
		this._isSelectedPointEnd = false
		this.initPointsPosition()
	}

	public mouseLeftDownSelect(inputInfo: InputInfo): TAllElementShapeType {
		const allControlAssistPoints: Array<D2AssistPointShape> = [this._pointStart, this._pointMiddle, this._pointEnd]
		let hitItem: D2AssistPointShape = null!
		for (let i: number = 0; i < allControlAssistPoints.length; i++) {
			if (allControlAssistPoints[i].isSelect(inputInfo.moveScenePhysicsX, inputInfo.moveScenePhysicsY)) {
				hitItem = allControlAssistPoints[i]
				break
			}
		}
		return hitItem ? hitItem.parent : null!
	}

	public keyDownHandler(inputInfo: InputInfo): void {
		switch (inputInfo.keyCode) {
			case EDIRECTION_KEY.LEFT: {
				this.moveSelectedItem(-DIRECTION_KEY_MOVE_STEP, 0)
				break
			}
			case EDIRECTION_KEY.UP: {
				this.moveSelectedItem(0, DIRECTION_KEY_MOVE_STEP)
				break
			}
			case EDIRECTION_KEY.RIGHT: {
				this.moveSelectedItem(DIRECTION_KEY_MOVE_STEP, 0)
				break
			}
			case EDIRECTION_KEY.DOWN: {
				this.moveSelectedItem(0, -DIRECTION_KEY_MOVE_STEP)
				break
			}
			default:
		}
	}

	public keyUpHandler(inputInfo: InputInfo): void {}

	public mouseLeftDownHandler(inputInfo: InputInfo): void {
		this.moveScenePhysicsX = inputInfo.leftDownScenePhysicsX
		this.moveScenePhysicsY = inputInfo.leftDownScenePhysicsY
		if (this._selectedItem) {
			this._shapeItemCommand = CommandProxy.getCommandInstance(
				this._selectedItem.elementItemId,
				ECommandAction.MODIFY,
				Constant.globalIdenManager.getCommandIden()
			) as D2LineShapeCommand
		}
		this._isSelectedPointStart = this._pointStart.isSelect(inputInfo.leftDownScenePhysicsX, inputInfo.leftDownScenePhysicsY)
		this._isSelectedPointMiddle = this._pointMiddle.isSelect(inputInfo.leftDownScenePhysicsX, inputInfo.leftDownScenePhysicsY)
		this._isSelectedPointEnd = this._pointEnd.isSelect(inputInfo.leftDownScenePhysicsX, inputInfo.leftDownScenePhysicsY)
	}

	public mouseLeftUpHandler(inputInfo: InputInfo): void {
		if (this._selectedItem) {
			this._selectedItem.model.updateBBox2()
			if (this._shapeItemCommand) {
				Constant.historyManager.add(this._shapeItemCommand)
			}
			OutProfileMessage.dispatchOperationProfileChangeMessage(EOperationAction.MODIFY_ELEMENT, {})
		}
		this._shapeItemCommand = null!
	}

	public mouseMoveHandler(inputInfo: InputInfo): void {
		const diffX: number = inputInfo.moveScenePhysicsX - this.moveScenePhysicsX
		const diffY: number = inputInfo.moveScenePhysicsY - this.moveScenePhysicsY
		const translateMatrix4: Matrix4 = CanvasMatrix4.setTranslateByVector3(new Vector2(diffX, diffY).toVector3())
		if (this._isSelectedPointStart) {
			this._selectedItem.startPoint = this._selectedItem.startPoint.multiplyMatrix4(translateMatrix4)
		} else if (this._isSelectedPointMiddle) {
			if (diffX === 0 && diffY === 0) {
				return
			}
			/**
			 * 计算当前线段的垂线向量 B
			 * 计算当前鼠标的移动向量 A
			 * 计算向量 A 在向量 B 上的投影 C
			 */
			const perpendicular: { v1: Vector2; v2: Vector2 } = D2LineTransform.calculatePerpendicular(
				this._selectedItem.endPoint.sub(this._selectedItem.startPoint)
			)
			const B: Vector2 = perpendicular.v1
			const A: Vector2 = new Vector2(diffX, diffY)
			const C: Vector2 = new Vector2(
				((A.x * B.x + A.y * B.y) * B.x) / (B.x * B.x + B.y * B.y),
				((A.x * B.x + A.y * B.y) * B.y) / (B.x * B.x + B.y * B.y)
			)
			const translateMatrix4: Matrix4 = CanvasMatrix4.setTranslateByVector3(new Vector2(C.x, C.y).toVector3())
			this._selectedItem.startPoint = this._selectedItem.startPoint.multiplyMatrix4(translateMatrix4)
			this._selectedItem.endPoint = this._selectedItem.endPoint.multiplyMatrix4(translateMatrix4)
		} else if (this._isSelectedPointEnd) {
			this._selectedItem.endPoint = this._selectedItem.endPoint.multiplyMatrix4(translateMatrix4)
		} else {
			this.moveSelectedItem(diffX, diffY)
		}
		this.updatePointsPosition()
		this.moveScenePhysicsX = inputInfo.moveScenePhysicsX
		this.moveScenePhysicsY = inputInfo.moveScenePhysicsY
	}

	public mouseUpMoveHandler(inputInfo: InputInfo): void {
		const allControlAssistPoints: Array<D2AssistPointShape> = [this._pointStart, this._pointMiddle, this._pointEnd]
		let hit: boolean = false
		for (let i: number = 0; i < allControlAssistPoints.length; i++) {
			if (this.isSelectAssistPoint(allControlAssistPoints[i], inputInfo.moveScenePhysicsX, inputInfo.moveScenePhysicsY)) {
				hit = true
				break
			}
		}
		if (hit) {
			Constant.environment.updateCanvasMouseCursor('pointer')
		} else {
			Constant.environment.updateCanvasMouseCursor('default')
		}
	}

	public clear(): void {
		this._selectedItem = null!
		this._pointStart.setDelete()
		this._pointMiddle.setDelete()
		this._pointEnd.setDelete()
		this._pointStart = null!
		this._pointMiddle = null!
		this._pointEnd = null!
		this._isSelectedPointStart = false
		this._isSelectedPointMiddle = false
		this._isSelectedPointEnd = false
	}

	public quit(): void {
		this._shapeItemCommand = undefined!
		this._selectedItem = undefined!
		super.quit()
	}

	private initPointsPosition(): void {
		this._pointStart = buildD2AssistPointShape(this._selectedItem.startPoint, this._selectedItem)
		const middleVec: Vector2 = this._selectedItem.startPoint.add(this._selectedItem.endPoint)
		this._pointMiddle = buildD2AssistPointShape(new Vector2(middleVec.x / 2, middleVec.y / 2), this._selectedItem, ED2PointShape.TRIANGLE, 1.6)
		this._pointEnd = buildD2AssistPointShape(this._selectedItem.endPoint, this._selectedItem)
	}

	private updatePointsPosition(): void {
		this._pointStart.centerPoint = this._selectedItem.startPoint.copy()
		const middleVec: Vector2 = this._selectedItem.startPoint.add(this._selectedItem.endPoint)
		this._pointMiddle.centerPoint = new Vector2(middleVec.x / 2, middleVec.y / 2)
		this._pointEnd.centerPoint = this._selectedItem.endPoint.copy()
	}

	private moveSelectedItem(diffX: number, diffY: number): void {
		const moveMatrix4: Matrix4 = CanvasMatrix4.setTranslateByVector3(new Vector2(diffX, diffY).toVector3())
		this._selectedItem.transform(moveMatrix4)
	}
}
