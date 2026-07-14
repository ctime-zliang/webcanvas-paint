import { Vector2 } from '../../engine/algorithm/geometry/vector/Vector2'
import { ESweep } from '../../engine/config/CommonProfile'
import { Arc } from './primitives/Arc'
import { Line } from './primitives/Line'
import { Primitive } from './primitives/Primitive'

export class D2ProtractorToolkit {
	public static getProtractorAngle(centerPoint: Vector2, startPoint: Vector2, endPoint: Vector2, precision: number = 1e-8): number {
		const ratio: number = Math.pow(10, precision)
		const [direct1, direct2]: [Vector2, Vector2] = [startPoint.sub(centerPoint), endPoint.sub(centerPoint)]
		const cos: number = direct1.normalize().dot(direct2.normalize())
		const radian: number = Math.acos(cos)
		let result: number = Math.round(radian * ratio) / ratio
		if (Number.isNaN(result)) {
			result = 0
		}
		return result
	}

	public static gettProtractorEndPointByAngle(radian: number, centerPoint: Vector2, oldStartPoint: Vector2, oldEndPoint: Vector2): Vector2 {
		const [direct1, direct2]: [Vector2, Vector2] = [oldStartPoint.sub(centerPoint).normalize(), oldEndPoint.sub(centerPoint).normalize()]
		const len: number = oldEndPoint.sub(centerPoint).length
		const crossV: number = direct1.cross(direct2)
		if (crossV >= 0) {
			const dir: Vector2 = direct1.rotateSurround(Vector2.ORIGIN, radian)
			return centerPoint.add(dir.mul(len))
		}
		const dir: Vector2 = direct1.rotateSurround(Vector2.ORIGIN, -radian)
		return centerPoint.add(dir.mul(len))
	}

	public static getProtractorStyle(centerPoint: Vector2, startPoint: Vector2, endPoint: Vector2): Array<Primitive> {
		const results: Array<Primitive> = []
		const [startEdge, endEdge]: [Line, Line] = [new Line(centerPoint, startPoint), new Line(centerPoint, endPoint)]
		results.push(startEdge, endEdge)
		const [direct1, direct2]: [Vector2, Vector2] = [startPoint.sub(centerPoint), endPoint.sub(centerPoint)]
		let [startRadian, endRadian]: [number, number] = [
			(Math.atan2(direct1.y, direct1.x) * 180) / Math.PI,
			(Math.atan2(direct2.y, direct2.x) * 180) / Math.PI,
		]
		if (startRadian === endRadian) {
			endRadian += 1e-8
		}
		let crossV: number = direct1.cross(direct2)
		if (crossV >= 0) {
			const arc: Arc = Arc.build2(centerPoint, startRadian, endRadian, 10, 10, ESweep.CCW)
			results.push(arc)
		} else {
			const arc: Arc = Arc.build2(centerPoint, startRadian, endRadian, 10, 10, ESweep.CW)
			results.push(arc)
		}
		return results
	}
}
