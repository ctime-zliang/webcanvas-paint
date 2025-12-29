export const BLOCKING_QUEUE_CLOSED_TAG: Symbol = Symbol('BLOCKING_QUEUE_CLOSED_TAG')

export class BlockQueue<T> {
	/**
	 * 阻塞队列
	 */
	private readonly _queue: Array<T>
	private readonly waittingConSumers: Array<(v: T | typeof BLOCKING_QUEUE_CLOSED_TAG) => void>
	private readonly waittingProducers: Array<(done: boolean) => void>
	private _queueSize: number
	private _isClosed: boolean
	/**
	 * 阻塞队列最大长度
	 */
	private _maxSize: number
	/**
	 * 阻塞队列长度计算器
	 */
	private _itemSizeOf: (item: T) => number
	constructor(
		maxSize: number,
		itemSizeOf: (item: T) => number = (): number => {
			return 1
		}
	) {
		this._maxSize = maxSize <= 0 ? 1 : maxSize
		this._itemSizeOf = itemSizeOf
	}

	/**
	 * 向队列中和插入元素
	 * 		若队列无空闲位置, 则等待队列腾出可用空间
	 */
	public async pushQueue(item: T): Promise<boolean> {
		if (this._isClosed) {
			return false
		}
		if (this.isFull()) {
			const waitRes: boolean = await new Promise<boolean>((_): void => {
				this.waittingProducers.push(_)
			})
			if (!waitRes) {
				return false
			}
		}
		if (this.waittingConSumers.length > 0) {
			/**
			 * 若存在至少一个消费者, 则将元素传递给第一个消费者
			 **/
			const consumer: (v: T | typeof BLOCKING_QUEUE_CLOSED_TAG) => void = this.waittingConSumers.shift()!
			if (consumer instanceof Function) {
				consumer(item)
			}
		} else {
			this._queue.push(item)
			this._queueSize += this._itemSizeOf(item)
		}
		return true
	}

	/**
	 * 从队列中取出元素
	 * 		若队列为空, 则等待队列插入元素后取出
	 */
	public async shiftQueue(): Promise<T | typeof BLOCKING_QUEUE_CLOSED_TAG> {
		if (this._queue.length > 0) {
			const item: T = this._queue.shift()!
			this._queueSize -= this._itemSizeOf(item)
			if (!this.isFull() && this.waittingConSumers.length > 0) {
				/**
				 * 若存在至少一个生产者, 则发起通知
				 **/
				const producer: (done: boolean) => void = this.waittingProducers.shift()!
				producer(true)
			}
			return item
		}
		if (this._isClosed) {
			return BLOCKING_QUEUE_CLOSED_TAG
		}
		/**
		 * 等待队列被插入元素
		 */
		return await new Promise<T | typeof BLOCKING_QUEUE_CLOSED_TAG>((_): void => {
			this.waittingConSumers.push(_)
		})
	}

	public getSize(): number {
		return this._queueSize
	}

	public isEmpty(): boolean {
		return this._queueSize <= 0
	}

	public isFull(): boolean {
		return this._queueSize >= this._maxSize
	}

	public close(): void {
		this._isClosed = true
		while (this.waittingProducers.length > 0) {
			const producer: (done: boolean) => void = this.waittingProducers.shift()!
			producer(false)
		}
		if (this._queueSize <= 0) {
			while (this.waittingProducers.length > 0) {
				const consumer: (v: T | typeof BLOCKING_QUEUE_CLOSED_TAG) => void = this.waittingConSumers.shift()!
				if (consumer instanceof Function) {
					consumer(BLOCKING_QUEUE_CLOSED_TAG)
				}
			}
		}
	}
}
