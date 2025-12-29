import { DIRECTION_KEY_MOVE_STEP } from '../../../config/Config'
import { EDIRECTION_KEY } from '../../../config/NativeProfile'
import { EOperationAction } from '../../../config/OperationProfile'
import { Matrix4 } from '../../../engine/algorithm/geometry/matrix/Matrix4'
import { TAllElementShapeType } from '../../../types/Element'
import { CommandProxy } from '../../history/command/primitive2d/CommandProxy'
import { ECommandAction } from '../../history/command/Config'
import { InputInfo } from '../../InputInfo'
import { CanvasMatrix4 } from '../../../engine/algorithm/geometry/matrix/CanvasMatrix4'
import { Vector3 } from '../../../engine/algorithm/geometry/vector/Vector3'
import { D2SelectionTool } from './D2SelectionTool'
import { D2TextShapeCommand } from '../../history/command/primitive2d/D2TextShapeCommand'
import { D2TextShape } from '../../../objects/shapes/primitive2d/D2TextShape'
import { Constant } from '../../../Constant'
import { OutProfileMessage } from '../../../utils/OutMessage'

export class D2TextShapeSelectionTool extends D2SelectionTool {
	private _shapeItemCommand: D2TextShapeCommand
	private _selectedItem: D2TextShape
	constructor(selectedItem: D2TextShape) {
		super()
		this._shapeItemCommand = null!
		this._selectedItem = selectedItem
	}

	public mouseLeftDownSelect(inputInfo: InputInfo): TAllElementShapeType {
		return null!
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
			) as D2TextShapeCommand
		}
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
		this.moveSelectedItem(diffX, diffY)
		this.moveScenePhysicsX = inputInfo.moveScenePhysicsX
		this.moveScenePhysicsY = inputInfo.moveScenePhysicsY
	}

	public mouseUpMoveHandler(inputInfo: InputInfo): void {
		Constant.environment.updateCanvasMouseCursor('default')
	}

	public clear(): void {
		this._selectedItem = null!
	}

	public quit(): void {
		this._shapeItemCommand = undefined!
		this._selectedItem = undefined!
		super.quit()
	}

	private moveSelectedItem(diffX: number, diffY: number): void {
		const moveMatrix4: Matrix4 = CanvasMatrix4.setTranslate(new Vector3(diffX, diffY, 0))
		this._selectedItem.transform(moveMatrix4)
	}
}
