import { Vector2 } from '../../../engine/algorithm/geometry/vector/Vector2'
import { intersPP } from '../intersection/Intersection'
import { CACHE } from '../intersection/profile'
import { Line } from '../primitives/Line'
import { Polyline } from '../primitives/Polyline'
import { PolylineGroup } from '../primitives/PolylineGroup'
import { Primitive } from '../primitives/Primitive'

export function selfIntersectionCheck(plg: Polyline | PolylineGroup): boolean {
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

function check(pl: Polyline): boolean {
	const getPoints = (idx: number, results: Array<Vector2>): Array<Vector2> => {
		for (let i: number = 0; i < idx; i += 2) {
			let point: Vector2 = new Vector2(CACHE[i], CACHE[i + 1])
			let diff: boolean = true
			for (let p of results) {
				if (p.distance2(point) < 1e-8) {
					diff = false
				}
			}
			if (diff) {
				results.push(point)
			}
		}
		return results
	}
	let pts: Array<Primitive> = []
	for (let i: number = 0; i < pl.primitives.length; i++) {
		if (pl.primitives[i] instanceof Line && pl.primitives[i].length < 1e-2) {
			continue
		}
		pts.push(pl.primitives[i])
	}
	let len: number = pts.length
	if (len === 2) {
		let pt1: Primitive = pts[0]
		let pt2: Primitive = pts[1]
		if (pt1 instanceof Line && pt2 instanceof Line) {
			if (pt1.endPoint.equalsWithVector2(pt2.startPoint) && pt2.endPoint.equalsWithVector2(pt1.startPoint)) {
				return true
			}
		}
		let idx: number = intersPP(pts[0], pts[1])
		for (let i: number = 0; i < idx; i += 2) {
			let point: Vector2 = new Vector2(CACHE[i], CACHE[i + 1])
			if (point.distance2(pts[0].startPoint) < 1e-8 || point.distance2(pts[0].endPoint) < 1e-8) {
				/* ... */
			} else if (point.distance2(pts[1].startPoint) < 1e-8 || point.distance2(pts[1].endPoint) < 1e-8) {
				/* ... */
			} else {
				return true
			}
		}
	} else if (len > 2) {
		for (let i: number = 0; i < len; i++) {
			let pt1: Primitive = pts[i]
			if (i + 1 < len) {
				let pt3: Primitive = pts[i + 1]
				let points: Array<Vector2> = [pt1.endPoint]
				let idx: number = intersPP(pt1, pt3)
				points = getPoints(idx, points)
				if (points.length > 1) {
					return true
				}
			}
			for (let j: number = i + 2; j < len; j++) {
				let pt2: Primitive = pts[j]
				let idx: number = intersPP(pt1, pt2)
				if (i === 0 && j === len - 1) {
					for (let k: number = 0; k < idx; k += 2) {
						let point: Vector2 = new Vector2(CACHE[k], CACHE[k + 1])
						if (point.distance(pt1.startPoint) > 1e-4) {
							return true
						}
					}
				} else {
					if (idx > 0) {
						return true
					}
				}
			}
		}
	}
	return false
}
