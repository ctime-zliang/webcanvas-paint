import { IIterable, IIterator } from '../types/Types'

class ListIterator<T> implements IIterator<T> {
	private _nextNode: ListNode<T>
	constructor(currentNode: ListNode<T>) {
		this._nextNode = currentNode
	}

	public hasNext(): boolean {
		return this._nextNode !== null
	}

	public next(): T {
		const nextItemNode: ListNode<T> = this._nextNode
		if (nextItemNode !== null) {
			this._nextNode = nextItemNode.nextNode
			return this._nextNode.value
		}
		throw new Error(`iterator is null.`)
	}
}

class ListNodeIterator<T> implements IIterator<ListNode<T>> {
	private _nextNode: ListNode<T>
	constructor(currentNode: ListNode<T>) {
		this._nextNode = currentNode
	}

	public hasNext(): boolean {
		return this._nextNode !== null
	}

	public next(): ListNode<T> {
		const nextItemNode: ListNode<T> = this._nextNode
		if (nextItemNode !== null) {
			this._nextNode = nextItemNode.nextNode
			return this._nextNode
		}
		throw new Error(`iterator is null.`)
	}
}

export class ListNode<T> {
	private readonly _parent: LinkedList<T>
	private _value: T
	private _prevNode: ListNode<T>
	private _nextNode: ListNode<T>
	constructor(value: T, parent: LinkedList<T>) {
		this._value = value
		this._parent = parent
	}

	public get value(): T {
		return this._value
	}

	public get prevNode(): ListNode<T> {
		return this._prevNode
	}

	public get nextNode(): ListNode<T> {
		return this._nextNode
	}

	public insertAfter(itemNode: ListNode<T>): void {
		itemNode._nextNode = this._nextNode
		this._nextNode = itemNode
		itemNode._prevNode = this
		if (itemNode._nextNode !== null) {
			itemNode._nextNode._prevNode = itemNode
		}
	}

	public insertBefore(item: ListNode<T>): void {
		item._prevNode = this._prevNode
		this._prevNode = item
		item._nextNode = this
		if (item._prevNode !== null) {
			item._prevNode._nextNode = item
		}
	}

	public remove(): void {
		if (this._prevNode !== null) {
			this._prevNode._nextNode = this._nextNode
		}
		if (this._nextNode !== null) {
			this._nextNode._prevNode = this._prevNode
		}
	}

	public set(value: T): void {
		this._value = value
	}
}

export class LinkedList<T> implements IIterable<T> {
	private _firstNode: ListNode<T>
	private _lastNode: ListNode<T>
	private _count: number
	constructor() {
		this._firstNode = null!
		this._lastNode = null!
		this._count = 0
	}

	public addFirstValue(value: T): ListNode<T> {
		if (this._firstNode === null || this._lastNode === null) {
			const listNode: ListNode<T> = new ListNode(value, this)
			this._firstNode = listNode
			this._lastNode = listNode
			this._count++
			return listNode
		}
		return this.insertValueBefore(value, this._firstNode)
	}

	public removeFirstNode(): ListNode<T> {
		const firstNode: ListNode<T> = this._firstNode
		if (firstNode === null) {
			throw new Error(`linked list is empty.`)
		}
		this.removeNode(firstNode)
		return firstNode
	}

	public addLastValue(value: T): ListNode<T> {
		if (this._firstNode === null || this._lastNode === null) {
			const listNode: ListNode<T> = new ListNode(value, this)
			this._firstNode = listNode
			this._lastNode = listNode
			this._count = 1
			return listNode
		}
		return this.insertValueAfter(value, this._lastNode)
	}

	public removeLastNode(): ListNode<T> {
		const lastNode: ListNode<T> = this._lastNode
		if (lastNode === null) {
			throw new Error(`linked list is empty.`)
		}
		this.removeNode(lastNode)
		return lastNode
	}

	public getFirstValue(): T {
		if (this._firstNode === null) {
			throw new Error(`linked list is empty.`)
		}
		return this._firstNode.value
	}

	public getLastValue(): T {
		if (this._lastNode === null) {
			throw new Error(`linked list is empty.`)
		}
		return this._lastNode.value
	}

	public insertValueAfter(value: T, refNode: ListNode<T>): ListNode<T> {
		const itemNode: ListNode<T> = new ListNode(value, this)
		refNode.insertAfter(itemNode)
		if (refNode === this._lastNode) {
			this._lastNode = itemNode
		}
		this._count += 1
		return itemNode
	}

	public insertValueBefore(value: T, refNode: ListNode<T>): ListNode<T> {
		const itemNode: ListNode<T> = new ListNode(value, this)
		refNode.insertBefore(itemNode)
		if (refNode === this._firstNode) {
			this._firstNode = itemNode
		}
		this._count += 1
		return itemNode
	}

	public removeNode(itemNode: ListNode<T>): void {
		itemNode.remove()
		if (itemNode === this._firstNode) {
			this._firstNode = this._firstNode.nextNode
		}
		if (itemNode === this._lastNode) {
			this._lastNode = this._lastNode.prevNode
		}
		this._count -= 1
	}

	public getSize(): number {
		return this._count
	}

	public clear(): void {
		this._firstNode = null!
		this._lastNode = null!
		this._count = 0
	}

	public iterator() {
		return new ListIterator(this._firstNode)
	}

	public listIterator(): IIterator<ListNode<T>> {
		return new ListNodeIterator(this._firstNode)
	}

	public toArray(): Array<T> {
		const arr: Array<T> = []
		let currNode: ListNode<T> = this._firstNode
		while (currNode !== null) {
			arr.push(currNode.value)
			currNode = currNode.nextNode!
		}
		return arr
	}
}
