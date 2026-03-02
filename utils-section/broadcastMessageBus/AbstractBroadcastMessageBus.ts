import { getOrInitArr, remove2 } from '../utils/Utils'
import { AbstractMessageBus } from './AbstractMessageBus'
import { MessagebusExecutor } from './MessagebusExecutor'
import { MessageCallback } from './profiles'
import { getShortUuid } from './uuid'

export abstract class AbstractBroadcastMessageBus extends AbstractMessageBus {
	private readonly _subscribed: { [topic: string]: Array<MessagebusExecutor> }
	private readonly _pulled: { [topic: string]: Array<MessagebusExecutor> }
	private readonly _pushed: { [topic: string]: Array<{ id: number; message: any }> }
	private _pushCount: number
	constructor(uuid: string = getShortUuid()) {
		super(uuid)
		this._subscribed = {}
		this._pushed = {}
		this._pulled = {}
		this._pushCount = 0
	}

	public publish(topic: string, message?: any): void {
		this.broadcastPublish(topic, message)
	}

	public subscribe(topic: string, callback: MessageCallback): MessagebusExecutor {
		const taskItem: MessagebusExecutor = new MessagebusExecutor(callback, true)
		getOrInitArr(this._subscribed, topic).push(taskItem)
		return taskItem
	}

	public push(topic: string, message: any): void {
		const id: number = this._pushCount++
		getOrInitArr(this._pushed, topic).push({ id, message })
		this.broadcastPushedHeadMessage(topic)
	}

	public pull(topic: string, callback: MessageCallback): MessagebusExecutor {
		const taskItem: MessagebusExecutor = new MessagebusExecutor(callback, true)
		getOrInitArr(this._pulled, topic).push(taskItem)
		return taskItem
	}

	private broadcastPushedHeadMessage(topic: string): void {
		const queue: Array<{
			id: number
			message: any
		}> = this._pushed[topic]
		if (queue && queue[0]) {
			this.broadcastIHave(topic, queue[0].id)
		}
	}

	protected onReceivedPublish(uuid: string, topic: string, data: any): void {
		const tasks: Array<MessagebusExecutor> = this._subscribed[topic]
		if (!tasks) {
			return
		}
		let deletions: Array<MessagebusExecutor> = []
		for (let taskItem of tasks) {
			if (taskItem.getRunnigStatus()) {
				taskItem.execute(data)
			} else {
				deletions.push(taskItem)
			}
		}
		for (let taskItem of deletions) {
			remove2(deletions, taskItem)
		}
		if (tasks.length <= 0) {
			delete this._subscribed[topic]
		}
	}

	protected onReceivedWhoHas(uuid: string, topic: string): void {
		this.broadcastPushedHeadMessage(topic)
	}

	protected onReceivedIHave(uuid: string, topic: string, id: number): void {
		const tasks: Array<MessagebusExecutor> = this._pulled[topic]
		if (!tasks) {
			return
		}
		let deletions: Array<MessagebusExecutor> = []
		for (let taskItem of tasks) {
			if (taskItem.getRunnigStatus()) {
				this.broadcastINeed(topic, uuid, id)
				break
			} else {
				deletions.push(taskItem)
			}
		}
		for (let taskItem of deletions) {
			remove2(deletions, taskItem)
		}
		if (tasks.length <= 0) {
			delete this._pulled[topic]
		}
	}

	protected onReceivedINeed(uuid: string, topic: string, source: string, id: number): void {
		if (this.uuid === source) {
			const queue: Array<{
				id: number
				message: any
			}> = this._pushed[topic]
			if (queue && queue[0]) {
				if (queue[0].id === id) {
					const { message } = queue.shift()!
					this.broadcastIGive(topic, id, uuid, message)
					this.broadcastPushedHeadMessage(topic)
					if (queue.length <= 0) {
						delete this._pushed[topic]
					}
				}
			}
		}
	}

	protected onReceivedIGive(uuid: string, topic: string, id: number, target: string, data: any): void {
		const tasks: Array<MessagebusExecutor> = this._pulled[topic]
		if (!tasks) {
			return
		}
		if (this.uuid === target) {
			let consumed: boolean = false
			while (tasks.length > 0) {
				const taskItem: MessagebusExecutor = tasks.shift()!
				if (taskItem && taskItem.getRunnigStatus()) {
					taskItem.execute(data)
					consumed = true
					break
				}
			}
			if (!consumed) {
				this.push(topic, data)
			}
			if (tasks.length <= 0) {
				delete this._pulled[topic]
			}
		}
	}

	protected abstract broadcastPublish(topic: string, data: any): void
	protected abstract broadcastWhoHas(topic: string): void
	protected abstract broadcastIHave(topic: string, id: number): void
	protected abstract broadcastINeed(topic: string, source: string, id: number): void
	protected abstract broadcastIGive(topic: string, id: number, target: string, data: any): void
}
