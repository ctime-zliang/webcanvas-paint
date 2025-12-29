import { Vector2 } from '../../engine/algorithm/geometry/vector/Vector2'
import { ESweep } from '../../engine/config/CommonProfile'
import { intersPP } from './intersection/Intersection'
import { CACHE } from './intersection/profile'
import { Line } from './primitives/Line'

export class ArcTransition {
	/**
	 * 已知不共线的三点坐标, 求圆弧参数
	 */
	public static threePoint2Arc(
		startPoint: Vector2,
		endPoint: Vector2,
		thridPoint: Vector2
	): {
		center: Vector2
		radius: number
		startAngle: number
		endAngle: number
		sweep: ESweep
	} {
		if (startPoint.equalsWithVector2(endPoint)) {
			if (thridPoint.equalsWithVector2(startPoint)) {
				const center: Vector2 = startPoint.add(new Vector2(0.001, 0))
				const radius: number = 0.001
				const startAngle: number = startPoint.getRadianByVector2(center)
				const endAngle: number = endPoint.getRadianByVector2(center)
				const sweep: ESweep = ESweep.CCW
				return { center, radius, startAngle, endAngle, sweep }
			}
			const center: Vector2 = startPoint.add(thridPoint).mul(0.5)
			const radius: number = thridPoint.distance(startPoint) / 2
			const startAngle: number = startPoint.getRadianByVector2(center)
			const endAngle: number = endPoint.getRadianByVector2(center)
			const sweep: ESweep = ESweep.CCW
			return { center, radius, startAngle, endAngle, sweep }
		}
		const direct1: Vector2 = endPoint.sub(thridPoint).normalize()
		const direct2: Vector2 = thridPoint.sub(startPoint).normalize()
		if (direct1.cross(direct2) === 0) {
			thridPoint.add(new Vector2(-direct1.y, direct1.x)).mul(0.01)
		}
		const A1: number = 2 * (endPoint.x - startPoint.x)
		const B1: number = 2 * (endPoint.y - startPoint.y)
		const C1: number = endPoint.x * endPoint.x + endPoint.y * endPoint.y - (startPoint.x * startPoint.x + startPoint.y * startPoint.y)
		const A2: number = 2 * (thridPoint.x - endPoint.x)
		const B2: number = 2 * (thridPoint.y - endPoint.y)
		const C2: number = thridPoint.x * thridPoint.x + thridPoint.y * thridPoint.y - (endPoint.x * endPoint.x + endPoint.y * endPoint.y)
		const x: number = (C1 * B2 - C2 * B1) / (A1 * B2 - A2 * B1)
		const y: number = (A1 * C2 - A2 * C1) / (A1 * B2 - A2 * B1)
		const center: Vector2 = new Vector2(x, y)
		const radius: number = center.distance(startPoint)
		const startAngle: number = startPoint.getRadianByVector2(center)
		const endAngle: number = endPoint.getRadianByVector2(center)
		const crossV: number = direct2.cross(direct1)
		const sweep: ESweep = crossV > 0 ? ESweep.CCW : ESweep.CW
		return { center, radius, startAngle, endAngle, sweep }
	}
	/**
	 * 已知圆弧起始坐标/结束坐标/旋转弧度, 求圆弧参数
	 */
	public static towPoint2Arc(
		startPoint: Vector2,
		endPoint: Vector2,
		angle: number
	): {
		center: Vector2
		radius: number
		startAngle: number
		endAngle: number
		sweep: ESweep
	} {
		const direct: Vector2 = endPoint.sub(startPoint)
		const v: Vector2 = new Vector2(-direct.y, direct.x).normalize()
		const angle2: number = Math.abs(angle) / 2
		let radius: number = 0
		if (angle2 !== 0) {
			radius = direct.length / 2 / Math.sin(angle2)
		} else {
			throw new Error(`can not represent circle.`)
		}
		let sweep: ESweep = undefined!
		let center: Vector2 = undefined!
		if (angle > 0) {
			sweep = ESweep.CCW
			center = endPoint.add(v.rotateSurround(Vector2.ORIGIN, angle2).mul(radius))
		} else {
			sweep = ESweep.CW
			center = startPoint.sub(v.rotateSurround(Vector2.ORIGIN, angle2).mul(radius))
		}
		const startAngle: number = startPoint.getRadianByVector2(center)
		const endAngle: number = endPoint.getRadianByVector2(center)
		return { center, radius, startAngle, endAngle, sweep }
	}

	/**
	 * 已知圆弧半径/圆弧中心点坐标/起始角度/结束角度, 求圆弧起始坐标/结束坐标
	 */
	public static angle2Point(
		center: Vector2,
		radius: number,
		startAngle: number,
		endAngle: number,
		sweep: ESweep
	): {
		startPoint: Vector2
		endPoint: Vector2
		angle: number
	} {
		const startPoint: Vector2 = center.add(new Vector2(Math.cos(startAngle), Math.sin(startAngle)).mul(radius))
		const endPoint: Vector2 = center.add(new Vector2(Math.cos(endAngle), Math.sin(endAngle)).mul(radius))
		const angle: number =
			sweep === ESweep.CCW ? (endAngle + Math.PI * 2 - startAngle) % Math.PI : (-(startAngle + Math.PI * 2 - endAngle) % Math.PI) * 2
		return { startPoint, endPoint, angle }
	}

	/**
	 * 已知圆弧起始坐标/结束坐标/起始点切线方向(视作与圆弧旋转方向一致), 求圆弧参数
	 */
	public static tangentPositionDirect2Arc(
		startPoint: Vector2,
		startPointDirect: Vector2,
		endPoint: Vector2,
		fixStart: boolean = true
	): {
		center: Vector2
		radius: number
		startAngle: number
		endAngle: number
		sweep: ESweep
	} {
		if (startPoint.equalsWithVector2(endPoint)) {
			const v: Vector2 = new Vector2(startPointDirect.y, -startPointDirect.x).normalize()
			const center: Vector2 = startPoint.add(v)
			const startAngle: number = startPoint.getRadianByVector2(center)
			const endAngle: number = startAngle + Math.PI * 2
			if (fixStart) {
				return {
					center,
					radius: 1,
					startAngle,
					endAngle,
					sweep: ESweep.CW,
				}
			}
			return {
				center,
				radius: 1,
				startAngle: endAngle,
				endAngle: startAngle,
				sweep: ESweep.CW,
			}
		}
		const start2end: Vector2 = endPoint.sub(startPoint)
		const cross: number = startPointDirect.cross(start2end)
		let sweep: ESweep = undefined!
		let v1: Vector2 = undefined!
		let v2: Vector2 = undefined!
		if (cross > 0) {
			sweep = ESweep.CCW
			v1 = new Vector2(-startPointDirect.y, startPointDirect.x).normalize()
			v2 = new Vector2(-start2end.y, start2end.x).normalize()
		} else {
			sweep = ESweep.CW
			v1 = new Vector2(startPointDirect.y, -startPointDirect.x).normalize()
			v2 = new Vector2(start2end.y, -startPointDirect.x).normalize()
		}
		const line1: Line = new Line(startPoint, startPoint.add(v1.mul(100000)))
		const center1: Vector2 = startPoint.add(endPoint).mul(0.5)
		const line2: Line = new Line(center1.sub(v2.mul(100000)), center1.add(v2.mul(100000)))
		const idx: number = intersPP(line1, line2)
		if (idx > 0) {
			const center: Vector2 = new Vector2(CACHE[0], CACHE[1])
			const radius: number = center.distance(startPoint)
			const startAngle: number = startPoint.getRadianByVector2(center)
			const endAngle: number = endPoint.getRadianByVector2(center)
			return {
				center,
				radius,
				startAngle,
				endAngle,
				sweep,
			}
		}
		const center: Vector2 = startPoint.add(v1.mul(100000))
		const radius: number = center.distance(startPoint)
		const startAngle: number = startPoint.getRadianByVector2(center)
		const endAngle: number = endPoint.getRadianByVector2(center)
		return {
			center,
			radius,
			startAngle,
			endAngle,
			sweep,
		}
	}
}
