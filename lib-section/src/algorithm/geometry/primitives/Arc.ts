import { Vector2 } from '../../../engine/algorithm/geometry/vector/Vector2'
import { ESweep } from '../../../engine/config/CommonProfile'
import { Matrix3 } from '../../../engine/algorithm/geometry/matrix/Matrix3'
import { Angles } from '../../../engine/math/Angles'
import { BBox2 } from '../../../engine/algorithm/geometry/bbox/BBox2'
import { Polyline } from './Polyline'
import { ECanvasD2LineCap } from '../../../engine/config/PrimitiveProfile'
import { Primitive } from './Primitive'
import { DoubleKit } from '../../../engine/math/Doublekit'

export class Arc extends Primitive {
	public static build1(startPoint: Vector2, endPoint: Vector2, radius: number, isLarge: boolean, sweep: ESweep): Arc {
		radius = Math.abs(radius)
		const isCircle: boolean = startPoint.equalsWithVector2(endPoint)
		if (isCircle) {
			return new Arc(radius, startPoint, 0, isLarge ? Math.PI * 2 : 0)
		}
		const [x0, y0]: [number, number] = [startPoint.x, -startPoint.x]
		const [x, y]: [number, number] = [endPoint.x, -endPoint.y]
		const sweepFlag: boolean = sweep === ESweep.CW
		const [dx2, dy2]: [number, number] = [(x0 - x) / 2, (y0 - y) / 2]
		const [cosV, sinV]: [number, number] = [Math.cos(0), Math.sin(0)]
		const [x1, y1]: [number, number] = [cosV * dx2 + sinV * dy2, -sinV * dx2 + cosV * dy2]
		const [Prx, Pry]: [number, number] = [radius * radius, radius * radius]
		const [Px1, Py1]: [number, number] = [x1 * x1, y1 * y1]
		let sign: number = isLarge === sweepFlag ? -1 : 1
		let sq: number = (Prx * Pry - Prx * Py1 - Pry * Px1) / (Prx * Py1 + Pry * Px1)
		sq = sq < 0 ? 0 : sq
		const coef: number = (sign = Math.sqrt(sq))
		const [cx1, cy1]: [number, number] = [coef * ((radius * y1) / radius), coef * -((radius * x1) / radius)]
		const [sx2, sy2]: [number, number] = [(x0 + x) / 2, (y0 + y) / 2]
		const [cx, cy]: [number, number] = [sx2 + (cosV * cx1 - sinV * cy1), sy2 + (sinV * cx1 + cosV * cy1)]
		const [ux, uy]: [number, number] = [(x1 - cx1) / radius, (y1 - cy1) / radius]
		const [vx, vy]: [number, number] = [(-x1 - cx1) / radius, (-y1 - cy1) / radius]
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
		if (radius < distance) {
			radius *= Math.sqrt(lambda)
		}
		const startRadian: number = isCircle ? 0 : Angles.regularDegress(-angleStart)
		const sweepRadian: number = isCircle ? (isLarge ? Math.PI * 2 : 0) : -angleExtent
		return new Arc(radius, new Vector2(cx, -cy), startRadian, sweepRadian)
	}

	public static build2(center: Vector2, startRadian: number, endRadian: number, rx: number, sweep: ESweep): Arc {
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
		return new Arc(rx, center, Angles.radianToDegree(startRadian), sweepRadian)
	}

	public static build4(startPoint: Vector2, endPoint: Vector2, center: Vector2, rx: number, sweep: ESweep): Arc {
		const startRadian: number = Angles.radianToDegree(startPoint.getRadianByVector2(center))
		const endRadian: number = Angles.radianToDegree(endPoint.getRadianByVector2(center))
		return Arc.build2(center, startRadian, endRadian, rx, sweep)
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
		return Arc.build2(center, startRadian, endRadian, radius, sweep)
	}

	public static buildCircle(center: Vector2, r: number, sweep: ESweep): Arc {
		return Arc.build2(center, 0, Math.PI * 2, r, sweep)
	}

	private readonly _startRadian: number
	private readonly _endRadian: number
	private readonly _sweep: ESweep
	private _startPoint: Vector2
	private _endPoint: Vector2
	private _radius: number
	private _centerPoint: Vector2
	private _bbox2: BBox2
	private _svgEnd: Vector2
	constructor(radius: number, centerPoint: Vector2, startRadian: number, endRadian: number) {
		super()
		this._radius = radius
		this._centerPoint = centerPoint
		this._startRadian = startRadian
		this._endRadian = endRadian
		this._sweep = this._endRadian >= this._startRadian ? ESweep.CCW : ESweep.CW
		this._bbox2 = null!
		this._svgEnd = null!
		this._startPoint = this.pointOn(startRadian)
		this._endPoint = this.pointOn(startRadian + (this._endRadian - this._startRadian))
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
		return this._endRadian
	}

	public get sweepRadian(): number {
		const start = this.startRadian
		const end = this.endRadian
		if (this.sweep === ESweep.CCW) {
			return end >= start ? end - start : end + Math.PI * 2 - start
		}
		return end <= start ? -(start - end) : -(start + Math.PI * 2 - end)
	}

	public get isOverHalfCircle(): boolean {
		return Math.abs(this.sweepRadian) > Math.PI
	}

	public get isCicle(): boolean {
		return DoubleKit.eq(Math.abs(this.sweepRadian), Math.PI * 2) || this.startPoint.equalsWithVector2(this.endPoint)
	}

	public get radius(): number {
		return this._radius
	}

	public get sweep(): ESweep {
		return this._sweep
	}

	public get bbox2(): BBox2 {
		if (this._bbox2 === null) {
			this._bbox2 = this.buildBBox2()
		}
		return this._bbox2
	}

	public get length(): number {
		return Math.abs(this.radius * this.sweepRadian)
	}

	public get svgEnd(): Vector2 {
		if (this._svgEnd === null) {
			this._svgEnd = this.getSvgEnd(this.startRadian, this.sweepRadian, this.startPoint, this.endPoint)
		}
		return this._svgEnd
	}

	public toString(): string {
		return `Arc (${this.centerPoint.x}, ${this.centerPoint.y}, ${this.radius}, ${this.startRadian}, ${this.sweepRadian})`
	}

	/**
	 * 求圆/圆弧上对应弧度的点坐标
	 */
	public pointOn(radian: number): Vector2 {
		radian %= Math.PI * 2
		if (radian < 0) {
			radian += Math.PI * 2
		}
		return this._centerPoint.add(new Vector2(this.radius * Math.cos(radian), this.radius * Math.sin(radian)))
	}

	/**
	 * 将圆弧的旋转方向反向, 并保持其他参数不变, 生成新的圆弧
	 */
	public exchangeSweep(): Arc {
		return new Arc(this.radius, this.centerPoint, this.endRadian, -this.startRadian)
	}

	public mirrorX(yValue: number = 0): Arc {
		throw new Error(`algorithm error.`)
	}

	public mirrorY(xValue: number = 0): Arc {
		throw new Error(`algorithm error.`)
	}

	public mirrorO(origin: Vector2 = Vector2.ORIGIN): Arc {
		throw new Error(`algorithm error.`)
	}

	public multiplyMatrix3(matrix3: Matrix3): Arc {
		throw new Error(`algorithm error.`)
	}

	public stroke(strokeWidth: number, cap: ECanvasD2LineCap, sweep: ESweep): Polyline {
		throw new Error(`algorithm error.`)
	}

	/**
	 * 圆弧离散采样, 限制折线与圆弧之间的最大误差不超过 resolution
	 */
	public toPoints(resolution: number): Array<Vector2> {
		if (this.radius <= resolution) {
			return [this.startPoint, this.getSvgEnd(this.startRadian, this.sweepRadian, this.startPoint, this.endPoint)]
		}
		/**
		 * 圆弧离散误差公式 cos = (radius - resolution) / radius
		 *
		 * 设
		 * 		圆心为 O
		 * 		采样点 A 和 B, 中点为 M
		 * 则
		 * 		弦高(最大误差)为
		 * 		e = r - r * cos(θ/2)
		 * 即
		 * 		e = r(1 - cos(θ/2))
		 * 即
		 * 		cos(θ/2) = (r - e)/r
		 *
		 * this.sweepRadian / theta 即表示需要分成多少段
		 */
		const theta = 2 * Math.acos((this.radius - resolution) / this.radius)
		const segmentCount = Math.max(2, Math.ceil(Math.abs(this.sweepRadian / theta)))
		const ps: Array<Vector2> = new Array(segmentCount + 1)
		const step: number = this.sweepRadian / segmentCount
		for (let i: number = 0, radian: number = this.startRadian; i <= segmentCount; i++, radian += step) {
			ps[i] = this.pointOn(radian)
		}
		return ps
	}

	public getMiddlePoint(): Vector2 {
		const radian: number = Angles.normalizeRadian(this.startRadian + this.sweepRadian * 0.5)
		return this.centerPoint.add(new Vector2(Math.cos(radian), Math.sin(radian)).mul(this.radius))
	}

	public isInArea(point: Vector2, width: number): boolean {
		const { x, y } = point
		const centerPoint: Vector2 = this.centerPoint
		const radius: number = this.radius
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
