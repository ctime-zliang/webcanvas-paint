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
			if (p instanceof Arc && p.isCicle) {
				ps.push(p)
				continue
			}
			const start: Vector2 = p.startPoint
			if (prev !== null && !start.equalsWithVector2(prev)) {
				ps.push(new Line(prev, start))
			}
			ps.push(p)
			if (p instanceof Arc) {
				prev = p.svgEnd
			} else {
				prev = p.endPoint
			}
		}
		if (ps.length === 0 && prev !== null) {
			ps.push(new Line(prev, prev))
		}
		return new Polyline(ps)
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
		if (this._bbox2 === null) {
			this._bbox2 = this.buildBBox2()
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

	public isClose(place: number): boolean {
		if (this.primitives.length <= 1 && !(this.primitives[0] instanceof Arc)) {
			return false
		}
		const start: Primitive = this.primitives[0]
		const end: Primitive = this.primitives[this.primitives.length - 1]
		return start.startPoint.equalsWithVector2(end.endPoint, place)
	}

	public asClose(): Polyline {
		throw new Error(`algorithm error.`)
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
			}
			if (nPt) {
				pts[i] = nPt
			}
		}
		return new Polyline(pts)
	}

	public mirrorX(yValue: number = 0): Polyline {
		throw new Error(`algorithm error.`)
	}

	public mirrorY(xValue: number = 0): Polyline {
		throw new Error(`algorithm error.`)
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

	public clone(): Polyline {
		return Polyline.build1(this.primitives)
	}

	public buildBBox2(): BBox2 {
		if (this._primitives.length === 0) {
			return new BBox2(0, 0, 0, 0)
		}
		let result: BBox2 = this._primitives[0].bbox2
		for (let i: number = 1; i < this._primitives.length; i++) {
			result = BBox2.extend2(result, this._primitives[i].bbox2)
		}
		return result
	}
}
