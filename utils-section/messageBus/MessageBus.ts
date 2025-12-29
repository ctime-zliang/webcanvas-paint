import { getOrInitArr, remove2 } from '../utils/Utils'
import { MessageBusBridge } from './MessageBusBridge'
import { MessageBusTask } from './MessageBusTask'
import { delReferenceSource, getReferenceSource, TMessageRemoteData, MessageCallback, RPC_DEFAULT_TIMEOUT, RPC_IDEN, RPC_TIMEOUT_TASKQUEUE, TRPC_TIMEOUT_DESCP, iRequestAnimationFrame } from './profiles'

const rpcTimeoutCheckLoop = (): void => {
	const now: number = performance.now()
	while (RPC_TIMEOUT_TASKQUEUE.getSize() > 0) {
		const head: TRPC_TIMEOUT_DESCP = RPC_TIMEOUT_TASKQUEUE.getHead()
		if (head.timeout <= now) {
			RPC_TIMEOUT_TASKQUEUE.poll()
			head.reject(`RPC Call ${head.topic} Time-out.`)
			continue
		}
		break
	}
	iRequestAnimationFrame(rpcTimeoutCheckLoop)
}
iRequestAnimationFrame(rpcTimeoutCheckLoop)

export class MessageBus {
	private _keepRef: boolean
	private _subscribed: { [topic: string]: Array<MessageBusTask> }
	private _pulled: { [topic: string]: Array<MessageBusTask> }
	private _pushed: { [topic: string]: Array<TMessageRemoteData> }
	private _rpcTicket: number
	constructor(keepRef: boolean) {
		this._keepRef = keepRef
		this._subscribed = {}
		this._pulled = {}
		this._pushed = {}
		this._rpcTicket = 0
	}

	public createTopicUniqueTag(topic: string): string {
		return topic + RPC_IDEN + this._rpcTicket++
	}

	public subscribe(topic: string, callback: MessageCallback): MessageBusTask {
		const taskItem: MessageBusTask = new MessageBusTask(callback)
		getOrInitArr(this._subscribed, topic).push(taskItem)
		return taskItem
	}

	public publish(topic: string, data: any, bridge?: MessageBusBridge, source?: any): void {
		const tasks: Array<MessageBusTask> = this._subscribed[topic]
		if (!tasks) {
			console.warn(`this topic: ${topic} has no subscribers.`)
			return
		}
		let deletion: Array<MessageBusTask> = []
		for (let taskItem of tasks) {
			if (taskItem.getRunnigStatus()) {
				taskItem.execute(data, bridge, source, this._keepRef)
			} else {
				deletion.push(taskItem)
			}
		}
		for (let taskItem of deletion) {
			remove2(tasks, taskItem)
		}
	}

	public registeAsyncService(topic: string, callback: (...args: Array<any>) => any | Promise<any>): MessageBusTask {
		return this.subscribe(
			topic,
			(
				rpcData: {
					data: any
					reply: string
				},
				bridge?: MessageBusBridge,
				source?: any
			): void => {
				const { data, reply } = rpcData
				try {
					const returns: any | Promise<any> = callback(data)
					if (returns instanceof Promise) {
						const _source: any = getReferenceSource(source)
						returns
							.then((result: any): void => {
								this.rpcReply(reply, result, bridge, delReferenceSource(_source))
							})
							.catch((e: any): void => {
								console.error(e)
								this.rpcReply(topic, undefined!, bridge, delReferenceSource(_source))
							})
						return
					}
					this.rpcReply(topic, returns, bridge, source)
				} catch (e) {
					console.error(e)
					this.rpcReply(topic, undefined!, bridge, source)
				}
			}
		)
	}

	public async asyncRequest(topic: string, data: any, timeout: number = RPC_DEFAULT_TIMEOUT): Promise<TMessageRemoteData> {
		return new Promise((resolve, reject): void => {
			const target: TRPC_TIMEOUT_DESCP = {
				timeout: performance.now() + timeout,
				reject,
				topic,
			}
			RPC_TIMEOUT_TASKQUEUE.addItem(target)
			const reply: string = this.createTopicUniqueTag(topic)
			this.publish(topic, { data, reply })
			this.pull(reply, (data: any, bridge?: MessageBusBridge, source?: any): void => {
				resolve({ data, bridge, source: getReferenceSource(source) })
				target.reject = null!
			})
		})
	}

	public push(topic: string, data: any, bridge?: MessageBusBridge, source?: any): void {
		let consumed: boolean = false
		const tasks: Array<MessageBusTask> = this._pulled[topic]
		if (tasks) {
			while (tasks.length > 0) {
				const taskItem: MessageBusTask = tasks.shift()!
				if (taskItem && taskItem.getRunnigStatus()) {
					taskItem.execute(data, bridge, source, this._keepRef)
					consumed = true
					break
				}
			}
			if (tasks.length <= 0) {
				delete this._pulled[topic]
			}
		}
		if (!consumed) {
			getOrInitArr(this._pushed, topic).push({ data, bridge, source: getReferenceSource(source) })
		}
	}

	public pull(topic: string, callback: MessageCallback): MessageBusTask {
		const taskItem: MessageBusTask = new MessageBusTask(callback)
		const remoteMessages: Array<TMessageRemoteData> = this._pushed[topic]
		if (remoteMessages) {
			const remoteMessage: TMessageRemoteData = remoteMessages.shift()!
			taskItem.execute(remoteMessage.data, remoteMessage.bridge, delReferenceSource(remoteMessage.source), this._keepRef)
			if (remoteMessages.length <= 0) {
				delete this._pushed[topic]
			}
		} else {
			getOrInitArr(this._pulled, topic).push(taskItem)
		}
		return taskItem
	}

	public pullA(topic: string): Promise<TMessageRemoteData> {
		return new Promise<TMessageRemoteData>((resolve, reject): void => {
			this.pull(topic, (data: any, bridge?: MessageBusBridge, source?: any): void => {
				resolve({ data, bridge, source: getReferenceSource(source) })
			})
		})
	}

	public clearAll(): void {
		this._keepRef = false
		this._subscribed = {}
		this._pulled = {}
		this._pushed = {}
		this._rpcTicket = 0
	}

	private rpcReply(topic: string, data: any, bridge?: MessageBusBridge, source?: any): void {
		if (bridge) {
			bridge.push(topic, data, source)
			return
		}
		this.push(topic, data)
	}
}
