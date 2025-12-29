import { Vector2 } from '../../../engine/algorithm/geometry/vector/Vector2'
import { ESweep } from '../../../engine/config/CommonProfile'

/**
 * 输入一个预设为圆弧中点的坐标点, 返回修改后的圆弧参数
 */
export function setArcMidPoint(
	point: Vector2,
	oldStartPoint: Vector2,
	oldEndPoint: Vector2,
	oldMidPoint: Vector2,
	oldSweep: ESweep
): {
	startAngle: number
	endAngle: number
	center: Vector2
	radius: number
	sweep: ESweep
} {
	const result: {
		startAngle: number
		endAngle: number
		center: Vector2
		radius: number
		sweep: ESweep
	} = {
		center: undefined!,
		startAngle: undefined!,
		endAngle: undefined!,
		radius: 0,
		sweep: undefined!,
	}
	let direct: Vector2 = oldEndPoint.sub(oldStartPoint)
	let l: Vector2 = undefined!
	if (oldSweep === ESweep.CCW) {
		l = new Vector2(-direct.y, direct.x).normalize()
	} else {
		l = new Vector2(direct.y, -direct.x).normalize()
	}
	let midPoint2Point: Vector2 = point.sub(oldMidPoint)
	let delta: Vector2 = l.mul(midPoint2Point.dot(l))
	let newMid: Vector2 = oldMidPoint.add(delta)
	let length2: number = oldEndPoint.distance2(oldStartPoint)
	let distance: number = Math.sqrt(newMid.distance2(oldStartPoint) - oldEndPoint.distance2(oldStartPoint) / 4)
	if (distance < 0.1 || Number.isNaN(distance)) {
		distance = 0.1
	}
	let radius: number = distance / 2 + length2 / distance / 8
	if (radius === 0) {
		radius = 1e-8
	}
	result.radius = radius
	let mid: Vector2 = oldStartPoint.add(oldEndPoint).mul(0.5)
	let d1: Vector2 = oldMidPoint.sub(mid)
	let d2: Vector2 = newMid.sub(mid)
	let t: number = d1.dot(d2)
	if (t < 0) {
		if (oldSweep === ESweep.CCW) {
			result.sweep = ESweep.CCW
		} else {
			result.sweep = ESweep.CW
		}
	}
	if (result.sweep === ESweep.CCW) {
		l = new Vector2(-direct.y, direct.x).normalize()
	} else {
		l = new Vector2(direct.y, -direct.x).normalize()
	}
	let center: Vector2 = mid.add(l.mul(radius - distance))
	result.center = center
	let OS: Vector2 = oldStartPoint.sub(center).normalize()
	let OE: Vector2 = oldEndPoint.sub(center).normalize()
	let startAngle: number = Math.atan2(OS.y, OS.x)
	let endAngle: number = Math.atan2(OE.y, OE.x)
	result.startAngle = startAngle
	result.endAngle = endAngle
	return result
}
