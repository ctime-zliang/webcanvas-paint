import { Vector2 } from '../../engine/algorithm/geometry/vector/Vector2'
import { DoubleKit } from '../../engine/math/Doublekit'
import { intersPP } from './intersection/Intersection'
import { isOn } from './intersection/utils'
import { Arc } from './primitives/Arc'
import { Line } from './primitives/Line'
import { Primitive } from './primitives/Primitive'

export class Distance {
	/**
	 * 已知由点 A(xa, ya) 和点 B(xb, yb) 确定的线段 L, 求点 P(px, py) 到线段 L 的垂足 F(xf, yf) 坐标
	 * 		令
	 * 			t = ((px - xa) * (xb - xa) + (py - ay) * (by - ay)) / ((bx - ax) * (bx - ax) + (by - ay) * (by - ay))
	 * 		则
	 * 			xf = xa + t * (bx - ax)
	 * 			yf = ya + t * (by - ay)
	 * 		当 t < 0 时, F 点在线段 L 的延长线上且靠近 A
	 * 		当 t > 1 时, F 点在线段 L 的延长线上且靠近 B
	 * 		当 0 <= t <= 1 时, F 点在线段 L 上
	 */
	public static foot(line: Line, point: Vector2): Vector2 {
		if (line.isPoint1()) {
			return line.startPoint
		}
		if (!DoubleKit.eq(line.b, 0) && !DoubleKit.eq(line.a, 0)) {
			/**
			 * 已知直线 L 的一般式为 ax + by + c = 0, 坐标点 P(px, py) 到直线 L 的垂足 F(xf, yf) 坐标为:
			 * 		xf = (b * (b * px - a * py) - a * c) / (b * b + a * a)
			 * 		yf = (a * (-b * px + a * py) - b * c) / (b * b + a * a)
			 */
			const x: number = (line.b * line.b * point.x - line.a * line.b * point.y - line.a * line.c) / (line.b * line.b + line.a * line.a)
			const y: number = (-line.a * line.b * point.x + line.a * line.a * point.y - line.b * line.c) / (line.b * line.b + line.a * line.a)
			return new Vector2(x, y)
		}
		if (DoubleKit.eq(line.b, 0) && !DoubleKit.eq(line.a, 0)) {
			return new Vector2(line.startPoint.x, point.y)
		}
		if (!DoubleKit.eq(line.b, 0) && DoubleKit.eq(line.a, 0)) {
			return new Vector2(point.x, line.startPoint.y)
		}
		return point
	}

	private _p1: Primitive
	private _p2: Primitive
	private _minDist: number
	private _minLine: Line
	constructor(p1: Primitive, p2: Primitive) {
		this._p1 = p1
		this._p2 = p2
		this._minDist = Number.MAX_VALUE
		if (this.intersection()) {
			this._minDist = 0
			this._minLine = new Line(Vector2.ORIGIN, Vector2.ORIGIN)
		} else {
			this._minLine = this.getMinLine()
		}
	}

	public get distance(): number {
		return this._minDist
	}

	public get minLine(): Line {
		return this._minLine
	}

	private intersection(): boolean {
		return intersPP(this._p1, this._p2) > 0
	}

	private getMinLine(): Line {
		if (this._p1 instanceof Line && this._p2 instanceof Line) {
			return this.minDistanceForLines(this._p1, this._p2, this._minLine)
		}
		if (this._p1 instanceof Arc && this._p2 instanceof Line) {
			return this.minDistanceForLineAndArc(this._p1, this._p2, this._minLine)
		}
		if (this._p1 instanceof Line && this._p2 instanceof Arc) {
			return this.minDistanceForLineAndArc(this._p2, this._p1, this._minLine)
		}
		if (this._p1 instanceof Arc && this._p2 instanceof Arc) {
			return this.minDistanceForArcs(this._p1, this._p2, this._minLine)
		}
		return this._minLine
	}

	private minDistanceForLines(m: Line, n: Line, l: Line): Line {
		l = this.point2LineMinLine(l, n, m.startPoint)
		l = this.point2LineMinLine(l, n, m.endPoint)
		l = this.point2LineMinLine(l, m, n.startPoint)
		l = this.point2LineMinLine(l, m, n.endPoint)
		return l
	}

	private minDistanceForLineAndArc(arc: Arc, line: Line, l: Line): Line {
		l = this.point2LineMinLine(l, line, arc.startPoint)
		l = this.point2LineMinLine(l, line, arc.svgEnd)
		let point2d: Vector2 = Distance.foot(line, arc.centerPoint)
		if (line.bbox2.isContainsPoint(point2d)) {
			l = this.point2ArcMinLine(l, arc, point2d)
		}
		l = this.point2ArcMinLine(l, arc, arc.startPoint)
		l = this.point2ArcMinLine(l, arc, arc.endPoint)
		return l
	}

	private minDistanceForArcs(arc1: Arc, arc2: Arc, l: Line): Line {
		l = this.concentricArc(arc1, arc2, l)
		if (isOn(arc1, arc2.centerPoint) && isOn(arc2, arc1.centerPoint)) {
			l = this.shortestLineForArcs(arc1, arc2, l)
		} else {
			l = this.point2ArcMinDistance(arc2.startPoint, arc1, l)
			l = this.point2ArcMinDistance(arc2.svgEnd, arc1, l)
			l = this.point2ArcMinDistance(arc1.startPoint, arc2, l)
			l = this.point2ArcMinDistance(arc1.svgEnd, arc2, l)
		}
		return l
	}

	private minLineForArcAndLine(arc: Arc, shortestLine: Line, point: Vector2): Line {
		let start1: Vector2 = arc.pointOn(point.getRadianByVector2(arc.centerPoint))
		let start2: Vector2 = arc.pointOn(arc.centerPoint.getRadianByVector2(point))
		shortestLine = this.arcShortestLine(arc, shortestLine, point, start1)
		shortestLine = this.arcShortestLine(arc, shortestLine, point, start2)
		return shortestLine
	}

	private arcInnerLineFootSegment(arc: Arc, l: Line, point: Vector2): Line {
		let distance: number = point.distance(arc.centerPoint)
		if (distance !== 0) {
			let y: number = (arc.rx * (point.y - arc.centerPoint.y)) / distance + arc.centerPoint.y
			let x: number = (arc.rx * (point.x - arc.centerPoint.x)) / distance + arc.centerPoint.x
			let l1: Line = new Line(new Vector2(x, y), point)
			distance = arc.rx - distance
			if (distance < this._minDist) {
				this._minDist = distance
				l = l1
			}
		} else {
			let l1: Line = new Line(arc.startPoint, point)
			distance = arc.rx - distance
			if (distance < this._minDist) {
				this._minDist = distance
				l = l1
			}
		}
		return l
	}

	private shortestLineForArcs(arc1: Arc, arc2: Arc, shortestLine: Line): Line {
		let angle1: number = arc1.centerPoint.getRadianByVector2(arc2.centerPoint)
		let angle2: number = arc2.centerPoint.getRadianByVector2(arc1.centerPoint)
		let arc1Start1: Vector2 = arc1.pointOn(angle1)
		let arc1Start2: Vector2 = arc1.pointOn(angle2)
		let arc2End1: Vector2 = arc2.pointOn(angle1)
		let arc2End2: Vector2 = arc2.pointOn(angle2)
		if (isOn(arc1, arc1Start1)) {
			shortestLine = this.arcShortestLine(arc2, shortestLine, arc1Start1, arc2End1)
			shortestLine = this.arcShortestLine(arc2, shortestLine, arc1Start1, arc2End2)
		}
		if (isOn(arc1, arc1Start2)) {
			shortestLine = this.arcShortestLine(arc2, shortestLine, arc1Start2, arc2End1)
			shortestLine = this.arcShortestLine(arc2, shortestLine, arc1Start2, arc2End2)
		}
		return shortestLine
	}

	private concentricArc(arc1: Arc, arc2: Arc, shortestLine: Line): Line {
		if (arc1.centerPoint.distance(arc2.centerPoint) < 1e-5 && arc1.rx === arc2.rx && arc1.ry === arc2.ry) {
			let l1: Line = new Line(arc1.startPoint, arc2.svgEnd)
			if (l1.length < this._minDist) {
				this._minDist = l1.length
				shortestLine = l1
			}
			l1 = new Line(arc2.startPoint, arc1.svgEnd)
			if (l1.length < this._minDist) {
				this._minDist = l1.length
				shortestLine = l1
			}
		}
		return shortestLine
	}

	private point2ArcMinDistance(p: Vector2, arc: Arc, shortestLine: Line): Line {
		if (isOn(arc, p)) {
			let start1: Vector2 = arc.pointOn(p.getRadianByVector2(arc.centerPoint))
			let start2: Vector2 = arc.pointOn(arc.centerPoint.getRadianByVector2(p))
			shortestLine = this.arcShortestLine(arc, shortestLine, p, start1)
			shortestLine = this.arcShortestLine(arc, shortestLine, p, start2)
		} else {
			shortestLine = this.minLineSegment(shortestLine, arc.startPoint, p)
			shortestLine = this.minLineSegment(shortestLine, arc.svgEnd, p)
		}
		return shortestLine
	}

	private point2ArcMinLine(shortestLine: Line, arc: Arc, p: Vector2): Line {
		if (isOn(arc, p)) {
			let distance: number = p.distance(arc.centerPoint)
			if (distance > arc.rx || distance > arc.ry) {
				shortestLine = this.minLineForArcAndLine(arc, shortestLine, p)
			} else {
				shortestLine = this.arcInnerLineFootSegment(arc, shortestLine, p)
			}
		}
		return shortestLine
	}

	private point2LineMinLine(shortestLine: Line, line: Line, p: Vector2): Line {
		let point: Vector2 = Distance.foot(line, p)
		if (line.bbox2.isContainsPoint(point)) {
			shortestLine = this.minLineSegment(shortestLine, point, p)
		} else {
			shortestLine = this.minLineSegment(shortestLine, line.startPoint, p)
			shortestLine = this.minLineSegment(shortestLine, line.endPoint, p)
		}
		return shortestLine
	}

	private minLineSegment(shortestLine: Line, p1: Vector2, p2: Vector2): Line {
		let distance: number = p1.distance(p2)
		if (distance < this._minDist) {
			this._minDist = distance
			shortestLine = new Line(p1, p2)
		}
		return shortestLine
	}

	private arcShortestLine(arc: Arc, shortestLine: Line, start: Vector2, end: Vector2): Line {
		if (isOn(arc, end)) {
			let line: Line = new Line(start, end)
			let distance: number = line.length
			if (distance < this._minDist) {
				this._minDist = distance
				shortestLine = line
			}
		}
		return shortestLine
	}
}
