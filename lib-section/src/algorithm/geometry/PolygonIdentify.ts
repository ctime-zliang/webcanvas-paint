import { Vector2 } from '../../engine/algorithm/geometry/vector/Vector2'

export class PolygonIdentify {
	public static getPolygonSweep(points: Array<Vector2>): boolean {
		if (points.length <= 2) {
			throw new Error(`unable to determine the direction of rotation.`)
		}
		let sum: number = 0
		let len: number = points.length
		for (let i: number = 0; i < len - 1; i++) {
			const p1: Vector2 = points[i]
			const p2: Vector2 = points[i + 1]
			sum += (p2.x + p1.x) * (p2.y - p1.y)
		}
		let pp0: Vector2 = points[0]
		let ppn: Vector2 = points[len - 1]
		sum += (pp0.x + ppn.x) * (pp0.y - ppn.y)
		return sum > 0
	}
}
