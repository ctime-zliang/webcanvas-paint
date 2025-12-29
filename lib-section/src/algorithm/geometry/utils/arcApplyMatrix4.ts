import { Matrix4 } from '../../../engine/algorithm/geometry/matrix/Matrix4'
import { Vector2 } from '../../../engine/algorithm/geometry/vector/Vector2'
import { ESweep } from '../../../engine/config/CommonProfile'

export function arcApplyTranslateMatrix4(
	matrix4: Matrix4,
	oldStartAngle: number,
	oldEndAngle: number,
	oldSweepAngle: number,
	oldRadius: number,
	oldCenter: Vector2
): {
	center: Vector2
	startAngle: number
	endAngle: number
	sweep: ESweep
} {
	const result: {
		center: Vector2
		startAngle: number
		endAngle: number
		sweep: ESweep
	} = {
		center: undefined!,
		startAngle: undefined!,
		endAngle: undefined!,
		sweep: undefined!,
	}
	const newStartPoint: Vector2 = oldCenter.add(new Vector2(Math.cos(oldStartAngle) * oldRadius, Math.sin(oldStartAngle) * oldRadius))
	const newEndPoint: Vector2 = oldCenter.add(new Vector2(Math.cos(oldEndAngle) * oldRadius, Math.sin(oldEndAngle) * oldRadius))
	const angle: number = oldSweepAngle
	const midAngle: number = oldStartAngle + angle / 2
	const mid: Vector2 = oldCenter.add(new Vector2(Math.cos(midAngle) * oldRadius, Math.sin(midAngle) * oldRadius))
	const c: Vector2 = oldCenter.multiplyMatrix4(matrix4)
	const s: Vector2 = newStartPoint.multiplyMatrix4(matrix4)
	const e: Vector2 = newEndPoint.multiplyMatrix4(matrix4)
	const m: Vector2 = mid.multiplyMatrix4(matrix4)
	const newStartDir: Vector2 = s.sub(c)
	const newEndDir: Vector2 = e.sub(c)
	let sAngle: number = Math.atan2(newStartDir.y, newStartDir.x)
	let eAngle: number = Math.atan2(newEndDir.y, newEndDir.x)
	if (sAngle < 0) {
		sAngle += Math.PI * 2
	}
	if (eAngle < 0) {
		eAngle += Math.PI * 2
	}
	result.center = c
	result.startAngle = sAngle
	result.endAngle = eAngle
	const d1: Vector2 = m.sub(s)
	const d2: Vector2 = e.sub(m)
	if (d1.cross(d2) >= 0) {
		result.sweep = ESweep.CCW
	} else {
		result.sweep = ESweep.CW
	}
	return result
}
