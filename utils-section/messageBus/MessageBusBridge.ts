import { MessageBus } from './MessageBus'
import { delReferenceSource, EMessageType, getReferenceSource, RPC_DEFAULT_TIMEOUT, RPC_TIMEOUT_TASKQUEUE, TInnerMessage, TMessageRemoteData, TRPC_TIMEOUT_DESCP } from './profiles'

export abstract class MessageBusBridge {
	private readonly _bus: MessageBus
	constructor(bus: MessageBus) {
		this._bus = bus
	}

	public asyncRequest(topic: string, data: any, target: any, timeout: number = RPC_DEFAULT_TIMEOUT): Promise<TMessageRemoteData> {
		const referenceTarget: any = getReferenceSource(target)
		return new Promise<TMessageRemoteData>((resolve, reject): void => {
			const target: TRPC_TIMEOUT_DESCP = {
				timeout: performance.now() + timeout,
				reject,
				topic,
			}
			RPC_TIMEOUT_TASKQUEUE.addItem(target)
			const reply: string = this._bus.createTopicUniqueTag(topic)
			this.publish(topic, { data, reply }, delReferenceSource(referenceTarget))
			this._bus.pull(reply, (data: any, bridge?: MessageBusBridge, source?: any): void => {
				resolve({ data, bridge, source: getReferenceSource(source) })
				target.reject = null!
			})
		})
	}

	protected processRemoteMessage(innerMessage: TInnerMessage, source: any): void {
		const referenceSource: any = getReferenceSource(source)
		const { topic, type, message } = innerMessage
		switch (type) {
			case EMessageType.PULL: {
				this._bus.pull(topic, (data: any): void => {
					this.push(topic, data, delReferenceSource(referenceSource))
				})
				break
			}
			case EMessageType.PUSH: {
				this._bus.push(topic, message, this, delReferenceSource(referenceSource))
				break
			}
			case EMessageType.SUBSCRIBE: {
				this._bus.subscribe(topic, (data: any): void => {
					this.publish(topic, data, delReferenceSource(referenceSource))
				})
				break
			}
			case EMessageType.PUBLISH: {
				this._bus.publish(topic, message, this, delReferenceSource(referenceSource))
				break
			}
		}
	}

	public abstract publish(topic: string, data: any, target: any): void
	public abstract subscribe(topic: string, target: any): void
	public abstract push(topic: string, data: any, target: any): void
	public abstract pull(topic: string, target: any): void
}
