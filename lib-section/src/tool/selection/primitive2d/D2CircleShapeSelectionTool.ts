import { DIRECTION_KEY_MOVE_STEP } from '../../../config/Config'
import { EDIRECTION_KEY } from '../../../config/NativeProfile'
import { EOperationAction } from '../../../config/OperationProfile'
import { Matrix4 } from '../../../engine/algorithm/geometry/matrix/Matrix4'
import { D2AssistPointShape, buildD2AssistPointShape } from '../../../objects/assist/primitive2d/D2AssistPointShape'
import { TAllElementShapeType } from '../../../types/Element'
import { D2CircleShapeCommand } from '../../history/command/primitive2d/D2CircleShapeCommand'
import { CommandProxy } from '../../history/command/primitive2d/CommandProxy'
import { ECommandAction } from '../../history/command/Config'
import { InputInfo } from '../../InputInfo'
import { D2CircleShape } from '../../../objects/shapes/primitive2d/D2CircleShape'
import { CanvasMatrix4 } from '../../../engine/algorithm/geometry/matrix/CanvasMatrix4'
import { D2SelectionTool } from './D2SelectionTool'
import { Vector2 } from '../../../engine/algorithm/geometry/vector/Vector2'
import { Constant } from '../../../Constant'
import { OutProfileMessage } from '../../../utils/OutMessage'

export class D2CircleShapeSelectionTool extends D2SelectionTool {
	private _shapeItemCommand: D2CircleShapeCommand
	private _selectedItem: D2CircleShape
	private _pointCenter: D2AssistPointShape
	private _pointTop: D2AssistPointShape
	private _pointRight: D2AssistPointShape
	private _pointBottom: D2AssistPointShape
	private _pointLeft: D2AssistPointShape
	private _isSelectedPointCenter: boolean
	private _isSelectedPointTop: boolean
	private _isSelectedPointRight: boolean
	private _isSelectedPointBottom: boolean
	private _isSelectedPointLeft: boolean
	constructor(selectedItem: D2CircleShape) {
		super()
		this._shapeItemCommand = null!
		this._selectedItem = selectedItem
		this._pointCenter = null!
		this._pointTop = null!
		this._pointRight = null!
		this._pointBottom = null!
		this._pointLeft = null!
		this._isSelectedPointCenter = false
		this._isSelectedPointTop = false
		this._isSelectedPointRight = false
		this._isSelectedPointBottom = false
		this._isSelectedPointLeft = false
		this.initPointsPosition()
	}

	public mouseLeftDownSelect(inputInfo: InputInfo): TAllElementShapeType {
		const allControlAssistPoints: Array<D2AssistPointShape> = [
			this._pointCenter,
			this._pointTop,
			this._pointRight,
			this._pointBottom,
			this._pointLeft,
		]
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
			) as D2CircleShapeCommand
		}
		this._isSelectedPointCenter = this._pointCenter.isSelect(inputInfo.leftDownScenePhysicsX, inputInfo.leftDownScenePhysicsY)
		this._isSelectedPointTop = this._pointTop.isSelect(inputInfo.leftDownScenePhysicsX, inputInfo.leftDownScenePhysicsY)
		this._isSelectedPointRight = this._pointRight.isSelect(inputInfo.leftDownScenePhysicsX, inputInfo.leftDownScenePhysicsY)
		this._isSelectedPointBottom = this._pointBottom.isSelect(inputInfo.leftDownScenePhysicsX, inputInfo.leftDownScenePhysicsY)
		this._isSelectedPointLeft = this._pointLeft.isSelect(inputInfo.leftDownScenePhysicsX, inputInfo.leftDownScenePhysicsY)
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
		if (this._isSelectedPointCenter) {
			this.moveSelectedItem(diffX, diffY)
		} else if (this._isSelectedPointTop) {
			this._selectedItem.updateRadius(inputInfo.moveScenePhysicsX, inputInfo.moveScenePhysicsY)
		} else if (this._isSelectedPointRight) {
			this._selectedItem.updateRadius(inputInfo.moveScenePhysicsX, inputInfo.moveScenePhysicsY)
		} else if (this._isSelectedPointBottom) {
			this._selectedItem.updateRadius(inputInfo.moveScenePhysicsX, inputInfo.moveScenePhysicsY)
		} else if (this._isSelectedPointLeft) {
			this._selectedItem.updateRadius(inputInfo.moveScenePhysicsX, inputInfo.moveScenePhysicsY)
		} else {
			this.moveSelectedItem(diffX, diffY)
		}
		this.updatePointsPosition()
		this.moveScenePhysicsX = inputInfo.moveScenePhysicsX
		this.moveScenePhysicsY = inputInfo.moveScenePhysicsY
	}

	public mouseUpMoveHandler(inputInfo: InputInfo): void {
		const allControlAssistPoints: Array<D2AssistPointShape> = [
			this._pointCenter,
			this._pointTop,
			this._pointRight,
			this._pointBottom,
			this._pointLeft,
		]
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
		this._pointCenter.setDelete()
		this._pointTop.setDelete()
		this._pointRight.setDelete()
		this._pointBottom.setDelete()
		this._pointLeft.setDelete()
		this._pointCenter = null!
		this._pointTop = null!
		this._pointRight = null!
		this._pointBottom = null!
		this._pointLeft = null!
		this._isSelectedPointCenter = false
		this._isSelectedPointTop = false
		this._isSelectedPointRight = false
		this._isSelectedPointBottom = false
		this._isSelectedPointLeft = false
	}

	public quit(): void {
		this._shapeItemCommand = undefined!
		this._selectedItem = undefined!
		super.quit()
	}

	private initPointsPosition(): void {
		const circleCenterPoint: Vector2 = this._selectedItem.centerPoint
		const circleRadius: number = this._selectedItem.radius
		this._pointCenter = buildD2AssistPointShape(new Vector2(circleCenterPoint.x, circleCenterPoint.y), this._selectedItem)
		this._pointTop = buildD2AssistPointShape(new Vector2(circleCenterPoint.x, circleCenterPoint.y + circleRadius), this._selectedItem)
		this._pointRight = buildD2AssistPointShape(new Vector2(circleCenterPoint.x + circleRadius, circleCenterPoint.y), this._selectedItem)
		this._pointBottom = buildD2AssistPointShape(new Vector2(circleCenterPoint.x, circleCenterPoint.y - circleRadius), this._selectedItem)
		this._pointLeft = buildD2AssistPointShape(new Vector2(circleCenterPoint.x - circleRadius, circleCenterPoint.y), this._selectedItem)
	}

	private updatePointsPosition(): void {
		const circleCenterPoint: Vector2 = this._selectedItem.centerPoint
		const circleRadius: number = this._selectedItem.radius
		this._pointCenter.centerPoint = new Vector2(circleCenterPoint.x, circleCenterPoint.y)
		this._pointTop.centerPoint = new Vector2(circleCenterPoint.x, circleCenterPoint.y + circleRadius)
		this._pointRight.centerPoint = new Vector2(circleCenterPoint.x + circleRadius, circleCenterPoint.y)
		this._pointBottom.centerPoint = new Vector2(circleCenterPoint.x, circleCenterPoint.y - circleRadius)
		this._pointLeft.centerPoint = new Vector2(circleCenterPoint.x - circleRadius, circleCenterPoint.y)
	}

	private moveSelectedItem(diffX: number, diffY: number): void {
		const moveMatrix4: Matrix4 = CanvasMatrix4.setTranslateByVector3(new Vector2(diffX, diffY).toVector3())
		this._selectedItem.transform(moveMatrix4)
	}
}
