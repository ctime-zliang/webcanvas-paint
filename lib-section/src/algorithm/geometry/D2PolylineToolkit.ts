import { Vector2 } from '../../engine/algorithm/geometry/vector/Vector2'
import { ESweep } from '../../engine/config/CommonProfile'
import { DoubleKit } from '../../engine/math/Doublekit'
import { D2ArcToolkit } from './D2ArcToolkit'
import { D2Intersection } from './D2Intersection'
import { D2LineToolkit } from './D2LineToolkit'
import { Arc } from './primitives/Arc'
import { Line } from './primitives/Line'
import { Polyline } from './primitives/Polyline'
import { PolylineGroup } from './primitives/PolylineGroup'
import { Primitive } from './primitives/Primitive'

function equals(p1: Vector2, p2: Vector2, minDis: number): boolean {
	return p1.distanceSquare(p2) < minDis
}

function breakPrimitive(
	item: Primitive,
	intersection: Vector2
): {
	prev: Primitive
	next: Primitive
} {
	let [prev, next]: [Primitive, Primitive] = [null!, null!]
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

function check(pl: Polyline): boolean {
	const getPoints = (results: Array<Vector2>, points: Array<Vector2>): Array<Vector2> => {
		for (let i: number = 0; i < points.length; i += 2) {
			const point: Vector2 = points[i]
			let diff: boolean = true
			for (let p of results) {
				if (p.distanceSquare(point) < 1e-8) {
					diff = false
				}
			}
			if (diff) {
				results.push(point)
			}
		}
		return results
	}
	const pts: Array<Primitive> = []
	for (let i: number = 0; i < pl.primitives.length; i++) {
		if (pl.primitives[i] instanceof Line && pl.primitives[i].length < 1e-2) {
			continue
		}
		pts.push(pl.primitives[i])
	}
	const len: number = pts.length
	if (len === 2) {
		const pt1: Primitive = pts[0]
		const pt2: Primitive = pts[1]
		if (pt1 instanceof Line && pt2 instanceof Line) {
			if (pt1.endPoint.equalsWithVector2(pt2.startPoint) && pt2.endPoint.equalsWithVector2(pt1.startPoint)) {
				return true
			}
		}
		let intersRes: {
			count: number
			points: Array<Vector2>
		} = D2Intersection.getIntersectionsOfPrimitives(pts[0], pts[1])
		for (let i: number = 0; i < intersRes.points.length; i++) {
			let point: Vector2 = intersRes.points[i]
			if (point.distanceSquare(pts[0].startPoint) < 1e-8 || point.distanceSquare(pts[0].endPoint) < 1e-8) {
				/* ... */
			} else if (point.distanceSquare(pts[1].startPoint) < 1e-8 || point.distanceSquare(pts[1].endPoint) < 1e-8) {
				/* ... */
			} else {
				return true
			}
		}
	} else if (len > 2) {
		for (let i: number = 0; i < len; i++) {
			const pt1: Primitive = pts[i]
			if (i + 1 < len) {
				const pt3: Primitive = pts[i + 1]
				const intersRes: {
					count: number
					points: Array<Vector2>
				} = D2Intersection.getIntersectionsOfPrimitives(pt1, pt3)
				let points: Array<Vector2> = [pt1.endPoint]
				points = getPoints(points, intersRes.points)
				if (points.length > 1) {
					return true
				}
			}
			for (let j: number = i + 2; j < len; j++) {
				const pt2: Primitive = pts[j]
				const intersRes: {
					count: number
					points: Array<Vector2>
				} = D2Intersection.getIntersectionsOfPrimitives(pt1, pt2)
				if (i === 0 && j === len - 1) {
					for (let k: number = 0; k < intersRes.points.length; k++) {
						let point: Vector2 = intersRes.points[k]
						if (point.distance(pt1.startPoint) > 1e-4) {
							return true
						}
					}
				} else {
					if (intersRes.count > 0) {
						return true
					}
				}
			}
		}
	}
	return false
}

export class D2PolylineToolkit {
	/**
	 * 判断折线 polyline 的多个点集是否共线
	 */
	public static isCollinearOfPolyline(pl: Polyline): boolean {
		const pointArr: Array<Vector2> = []
		pl.points(1, (p: Vector2): void => {
			pointArr.push(p)
		})
		for (let i: number = 0; i < pl.primitives.length; i++) {
			let pt: Primitive = pl.primitives[i]
			let nextPt: Primitive = pl.primitives[i + 1]
			while (nextPt && Vector2.isSameSlope(pt.endPoint.sub(pt.startPoint), nextPt.endPoint.sub(nextPt.startPoint))) {
				i++
				pt = pl.primitives[i]
				nextPt = pl.primitives[i + 1]
			}
			return i == pl.primitives.length - 1
		}
		return false
	}

	/**
	 * 判断点 point 是否在折线 polyline 上
	 */
	public static isPointAtPolyline(pl: Polyline, point: Vector2): boolean {
		return pl.primitives.some((item: Primitive): boolean => {
			return D2LineToolkit.isPointOnSegment(point, item.startPoint, item.endPoint)
		})
	}

	public static getPolygonSweep(points: Array<Vector2>): boolean {
		if (points.length <= 2) {
			throw new Error(`unable to determine the direction of rotation.`)
		}
		const len: number = points.length
		let sum: number = 0
		for (let i: number = 0; i < len - 1; i++) {
			const p1: Vector2 = points[i]
			const p2: Vector2 = points[i + 1]
			sum += (p2.x + p1.x) * (p2.y - p1.y)
		}
		const [pp0, ppn]: [Vector2, Vector2] = [points[0], points[len - 1]]
		sum += (pp0.x + ppn.x) * (pp0.y - ppn.y)
		return sum > 0
	}

	public static scanPolyline(pl: Polyline): boolean {
		const mod: number = pl.primitives[0] instanceof Arc ? pl.primitives[0].sweepRadian % (Math.PI * 2) : null!
		if (pl.primitives.length === 1 && pl.primitives[0] instanceof Arc && (DoubleKit.eq(mod, 0) || DoubleKit.eq(Math.abs(mod), 0))) {
			if (pl.primitives[0].sweep === ESweep.CCW) {
				return true
			}
			return false
		}
		const points: Array<Vector2> = []
		pl.points(0.1, (p: Vector2): void => {
			points.push(p)
		})
		return D2PolylineToolkit.getPolygonSweep(points)
	}

	public static isSelfIntersection(plg: Polyline | PolylineGroup): boolean {
		if (plg instanceof Polyline) {
			return check(plg)
		}
		if (plg instanceof PolylineGroup) {
			const tag: boolean = plg.polylines.some((pl: Polyline): boolean => {
				return check(pl)
			})
			if (tag) {
				return true
			}
			return false
		}
		return false
	}

	/**
	 * 移除 polyline 中的回路
	 *      在存在闭合的区域拆分
	 */

	public static polylineRemoval(pl: Polyline): Array<Polyline> {
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
				const intersRes: {
					count: number
					points: Array<Vector2>
				} = D2Intersection.getIntersectionsOfPrimitives(pt1, pt2)
				loop2: for (let index: number = 0; index < intersRes.points.length; index++) {
					const intersection: Vector2 = intersRes.points[index]
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
					if (D2LineToolkit.isPointOnLine(last, first.startPoint)) {
						return [Polyline.build2([last])]
					} else if (D2LineToolkit.isPointOnLine(first, last.endPoint)) {
						return [Polyline.build2([first])]
					}
				}
			}
			return pls
		}
		const pls2: Array<Polyline> = []
		for (let i: number = 0; i < pls.length; i++) {
			pls2.push(...D2PolylineToolkit.polylineRemoval(pls[i]))
		}
		return pls2
	}

	public static breakPolyline(pl: Polyline, breakPoint: Vector2): Array<Polyline> {
		const pts: Array<Primitive> = pl.primitives
		let isPointOnPolyline: boolean = false
		let idx: number = 0
		for (; idx < pts.length; idx++) {
			const pt: Primitive = pts[idx]
			if (pt instanceof Line) {
				if (D2LineToolkit.isPointOnLine(pt, breakPoint)) {
					isPointOnPolyline = true
					break
				}
			}
			if (pt instanceof Arc) {
				if (D2ArcToolkit.isPointOnArc(pt, breakPoint)) {
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
				const [prev, next]: [Array<Primitive>, Array<Primitive>] = [pts.slice(0, idx), pts.slice(idx)]
				return [Polyline.build2(prev), Polyline.build2(next)]
			}
			if (pt.endPoint.equalsWithVector2(breakPoint)) {
				if (idx === pts.length - 1) {
					return [pl]
				}
				const [prev, next]: [Array<Primitive>, Array<Primitive>] = [pts.slice(0, idx + 1), pts.slice(idx + 1)]
				return [Polyline.build2(prev), Polyline.build2(next)]
			}
			const [prev, next]: [Array<Primitive>, Array<Primitive>] = [pts.slice(0, idx), pts.slice(idx + 1)]
			if (pt instanceof Line) {
				const [prevEnd, nextStart]: [Line, Line] = [new Line(pt.startPoint, breakPoint), new Line(breakPoint, pt.endPoint)]
				prev.push(prevEnd)
				next.unshift(nextStart)
			} else if (pt instanceof Arc) {
				const [prevEnd, nextStart]: [Arc, Arc] = [
					Arc.build4(pt.startPoint, breakPoint, pt.centerPoint, pt.rx, pt.ry, pt.sweep),
					Arc.build4(breakPoint, pt.endPoint, pt.centerPoint, pt.rx, pt.ry, pt.sweep),
				]
				prev.push(prevEnd)
				next.unshift(nextStart)
			}
			return [Polyline.build2(prev), Polyline.build2(next)]
		}
		return [pl]
	}

	public static isPolylineClosed(pl: Polyline): boolean {
		if (pl.primitives.length > 0 && pl.primitives[0].startPoint.equalsWithVector2(pl.primitives[pl.primitives.length - 1].endPoint)) {
			return true
		}
		return false
	}

	public static intersPolyline(m: Polyline, n: Polyline): boolean {
		const [mps, nps]: [Array<Primitive>, Array<Primitive>] = [m.primitives, n.primitives]
		const [minPs, maxPs]: [Array<Primitive>, Array<Primitive>] = [mps.length > nps.length ? nps : mps, mps.length > nps.length ? mps : nps]
		let inter: boolean = false
		minPs.some((p1: Primitive): boolean => {
			maxPs.some((p2: Primitive): boolean => {
				inter = D2Intersection.getIntersectionsOfPrimitives(p1, p2).count > 0
				return inter
			})
			return inter
		})
		return inter
	}
}
