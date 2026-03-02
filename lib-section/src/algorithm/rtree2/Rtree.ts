import { RtreeDebug_profile } from './config'
import { RtreeDebug_appendContainerViewArea, RtreeDebug_appendRectViewSection } from './debug'
import { RtreeItem } from '../../utils/RtreeItem'
import { insertSubtree } from './insertSubtree'
import { removeSubtree } from './removeSubtree'
import { searchSubtree } from './searchSubtree'
import { BaseInterface } from '../../controller/BaseInterface'

export type TRtreeNodeItem = {
	x: number
	y: number
	w: number
	h: number
	nodes: Array<TRtreeNodeItem>
	leaf?: any
	id?: string
}

export type TSimpleRect = {
	x: number
	y: number
	w: number
	h: number
}

export class RTree extends BaseInterface {
	private _root: TRtreeNodeItem
	private _minWidth: number
	private _maxWidth: number
	private _allItems: Set<RtreeItem>
	private _getWidth: number
	constructor(width: number = 10) {
		super()
		this._getWidth = width
		this._root = null!
		this._minWidth = 3
		this._maxWidth = 6
		this._allItems = new Set()
		this.refresh()
		// if (RtreeDebug_profile.isEnableDebug) {
		// 	RtreeDebug_appendContainerViewArea(document.body)
		// }
	}

	public refresh(): void {
		let minWidth: number = this._minWidth
		let maxWidth: number = this._maxWidth
		if (!isNaN(this._getWidth)) {
			minWidth = Math.floor(this._getWidth / 2.0)
			maxWidth = this._getWidth
		}
		this._allItems = new Set()
		const rootTree: TRtreeNodeItem = {
			x: 0,
			y: 0,
			w: 0,
			h: 0,
			nodes: [],
			id: `root`,
		}
		this._root = rootTree
		this._minWidth = minWidth
		this._maxWidth = maxWidth
	}

	public getAllItems(): Set<RtreeItem> {
		return this._allItems
	}

	public insertItemData(rect: TSimpleRect, obj: RtreeItem): void {
		// if (RtreeDebug_profile.isEnableDebug) {
		// 	RtreeDebug_appendRectViewSection([[rect, obj]], RtreeDebug_profile.debugContainerId)
		// }
		this._allItems.add(obj)
		insertSubtree({ x: rect.x, y: rect.y, w: rect.w, h: rect.h, leaf: obj } as TRtreeNodeItem, this._root, this._maxWidth, this._minWidth)
	}

	public search(rect: TSimpleRect): Array<TRtreeNodeItem> {
		return searchSubtree(rect, this._root)
	}

	public remove(rect: TSimpleRect, obj: RtreeItem): Array<TRtreeNodeItem> {
		let removedList: Array<TRtreeNodeItem> = []
		if (!obj) {
			removedList = this.removeArea(rect)
		} else {
			removedList = this.removeObj(rect, obj)
		}
		for (let i: number = 0; i < removedList.length; i++) {
			this._allItems.delete(removedList[i].leaf)
		}
		return removedList
	}

	public clearAllItems(): void {
		this.refresh()
	}

	public quit(): void {
		this.clearAllItems()
		this._allItems.clear()
		this._allItems = undefined!
	}

	private removeArea(rect: TSimpleRect): Array<TRtreeNodeItem> {
		let numberDeleted: number = 1
		let allRemovedList: Array<TRtreeNodeItem> = []
		while (numberDeleted > 0) {
			const removedList: Array<TRtreeNodeItem> = removeSubtree(rect, false, this._root, this._maxWidth, this._minWidth)
			numberDeleted = removedList.length
			allRemovedList = allRemovedList.concat(removedList)
		}
		return allRemovedList
	}

	private removeObj(rect: TSimpleRect, obj: RtreeItem): Array<TRtreeNodeItem> {
		const removedList: Array<TRtreeNodeItem> = removeSubtree(rect, obj, this._root, this._maxWidth, this._minWidth)
		return removedList
	}
}
