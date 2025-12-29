import { BBox2, BBox2Fac } from '../../../engine/algorithm/geometry/bbox/BBox2'
import { Matrix3 } from '../../../engine/algorithm/geometry/matrix/Matrix3'
import { Vector2 } from '../../../engine/algorithm/geometry/vector/Vector2'
import { DoubleKit } from '../../../engine/math/Doublekit'
import { ESweep } from '../../../engine/config/CommonProfile'
import { ECanvas2DLineCap } from '../../../engine/config/PrimitiveProfile'
import { Polyline } from './Polyline'
import { Primitive } from './Primitive'
import { simplifyLines } from '../utils/simplifyLines'
import { Line } from './Line'
import { intersLL } from '../intersection/Intersection'
import { CACHE } from '../intersection/profile'

export class Bezier extends Primitive {
	public static pointOn(percent: number, points: Array<Vector2>): Vector2 {
		if (points.length < 1) {
			throw new Error(`bezier must have at least 1 point`)
		}
		if (points.length === 1) {
			return points[0]
		}
		let next: Array<Vector2> = new Array<Vector2>(points.length - 1)
		for (let i: number = 1; i < points.length; i++) {
			let prev: Vector2 = points[i - 1]
			let curr: Vector2 = points[i]
			let xOff: number = (curr.x - prev.x) * percent
			let yOff: number = (curr.y - prev.y) * percent
			next[i - 1] = prev.add(new Vector2(xOff, yOff))
		}
		return Bezier.pointOn(percent, next)
	}

	private readonly _controls: Array<Vector2>
	private _bbox2: BBox2
	constructor(points: Array<Vector2>) {
		super()
		this._controls = points.slice()
	}

	public get controls(): Array<Vector2> {
		return this._controls
	}

	public get startPoint(): Vector2 {
		return this.controls[0]
	}

	public get endPoint(): Vector2 {
		return this.controls[this.controls.length - 1]
	}

	public get length(): number {
		return 0
	}

	public get bbox2(): BBox2 {
		if (this._bbox2 === null) {
			let bbox2: BBox2 = new BBox2(0, 0, 0, 0)
			const points: Array<Vector2> = this.points(0.1)
			for (let i: number = 0; i < points.length; i++) {
				bbox2 = BBox2.extend1(bbox2, points[i])
			}
			this._bbox2 = bbox2
		}
		return this._bbox2
	}

	public toString(): string {
		return `Bezier ()`
	}

	public clip(percent: number): Array<Bezier> {
		const points1: Array<Vector2> = []
		const points2: Array<Vector2> = []
		this.clipPoints(percent, this.controls, points1, points2)
		return [new Bezier(points1), new Bezier(points2)]
	}

	public multiply3(matrix3: Matrix3): Bezier {
		const ps: Array<Vector2> = new Array<Vector2>(this.controls.length)
		for (let i: number = 0; i < this.controls.length; i++) {
			ps[i] = this.controls[i].multiplyMatrix3(matrix3)
		}
		return new Bezier(ps)
	}

	public storke(width: number, cap: ECanvas2DLineCap, sweep: ESweep): Polyline {
		return new Polyline([])
	}

	public points(resolution: number): Vector2[] {
		if (this.controls.length === 2) {
			return this.controls.slice()
		}
		const r2: number = resolution * resolution
		const startPoint: Vector2 = this.controls[0]
		let step: number = 0.5
		for (; step > 1e-5; step *= 0.5) {
			if (startPoint.distance(Bezier.pointOn(step, this.controls)) <= r2) {
				break
			}
		}
		const ps: Array<Vector2> = [this.startPoint]
		const cnt: number = Math.ceil(1 / step)
		let percent: number = 0
		for (let i: number = 1; i < cnt; i++) {
			percent += step
			ps.push(Bezier.pointOn(percent, this.controls))
		}
		ps.push(this.endPoint)
		return simplifyLines(ps)
	}

	public reverse(): Primitive {
		const ps: Array<Vector2> = [...this.controls].reverse()
		return new Bezier(ps)
	}

	public getPercent(point: Vector2): number {
		if (!this.isInRange(point)) {
			return null!
		}
		const disControls: Array<number> = this.controls.map((item: Vector2): number => {
			return item.y - point.y
		})
		const stack: Array<[Bezier, number, number]> = [[this, 0, 1]]
		while (stack.length !== 0) {
			let [bezier, minT0, maxT0] = stack.pop()!
			if (bezier.startPoint.equalsWithVector2(point)) {
				return minT0
			}
			if (bezier.endPoint.equalsWithVector2(point)) {
				return maxT0
			}
			let minT: number = Number.POSITIVE_INFINITY
			let maxT: number = Number.NEGATIVE_INFINITY
			const modifyT = (t: number): void => {
				minT = Math.min(minT, t)
				maxT = Math.max(maxT, t)
			}
			const intersLLAndModifyT = (m: Line, n: Line): void => {
				const cnt: number = intersLL(m, n)
				if (cnt === 0) {
					throw new Error(`intersLLAndModifyT: cnt ==== 0.`)
				}
				for (let i: number = 0; i < cnt; i += 2) {
					modifyT(CACHE[i])
				}
			}
			for (let i: number = 0; i < disControls.length; i++) {
				if (DoubleKit.eq(disControls[i], 0)) {
					modifyT(i / (disControls.length - 1))
				}
			}
			let minLine: Line = new Line(new Vector2(0, -DoubleKit.eps), new Vector2(1, -DoubleKit.eps))
			let maxLine: Line = new Line(new Vector2(0, DoubleKit.eps), new Vector2(1, DoubleKit.eps))
			for (let i: number = 0; i < disControls.length - 1; i++) {
				const p1: Vector2 = new Vector2(i / (disControls.length - 1), disControls[i])
				const status1: number = DoubleKit.less(p1.y, 0) ? 1 : DoubleKit.greater(p1.y, 0) ? 2 : 3
				for (let j: number = 0; j < disControls.length; j++) {
					const p2: Vector2 = new Vector2(j / (disControls.length - 1), disControls[j])
					const status2: number = DoubleKit.less(p2.y, 0) ? 1 : DoubleKit.greater(p2.y, 0) ? 2 : 3
					if (status1 === status2) {
						continue
					}
					if (status1 === 1) {
						if (status2 === 2) {
							intersLLAndModifyT(new Line(p1, p2), minLine)
							intersLLAndModifyT(new Line(p1, p2), maxLine)
						} else {
							intersLLAndModifyT(new Line(p1, p2), minLine)
						}
					} else if (status1 === 2) {
						if (status2 === 1) {
							intersLLAndModifyT(new Line(p1, p2), minLine)
							intersLLAndModifyT(new Line(p1, p2), maxLine)
						} else {
							intersLLAndModifyT(new Line(p1, p2), maxLine)
						}
					} else {
						if (status2 === 1) {
							intersLLAndModifyT(new Line(p1, p2), minLine)
						} else {
							intersLLAndModifyT(new Line(p1, p2), maxLine)
						}
					}
				}
			}
			if (!Number.isFinite(minT)) {
				if (
					Math.max(
						...disControls.map((item: number): number => {
							return Math.abs(item)
						})
					) <
					DoubleKit.eps * 4
				) {
					return (minT0 + maxT0) / 2
				}
				return null!
			}
			if (minT !== 0) {
				bezier = bezier.clip(minT)[1]
			}
			if (maxT !== 1) {
				const clipT: number = (maxT - minT) / (1 - minT)
				bezier = bezier.clip(clipT)[0]
				maxT0 = (maxT0 - minT0) * clipT + minT0
			}
			if (!bezier.isInRange(point)) {
				return bezier.controls[0].distance2(point) < bezier.controls[bezier.controls.length - 1].distance2(point) ? minT0 : maxT0
			}
			const bbox2: BBox2 = bezier.controls
				.reduce((prev: BBox2Fac, curr: Vector2): BBox2Fac => {
					return prev.extendByVector2(curr)
				}, new BBox2Fac())
				.build()
			if (DoubleKit.eq(bbox2.minX, bbox2.maxX) && DoubleKit.eq(bbox2.minY, bbox2.maxY)) {
				return (minT0 + maxT0) / 2
			}
			if (maxT - minT > 0.8) {
				const [b21, b22] = bezier.clip(0.5)
				if (b21.isInRange(point)) {
					stack.push([b21, minT0, (minT0 + maxT0) / 2])
					if (b22.isInRange(point)) {
						stack.push([b22, (minT0 + maxT0) / 2, maxT0])
					}
				} else {
					stack.push([b22, (minT0 + maxT0) / 2, maxT0])
				}
			} else {
				stack.push([bezier, minT0, maxT0])
			}
		}
		return null!
	}

	private clipPoints(percent: number, points: Array<Vector2>, points1: Array<Vector2>, points2: Array<Vector2>): void {
		points1.push(points[0])
		points2.push(points[points.length - 1])
		if (points.length < 2) {
			throw new Error(`bezier clip must have at least 2 point.`)
		}
		if (points.length === 2) {
			let prev: Vector2 = points[0]
			let curr: Vector2 = points[1]
			let xOff: number = (curr.x - prev.x) * percent
			let yOff: number = (curr.y - prev.y) * percent
			const p: Vector2 = prev.add(new Vector2(xOff, yOff))
			points1.push(p)
			points2.push(p)
			return
		}
		let next: Array<Vector2> = new Array<Vector2>(points.length - 1)
		for (let i: number = 1; i < points.length; i++) {
			let prev: Vector2 = points[i - 1]
			let curr: Vector2 = points[i]
			let xOff: number = (curr.x - prev.x) * percent
			let yOff: number = (curr.y - prev.y) * percent
			next[i - 1] = prev.add(new Vector2(xOff, yOff))
		}
		this.clipPoints(percent, next, points1, points2)
	}

	private isInRange(point: Vector2): boolean {
		const disControls: Array<number> = this.controls.map((item: Vector2): number => {
			return item.y - point.y
		})
		let status: number = 0
		for (let dis of disControls) {
			if (DoubleKit.less(dis, 0)) {
				status = status | 1
				continue
			} else if (DoubleKit.greater(dis, 0)) {
				status = status | 2
			} else {
				status = 3
				break
			}
			if (status === 3) {
				break
			}
		}
		if (status !== 3) {
			return false
		}
		status = 0
		for (let cl of this.controls) {
			const dot: number = cl.x - point.x
			if (DoubleKit.less(dot, 0)) {
				status = status | 1
				continue
			} else if (DoubleKit.greater(dot, 0)) {
				status = status | 2
			} else {
				status = 3
				break
			}
			if (status === 3) {
				break
			}
		}
		return status === 3
	}
}
