import { BBox2 } from '../../engine/algorithm/geometry/bbox/BBox2'
import { Vector } from '../../engine/algorithm/geometry/vector/Vector'
import { Vector2 } from '../../engine/algorithm/geometry/vector/Vector2'
import { DoubleKit } from '../../engine/math/Doublekit'
import { D2ArcToolkit } from './D2ArcToolkit'
import { D2LineToolkit } from './D2LineToolkit'
import { Arc } from './primitives/Arc'
import { Line } from './primitives/Line'
import { Polyline } from './primitives/Polyline'
import { Primitive } from './primitives/Primitive'
import { Triangle } from './primitives/Triangle'

function checkArcEndpoints(arcA: Arc, arcB: Arc): Array<Vector2> {
	const points: Array<Vector2> = []
	if (DoubleKit.eq(arcB.startPoint.distance(arcA.centerPoint), arcA.radius) && D2ArcToolkit.isPointOnArc(arcA, arcB.startPoint)) {
		points.push(arcB.startPoint)
		return points
	}
	if (DoubleKit.eq(arcB.endPoint.distance(arcA.centerPoint), arcA.radius) && D2ArcToolkit.isPointOnArc(arcA, arcB.endPoint)) {
		points.push(arcB.endPoint)
		return points
	}
	if (DoubleKit.eq(arcA.startPoint.distance(arcB.centerPoint), arcB.radius) && D2ArcToolkit.isPointOnArc(arcB, arcA.startPoint)) {
		points.push(arcA.startPoint)
		return points
	}
	if (DoubleKit.eq(arcA.endPoint.distance(arcB.centerPoint), arcB.radius) && D2ArcToolkit.isPointOnArc(arcB, arcA.endPoint)) {
		points.push(arcA.endPoint)
		return points
	}
	return points
}

/**
 * 圆弧外切时检测点是否在圆弧上
 */
function checkArcResult1(arc: Arc, points: Array<Vector2>): Array<Vector2> {
	const iPoints: Array<Vector2> = []
	for (let i: number = 0; i < points.length; i++) {
		if (D2ArcToolkit.isPointOnArc(arc, points[i])) {
			iPoints.push(points[i])
		}
	}
	return iPoints
}

/**
 * 圆弧内切时检测点是否在圆弧上
 */
function checkArcResult2(arc1: Arc, arc2: Arc, points: Array<Vector2>): Array<Vector2> {
	const iPoints: Array<Vector2> = []
	for (let i: number = 0; i < points.length; i++) {
		if (D2ArcToolkit.isPointOnArc(arc1, points[i]) && D2ArcToolkit.isPointOnArc(arc2, points[i])) {
			iPoints.push(points[i])
		}
	}
	return iPoints
}

function endpointIsOn(endPoint: Vector2, arc: Arc, nearPoint: Vector2, farPoint: Vector2): boolean {
	return DoubleKit.eq(endPoint.distance(arc.centerPoint), arc.radius) && D2ArcToolkit.isPointOnArc(arc, endPoint) && endPoint.distanceSquare(nearPoint) < endPoint.distanceSquare(farPoint)
}

export class D2Intersection {
	/**
	 * 计算 primitiveA �?primitiveB 的交点数�?
	 */
	public static getIntersectionsOfPrimitives(primitiveA: Primitive, primitiveB: Primitive): { count: number; points: Array<Vector2> } {
		if (primitiveA instanceof Line && primitiveB instanceof Line) {
			return D2Intersection.getIntersectionsOfLines(primitiveA, primitiveB)
		}
		if (primitiveA instanceof Arc && primitiveB instanceof Line) {
			return D2Intersection.getIntersectionsOfExtendLineAndArc(primitiveB, primitiveA)
		}
		if (primitiveA instanceof Line && primitiveB instanceof Arc) {
			return D2Intersection.getIntersectionsOfExtendLineAndArc(primitiveA, primitiveB)
		}
		if (primitiveA instanceof Arc && primitiveB instanceof Arc) {
			return D2Intersection.getIntersectionsOfArcs(primitiveA, primitiveB)
		}
		return { count: 0, points: [] }
	}

	/**
	 * 计算线段 lineA 与线�?lineB 的交点数�?
	 */
	public static getIntersectionsOfLines(lineA: Line, lineB: Line): { count: number; points: Array<Vector2> } {
		if (lineA.isPoint()) {
			return D2LineToolkit.isPointOnLine(lineB, lineA.startPoint) ? { count: 1, points: [lineA.startPoint] } : { count: 0, points: [] }
		}
		if (lineB.isPoint()) {
			return D2LineToolkit.isPointOnLine(lineA, lineB.startPoint) ? { count: 1, points: [lineB.startPoint] } : { count: 0, points: [] }
		}
		const inters: BBox2 = D2LineToolkit.getIntersectionByLines(lineA, lineB)
		if (inters === null) {
			return { count: 0, points: [] }
		}
		const [x1, y1]: [number, number] = [lineA.startPoint.x, lineA.startPoint.y]
		const [x2, y2]: [number, number] = [lineA.endPoint.x, lineA.endPoint.y]
		const [x3, y3]: [number, number] = [lineB.startPoint.x, lineB.startPoint.y]
		const [x4, y4]: [number, number] = [lineB.endPoint.x, lineB.endPoint.y]
		/**
		 * 向量叉积 判断线段 n(p3-p4) 是否跨越线段 m(p1, p2)
		 */
		const [cross1, cross2]: [number, number] = [lineB.startPoint.sub(lineA.startPoint).cross(lineB.endPoint.sub(lineB.startPoint)), lineB.startPoint.sub(lineA.endPoint).cross(lineB.endPoint.sub(lineB.startPoint))]
		if (cross1 * cross2 > 0 && !DoubleKit.eq(cross1, 0) && !DoubleKit.eq(cross2, 0)) {
			return { count: 0, points: [] }
		}
		/**
		 * 向量叉积 判断线段 m(p1, p2) 是否跨越线段 n(p3-p4)
		 */
		const [cross3, cross4]: [number, number] = [lineA.startPoint.sub(lineB.startPoint).cross(lineA.endPoint.sub(lineA.startPoint)), lineA.startPoint.sub(lineB.endPoint).cross(lineA.endPoint.sub(lineA.startPoint))]
		if (cross3 * cross4 > 0 && !DoubleKit.eq(cross3, 0) && !DoubleKit.eq(cross4, 0)) {
			return { count: 0, points: [] }
		}
		const result: { count: number; points: Array<Vector2> } = { count: 0, points: [] }
		if (DoubleKit.eq(cross1, 0) && DoubleKit.eq(cross2, 0)) {
			/**
			 * 两线段重�?
			 **/
			if (DoubleKit.eq(inters.width, 0)) {
				if (DoubleKit.eq(inters.height, 0)) {
					result.points.push(inters.leftUp)
					result.count += 1
				} else {
					result.points.push(inters.leftUp)
					result.points.push(inters.leftDown)
					result.count += 2
				}
			} else if (DoubleKit.eq(inters.height, 0)) {
				result.points.push(inters.leftUp)
				result.points.push(inters.rightUp)
				result.count += 2
			} else {
				const [ulArea, urArea]: [number, number] = [Triangle.getArea(inters.leftUp, new Vector2(x3, y3), new Vector2(x4, y4)), Triangle.getArea(inters.rightUp, new Vector2(x3, y3), new Vector2(x4, y4))]
				if (ulArea < urArea) {
					result.points.push(inters.leftUp)
					result.points.push(inters.rightDown)
					result.count += 2
				} else {
					result.points.push(inters.rightUp)
					result.points.push(inters.leftDown)
					result.count += 2
				}
			}
		} else if (DoubleKit.eq(cross1, 0)) {
			/**
			 * 在线段端点相�?
			 **/
			if (inters.isContainsPoint(new Vector2(x1, y1))) {
				result.points.push(new Vector2(x1, y1))
				result.count += 1
			}
		} else if (DoubleKit.eq(cross2, 0)) {
			/**
			 * 在线段端点相�?
			 **/
			if (inters.isContainsPoint(new Vector2(x2, y2))) {
				result.points.push(new Vector2(x2, y2))
				result.count += 1
			}
		} else {
			/**
			 * 线段不重合且不在端点相交
			 * 		参数方程求线段交�?
			 * 			cross1 = (x3 - x1) * (y4 - y3) - (x4 - x3) * (y3 - y1)
			 * 			cross2 = (x3 - x2) * (y4 - y3) - (x4 - x3) * (y3 - y2)
			 **/
			const t0: number = Math.abs(((x4 - x3) * (y3 - y1) - (y4 - y3) * (x3 - x1)) / ((y2 - y1) * (x4 - x3) - (x2 - x1) * (y4 - y3)))
			const t: number = Math.abs(cross1 / (cross1 - cross2))
			const [_x, _y]: [number, number] = [x1 + (x2 - x1) * t, y1 + (y2 - y1) * t]
			if (inters.isContainsPoint(new Vector2(_x, _y))) {
				result.points.push(new Vector2(_x, _y))
				result.count += 1
			}
		}
		return result
	}

	/**
	 * 计算线段 line 与圆�?arc 的交点数�?
	 */
	public static getIntersectionsOfLineAndArc(line: Line, arc: Arc): { count: number; points: Array<Vector2> } {
		let inters: BBox2 = arc.bbox2.getIntersection(line.bbox2)
		if (inters === null) {
			return { count: 0, points: [] }
		}
		const isInterPoint = (point: Vector2): boolean => {
			return inters.isContainsValue(point.x, point.y) && D2ArcToolkit.isPointOnArc(arc, point)
		}
		const [cx, cy, r, r2]: [number, number, number, number] = [arc.centerPoint.x, arc.centerPoint.y, arc.radius, arc.radius * arc.radius]
		const [x1, y1]: [number, number] = [line.startPoint.x, line.startPoint.y]
		const [x2, y2]: [number, number] = [line.endPoint.x, line.endPoint.y]
		const [d1, d2]: [number, number] = [arc.centerPoint.distanceSquare(line.startPoint), arc.centerPoint.distanceSquare(line.endPoint)]
		const [state1, state2]: [number, number] = [DoubleKit.eq(d1, r2) ? 0 : d1 > r2 ? 1 : -1, DoubleKit.eq(d2, r2) ? 0 : d2 > r2 ? 1 : -1]
		const result: { count: number; points: Array<Vector2> } = { count: 0, points: [] }
		if (state1 === -1 && state2 === -1) {
			/**
			 * 线段的两个端点都在圆弧内�? 则不相交
			 **/
			return result
		}
		if (state1 === 0 && state2 === 0) {
			/**
			 * 线段的两个端点都在圆弧上
			 **/
			result.points.push(new Vector2(x1, y1))
			result.points.push(new Vector2(x2, y2))
			result.count += 2
		}
		if (state1 === 1 && state2 === 1) {
			/**
			 * 线段的两个端点都在圆弧外
			 **/
			/**
			 * 过圆弧圆心作垂直于线�?L 的垂�?LO
			 */
			const footPoint: Vector2 = D2LineToolkit.calcFootOfPoint2Line(line, arc.centerPoint).point
			/**
			 * 圆弧圆心到线�?L 的距�?
			 */
			const distance: number = footPoint.distance(arc.centerPoint)
			if (DoubleKit.greater(distance, r)) {
				/**
				 * 圆心到线�?或其延长�?的距离大于半�?
				 **/
				return result
			}
			if (DoubleKit.eq(distance, r)) {
				if (DoubleKit.eq(line.distance(arc.startPoint), 0)) {
					result.points.push(arc.startPoint)
					result.count += 1
				} else if (DoubleKit.eq(line.distance(arc.endPoint), 0)) {
					result.points.push(arc.endPoint)
					result.count += 1
				} else {
					result.points.push(footPoint)
					result.count += 1
				}
			} else {
				const closedPoint: Vector2 = D2LineToolkit.getClosedPointOnLineWithPoint(new Line(new Vector2(x1, y1), new Vector2(x2, y2)), new Vector2(cx, cy))
				const closedD: number = Vector.distance({ x: cx, y: cy }, { x: closedPoint.x, y: closedPoint.y })
				if (DoubleKit.eq(closedD, r)) {
					result.points.push(closedPoint)
					result.count += 1
				} else if (closedD < r) {
					const points1: Array<Vector2> = D2LineToolkit.getPointsOnLineWithDistance(r, new Line(new Vector2(x1, y1), closedPoint), new Vector2(cx, cy))
					for (let i: number = 0; i < points1.length; i++) {
						result.points.push(points1[i])
						result.count += 1
					}
					const points2: Array<Vector2> = D2LineToolkit.getPointsOnLineWithDistance(r, new Line(closedPoint, new Vector2(x2, y2)), new Vector2(cx, cy))
					for (let i: number = 0; i < points2.length; i++) {
						result.points.push(points2[i])
						result.count += 1
					}
				} else {
					return result
				}
			}
		} else if (state1 === -1 || state2 === -1) {
			const points: Array<Vector2> = D2LineToolkit.getPointsOnLineWithDistance(r, new Line(new Vector2(x1, y1), new Vector2(x2, y2)), new Vector2(cx, cy))
			for (let i: number = 0; i < points.length; i++) {
				result.points.push(points[i])
				result.count += 1
			}
		} else {
			/**
			 * 过圆弧圆心作垂直于线�?L 的垂�?LO
			 */
			const foot: Vector2 = D2LineToolkit.calcFootOfPoint2Line(line, arc.centerPoint).point
			/**
			 * 圆弧圆心到线�?L 的距�?
			 */
			const distance: number = foot.distance(arc.centerPoint)
			if (DoubleKit.eq(distance, r)) {
				if (state1 === 0) {
					const p: Vector2 = line.startPoint
					if (isInterPoint(p)) {
						result.points.push(p)
						result.count += 1
						return result
					}
					if (isInterPoint(foot)) {
						result.points.push(foot)
						result.count += 1
						return result
					}
					if (d1 <= r) {
						const points: Array<Vector2> = D2LineToolkit.getPointsOnLineWithDistance(r, new Line(foot, new Vector2(x2, y2)), new Vector2(cx, cy))
						for (let i: number = 0; i < points.length; i++) {
							result.points.push(points[i])
							result.count += 1
						}
					} else if (distance < r) {
						const points1: Array<Vector2> = D2LineToolkit.getPointsOnLineWithDistance(r, new Line(foot, new Vector2(x2, y2)), new Vector2(cx, cy))
						if (points1.length === 1 && isInterPoint(points1[0])) {
							for (let i: number = 0; i < points1.length; i++) {
								result.points.push(points1[i])
								result.count += 1
							}
							return result
						}
						const points2: Array<Vector2> = D2LineToolkit.getPointsOnLineWithDistance(r, new Line(foot, new Vector2(x1, y1)), new Vector2(cx, cy))
						for (let i: number = 0; i < points2.length; i++) {
							result.points.push(points2[i])
							result.count += 1
						}
					}
				} else {
					const p: Vector2 = line.endPoint
					if (isInterPoint(p)) {
						result.points.push(p)
						result.count += 1
						return result
					}
					if (isInterPoint(foot)) {
						result.points.push(foot)
						result.count += 1
						return result
					}
					if (d2 <= r) {
						const points: Array<Vector2> = D2LineToolkit.getPointsOnLineWithDistance(r, new Line(foot, new Vector2(x1, y1)), new Vector2(cx, cy))
						for (let i: number = 0; i < points.length; i++) {
							result.points.push(points[i])
							result.count += 1
						}
					} else if (distance < r) {
						const points1: Array<Vector2> = D2LineToolkit.getPointsOnLineWithDistance(r, new Line(foot, new Vector2(x1, y1)), new Vector2(cx, cy))
						if (points1.length === 1 && isInterPoint(points1[0])) {
							for (let i: number = 0; i < points1.length; i++) {
								result.points.push(points1[i])
								result.count += 1
							}
							return result
						}
						const points2: Array<Vector2> = D2LineToolkit.getPointsOnLineWithDistance(r, new Line(foot, new Vector2(x2, y2)), new Vector2(cx, cy))
						for (let i: number = 0; i < points2.length; i++) {
							result.points.push(points2[i])
							result.count += 1
						}
					}
				}
			} else if (state1 === 0) {
				const p: Vector2 = line.startPoint
				result.points.push(p)
				result.count += 1
				if ((x1 - foot.x) * (x2 - foot.x) + (y1 - foot.y) * (y2 - foot.y) < 0) {
					const points: Array<Vector2> = D2LineToolkit.getPointsOnLineWithDistance(r, new Line(foot, new Vector2(x2, y2)), new Vector2(cx, cy))
					for (let i: number = 0; i < points.length; i++) {
						result.points.push(points[i])
						result.count += 1
					}
				}
			} else {
				const p: Vector2 = line.endPoint
				result.points.push(p)
				result.count += 1
				if ((x1 - foot.x) * (x2 - foot.x) + (y1 - foot.y) * (y2 - foot.y) < 0) {
					const points: Array<Vector2> = D2LineToolkit.getPointsOnLineWithDistance(r, new Line(foot, new Vector2(x1, y1)), new Vector2(cx, cy))
					for (let i: number = 0; i < points.length; i++) {
						result.points.push(points[i])
						result.count += 1
					}
				}
			}
		}
		if (result.count > 0) {
			const points: Array<Vector2> = []
			let count: number = 0
			for (let i: number = 0; i < result.count; i++) {
				const point: Vector2 = result.points[i]
				if (Number.isFinite(point.x) && Number.isFinite(point.y) && inters.isContainsValue(point.x, point.y) && D2ArcToolkit.isPointOnArc(arc, new Vector2(point.x, point.y))) {
					points.push(point)
					count += 1
				}
			}
			result.points = points
			result.count = count
			return result
		}
		return result
	}

	/**
	 * 计算线段 line (含延长线)与圆�?arc 的交点数�?
	 */
	public static getIntersectionsOfExtendLineAndArc(line: Line, arc: Arc): { count: number; points: Array<Vector2> } {
		const [cx, cy, r, r2]: [number, number, number, number] = [arc.centerPoint.x, arc.centerPoint.y, arc.radius, arc.radius * arc.radius]
		const [x1, y1]: [number, number] = [line.startPoint.x, line.startPoint.y]
		const [x2, y2]: [number, number] = [line.endPoint.x, line.endPoint.y]
		const [d1, d2]: [number, number] = [arc.centerPoint.distanceSquare(line.startPoint), arc.centerPoint.distanceSquare(line.endPoint)]
		const [state1, state2]: [number, number] = [DoubleKit.eq(d1, r2) ? 0 : d1 > r2 ? 1 : -1, DoubleKit.eq(d2, r2) ? 0 : d2 > r2 ? 1 : -1]
		const result: { count: number; points: Array<Vector2> } = { count: 0, points: [] }
		if (state1 === -1 && state2 === -1) {
			/**
			 * 线段的两个端点都在圆弧内�? 则不相交
			 **/
			return result
		}
		if (state1 === 0 && state2 === 0) {
			/**
			 * 线段的两个端点都在圆弧上
			 **/
			result.points.push(new Vector2(x1, y1))
			result.points.push(new Vector2(x2, y2))
			result.count += 2
		}
		if (state1 === 1 && state2 === 1) {
			/**
			 * 线段的两个端点都在圆弧外
			 **/
			/**
			 * 过圆弧圆心作垂直于线�?L 的垂�?LO
			 */
			const foot: Vector2 = D2LineToolkit.calcFootOfPoint2Line(line, arc.centerPoint).point
			/**
			 * 圆弧圆心到线�?L 的距�?
			 */
			const distance: number = foot.distanceSquare(arc.centerPoint)
			if (DoubleKit.greater(distance, r2)) {
				/**
				 * 圆心到线�?或其延长�?的距离大于半�?
				 **/
				return result
			}
			if (DoubleKit.eq(distance, r2)) {
				const d3: number = foot.distanceSquare(arc.startPoint)
				const d4: number = foot.distanceSquare(arc.endPoint)
				if (DoubleKit.eq(d3, 0)) {
					result.points.push(arc.startPoint)
					result.count += 1
				} else if (DoubleKit.eq(d4, 0)) {
					result.points.push(arc.endPoint)
					result.count += 1
				} else {
					result.points.push(foot)
					result.count += 1
				}
			} else {
				const closedPoint: Vector2 = D2LineToolkit.getClosedPointOnLineWithPoint(new Line(new Vector2(x1, y1), new Vector2(x2, y2)), new Vector2(cx, cy))
				const closedD: number = Vector.distance({ x: cx, y: cy }, { x: closedPoint.x, y: closedPoint.y })
				if (DoubleKit.eq(closedD, r)) {
					result.points.push(closedPoint)
					result.count += 1
				} else if (closedD < r) {
					const points1: Array<Vector2> = D2LineToolkit.getPointsOnLineWithDistance(r, new Line(new Vector2(x1, y1), closedPoint), new Vector2(cx, cy))
					for (let i: number = 0; i < points1.length; i++) {
						result.points.push(points1[i])
						result.count += 1
					}
					const points2: Array<Vector2> = D2LineToolkit.getPointsOnLineWithDistance(r, new Line(closedPoint, new Vector2(x2, y2)), new Vector2(cx, cy))
					for (let i: number = 0; i < points2.length; i++) {
						result.points.push(points2[i])
						result.count += 1
					}
				} else {
					return result
				}
			}
		} else if (state1 === -1 || state2 === -1) {
			const points: Array<Vector2> = D2LineToolkit.getPointsOnLineWithDistance(r, new Line(new Vector2(x1, y1), new Vector2(x2, y2)), new Vector2(cx, cy))
			for (let i: number = 0; i < points.length; i++) {
				result.points.push(points[i])
				result.count += 1
			}
		} else {
			/**
			 * 过圆弧圆心作垂直于线�?L 的垂�?LO
			 */
			const foot: Vector2 = D2LineToolkit.calcFootOfPoint2Line(line, arc.centerPoint).point
			if (state1 === 0) {
				result.points.push(line.startPoint)
				result.count += 1
				if (DoubleKit.neq(foot.distanceSquare(line.startPoint), 0) && (x1 - foot.x) * (x2 - foot.x) + (y1 - foot.y) * (y2 - foot.y) < 0) {
					const points: Array<Vector2> = D2LineToolkit.getPointsOnLineWithDistance(r, new Line(foot, new Vector2(x2, y2)), new Vector2(cx, cy))
					for (let i: number = 0; i < points.length; i++) {
						result.points.push(points[i])
						result.count += 1
					}
				}
			} else {
				result.points.push(line.endPoint)
				result.count += 1
				if (DoubleKit.neq(foot.distanceSquare(line.endPoint), 0) && (x1 - foot.x) * (x2 - foot.x) + (y1 - foot.y) * (y2 - foot.y) < 0) {
					const points: Array<Vector2> = D2LineToolkit.getPointsOnLineWithDistance(r, new Line(foot, new Vector2(x1, y1)), new Vector2(cx, cy))
					for (let i: number = 0; i < points.length; i++) {
						result.points.push(points[i])
						result.count += 1
					}
				}
			}
		}
		if (result.count > 0) {
			const points: Array<Vector2> = []
			let count: number = 0
			for (let i: number = 0; i < result.points.length; i++) {
				const point: Vector2 = result.points[i]
				if (Number.isFinite(point.x) && Number.isFinite(point.y)) {
					points.push(point)
					count += 1
				}
			}
			result.points = points
			result.count = count
			return result
		}
		return result
	}

	/**
	 * 计算圆弧 arcA 与圆�?arcB 的交点数�?
	 */
	public static getIntersectionsOfArcs(arcA: Arc, arcB: Arc): { count: number; points: Array<Vector2> } {
		const [x1, y1]: [number, number] = [arcA.centerPoint.x, arcA.centerPoint.y]
		const [x2, y2]: [number, number] = [arcB.centerPoint.x, arcB.centerPoint.y]
		const [r1, r2]: [number, number] = [arcA.radius, arcB.radius]
		const [r21, r22]: [number, number] = [arcA.radius * arcA.radius, arcB.radius * arcB.radius]
		const d: number = arcA.centerPoint.distance(arcB.centerPoint)
		const deltaR: number = Math.abs(r1 - r2)
		const R2: number = r1 + r2
		const result: { count: number; points: Array<Vector2> } = { count: 0, points: [] }
		if (DoubleKit.greater(d, R2) || DoubleKit.less(d, deltaR)) {
			/**
			 * 两圆弧外离和内含
			 **/
			return result
		}
		if (DoubleKit.eq(deltaR, 0) && DoubleKit.eq(d, 0)) {
			/**
			 * 两圆弧重�?
			 **/
			let p: Vector2 = null!
			if (D2ArcToolkit.isPointOnArc(arcA, arcB.startPoint)) {
				result.points.push(arcB.startPoint)
				result.count += 1
				p = arcB.startPoint
			}
			if (D2ArcToolkit.isPointOnArc(arcA, arcB.endPoint)) {
				result.points.push(arcB.endPoint)
				result.count += 1
				p = arcB.endPoint
			}
			if (result.count === 0) {
				if (D2ArcToolkit.isPointOnArc(arcB, arcA.startPoint)) {
					result.points.push(arcA.startPoint)
					result.count += 1
				}
				if (D2ArcToolkit.isPointOnArc(arcB, arcA.endPoint)) {
					result.points.push(arcA.endPoint)
					result.count += 1
				}
			} else if (result.count === 1) {
				if (!p.equalsWithVector2(arcA.startPoint) && D2ArcToolkit.isPointOnArc(arcB, arcA.startPoint)) {
					result.points.push(arcA.startPoint)
					result.count += 1
				}
				if (!p.equalsWithVector2(arcA.endPoint) && D2ArcToolkit.isPointOnArc(arcB, arcA.endPoint)) {
					result.points.push(arcA.endPoint)
					result.count += 1
				}
			}
			return result
		}
		if (DoubleKit.eq(d, R2)) {
			/**
			 * 两圆弧外�?
			 **/
			const checkPoints: Array<Vector2> = checkArcEndpoints(arcA, arcB)
			if (checkPoints.length) {
				for (let i: number = 0; i < checkPoints.length; i++) {
					result.points.push(checkPoints[i])
					result.count += 1
				}
				return result
			}
			const line: Line = new Line(arcA.centerPoint, arcB.centerPoint)
			const iR1: { count: number; points: Array<Vector2> } = D2Intersection.getIntersectionsOfLineAndArc(line, arcB)
			const iPoints1: Array<Vector2> = checkArcResult1(arcA, iR1.points)
			if (iPoints1.length) {
				for (let i: number = 0; i < iPoints1.length; i++) {
					result.points.push(iPoints1[i])
					result.count += 1
				}
				return result
			}
			const iR2: { count: number; points: Array<Vector2> } = D2Intersection.getIntersectionsOfLineAndArc(line, arcA)
			const iPoints2: Array<Vector2> = checkArcResult1(arcB, iR2.points)
			if (iPoints2.length) {
				for (let i: number = 0; i < iPoints2.length; i++) {
					result.points.push(iPoints2[i])
					result.count += 1
				}
				return result
			}
			return result
		}
		if (DoubleKit.greater(deltaR, 0) && DoubleKit.greater(d, 0) && DoubleKit.eq(d, deltaR)) {
			/**
			 * 两圆弧内�?
			 **/
			const checkPoints: Array<Vector2> = checkArcEndpoints(arcA, arcB)
			if (checkPoints.length) {
				for (let i: number = 0; i < checkPoints.length; i++) {
					result.points.push(checkPoints[i])
					result.count += 1
				}
				return result
			}
			if (r1 > r2) {
				const pro: number = (r1 - r2) / r1
				result.points.push(new Vector2(x1 + (x2 - x1) / pro, y1 + (y2 - y1) / pro))
				result.count += 1
				const iPoints: Array<Vector2> = checkArcResult2(arcA, arcB, result.points)
				result.points = iPoints
				result.count = iPoints.length
				return result
			}
			const pro: number = (r2 - r1) / r2
			result.points.push(new Vector2(x2 + (x1 - x2) / pro, y2 + (y1 - y2) / pro))
			result.count += 1
			const iPoints: Array<Vector2> = checkArcResult2(arcA, arcB, result.points)
			result.points = iPoints
			result.count = iPoints.length
			return result
		}
		const delta: number = (arcA.centerPoint.distanceSquare(arcB.centerPoint) - r22 + r21) / (d * 2)
		const pro: number = delta / d
		const [x, y]: [number, number] = [(x2 - x1) * pro + x1, (y2 - y1) * pro + y1]
		const [lineA, lineB]: [number, number] = [x2 - x1, y2 - y1]
		const offset: number = Math.max(r1, r2)
		let [xl, yl, xr, yr]: [number, number, number, number] = [undefined!, undefined!, undefined!, undefined!]
		if (Math.abs(lineA) < Math.abs(lineB)) {
			const k: number = lineA / -lineB
			const b: number = y - k * x
			xl = x - offset
			yl = k * xl + b
			xr = x + offset
			yr = k * xr + b
		} else {
			const k: number = lineB / -lineA
			const b: number = x - k * y
			yl = y - offset
			xl = k * yl + b
			yr = y + offset
			xr = k * yr + b
		}
		const points1: Array<Vector2> = D2LineToolkit.getPointsOnLineWithDistance(r1, new Line(new Vector2(xl, yl), new Vector2(x, y)), new Vector2(x1, y1))
		for (let i: number = 0; i < points1.length; i++) {
			result.points.push(points1[i])
			result.count += 1
		}
		const points2: Array<Vector2> = D2LineToolkit.getPointsOnLineWithDistance(r1, new Line(new Vector2(x, y), new Vector2(xr, yr)), new Vector2(x1, y1))
		for (let i: number = 0; i < points2.length; i++) {
			result.points.push(points2[i])
			result.count += 1
		}
		if (result.count !== 2) {
			throw new Error(`cnt !== 4.`)
		}
		const [p1, p2]: [Vector2, Vector2] = result.points as [Vector2, Vector2]
		if (D2ArcToolkit.isPointOnArc(arcA, p1) && D2ArcToolkit.isPointOnArc(arcB, p1)) {
			if (D2ArcToolkit.isPointOnArc(arcA, p2) && D2ArcToolkit.isPointOnArc(arcB, p2)) {
				return result
			}
			if (endpointIsOn(arcA.startPoint, arcB, p2, p1)) {
				result.points[1] = arcA.startPoint
				return result
			}
			if (endpointIsOn(arcA.endPoint, arcB, p2, p1)) {
				result.points[1] = arcA.endPoint
				return result
			}
			if (endpointIsOn(arcB.startPoint, arcA, p2, p1)) {
				result.points[1] = arcB.startPoint
				return result
			}
			if (endpointIsOn(arcB.endPoint, arcA, p2, p1)) {
				result.points[1] = arcB.endPoint
				return result
			}
			if (endpointIsOn(arcA.startPoint, arcB, p1, p2)) {
				result.points[1] = arcA.startPoint
				return result
			}
			if (endpointIsOn(arcA.endPoint, arcB, p1, p2)) {
				result.points[1] = arcA.endPoint
				return result
			}
			if (endpointIsOn(arcB.startPoint, arcA, p1, p2)) {
				result.points[1] = arcB.startPoint
				return result
			}
			if (endpointIsOn(arcB.endPoint, arcA, p1, p2)) {
				result.points[1] = arcB.endPoint
				return result
			}
			return result
		}
		if (D2ArcToolkit.isPointOnArc(arcA, p2) && D2ArcToolkit.isPointOnArc(arcB, p2)) {
			if (endpointIsOn(arcA.startPoint, arcB, p1, p2)) {
				result.points[1] = arcA.startPoint
				return result
			}
			if (endpointIsOn(arcA.endPoint, arcB, p1, p2)) {
				result.points[1] = arcA.endPoint
				return result
			}
			if (endpointIsOn(arcB.startPoint, arcA, p1, p2)) {
				result.points[1] = arcB.startPoint
				return result
			}
			if (endpointIsOn(arcB.endPoint, arcA, p1, p2)) {
				result.points[1] = arcB.endPoint
				return result
			}
			if (endpointIsOn(arcA.startPoint, arcB, p2, p1)) {
				result.points[1] = arcA.startPoint
				return result
			}
			if (endpointIsOn(arcA.endPoint, arcB, p2, p1)) {
				result.points[1] = arcA.endPoint
				return result
			}
			if (endpointIsOn(arcB.startPoint, arcA, p2, p1)) {
				result.points[1] = arcB.startPoint
				return result
			}
			if (endpointIsOn(arcB.endPoint, arcA, p2, p1)) {
				result.points[1] = arcB.endPoint
				return result
			}
			return result
		}
		let [finded1, finded2]: [boolean, boolean] = [false, false]
		const check = (p: Vector2, arc: Arc): Array<Vector2> => {
			const points: Array<Vector2> = []
			if (!(DoubleKit.eq(p.distance(arc.centerPoint), arc.radius) && D2ArcToolkit.isPointOnArc(arc, p))) {
				return points
			}
			if (p.distanceSquare(p1) < p.distanceSquare(p2)) {
				if (finded1) {
					return points
				}
				finded1 = true
			} else {
				if (finded2) {
					return points
				}
				finded2 = true
			}
			points.push(p)
			return points
		}
		result.points = []
		result.count = 0
		const cPoints: Array<Vector2> = ([] as Array<Vector2>).concat(check(arcA.startPoint, arcB), check(arcA.endPoint, arcB), check(arcB.startPoint, arcA), check(arcB.endPoint, arcA))
		for (let i: number = 0; i < cPoints.length; i++) {
			result.points.push(cPoints[i])
			result.count += 1
		}
		return result
	}

	/**
	 * 计算线段 lineA 与线�?lineB 的交点坐�?
	 * 		排除重叠场景
	 */
	public static getStictIntersectionPointOfSegment(A: Vector2, B: Vector2, C: Vector2, D: Vector2): Vector2 {
		const equals = (A: Vector2, B: Vector2, place: number): boolean => {
			if (A instanceof Vector2 && B instanceof Vector2) {
				return Math.abs(A.x - B.x) <= place && Math.abs(A.y - B.y) <= place
			}
			return false
		}
		let samePoint: Vector2 = equals(A, C, 0.5) || equals(A, D, 0.5) ? A : equals(B, C, 0.5) || equals(B, D, 0.5) ? B : null!
		if (samePoint) {
			return null!
		}
		let [dx, dy]: [number, number] = [B.x - A.x, B.y - A.y]
		let [da, db]: [number, number] = [D.x - C.x, D.y - C.y]
		let [t, s, u]: [number, number, number] = [undefined!, undefined!, undefined!]
		let [dx13, dy13]: [number, number] = [undefined!, undefined!]
		u = da * dy - db * dx
		if (u === 0) {
			/**
			 * 平行或处于同一条直线上
			 **/
			return null!
		}
		dx13 = C.x - A.x
		dy13 = C.y - A.y
		s = (dx * dy13 - dy * dx13) / u
		t = (da * dy13 - db * dx13) / u
		if (s >= 0 && s <= 1 && t >= 0 && t <= 1) {
			/**
			 * 相交
			 **/
			return new Vector2(A.x + t * dx, A.y + t * dy)
		}
		return null!
	}

	/**
	 * 判断线段 lineA 与线�?lineB 是否相交
	 * 		包含延长�?
	 */
	public static isIntersectOfLines(lineA: Line, lineB: Line): Vector2 {
		const [A, B, C, D]: [Vector2, Vector2, Vector2, Vector2] = [lineA.startPoint, lineA.endPoint, lineB.startPoint, lineB.endPoint]
		const [a1, b1]: [number, number] = [B.y - A.y, A.x - B.x]
		const c1: number = a1 * A.x + b1 * A.y
		const [a2, b2]: [number, number] = [D.y - C.y, C.x - D.x]
		const c2: number = a2 * C.x + b2 * C.y
		const d: number = a1 * b2 - a2 * b1
		if (d === 0) {
			/**
			 * 线段平行
			 **/
			return null!
		}
		const [x, y]: [number, number] = [(b2 * c1 - b1 * c2) / d, (a1 * c2 - a2 * c1) / d]
		return new Vector2(x, y)
	}

	/**
	 * 判断折线 polyline 是否存在自交�?
	 */
	public static isSelfIntersectionOfPolyline(pl: Polyline): Array<Vector2> {
		const intersPoints: Array<Vector2> = []
		for (let i: number = 0; i < pl.primitives.length; i++) {
			const pt1: Primitive = pl.primitives[i]
			for (let j: number = i + 1; j < pl.primitives.length; j++) {
				const pt2: Primitive = pl.primitives[j]
				const intersPoint: Vector2 = D2Intersection.getStictIntersectionPointOfSegment(pt1.startPoint.mul(0.1), pt1.endPoint.mul(0.1), pt2.startPoint.mul(0.1), pt2.endPoint.mul(0.1))
				if (intersPoint) {
					intersPoints.push(intersPoint)
				}
			}
		}
		return intersPoints
	}
}
