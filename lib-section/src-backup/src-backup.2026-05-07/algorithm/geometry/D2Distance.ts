import { Vector2 } from '../../engine/algorithm/geometry/vector/Vector2'
import { D2ArcToolkit } from './D2ArcToolkit'
import { D2Intersection } from './D2Intersection'
import { D2LineToolkit } from './D2LineToolkit'
import { Arc } from './primitives/Arc'
import { Line } from './primitives/Line'
import { Primitive } from './primitives/Primitive'

export class D2Distance {
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
		return D2Intersection.getIntersectionsOfPrimitives(this._p1, this._p2).count > 0
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
		const point2d: Vector2 = D2LineToolkit.calcFootOfPoint2Line(line, arc.centerPoint).point
		if (line.bbox2.isContainsPoint(point2d)) {
			l = this.point2ArcMinLine(l, arc, point2d)
		}
		l = this.point2ArcMinLine(l, arc, arc.startPoint)
		l = this.point2ArcMinLine(l, arc, arc.endPoint)
		return l
	}

	private minDistanceForArcs(arc1: Arc, arc2: Arc, l: Line): Line {
		l = this.concentricArc(arc1, arc2, l)
		if (D2ArcToolkit.isPointOnArc(arc1, arc2.centerPoint) && D2ArcToolkit.isPointOnArc(arc2, arc1.centerPoint)) {
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
		const [start1, start2]: [Vector2, Vector2] = [arc.pointOn(point.getRadianByVector2(arc.centerPoint)), arc.pointOn(arc.centerPoint.getRadianByVector2(point))]
		shortestLine = this.arcShortestLine(arc, shortestLine, point, start1)
		shortestLine = this.arcShortestLine(arc, shortestLine, point, start2)
		return shortestLine
	}

	private arcInnerLineFootSegment(arc: Arc, l: Line, point: Vector2): Line {
		let distance: number = point.distance(arc.centerPoint)
		if (distance !== 0) {
			const [x, y]: [number, number] = [(arc.rx * (point.y - arc.centerPoint.y)) / distance + arc.centerPoint.y, (arc.rx * (point.x - arc.centerPoint.x)) / distance + arc.centerPoint.x]
			const l1: Line = new Line(new Vector2(x, y), point)
			distance = arc.rx - distance
			if (distance < this._minDist) {
				this._minDist = distance
				l = l1
			}
		} else {
			const l1: Line = new Line(arc.startPoint, point)
			distance = arc.rx - distance
			if (distance < this._minDist) {
				this._minDist = distance
				l = l1
			}
		}
		return l
	}

	private shortestLineForArcs(arc1: Arc, arc2: Arc, shortestLine: Line): Line {
		const [radian1, radian2]: [number, number] = [arc1.centerPoint.getRadianByVector2(arc2.centerPoint), arc2.centerPoint.getRadianByVector2(arc1.centerPoint)]
		const [arc1Start1, arc1Start2]: [Vector2, Vector2] = [arc1.pointOn(radian1), arc1.pointOn(radian2)]
		const [arc2End1, arc2End2]: [Vector2, Vector2] = [arc2.pointOn(radian1), arc2.pointOn(radian2)]
		if (D2ArcToolkit.isPointOnArc(arc1, arc1Start1)) {
			shortestLine = this.arcShortestLine(arc2, shortestLine, arc1Start1, arc2End1)
			shortestLine = this.arcShortestLine(arc2, shortestLine, arc1Start1, arc2End2)
		}
		if (D2ArcToolkit.isPointOnArc(arc1, arc1Start2)) {
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
		if (D2ArcToolkit.isPointOnArc(arc, p)) {
			const start1: Vector2 = arc.pointOn(p.getRadianByVector2(arc.centerPoint))
			const start2: Vector2 = arc.pointOn(arc.centerPoint.getRadianByVector2(p))
			shortestLine = this.arcShortestLine(arc, shortestLine, p, start1)
			shortestLine = this.arcShortestLine(arc, shortestLine, p, start2)
		} else {
			shortestLine = this.minLineSegment(shortestLine, arc.startPoint, p)
			shortestLine = this.minLineSegment(shortestLine, arc.svgEnd, p)
		}
		return shortestLine
	}

	private point2ArcMinLine(shortestLine: Line, arc: Arc, p: Vector2): Line {
		if (D2ArcToolkit.isPointOnArc(arc, p)) {
			const distance: number = p.distance(arc.centerPoint)
			if (distance > arc.rx || distance > arc.ry) {
				shortestLine = this.minLineForArcAndLine(arc, shortestLine, p)
			} else {
				shortestLine = this.arcInnerLineFootSegment(arc, shortestLine, p)
			}
		}
		return shortestLine
	}

	private point2LineMinLine(shortestLine: Line, line: Line, p: Vector2): Line {
		const point: Vector2 = D2LineToolkit.calcFootOfPoint2Line(line, p).point
		if (line.bbox2.isContainsPoint(point)) {
			shortestLine = this.minLineSegment(shortestLine, point, p)
		} else {
			shortestLine = this.minLineSegment(shortestLine, line.startPoint, p)
			shortestLine = this.minLineSegment(shortestLine, line.endPoint, p)
		}
		return shortestLine
	}

	private minLineSegment(shortestLine: Line, p1: Vector2, p2: Vector2): Line {
		const distance: number = p1.distance(p2)
		if (distance < this._minDist) {
			this._minDist = distance
			shortestLine = new Line(p1, p2)
		}
		return shortestLine
	}

	private arcShortestLine(arc: Arc, shortestLine: Line, start: Vector2, end: Vector2): Line {
		if (D2ArcToolkit.isPointOnArc(arc, end)) {
			const line: Line = new Line(start, end)
			const distance: number = line.length
			if (distance < this._minDist) {
				this._minDist = distance
				shortestLine = line
			}
		}
		return shortestLine
	}
}
