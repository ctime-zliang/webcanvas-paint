import { Vector2 } from '../../../engine/algorithm/geometry/vector/Vector2'
import { ESweep } from '../../../engine/config/CommonProfile'
import { Angles } from '../../../engine/math/Angles'
import { Arc } from '../primitives/Arc'
import { Line } from '../primitives/Line'
import { Primitive } from '../primitives/Primitive'

export function getProtractorAngle(centerPoint: Vector2, startPoint: Vector2, endPoint: Vector2, precision: number = 1e-8): number {
	const ratio: number = Math.pow(10, precision)
	const direct1: Vector2 = startPoint.sub(centerPoint)
	const direct2: Vector2 = endPoint.sub(centerPoint)
	const cos: number = direct1.normalize().dot(direct2.normalize())
	const angle: number = (Math.acos(cos) / Math.PI) * 180
	let result: number = Math.round(angle * ratio) / ratio
	if (Number.isNaN(result)) {
		result = 0
	}
	return result
}

export function gettProtractorEndPointByAngle(angle: number, centerPoint: Vector2, oldStartPoint: Vector2, oldEndPoint: Vector2): Vector2 {
	const radian: number = Angles.degreeToRadian(angle)
	const direct1: Vector2 = oldStartPoint.sub(centerPoint).normalize()
	const direct2: Vector2 = oldEndPoint.sub(centerPoint).normalize()
	const len: number = oldEndPoint.sub(centerPoint).length
	const crossV: number = direct1.cross(direct2)
	if (crossV >= 0) {
		const dir: Vector2 = direct1.rotateSurround(Vector2.ORIGIN, radian)
		return centerPoint.add(dir.mul(len))
	}
	const dir: Vector2 = direct1.rotateSurround(Vector2.ORIGIN, -radian)
	return centerPoint.add(dir.mul(len))
}

export function getProtractorStyle(centerPoint: Vector2, startPoint: Vector2, endPoint: Vector2): Array<Primitive> {
	const results: Array<Primitive> = []
	const startEdge: Line = new Line(centerPoint, startPoint)
	const endEdge: Line = new Line(centerPoint, endPoint)
	results.push(startEdge, endEdge)
	const direct1: Vector2 = startPoint.sub(centerPoint)
	const direct2: Vector2 = endPoint.sub(centerPoint)
	let startAngle: number = (Math.atan2(direct1.y, direct1.x) * 180) / Math.PI
	let endAngle: number = (Math.atan2(direct2.y, direct2.x) * 180) / Math.PI
	if (startAngle === endAngle) {
		endAngle += 1e-8
	}
	let crossV: number = direct1.cross(direct2)
	if (crossV >= 0) {
		const arc: Arc = Arc.build2(centerPoint, startAngle, endAngle, 10, 10, ESweep.CCW)
		results.push(arc)
	} else {
		const arc: Arc = Arc.build2(centerPoint, startAngle, endAngle, 10, 10, ESweep.CW)
		results.push(arc)
	}
	return results
}
