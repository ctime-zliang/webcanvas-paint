import { BBox2 } from '../../../engine/algorithm/geometry/bbox/BBox2'
import { Matrix3 } from '../../../engine/algorithm/geometry/matrix/Matrix3'
import { Vector2 } from '../../../engine/algorithm/geometry/vector/Vector2'
import { DoubleKit } from '../../../engine/math/Doublekit'
import { ESweep } from '../../../engine/config/CommonProfile'
import { ECanvas2DLineCap } from '../../../engine/config/PrimitiveProfile'
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

	public points(): Array<Vector2> {
		return [this.startPoint, this.endPoint]
	}

	public reverse(): Primitive {
		return new Line(this.endPoint, this.startPoint)
	}

	public getCenter(): Vector2 {
		return this.startPoint.add(this.endPoint).mul(0.5)
	}

	public isPoint(): boolean {
		const { x: sx, y: sy } = this.startPoint
		const { x: ex, y: ey } = this.endPoint
		if ((ex - sx) * (ex - sx) + (ey - sy) * (ey - sy) <= 1e-8) {
			return true
		}
		return this.startPoint.equalsWithPoint(this.endPoint)
	}

	public isPoint1(): boolean {
		if ((this, this.startPoint.distance(this.endPoint) <= 1e-8)) {
			return true
		}
		return this.startPoint.equalsWithVector2(this.endPoint)
	}

	public getLength(): number {
		return this.startPoint.distance(this.endPoint)
	}

	public multiply3(matrix3: Matrix3): Line {
		return new Line(this._startPoint.multiplyMatrix3(matrix3), this._endPoint.multiplyMatrix3(matrix3))
	}

	public mirror(origin?: Vector2): Line {
		return new Line(this.startPoint.mirrorSurroundY(origin), this.endPoint.mirrorSurroundY(origin))
	}

	public isParallel(stLine: Line, needSameDir: boolean = false): boolean {
		const parallel: boolean = DoubleKit.eq(Math.abs(this.direct.cross(stLine.direct)), 0)
		const isSameDir: boolean = !needSameDir || DoubleKit.greatereq(this.direct.dot(stLine.direct), 0)
		return parallel && isSameDir
	}

	public distance(point: Vector2): number {
		return 0
	}

	public distance2(point: Vector2): number {
		return 0
	}

	public storke(width: number, cap: ECanvas2DLineCap, sweep: ESweep): Polyline {
		let origin: Vector2 = null!
		let xOff: number = undefined!
		let yOff: number = undefined!
		if (this.endPoint.x < this.startPoint.x) {
			xOff = this.startPoint.x - this.endPoint.x
			yOff = this.startPoint.y - this.endPoint.y
			origin = this.endPoint
		} else {
			xOff = this.endPoint.x - this.startPoint.x
			yOff = this.endPoint.y - this.startPoint.y
			origin = this.startPoint
		}
		const length: number = Math.sqrt(xOff * xOff + yOff * yOff)
		const halfWidth: number = width / 2
		let pl: Polyline = null!
		let left: number = undefined!
		let right: number = undefined!
		if (cap === ECanvas2DLineCap.SQUARE) {
			left = -halfWidth
			right = length + halfWidth
		} else {
			left = 0
			right = length
		}
		if (cap === ECanvas2DLineCap.BUTT || cap === ECanvas2DLineCap.SQUARE) {
			if (sweep === ESweep.CW) {
				pl = Polyline.build5([left, -halfWidth, left, halfWidth, right, halfWidth, right, -halfWidth])
			} else {
				pl = Polyline.build5([left, halfWidth, left, -halfWidth, right, -halfWidth, right, halfWidth])
			}
		} else {
			if (sweep === ESweep.CW) {
				pl = Polyline.build2([
					Arc.build3(new Vector2(left, 0), -90, -180, halfWidth, halfWidth),
					Arc.build3(new Vector2(right, 0), 90, -180, halfWidth, halfWidth),
				])
			} else {
				pl = Polyline.build2([
					Arc.build3(new Vector2(left, 0), 90, 180, halfWidth, halfWidth),
					Arc.build3(new Vector2(right, 0), -90, 180, halfWidth, halfWidth),
				])
			}
		}
		const orientation: number = Math.atan2(yOff, xOff)
		pl = pl.asClose()
		return pl.multiply3(Matrix3.rotate(orientation).multiply3(Matrix3.translate(origin.x, origin.y)))
	}

	public isInArea(point: Vector2, width: number, cap: ECanvas2DLineCap): boolean {
		const { x, y } = point
		let start: Vector2 = this.startPoint
		let end: Vector2 = this.endPoint
		const isRound: boolean = cap === ECanvas2DLineCap.ROUND ? true : false
		const dx: number = x - start.x
		const dy: number = y - start.y
		const dx2: number = x - end.x
		const dy2: number = y - end.y
		const X: number = end.x - start.y
		const Y: number = end.y - start.y
		const vertical: Vector2 = new Vector2(Y, X).normalize()
		const limitX: number = X + (vertical.x * width) / 2
		const limitY: number = Y + (vertical.y * width) / 2
		const limit: number = limitX * limitX + limitY * limitY
		const len: number = dx * dx + dy * dy
		const len2: number = dx2 * dx2 + dy2 * dy2
		const area: number = Math.abs(dx * Y - dy * X) / 2
		const length: number = Math.sqrt(X * X + Y * Y)
		const area2: number = (length * width) / 4
		if (area <= area2 && len <= limit && len2 <= limit) {
			if (isRound) {
				return true
			}
			const p2end: Vector2 = new Vector2(x, y).sub(end).normalize()
			const p2start: Vector2 = new Vector2(x, y).sub(start).normalize()
			const cross: number = new Vector2(vertical.x, vertical.y).cross(p2end)
			const corss1: number = new Vector2(vertical.x, vertical.y).cross(p2start)
			if (cross >= 0 && corss1 < +0) {
				return true
			}
			return false
		}
		if (isRound) {
			const r: number = width / 2
			if (len <= r * r) {
				return true
			}
			if (len2 <= r * r) {
				return true
			}
			return false
		}
		return false
	}
}
