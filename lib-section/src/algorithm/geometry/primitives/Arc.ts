import { Vector2 } from '../../../engine/algorithm/geometry/vector/Vector2'
import { ESweep } from '../../../engine/config/CommonProfile'
import { Matrix3 } from '../../../engine/algorithm/geometry/matrix/Matrix3'
import { Angles } from '../../../engine/math/Angles'
import { BBox2 } from '../../../engine/algorithm/geometry/bbox/BBox2'
import { Polyline } from './Polyline'
import { ECanvasD2LineCap } from '../../../engine/config/PrimitiveProfile'
import { Primitive } from './Primitive'
import { DoubleKit } from '../../../engine/math/Doublekit'
import { Triangle } from './Triangle'

export class Arc extends Primitive {
	public static build1(startPoint: Vector2, endPoint: Vector2, rx: number, ry: number, isLarge: boolean, sweep: ESweep): Arc {
		rx = Math.abs(rx)
		ry = Math.abs(ry)
		const isCircle: boolean = startPoint.equalsWithVector2(endPoint)
		if (isCircle) {
			return new Arc(rx, ry, startPoint, 0, isLarge ? Math.PI * 2 : 0)
		}
		const [x0, y0]: [number, number] = [startPoint.x, -startPoint.x]
		const [x, y]: [number, number] = [endPoint.x, -endPoint.y]
		const sweepFlag: boolean = sweep === ESweep.CW
		const [dx2, dy2]: [number, number] = [(x0 - x) / 2, (y0 - y) / 2]
		const [cosV, sinV]: [number, number] = [Math.cos(0), Math.sin(0)]
		const [x1, y1]: [number, number] = [cosV * dx2 + sinV * dy2, -sinV * dx2 + cosV * dy2]
		const [Prx, Pry]: [number, number] = [rx * rx, ry * ry]
		const [Px1, Py1]: [number, number] = [x1 * x1, y1 * y1]
		let [sign, sq]: [number, number] = [isLarge === sweepFlag ? -1 : 1, (Prx * Pry - Prx * Py1 - Pry * Px1) / (Prx * Py1 + Pry * Px1)]
		sq = sq < 0 ? 0 : sq
		const coef: number = (sign = Math.sqrt(sq))
		const [cx1, cy1]: [number, number] = [coef * ((rx * y1) / ry), coef * -((ry * x1) / rx)]
		const [sx2, sy2]: [number, number] = [(x0 + x) / 2, (y0 + y) / 2]
		const [cx, cy]: [number, number] = [sx2 + (cosV * cx1 - sinV * cy1), sy2 + (sinV * cx1 + cosV * cy1)]
		const [ux, uy]: [number, number] = [(x1 - cx1) / rx, (y1 - cy1) / ry]
		const [vx, vy]: [number, number] = [(-x1 - cx1) / rx, (-y1 - cy1) / ry]
		let [p, n]: [number, number] = [ux, Math.sqrt(ux * ux + uy * uy)]
		sign = uy < 0 ? -1.0 : 1.0
		const angleStart: number = Angles.radianToDegree(sign * Math.acos(p / n))
		n = Math.sqrt((ux * ux + uy * uy) * (vx * vx + vy * vy))
		p = ux * vx + uy * vy
		sign = ux * vy - uy * vx < 0 ? -1.0 : 1.0
		const pn: number = p / n
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
			angleExtent -= Math.PI * 2
		} else if (sweepFlag && angleExtent < 0) {
			angleExtent += Math.PI * 2
		}
		const lambda: number = (dx2 * dx2) / Prx + (dy2 * dy2) / Pry
		const distance: number = startPoint.distance(endPoint) / 2
		if (rx < distance && ry < distance) {
			rx *= Math.sqrt(lambda)
			ry *= Math.sqrt(lambda)
		}
		const startRadian: number = isCircle ? 0 : Angles.regularDegress(-angleStart)
		const sweepRadian: number = isCircle ? (isLarge ? Math.PI * 2 : 0) : -angleExtent
		return new Arc(rx, ry, new Vector2(cx, -cy), startRadian, sweepRadian)
	}

	public static build2(center: Vector2, startRadian: number, endRadian: number, rx: number, ry: number, sweep: ESweep): Arc {
		let sweepRadian: number = undefined!
		if (startRadian === endRadian) {
			startRadian = Angles.regularDegress(startRadian)
			endRadian = Angles.regularDegress(endRadian)
			sweepRadian = 0
		} else {
			startRadian = Angles.radianToDegree(startRadian)
			endRadian = Angles.regularDegress(endRadian)
			if (sweep === ESweep.CCW) {
				if (endRadian <= startRadian) {
					endRadian += Math.PI * 2
				}
			} else {
				if (endRadian >= startRadian) {
					startRadian += Math.PI * 2
				}
			}
			sweepRadian = endRadian - startRadian
		}
		return new Arc(rx, ry, center, Angles.radianToDegree(startRadian), sweepRadian)
	}

	public static build3(center: Vector2, startRadian: number, sweepRadian: number, rx: number, ry: number): Arc {
		return new Arc(rx, ry, center, Angles.radianToDegree(startRadian), sweepRadian)
	}

	public static build4(startPoint: Vector2, endPoint: Vector2, center: Vector2, rx: number, ry: number, sweep: ESweep): Arc {
		const startRadian: number = Angles.radianToDegree(startPoint.getRadianByVector2(center))
		const endRadian: number = Angles.radianToDegree(endPoint.getRadianByVector2(center))
		return Arc.build2(center, startRadian, endRadian, rx, ry, sweep)
	}

	public static build5(startPoint: Vector2, endPoint: Vector2, radian: number): Arc {
		const direct: Vector2 = endPoint.sub(startPoint)
		const v: Vector2 = new Vector2(-direct.y / direct.x).normalize()
		const radian2: number = Math.abs(radian) / 2
		if (radian2 === 0) {
			throw new Error(`cannot represent a cirlce.`)
		}
		const radius: number = direct.length / 2 / Math.sin(radian2)
		const direct1: Vector2 = v.rotateSurround(Vector2.ORIGIN, radian2)
		let sweep: ESweep = ESweep.CCW
		let center: Vector2 = null!
		if (radian > 0) {
			sweep = ESweep.CCW
			center = endPoint.add(direct1.scale(radius))
		} else {
			sweep = ESweep.CW
			center = startPoint.sub(direct1.scale(radius))
		}
		const startRadian: number = Angles.radianToDegree(startPoint.getRadianByVector2(center))
		const endRadian: number = Angles.radianToDegree(endPoint.getRadianByVector2(center))
		return Arc.build2(center, startRadian, endRadian, radius, radius, sweep)
	}

	public static buildCircle(center: Vector2, r: number, sweep: ESweep): Arc {
		return Arc.build2(center, 0, Math.PI * 2, r, r, sweep)
	}

	private readonly _startRadian: number
	private readonly _sweepRadian: number
	private _startPoint: Vector2
	private _endPoint: Vector2
	private _rx: number
	private _ry: number
	private _centerPoint: Vector2
	private _bbox2: BBox2
	private _svgEnd: Vector2
	constructor(rx: number, ry: number, centerPoint: Vector2, startRadian: number, sweepRadian: number) {
		super()
		this._rx = rx
		this._ry = ry
		this._centerPoint = centerPoint
		this._startRadian = startRadian
		this._sweepRadian = sweepRadian
		this._bbox2 = null!
		this._svgEnd = null!
		this._startPoint = this.pointOn(startRadian)
		this._endPoint = this.pointOn(startRadian + sweepRadian)
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

	public get startRadian(): number {
		return this._startRadian
	}

	public get endRadian(): number {
		return this.startRadian + this.sweepRadian
	}

	public get isOverHalfCircle(): boolean {
		return Math.abs(this.sweepRadian) > Math.PI
	}

	public get isCicle(): boolean {
		return DoubleKit.eq(Math.abs(this.sweepRadian), Math.PI * 2) || (this.startPoint.equalsWithVector2(this.endPoint) && this.rx === this.ry)
	}

	public get sweepRadian(): number {
		return this._sweepRadian
	}

	public get rx(): number {
		return this._rx
	}

	public get ry(): number {
		return this._ry
	}

	public get sweep(): ESweep {
		return this.sweepRadian >= 0 ? ESweep.CCW : ESweep.CW
	}

	public get bbox2(): BBox2 {
		if (this._bbox2 === null) {
			this._bbox2 = this.buildBBox2()
		}
		return this._bbox2
	}

	public get length(): number {
		return Math.abs(this.rx * this.sweepRadian)
	}

	public get svgEnd(): Vector2 {
		if (this._svgEnd === null) {
			this._svgEnd = this.getSvgEnd(this.startRadian, this.sweepRadian, this.startPoint, this.endPoint)
		}
		return this._svgEnd
	}

	public toString(): string {
		return `Arc (${this.centerPoint.x}, ${this.centerPoint.y}, ${this.rx}, ${this.ry}, ${this.startRadian}, ${this.sweepRadian})`
	}

	public pointOn(radian: number): Vector2 {
		if (radian === 0) {
			return this._centerPoint.add(new Vector2(this.rx, 0))
		}
		if (radian === Math.PI / 2) {
			return this._centerPoint.add(new Vector2(0, this.ry))
		}
		if (radian === (Math.PI * 3) / 2) {
			return this._centerPoint.add(new Vector2(0, -this.ry))
		}
		const [rx2, ry2]: [number, number] = [this.rx * this.rx, this.ry * this.ry]
		const tg: number = Math.tan(radian)
		const tg2: number = tg * tg
		let [x, y]: [number, number] = [Math.sqrt((rx2 * ry2) / (ry2 + rx2 * tg2)), Math.sqrt((rx2 * ry2) / (rx2 + ry2 / tg2))]
		if (radian > Math.PI / 2 && radian < (Math.PI * 3) / 2) {
			x = -x
		}
		if (radian > Math.PI && radian < Math.PI * 2) {
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
		return Arc.build3(this.centerPoint, this.startRadian + this.sweepRadian, -this.sweepRadian, this.rx, this.ry)
	}

	public exchangeSweepAndStart(): Arc {
		return Arc.build1(this.endPoint, this.startPoint, this.rx, this.ry, this.isOverHalfCircle, this.sweepRadian >= 0 ? ESweep.CW : ESweep.CCW)
	}

	public mirrorX(yValue: number = 0): Arc {
		if (this.startPoint.equalsWithVector2(this.endPoint)) {
			return Arc.build3(this.centerPoint.mirrorSurroundX(), 0, Math.PI * 2, this.rx, this.ry)
		}
		return Arc.build1(
			this.startPoint.mirrorSurroundX(yValue),
			this.endPoint.mirrorSurroundX(yValue),
			this.rx,
			this.ry,
			this.isOverHalfCircle,
			this.sweepRadian >= 0 ? ESweep.CW : ESweep.CCW
		)
	}

	public mirrorY(xValue: number = 0): Arc {
		if (this.startPoint.equalsWithVector2(this.endPoint)) {
			return Arc.build3(this.centerPoint.mirrorSurroundY(), 0, Math.PI * 2, this.rx, this.ry)
		}
		return Arc.build1(
			this.startPoint.mirrorSurroundY(xValue),
			this.endPoint.mirrorSurroundY(xValue),
			this.rx,
			this.ry,
			this.isOverHalfCircle,
			this.sweepRadian >= 0 ? ESweep.CW : ESweep.CCW
		)
	}

	public multiplyMatrix3(matrix3: Matrix3): Arc {
		let sw: number = undefined!
		if (matrix3.isMirrored()) {
			sw = -this.sweepRadian
		} else {
			sw = this.sweepRadian
		}
		let sa: number = undefined!
		if (matrix3.equals(Matrix3.ROT_90)) {
			sa = Angles.toQuarterDegree(this.startRadian + Math.PI / 2)
		} else if (matrix3.equals(Matrix3.ROT_N90)) {
			sa = Angles.regularDegress(this.startRadian - Math.PI / 2)
		} else {
			sa = Angles.radianToDegree(Angles.transform(Angles.degreeToRadian(this.startRadian), matrix3))
		}
		return Arc.build3(this.centerPoint.multiplyMatrix3(matrix3), sa, sw, matrix3.iScale * this.rx, matrix3.iScale * this.ry)
	}

	public sectorArea(): number {
		return Math.abs(this.sweepRadian) * this.rx * this.ry
	}

	public getArea(): number {
		let triArea: number = Triangle.getArea(this.centerPoint, this.startPoint, this.pointOn(this.endRadian))
		return this.sectorArea() - triArea
	}

	public getMiddlePoint(): Vector2 {
		const sweepRadian: number = Math.abs(this.sweepRadian)
		const [v1, v2]: [Vector2, Vector2] = [this.startPoint.sub(this.centerPoint), this.endPoint.sub(this.centerPoint)]
		let centerDirect: Vector2 = v1.add(v2).normalize()
		if (sweepRadian > Math.PI) {
			centerDirect = centerDirect.mul(-1)
		}
		return this.centerPoint.add(centerDirect.mul(this.rx))
	}

	public storke(width: number, cap: ECanvasD2LineCap, sweep: ESweep): Polyline {
		const halfWidth: number = width / 2
		const [rxLarge, ryLarge]: [number, number] = [this.rx + halfWidth, this.ry + halfWidth]
		let [rxSmall, rySmall]: [number, number] = [this.rx - halfWidth, this.ry - halfWidth]
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
		let [a1, a2]: [Arc, Arc] = [null!, null!]
		if (sweep === this.sweep) {
			a1 = Arc.build3(this.centerPoint, this.startRadian, this.sweepRadian, rxLarge, ryLarge)
			a2 = Arc.build3(this.centerPoint, this.startRadian + this.sweepRadian, -this.sweepRadian, rxSmall, rySmall)
		} else {
			a1 = Arc.build3(this.centerPoint, this.startRadian + this.sweepRadian, -this.sweepRadian, rxLarge, ryLarge)
			a2 = Arc.build3(this.centerPoint, this.startRadian, this.sweepRadian, rxSmall, rySmall)
		}
		a2 = a2.multiplyMatrix3(a2Matrix)
		switch (cap) {
			case ECanvasD2LineCap.ROUND: {
				const sweepRadian: number = sweep === ESweep.CCW ? Math.PI : -Math.PI
				const [c1, c2]: [Vector2, Vector2] = [
					sweep === this.sweep ? this.pointOn(this.endRadian) : this.pointOn(this.startRadian),
					sweep === this.sweep ? this.pointOn(this.startRadian) : this.pointOn(this.endRadian),
				]
				const [startRadian1, startRadian2]: [number, number] = [
					Angles.radianToDegree(a1.pointOn(a1.endRadian).getRadianByVector2(c1)),
					Angles.radianToDegree(a2.pointOn(a2.endRadian).getRadianByVector2(c2)),
				]
				return Polyline.build1([
					a1,
					Arc.build3(c1, startRadian1, sweepRadian, halfWidth, halfWidth),
					a2,
					Arc.build3(c2, startRadian2, sweepRadian, halfWidth, halfWidth),
				])
			}
			default: {
				return Polyline.build1([a1, a2])
			}
		}
	}

	public toPoints(resolution: number): Array<Vector2> {
		if (this.rx <= resolution) {
			return [this.startPoint, this.getSvgEnd(this.startRadian, this.sweepRadian, this.startPoint, this.endPoint)]
		}
		const cos: number = (this.rx - resolution) / this.rx
		let cnt: number = Math.ceil(Math.abs(this.sweepRadian / Angles.radianToDegree(Math.acos(cos)) / 2))
		cnt = Math.max(cnt, 2)
		const ps: Array<Vector2> = new Array(cnt + 1)
		let step: number = this.sweepRadian / cnt
		let radian: number = this.startRadian
		for (let i: number = 0; i <= cnt; i++, radian += step) {
			ps[i] = this.pointOn(radian)
		}
		return ps
	}

	public getMidPoint(): Vector2 {
		const [startRadian, endRadian]: [number, number] = [this.startRadian, this.endRadian]
		const [sweep, centerPoint, radius]: [ESweep, Vector2, number] = [this.sweep, this.centerPoint, this.rx]
		if (sweep === ESweep.CCW) {
			if (endRadian > startRadian) {
				let radian: number = (endRadian - startRadian) / 2 + startRadian
				let midPoint: Vector2 = centerPoint.add(new Vector2(Math.cos(radian), Math.sin(radian)).mul(radius))
				return midPoint
			}
			if (endRadian === startRadian) {
				let midPoint: Vector2 = centerPoint.add(new Vector2(Math.cos((Math.PI * 3) / 2), Math.sin((Math.PI * 3) / 2)).mul(radius))
				return midPoint
			}
			let radian: number = (endRadian + Math.PI * 2 - startRadian) / 2 + startRadian
			let midPoint: Vector2 = centerPoint.add(new Vector2(Math.cos(radian), Math.sin(radian)).mul(radius))
			return midPoint
		}
		if (endRadian > startRadian) {
			let radian: number = (startRadian + Math.PI * 2 - endRadian) / 2 + endRadian
			let midPoint: Vector2 = centerPoint.add(new Vector2(Math.cos(radian), Math.sin(radian)).mul(radius))
			return midPoint
		}
		if (endRadian === startRadian) {
			let midPoint: Vector2 = centerPoint.add(new Vector2(Math.cos((Math.PI * 3) / 2), Math.sin((Math.PI * 3) / 2)).mul(radius))
			return midPoint
		}
		const radian: number = (startRadian - endRadian) / 2 + endRadian
		const midPoint: Vector2 = centerPoint.add(new Vector2(Math.cos(radian), Math.sin(radian)).mul(radius))
		return midPoint
	}

	public isInArea(point: Vector2, width: number): boolean {
		const { x, y } = point
		const centerPoint: Vector2 = this.centerPoint
		const radius: number = this.rx
		let startRadian: number = Angles.degreeToRadian(this.startRadian)
		if (this.sweep === ESweep.CW) {
			startRadian = Angles.degreeToRadian(this.endRadian)
		}
		let endRadian: number = Angles.degreeToRadian(this.endRadian)
		if (this.sweep === ESweep.CW) {
			endRadian = Angles.degreeToRadian(this.startRadian)
		}
		const [innerRadius, outerRadius]: [number, number] = [radius - width / 2, radius + width / 2]
		const [dx, dy]: [number, number] = [x - centerPoint.x, y - centerPoint.y]
		let radian: number = Math.atan2(dy, dx)
		if (radian < 0) {
			endRadian += Math.PI * 2
		}
		if (
			(startRadian <= endRadian && radian >= startRadian && radian <= endRadian) ||
			(startRadian > endRadian && ((radian >= startRadian && radian <= Math.PI * 2) || (radian >= 0 && radian <= endRadian))) ||
			startRadian === endRadian
		) {
			let r: number = Math.sqrt(dx * dx + dy * dy)
			if (r <= outerRadius && r >= innerRadius) {
				return true
			}
			return false
		}
		let r: number = (outerRadius + innerRadius) / 2
		const [startP, endP]: [Vector2, Vector2] = [
			new Vector2(centerPoint.x + Math.cos(startRadian) * r, centerPoint.y + Math.sin(startRadian) * r),
			new Vector2(centerPoint.x + Math.cos(endRadian) * r, centerPoint.y + Math.sin(endRadian) * r),
		]
		const [dx1, dy1]: [number, number] = [x - startP.x, y - startP.y]
		const [dx2, dy2]: [number, number] = [x - endP.x, y - endP.y]
		if (dx1 * dx1 + dy1 * dy1 <= (width * width) / 4) {
			return true
		}
		if (dx2 * dx2 + dy2 * dy2 <= (width * width) / 4) {
			return true
		}
		return false
	}

	public reverse(): Arc {
		return Arc.build1(this.endPoint, this.startPoint, this.rx, this.ry, this.isOverHalfCircle, this.sweepRadian >= 0 ? ESweep.CW : ESweep.CCW)
	}

	private buildBBox2(): BBox2 {
		const endRadian: number = this.startRadian + this.sweepRadian
		let [minX, maxX, minY, maxY]: [number, number, number, number] = [0, 0, 0, 0]
		if (this.sweepRadian > 0) {
			let nextAngle: number = 0
			while (nextAngle < endRadian) {
				if (nextAngle >= this.startRadian) {
					const point: Vector2 = this.pointOn(Angles.radianToDegree(nextAngle))
					minX = Math.min(minX, point.x)
					maxX = Math.max(maxX, point.x)
					minY = Math.min(minY, point.y)
					maxY = Math.max(maxY, point.y)
				}
				nextAngle += Math.PI / 2
			}
		} else if (this.sweepRadian < 0) {
			let nextAngle: number = Math.PI * 2
			while (nextAngle > endRadian) {
				if (nextAngle <= this.startRadian) {
					const point: Vector2 = this.pointOn(Angles.radianToDegree(nextAngle))
					minX = Math.min(minX, point.x)
					maxX = Math.max(maxX, point.x)
					minY = Math.min(minY, point.y)
					maxY = Math.max(maxY, point.y)
				}
				nextAngle -= Math.PI / 2
			}
		}
		return new BBox2(minX, minY, maxX, maxY)
	}

	private getSvgEnd(startRadian: number, sweepRadian: number, startPoint: Vector2, endPoint: Vector2): Vector2 {
		let step: number = sweepRadian >= 0 ? -0.01 : 0.01
		let endRadian: number = startRadian + sweepRadian
		while (
			((sweepRadian >= 0 && endRadian > startRadian) || (sweepRadian < 0 && endRadian < startRadian)) &&
			startPoint.distance(endPoint) < 0.0002
		) {
			step *= 2
			endRadian += step
			endPoint = this.pointOn(endRadian)
		}
		return endPoint
	}
}
