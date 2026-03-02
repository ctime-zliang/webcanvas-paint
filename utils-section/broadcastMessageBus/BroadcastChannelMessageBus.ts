import { AbstractBroadcastMessageBus } from './AbstractBroadcastMessageBus'
import { BroadcastBaseMessage, EBroadcastMessageType } from './profiles'
import { getShortUuid } from './uuid'

export class BroadcastChannelMessageBus extends AbstractBroadcastMessageBus {
	private static broadcastStorage: Map<string, BroadcastChannel> = new Map()
	private static instanceChannel(channel: string): BroadcastChannel {
		let broadcastChannel: BroadcastChannel = BroadcastChannelMessageBus.broadcastStorage.get(channel)!
		if (!broadcastChannel) {
			broadcastChannel = new BroadcastChannel(channel)
			BroadcastChannelMessageBus.broadcastStorage.set(channel, broadcastChannel)
		}
		return broadcastChannel
	}

	private readonly broadcastChannel: BroadcastChannel
	constructor(channel: string, uuid: string = getShortUuid()) {
		super(uuid)
		this.broadcastChannel = BroadcastChannelMessageBus.instanceChannel(channel)
		this.broadcastChannel.onmessage = (e: MessageEvent): void => {
			this.handleMessage(e.data)
		}
	}

	protected broadcastPublish(topic: string, data: any): void {
		this.postMessage({ type: EBroadcastMessageType.PUBLISH, uuid: this.uuid, topic, data }, '')
	}

	protected broadcastWhoHas(topic: string): void {
		this.postMessage({ type: EBroadcastMessageType.WHO_HAS, uuid: this.uuid, topic }, '')
	}

	protected broadcastIHave(topic: string, id: number): void {
		this.postMessage({ type: EBroadcastMessageType.I_HAVE, uuid: this.uuid, topic, id }, '')
	}

	protected broadcastINeed(topic: string, source: string, id: number): void {
		this.postMessage({ type: EBroadcastMessageType.I_NEED, uuid: this.uuid, topic, source, id }, source)
	}

	protected broadcastIGive(topic: string, id: number, target: string, data: any): void {
		this.postMessage({ type: EBroadcastMessageType.I_GIVE, uuid: this.uuid, topic, id, target, data }, target)
	}
	private handleMessage(params: any): void {
		const { type, uuid, topic } = params as BroadcastBaseMessage
		switch (type) {
			case EBroadcastMessageType.I_GIVE: {
				const { target, id, data } = params
				this.onReceivedIGive(uuid, topic, id, target, data)
				break
			}
			case EBroadcastMessageType.I_HAVE: {
				const { id } = params
				this.onReceivedIHave(uuid, topic, id)
				break
			}
			case EBroadcastMessageType.I_NEED: {
				const { source, id } = params
				this.onReceivedINeed(uuid, topic, source, id)
				break
			}
			case EBroadcastMessageType.PUBLISH: {
				const { data } = params
				this.onReceivedPublish(uuid, topic, data)
				break
			}
			case EBroadcastMessageType.WHO_HAS: {
				this.onReceivedWhoHas(uuid, topic)
				break
			}
			default: {
				console.warn(`unsupported message-type: ${type}`)
			}
		}
	}

	private postMessage<T extends BroadcastBaseMessage>(message: T, target: string): void {
		if (!target) {
			if (target !== this.uuid) {
				this.broadcastChannel.postMessage(message)
			} else {
				Promise.resolve().then((): void => {
					this.handleMessage(message)
				})
			}
		}
	}
}
