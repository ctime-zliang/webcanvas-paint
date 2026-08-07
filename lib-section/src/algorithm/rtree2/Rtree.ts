import { RtreeDebug_profile } from './config'
import { RtreeDebug_appendContainerViewArea, RtreeDebug_appendRectViewSection } from './debug'
import { RtreeItem } from '../../utils/RtreeItem'
import { insertSubtree } from './insertSubtree'
import { removeSubtree } from './removeSubtree'
import { searchSubtree } from './searchSubtree'
import { BaseInterface } from '../../controller/BaseInterface'

/**
 * R-Tree 空间索引数据结构 - 主入口类
 *
 * R-Tree(Rectangle Tree)是一种平衡树形空间索引结构, 由 Antonin Guttman 于 1984 年提出
 * 通过层级化的矩形包围盒(MBR)组织多维空间对象, 实现对空间数据的高效检索
 *
 * 核心概念:
 * 		┌─────────────────────────────────────────────────────────────────┐
 * 		│ R-Tree 结构示意                                                 │
 * 		│                                                                 │
 * 		│   Root [MBR覆盖全部子树]                                         │
 * 		│    ├── InternalNode_A [MBR]                                     │
 * 		│    │    ├── Leaf_1 (空间对象引用)                                 │
 * 		│    │    ├── Leaf_2 (空间对象引用)                                 │
 * 		│    │    └── Leaf_3 (空间对象引用)                                 │
 * 		│    └── InternalNode_B [MBR]                                     │
 * 		│         ├── Leaf_4 (空间对象引用)                                 │
 * 		│         └── Leaf_5 (空间对象引用)                                 │
 * 		└─────────────────────────────────────────────────────────────────┘
 *
 * 性质:
 * 		- 每个内部节点最多包含 maxWidth 个子节点
 * 		- 每个内部节点最少包含 minWidth 个子节点(根节点除外)
 * 		- 叶子节点存储实际空间对象的引用 (leaf 属性)
 * 		- 所有叶子节点位于同一层级(平衡树)
 *
 * 时间复杂度:
 * 		- 搜索: O(log_M(N)) 平均情况, 最坏 O(N) (取决于数据分布)
 * 		- 插入: O(log_M(N))
 * 		- 删除: O(log_M(N))
 * 		其中 M 为节点最大容量 (maxWidth), N 为数据总量
 *
 * 当前实现采用:
 * 		- 线性分裂 (Linear Split) 策略进行节点溢出处理
 * 		- 正方化评估 (Squarified Ratio) 进行子树选择优化
 */

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

	/**
	 * 重置 R-Tree 为初始空状态
	 *
	 * 根据 width 参数重新计算节点容量约束:
	 * 		- minWidth = floor(width / 2): 节点最少子节点数(下溢阈值)
	 * 		- maxWidth = width: 节点最多子节点数(溢出触发分裂的阈值)
	 *
	 * R-Tree 理论要求:
	 * 			minWidth <= ceil(maxWidth / 2)
	 * 		此处 minWidth = floor(maxWidth / 2) 满足该约束
	 */
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

	/**
	 * 从 R-Tree 中删除空间对象
	 *
	 * 支持两种删除模式:
	 * 		- 精确删除 (obj 非空): 删除与 rect 重叠且 leaf === obj 的唯一叶子节点
	 * 		- 区域删除 (obj 为空): 删除与 rect 重叠或被 rect 包含的所有节点
	 */
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

	/**
	 * 区域删除: 循环调用 removeSubtree 直到无节点可删
	 *
	 * 由于 removeSubtree 每次调用只删除一个匹配项(满足条件后 break TREE_LOOP), 需要循环调用直到返回空数组, 确保该区域内的所有节点均被移除
	 */
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

	/**
	 * 精确删除: 删除与 rect 区域重叠且 leaf 引用等于 obj 的节点
	 */
	private removeObj(rect: TSimpleRect, obj: RtreeItem): Array<TRtreeNodeItem> {
		const removedList: Array<TRtreeNodeItem> = removeSubtree(rect, obj, this._root, this._maxWidth, this._minWidth)
		return removedList
	}
}
