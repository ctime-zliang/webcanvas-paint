import { Primitive } from './Primitive'
import { BBox2 } from '../../../engine/algorithm/geometry/bbox/BBox2'
import { Vector2 } from '../../../engine/algorithm/geometry/vector/Vector2'
import { Line } from './Line'
import { Matrix3 } from '../../../engine/algorithm/geometry/matrix/Matrix3'
import { StructPrimitive } from './StructPrimitive'
import { Arc } from './Arc'

export class Polyline extends StructPrimitive<Polyline> {
	public static build1(primitives: Array<Primitive>): Polyline {
		const ps: Array<Primitive> = []
		let prev: Vector2 = null!
		for (let i: number = 0; i < primitives.length; i++) {
			const p: Primitive = primitives[i]
			const start: Vector2 = p.startPoint
			if (prev !== null && !start.equalsWithVector2(prev)) {
				ps.push(new Line(prev, start))
			}
			ps.push(p)
			prev = p.endPoint
		}
		if (ps.length === 0 && prev !== null) {
			ps.push(new Line(prev, prev))
		}
		return new Polyline(ps)
	}

	public static build2(points: Array<Vector2>): Polyline {
		const ps: Array<Primitive> = []
		let prev: Vector2 = null!
		for (let i: number = 0; i < points.length; i++) {
			const p: Vector2 = points[i]
			if (prev !== null) {
				ps.push(new Line(prev, p))
			}
			prev = p
		}
		return new Polyline(ps)
	}

	public static build3(xys: Array<number>): Polyline {
		const vs: Array<Vector2> = []
		for (let i: number = 0; i < xys.length; i += 2) {
			vs.push(new Vector2(xys[i], xys[i + 1]))
		}
		return this.build2(vs)
	}

	private _primitives: Array<Primitive>
	private _bbox2: BBox2
	constructor(primitives: Array<Primitive>) {
		super()
		this._bbox2 = null!
		this._primitives = primitives
	}

	public get primitives(): Array<Primitive> {
		return this._primitives
	}

	public get startPoint(): Vector2 {
		const pt: Primitive = this.primitives[0]
		return pt ? pt.startPoint : null!
	}

	public get endPoint(): Vector2 {
		const len: number = this.primitives.length
		const pt: Primitive = len > 0 ? this.primitives[len - 1] : null!
		return pt ? pt.endPoint : null!
	}

	public get bbox2(): BBox2 {
		if (this._bbox2 === null!) {
			let bbox2: BBox2 = new BBox2(0, 0, 0, 0)
			for (let i: number = 0; i < this.primitives.length; i++) {
				const pt: Primitive = this.primitives[i]
				bbox2 = BBox2.extend2(bbox2, pt.bbox2)
			}
			this._bbox2 = bbox2
		}
		return this._bbox2
	}

	public getArea(resolution: number): number {
		let [startPoint, prevPoint]: [Vector2, Vector2] = [null!, null!]
		let sum: number = 0
		this.points(resolution, (nowPoint: Vector2): void => {
			if (prevPoint) {
				sum += (nowPoint.x + prevPoint.x) * (nowPoint.y - prevPoint.y)
			} else {
				startPoint = nowPoint
			}
			prevPoint = nowPoint
		})
		sum += (startPoint.x + prevPoint.x) * (startPoint.y - prevPoint.y)
		return sum / 2
	}

	public isClosed(place?: number): boolean {
		if (this.primitives.length <= 1) {
			const p1: Primitive = this.primitives[0]
			if (p1 && p1 instanceof Arc && p1.isCicle) {
				return true
			}
			return false
		}
		const start: Primitive = this.primitives[0]
		const end: Primitive = this.primitives[this.primitives.length - 1]
		return start.startPoint.equalsWithVector2(end.endPoint, place)
	}

	public asClose(): Polyline {
		const start: Primitive = this.primitives[0]
		const end: Primitive = this.primitives[this.primitives.length - 1]
		const [startPoint, endPoint]: [Vector2, Vector2] = [start.startPoint, end.endPoint]
		if (!startPoint.equalsWithVector2(endPoint)) {
			const pts: Array<Primitive> = []
			for (let i: number = 0; i < this.primitives.length; i++) {
				pts.push(this.primitives[i])
			}
			pts.push(new Line(endPoint, startPoint))
			return Polyline.build1(pts)
		}
		return this
	}

	public closeEndPooint(): Polyline {
		const start: Primitive = this.primitives[0]
		const end: Primitive = this.primitives[this.primitives.length - 1]
		const [startPoint, endPoint]: [Vector2, Vector2] = [start.startPoint, end.endPoint]
		if (!startPoint.equalsWithVector2(endPoint)) {
			const pts: Array<Primitive> = []
			for (let i: number = 0; i < this.primitives.length; i++) {
				pts.push(this.primitives[i])
			}
			pts.push(new Line(endPoint, startPoint))
			return new Polyline(pts)
		}
		return this
	}

	public reverse(): Polyline {
		const pts: Array<Primitive> = new Array(this.primitives.length)
		for (let i: number = 0, j = this.primitives.length - 1; j >= 0; i++, j--) {
			const pt: Primitive = this.primitives[j]
			let nPt: Primitive = null!
			if (pt instanceof Line) {
				nPt = new Line(pt.endPoint, pt.startPoint)
			} else if (pt instanceof Arc) {
				nPt = pt.exchangeSweep()
			} else {
				continue
			}
			if (nPt) {
				pts[i] = nPt
			}
		}
		return new Polyline(pts)
	}

	public mirrorX(origin: Vector2 = Vector2.ORIGIN): Polyline {
		const pts: Array<Primitive> = []
		for (let i: number = 0; i < this.primitives.length; i++) {
			const pt: Primitive = this.primitives[i]
			let nPt: Primitive = null!
			if (pt instanceof Line) {
				nPt = pt.mirrorX(origin)
			} else if (pt instanceof Arc) {
				nPt = pt.mirrorX(origin)
			} else {
				continue
			}
			if (nPt) {
				pts[i] = nPt
			}
		}
		return new Polyline(pts)
	}

	public mirrorY(origin: Vector2 = Vector2.ORIGIN): Polyline {
		const pts: Array<Primitive> = []
		for (let i: number = 0; i < this.primitives.length; i++) {
			const pt: Primitive = this.primitives[i]
			let nPt: Primitive = null!
			if (pt instanceof Line) {
				nPt = pt.mirrorY(origin)
			} else if (pt instanceof Arc) {
				nPt = pt.mirrorY(origin)
			} else {
				continue
			}
			if (nPt) {
				pts[i] = nPt
			}
		}
		return new Polyline(pts)
	}

	public points(resolution: number, calback: (vec: Vector2) => void): void {
		if (this.primitives.length <= 0) {
			return
		}
		for (let i: number = 0; i < this.primitives.length - 1; i++) {
			const points: Array<Vector2> = this.primitives[i].toPoints(resolution)
			points.pop()
			for (let j: number = 0; j < points.length; j++) {
				calback(points[j])
			}
		}
		const points: Array<Vector2> = this.primitives[this.primitives.length - 1].toPoints(resolution)
		for (let j: number = 0; j < points.length; j++) {
			calback(points[j])
		}
	}

	public multiplyMatrix3(matrix3: Matrix3): Polyline {
		const pts: Array<Primitive> = new Array(this.primitives.length)
		for (let i: number = 0; i < this.primitives.length; i++) {
			pts[i] = this.primitives[i].multiplyMatrix3(matrix3)
		}
		return Polyline.build1(pts)
	}

	public isClose(place: number): boolean {
		if (this.primitives.length <= 1 && !(this.primitives[0] instanceof Arc)) {
			return false
		}
		const start: Primitive = this.primitives[0]
		const end: Primitive = this.primitives[this.primitives.length - 1]
		return start.startPoint.equalsWithVector2(end.endPoint, place)
	}

	public isEqual(pl: Polyline): boolean {
		if (!(pl instanceof Polyline)) {
			return false
		}
		if (pl.primitives.length !== this.primitives.length) {
			return false
		}
		for (let i: number = 0; i < pl.primitives.length; i++) {
			const pt1: Primitive = pl.primitives[i]
			const pt2: Primitive = this.primitives[i]
			if (JSON.stringify(pt1) !== JSON.stringify(pt2)) {
				return false
			}
		}
		return true
	}

	public clone(): Polyline {
		return Polyline.build1(this.primitives)
	}

	public putItem(item: Primitive | Polyline, place?: number): boolean {
		if (!item) {
			return false
		}
		if (item instanceof Polyline) {
			return this.mergePolyline(item, place)
		}
		const [startPoint, endPoint]: [Vector2, Vector2] = [this.startPoint, this.endPoint]
		if (!startPoint) {
			this.primitives.push(item)
			this._bbox2 = item.bbox2
			return true
		}
		if (startPoint.equalsWithVector2(endPoint, place)) {
			return false
		}
		const [itemStartPoint, itemEndPoint]: [Vector2, Vector2] = [item.startPoint, item.endPoint]
		let [reverse, isEnd]: [boolean, boolean] = [true, false]
		if (startPoint.equalsWithVector2(itemStartPoint, place)) {
			/**
			 * S-S
			 */
			reverse = true
			isEnd = false
		} else if (startPoint.equalsWithVector2(itemEndPoint, place)) {
			/**
			 * S-E
			 */
			reverse = false
			isEnd = false
		} else if (endPoint.equalsWithVector2(itemStartPoint, place)) {
			/**
			 * E-S
			 */
			reverse = false
			isEnd = true
		} else if (endPoint.equalsWithVector2(itemEndPoint, place)) {
			/**
			 * E-E
			 */
			reverse = true
			isEnd = true
		} else {
			return false
		}
		if (isEnd) {
			this.primitives.push(reverse ? item.reverse() : item)
		} else {
			this.primitives.unshift(reverse ? item.reverse() : item)
		}
		this._bbox2 = BBox2.extend2(this._bbox2, item.bbox2)
		return true
	}

	private mergePolyline(item: Polyline, place?: number): boolean {
		if (!item) {
			return false
		}
		const [startPoint, endPoint]: [Vector2, Vector2] = [this.startPoint, this.endPoint]
		if (!startPoint) {
			this.primitives.push(...item.primitives)
			this._bbox2 = item.bbox2
			return true
		}
		if (startPoint.equalsWithVector2(endPoint, place)) {
			return false
		}
		const [itemStartPoint, itemEndPoint]: [Vector2, Vector2] = [item.startPoint, item.endPoint]
		let [reverse, isEnd]: [boolean, boolean] = [true, false]
		if (startPoint.equalsWithVector2(itemStartPoint, place)) {
			/**
			 * S-S
			 */
			reverse = true
			isEnd = false
		} else if (startPoint.equalsWithVector2(itemEndPoint, place)) {
			/**
			 * S-E
			 */
			reverse = false
			isEnd = false
		} else if (endPoint.equalsWithVector2(itemStartPoint, place)) {
			/**
			 * E-S
			 */
			reverse = false
			isEnd = true
		} else if (endPoint.equalsWithVector2(itemEndPoint, place)) {
			/**
			 * E-E
			 */
			reverse = true
			isEnd = true
		} else {
			return false
		}
		const newItem: Polyline = reverse ? item.reverse() : item
		if (isEnd) {
			this.primitives.push(...newItem.primitives)
		} else {
			this.primitives.unshift(...newItem.primitives)
		}
		this._bbox2 = BBox2.extend2(this._bbox2, item.bbox2)
		return true
	}
}
