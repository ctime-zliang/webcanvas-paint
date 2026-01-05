import { DIRECTION_KEY_MOVE_STEP } from '../../../config/Config'
import { EDIRECTION_KEY } from '../../../config/NativeProfile'
import { EOperationAction } from '../../../config/OperationProfile'
import { CanvasMatrix4 } from '../../../engine/algorithm/geometry/matrix/CanvasMatrix4'
import { Matrix4 } from '../../../engine/algorithm/geometry/matrix/Matrix4'
import { TElementJSONBaseData } from '../../../engine/types/Primitive'
import { ElementShapeItemBase } from '../../../objects/shapes/primitive2d/elementBase/ElementShapeItemBase'
import { TAllElementShapeType } from '../../../types/Element'
import { CommandProxy } from '../../history/command/primitive2d/CommandProxy'
import { ECommandAction } from '../../history/command/Config'
import { ElementCommand } from '../../history/command/ElementCommand'
import { InputInfo } from '../../InputInfo'
import { BaseSelectionTool } from '../BaseSelectionTool'
import { Constant } from '../../../Constant'
import { OutProfileMessage } from '../../../utils/OutMessage'
import { Vector2 } from '../../../engine/algorithm/geometry/vector/Vector2'

export class MoveOperSelectionTool extends BaseSelectionTool {
	private _shapeItemCommands: Map<string, ElementCommand<TElementJSONBaseData>>
	constructor() {
		super()
		this._shapeItemCommands = new Map()
	}

	public mouseLeftDownSelect(inputInfo: InputInfo): TAllElementShapeType {
		return null!
	}

	public keyDownHandler(inputInfo: InputInfo): void {
		switch (inputInfo.keyCode) {
			case EDIRECTION_KEY.LEFT: {
				this.moveSelectedItems(-DIRECTION_KEY_MOVE_STEP, 0)
				break
			}
			case EDIRECTION_KEY.UP: {
				this.moveSelectedItems(0, DIRECTION_KEY_MOVE_STEP)
				break
			}
			case EDIRECTION_KEY.RIGHT: {
				this.moveSelectedItems(DIRECTION_KEY_MOVE_STEP, 0)
				break
			}
			case EDIRECTION_KEY.DOWN: {
				this.moveSelectedItems(0, -DIRECTION_KEY_MOVE_STEP)
				break
			}
			default:
		}
	}

	public keyUpHandler(inputInfo: InputInfo): void {}

	public mouseLeftDownHandler(inputInfo: InputInfo): void {
		this.moveScenePhysicsX = inputInfo.leftDownScenePhysicsX
		this.moveScenePhysicsY = inputInfo.leftDownScenePhysicsY
		const allSelectItems: Array<ElementShapeItemBase> = Constant.selectManager.getAllSelectItems()
		if (allSelectItems.length) {
			for (let i: number = 0; i < allSelectItems.length; i++) {
				const shapeItemCommand: ElementCommand<TElementJSONBaseData> = CommandProxy.getCommandInstance(
					allSelectItems[i].elementItemId,
					ECommandAction.MODIFY,
					Constant.globalIdenManager.getCommandIden()
				)
				this._shapeItemCommands.set(allSelectItems[i].elementItemId, shapeItemCommand)
			}
		}
	}

	public mouseLeftUpHandler(inputInfo: InputInfo): void {
		const allSelectItems: Array<ElementShapeItemBase> = Constant.selectManager.getAllSelectItems()
		let hasModified: boolean = false
		for (let i: number = 0; i < allSelectItems.length; i++) {
			const item: ElementShapeItemBase = allSelectItems[i]
			hasModified = true
			item.model.updateBBox2()
		}
		if (hasModified) {
			for (let commandItem of this._shapeItemCommands) {
				Constant.historyManager.add(commandItem[1])
			}
		}
		this._shapeItemCommands.clear()
		OutProfileMessage.dispatchOperationProfileChangeMessage(EOperationAction.MODIFY_ELEMENT, {})
	}

	public mouseMoveHandler(inputInfo: InputInfo): void {
		const diffX: number = inputInfo.moveScenePhysicsX - this.moveScenePhysicsX
		const diffY: number = inputInfo.moveScenePhysicsY - this.moveScenePhysicsY
		this.moveSelectedItems(diffX, diffY)
		this.moveScenePhysicsX = inputInfo.moveScenePhysicsX
		this.moveScenePhysicsY = inputInfo.moveScenePhysicsY
	}

	public mouseUpMoveHandler(inputInfo: InputInfo): void {}

	public clear(): void {}

	public quit(): void {
		this._shapeItemCommands.clear()
		this._shapeItemCommands = undefined!
		super.quit()
	}

	private moveSelectedItems(diffX: number, diffY: number): void {
		const allSelectItems: Array<ElementShapeItemBase> = Constant.selectManager.getAllSelectItems()
		const moveMatrix4: Matrix4 = CanvasMatrix4.setTranslateByVector3(new Vector2(diffX, diffY).toVector3())
		for (let i: number = 0; i < allSelectItems.length; i++) {
			const item: ElementShapeItemBase = allSelectItems[i]
			item.transform(moveMatrix4)
		}
	}
}
