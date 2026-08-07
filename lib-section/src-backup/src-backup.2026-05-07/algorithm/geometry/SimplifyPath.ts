import { Vector2 } from '../../engine/algorithm/geometry/vector/Vector2'
import { ESweep } from '../../engine/config/CommonProfile'
import { Angles } from '../../engine/math/Angles'
import { DoubleKit } from '../../engine/math/Doublekit'
import { D2ArcToolkit } from './D2ArcToolkit'
import { Arc } from './primitives/Arc'
import { Line } from './primitives/Line'
import { Polyline } from './primitives/Polyline'
import { Primitive } from './primitives/Primitive'

type TArcDescData = {
	centerPoint: Vector2
	radius: number
	startRadian: number
	endRadian: number
	sweep: ESweep
}

export class SimplifyPath {
	constructor() {
		/* ... */
	}

	public simpliyPolyline(pl: Polyline): Polyline {
		let pts1: Array<Primitive> = []
		for (let pt of pl.primitives) {
			pts1.push(pt)
		}
		const length: number = pts1.length
		const pts: Array<Primitive> = []
		for (let i: number = 0; i < length; i++) {
			const simplifyPrimitives: Array<Primitive> = []
			let pt1: Primitive = pts1[i]
			let lastData: TArcDescData = null!
			for (let j: number = i + 1; j < length; j++) {
				const pt2: Primitive = pts1[j]
				if (pt1 instanceof Line) {
					if (pt2 instanceof Line) {
						const arc: TArcDescData = this.createArc(pt1, pt2)
						if (arc !== null) {
							if (lastData !== null) {
								const [dot, cos]: [number, number] = [pt1.direct.dot(pt2.direct), (arc.radius - 0.01) / arc.radius]
								if ((dot > 0 && this.isEqual(dot, 1)) || Math.abs(Math.abs(cos) - Math.abs(Math.abs(Math.acos(dot) / 2))) < 1 || pt2.length < 1e-4) {
									const dir: Vector2 = new Vector2(Math.cos(lastData.startRadian), Math.sin(lastData.startRadian))
									const start: Vector2 = dir.mul(lastData.radius).add(lastData.centerPoint)
									let direct: Vector2 = null!
									if (lastData.sweep === ESweep.CCW) {
										direct = new Vector2(-dir.y, dir.x)
									} else {
										direct = new Vector2(dir.y, -dir.x)
									}
									const newData: TArcDescData = D2ArcToolkit.tangentPositionDirect2Arc(start, direct, pt2.endPoint)
									const ratio: number = newData.radius / lastData.radius
									if (ratio === 0 || ratio > 10 || 1 / ratio > 10) {
										break
									} else {
										lastData = newData
										simplifyPrimitives.push(pt2)
										pt1 = pt2
									}
								} else {
									break
								}
							} else {
								lastData = arc
								simplifyPrimitives.push(pt1, pt2)
								pt1 = pt2
							}
						} else {
							break
						}
					} else if (pt2 instanceof Arc) {
						const dir: Vector2 = pt2.startPoint.sub(pt2.centerPoint).normalize()
						let direct: Vector2 = null!
						if (pt2.sweep === ESweep.CCW) {
							direct = new Vector2(-dir.y, dir.x)
						} else {
							direct = new Vector2(dir.y, -dir.x)
						}
						const arc: TArcDescData = this.createArc2(direct, pt1)
						if (arc !== null) {
							if (lastData !== null) {
								if (
									(this.isEqual(lastData.centerPoint.x, arc.centerPoint.x) &&
										this.isEqual(lastData.centerPoint.y, arc.centerPoint.y) &&
										this.isEqual(lastData.radius, arc.radius) &&
										lastData.sweep === arc.sweep) ||
									pt1.length < 1e-4
								) {
									const dir: Vector2 = new Vector2(Math.cos(lastData.startRadian), Math.sin(lastData.startRadian))
									const start: Vector2 = dir.mul(lastData.radius).add(lastData.centerPoint)
									let direct: Vector2 = null!
									if (lastData.sweep === ESweep.CCW) {
										direct = new Vector2(-dir.y, dir.x)
									} else {
										direct = new Vector2(dir.y, -dir.x)
									}
									const newData: TArcDescData = D2ArcToolkit.tangentPositionDirect2Arc(start, direct, pt2.endPoint)
									const ratio: number = newData.radius / lastData.radius
									if (ratio === 0 || ratio > 10 || 1 / ratio > 10) {
										break
									} else {
										lastData = newData
										simplifyPrimitives.push(pt2)
										pt1 = pt2
									}
								} else {
									break
								}
							} else {
								if (
									this.isEqual(arc.centerPoint.x, pt2.centerPoint.x) &&
									this.isEqual(arc.centerPoint.y, pt2.centerPoint.y) &&
									this.isEqual(arc.radius, pt2.rx) &&
									this.isEqual(arc.radius, pt2.ry) &&
									arc.sweep === pt2.sweep
								) {
									lastData = {
										centerPoint: arc.centerPoint,
										radius: arc.radius,
										startRadian: arc.startRadian,
										endRadian: pt2.endRadian,
										sweep: arc.sweep,
									}
									simplifyPrimitives.push(pt1, pt2)
									pt1 = pt2
								} else {
									break
								}
							}
						} else {
							break
						}
					} else {
						break
					}
				} else if (pt1 instanceof Arc) {
					if (pt2 instanceof Line) {
						let [dir, direct]: [Vector2, Vector2] = [pt1.endPoint.sub(pt1.centerPoint).normalize(), null!]
						if (pt1.sweep === ESweep.CCW) {
							direct = new Vector2(-dir.y, dir.x)
						} else {
							direct = new Vector2(dir.y, -dir.x)
						}
						const arc: TArcDescData = this.createArc1(direct, pt2)
						if (arc !== null) {
							if (lastData !== null) {
								if (
									(this.isEqual(lastData.centerPoint.x, arc.centerPoint.x) &&
										this.isEqual(lastData.centerPoint.y, arc.centerPoint.y) &&
										this.isEqual(lastData.radius, arc.radius) &&
										lastData.sweep === arc.sweep) ||
									pt2.length < 1e-4
								) {
									const dir: Vector2 = new Vector2(Math.cos(lastData.startRadian), Math.sin(lastData.startRadian))
									const start: Vector2 = dir.mul(lastData.radius).add(lastData.centerPoint)
									let direct: Vector2 = null!
									if (lastData.sweep === ESweep.CCW) {
										direct = new Vector2(-dir.y, dir.x)
									} else {
										direct = new Vector2(dir.y, -dir.x)
									}
									const newData: TArcDescData = D2ArcToolkit.tangentPositionDirect2Arc(start, direct, pt2.endPoint)
									const ratio: number = newData.radius / lastData.radius
									if (ratio === 0 || ratio > 10 || 1 / ratio > 10) {
										break
									} else {
										lastData = newData
										simplifyPrimitives.push(pt2)
										pt1 = pt2
									}
								} else {
									break
								}
							} else {
								if (
									(this.isEqual(arc.centerPoint.x, pt1.centerPoint.x) &&
										this.isEqual(arc.centerPoint.y, pt1.centerPoint.y) &&
										this.isEqual(arc.radius, pt1.rx) &&
										this.isEqual(arc.radius, pt1.ry) &&
										arc.sweep === pt1.sweep) ||
									pt2.length < 1e-4
								) {
									lastData = {
										centerPoint: pt1.centerPoint,
										radius: pt1.rx,
										startRadian: pt1.startRadian,
										endRadian: arc.endRadian,
										sweep: arc.sweep,
									}
									simplifyPrimitives.push(pt1, pt2)
									pt1 = pt2
								} else {
									break
								}
							}
						} else {
							break
						}
					} else if (pt2 instanceof Arc) {
						let arc: TArcDescData = this.createArc3(pt1, pt2)
						if (arc !== null) {
							if (lastData !== null) {
								if (
									this.isEqual(lastData.centerPoint.x, arc.centerPoint.x) &&
									this.isEqual(lastData.centerPoint.y, arc.centerPoint.y) &&
									this.isEqual(lastData.radius, arc.radius) &&
									lastData.sweep === arc.sweep
								) {
									lastData = {
										centerPoint: lastData.centerPoint,
										radius: lastData.radius,
										startRadian: lastData.startRadian,
										endRadian: arc.endRadian,
										sweep: lastData.sweep,
									}
									simplifyPrimitives.push(pt2)
									pt1 = pt2
								} else {
									break
								}
							} else {
								lastData = arc
								simplifyPrimitives.push(pt1, pt2)
								pt1 = pt2
							}
						} else {
							break
						}
					} else {
						break
					}
				} else {
					break
				}
			}
			if (this.canSimplify(simplifyPrimitives) && lastData !== null) {
				let arc: Arc = Arc.build2(lastData.centerPoint, Angles.toQuarterRadian(lastData.startRadian), Angles.toQuarterRadian(lastData.endRadian), lastData.radius, lastData.radius, lastData.sweep)
				pts.push(arc)
				i = i + simplifyPrimitives.length - 1
			} else {
				pts.push(pts1[i])
			}
		}
		return Polyline.build1(pts)
	}

	private canContinue(pt1: Primitive, pt2: Primitive): boolean {
		if (pt1 instanceof Line && pt1.length < 1e-4) {
			return true
		}
		if (pt2 instanceof Line && pt2.length < 1e-4) {
			return true
		}
		if (pt1 instanceof Line && pt2 instanceof Line) {
			const range: number = pt1.length / pt2.length
			if (range > 10 || 1 / range > 10) {
				return false
			}
			return true
		}
		return false
	}

	private canSimplify(pts: Array<Primitive>): boolean {
		if (pts.length > 2) {
			return true
		}
		if (pts.length === 2) {
			if (pts[0] instanceof Line && pts[1] instanceof Line) {
				return false
			}
			return true
		}
		return false
	}

	private createArc(line1: Line, line2: Line): TArcDescData {
		const [d1, d2]: [Vector2, Vector2] = [line1.direct, line2.direct]
		const crossV: number = d1.cross(d2)
		if (DoubleKit.greater(crossV, 0) || DoubleKit.less(crossV, 0)) {
			const [startPoint, endPoint]: [Vector2, Vector2] = [line1.startPoint, line2.endPoint]
			const point: Vector2 = line1.endPoint.add(line2.startPoint).mul(0.1)
			return D2ArcToolkit.calculateD2ArcProfileByThreePoint2(startPoint, endPoint, point)
		}
		return null!
	}

	private createArc1(direct: Vector2, line: Line): TArcDescData {
		const dir: Vector2 = line.direct
		const crossV: number = direct.cross(dir)
		if (DoubleKit.greater(crossV, 0) || DoubleKit.less(crossV, 0)) {
			const [startPoint, endPoint]: [Vector2, Vector2] = [line.startPoint, line.endPoint]
			return D2ArcToolkit.tangentPositionDirect2Arc(startPoint, direct, endPoint)
		}
		return null!
	}

	private createArc2(direct: Vector2, line: Line): TArcDescData {
		const dir: Vector2 = line.direct
		const crossV: number = direct.cross(dir)
		if (DoubleKit.greater(crossV, 0) || DoubleKit.less(crossV, 0)) {
			const [startPoint, endPoint, direct2]: [Vector2, Vector2, Vector2] = [line.startPoint, line.endPoint, direct.mul(-1)]
			const { centerPoint, radius, startRadian, endRadian, sweep } = D2ArcToolkit.tangentPositionDirect2Arc(startPoint, direct, endPoint)
			return {
				centerPoint,
				radius,
				startRadian: endRadian,
				endRadian: startRadian,
				sweep: sweep === ESweep.CCW ? ESweep.CW : ESweep.CCW,
			}
		}
		return null!
	}

	private createArc3(arc1: Arc, arc2: Arc): TArcDescData {
		if (this.isEqual(arc1.centerPoint.x, arc2.centerPoint.x) && this.isEqual(arc1.centerPoint.y, arc2.centerPoint.y) && this.isEqual(arc1.rx, arc2.rx) && this.isEqual(arc1.ry, arc2.ry) && arc1.sweep === arc2.sweep) {
			return {
				centerPoint: arc1.centerPoint,
				radius: arc1.rx,
				startRadian: arc1.startRadian,
				endRadian: arc1.endRadian,
				sweep: arc1.sweep,
			}
		}
		return null!
	}

	private isEqual(x: number, y: number): boolean {
		return Math.abs(x - y) < 1e-4
	}
}
