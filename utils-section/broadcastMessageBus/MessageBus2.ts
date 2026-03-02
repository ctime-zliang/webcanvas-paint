import { getOrInitArr, remove2 } from '../utils/Utils'
import { AbstractMessageBus } from './AbstractMessageBus'
import { MessagebusExecutor } from './MessagebusExecutor'
import { MessageCallback } from './profiles'

export class MessageBus2 extends AbstractMessageBus {
	private readonly _subscribed: { [topic: string]: Array<MessagebusExecutor> }
	private readonly _pulled: { [topic: string]: Array<MessagebusExecutor> }
	private readonly _pushed: { [topic: string]: Array<any> }
	private readonly _keepRef: boolean
	constructor(keepRef: boolean = false) {
		super()
		this._keepRef = keepRef
	}

	public publish(topic: string, data: any): void {
		const tasks: Array<MessagebusExecutor> = this._subscribed[topic]
		if (!tasks) {
			console.warn(`this topic: ${topic} has no subscribers.`)
			return
		}
		let deletion: Array<MessagebusExecutor> = []
		for (let taskItem of tasks) {
			if (taskItem.getRunnigStatus()) {
				taskItem.execute(data)
			} else {
				deletion.push(taskItem)
			}
			if (deletion.length) {
				for (let taskItem of deletion) {
					remove2(tasks, taskItem)
				}
			}
		}
	}

	public subscribe(topic: string, callback: MessageCallback): MessagebusExecutor {
		const taskItem: MessagebusExecutor = new MessagebusExecutor(callback, this._keepRef)
		getOrInitArr(this._subscribed, topic).push(taskItem)
		return taskItem
	}

	public push(topic: string, data: any): void {
		let consumed: boolean = false
		const tasks: Array<MessagebusExecutor> = this._pulled[topic]
		if (tasks) {
			while (tasks.length > 0) {
				const taskItem: MessagebusExecutor = tasks.shift()!
				if (taskItem && taskItem.getRunnigStatus()) {
					taskItem.execute(data)
					consumed = true
					break
				}
			}
			if (tasks.length <= 0) {
				delete this._pulled[topic]
			}
		}
		if (!consumed) {
			getOrInitArr(this._pushed, topic).push(data)
		}
	}

	public pull(topic: string, callback: MessageCallback): MessagebusExecutor {
		const taskItem: MessagebusExecutor = new MessagebusExecutor(callback, this._keepRef)
		this.repull(topic, taskItem)
		return taskItem
	}

	private repull(topic: string, taskItem: MessagebusExecutor): void {
		const queue: Array<any> = this._pushed[topic]
		if (queue) {
			const data: any = queue.shift()!
			if (typeof data !== 'undefined') {
				taskItem.execute(data)
				if (queue.length <= 0) {
					delete this._pushed[topic]
				}
			}
		} else {
			getOrInitArr(this._pulled, topic).push(taskItem)
		}
	}
}
