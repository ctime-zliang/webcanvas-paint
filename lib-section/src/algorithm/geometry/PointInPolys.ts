import { BBox2 } from '../../engine/algorithm/geometry/bbox/BBox2'
import { Vector2 } from '../../engine/algorithm/geometry/vector/Vector2'
import { ESweep } from '../../engine/config/CommonProfile'
import { toFix } from '../../engine/math/Calculation'
import { DoubleKit } from '../../engine/math/Doublekit'
import { Distance } from './Distance'
import { intersArcY } from './intersection/Intersection'
import { CACHE } from './intersection/profile'
import { isOn } from './intersection/utils'
import { Arc } from './primitives/Arc'
import { Line } from './primitives/Line'
import { Polyline } from './primitives/Polyline'
import { Primitive } from './primitives/Primitive'

export class Side {
	private _shape: Primitive
	private _group: number
	private _index: number
	private _startPoint: Vector2
	private _endPoint: Vector2
	private _next: Side
	private _prev: Side
	private _isIntersInStart: boolean
	private _isIntersInEnd: boolean
	private _othersIntersCount: number
	constructor(shape: Primitive, group: number, index: number) {
		this._shape = shape
		this._group = group
		this._index = index
		this._endPoint = shape.endPoint
		this._startPoint = null!
		this._next = null!
		this._prev = null!
		this._isIntersInStart = false
		this._isIntersInEnd = false
		this._othersIntersCount = 0
	}

	public get shape(): Primitive {
		return this._shape
	}

	public get group(): number {
		return this._group
	}

	public get index(): number {
		return this._index
	}

	public get startPoint(): Vector2 {
		return this._startPoint
	}

	public get endPoint(): Vector2 {
		return this._endPoint
	}

	public get next(): Side {
		return this._next
	}

	public get prev(): Side {
		return this._prev
	}

	public get isIntersInStart(): boolean {
		return this._isIntersInStart
	}
	public set isIntersInStart(value: boolean) {
		this._isIntersInStart = value
	}

	public get isIntersInEnd(): boolean {
		return this._isIntersInEnd
	}
	public set isIntersInEnd(value: boolean) {
		this._isIntersInEnd = value
	}

	public get othersIntersCount(): number {
		return this._othersIntersCount
	}
	public set othersIntersCount(value: number) {
		this._othersIntersCount = value
	}

	public reset(): void {
		this._isIntersInStart = false
		this._isIntersInEnd = false
		this._othersIntersCount = 0
	}

	public setPrev(value: Side): void {
		this._prev = value
		if (this.prev !== null) {
			this._startPoint = this.prev.endPoint
		}
	}

	public setNext(value: Side): void {
		this._next = value
	}

	public getNext(): Side {
		let result: Side = null!
		let isIntersInEnd: boolean = this.isIntersInEnd
		let next: Side = this.next
		while (true) {
			if (isIntersInEnd && next !== this) {
				if (next.isIntersInStart) {
					result = next
					break
				}
				next = next.next
				continue
			}
			break
		}
		return result
	}

	public getStartPointDirect(): Vector2 {
		if (this.shape instanceof Line) {
			return this.shape.direct
		}
		if (this.shape instanceof Arc) {
			/**
			 * 扫描线算法, 需判断路径的前进方向趋势
			 */
			let angle: number = Math.abs((this.shape.startAngle + 360) % 360)
			if (this.isIntersInStart && this.othersIntersCount === 0) {
				angle = toFix(angle, 1)
			}
			if (this.shape.sweep === ESweep.CCW) {
				if (DoubleKit.greatereq(angle, 90) && DoubleKit.less(angle, 270)) {
					return new Vector2(0, -1)
				}
				return new Vector2(0, 1)
			}
			if (DoubleKit.greater(angle, 90) && DoubleKit.lesseq(angle, 270)) {
				return new Vector2(0, 1)
			}
			return new Vector2(0, -1)
		}
		return null!
	}

	public getEndPointDirect(): Vector2 {
		if (this.shape instanceof Line) {
			return this.shape.direct
		}
		if (this.shape instanceof Arc) {
			/**
			 * 扫描线算法, 需判断路径的前进方向趋势
			 */
			let angle: number = Math.abs((this.shape.endAngle + 360) % 360)
			if (this.isIntersInStart && this.othersIntersCount === 0) {
				angle = toFix(angle, 1)
			}
			if (this.shape.sweep === ESweep.CCW) {
				if (DoubleKit.greater(angle, 90) && DoubleKit.lesseq(angle, 270)) {
					return new Vector2(0, -1)
				}
				return new Vector2(0, 1)
			}
			if (DoubleKit.greatereq(angle, 90) && DoubleKit.less(angle, 270)) {
				return new Vector2(0, 1)
			}
			return new Vector2(0, -1)
		}
		return null!
	}
}

export class PointInPolys {
	private _horizontal: Vector2
	constructor() {
		this._horizontal = new Vector2(1, 0)
	}

	public pointInPolyline(point: Vector2, pl: Polyline): boolean {
		const bbox2: BBox2 = pl.bbox2
		if (!bbox2.isContainsPoint(point)) {
			return false
		}
		for (let pt of pl.primitives) {
			if (this.isInEdge(point, pt)) {
				return true
			}
		}
		if (!this.isClose(pl)) {
			return false
		}
		const points: Array<Vector2> = []
		pl.points(0.1, (p: Vector2): void => {
			points.push(p)
		})
		return this.isSelect(point.x, point.y, points)
	}

	public isInEdgeForPolyline(point: Vector2, pl: Polyline, precision: number = 1e-8): boolean {
		for (let pt of pl.primitives) {
			if (this.isInEdge(point, pt, precision)) {
				return true
			}
		}
		return false
	}

	public isInPrimitive(point: Vector2, pt: Primitive, precision: number = 1e-8): boolean {
		if (this.isInEdge(point, pt, precision)) {
			return true
		}
		return false
	}

	public isInPolyline(point: Vector2, pl: Polyline, grp: number = 0, ignorePrimitivesCheck: boolean = false, precision: number = 1e-8): boolean {
		const bbox2: BBox2 = pl.bbox2.extendByDist(precision)
		if (!bbox2.isContainsPoint(point)) {
			return false
		}
		if (!ignorePrimitivesCheck) {
			for (let pt of pl.primitives) {
				if (this.isInPrimitive(point, pt, precision)) {
					return true
				}
			}
		}
		const sides: Array<Side> = this.mapSides(pl, grp)
		for (let side of sides) {
			const bbox2: BBox2 = side.shape.bbox2
			if (bbox2.isContainsY(point.y) && DoubleKit.greater(bbox2.maxX, point.x)) {
				const pt: Primitive = side.shape
				if (pt instanceof Line) {
					const crossV: number = this._horizontal.cross(pt.direct)
					if (DoubleKit.eq(crossV, 0)) {
						/**
						 * pt 方向为平行 X 轴
						 **/
						let inLine: boolean = false
						if (DoubleKit.greatereq(side.startPoint.x, point.x)) {
							side.isIntersInStart = false
							inLine = !inLine
						}
						if (DoubleKit.greatereq(side.endPoint.x, point.x)) {
							side.isIntersInEnd = false
							inLine = !inLine
						}
						/**
						 * 当点 point 处于线段 L 上时, 视作在多边形内
						 */
						if (inLine) {
							side.othersIntersCount = 1
						}
						continue
					}
					/**
					 * 忽略交点在线段 L 的起点又在终点的情况
					 */
					if (
						DoubleKit.eq(side.startPoint.y, point.y) &&
						DoubleKit.greatereq(side.startPoint.x, point.x) &&
						DoubleKit.eq(side.endPoint.y, point.y) &&
						DoubleKit.greatereq(side.endPoint.x, point.x)
					) {
						continue
					}
					if (DoubleKit.eq(side.startPoint.y, point.y) && DoubleKit.greatereq(side.startPoint.x, point.x)) {
						side.isIntersInStart = true
						continue
					}
					if (DoubleKit.eq(side.endPoint.y, point.y) && DoubleKit.greatereq(side.endPoint.x, point.x)) {
						side.isIntersInEnd = true
						continue
					}
					const intersX: number =
						((side.endPoint.x - side.startPoint.x) / (side.endPoint.y - side.startPoint.y)) * (point.y - side.startPoint.y) +
						side.startPoint.x
					if (DoubleKit.greatereq(intersX, point.x)) {
						side.othersIntersCount = 1
					}
					continue
				}
				if (pt instanceof Arc) {
					const dis: number = point.distance(pt.centerPoint)
					if (DoubleKit.greatereq(Math.abs(pt.sweepAngle), 360)) {
						if (DoubleKit.lesseq(dis, pt.rx)) {
							side.othersIntersCount = 1
						}
						continue
					}
					const delta: number = Math.abs(point.y - pt.centerPoint.y)
					if (DoubleKit.eq(delta, pt.rx)) {
						if (DoubleKit.greatereq(side.startPoint.x, point.x) && DoubleKit.eq(side.startPoint.y, point.y)) {
							side.isIntersInStart = true
						}
						if (DoubleKit.greatereq(side.endPoint.x, point.x) && DoubleKit.eq(side.endPoint.y, point.y)) {
							side.isIntersInEnd = true
						}
						continue
					}
					const idx: number = intersArcY(pt, point.y)
					if (idx > 0) {
						for (let i: number = 0; i < idx; i += 2) {
							if (DoubleKit.greatereq(CACHE[i], point.x)) {
								const p: Vector2 = new Vector2(CACHE[i], CACHE[i + 1])
								if (p.equalsWithVector2(side.startPoint)) {
									side.isIntersInStart = true
									continue
								}
								if (p.equalsWithVector2(side.endPoint)) {
									side.isIntersInEnd = true
									continue
								}
								side.othersIntersCount += 1
							}
						}
					}
				}
			}
		}
		let count: number = 0
		for (let side of sides) {
			if (side.isIntersInEnd) {
				const next: Side = side.getNext()
				if (next !== null) {
					const direct: Vector2 = side.getEndPointDirect()
					const dir: Vector2 = next.getStartPointDirect()
					if (direct !== null && dir !== null && DoubleKit.greater(direct.y * dir.y, 0)) {
						count++
					}
				}
			}
			/**
			 * 考虑到圆弧可能存在既有交点在终点, 又有交点在圆弧非端点位置上, 此处需要把非端点位置上的交点数据一起加上
			 */
			count += side.othersIntersCount
		}
		sides.length = 0
		return count % 2 == 1
	}

	public isSelect(x: number, y: number, paths: Array<Vector2>): boolean {
		let result: boolean = false
		for (let i: number = 0, len: number = paths.length; i < len; i++) {
			const startPoint: Vector2 = paths[i]
			const endPoint: Vector2 = paths[i + 1]
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
		const s: Vector2 = paths[paths.length - 1]
		const e: Vector2 = paths[0]
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

	private isInEdge(point: Vector2, pt: Primitive, precision: number = 1e-8): boolean {
		const bbox2: BBox2 = pt.bbox2.extendByDist(precision)
		if (!bbox2.isContainsPoint(point)) {
			return false
		}
		if (pt instanceof Line) {
			const foot: Vector2 = Distance.foot(pt, point)
			const dis: number = foot.distance(point)
			if (DoubleKit.eq(dis, 0)) {
				return bbox2.isContainsPoint(point)
			}
			return false
		}
		if (pt instanceof Arc) {
			const dis: number = point.distance(pt.centerPoint)
			if (DoubleKit.eq(dis, pt.rx)) {
				return isOn(pt, point)
			}
			return false
		}
		return false
	}

	private isClose(pl: Polyline): boolean {
		if (pl.primitives.length > 0 && pl.primitives[0].startPoint.distance2(pl.primitives[pl.primitives.length - 1].endPoint) < 1e-8) {
			return true
		}
		return false
	}

	private mapSides(pl: Polyline, grp: number): Array<Side> {
		const sides: Array<Side> = []
		const points: Array<Vector2> = []
		pl.points(0.1, (p: Vector2): void => {
			points.push(p)
		})
		const pl2: Polyline = Polyline.build4(points)
		const pl3: Polyline = pl2.closeEndPooint()
		let idx: number = 0
		let last: Side = null!
		for (let pt of pl3.primitives) {
			const side: Side = new Side(pt, grp, idx)
			if (last !== null) {
				last.setNext(side)
				side.setPrev(last)
			}
			sides.push(side)
			last = side
			idx++
		}
		sides[sides.length - 1].setNext(sides[0])
		sides[0].setPrev(sides[sides.length - 1])
		return sides
	}
}
