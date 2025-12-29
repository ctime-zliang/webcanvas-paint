import { MessageBus } from './MessageBus'
import { MessageBusBridge } from './MessageBusBridge'
import { EMessageType } from './profiles'

export class WindowMessageBridge extends MessageBusBridge {
	private _processRemoteMessageScopeHandler: (e: MessageEvent) => void
	constructor(bus: MessageBus) {
		super(bus)
		this._processRemoteMessageScopeHandler = this.processRemoteMessageHandler.bind(this)
		window.addEventListener('message', this._processRemoteMessageScopeHandler, false)
	}

	public publish(topic: string, message: any, target: Window): void {
		this.postMessage(topic, EMessageType.PUBLISH, message, target)
	}

	public subscribe(topic: string, target: Window): void {
		if (target === window) {
			throw new Error(`regist remote subscribe from current window is not supported.`)
		}
		this.postMessage(topic, EMessageType.SUBSCRIBE, undefined, target)
	}

	public push(topic: string, message: any, target: Window): void {
		this.postMessage(topic, EMessageType.PUSH, message, target)
	}

	public pull(topic: string, target: Window): void {
		if (target === window) {
			throw new Error(`regist remote pull from current window is not supported.`)
		}
		this.postMessage(topic, EMessageType.PULL, undefined, target)
	}

	public quit(): void {
		window.removeEventListener('message', this._processRemoteMessageScopeHandler)
	}

	private postMessage(topic: string, type: EMessageType, message: any, target: Window): void {
		target.postMessage(
			{
				topic,
				type,
				message,
			},
			'*'
		)
	}

	private processRemoteMessageHandler(e: MessageEvent): void {
		this.processRemoteMessage(e.data, e.source)
	}
}
