import { format2Binary } from '../utils/Utils'

const START_ADDRESS: number = 0x00000000
const FULL_ADDRESS: number = 0xffffffff
const EMPTY_TAG: number = 0
const BYTE_CHUNK_SIZE: number = 32

export class BitmapIndex {
	private _size: number
	private _index: Uint32Array
	private _marked: number
	private _emptyStart: number
	private _max: number
	constructor(size: number) {
		this._size = size
		this._index = new Uint32Array(Math.ceil(size / BYTE_CHUNK_SIZE))
		this._max = -1
		this._emptyStart = 0
		this._marked = 0
		this.init()
	}

	public init(bitMapIndexItem: BitmapIndex = null!): BitmapIndex {
		if (bitMapIndexItem) {
			this._index.set(bitMapIndexItem._index)
			this._marked = bitMapIndexItem._marked
			this._emptyStart = bitMapIndexItem._emptyStart
			this._max = bitMapIndexItem._max
			return this
		}
		return this
	}

	public get size(): number {
		return this._size
	}

	public extendSize(size: number): BitmapIndex {
		const newBitmapIndex: BitmapIndex = new BitmapIndex(size)
		newBitmapIndex.init(this)
		return newBitmapIndex
	}

	public isEmpty(): boolean {
		return this._marked === 0
	}

	public getMarked(): number {
		return this._marked
	}

	public getChunk(idx: number): number {
		return this._index[idx]
	}

	public isUsed(idx: number): boolean {
		const chunkIndex: number = (idx / BYTE_CHUNK_SIZE) | 0
		const chunkItem: number = this._index[chunkIndex]
		if (chunkItem === FULL_ADDRESS) {
			return true
		}
		if (chunkItem === EMPTY_TAG) {
			return false
		}
		return ((chunkItem >> (BYTE_CHUNK_SIZE - 1 - idx)) & 1) === 1
	}

	public markUsed(idx: number): void {
		const chunkIndex: number = (idx / BYTE_CHUNK_SIZE) | 0
		const chunkItem: number = this._index[chunkIndex]
		const offset: number = 1 << (BYTE_CHUNK_SIZE - 1 - idx)
		if ((chunkItem & offset) === 0) {
			this._index[chunkIndex] = chunkItem | offset
			this._marked++
		}
		if (idx > this._max) {
			this._max = idx
		}
	}

	public markRemove(idx: number): void {
		const chunkIndex: number = (idx / BYTE_CHUNK_SIZE) | 0
		const chunkItem: number = this._index[chunkIndex]
		const offset: number = 1 << (BYTE_CHUNK_SIZE - 1 - idx)
		if ((chunkItem & offset) !== 0) {
			this._index[chunkIndex] = chunkItem & (FULL_ADDRESS ^ offset)
			this._marked--
			if (idx < this._emptyStart) {
				this._emptyStart = idx
			}
		}
	}

	public reset(): void {
		this._index.fill(0)
		this._marked = 0
		this._emptyStart = 0
		this._max = -1
	}

	public findEmpty(chunks: number = -1): number {
		if (this._size - this._marked < chunks) {
			return -1
		}
		const index: Uint32Array = this._index
		let start: number = -1
		let isSetEmptyStart: boolean = false
		for (let i: number = Math.floor(this._emptyStart / BYTE_CHUNK_SIZE); i < index.length; i++) {
			const chunkItem: number = index[i]
			if (chunkItem === EMPTY_TAG) {
				if (start === -1) {
					start = i * BYTE_CHUNK_SIZE
					if (isSetEmptyStart) {
						this._emptyStart = start
						isSetEmptyStart = true
					}
					if (chunks <= BYTE_CHUNK_SIZE) {
						return start
					}
				} else {
					let end: number = (i + 1) * BYTE_CHUNK_SIZE
					if (end - start >= chunks) {
						return start
					}
				}
			} else if (chunkItem !== FULL_ADDRESS) {
				for (let j: number = BYTE_CHUNK_SIZE - 1; j >= 0; j--) {
					if (((chunkItem >> j) & 1) === 0) {
						let endIndex: number = i * BYTE_CHUNK_SIZE + BYTE_CHUNK_SIZE - 1 - j
						if (start === -1) {
							start = endIndex
							if (!isSetEmptyStart) {
								this._emptyStart = start
								isSetEmptyStart = true
							}
						}
						if (endIndex - start + 1 >= chunks) {
							return start
						}
					} else {
						start = -1
					}
				}
			} else {
				start = -1
			}
		}
		return -1
	}

	public hasNextEmpty(count: number = 1): boolean {
		return this._size - this._marked >= count
	}

	/**
	 * 获取一组长度为 {count} 的可用空间并返回索引空间(地址)
	 */
	public findNextEmpty(count: number = 1): Array<number> {
		const result: Array<number> = []
		if (this._size - this._marked < count) {
			throw new Error('memory allocation failed: there is not enough memory address space for the current ObjectBlendBuffer.')
		}
		/**
		 * 连续索引空间
		 */
		if (this._size - this._max - 1 >= count) {
			const end: number = this._max + count
			for (let i: number = this._max + 1; i <= end; i++) {
				result.push(i)
			}
			return result
		}
		/**
		 * 非连续索引空间
		 */
		const index: Uint32Array = this._index
		for (let i: number = Math.floor(this._emptyStart / BYTE_CHUNK_SIZE); i < index.length; i++) {
			if (this._marked + result.length === i * BYTE_CHUNK_SIZE) {
				for (let j: number = i * BYTE_CHUNK_SIZE; result.length !== count; j++) {
					result.push(j)
				}
				this._emptyStart = result[0]
				return result
			}
			const chunkItem: number = index[i]
			if (chunkItem === START_ADDRESS) {
				const tmp: number = i * BYTE_CHUNK_SIZE
				if (result.indexOf(tmp) === -1) {
					result.push(tmp)
					if (result.length >= count) {
						this._emptyStart = result[0]
						return result
					} else {
						const num: number = count - result.length
						if (num < BYTE_CHUNK_SIZE) {
							for (let k: number = 0; k < num; k++) {
								result.push(tmp + k + 1)
							}
							this._emptyStart = result[0]
							return result
						} else {
							for (let k: number = 0; k < BYTE_CHUNK_SIZE - 1; k++) {
								result.push(tmp + k + 1)
							}
						}
					}
				}
			} else if (chunkItem !== FULL_ADDRESS) {
				for (let j: number = BYTE_CHUNK_SIZE - 1; j >= 0; j--) {
					if (((chunkItem >> j) & 1) === 0) {
						const tmp: number = i * BYTE_CHUNK_SIZE + BYTE_CHUNK_SIZE - 1 - j
						if (result.indexOf(tmp) === -1) {
							result.push(tmp)
							if (result.length === count) {
								this._emptyStart = result[0]
								return result
							}
						}
					}
				}
			}
		}
		this._emptyStart = result.length === 0 ? this._size : result[0]
		return []
	}

	public getMax(): number {
		return this._max
	}

	public debug(): void {
		const display: Array<string> = []
		const index: Uint32Array = this._index
		for (let i: number = 0; i < index.length; i++) {
			display.push(format2Binary(index[i]))
		}
		console.log(display)
	}
}
