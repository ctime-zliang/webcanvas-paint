import { MessageBus } from './MessageBus'
import { MessageBusBridge } from './MessageBusBridge'
import { EMessageType, TMessageRemoteData } from './profiles'

export class WorkerMessageBridge extends MessageBusBridge {
	private readonly _worker: any
	constructor(bus: MessageBus, worker: any) {
		super(bus)
		this._worker = worker
		this._worker.onmessage = (e: MessageEvent): void => {
			this.processRemoteMessage(e.data, undefined!)
		}
	}

	public publish(topic: string, message: any): void {
		this.postMessage(topic, EMessageType.PUBLISH, message)
	}

	public subscribe(topic: string): void {
		this.postMessage(topic, EMessageType.SUBSCRIBE, undefined)
	}

	public push(topic: string, message: any): void {
		this.postMessage(topic, EMessageType.PUSH, message)
	}

	public pull(topic: string): void {
		this.postMessage(topic, EMessageType.PULL, undefined)
	}

	public asyncRequest(topic: string, data: any, timeout?: number): Promise<TMessageRemoteData> {
		return super.asyncRequest(topic, data, undefined!, timeout)
	}

	public discard(): void {
		this._worker.terminate()
	}

	private postMessage(topic: string, type: EMessageType, message: any): void {
		this._worker.postMessage(
			{
				topic,
				type,
				message,
			},
			'*'
		)
	}
}
