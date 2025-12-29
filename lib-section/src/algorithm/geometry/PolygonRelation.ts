import { ED2ElementGeometryRelation } from '../../config/D2ElementProfile'
import { BBox2 } from '../../engine/algorithm/geometry/bbox/BBox2'
import { Vector2 } from '../../engine/algorithm/geometry/vector/Vector2'
import { DoubleKit } from '../../engine/math/Doublekit'
import { Distance } from './Distance'
import { Line } from './primitives/Line'
import { Polyline } from './primitives/Polyline'
import { Primitive } from './primitives/Primitive'
import { isPolylineClosed } from './utils/polylineUtils'

export class PolygonRelation {
	/**
	 * 关联的 Polyline
	 */
	private readonly _pl1: Polyline
	private readonly _pl2: Polyline
	/**
	 * pl1 中最靠近 pl2 的 Primitive
	 */
	private readonly _pt1: Primitive
	/**
	 * pl2 中最靠近 pl1 的 Primitive
	 */
	private readonly _pt2: Primitive
	private readonly _relation: ED2ElementGeometryRelation
	private readonly _distance: number
	/**
	 * pl1 与 pl2 之间的最短点连线
	 */
	private readonly _line: Line
	/**
	 * 检查关系的间距
	 */
	private readonly _clearance: number
	private readonly _setDistZeroWhenContain: boolean
	constructor(pl1: Polyline, pl2: Polyline, clearance: number = 0, setDistZeroWhenContain: boolean = true) {
		this._pl1 = pl1
		this._pl2 = pl2
		this._clearance = clearance
		this._setDistZeroWhenContain = setDistZeroWhenContain
		const { relation, distance, line, pt1, pt2 } = this.getRelation()
		this._relation = relation
		this._distance = distance
		this._line = line
		this._pt1 = pt1
		this._pt2 = pt2
	}

	public get relation(): ED2ElementGeometryRelation {
		return this._relation
	}

	public get distance(): number {
		return this._distance
	}

	public get line(): Line {
		return this._line
	}

	private getRelation(): {
		relation: ED2ElementGeometryRelation
		distance: number
		line: Line
		pt1: Primitive
		pt2: Primitive
	} {
		const result: {
			relation: ED2ElementGeometryRelation
			distance: number
			line: Line
			pt1: Primitive
			pt2: Primitive
		} = {
			relation: ED2ElementGeometryRelation.Separared,
			distance: Number.MAX_SAFE_INTEGER,
			line: null!,
			pt1: null!,
			pt2: null!,
		}
		for (let pt1 of this._pl1.primitives) {
			for (let pt2 of this._pl2.primitives) {
				if (pt1 instanceof Line && DoubleKit.eq(pt1.startPoint.distance2(pt1.endPoint), 0)) {
					continue
				}
				if (pt2 instanceof Line && DoubleKit.eq(pt2.startPoint.distance2(pt2.endPoint), 0)) {
					continue
				}
				const dt: Distance = new Distance(pt1, pt2)
				const dis: number = dt.distance
				const l: Line = dt.minLine
				if (DoubleKit.less(dis, result.distance)) {
					result.distance = dis
					result.line = l
					result.pt1 = pt1
					result.pt2 = pt2
				}
				if (DoubleKit.eq(result.distance, 0)) {
					result.relation = ED2ElementGeometryRelation.Intersect
					break
				}
			}
			if (DoubleKit.eq(result.distance, 0)) {
				result.relation = ED2ElementGeometryRelation.Intersect
			}
		}
		if (result.relation !== ED2ElementGeometryRelation.Intersect) {
			if (result.pt1 && isPolylineClosed(this._pl2) && this.pointInPolyline(result.pt1.startPoint, this._pl2)) {
				result.relation = ED2ElementGeometryRelation.BContainA
				if (this._setDistZeroWhenContain) {
					result.distance = 0
				}
			} else if (result.pt2 && isPolylineClosed(this._pl1) && this.pointInPolyline(result.pt2.startPoint, this._pl1)) {
				result.relation = ED2ElementGeometryRelation.AContainB
				if (this._setDistZeroWhenContain) {
					result.distance = 0
				}
			}
		}
		return result
	}

	private pointInPolyline(point: Vector2, pl: Polyline): boolean {
		const bbox2: BBox2 = pl.bbox2
		if (!bbox2.isContainsPoint(point)) {
			return false
		}
		const points: Array<Vector2> = []
		pl.points(0.1, (p: Vector2): void => {
			points.push(p)
		})
		return this.isSelect(point.x, point.y, points)
	}

	private isSelect(x: number, y: number, outline: Array<Vector2>): boolean {
		let result: boolean = false
		for (let i: number = 0, len = outline.length - 1; i < len; i++) {
			const startPoint: Vector2 = outline[i]
			const endPoint: Vector2 = outline[i + 1]
			if ((x === startPoint.x && y === startPoint.y) || (x === endPoint.x && y === endPoint.y)) {
				return true
			}
			if ((startPoint.y < y && endPoint.y >= y) || (startPoint.y >= y && endPoint.y < y)) {
				const resultX: number = startPoint.x + ((y - startPoint.y) * (endPoint.x - startPoint.x)) / (endPoint.y - startPoint.y)
				if (x === resultX) {
					return true
				}
				if (resultX > x) {
					result = !result
				}
			}
		}
		const s: Vector2 = outline[outline.length - 1]
		const e: Vector2 = outline[0]
		if ((x === s.x && y === s.y) || (x === e.x && y === e.y)) {
			return true
		}
		if ((s.y < y && e.y >= y) || (s.y >= y && e.y < y)) {
			const resultX: number = s.x + ((y - s.y) * (e.x - s.x)) / (e.y - s.y)
			if (x === resultX) {
				return true
			}
			if (resultX > x) {
				result = !result
			}
		}
		return result
	}
}
