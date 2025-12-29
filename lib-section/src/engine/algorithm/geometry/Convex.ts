import { ArraySort } from '../../math/ArraySort'
import { HullPoint } from './HullPoint'
import { Vector2 } from './vector/Vector2'

export class Convex {
	public static reduce(hullPoints: Array<HullPoint>, start: number, len: number): Array<HullPoint> {
		const results: Array<HullPoint> = [hullPoints[start]]
		let prev: number = hullPoints[start].degree
		let end: number = start + len
		for (let i: number = start + 1; i < end; i++) {
			let cur: HullPoint = hullPoints[i]
			if (prev !== cur.degree) {
				results.push(cur)
				prev = cur.degree
			}
		}
		return results
	}

	public static pull(hullPoints: Array<HullPoint>): Array<Vector2> {
		let origin: Vector2 = null!
		for (let hp of hullPoints) {
			if (origin) {
				if (origin.y > hp.y || (origin.y === hp.y && origin.x > hp.x)) {
					origin = hp
				}
			} else {
				origin = hp
			}
		}
		if (origin === null) {
			throw new Error(`error hull-points.`)
		}
		let hps: Array<HullPoint> = new Array<HullPoint>(hullPoints.length)
		let cnt: number = 0
		for (let hp of hullPoints) {
			if (!hp.equalsWithVector2(origin)) {
				hps[cnt++] = new HullPoint(hp, origin)
			}
		}
		ArraySort.quickSort(hps, HullPoint.sortByDgreeDesc, 0, cnt)
		hps = Convex.reduce(hps, 0, cnt)
		if (hps.length === 1) {
			return [origin, hps[0]]
		}
		const results: Array<Vector2> = []
		results.push(origin)
		results.push(hps[0])
		for (let i: number = 0; i <= hps.length; i++) {
			let cur: Vector2 = null!
			if (i === hps.length) {
				cur = origin
			} else {
				cur = hps[i]
			}
			while (true) {
				let prev: Vector2 = results.pop()!
				if (typeof prev !== 'undefined') {
					let last: Vector2 = results[results.length - 1]
					if (Vector2.crossProd2(last.x, last.y, prev.x, prev.y, cur.x, cur.y) > 0) {
						results.push(prev, cur)
						break
					}
				} else {
					break
				}
			}
		}
		results.pop()
		return results
	}
}
