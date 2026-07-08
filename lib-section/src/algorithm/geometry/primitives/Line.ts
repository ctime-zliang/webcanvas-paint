import { BBox2 } from '../../../engine/algorithm/geometry/bbox/BBox2'
import { Matrix3 } from '../../../engine/algorithm/geometry/matrix/Matrix3'
import { Vector2 } from '../../../engine/algorithm/geometry/vector/Vector2'
import { DoubleKit } from '../../../engine/math/Doublekit'
import { ESweep } from '../../../engine/config/CommonProfile'
import { ECanvasD2LineCap } from '../../../engine/config/PrimitiveProfile'
import { Arc } from './Arc'
import { Polyline } from './Polyline'
import { Primitive } from './Primitive'

export class Line extends Primitive {
	private _startPoint: Vector2
	private _endPoint: Vector2
	private _a: number
	private _b: number
	private _c: number
	private _hashsed: number
	private _direct: Vector2
	constructor(startPoint: Vector2, endPoint: Vector2) {
		super()
		this._startPoint = startPoint
		this._endPoint = endPoint
		this._a = null!
		this._b = null!
		this._c = null!
		this._hashsed = null!
		this._direct = null!
	}

	public get startPoint(): Vector2 {
		return this._startPoint
	}
	public set startPoint(value: Vector2) {
		this._startPoint = value
	}

	public get endPoint(): Vector2 {
		return this._endPoint
	}
	public set endPoint(value: Vector2) {
		this._endPoint = value
	}

	public get a(): number {
		if (this._a === null) {
			if (this.startPoint.equalsWithPoint(this.endPoint)) {
				this._a = NaN
				this._b = NaN
				this._c = NaN
			} else {
				this._a = this.endPoint.y - this.startPoint.y
				this._b = this.endPoint.x - this.startPoint.x
				this._c = this.endPoint.x * this.startPoint.y - this.startPoint.x * this.endPoint.y
			}
		}
		return this._a
	}

	public get b(): number {
		if (this._b === null) {
			if (this.startPoint.equalsWithPoint(this.endPoint)) {
				this._a = NaN
				this._b = NaN
				this._c = NaN
			} else {
				this._a = this.endPoint.y - this.startPoint.y
				this._b = this.startPoint.x - this.endPoint.x
				this._c = this.endPoint.x * this.startPoint.y - this.startPoint.x * this.endPoint.y
			}
		}
		return this._b
	}

	public get c(): number {
		if (this._c === null) {
			if (this.startPoint.equalsWithPoint(this.endPoint)) {
				this._a = NaN
				this._b = NaN
				this._c = NaN
			} else {
				this._a = this.endPoint.y - this.startPoint.y
				this._b = this.startPoint.x - this.endPoint.x
				this._c = this.endPoint.x * this.startPoint.y - this.startPoint.x * this.endPoint.y
			}
		}
		return this._c
	}

	public get direct(): Vector2 {
		if (this._direct === null) {
			this._direct = this._endPoint.sub(this.startPoint).normalize()
		}
		return this._direct
	}

	public get bbox2(): BBox2 {
		const minX: number = Math.min(this.startPoint.x, this.endPoint.x)
		const maxX: number = Math.max(this.startPoint.x, this.endPoint.x)
		const minY: number = Math.min(this.startPoint.y, this.endPoint.y)
		const maxY: number = Math.max(this.startPoint.y, this.endPoint.y)
		return new BBox2(minX, minY, maxX, maxY)
	}

	public get length(): number {
		return this.startPoint.distance(this.endPoint)
	}

	public toString(): string {
		return `Line (${this.startPoint.x}, ${this.startPoint.y}, ${this.endPoint.x}, ${this.endPoint.y})`
	}

	public toPoints(): Array<Vector2> {
		return [this.startPoint, this.endPoint]
	}

	public reverse(): Primitive {
		return new Line(this.endPoint, this.startPoint)
	}

	public isPoint(): boolean {
		if ((this, this.startPoint.distance(this.endPoint) <= DoubleKit.eps1)) {
			return true
		}
		return this.startPoint.equalsWithVector2(this.endPoint)
	}

	public multiplyMatrix3(matrix3: Matrix3): Line {
		return new Line(this._startPoint.multiplyMatrix3(matrix3), this._endPoint.multiplyMatrix3(matrix3))
	}

	public mirrorX(yValue: number = 0): Line {
		return new Line(this.startPoint.mirrorSurroundX(yValue), this.endPoint.mirrorSurroundX(yValue))
	}

	public mirrorY(xValue: number = 0): Line {
		return new Line(this.startPoint.mirrorSurroundY(xValue), this.endPoint.mirrorSurroundY(xValue))
	}

	public mirrorO(origin: Vector2 = Vector2.ORIGIN): Line {
		return new Line(
			this.startPoint.mirrorSurroundY(origin.x).mirrorSurroundX(origin.y),
			this.endPoint.mirrorSurroundY(origin.x).mirrorSurroundX(origin.y)
		)
	}

	public isParallel(stLine: Line, needSameDir: boolean = false): boolean {
		const parallel: boolean = DoubleKit.eq(Math.abs(this.direct.cross(stLine.direct)), 0)
		const isSameDir: boolean = !needSameDir || DoubleKit.greatereq(this.direct.dot(stLine.direct), 0)
		return parallel && isSameDir
	}

	public distance(point: Vector2): number {
		const [AB, AP]: [{ x: number; y: number }, { x: number; y: number }] = [
			{ x: this.endPoint.x - this.startPoint.x, y: this.endPoint.y - this.startPoint.y },
			{ x: point.x - this.startPoint.x, y: point.y - this.startPoint.y },
		]
		const [dot, lenSq]: [number, number] = [AB.x * AP.x + AB.y * AP.y, AB.x * AB.x + AB.y * AB.y]
		let t: number = dot / lenSq
		if (t < 0) {
			t = 0
		}
		if (t > 1) {
			t = 1
		}
		const D: { x: number; y: number } = {
			x: this.startPoint.x + t * AB.x,
			y: this.startPoint.y + t * AB.y,
		}
		const [dx, dy]: [number, number] = [point.x - D.x, point.y - D.y]
		return Math.sqrt(dx * dx + dy * dy)
	}

	public stroke(width: number, cap: ECanvasD2LineCap, sweep: ESweep): Polyline {
		// let origin: Vector2 = null!
		// let [xOff, yOff]: [number, number] = [undefined!, undefined!]
		// if (this.endPoint.x < this.startPoint.x) {
		// 	xOff = this.startPoint.x - this.endPoint.x
		// 	yOff = this.startPoint.y - this.endPoint.y
		// 	origin = this.endPoint
		// } else {
		// 	xOff = this.endPoint.x - this.startPoint.x
		// 	yOff = this.endPoint.y - this.startPoint.y
		// 	origin = this.startPoint
		// }
		// const length: number = Math.sqrt(xOff * xOff + yOff * yOff)
		// const halfWidth: number = width / 2
		// let pl: Polyline = null!
		// let [left, right]: [number, number] = [undefined!, undefined!]
		// if (cap === ECanvasD2LineCap.SQUARE) {
		// 	left = -halfWidth
		// 	right = length + halfWidth
		// } else {
		// 	left = 0
		// 	right = length
		// }
		// if (cap === ECanvasD2LineCap.BUTT || cap === ECanvasD2LineCap.SQUARE) {
		// 	if (sweep === ESweep.CW) {
		// 		pl = Polyline.build3([left, -halfWidth, left, halfWidth, right, halfWidth, right, -halfWidth])
		// 	} else {
		// 		pl = Polyline.build3([left, halfWidth, left, -halfWidth, right, -halfWidth, right, halfWidth])
		// 	}
		// } else {
		// 	if (sweep === ESweep.CW) {
		// 		pl = Polyline.build1([
		// 			Arc.build3(new Vector2(left, 0), -Math.PI / 2, -Math.PI, halfWidth),
		// 			Arc.build3(new Vector2(right, 0), Math.PI / 2, -Math.PI, halfWidth),
		// 		])
		// 	} else {
		// 		pl = Polyline.build1([
		// 			Arc.build3(new Vector2(left, 0), Math.PI / 2, Math.PI, halfWidth),
		// 			Arc.build3(new Vector2(right, 0), -Math.PI / 2, Math.PI, halfWidth),
		// 		])
		// 	}
		// }
		// const orientation: number = Math.atan2(yOff, xOff)
		// pl = pl.asClose()
		// return pl.multiplyMatrix3(Matrix3.rotate(orientation).multiply3(Matrix3.translate(origin.x, origin.y)))
		throw new Error(`algorithm error.`)
	}
}
