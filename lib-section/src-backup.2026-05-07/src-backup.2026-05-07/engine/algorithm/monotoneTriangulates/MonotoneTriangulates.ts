import { TD2EdgeItem, TD2PointItem, TD2TriangleIndicesItem } from '../../types/Common'
import { orient } from '../geometry/Orients'

/**
 * 单调多边形
 * 		指相对于某一条直线(称为单调方向), 多边形的外轮廓与该直线的交点数量不超过两个
 */

enum EEventNodeType {
	POINT = 0,
	END = 1,
	START = 2,
}

/**
 * 由两个单调多边形组成的部分凸包片段
 */
class PartialHull {
	private _a: TD2PointItem
	private _b: TD2PointItem
	private _idx: number
	/**
	 * 上边界点索引列表, 记录当前 hull 的上半部边界点顺序
	 * 		对于任意的新的扫描点 P, 会检查该列表中最后两个点与 P 是否可以构成顺时针方向三角形
	 */
	private _upperIndices: Array<number>
	/**
	 * 下边界点索引列表, 记录当前 hull 的下半部边界点顺序
	 * 		对于任意的新的扫描点 P, 会检查该列表中最后两个点与 P 是否可以构成逆时针方向三角形
	 */
	private _lowerIndices: Array<number>
	constructor(a: TD2PointItem, b: TD2PointItem, idx: number, upperIndices: Array<number>, lowerIndices: Array<number>) {
		this._a = a
		this._b = b
		this._idx = idx
		this._upperIndices = upperIndices
		this._lowerIndices = lowerIndices
	}

	public get a(): TD2PointItem {
		return this._a
	}
	public set a(value: TD2PointItem) {
		this._a = value
	}

	public get b(): TD2PointItem {
		return this._b
	}
	public set b(value: TD2PointItem) {
		this._b = value
	}

	public get idx(): number {
		return this._idx
	}
	public set idx(value: number) {
		this._idx = value
	}

	public get upperIndices(): Array<number> {
		return this._upperIndices
	}
	public set upperIndices(value: Array<number>) {
		this._upperIndices = value
	}

	public get lowerIndices(): Array<number> {
		return this._lowerIndices
	}
	public set lowerIndices(value: Array<number>) {
		this._lowerIndices = value
	}
}

/**
 * 扫线事件
 */
class Event {
	private _a: TD2PointItem
	private _b: TD2PointItem
	private _type: EEventNodeType
	private _idx: number
	constructor(a: TD2PointItem, b: TD2PointItem, type: EEventNodeType, idx: number) {
		this._a = a
		this._b = b
		this._type = type
		this._idx = idx
	}

	public get a(): TD2PointItem {
		return this._a
	}
	public set a(value: TD2PointItem) {
		this._a = value
	}

	public get b(): TD2PointItem {
		return this._b
	}
	public set b(value: TD2PointItem) {
		this._b = value
	}

	public get type(): EEventNodeType {
		return this._type
	}
	public set type(value: EEventNodeType) {
		this._type = value
	}

	public get idx(): number {
		return this._idx
	}
	public set idx(value: number) {
		this._idx = value
	}

	public createSwaped(): Event {
		const a: TD2PointItem = this.a
		const b: TD2PointItem = this._b
		return new Event([...b], [...a], this.type, this.idx)
	}
}

function findSplit(hull: PartialHull, edgeEvent: Event): number {
	let d: number = undefined!
	if (edgeEvent.a[0] >= hull.a[0]) {
		d = orient(hull.a, hull.b, edgeEvent.a)
	} else {
		d = orient(edgeEvent.b, edgeEvent.a, hull.a)
	}
	if (d) {
		return d
	}
	if (edgeEvent.b[0] < hull.b[0]) {
		d = orient(hull.a, hull.b, edgeEvent.b)
	} else {
		d = orient(edgeEvent.b, edgeEvent.a, hull.b)
	}
	return d || hull.idx - edgeEvent.idx
}

function queryLtHullsByOrient(hulls: Array<PartialHull>, point: TD2PointItem): number {
	for (let i: number = hulls.length - 1; i >= 0; i--) {
		const hull: PartialHull = hulls[i]
		if (orient(hull.a, hull.b, point) < 0) {
			return i
		}
	}
	return -1
}

function queryLeHullsByFindSplit(hulls: Array<PartialHull>, edgeEvent: Event): number {
	for (let i: number = hulls.length - 1; i >= 0; i--) {
		const hull: PartialHull = hulls[i]
		if (findSplit(hull, edgeEvent) <= 0) {
			return i
		}
	}
	return -1
}

function queryEqHullsByFindSplit(hulls: Array<PartialHull>, edgeEvent: Event): number {
	for (let i: number = hulls.length - 1; i >= 0; i--) {
		const hull: PartialHull = hulls[i]
		if (findSplit(hull, edgeEvent) === 0) {
			return i
		}
	}
	return -1
}

function queryGtHullsByOrient(hulls: Array<PartialHull>, point: TD2PointItem): number {
	for (let i: number = 0; i < hulls.length; i++) {
		const hull: PartialHull = hulls[i]
		if (orient(hull.a, hull.b, point) > 0) {
			return i
		}
	}
	return hulls.length
}

function addPoint(cells: Array<TD2TriangleIndicesItem>, hulls: Array<PartialHull>, points: Array<TD2PointItem>, pointEvent: Event) {
	const p: TD2PointItem = pointEvent.a
	const pointEventIndex: number = pointEvent.idx
	/**
	 * 对于定点 p, 需要在 hulls 中找出最后一个满足 [hull.a, hull.b, p] 的绕转方向为逆时针方向的 hull[n] 项对应的索引
	 * 		未找到时返回 -1
	 */
	const lo: number = queryLtHullsByOrient(hulls, p)
	/**
	 * 对于定点 p, 需要在 hulls 中找出第一个满足 [hull.a, hull.b, p] 的绕转方向为顺时针方向的 hull[n] 项对应的索引
	 * 		未找到时返回 hulls.length
	 */
	const hi: number = queryGtHullsByOrient(hulls, p)
	/**
	 * 遍历 [lo, hi) 索引范围内的 hull[n]
	 * 该区间内的 hull[n] 均有可能与 P 点构成有效的三角剖分
	 */
	for (let i: number = lo; i < hi; i++) {
		let m: number = 0
		/* ... */
		const upperIndices: Array<number> = hulls[i].upperIndices
		m = upperIndices.length
		while (m > 1 && orient(points[upperIndices[m - 2]], points[upperIndices[m - 1]], p) < 0) {
			cells.push([upperIndices[m - 2], upperIndices[m - 1], pointEventIndex])
			m -= 1
		}
		upperIndices.length = m
		/**
		 * 需要将当前坐标点的索引保存到 hull[n] 的上边界点索引列表
		 */
		upperIndices.push(pointEventIndex)
		const lowerIndices: Array<number> = hulls[i].lowerIndices
		m = lowerIndices.length
		while (m > 1 && orient(points[lowerIndices[m - 2]], points[lowerIndices[m - 1]], p) > 0) {
			cells.push([lowerIndices[m - 1], lowerIndices[m - 2], pointEventIndex])
			m -= 1
		}
		lowerIndices.length = m
		/**
		 * 需要将当前坐标点的索引保存到 hull[n] 的下边界点索引列表
		 */
		lowerIndices.push(pointEventIndex)
	}
}

function splitHulls(hulls: Array<PartialHull>, edgeEvent: Event): void {
	/**
	 * 对于边事件 edgeEvent, 需要在 hulls 中找出最后一个满足 findSplit(hull, edgeEvent) <= 0 的 hull[n] 项对应的索引
	 * 		未找到时返回 -1
	 * 即在 hulls 中找到最后一个位于 edgeEvent 左侧或下方的 hull[n] 项的索引
	 *
	 * 在该索引位置的下一个邻接位置插入一个新的 hull
	 * 设置新 hull 的上下边界点索引列表
	 * 		将当前 hull 的上边界点索引列表赋值给新 hull 的上边界点索引列表
	 * 		将当前 hull 的上边界点索引列表的最后一项作为新 hull 的下边界点索引列表唯一成员
	 * 更新当前 hull 的上边界点索引列表
	 */
	let splitIdx: number = queryLeHullsByFindSplit(hulls, edgeEvent)
	let hull: PartialHull = hulls[splitIdx]
	let upperIndices: Array<number> = hull.upperIndices
	let lastIndice: number = upperIndices[upperIndices.length - 1]
	hulls.splice(splitIdx + 1, 0, new PartialHull(edgeEvent.a, edgeEvent.b, edgeEvent.idx, [...upperIndices], [lastIndice]))
	hull.upperIndices = [lastIndice]
}

function mergeHulls(hulls: Array<PartialHull>, edgeEvent: Event): void {
	const sw: Event = edgeEvent.createSwaped()
	/**
	 * 对于边事件 edgeEvent, 需要在 hulls 中找出最后一个满足 findSplit(hull, edgeEvent(swaped)) == 0 的 hull[n] 项对应的索引
	 * 		未找到时返回 -1
	 *  即在 hulls 中找到最后一个与 edgeEvent 共线的 hull[n] 项的索引
	 *
	 * 在 hulls 中删除该 hull[n]
	 * 更新前一个 hull[n - 1] 的上边界点索引列表为当前 hull[n] 的上边界点索引列表
	 */
	let mergeIdx: number = queryEqHullsByFindSplit(hulls, sw)
	let nowHull: PartialHull = hulls[mergeIdx]
	let prevHull: PartialHull = hulls[mergeIdx - 1]
	hulls.splice(mergeIdx, 1)
	prevHull.upperIndices = nowHull.upperIndices
}

/**
 * 对由 points 构成的最小凸多边形的三角剖分, 返回三角形顶点索引列表
 */
export function monotoneTriangulates(points: Array<TD2PointItem>, edges: Array<TD2EdgeItem>): Array<TD2TriangleIndicesItem> {
	/**
	 * 构建"点事件"与"边事件"
	 */
	const events: Array<Event> = []
	for (let i: number = 0; i < points.length; i++) {
		events.push(new Event(points[i], null!, EEventNodeType.POINT, i))
	}
	for (let i: number = 0; i < edges.length; i++) {
		const p0: TD2PointItem = points[edges[i][0]]
		const p1: TD2PointItem = points[edges[i][1]]
		if (p0[0] < p1[0]) {
			events.push(new Event(p0, p1, EEventNodeType.START, i))
			events.push(new Event(p1, p0, EEventNodeType.END, i))
		} else if (p0[0] > p1[0]) {
			events.push(new Event(p1, p0, EEventNodeType.START, i))
			events.push(new Event(p0, p1, EEventNodeType.END, i))
		}
	}
	/**
	 * 扫线事件排序对比
	 * 		- 按坐标点排序
	 * 		- 按事件类型排序
	 * 		- 按围绕顺序排序
	 * 			按逆时针围绕
	 * 		- 按索引排序
	 *
	 * 对事件列表进行排序
	 * 		排序前:
	 * 			数组可直接被分成两部分: 点事件 + 边事件
	 * 		排序后:
	 * 			按点事件对应的点坐标从小到大排序
	 * 			按照 <点事件, 与该点相连的边对应的边事件 1, 与该点相连的边对应的边事件 2, ...> 分组依次排序
	 * 				在该分组中, <点 P, P 的边事件 1 对应的点, P 的边事件 2 对应的点>的围绕方向为逆时针
	 */
	events.sort((a: Event, b: Event): number => {
		let d: number = a.a[0] - b.a[0] || a.a[1] - b.a[1] || a.type - b.type
		if (d) {
			return d
		}
		if (a.type !== EEventNodeType.POINT) {
			d = orient(a.a, a.b, b.b)
			if (d) {
				return d
			}
		}
		return a.idx - b.idx
	})
	/**
	 * 最"左"侧的点对应的 X 坐标值
	 * 		增设一个极小偏移值
	 *
	 * 此部分用于构建一个初始"凸包"边, 该"凸包"边并不存在于当前的坐标点列表中
	 */
	const minX: number = events[0].a[0] - (1 + Math.abs(events[0].a[0])) * Math.pow(2, -52)
	const hulls: Array<PartialHull> = [new PartialHull([minX, 1], [minX, 0], -1, [], [])]
	const cells: Array<TD2TriangleIndicesItem> = []
	for (let i: number = 0, numEvents = events.length; i < numEvents; i++) {
		if (events[i].type === EEventNodeType.POINT) {
			addPoint(cells, hulls, points, events[i])
			continue
		}
		if (events[i].type === EEventNodeType.START) {
			splitHulls(hulls, events[i])
			continue
		}
		if (events[i].type === EEventNodeType.END) {
			mergeHulls(hulls, events[i])
			continue
		}
	}
	return cells
}
