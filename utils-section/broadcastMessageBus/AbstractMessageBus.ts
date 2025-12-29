import { MessagebusExecutor } from './MessagebusExecutor'
import { IMessageBusRPCData, MessageCallback, RPC_IDEN } from './profiles'
import { getShortUuid } from './uuid'

export abstract class AbstractMessageBus {
	private readonly _uuid: string
	private _rpcTicket: number
	constructor(uuid: string = getShortUuid()) {
		this._uuid = uuid
		this._rpcTicket = 0
	}

	public get uuid(): string {
		return this._uuid
	}

	public subscribeOnce(topic: string, callback: MessageCallback): MessagebusExecutor {
		const taskItem: MessagebusExecutor = this.subscribe(topic, (data: any): void => {
			taskItem.cancel()
			callback(data)
		})
		return taskItem
	}

	public async pullA(topic: string): Promise<any> {
		return new Promise<any>((resolve): void => {
			this.pull(topic, resolve)
		})
	}

	public registeAsyncService(topic: string, callback: (...args: Array<any>) => any | Promise<any>): MessagebusExecutor {
		let curPull: MessagebusExecutor = undefined!
		const rpcExecutor = (rpcData: IMessageBusRPCData): void => {
			curPull = undefined!
			try {
				const { message, replyTopic } = rpcData
				try {
					const returns: any | Promise<any> = callback(message)
					if (returns instanceof Promise) {
						returns
							.then((result: any): void => {
								this.push(replyTopic, { success: true, result })
							})
							.catch((e): void => {
								console.error(e)
								this.push(replyTopic, { success: false, err: e })
							})
					} else {
						this.push(replyTopic, { success: true, result: returns })
					}
				} catch (e) {
					this.push(replyTopic, { success: false, err: e })
				}
			} finally {
				curPull = this.pull(topic, rpcExecutor)
			}
		}
		curPull = this.pull(topic, rpcExecutor)
		return curPull || new MessagebusExecutor(null!, false)
	}

	public async asyncRequest(topic: string, data: any, timeout: number = 0): Promise<any> {
		let curReplyPull: MessagebusExecutor = undefined!
		const taskItem: Promise<any> = new Promise<any>((resolve, reject): void => {
			const replyTopic: string = `${RPC_IDEN}-${topic}-${this._uuid}-${this._rpcTicket++}`
			curReplyPull = this.pull(replyTopic, (result: any): void => {
				curReplyPull = undefined!
				if (result.success) {
					resolve(result.result)
				} else {
					reject(new Error(result.err))
				}
			})
			this.push(topic, { data, replyTopic })
		})
		if (timeout > 0) {
			return Promise.race([
				taskItem,
				new Promise<any>((resolve, reject): void => {
					setTimeout((): void => {
						curReplyPull?.cancel()
						reject({ err: 'timeout.' })
					}, timeout)
				}),
			])
		}
		return taskItem
	}

	public abstract publish(topic: string, data?: any): void
	public abstract subscribe(topic: string, callback: MessageCallback): MessagebusExecutor
	public abstract push(topic: string, data: any): void
	public abstract pull(topic: string, callback: MessageCallback): MessagebusExecutor
}
