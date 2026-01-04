import { Vector2 } from '../../engine/algorithm/geometry/vector/Vector2'
import { ESweep } from '../../engine/config/CommonProfile'

export class D2CircleTransform {
	/**
	 * 非共线三点计算圆参数
	 */
	static calculateCircleProfileByByThreePoint(
		startPoint: Vector2,
		endPoint: Vector2,
		thirdPoint: Vector2
	): {
		centerPoint: Vector2
		radius: number
		sweep: ESweep
	} {
		const { x: x1, y: y1 } = startPoint
		const { x: x2, y: y2 } = endPoint
		const { x: x3, y: y3 } = thirdPoint
		// const V1X: number = x2 - x1
		// const V1Y: number = y2 - y1
		// const V2X: number = x3 - x1
		// const V2Y: number = y3 - y1
		const G: number = (x2 - x1) * (y3 - y1) - (x3 - x1) * (y2 - y1)
		if (G === 0) {
			throw new Error('three points are collinear, and it is impossible to determine a unique circle.')
		}
		const d: number = 2 * G
		const centerX: number = ((x1 * x1 + y1 * y1) * (y2 - y3) + (x2 * x2 + y2 * y2) * (y3 - y1) + (x3 * x3 + y3 * y3) * (y1 - y2)) / d
		const centerY: number = ((x1 * x1 + y1 * y1) * (x3 - x2) + (x2 * x2 + y2 * y2) * (x1 - x3) + (x3 * x3 + y3 * y3) * (x2 - x1)) / d
		const radius: number = Math.sqrt((centerX - x1) * (centerX - x1) + (centerY - y1) * (centerY - y1))
		const sweep: ESweep = G > 0 ? ESweep.CW : ESweep.CCW
		return {
			centerPoint: new Vector2(centerX, centerY),
			radius: radius,
			sweep: sweep,
		}
	}
}
