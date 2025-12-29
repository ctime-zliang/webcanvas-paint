import { EFrameCommand } from '../config/CommandEnum'
import { EOperationAction } from '../config/OperationProfile'
import { TElementJSONBaseData } from '../engine/types/Primitive'
import { CommandProxy } from '../tool/history/command/primitive2d/CommandProxy'
import { ECommandAction } from '../tool/history/command/Config'
import { ElementCommand } from '../tool/history/command/ElementCommand'
import { BaseInterface } from './BaseInterface'
import { Constant } from '../Constant'
import { OutProfileMessage } from '../utils/OutMessage'

export class OperationController extends BaseInterface {
	constructor() {
		super()
	}

	public addHistroyRecord(elementItemId: string, action: ECommandAction, groupId: string = String(performance.now())): void {
		const commandItem: ElementCommand<TElementJSONBaseData> = CommandProxy.getCommandInstance(elementItemId, action, groupId)
		Constant.historyManager.add(commandItem)
	}

	public undo(): void {
		Constant.historyManager.undo()
		Constant.messageTool.messageBus.publish(EFrameCommand.CLEAR_ALL_SELECTS, null)
		Constant.messageTool.messageBus.publish(EFrameCommand.RENDER_FRAME, null)
		OutProfileMessage.dispatchOperationProfileChangeMessage(EOperationAction.HISTORY_UNDO, {})
	}

	public redo(): void {
		Constant.historyManager.redo()
		Constant.messageTool.messageBus.publish(EFrameCommand.CLEAR_ALL_SELECTS, null)
		Constant.messageTool.messageBus.publish(EFrameCommand.RENDER_FRAME, null)
		OutProfileMessage.dispatchOperationProfileChangeMessage(EOperationAction.HISTORY_REDO, {})
	}

	public hasHistoryUndoRecord(): boolean {
		return Constant.historyManager.hasUndo()
	}

	public hasHistoryRedoRecord(): boolean {
		return Constant.historyManager.hasRedo()
	}

	public resetCanvasContent(): Promise<void> {
		return Constant.canvasController.resetCanvasContent()
	}

	public quit(): void {}
}
