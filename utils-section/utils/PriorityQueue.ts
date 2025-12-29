import { Comparator } from '../types/Types'

export class PriorityQueue<T> {
	private readonly _blockHeap: Array<T>
	private readonly _comparator: Comparator<T>
	private _count: number
	constructor(comparator: Comparator<T>) {
		this._comparator = comparator
		this._blockHeap = []
		this._count = 0
	}

	public getSize(): number {
		return this._count
	}

	public addItem(item: T): void {
		if (this._count > 0) {
			this.siftUp(this._count, item)
		} else {
			this._blockHeap.push(item)
		}
		this._count += 1
	}

	public poll(): T {
		if (this._count > 0) {
			const result: T = this._blockHeap[0]
			this._count -= 1
			if (this._count > 0) {
				this.siftDown(0, this._blockHeap[this._count])
			}
			return result
		}
		return null!
	}

	public getHead(): T {
		return this._blockHeap[0]
	}

	private siftUp(n: number, item: T): void {
		while (n > 0) {
			const half: number = (n - 1) >>> 1
			const pt: T = this._blockHeap[half]
			if (this._comparator(item, pt) >= 0) {
				break
			}
			this._blockHeap[n] = pt
			n = half
		}
		this._blockHeap[n] = item
	}

	private siftDown(n: number, item: T): void {
		const half: number = this._count >>> 1
		while (n < half) {
			let c: number = (n << 1) + 1
			let child: T = this._blockHeap[c]
			let cr: number = c + 1
			if (cr < this._count) {
				const right = this._blockHeap[cr]
				if (this._comparator(child, right) > 0) {
					c = cr
					child = right
				}
			}
			if (this._comparator(item, child) <= 0) {
				break
			}
			this._blockHeap[n] = child
			n = c
		}
		this._blockHeap[n] = item
	}
}
