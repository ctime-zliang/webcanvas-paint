import { MessageBus, WindowMessageBridge } from '../../../../utils-section/messageBus'

class MessageTool {
	private readonly _messageBus: MessageBus
	private readonly _windowMessageBridge: WindowMessageBridge
	constructor() {
		this._messageBus = new MessageBus(false)
		this._windowMessageBridge = new WindowMessageBridge(this._messageBus)
	}

	public get messageBus(): MessageBus {
		return this._messageBus
	}

	public get windowMessageBridge(): WindowMessageBridge {
		return this._windowMessageBridge
	}
}

export const messageTool: MessageTool = new MessageTool()
