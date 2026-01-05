import { DIRECTION_KEY_MOVE_STEP } from '../../../config/Config'
import { EDIRECTION_KEY } from '../../../config/NativeProfile'
import { EOperationAction } from '../../../config/OperationProfile'
import { Matrix4 } from '../../../engine/algorithm/geometry/matrix/Matrix4'
import { TAllElementShapeType } from '../../../types/Element'
import { CommandProxy } from '../../history/command/primitive2d/CommandProxy'
import { ECommandAction } from '../../history/command/Config'
import { InputInfo } from '../../InputInfo'
import { CanvasMatrix4 } from '../../../engine/algorithm/geometry/matrix/CanvasMatrix4'
import { D2SelectionTool } from './D2SelectionTool'
import { D2ImageShape } from '../../../objects/shapes/primitive2d/D2ImageShape'
import { D2ImageShapeCommand } from '../../history/command/primitive2d/D2ImageShapeCommand'
import { buildD2AssistPointShape, D2AssistPointShape } from '../../../objects/assist/primitive2d/D2AssistPointShape'
import { ED2PointShape } from '../../../engine/config/PrimitiveProfile'
import { Vector2 } from '../../../engine/algorithm/geometry/vector/Vector2'
import { Constant } from '../../../Constant'
import { OutProfileMessage } from '../../../utils/OutMessage'

export class D2ImageShapeSelectionTool extends D2SelectionTool {
	private _shapeItemCommand: D2ImageShapeCommand
	private _selectedItem: D2ImageShape
	private _pointLeftUp: D2AssistPointShape
	private _pointUp: D2AssistPointShape
	private _pointRightUp: D2AssistPointShape
	private _pointRight: D2AssistPointShape
	private _pointRightBottom: D2AssistPointShape
	private _pointBottom: D2AssistPointShape
	private _pointLeftBottom: D2AssistPointShape
	private _pointLeft: D2AssistPointShape
	private _isSelectedPointLeftUp: boolean
	private _isSelectedPointUp: boolean
	private _isSelectedPointRightUp: boolean
	private _isSelectedPointRight: boolean
	private _isSelectedPointRightBottom: boolean
	private _isSelectedPointBottom: boolean
	private _isSelectedPointLeftBottom: boolean
	private _isSelectedPointLeft: boolean
	constructor(selectedItem: D2ImageShape) {
		super()
		this._shapeItemCommand = null!
		this._selectedItem = selectedItem
		this._pointLeftUp = null!
		this._pointUp = null!
		this._pointRightUp = null!
		this._pointRight = null!
		this._pointRightBottom = null!
		this._pointBottom = null!
		this._pointLeftBottom = null!
		this._pointLeft = null!
		this._isSelectedPointLeftUp = false
		this._isSelectedPointUp = false
		this._isSelectedPointRightUp = false
		this._isSelectedPointRight = false
		this._isSelectedPointRightBottom = false
		this._isSelectedPointBottom = false
		this._isSelectedPointLeftBottom = false
		this._isSelectedPointLeft = false
		this.initAssistShapes()
	}

	public mouseLeftDownSelect(inputInfo: InputInfo): TAllElementShapeType {
		const allControlAssistPoints: Array<D2AssistPointShape> = [
			this._pointLeftUp,
			this._pointUp,
			this._pointRightUp,
			this._pointRight,
			this._pointRightBottom,
			this._pointBottom,
			this._pointLeftBottom,
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
			) as D2ImageShapeCommand
		}
		this._isSelectedPointLeftUp = this._pointLeftUp.isSelect(inputInfo.leftDownScenePhysicsX, inputInfo.leftDownScenePhysicsY)
		this._isSelectedPointUp = this._pointUp.isSelect(inputInfo.leftDownScenePhysicsX, inputInfo.leftDownScenePhysicsY)
		this._isSelectedPointRightUp = this._pointRightUp.isSelect(inputInfo.leftDownScenePhysicsX, inputInfo.leftDownScenePhysicsY)
		this._isSelectedPointRight = this._pointRight.isSelect(inputInfo.leftDownScenePhysicsX, inputInfo.leftDownScenePhysicsY)
		this._isSelectedPointRightBottom = this._pointRightBottom.isSelect(inputInfo.leftDownScenePhysicsX, inputInfo.leftDownScenePhysicsY)
		this._isSelectedPointBottom = this._pointBottom.isSelect(inputInfo.leftDownScenePhysicsX, inputInfo.leftDownScenePhysicsY)
		this._isSelectedPointLeftBottom = this._pointLeftBottom.isSelect(inputInfo.leftDownScenePhysicsX, inputInfo.leftDownScenePhysicsY)
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
		const isFlipX: boolean = this._selectedItem.isFlipX
		const isFlipY: boolean = this._selectedItem.isFlipY
		const rotation: number = this._selectedItem.rotation
		const diffX: number = inputInfo.moveScenePhysicsX - this.moveScenePhysicsX
		const diffY: number = inputInfo.moveScenePhysicsY - this.moveScenePhysicsY
		this._selectedItem.isFlipX = false
		this._selectedItem.isFlipY = false
		this._selectedItem.rotation = 0
		if (this._isSelectedPointLeftUp) {
			const matrix4: Matrix4 = CanvasMatrix4.setTranslateByVector3(new Vector2(diffX, diffY).toVector3())
			this._selectedItem.position = this._selectedItem.position.add(new Vector2(diffX, diffY))
			this._selectedItem.width -= diffX
			this._selectedItem.height += diffY
		} else if (this._isSelectedPointUp) {
			const matrix4: Matrix4 = CanvasMatrix4.setTranslateByVector3(new Vector2(0, diffY).toVector3())
			this._selectedItem.position = this._selectedItem.position.add(new Vector2(0, diffY))
			this._selectedItem.height += diffY
		} else if (this._isSelectedPointRightUp) {
			const matrix4: Matrix4 = CanvasMatrix4.setTranslateByVector3(new Vector2(0, diffY).toVector3())
			this._selectedItem.position = this._selectedItem.position.add(new Vector2(0, diffY))
			this._selectedItem.width += diffX
			this._selectedItem.height += diffY
		} else if (this._isSelectedPointRight) {
			this._selectedItem.width += diffX
		} else if (this._isSelectedPointRightBottom) {
			this._selectedItem.width += diffX
			this._selectedItem.height -= diffY
		} else if (this._isSelectedPointBottom) {
			this._selectedItem.height -= diffY
		} else if (this._isSelectedPointLeftBottom) {
			const matrix4: Matrix4 = CanvasMatrix4.setTranslateByVector3(new Vector2(diffX, 0).toVector3())
			this._selectedItem.position = this._selectedItem.position.add(new Vector2(diffX, 0))
			this._selectedItem.height -= diffY
			this._selectedItem.width -= diffX
		} else if (this._isSelectedPointLeft) {
			const matrix4: Matrix4 = CanvasMatrix4.setTranslateByVector3(new Vector2(diffX, 0).toVector3())
			this._selectedItem.position = this._selectedItem.position.add(new Vector2(diffX, 0))
			this._selectedItem.width -= diffX
		} else {
			this.moveSelectedItem(diffX, diffY)
		}
		this.updateAssistShapes()
		this._selectedItem.isFlipX = isFlipX
		this._selectedItem.isFlipY = isFlipY
		this._selectedItem.rotation = rotation
		this._selectedItem.updateBBox2()
		this.moveScenePhysicsX = inputInfo.moveScenePhysicsX
		this.moveScenePhysicsY = inputInfo.moveScenePhysicsY
	}

	public mouseUpMoveHandler(inputInfo: InputInfo): void {
		Constant.environment.updateCanvasMouseCursor('default')
		if (this.isSelectAssistPoint(this._pointLeftUp, inputInfo.moveScenePhysicsX, inputInfo.moveScenePhysicsY)) {
			Constant.environment.updateCanvasMouseCursor('nwse-resize')
		} else if (this.isSelectAssistPoint(this._pointUp, inputInfo.moveScenePhysicsX, inputInfo.moveScenePhysicsY)) {
			Constant.environment.updateCanvasMouseCursor('ns-resize')
		} else if (this.isSelectAssistPoint(this._pointRightUp, inputInfo.moveScenePhysicsX, inputInfo.moveScenePhysicsY)) {
			Constant.environment.updateCanvasMouseCursor('nesw-resize')
		} else if (this.isSelectAssistPoint(this._pointRight, inputInfo.moveScenePhysicsX, inputInfo.moveScenePhysicsY)) {
			Constant.environment.updateCanvasMouseCursor('ew-resize')
		} else if (this.isSelectAssistPoint(this._pointRightBottom, inputInfo.moveScenePhysicsX, inputInfo.moveScenePhysicsY)) {
			Constant.environment.updateCanvasMouseCursor('nwse-resize')
		} else if (this.isSelectAssistPoint(this._pointBottom, inputInfo.moveScenePhysicsX, inputInfo.moveScenePhysicsY)) {
			Constant.environment.updateCanvasMouseCursor('ns-resize')
		} else if (this.isSelectAssistPoint(this._pointLeftBottom, inputInfo.moveScenePhysicsX, inputInfo.moveScenePhysicsY)) {
			Constant.environment.updateCanvasMouseCursor('nesw-resize')
		} else if (this.isSelectAssistPoint(this._pointLeft, inputInfo.moveScenePhysicsX, inputInfo.moveScenePhysicsY)) {
			Constant.environment.updateCanvasMouseCursor('ew-resize')
		}
	}

	public clear(): void {
		this._selectedItem = null!
		this._pointLeftUp.setDelete()
		this._pointUp.setDelete()
		this._pointRightUp.setDelete()
		this._pointRight.setDelete()
		this._pointRightBottom.setDelete()
		this._pointBottom.setDelete()
		this._pointLeftBottom.setDelete()
		this._pointLeft.setDelete()
		this._pointLeftUp = null!
		this._pointUp = null!
		this._pointRightUp = null!
		this._pointRight = null!
		this._pointRightBottom = null!
		this._pointBottom = null!
		this._pointLeftBottom = null!
		this._pointLeft = null!
	}

	public quit(): void {
		this._shapeItemCommand = undefined!
		this._selectedItem = undefined!
		super.quit()
	}

	private initAssistShapes(): void {
		const isFlipX: boolean = this._selectedItem.isFlipX
		const isFlipY: boolean = this._selectedItem.isFlipY
		const rotation: number = this._selectedItem.rotation
		this._selectedItem.isFlipX = false
		this._selectedItem.isFlipY = false
		this._selectedItem.rotation = 0
		this._pointLeftUp = buildD2AssistPointShape(this._selectedItem.leftUp, this._selectedItem)
		this._pointUp = buildD2AssistPointShape(
			this._selectedItem.leftUp.add(this._selectedItem.rightUp).mul(0.5),
			this._selectedItem,
			ED2PointShape.TRIANGLE,
			1.6
		)
		this._pointRightUp = buildD2AssistPointShape(this._selectedItem.rightUp, this._selectedItem)
		this._pointRight = buildD2AssistPointShape(
			this._selectedItem.rightUp.add(this._selectedItem.rightDown).mul(0.5),
			this._selectedItem,
			ED2PointShape.TRIANGLE,
			1.6
		)
		this._pointRightBottom = buildD2AssistPointShape(this._selectedItem.rightDown, this._selectedItem)
		this._pointBottom = buildD2AssistPointShape(
			this._selectedItem.leftDown.add(this._selectedItem.rightDown).mul(0.5),
			this._selectedItem,
			ED2PointShape.TRIANGLE,
			1.6
		)
		this._pointLeftBottom = buildD2AssistPointShape(this._selectedItem.leftDown, this._selectedItem)
		this._pointLeft = buildD2AssistPointShape(
			this._selectedItem.leftUp.add(this._selectedItem.leftDown).mul(0.5),
			this._selectedItem,
			ED2PointShape.TRIANGLE,
			1.6
		)
		this._selectedItem.isFlipX = isFlipX
		this._selectedItem.isFlipY = isFlipY
		this._selectedItem.rotation = rotation
	}

	private updateAssistShapes(): void {
		this._pointLeftUp.centerPoint = this._selectedItem.leftUp.copy()
		this._pointUp.centerPoint = this._selectedItem.leftUp.add(this._selectedItem.rightUp).mul(0.5)
		this._pointRightUp.centerPoint = this._selectedItem.rightUp.copy()
		this._pointRight.centerPoint = this._selectedItem.rightUp.add(this._selectedItem.rightDown).mul(0.5)
		this._pointRightBottom.centerPoint = this._selectedItem.rightDown.copy()
		this._pointBottom.centerPoint = this._selectedItem.leftDown.add(this._selectedItem.rightDown).mul(0.5)
		this._pointLeftBottom.centerPoint = this._selectedItem.leftDown.copy()
		this._pointLeft.centerPoint = this._selectedItem.leftUp.add(this._selectedItem.leftDown).mul(0.5)
	}

	private moveSelectedItem(diffX: number, diffY: number): void {
		const moveMatrix4: Matrix4 = CanvasMatrix4.setTranslateByVector3(new Vector2(diffX, diffY).toVector3())
		this._selectedItem.transform(moveMatrix4)
	}
}
