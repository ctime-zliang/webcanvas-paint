import { EDrawD2ToolCommand, EFrameCommand } from '../../../../config/CommandEnum'
import { EOperationAction } from '../../../../config/OperationProfile'
import { Constant } from '../../../../Constant'
import { D2LineShape } from '../../../../objects/shapes/primitive2d/D2LineShape'
import { OutProfileMessage } from '../../../../utils/OutMessage'
import { ECommandAction } from '../../../history/command/Config'
import { InputInfo } from '../../../InputInfo'
import { Tool } from '../../../Tool'
import { DrawD2ShapeTool } from '../DrawD2ShapeTool'
import { DrawD2LineShape } from './DrawD2LineShape'

export class DrawD2LineShapeTool extends DrawD2ShapeTool {
	private _drawShapeHandler: DrawD2LineShape
	constructor() {
		super({})
		this._drawShapeHandler = new DrawD2LineShape()
	}

	public keyDownHandler(inputInfo: InputInfo): void {
		this._drawShapeHandler.inputInfo = inputInfo
		const handlerAction = (nextTool: Tool<InputInfo>): void => {
			nextTool.keyDownHandler(inputInfo)
		}
		this.handler(handlerAction)
	}

	public keyUpHandler(inputInfo: InputInfo): void {
		this._drawShapeHandler.inputInfo = inputInfo
		const handlerAction = (nextTool: Tool<InputInfo>): void => {
			nextTool.keyUpHandler(inputInfo)
		}
		this.handler(handlerAction)
	}

	public mouseLeftDownHandler(inputInfo: InputInfo): void {
		this._drawShapeHandler.inputInfo = inputInfo
		const handlerAction = (nextTool: Tool<InputInfo>): void => {
			nextTool.mouseLeftDownHandler(inputInfo)
		}
		this.handler(handlerAction)
	}

	public mouseMiddleDownHandler(inputInfo: InputInfo): void {
		this._drawShapeHandler.inputInfo = inputInfo
		const handlerAction = (nextTool: Tool<InputInfo>): void => {
			nextTool.mouseMiddleDownHandler(inputInfo)
		}
		this.handler(handlerAction)
	}

	public mouseRightDownHandler(inputInfo: InputInfo): void {
		this._drawShapeHandler.inputInfo = inputInfo
		const handlerAction = (nextTool: Tool<InputInfo>): void => {
			nextTool.mouseRightDownHandler(inputInfo)
		}
		this.handler(handlerAction)
	}

	public mouseMoveHandler(inputInfo: InputInfo): void {
		this._drawShapeHandler.inputInfo = inputInfo
		if (this.d2CrossAssist) {
			this.d2CrossAssist.update(inputInfo)
		}
		if (inputInfo.rightMouseDown) {
			this.hasMoveWhenAfterRightDown = true
		}
		if (this.isDrawing) {
			this._drawShapeHandler.updateShapes(inputInfo)
		}
		this.lastMoveRealScenePhysicsX = inputInfo.moveRealScenePhysicsX
		this.lastMoveRealScenePhysicsY = inputInfo.moveRealScenePhysicsY
		const handlerAction = (nextTool: Tool<InputInfo>): void => {
			nextTool.mouseMoveHandler(inputInfo)
		}
		this.handler(handlerAction)
	}

	public mouseLeftUpHandler(inputInfo: InputInfo): void {
		this._drawShapeHandler.inputInfo = inputInfo
		if (!this.isDrawing) {
			this.isDrawing = true
			this._drawShapeHandler.createShapes(inputInfo.moveScenePhysicsX, inputInfo.moveScenePhysicsY)
		} else {
			this.isDrawing = false
			const items: Array<D2LineShape> = this._drawShapeHandler.completeDraw()
			for (let i: number = 0; i < items.length; i++) {
				Constant.operationController.addHistroyRecord(items[i].elementItemId, ECommandAction.ADD)
			}
			OutProfileMessage.dispatchOperationProfileChangeMessage(EOperationAction.CREATE_ELEMENT, {})
		}
		const handlerAction = (nextTool: Tool<InputInfo>): void => {
			nextTool.mouseLeftUpHandler(inputInfo)
		}
		this.handler(handlerAction)
	}

	public mouseMiddleUpHandler(inputInfo: InputInfo): void {
		this._drawShapeHandler.inputInfo = inputInfo
		const handlerAction = (nextTool: Tool<InputInfo>): void => {
			nextTool.mouseMiddleUpHandler(inputInfo)
		}
		this.handler(handlerAction)
	}

	public mouseRightUpHandler(inputInfo: InputInfo): void {
		this._drawShapeHandler.inputInfo = inputInfo
		if (!this.hasMoveWhenAfterRightDown) {
			this.isDrawing = false
			this._drawShapeHandler.cancelDraw()
			Constant.messageTool.messageBus.publish(EFrameCommand.SWITCH_DRAW_TOOL, { type: EDrawD2ToolCommand.BLANK_DROP })
		}
		this.hasMoveWhenAfterRightDown = false
		const handlerAction = (nextTool: Tool<InputInfo>): void => {
			nextTool.mouseRightUpHandler(inputInfo)
		}
		this.handler(handlerAction)
	}

	public mouseWheelHandler(inputInfo: InputInfo): void {
		this._drawShapeHandler.inputInfo = inputInfo
		if (this.d2CrossAssist) {
			this.d2CrossAssist.update(inputInfo)
		}
		const handlerAction = (nextTool: Tool<InputInfo>): void => {
			nextTool.mouseWheelHandler(inputInfo)
		}
		this.handler(handlerAction)
	}

	public mouseLeaveHandler(inputInfo: InputInfo): void {
		this._drawShapeHandler.inputInfo = inputInfo
		const handlerAction = (nextTool: Tool<InputInfo>): void => {
			nextTool.mouseLeaveHandler(inputInfo)
		}
		this.handler(handlerAction)
	}

	public mouseEnterHandler(inputInfo: InputInfo): void {
		this._drawShapeHandler.inputInfo = inputInfo
		const handlerAction = (nextTool: Tool<InputInfo>): void => {
			nextTool.mouseEnterHandler(inputInfo)
		}
		this.handler(handlerAction)
	}

	public quit(): void {
		this.destoryAuxiliaryTools()
		this._drawShapeHandler.quit()
		this._drawShapeHandler = undefined!
	}
}
