import { BLOCKING_QUEUE_CLOSED_TAG, BlockQueue } from '../utils/BlockQueue'
import { SoftSemaphore } from '../utils/SoftSemaphore'

type TP2PMessage<T> = { type: 'HI' | 'REND' | 'WEND' } | { type: 'DATA'; id: number; data: T } | { type: 'ACK'; id: number }
type TDuplexStream<T> = {
	rs: ReadableStream<T>
	ws: WritableStream<T>
}

export function createBroadcastP2PStream<T>(uuid: string): Promise<TDuplexStream<T>> {
	return new Promise<TDuplexStream<T>>((resolve, reject): void => {
		const channel: BroadcastChannel = new BroadcastChannel(uuid)
		let ds: TDuplexStream<T> = null!
		const readQueue: BlockQueue<T> = new BlockQueue<T>(5)
		const writeSem: SoftSemaphore = new SoftSemaphore(5)
		let writeChunkCnt: number = 0
		channel.onmessage = (e: MessageEvent): void => {
			const eData: TP2PMessage<T> = e.data as TP2PMessage<T>
			const { type } = eData
			if (type === 'DATA') {
				readQueue.pushQueue(eData.data).then((): void => {
					channel.postMessage({
						type: 'ACK',
						id: eData.id,
					})
				})
			} else if (type === 'HI') {
				if (!ds) {
					channel.postMessage({ type: 'HI' })
					ds = {
						rs: new ReadableStream<T>({
							pull: async (rsCtrl: ReadableStreamController<T>): Promise<void> => {
								const chunk: T | Symbol = await readQueue.shiftQueue()
								if (chunk === BLOCKING_QUEUE_CLOSED_TAG) {
									rsCtrl.close()
								} else {
									rsCtrl.enqueue(chunk as T)
								}
							},
						}),
						ws: new WritableStream<T>({
							write: async (chunk): Promise<void> => {
								await writeSem.acquireSync()
								channel.postMessage({
									type: 'DATA',
									id: writeChunkCnt,
									data: chunk,
								})
							},
							close: async (): Promise<void> => {
								await writeSem.close()
								channel.postMessage({ type: 'WNED' })
							},
						}),
					}
					resolve(ds)
				}
			} else if (type === 'REND') {
				if (ds) {
					ds.ws.close()
				}
			} else if (type === 'WEND') {
				readQueue.close()
			} else if (type === 'ACK') {
				writeSem.release()
			}
		}
		channel.postMessage({ type: 'HI' })
	})
}

/**
 * 流式写入数据
 * 		外部调用无需使用 await 调用此函数
 * 		此函数内部的异步等待即流的读取操作; 若不开始读取, 则写入操作就会一直等待
 */
export type TParseWrite<T> = Array<T> | ((executor: WritableStreamDefaultWriter<T>) => Promise<void>)
export async function flowWrite<T>(channeId: string, executor: TParseWrite<T>): Promise<void> {
	const ds: TDuplexStream<T> = await createBroadcastP2PStream<T>(channeId)
	const writer: WritableStreamDefaultWriter<T> = ds.ws.getWriter()
	if (executor instanceof Function) {
		await executor(writer)
	} else if (Array.isArray(executor)) {
		for (let item of executor) {
			await writer.write(item)
		}
	}
	writer.close()
}

/**
 * 流式读取数据
 */
export type TRFlowParse<T> = {
	start?: () => void
	end?: () => void
	update: (chunk: T) => void
}
export async function flowRead<T>(channeId: string, parse: TRFlowParse<T>): Promise<void> {
	const ds: TDuplexStream<T> = await createBroadcastP2PStream<T>(channeId)
	const reader: ReadableStreamDefaultReader<T> = ds.rs.getReader()
	if (parse.start instanceof Function) {
		await parse.start()
	}
	while (true) {
		const { value, done } = await reader.read()
		if (typeof value !== 'undefined') {
			parse.update(value)
		}
		if (done) {
			if (parse.end instanceof Function) {
				await parse.end()
			}
			break
		}
	}
	reader.cancel()
}
