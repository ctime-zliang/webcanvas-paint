import { BaseInterface } from '../controller/BaseInterface'

export abstract class BaseManager<T> extends BaseInterface {
	private _items: Map<string, T>
	constructor() {
		super()
		this._items = new Map()
	}

	public get items(): Map<string, T> {
		return this._items
	}
	public set items(value: Map<string, T>) {
		this._items = value
	}

	public getAllItems(): Array<T> {
		const allItems: Array<T> = new Array(this.items.size)
		const items = this.items.values()
		let i: number = 0
		for (let item of items) {
			allItems[i++] = item
		}
		return allItems
	}

	public getItemById(gId: string): T {
		return this.items.get(gId) as T
	}

	public quit(): void {
		if (this._items) {
			this._items.clear()
			this._items = undefined!
		}
	}
}
