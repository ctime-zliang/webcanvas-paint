import { Vector2 } from '../../engine/algorithm/geometry/vector/Vector2'
import { ESweep } from '../../engine/config/CommonProfile'
import { Angles } from '../../engine/math/Angles'
import { DoubleKit } from '../../engine/math/Doublekit'
import { ArcTransition } from './ArcTransition'
import { Arc } from './primitives/Arc'
import { Line } from './primitives/Line'
import { Polyline } from './primitives/Polyline'
import { Primitive } from './primitives/Primitive'

type TArcDescData = {
	center: Vector2
	radius: number
	startAngle: number
	endAngle: number
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
		let length: number = pts1.length
		let pts: Array<Primitive> = []
		for (let i: number = 0; i < length; i++) {
			let pt1: Primitive = pts1[i]
			let simplifyPrimitives: Array<Primitive> = []
			let lastData: TArcDescData = null!
			for (let j: number = i + 1; j < length; j++) {
				let pt2: Primitive = pts1[j]
				if (pt1 instanceof Line) {
					if (pt2 instanceof Line) {
						let arc: TArcDescData = this.createArc(pt1, pt2)
						if (arc !== null) {
							if (lastData !== null) {
								let dot: number = pt1.direct.dot(pt2.direct)
								let cos: number = (arc.radius - 0.01) / arc.radius
								if (
									(dot > 0 && this.isEqual(dot, 1)) ||
									Math.abs(Math.abs(cos) - Math.abs(Math.abs(Math.acos(dot) / 2))) < 1 ||
									pt2.length < 1e-4
								) {
									let dir: Vector2 = new Vector2(Math.cos(lastData.startAngle), Math.sin(lastData.startAngle))
									let start: Vector2 = dir.mul(lastData.radius).add(lastData.center)
									let direct: Vector2 = null!
									if (lastData.sweep === ESweep.CCW) {
										direct = new Vector2(-dir.y, dir.x)
									} else {
										direct = new Vector2(dir.y, -dir.x)
									}
									let newData: TArcDescData = ArcTransition.tangentPositionDirect2Arc(start, direct, pt2.endPoint)
									let ratio: number = newData.radius / lastData.radius
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
						let dir: Vector2 = pt2.startPoint.sub(pt2.centerPoint).normalize()
						let direct: Vector2 = null!
						if (pt2.sweep === ESweep.CCW) {
							direct = new Vector2(-dir.y, dir.x)
						} else {
							direct = new Vector2(dir.y, -dir.x)
						}
						let arc: TArcDescData = this.createArc2(direct, pt1)
						if (arc !== null) {
							if (lastData !== null) {
								if (
									(this.isEqual(lastData.center.x, arc.center.x) &&
										this.isEqual(lastData.center.y, arc.center.y) &&
										this.isEqual(lastData.radius, arc.radius) &&
										lastData.sweep === arc.sweep) ||
									pt1.length < 1e-4
								) {
									let dir: Vector2 = new Vector2(Math.cos(lastData.startAngle), Math.sin(lastData.startAngle))
									let start: Vector2 = dir.mul(lastData.radius).add(lastData.center)
									let direct: Vector2 = null!
									if (lastData.sweep === ESweep.CCW) {
										direct = new Vector2(-dir.y, dir.x)
									} else {
										direct = new Vector2(dir.y, -dir.x)
									}
									let newData: TArcDescData = ArcTransition.tangentPositionDirect2Arc(start, direct, pt2.endPoint)
									let ratio: number = newData.radius / lastData.radius
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
									this.isEqual(arc.center.x, pt2.centerPoint.x) &&
									this.isEqual(arc.center.y, pt2.centerPoint.y) &&
									this.isEqual(arc.radius, pt2.rx) &&
									this.isEqual(arc.radius, pt2.ry) &&
									arc.sweep === pt2.sweep
								) {
									lastData = {
										center: arc.center,
										radius: arc.radius,
										startAngle: arc.startAngle,
										endAngle: Angles.degreeToRadian(pt2.endAngle),
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
						let dir: Vector2 = pt1.endPoint.sub(pt1.centerPoint).normalize()
						let direct: Vector2 = null!
						if (pt1.sweep === ESweep.CCW) {
							direct = new Vector2(-dir.y, dir.x)
						} else {
							direct = new Vector2(dir.y, -dir.x)
						}
						let arc: TArcDescData = this.createArc1(direct, pt2)
						if (arc !== null) {
							if (lastData !== null) {
								if (
									(this.isEqual(lastData.center.x, arc.center.x) &&
										this.isEqual(lastData.center.y, arc.center.y) &&
										this.isEqual(lastData.radius, arc.radius) &&
										lastData.sweep === arc.sweep) ||
									pt2.length < 1e-4
								) {
									let dir: Vector2 = new Vector2(Math.cos(lastData.startAngle), Math.sin(lastData.startAngle))
									let start: Vector2 = dir.mul(lastData.radius).add(lastData.center)
									let direct: Vector2 = null!
									if (lastData.sweep === ESweep.CCW) {
										direct = new Vector2(-dir.y, dir.x)
									} else {
										direct = new Vector2(dir.y, -dir.x)
									}
									let newData: TArcDescData = ArcTransition.tangentPositionDirect2Arc(start, direct, pt2.endPoint)
									let ratio: number = newData.radius / lastData.radius
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
									(this.isEqual(arc.center.x, pt1.centerPoint.x) &&
										this.isEqual(arc.center.y, pt1.centerPoint.y) &&
										this.isEqual(arc.radius, pt1.rx) &&
										this.isEqual(arc.radius, pt1.ry) &&
										arc.sweep === pt1.sweep) ||
									pt2.length < 1e-4
								) {
									lastData = {
										center: pt1.centerPoint,
										radius: pt1.rx,
										startAngle: Angles.degreeToRadian(pt1.startAngle),
										endAngle: arc.endAngle,
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
									this.isEqual(lastData.center.x, arc.center.x) &&
									this.isEqual(lastData.center.y, arc.center.y) &&
									this.isEqual(lastData.radius, arc.radius) &&
									lastData.sweep === arc.sweep
								) {
									lastData = {
										center: lastData.center,
										radius: lastData.radius,
										startAngle: lastData.startAngle,
										endAngle: arc.endAngle,
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
				let arc: Arc = Arc.build2(
					lastData.center,
					Angles.toQuarterDegree(lastData.startAngle),
					Angles.toQuarterDegree(lastData.endAngle),
					lastData.radius,
					lastData.radius,
					lastData.sweep
				)
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
			let range: number = pt1.length / pt2.length
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
		let d1: Vector2 = line1.direct
		let d2: Vector2 = line2.direct
		let crossV: number = d1.cross(d2)
		if (DoubleKit.greater(crossV, 0) || DoubleKit.less(crossV, 0)) {
			let startPoint: Vector2 = line1.startPoint
			let endPoint: Vector2 = line2.endPoint
			let point: Vector2 = line1.endPoint.add(line2.startPoint).mul(0.1)
			return ArcTransition.threePoint2Arc(startPoint, endPoint, point)
		}
		return null!
	}

	private createArc1(direct: Vector2, line: Line): TArcDescData {
		let dir: Vector2 = line.direct
		let crossV: number = direct.cross(dir)
		if (DoubleKit.greater(crossV, 0) || DoubleKit.less(crossV, 0)) {
			let startPoint: Vector2 = line.startPoint
			let endPoint: Vector2 = line.endPoint
			return ArcTransition.tangentPositionDirect2Arc(startPoint, direct, endPoint)
		}
		return null!
	}

	private createArc2(direct: Vector2, line: Line): TArcDescData {
		let dir: Vector2 = line.direct
		let crossV: number = direct.cross(dir)
		if (DoubleKit.greater(crossV, 0) || DoubleKit.less(crossV, 0)) {
			let startPoint: Vector2 = line.startPoint
			let endPoint: Vector2 = line.endPoint
			let direct2: Vector2 = direct.mul(-1)
			const { center, radius, startAngle, endAngle, sweep } = ArcTransition.tangentPositionDirect2Arc(startPoint, direct, endPoint)
			return {
				center,
				radius,
				startAngle: endAngle,
				endAngle: startAngle,
				sweep: sweep === ESweep.CCW ? ESweep.CW : ESweep.CCW,
			}
		}
		return null!
	}

	private createArc3(arc1: Arc, arc2: Arc): TArcDescData {
		if (
			this.isEqual(arc1.centerPoint.x, arc2.centerPoint.x) &&
			this.isEqual(arc1.centerPoint.y, arc2.centerPoint.y) &&
			this.isEqual(arc1.rx, arc2.rx) &&
			this.isEqual(arc1.ry, arc2.ry) &&
			arc1.sweep === arc2.sweep
		) {
			return {
				center: arc1.centerPoint,
				radius: arc1.rx,
				startAngle: Angles.degreeToRadian(arc1.startAngle),
				endAngle: Angles.degreeToRadian(arc1.endAngle),
				sweep: arc1.sweep,
			}
		}
		return null!
	}

	private isEqual(x: number, y: number): boolean {
		return Math.abs(x - y) < 1e-4
	}
}
