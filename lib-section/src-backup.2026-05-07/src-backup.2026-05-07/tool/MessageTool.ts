import { MessageBus, WindowMessageBridge } from '../../../utils-section/messageBus'
import { BaseInterface } from '../controller/BaseInterface'

export class MessageTool extends BaseInterface {
	private _messageBus: MessageBus
	private _windowMessageBridge: WindowMessageBridge
	constructor() {
		super()
		this._messageBus = new MessageBus(false)
		this._windowMessageBridge = new WindowMessageBridge(this._messageBus)
	}

	public get messageBus(): MessageBus {
		return this._messageBus
	}

	public get windowMessageBridge(): WindowMessageBridge {
		return this._windowMessageBridge
	}

	public quit(): void {
		this._messageBus.clearAll()
		this._messageBus = undefined!
		this._windowMessageBridge.quit()
		this._windowMessageBridge = undefined!
	}
}
