import { BBox2, BBox2Fac } from '../../engine/algorithm/geometry/bbox/BBox2'
import { Vector2 } from '../../engine/algorithm/geometry/vector/Vector2'
import { ESweep } from '../../engine/config/CommonProfile'

export class D2CircleToolkit {
	/**
	 * 非共线三点计算圆参数
	 */
	public static calculateCircleProfileByByThreePoint(
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
		const G: number = (x2 - x1) * (y3 - y1) - (x3 - x1) * (y2 - y1)
		if (G === 0) {
			throw new Error('three points are collinear, and it is impossible to determine a unique circle.')
		}
		const [centerX, centerY]: [number, number] = [
			((x1 * x1 + y1 * y1) * (y2 - y3) + (x2 * x2 + y2 * y2) * (y3 - y1) + (x3 * x3 + y3 * y3) * (y1 - y2)) / (2 * G),
			((x1 * x1 + y1 * y1) * (x3 - x2) + (x2 * x2 + y2 * y2) * (x1 - x3) + (x3 * x3 + y3 * y3) * (x2 - x1)) / (2 * G),
		]
		const radius: number = Math.sqrt((centerX - x1) * (centerX - x1) + (centerY - y1) * (centerY - y1))
		const sweep: ESweep = G > 0 ? ESweep.CW : ESweep.CCW
		return {
			centerPoint: new Vector2(centerX, centerY),
			radius: radius,
			sweep: sweep,
		}
	}

	/**
	 * 点与圆的重叠关系
	 */
	public static isPointOnCircle(point: Vector2, radius: number, circleCenter: Vector2, strokeWidth: number, isFill: boolean): boolean {
		const circleDirLine: Vector2 = point.sub(circleCenter)
		const [isOuter, isInner]: [boolean, boolean] = [
			circleDirLine.length > radius + strokeWidth / 2,
			circleDirLine.length < radius - strokeWidth / 2,
		]
		if (isOuter) {
			return false
		} else if (isInner) {
			if (!isFill) {
				return false
			}
			return true
		}
		return true
	}

	public static getCircleBBox2(center: Vector2, radius: number, storkeWidth: number): BBox2 {
		if (radius <= 0) {
			return null!
		}
		const bbox2Fac: BBox2Fac = new BBox2Fac()
		bbox2Fac.extendByVector2(center).extendByOffset(radius + storkeWidth / 2)
		return bbox2Fac.build()
	}
}
