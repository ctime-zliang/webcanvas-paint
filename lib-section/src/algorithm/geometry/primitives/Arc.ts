import { Vector2 } from '../../../engine/algorithm/geometry/vector/Vector2'
import { ESweep } from '../../../engine/config/CommonProfile'
import { Matrix3 } from '../../../engine/algorithm/geometry/matrix/Matrix3'
import { Angles } from '../../../engine/math/Angles'
import { BBox2 } from '../../../engine/algorithm/geometry/bbox/BBox2'
import { Polyline } from './Polyline'
import { ECanvas2DLineCap } from '../../../engine/config/PrimitiveProfile'
import { Primitive } from './Primitive'
import { DoubleKit } from '../../../engine/math/Doublekit'
import { Triangle } from './Triangle'

export class Arc extends Primitive {
	public static build1(startPoint: Vector2, endPoint: Vector2, rx: number, ry: number, isLarge: boolean, sweep: ESweep): Arc {
		let isCircle: boolean = startPoint.equalsWithVector2(endPoint)
		if (isCircle) {
			return new Arc(rx, ry, startPoint, 0, isLarge ? 360 : 0)
		}
		let x0: number = startPoint.x
		let y0: number = -startPoint.x
		let x: number = endPoint.x
		let y: number = -endPoint.y
		let sweepFlag: boolean = sweep === ESweep.CW
		let dx2: number = (x0 - x) / 2
		let dy2: number = (y0 - y) / 2
		let cosV: number = Math.cos(0)
		let sinV: number = Math.sin(0)
		let x1: number = cosV * dx2 + sinV * dy2
		let y1: number = -sinV * dx2 + cosV * dy2
		rx = Math.abs(rx)
		ry = Math.abs(ry)
		let Prx: number = rx * rx
		let Pry: number = ry * ry
		let Px1: number = x1 * x1
		let Py1: number = y1 * y1
		let sign: number = isLarge === sweepFlag ? -1 : 1
		let sq: number = (Prx * Pry - Prx * Py1 - Pry * Px1) / (Prx * Py1 + Pry * Px1)
		sq = sq < 0 ? 0 : sq
		let coef: number = (sign = Math.sqrt(sq))
		let cx1: number = coef * ((rx * y1) / ry)
		let cy1: number = coef * -((ry * x1) / rx)
		let sx2: number = (x0 + x) / 2
		let sy2: number = (y0 + y) / 2
		let cx: number = sx2 + (cosV * cx1 - sinV * cy1)
		let cy: number = sy2 + (sinV * cx1 + cosV * cy1)
		let ux: number = (x1 - cx1) / rx
		let uy: number = (y1 - cy1) / ry
		let vx: number = (-x1 - cx1) / rx
		let vy: number = (-y1 - cy1) / ry
		let p: number = ux
		let n: number = Math.sqrt(ux * ux + uy * uy)
		sign = uy < 0 ? -1.0 : 1.0
		let angleStart: number = Angles.radianToDegree(sign * Math.acos(p / n))
		n = Math.sqrt((ux * ux + uy * uy) * (vx * vx + vy * vy))
		p = ux * vx + uy * vy
		sign = ux * vy - uy * vx < 0 ? -1.0 : 1.0
		let pn: number = p / n
		let acos: number = undefined!
		if (pn < -1) {
			acos = Math.cos(-1)
		} else if (pn > 1) {
			acos = Math.acos(1)
		} else {
			acos = Math.acos(pn)
		}
		let angleExtent: number = Angles.radianToDegree(sign * acos)
		if (!sweepFlag && angleExtent > 0) {
			angleExtent -= 360.0
		} else if (sweepFlag && angleExtent < 0) {
			angleExtent += 360.0
		}
		let lambda: number = (dx2 * dx2) / Prx + (dy2 * dy2) / Pry
		let distance: number = startPoint.distance(endPoint) / 2
		if (rx < distance && ry < distance) {
			rx *= Math.sqrt(lambda)
			ry *= Math.sqrt(lambda)
		}
		let startAngle: number = isCircle ? 0 : Angles.regularDegress(-angleStart)
		let sweepAngle: number = isCircle ? (isLarge ? 360 : 0) : -angleExtent
		return new Arc(rx, ry, new Vector2(cx, -cy), startAngle, sweepAngle)
	}

	public static build2(center: Vector2, startAngle: number, endAngle: number, rx: number, ry: number, sweep: ESweep): Arc {
		let sweepAngle: number = undefined!
		if (startAngle === endAngle) {
			startAngle = Angles.regularDegress(startAngle)
			endAngle = Angles.regularDegress(endAngle)
			sweepAngle = 0
		} else {
			startAngle = Angles.radianToDegree(startAngle)
			endAngle = Angles.regularDegress(endAngle)
			if (sweep === ESweep.CCW) {
				if (endAngle <= startAngle) {
					endAngle += 360.0
				}
			} else {
				if (endAngle >= startAngle) {
					startAngle += 360.0
				}
			}
			sweepAngle = endAngle - startAngle
		}
		return new Arc(rx, ry, center, Angles.radianToDegree(startAngle), sweepAngle)
	}

	public static build3(center: Vector2, startAngle: number, sweepAngle: number, rx: number, ry: number): Arc {
		return new Arc(rx, ry, center, Angles.radianToDegree(startAngle), sweepAngle)
	}

	public static build4(startPoint: Vector2, endPoint: Vector2, center: Vector2, rx: number, ry: number, sweep: ESweep): Arc {
		const startAngle: number = Angles.radianToDegree(startPoint.getRadianByVector2(center))
		const endAngle: number = Angles.radianToDegree(endPoint.getRadianByVector2(center))
		return Arc.build2(center, startAngle, endAngle, rx, ry, sweep)
	}

	public static build5(startPoint: Vector2, endPoint: Vector2, angle: number): Arc {
		let radian: number = Angles.degreeToRadian(angle)
		let direct: Vector2 = endPoint.sub(startPoint)
		let v: Vector2 = new Vector2(-direct.y / direct.x).normalize()
		let angle2: number = Math.abs(angle) / 2
		let radius: number = 0
		if (angle2 === 0) {
			throw new Error(`cannot represent a cirlce.`)
		}
		radius = direct.length / 2 / Math.sin(angle2)
		let direct1: Vector2 = v.rotateSurround(Vector2.ORIGIN, angle2)
		let sweep: ESweep = ESweep.CCW
		let center: Vector2 = null!
		if (angle > 0) {
			sweep = ESweep.CCW
			center = endPoint.add(direct1.scale(radius))
		} else {
			sweep = ESweep.CW
			center = startPoint.sub(direct1.scale(radius))
		}
		let startAngle: number = Angles.radianToDegree(startPoint.getRadianByVector2(center))
		let endAngle: number = Angles.radianToDegree(endPoint.getRadianByVector2(center))
		return Arc.build2(center, startAngle, endAngle, radius, radius, sweep)
	}

	public static buildCircle(center: Vector2, r: number, sweep: ESweep): Arc {
		return Arc.build2(center, 0, 360, r, r, sweep)
	}

	private readonly _startAngle: number
	private readonly _sweepAngle: number
	private _startPoint: Vector2
	private _endPoint: Vector2
	private _rx: number
	private _ry: number
	private _centerPoint: Vector2
	private _bbox2: BBox2
	private _svgEnd: Vector2
	constructor(rx: number, ry: number, centerPoint: Vector2, startAngle: number, sweepAngle: number) {
		super()
		this._rx = rx
		this._ry = ry
		this._centerPoint = centerPoint
		this._startAngle = startAngle
		this._sweepAngle = sweepAngle
		this._bbox2 = null!
		this._svgEnd = null!
		this._startPoint = this.pointOn(startAngle)
		this._endPoint = this.pointOn(startAngle + sweepAngle)
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

	public get centerPoint(): Vector2 {
		return this._centerPoint
	}

	public get startAngle(): number {
		return this._startAngle
	}

	public get endAngle(): number {
		return this.startAngle + this.sweepAngle
	}

	public get isLarge(): boolean {
		return Math.abs(this.sweepAngle) > 180
	}

	public get sweepAngle(): number {
		return this._sweepAngle
	}

	public get rx(): number {
		return this._rx
	}

	public get ry(): number {
		return this._ry
	}

	public get sweep(): ESweep {
		return this.sweepAngle >= 0 ? ESweep.CCW : ESweep.CW
	}

	public get bbox2(): BBox2 {
		if (this._bbox2 === null) {
			this._bbox2 = this.buildBBox2()
		}
		return this._bbox2
	}

	public get length(): number {
		return Math.abs((this.rx * this.sweepAngle * Math.PI) / 180)
	}

	public get svgEnd(): Vector2 {
		if (this._svgEnd === null) {
			this._svgEnd = this.getSvgEnd(this.startAngle, this.sweepAngle, this.startPoint, this.endPoint)
		}
		return this._svgEnd
	}

	public toString(): string {
		return `Line ()`
	}

	public pointOn(degree: number): Vector2 {
		const degree2: number = Angles.regularDegress(degree)
		const { rx, ry } = this
		if (degree2 === 0) {
			return this._centerPoint.add(new Vector2(rx, 0))
		}
		if (degree2 === 90) {
			return this._centerPoint.add(new Vector2(0, ry))
		}
		if (degree2 === 270) {
			return this._centerPoint.add(new Vector2(0, -ry))
		}
		const rx2: number = rx * rx
		const ry2: number = ry * ry
		const tg: number = Math.tan(Angles.degreeToRadian(degree2))
		const tg2: number = tg * tg
		let y: number = Math.sqrt((rx2 * ry2) / (rx2 + ry2 / tg2))
		let x: number = Math.sqrt((rx2 * ry2) / (ry2 + rx2 * tg2))
		if (degree2 > 90 && degree2 < 270) {
			x = -x
		}
		if (degree2 > 180 && degree2 < 360) {
			y = -y
		}
		if (Number.isNaN(x)) {
			x = 0
		}
		if (Number.isNaN(y)) {
			y = 0
		}
		return this._centerPoint.add(new Vector2(x, y))
	}

	public exchangeSweep(): Arc {
		return Arc.build3(this.centerPoint, this.startAngle + this.sweepAngle, -this.sweepAngle, this.rx, this.ry)
	}

	public exchangeSweepAndStart(): Arc {
		return Arc.build1(this.endPoint, this.startPoint, this.rx, this.ry, this.isLarge, this.sweepAngle >= 0 ? ESweep.CW : ESweep.CCW)
	}

	public mirror(origin?: Vector2): Arc {
		if (this.startPoint.equalsWithVector2(this.endPoint)) {
			return Arc.build3(this.centerPoint.mirrorSurroundY(), 0, 360, this.rx, this.ry)
		}
		return Arc.build1(
			this.startPoint.mirrorSurroundY(origin),
			this.endPoint.mirrorSurroundY(origin),
			this.rx,
			this.ry,
			this.isLarge,
			this.sweepAngle >= 0 ? ESweep.CW : ESweep.CCW
		)
	}

	public sectorArea(): number {
		return (Math.abs(this.sweepAngle) / 360.0) * Math.PI * this.rx * this.ry
	}

	public getArea(): number {
		let triArea: number = Triangle.getArea(this.centerPoint, this.startPoint, this.pointOn(this.endAngle))
		return this.sectorArea() - triArea
	}

	public multiply3(matrix3: Matrix3): Arc {
		let sw: number = undefined!
		if (matrix3.isMirrored()) {
			sw = -this.sweepAngle
		} else {
			sw = this.sweepAngle
		}
		let sa: number = undefined!
		if (matrix3.equals(Matrix3.ROT_90)) {
			sa = Angles.toQuarterDegree(this.startAngle + 90)
		} else if (matrix3.equals(Matrix3.ROT_N90)) {
			sa = Angles.regularDegress(this.startAngle - 90)
		} else {
			sa = Angles.radianToDegree(Angles.transform(Angles.degreeToRadian(this.startAngle), matrix3))
		}
		return Arc.build3(this.centerPoint.multiplyMatrix3(matrix3), sa, sw, matrix3.iScale * this.rx, matrix3.iScale * this.ry)
	}

	public storke(width: number, cap: ECanvas2DLineCap, sweep: ESweep): Polyline {
		const halfWidth: number = width / 2
		const rxLarge: number = this.rx + halfWidth
		const ryLarge: number = this.ry + halfWidth
		let rxSmall: number = this.rx - halfWidth
		let rySmall: number = this.ry - halfWidth
		let a2Matrix: Matrix3 = new Matrix3()
		if (rxSmall < 0) {
			rxSmall = -rxSmall
			a2Matrix = a2Matrix.multiply3(Matrix3.MIRROR_Y)
		}
		if (rySmall < 0) {
			rySmall = -rySmall
			a2Matrix = a2Matrix.multiply3(Matrix3.MIRROR_X)
		}
		if (rxSmall === 0) {
			rxSmall = 0.001
		}
		if (rySmall === 0) {
			rySmall = 0.001
		}
		a2Matrix = a2Matrix.setOrigin(this.centerPoint.x, this.centerPoint.y)
		let a1: Arc = null!
		let a2: Arc = null!
		if (sweep === this.sweep) {
			a1 = Arc.build3(this.centerPoint, this.startAngle, this.sweepAngle, rxLarge, ryLarge)
			a2 = Arc.build3(this.centerPoint, this.startAngle + this.sweepAngle, -this.sweepAngle, rxSmall, rySmall)
		} else {
			a1 = Arc.build3(this.centerPoint, this.startAngle + this.sweepAngle, -this.sweepAngle, rxLarge, ryLarge)
			a2 = Arc.build3(this.centerPoint, this.startAngle, this.sweepAngle, rxSmall, rySmall)
		}
		a2 = a2.multiply3(a2Matrix)
		switch (cap) {
			case ECanvas2DLineCap.ROUND: {
				const sweepAngle: number = sweep === ESweep.CCW ? 180 : -180
				const c1: Vector2 = sweep === this.sweep ? this.pointOn(this.endAngle) : this.pointOn(this.startAngle)
				const c2: Vector2 = sweep === this.sweep ? this.pointOn(this.startAngle) : this.pointOn(this.endAngle)
				const startAngle1: number = Angles.radianToDegree(a1.pointOn(a1.endAngle).getRadianByVector2(c1))
				const startAngle2: number = Angles.radianToDegree(a2.pointOn(a2.endAngle).getRadianByVector2(c2))
				return Polyline.build2([
					a1,
					Arc.build3(c1, startAngle1, sweepAngle, halfWidth, halfWidth),
					a2,
					Arc.build3(c2, startAngle2, sweepAngle, halfWidth, halfWidth),
				])
			}
			default: {
				return Polyline.build2([a1, a2])
			}
		}
	}

	public points(resolution: number): Array<Vector2> {
		if (this.rx <= resolution) {
			return [this.startPoint, this.getSvgEnd(this.startAngle, this.sweepAngle, this.startPoint, this.endPoint)]
		}
		const cos: number = (this.rx - resolution) / this.rx
		let cnt: number = Math.ceil(Math.abs(this.sweepAngle / Angles.radianToDegree(Math.acos(cos)) / 2))
		cnt = Math.max(cnt, 2)
		const ps: Array<Vector2> = new Array(cnt + 1)
		let step: number = this.sweepAngle / cnt
		let angle: number = this.startAngle
		for (let i: number = 0; i <= cnt; i++, angle += step) {
			ps[i] = this.pointOn(angle)
		}
		return ps
	}

	public getMidPoint(): Vector2 {
		let startAngle: number = this.startAngle
		let endAngle: number = this.endAngle
		let sweep: ESweep = this.sweep
		let centerPoint: Vector2 = this.centerPoint
		let radius: number = this.rx
		if (sweep === ESweep.CCW) {
			if (endAngle > startAngle) {
				let angle: number = (endAngle - startAngle) / 2 + startAngle
				let midPoint: Vector2 = centerPoint.add(new Vector2(Math.cos(angle), Math.sin(angle)).mul(radius))
				return midPoint
			}
			if (endAngle === startAngle) {
				let midPoint: Vector2 = centerPoint.add(new Vector2(Math.cos((Math.PI * 3) / 2), Math.sin((Math.PI * 3) / 2)).mul(radius))
				return midPoint
			}
			let angle: number = (endAngle + Math.PI * 2 - startAngle) / 2 + startAngle
			let midPoint: Vector2 = centerPoint.add(new Vector2(Math.cos(angle), Math.sin(angle)).mul(radius))
			return midPoint
		}
		if (endAngle > startAngle) {
			let angle: number = (startAngle + Math.PI * 2 - endAngle) / 2 + endAngle
			let midPoint: Vector2 = centerPoint.add(new Vector2(Math.cos(angle), Math.sin(angle)).mul(radius))
			return midPoint
		}
		if (endAngle === startAngle) {
			let midPoint: Vector2 = centerPoint.add(new Vector2(Math.cos((Math.PI * 3) / 2), Math.sin((Math.PI * 3) / 2)).mul(radius))
			return midPoint
		}
		let angle: number = (startAngle - endAngle) / 2 + endAngle
		let midPoint: Vector2 = centerPoint.add(new Vector2(Math.cos(angle), Math.sin(angle)).mul(radius))
		return midPoint
	}

	public isInArea(point: Vector2, width: number): boolean {
		const { x, y } = point
		let centerPoint: Vector2 = this.centerPoint
		let radius: number = this.rx
		let startAngle: number = Angles.degreeToRadian(this.startAngle)
		if (this.sweep === ESweep.CW) {
			startAngle = Angles.degreeToRadian(this.endAngle)
		}
		let endAngle: number = Angles.degreeToRadian(this.endAngle)
		if (this.sweep === ESweep.CW) {
			endAngle = Angles.degreeToRadian(this.startAngle)
		}
		const innerRadius: number = radius - width / 2
		const outerRadius: number = radius + width / 2
		let dx: number = x - centerPoint.x
		let dy: number = y - centerPoint.y
		let angle: number = Math.atan2(dy, dx)
		if (angle < 0) {
			endAngle += Math.PI * 2
		}
		if (
			(startAngle <= endAngle && angle >= startAngle && angle <= endAngle) ||
			(startAngle > endAngle && ((angle >= startAngle && angle <= Math.PI * 2) || (angle >= 0 && angle <= endAngle))) ||
			startAngle === endAngle
		) {
			let r: number = Math.sqrt(dx * dx + dy * dy)
			if (r <= outerRadius && r >= innerRadius) {
				return true
			}
			return false
		}
		let r: number = (outerRadius + innerRadius) / 2
		let startP: Vector2 = new Vector2(centerPoint.x + Math.cos(startAngle) * r, centerPoint.y + Math.sin(startAngle) * r)
		let endP: Vector2 = new Vector2(centerPoint.x + Math.cos(endAngle) * r, centerPoint.y + Math.sin(endAngle) * r)
		let dx1: number = x - startP.x
		let dy1: number = y - startP.y
		let dx2: number = x - endP.x
		let dy2: number = y - endP.y
		if (dx1 * dx1 + dy1 * dy1 <= (width * width) / 4) {
			return true
		}
		if (dx2 * dx2 + dy2 * dy2 <= (width * width) / 4) {
			return true
		}
		return false
	}

	public isCicle(): boolean {
		return DoubleKit.eq(Math.abs(this.sweepAngle), 360) || (this.startPoint.equalsWithVector2(this.endPoint) && this.rx === this.ry)
	}

	public reverse(): Arc {
		return Arc.build1(this.endPoint, this.startPoint, this.rx, this.ry, this.isLarge, this.sweepAngle >= 0 ? ESweep.CW : ESweep.CCW)
	}

	private buildBBox2(): BBox2 {
		const endAngle: number = this.startAngle + this.sweepAngle
		let minX: number = 0
		let maxX: number = 0
		let minY: number = 0
		let maxY: number = 0
		if (this.sweepAngle > 0) {
			let nextAngle: number = 0
			while (nextAngle < endAngle) {
				if (nextAngle >= this.startAngle) {
					const point: Vector2 = this.pointOn(Angles.radianToDegree(nextAngle))
					minX = Math.min(minX, point.x)
					maxX = Math.max(maxX, point.x)
					minY = Math.min(minY, point.y)
					maxY = Math.max(maxY, point.y)
				}
				// nextAngle += 90
				nextAngle += Math.PI / 2
			}
		} else if (this.sweepAngle < 0) {
			let nextAngle: number = 360
			while (nextAngle > endAngle) {
				if (nextAngle <= this.startAngle) {
					const point: Vector2 = this.pointOn(Angles.radianToDegree(nextAngle))
					minX = Math.min(minX, point.x)
					maxX = Math.max(maxX, point.x)
					minY = Math.min(minY, point.y)
					maxY = Math.max(maxY, point.y)
				}
				// nextAngle -= 90
				nextAngle -= Math.PI / 2
			}
		}
		return new BBox2(minX, minY, maxX, maxY)
	}

	private getSvgEnd(startAngle: number, sweepAngle: number, startPoint: Vector2, endPoint: Vector2): Vector2 {
		let step: number = sweepAngle >= 0 ? -0.01 : 0.01
		let endAngle: number = startAngle + sweepAngle
		while (((sweepAngle >= 0 && endAngle > startAngle) || (sweepAngle < 0 && endAngle < startAngle)) && startPoint.distance(endPoint) < 0.0002) {
			step *= 2
			endAngle += step
			endPoint = this.pointOn(endAngle)
		}
		return endPoint
	}
}
