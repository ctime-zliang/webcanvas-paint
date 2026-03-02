import { Vector2 } from '../../engine/algorithm/geometry/vector/Vector2'
import { ESweep } from '../../engine/config/CommonProfile'
import { Angles } from '../../engine/math/Angles'
import { ArraySort } from '../../engine/math/ArraySort'
import { toFix } from '../../engine/math/Calculation'
import { DoubleKit } from '../../engine/math/Doublekit'
import { D2ArcToolkit } from './D2ArcToolkit'
import { Arc } from './primitives/Arc'
import { Line } from './primitives/Line'
import { Primitive } from './primitives/Primitive'

export class D2PrimitiveToolkit {
	public static isEmptyPrimitive(pt: Primitive): boolean {
		if (pt instanceof Line) {
			return DoubleKit.eq(pt.length, 0)
		}
		if (pt instanceof Arc) {
			return DoubleKit.eq(pt.sweepRadian, 0)
		}
		return true
	}

	public static getPrimitivesAllLength(pts: Array<Primitive>): number {
		let lenSum: number = 0
		for (let i: number = 0; i < pts.length; i++) {
			if (pts[i] instanceof Line) {
				lenSum += pts[i].length
				continue
			}
			if (pts[i] instanceof Arc) {
				lenSum += pts[i].length
				continue
			}
		}
		return lenSum
	}

	public static getPrimitiveItemLength(pt: Primitive): number {
		if (pt instanceof Line) {
			return pt.length
		}
		if (pt instanceof Arc) {
			const sweepRadian: number = Angles.degreeToRadian(pt.sweepRadian)
			return Math.abs(pt.rx * sweepRadian)
		}
		return 0
	}

	/**
	 * 获取 Primitive 结束点的方向向量
	 *      对于圆弧 Arc, 即结束点位置的切线方向
	 */
	public static getPrimitiveLastDirect(pts: Array<Primitive>, end?: Vector2): Vector2 {
		for (let i: number = pts.length - 1; i >= 0; i--) {
			const pt: Primitive = pts[i]
			if (i > 0 && D2PrimitiveToolkit.isEmptyPrimitive(pt)) {
				continue
			}
			if (pt instanceof Line) {
				return pt.direct
			}
			if (pt instanceof Arc) {
				const _end: Vector2 = end || pt.endPoint
				const direc: Vector2 = _end.sub(pt.centerPoint).normalize()
				if (pt.sweep === ESweep.CCW) {
					return new Vector2(-direc.y, direc.x)
				}
				return new Vector2(direc.y, -direc.x)
			}
		}
		return null!
	}

	public static isPointInPt(p: Vector2, pt: Primitive): boolean {
		if (pt instanceof Line) {
			const [v1, v2]: [Vector2, Vector2] = [p.sub(pt.startPoint), p.sub(pt.endPoint)]
			return DoubleKit.eq(Math.abs(v1.cross(v2)), 0) && DoubleKit.lesseq(v1.dot(v2), 0)
		}
		if (pt instanceof Arc) {
			return DoubleKit.eq(p.distance(pt.centerPoint), pt.rx) && D2ArcToolkit.isPointOnArc(pt, p)
		}
		return false
	}

	public static splitPrimitive(pt: Primitive, point: Vector2): Array<Primitive> {
		if (pt instanceof Line) {
			return [new Line(pt.startPoint, point), new Line(point, pt.endPoint)]
		}
		if (pt instanceof Arc) {
			if (Math.abs(pt.sweepRadian) === 360.0) {
				const mid: Vector2 = pt.centerPoint.sub(point).mul(2).add(point)
				const [pt1, pt2]: [Arc, Arc] = [
					Arc.build4(mid, point, pt.centerPoint, pt.rx, pt.rx, pt.sweep),
					Arc.build4(point, mid, pt.centerPoint, pt.rx, pt.rx, pt.sweep),
				]
				return [pt1, pt2]
			}
			let [pt1, pt2]: [Arc | Line, Arc | Line] = [
				Arc.build4(pt.startPoint, point, pt.centerPoint, pt.rx, pt.rx, pt.sweep),
				Arc.build4(point, pt.endPoint, pt.centerPoint, pt.rx, pt.rx, pt.sweep),
			]
			if (pt1.startPoint.equalsWithVector2(pt1.endPoint)) {
				pt1 = new Line(pt.startPoint, point)
			}
			if (pt2.startPoint.equalsWithVector2(pt2.endPoint)) {
				pt2 = new Line(point, pt.endPoint)
			}
			return [pt1, pt2]
		}
		return []
	}

	public static isPrimitivesClosed(pts: Array<Primitive>, range: number = 1e-8): boolean {
		if (pts.length === 1) {
			const pt: Primitive = pts[0]
			if (pt instanceof Arc && DoubleKit.greatereq(Math.abs(pt.sweepRadian), Math.PI * 2)) {
				return true
			}
		}
		if (pts.length === 2) {
			if (pts[0] instanceof Line && pts[1] instanceof Line) {
				return false
			}
			const f: Primitive = pts[0]
			const l: Primitive = pts[pts.length - 1]
			if (f.startPoint.distance(l.endPoint) <= range) {
				return true
			}
		}
		const f: Primitive = pts[0]
		const l: Primitive = pts[pts.length - 1]
		if (f.startPoint.distance(l.endPoint) <= range) {
			return true
		}
		return false
	}

	public static sortForLine(points: Array<Vector2>, line: Line | Arc): Array<Vector2> {
		if (points.length <= 0) {
			return points
		}
		if (line instanceof Line) {
			const startPoint: Vector2 = line.startPoint
			ArraySort.quickSort(
				points,
				(p1: Vector2, p2: Vector2): number => {
					return p1.distanceSquare(startPoint) - p2.distanceSquare(startPoint)
				},
				0,
				points.length
			)
			return points
		}
		if (line instanceof Arc) {
			const centerPoint: Vector2 = line.centerPoint
			const direct: Vector2 = line.startPoint.sub(centerPoint).normalize()
			const sweep: ESweep = line.sweep
			ArraySort.quickSort(
				points,
				(p1: Vector2, p2: Vector2): number => {
					const [direct1, direct2]: [Vector2, Vector2] = [p1.sub(centerPoint).normalize(), p2.sub(centerPoint).normalize()]
					const [dot1, dot2]: [number, number] = [toFix(direct.dot(direct1), 8), toFix(direct.dot(direct2), 8)]
					const [corss1, corss2]: [number, number] = [direct.cross(direct1), direct.cross(direct2)]
					let [radian1, radian2]: [number, number] = [Math.acos(dot1), Math.acos(dot2)]
					if ((sweep === ESweep.CCW && DoubleKit.less(corss1, 0)) || (sweep === ESweep.CW && DoubleKit.greater(corss1, 0))) {
						radian1 = Math.PI * 2 - radian1
					}
					if ((sweep === ESweep.CCW && DoubleKit.less(corss2, 0)) || (sweep === ESweep.CW && DoubleKit.greater(corss2, 0))) {
						radian2 = Math.PI * 2 - radian2
					}
					return radian1 - radian2
				},
				0,
				points.length
			)
			if (line.startPoint.equalsWithVector2(line.endPoint)) {
				points.push(line.endPoint)
			}
			return points
		}
		return points
	}

	public static interceptPrimitive(pt: Primitive, dis1: number, dis2?: number): Primitive {
		if (DoubleKit.eq(dis1, 0) && !dis2) {
			return pt
		}
		if (pt instanceof Line) {
			const startPoint: Vector2 = pt.startPoint.add(pt.direct.mul(dis1))
			const endPoint: Vector2 = dis2 ? pt.startPoint.add(pt.direct.mul(dis2)) : pt.endPoint
			return new Line(startPoint, endPoint)
		}
		if (pt instanceof Arc) {
			const originstartRadian: number = Angles.regularRadian(pt.startRadian)
			const len: number = Math.PI * 1 * pt.rx * 2
			const radian1: number = (dis1 / len) * 360
			const startRadian: number = pt.sweep === ESweep.CW ? originstartRadian - radian1 : originstartRadian + radian1
			let endRadian: number = pt.endRadian
			if (typeof dis2 === 'number') {
				const radian2: number = (dis2 / len) * 360
				endRadian = pt.sweep === ESweep.CW ? originstartRadian - radian2 : originstartRadian + radian2
			}
			return Arc.build2(pt.centerPoint, startRadian, endRadian, pt.rx, pt.rx, pt.sweep)
		}
		return pt
	}
}
