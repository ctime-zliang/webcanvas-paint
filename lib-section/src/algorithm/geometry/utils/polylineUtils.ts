import { Vector2 } from '../../../engine/algorithm/geometry/vector/Vector2'
import { intersLP, intersPP } from '../intersection/Intersection'
import { CACHE } from '../intersection/profile'
import { isPointOnArc } from '../intersection/utils'
import { Arc } from '../primitives/Arc'
import { Line } from '../primitives/Line'
import { Polyline } from '../primitives/Polyline'
import { Primitive } from '../primitives/Primitive'

function equals(p1: Vector2, p2: Vector2, minDis: number): boolean {
	return p1.distance2(p2) < minDis
}

function breakPrimitive(
	item: Primitive,
	intersection: Vector2
): {
	prev: Primitive
	next: Primitive
} {
	let prev: Primitive = null!
	let next: Primitive = null!
	if (item instanceof Line) {
		prev = new Line(item.startPoint, intersection)
		next = new Line(intersection, item.endPoint)
		return { prev, next }
	}
	if (item instanceof Arc) {
		prev = Arc.build4(item.startPoint, intersection, item.centerPoint, item.rx, item.ry, item.sweep)
		next = Arc.build4(intersection, item.endPoint, item.centerPoint, item.rx, item.ry, item.sweep)
		return { prev, next }
	}
	return null!
}

/**
 * 移除 polyline 中的回路
 *      在存在闭合的区域拆分
 */
export function polylineRemoval(pl: Polyline): Array<Polyline> {
	const pts: Array<Primitive> = pl.primitives
	const len: number = pts.length
	if (len <= 1) {
		return [pl]
	}
	const pls: Array<Polyline> = [pl]
	const minDis2: number = 1e-8
	let hasClose: boolean = pl.isClose(8)
	loop1: for (let i: number = 0; i < len - 1; i++) {
		for (let j: number = i + 1; j < len; j++) {
			const pt1: Primitive = pts[i]
			const pt2: Primitive = pts[j]
			const cacheLen: number = intersPP(pt1, pt2)
			loop2: for (let index: number = 0; index < cacheLen; index += 2) {
				const intersection: Vector2 = new Vector2(CACHE[index], CACHE[index + 1])
				if (hasClose && i === 0 && j === len - 1 && equals(intersection, pt1.startPoint, minDis2)) {
					/**
					 * 首尾连接点
					 */
				} else if (equals(intersection, pt1.endPoint, minDis2) && equals(intersection, pt2.startPoint, minDis2)) {
					/**
					 * 相邻连接点
					 */
				} else {
					const place: number = 5
					if (
						pt1 instanceof Arc &&
						pt2 instanceof Arc &&
						(pt1.startPoint.equalsWithVector2(intersection, place) ||
							pt1.endPoint.equalsWithVector2(intersection, place) ||
							pt2.startPoint.equalsWithVector2(intersection, place) ||
							pt2.endPoint.equalsWithVector2(intersection, place))
					) {
						pls.length = 0
						pls.push(Polyline.build2(pts.slice(0, i + 1)))
						pls.push(Polyline.build2(pts.slice(i + 1)))
						break loop1
					}
					pls.length = 0
					const brk1: {
						prev: Primitive
						next: Primitive
					} = breakPrimitive(pt1, intersection)
					const brk2: {
						prev: Primitive
						next: Primitive
					} = breakPrimitive(pt2, intersection)
					pls.push(Polyline.build2(pts.slice(0, i).concat(brk1.prev, brk2.next, pts.slice(j + 1))))
					pls.push(Polyline.build2(([] as Array<Primitive>).concat(brk1.next, pts.slice(i + 1, j), brk2.prev)))
					break loop1
				}
			}
		}
	}
	if (pls.length === 1) {
		if (pls[0].primitives.length === 2) {
			const first: Primitive = pls[0].primitives[0]
			const last: Primitive = pls[0].primitives[0]
			if (first instanceof Line && last instanceof Line) {
				if (intersLP(last, first.startPoint)) {
					return [Polyline.build2([last])]
				} else if (intersLP(first, last.endPoint)) {
					return [Polyline.build2([first])]
				}
			}
		}
		return pls
	}
	const pls2: Array<Polyline> = []
	for (let i: number = 0; i < pls.length; i++) {
		pls2.push(...polylineRemoval(pls[i]))
	}
	return pls2
}

/**
 * 在指定位置打断 polyline
 */
export function breakPolyline(pl: Polyline, breakPoint: Vector2): Array<Polyline> {
	const pts: Array<Primitive> = pl.primitives
	let isPointOnPolyline: boolean = false
	let idx: number = 0
	for (; idx < pts.length; idx++) {
		const pt: Primitive = pts[idx]
		if (pt instanceof Line) {
			if (intersLP(pt, breakPoint)) {
				isPointOnPolyline = true
				break
			}
		}
		if (pt instanceof Arc) {
			if (isPointOnArc(pt, breakPoint)) {
				isPointOnPolyline = true
				break
			}
		}
	}
	if (isPointOnPolyline) {
		const pt: Primitive = pts[idx]
		if (pt.startPoint.equalsWithVector2(breakPoint)) {
			if (idx === 0) {
				return [pl]
			}
			const prev: Array<Primitive> = pts.slice(0, idx)
			const next: Array<Primitive> = pts.slice(idx)
			return [Polyline.build2(prev), Polyline.build2(next)]
		}
		if (pt.endPoint.equalsWithVector2(breakPoint)) {
			if (idx === pts.length - 1) {
				return [pl]
			}
			const prev: Array<Primitive> = pts.slice(0, idx + 1)
			const next: Array<Primitive> = pts.slice(idx + 1)
			return [Polyline.build2(prev), Polyline.build2(next)]
		}
		const prev: Array<Primitive> = pts.slice(0, idx)
		const next: Array<Primitive> = pts.slice(idx + 1)
		if (pt instanceof Line) {
			const prevEnd: Line = new Line(pt.startPoint, breakPoint)
			const nextStart: Line = new Line(breakPoint, pt.endPoint)
			prev.push(prevEnd)
			next.unshift(nextStart)
		} else if (pt instanceof Arc) {
			const prevEnd: Arc = Arc.build4(pt.startPoint, breakPoint, pt.centerPoint, pt.rx, pt.ry, pt.sweep)
			const nextStart: Arc = Arc.build4(breakPoint, pt.endPoint, pt.centerPoint, pt.rx, pt.ry, pt.sweep)
			prev.push(prevEnd)
			next.unshift(nextStart)
		}
		return [Polyline.build2(prev), Polyline.build2(next)]
	}
	return [pl]
}

export function isPolylineClosed(pl: Polyline): boolean {
	if (pl.primitives.length > 0 && pl.primitives[0].startPoint.equalsWithVector2(pl.primitives[pl.primitives.length - 1].endPoint)) {
		return true
	}
	return false
}
