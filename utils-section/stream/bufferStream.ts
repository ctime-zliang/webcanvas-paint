import { BLOCKING_QUEUE_CLOSED_TAG, BlockQueue } from '../utils/BlockQueue'

export function createBufferStream<T>(concat: (chunks: Array<T>) => T, size: (chunk: T) => number, highWaterMark: number = Number.MAX_SAFE_INTEGER): ReadableWritablePair<T> {
	const buffer: BlockQueue<T> = new BlockQueue<T>(highWaterMark, size)
	const readable = new ReadableStream<T>({
		pull: async (controller: ReadableStreamDefaultController): Promise<void> => {
			const chunks: Array<T> = []
			do {
				const chunk: T | Symbol = await buffer.shiftQueue()
				if (chunk === BLOCKING_QUEUE_CLOSED_TAG) {
					controller.close()
				} else {
					chunks.push(chunk as T)
				}
			} while (buffer.getSize() > 0)
			if (chunks.length > 0) {
				controller.enqueue(concat(chunks))
			}
		},
		cancel: (): void => {
			buffer.close()
		},
	})
	const writable = new WritableStream<T>({
		write: async (chunk: T, controller: WritableStreamDefaultController): Promise<void> => {
			const res: boolean = await buffer.pushQueue(chunk)
			if (!res) {
				writable.close()
			}
		},
		close: (): void => {
			buffer.close()
		},
	})
	return {
		readable,
		writable,
	}
}

export function createBufferStringStream(highWaterMark: number = Number.MAX_SAFE_INTEGER): ReadableWritablePair<string> {
	return createBufferStream<string>(
		(chunks: Array<string>): string => {
			return chunks.join('')
		},
		(chunk: string): number => {
			return chunk.length
		},
		highWaterMark
	)
}

export function createBufferByteBufferStream(highWaterMark: number = Number.MAX_SAFE_INTEGER): ReadableWritablePair<Uint8Array> {
	return createBufferStream<Uint8Array>(
		(chunks: Array<Uint8Array>): Uint8Array => {
			const buffer: Uint8Array = new Uint8Array(
				chunks.reduce((acc: number, cur: Uint8Array): number => {
					return acc + cur.byteLength
				}, 0)
			)
			let offset: number = 0
			for (let i: number = 0; i < chunks.length; i++) {
				buffer.set(chunks[i], offset)
				offset += chunks[i].byteLength
			}
			return buffer
		},
		(chunk: Uint8Array): number => {
			return chunk.byteLength
		},
		highWaterMark
	)
}
