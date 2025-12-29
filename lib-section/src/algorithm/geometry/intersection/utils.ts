import { BBox2 } from '../../../engine/algorithm/geometry/bbox/BBox2'
import { Vector2 } from '../../../engine/algorithm/geometry/vector/Vector2'
import { Angles } from '../../../engine/math/Angles'
import { DoubleKit } from '../../../engine/math/Doublekit'
import { isFloatEqual } from '../../../engine/utils/Utils'
import { Arc } from '../primitives/Arc'
import { Line } from '../primitives/Line'
import { Polyline } from '../primitives/Polyline'
import { Primitive } from '../primitives/Primitive'
import { Distance } from '../Distance'
import { intersLL } from './Intersection'
import { ARC_EPS, CACHE } from './profile'
import { Vector } from '../../../engine/algorithm/geometry/vector/Vector'

function eq(a: number, b: number): boolean {
	return Math.abs(a - b) <= 1e-6
}

function arrayCopy(src: Float64Array, srcIndex: number, dst: Float64Array, dstIndex: number, length: number): void {
	if (src.length >= srcIndex + length && dst.length >= dstIndex + length) {
		while (length-- > 0) {
			dst[dstIndex++] = src[srcIndex++]
		}
		return
	}
	throw new Error(`Array Copy out of range.`)
}

export function contains(bbox2: BBox2, x: number, y: number): boolean {
	if (Number.isFinite(x) && Number.isFinite(y)) {
		return bbox2.isContainsPoint(new Vector2(x, y))
	}
	return false
}

/**
 * 获取线段 1 与线段 2 的 BBox2 的重叠区域(返回 BBox2)
 */
export function fastIntersectionDetection(m: Line, n: Line): BBox2 {
	const inters: BBox2 = m.bbox2.getIntersection(n.bbox2)
	if (inters === null) {
		return null!
	}
	const c1: number = Vector2.crossProd2(n.startPoint.x, n.startPoint.y, n.endPoint.x, n.endPoint.y, m.startPoint.x, m.startPoint.y)
	const c2: number = Vector2.crossProd2(n.startPoint.x, n.startPoint.y, n.endPoint.x, n.endPoint.y, m.endPoint.x, m.endPoint.y)
	if (Math.abs(c1) < 1e-8 || Math.abs(c2) < 1e-8 || c1 * c2 < 0) {
		return inters
	}
	return null!
}

export function pointIsContain(point: Vector2, lineStartPoint: Vector2, lineEndPoint: Vector2, place: number = 0.5): boolean {
	const data = pointSegmentClosest(point, lineStartPoint, lineEndPoint)
	if (data.d <= place) {
		point = data.point
	}
	const start2End: number = lineStartPoint.distance(lineEndPoint)
	const start2Point: number = lineStartPoint.distance(point)
	const end2Point: number = lineEndPoint.distance(point)
	const isInLine: boolean = isFloatEqual(start2Point + end2Point, start2End, 1e-3)
	return isInLine
}

/**
 * 获取点到线段的最短距离及最近点
 */
export function pointSegmentClosest(P: Vector2, A: Vector2, B: Vector2): { d: number; point: Vector2 } {
	let t: number = undefined!
	let x1: number = A.x
	let y1: number = A.y
	let x2: number = B.x
	let y2: number = B.y
	let px: number = P.x
	let py: number = P.y
	let dx: number = x2 - x1
	let dy: number = y2 - y1
	let dxPA: number = px - x1
	let dyPA: number = py - y1
	let dxPB: number = undefined!
	let dyPB: number = undefined!
	let dxPQ: number = undefined!
	let dyPQ: number = undefined!
	let qx: number = undefined!
	let qy: number = undefined!
	if (dx === 0 && dy === 0) {
		return {
			d: Math.sqrt(dxPA * dxPA + dyPA * dyPA),
			point: new Vector2(x1, y1),
		}
	}
	t = (dxPA * dx + dyPA * dy) / (dx * dx + dy * dy)
	if (t < 0) {
		return {
			d: Math.sqrt(dxPA * dxPA + dyPA * dyPA),
			point: new Vector2(x2, y2),
		}
	}
	if (t > 1) {
		dxPB = px - x2
		dyPB = py - y2
		return {
			d: Math.sqrt(dxPB * dxPB + dyPB * dyPB),
			point: new Vector2(x2, y2),
		}
	}
	qx = x1 + t * dx
	qy = y1 + t * dy
	dxPQ = px - qx
	dyPQ = py - qy
	return {
		d: Math.sqrt(dxPQ * dxPQ + dyPQ * dyPQ),
		point: new Vector2(qx, qy),
	}
}

/**
 * 判断点是否在圆弧上
 */
export function pointsInArc(arc: Arc, point: Vector2): boolean {
	const arcCenter: Vector2 = arc.centerPoint
	const arcRadius: number = arc.rx
	const arcLineStart: Vector2 = arc.startPoint
	const arcLineEnd: Vector2 = arc.endPoint
	/**
	 * 圆弧线段中点
	 */
	const arcLineCenter: Vector2 = arc.centerPoint
	const point2Center: number = point.distance(arcCenter)
	const lineSP: Line = new Line(arcLineStart, arcLineCenter)
	const lineEP: Line = new Line(arcLineEnd, arcLineCenter)
	const linePC: Line = new Line(point, arcCenter)
	/**
	 * 记圆弧端点 A 到圆弧中点 M 的线段为 LA
	 * 记圆弧端点 B 到圆弧中点 M 的线段为 LB
	 * 判断点 P 到圆弧中心点的线段 LP 是否与 LA 或 LB 相交
	 */
	const psIsInterSmOrm: number = intersLL(lineSP, linePC) || intersLL(lineEP, linePC)
	const isPoint2CenterEqualRadius: boolean = isFloatEqual(point2Center, arcRadius, 1e-3)
	return isPoint2CenterEqualRadius && !!psIsInterSmOrm
}

/**
 * 求解圆弧与线段相交
 */
export function intersRegularArcLine(m: Arc, n: Line): number {
	let inters: BBox2 = m.bbox2.getIntersection(n.bbox2)
	if (inters === null) {
		return 0
	}
	const isInterPoint = (point: Vector2): boolean => {
		return contains(inters, point.x, point.y) && isOn(m, point)
	}
	const cx: number = m.centerPoint.x
	const cy: number = m.centerPoint.y
	const r: number = m.rx
	const r2: number = m.rx * m.rx
	const x1: number = n.startPoint.x
	const y1: number = n.startPoint.y
	const x2: number = n.endPoint.x
	const y2: number = n.endPoint.y
	const d1: number = m.centerPoint.distance2(n.startPoint)
	const d2: number = m.centerPoint.distance2(n.endPoint)
	const state1: number = DoubleKit.eq(d1, r2) ? 0 : d1 > r2 ? 1 : -1
	const state2: number = DoubleKit.eq(d2, r2) ? 0 : d2 > r2 ? 1 : -1
	let cnt: number = 0
	if (state1 === -1 && state2 === -1) {
		/**
		 * 线段的两个端点都在圆弧内部, 则不相交
		 **/
		return 0
	}
	if (state1 === 0 && state2 === 0) {
		/**
		 * 线段的两个端点都在圆弧上
		 **/
		CACHE[cnt++] = x1
		CACHE[cnt++] = y1
		CACHE[cnt++] = x2
		CACHE[cnt++] = y2
	}
	if (state1 === 1 && state2 === 1) {
		/**
		 * 线段的两个端点都在圆弧外
		 **/
		/**
		 * 过圆弧圆心作垂直于线段 L 的垂线 LO
		 */
		const foot: Vector2 = Distance.foot(n, m.centerPoint)
		/**
		 * 圆弧圆心到线段 L 的距离
		 */
		const distance: number = foot.distance(m.centerPoint)
		if (DoubleKit.greater(distance, r)) {
			/**
			 * 圆心到线段(或其延长线)的距离大于半径
			 **/
			return 0
		}
		if (DoubleKit.eq(distance, r)) {
			if (DoubleKit.eq(n.distance2(m.startPoint), 0)) {
				CACHE[cnt++] = m.startPoint.x
				CACHE[cnt++] = m.startPoint.y
				CACHE[cnt++] = m.startPoint.x
				CACHE[cnt++] = m.startPoint.y
			} else if (DoubleKit.eq(n.distance2(m.endPoint), 0)) {
				CACHE[cnt++] = m.endPoint.x
				CACHE[cnt++] = m.endPoint.y
				CACHE[cnt++] = m.endPoint.x
				CACHE[cnt++] = m.endPoint.y
			} else {
				CACHE[cnt++] = foot.x
				CACHE[cnt++] = foot.y
				CACHE[cnt++] = foot.x
				CACHE[cnt++] = foot.y
			}
		} else {
			cnt = closedPointLine(cx, cy, x1, y1, x2, y2, cnt)
			const closedX: number = CACHE[cnt - 2]
			const closedY: number = CACHE[cnt - 1]
			const closedD: number = Vector.distance({ x: cx, y: cy }, { x: closedX, y: closedY })
			cnt -= 2
			if (DoubleKit.eq(closedD, r)) {
				CACHE[cnt++] = closedX
				CACHE[cnt++] = closedY
			} else if (closedD < r) {
				cnt = findPointAtLineAsDistance2(r2, cx, cy, x1, y1, closedX, closedY, cnt)
				cnt = findPointAtLineAsDistance2(r2, cx, cy, closedX, closedY, x2, y2, cnt)
			} else {
				return 0
			}
		}
	} else if (state1 === -1 || state2 === -1) {
		cnt = findPointAtLineAsDistance2(r2, cx, cy, x1, y1, x2, y2, cnt)
	} else {
		/**
		 * 过圆弧圆心作垂直于线段 L 的垂线 LO
		 */
		const foot: Vector2 = Distance.foot(n, m.centerPoint)
		/**
		 * 圆弧圆心到线段 L 的距离
		 */
		const distance: number = foot.distance(m.centerPoint)
		if (DoubleKit.eq(distance, r)) {
			if (state1 === 0) {
				const p: Vector2 = n.startPoint
				if (isInterPoint(p)) {
					CACHE[cnt++] = p.x
					CACHE[cnt++] = p.y
					CACHE[cnt++] = p.x
					CACHE[cnt++] = p.y
					return cnt
				}
				if (isInterPoint(foot)) {
					CACHE[cnt++] = foot.x
					CACHE[cnt++] = foot.y
					CACHE[cnt++] = foot.x
					CACHE[cnt++] = foot.y
					return cnt
				}
				if (d1 <= r) {
					cnt = findPointAtLineAsDistance2(r2, cx, cy, foot.x, foot.y, x2, y2, cnt)
					if (cnt === 2) {
						CACHE[cnt++] = CACHE[0]
						CACHE[cnt++] = CACHE[1]
					}
				} else if (distance < r) {
					cnt = findPointAtLineAsDistance2(r2, cx, cy, foot.x, foot.y, x2, y2, cnt)
					if (cnt === 2 && isInterPoint(new Vector2(CACHE[0], CACHE[1]))) {
						CACHE[cnt++] = CACHE[0]
						CACHE[cnt++] = CACHE[1]
						return cnt
					}
					cnt = findPointAtLineAsDistance2(r2, cx, cy, foot.x, foot.y, x1, y1, cnt)
					if (cnt === 2) {
						CACHE[cnt++] = CACHE[0]
						CACHE[cnt++] = CACHE[1]
					}
				}
			} else {
				const p: Vector2 = n.endPoint
				if (isInterPoint(p)) {
					CACHE[cnt++] = p.x
					CACHE[cnt++] = p.y
					CACHE[cnt++] = p.x
					CACHE[cnt++] = p.y
					return cnt
				}
				if (isInterPoint(foot)) {
					CACHE[cnt++] = foot.x
					CACHE[cnt++] = foot.y
					CACHE[cnt++] = foot.x
					CACHE[cnt++] = foot.y
					return cnt
				}
				if (d2 <= r) {
					cnt = findPointAtLineAsDistance2(r2, cx, cy, foot.x, foot.y, x1, y1, cnt)
					if (cnt === 2) {
						CACHE[cnt++] = CACHE[0]
						CACHE[cnt++] = CACHE[1]
					}
				} else if (distance < r) {
					cnt = findPointAtLineAsDistance2(r2, cx, cy, foot.x, foot.y, x1, y1, cnt)
					if (cnt === 2 && isInterPoint(new Vector2(CACHE[0], CACHE[1]))) {
						CACHE[cnt++] = CACHE[0]
						CACHE[cnt++] = CACHE[1]
						return cnt
					}
					cnt = findPointAtLineAsDistance2(r2, cx, cy, foot.x, foot.y, x2, y2, cnt)
					if (cnt === 2) {
						CACHE[cnt++] = CACHE[0]
						CACHE[cnt++] = CACHE[1]
					}
				}
			}
		} else if (state1 === 0) {
			const p: Vector2 = n.startPoint
			CACHE[cnt++] = p.x
			CACHE[cnt++] = p.y
			if ((x1 - foot.x) * (x2 - foot.x) + (y1 - foot.y) * (y2 - foot.y) < 0) {
				cnt = findPointAtLineAsDistance2(r2, cx, cy, foot.x, foot.y, x2, y2, cnt)
			}
		} else {
			const p: Vector2 = n.endPoint
			CACHE[cnt++] = p.x
			CACHE[cnt++] = p.y
			if ((x1 - foot.x) * (x2 - foot.x) + (y1 - foot.y) * (y2 - foot.y) < 0) {
				cnt = findPointAtLineAsDistance2(r2, cx, cy, foot.x, foot.y, x1, y1, cnt)
			}
		}
	}
	if (cnt > 0) {
		let idx: number = 0
		for (let i: number = 0; i < cnt; i += 2) {
			const x: number = CACHE[i]
			const y: number = CACHE[i + 1]
			if (Number.isFinite(x) && Number.isFinite(y) && contains(inters, x, y) && isOn(m, new Vector2(x, y))) {
				CACHE[idx++] = x
				CACHE[idx++] = y
			}
		}
		return idx
	}
	return 0
}

/**
 * 求解圆弧与线段(包含延长线)相交
 */
export function intersExtendRegularArcLine(m: Arc, n: Line): number {
	if (!m.bbox2) {
		return 0
	}
	const cx: number = m.centerPoint.x
	const cy: number = m.centerPoint.y
	const r: number = m.rx
	const r2: number = m.rx * m.rx
	const x1: number = n.startPoint.x
	const y1: number = n.startPoint.y
	const x2: number = n.endPoint.x
	const y2: number = n.endPoint.y
	const d1: number = m.centerPoint.distance2(n.startPoint)
	const d2: number = m.centerPoint.distance2(n.endPoint)
	const state1: number = DoubleKit.eq(d1, r2) ? 0 : d1 > r2 ? 1 : -1
	const state2: number = DoubleKit.eq(d2, r2) ? 0 : d2 > r2 ? 1 : -1
	let cnt: number = 0
	if (state1 === -1 && state2 === -1) {
		/**
		 * 线段的两个端点都在圆弧内部, 则不相交
		 **/
		return 0
	}
	if (state1 === 0 && state2 === 0) {
		/**
		 * 线段的两个端点都在圆弧上
		 **/
		CACHE[cnt++] = x1
		CACHE[cnt++] = y1
		CACHE[cnt++] = x2
		CACHE[cnt++] = y2
	}
	if (state1 === 1 && state2 === 1) {
		/**
		 * 线段的两个端点都在圆弧外
		 **/
		/**
		 * 过圆弧圆心作垂直于线段 L 的垂线 LO
		 */
		const foot: Vector2 = Distance.foot(n, m.centerPoint)
		/**
		 * 圆弧圆心到线段 L 的距离
		 */
		const distance: number = foot.distance2(m.centerPoint)
		if (DoubleKit.greater(distance, r2)) {
			/**
			 * 圆心到线段(或其延长线)的距离大于半径
			 **/
			return 0
		}
		if (DoubleKit.eq(distance, r2)) {
			const d3: number = foot.distance2(m.startPoint)
			const d4: number = foot.distance2(m.endPoint)
			if (DoubleKit.eq(d3, 0)) {
				CACHE[cnt++] = m.startPoint.x
				CACHE[cnt++] = m.startPoint.y
			} else if (DoubleKit.eq(d4, 0)) {
				CACHE[cnt++] = m.endPoint.x
				CACHE[cnt++] = m.endPoint.y
			} else {
				CACHE[cnt++] = foot.x
				CACHE[cnt++] = foot.y
			}
		} else {
			cnt = closedPointLine(cx, cy, x1, y1, x2, y2, cnt)
			const closedX: number = CACHE[cnt - 2]
			const closedY: number = CACHE[cnt - 1]
			const closedD: number = Vector.distance({ x: cx, y: cy }, { x: closedX, y: closedY })
			cnt -= 2
			if (DoubleKit.eq(closedD, r)) {
				CACHE[cnt++] = closedX
				CACHE[cnt++] = closedY
			} else if (closedD < r) {
				cnt = findPointAtLineAsDistance2(r2, cx, cy, x1, y1, closedX, closedY, cnt)
				cnt = findPointAtLineAsDistance2(r2, cx, cy, closedX, closedY, x2, y2, cnt)
			} else {
				return 0
			}
		}
	} else if (state1 === -1 || state2 === -1) {
		cnt = findPointAtLineAsDistance2(r2, cx, cy, x1, y1, x2, y2, cnt)
	} else {
		/**
		 * 过圆弧圆心作垂直于线段 L 的垂线 LO
		 */
		const foot: Vector2 = Distance.foot(n, m.centerPoint)
		if (state1 === 0) {
			CACHE[cnt++] = n.startPoint.x
			CACHE[cnt++] = n.startPoint.y
			if (DoubleKit.neq(foot.distance2(n.startPoint), 0) && (x1 - foot.x) * (x2 - foot.x) + (y1 - foot.y) * (y2 - foot.y) < 0) {
				cnt = findPointAtLineAsDistance2(r2, cx, cy, foot.x, foot.y, x2, y2, cnt)
			}
		} else {
			CACHE[cnt++] = n.endPoint.x
			CACHE[cnt++] = n.endPoint.y
			if (DoubleKit.neq(foot.distance2(n.endPoint), 0) && (x1 - foot.x) * (x2 - foot.x) + (y1 - foot.y) * (y2 - foot.y) < 0) {
				cnt = findPointAtLineAsDistance2(r2, cx, cy, foot.x, foot.y, x1, y1, cnt)
			}
		}
	}
	if (cnt > 0) {
		let idx: number = 0
		for (let i: number = 0; i < cnt; i += 2) {
			const x: number = CACHE[i]
			const y: number = CACHE[i + 1]
			if (Number.isFinite(x) && Number.isFinite(y)) {
				CACHE[cnt++] = x
				CACHE[cnt++] = y
			}
		}
		return idx
	}
	return 0
}

/**
 * 求点到线段的距离
 * 		给定一个半径为 r 的圆的圆心 P(px, py) 和半径的平方 d2 = r * r, 线段 L 的两个端点 A(x1, y1) 和 B(x2, y2)
 * 		求线段 P1P2 上到点 O 的距离等于 r 的点
 */
function findPointAtLineAsDistance2(d2: number, px: number, py: number, x1: number, y1: number, x2: number, y2: number, idx: number): number {
	if (y1 === y2) {
		/**
		 * 处理线段 L 为水平的情况
		 **/
		/**
		 * 圆的一般式 (x - Px) * (x - Px) + (y - Py) * (y - Py) = r * r
		 * 求解 x = Px + Math.sqrt(r * r - (y - pY) * (y - pY)) 或 x = Px - Math.sqrt(r * r - (y - pY) * (y - pY))
		 */
		const delta: number = d2 - (y1 - py) * (y1 - py)
		if (DoubleKit.greater(delta, 0)) {
			const x: number = Math.sqrt(delta)
			const result1: number = px - x
			const result2: number = px + x
			const minX: number = Math.min(x1, x2)
			const maxX: number = Math.max(x1, x2)
			if (result1 >= minX && result1 <= maxX) {
				CACHE[idx++] = result1
				CACHE[idx++] = y1
			}
			if (result2 >= minX && result2 <= maxX) {
				CACHE[idx++] = result2
				CACHE[idx++] = y1
			}
			return idx
		}
	}
	/**
	 * 迭代法求解 逼近交点
	 */
	let startD: number = Vector2.distance2(x1, y1, px, py) - d2
	let endD: number = Vector2.distance2(x2, y2, px, py) - d2
	let startX: number = x1
	let startY: number = y1
	let endX: number = x2
	let endY: number = y2
	let x: number = NaN!
	let y: number = NaN!
	let midD: number = Number.POSITIVE_INFINITY
	let cnt: number = 0
	while (midD !== 0) {
		cnt++
		/**
		 * 按比例分割截取线段 L, 不断更新 start 和 end, 找到距离圆心 P 的距离为 r * r 的坐标点
		 */
		const nextRatio = Math.max(Math.min(Math.abs(startD) / (Math.abs(startD) + Math.abs(endD)), 0.75), 0.25)
		x = startX + (endX - startX) * nextRatio
		y = startY + (endY - startY) * nextRatio
		if ((startX === x && startY === y) || (endX === x && endY === y)) {
			if (Math.abs(startD) > Math.abs(endD)) {
				x = endX
				y = endY
				midD = endD
			} else {
				x = startX
				y = startY
				midD = startD
			}
			break
		} else {
			midD = Vector2.distance2(x, y, px, py) - d2
			if ((midD < 0 && startD > endD) || (midD > 0 && startD < endD)) {
				endX = x
				endY = y
				endD = midD
			} else {
				startX = x
				startY = y
				startD = midD
			}
		}
	}
	const delta: number = Math.sqrt(d2) - Vector.distance({ x, y }, { x: px, y: py })
	if (DoubleKit.eq(0, midD) || DoubleKit.eq(0, delta)) {
		CACHE[idx++] = x
		CACHE[idx++] = y
		return idx
	}
	return idx
	/**
	 * 使用解方程组方法求解线段 L 与圆 O 的交点问题
	 * 		对于圆心为 P(px, py) 半径为 r 的圆, 参数方程 FO 如下:
	 * 			x = Px + r * cos(θ)
	 * 			y = Py + r * sin(θ)
	 * 		对于圆心为 P(px, py) 半径为 r 的圆, 标准方程 FS0 如下:
	 * 			(x - Px) * (x - Px) + (y - Py) * (y - Py) = r * r
	 * 		对于经过坐标点 A(x1, y1) 和坐标点 B(x2, y2) 的直线 L, 参数方程 FL 如下:
	 * 			x = x1 + (x2 - x1) * t
	 * 			y = y1 + (y2 - y1) * t
	 * 		将 FL 带入 FS0, 得 t 的解如下:
	 * 			t = (-B + Math.sqrt(B * B - 4 * A * C)) / (X * A))) 或 t = (-B - Math.sqrt(B * B - 4 * A * C)) / (X * A)))
	 * 			其中:
	 * 				A = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1)
	 * 				B = 2 * ((x2 - x1) * (x1 - Px) + (y2 - y1) * (y1 - Py))
	 * 				C = (x1 - Px) * (x1 - Px) + (y1 - Py) * (y1 - Py) - r * r
	 * 			若 B * B - 4 * A * C 存在实数解且 t 存在于 [0, 1] , 则表示线段 L 与圆有交点
	 * 		将 t 带入 FL, 即可求出交点坐标 (x(n), y(n))
	 */
}

/**
 * 记点 P1(x1, y1) 和点 P2(x2, y2) 构成的线段为 L
 * 求 L 上距离点 P(x, y) 最近的点
 */
export function closedPointLine(px: number, py: number, x1: number, y1: number, x2: number, y2: number, cnt: number): number {
	const c1: number = Vector2.crossProd2(x1, y1, x2, y2, px, py)
	if (c1 === 0) {
		/**
		 * 三点共线
		 **/
		const dp1: number = Vector2.dotProd2(x1, y1, x2, y2, px, py)
		const dp2: number = Vector2.dotProd2(x2, y2, x1, y1, px, py)
		if (dp1 < 0 && dp2 < 0) {
			CACHE[cnt++] = px
			CACHE[cnt++] = py
			return cnt
		}
		if (dp1 >= 0) {
			CACHE[cnt++] = x2
			CACHE[cnt++] = y2
			return cnt
		}
		CACHE[cnt++] = x1
		CACHE[cnt++] = y1
		return cnt
	}
	let x: number = NaN
	let y: number = NaN
	let startX: number = x1
	let startY: number = y1
	let endX: number = x2
	let endY: number = y2
	let startD: number = Vector2.distance2(x1, y1, px, py)
	let endD: number = Vector2.distance2(x2, y2, px, py)
	let midD: number = Number.POSITIVE_INFINITY
	let times: number = 0
	while (midD > 0) {
		times++
		x = startX + (endX - startX) * 0.5
		y = startY + (endY - startY) * 0.5
		if (startD === endD || (startX === x && startY === y) || (endX === x && endY === y)) {
			break
		}
		midD = Vector2.distance2(x, y, px, py)
		let dp: number = Vector2.dotProd2(startX, startY, x, y, px, py)
		if (dp === 0) {
			break
		}
		if (dp < 0) {
			endX = x
			endY = y
			endD = midD
		} else {
			startX = x
			startY = y
			startD = midD
		}
	}
	CACHE[cnt++] = x
	CACHE[cnt++] = y
	return cnt
}

/**
 * 求解圆弧 A1 与圆弧 A2 的交点
 */
export function inters1(arc1: Arc, arc2: Arc): number {
	const x1: number = arc1.centerPoint.x
	const y1: number = arc1.centerPoint.y
	const x2: number = arc2.centerPoint.x
	const y2: number = arc2.centerPoint.y
	const r1: number = arc1.rx
	const r2: number = arc2.rx
	const r21: number = arc1.rx * arc1.rx
	const r22: number = arc2.rx * arc2.rx
	const d: number = arc1.centerPoint.distance(arc2.centerPoint)
	const deltaR: number = Math.abs(r1 - r2)
	const R2: number = r1 + r2
	if (DoubleKit.greater(d, R2) || DoubleKit.less(d, deltaR)) {
		/**
		 * 两圆弧外离和内含
		 **/
		return 0
	}
	if (DoubleKit.eq(deltaR, 0) && DoubleKit.eq(d, 0)) {
		/**
		 * 两圆弧重合
		 **/
		let cnt: number = 0
		let p: Vector2 = null!
		if (isOn(arc1, arc2.startPoint)) {
			CACHE[cnt] = arc2.startPoint.x
			CACHE[cnt + 1] = arc2.startPoint.y
			cnt += 2
			p = arc2.startPoint
		}
		if (isOn(arc1, arc2.endPoint)) {
			CACHE[cnt] = arc2.endPoint.x
			CACHE[cnt + 1] = arc2.endPoint.y
			cnt += 2
			p = arc2.endPoint
		}
		if (cnt === 0) {
			if (isOn(arc2, arc1.startPoint)) {
				CACHE[cnt] = arc1.startPoint.x
				CACHE[cnt + 1] = arc1.startPoint.y
				cnt += 2
			}
			if (isOn(arc2, arc1.endPoint)) {
				CACHE[cnt] = arc1.endPoint.x
				CACHE[cnt + 1] = arc1.endPoint.y
				cnt += 2
			}
		} else if (cnt === 2) {
			if (!p.equalsWithVector2(arc1.startPoint) && isOn(arc2, arc1.startPoint)) {
				CACHE[cnt] = arc1.startPoint.x
				CACHE[cnt + 1] = arc1.startPoint.y
				cnt += 2
			}
			if (!p.equalsWithVector2(arc1.endPoint) && isOn(arc2, arc1.endPoint)) {
				CACHE[cnt] = arc1.endPoint.x
				CACHE[cnt + 1] = arc1.endPoint.y
				cnt += 2
			}
		}
		return cnt
	}
	if (DoubleKit.eq(d, R2)) {
		/**
		 * 两圆弧外切
		 **/
		if (checkArcEndpoints(arc1, arc2)) {
			return 4
		}
		const line: Line = new Line(arc1.centerPoint, arc2.centerPoint)
		const cnt: number = intersRegularArcLine(arc2, line)
		const finalCnt: number = checkArcResult1(arc1, cnt)
		if (finalCnt !== 0) {
			return finalCnt
		}
		const cnt2: number = intersRegularArcLine(arc1, line)
		return checkArcResult1(arc2, cnt2)
	}
	if (DoubleKit.greater(deltaR, 0) && DoubleKit.greater(d, 0) && DoubleKit.eq(d, deltaR)) {
		/**
		 * 两圆弧内切
		 **/
		if (checkArcEndpoints(arc1, arc2)) {
			return 4
		}
		if (r1 > r2) {
			const pro: number = (r1 - r2) / r1
			CACHE[0] = x1 + (x2 - x1) / pro
			CACHE[1] = y1 + (y2 - y1) / pro
			return checkArcResult2(arc1, arc2, 2)
		}
		const pro: number = (r2 - r1) / r2
		CACHE[0] = x2 + (x1 - x2) / pro
		CACHE[1] = y2 + (y1 - y2) / pro
		return checkArcResult2(arc1, arc2, 2)
	}
	const delta: number = (arc1.centerPoint.distance2(arc2.centerPoint) - r22 + r21) / (d * 2)
	const pro: number = delta / d
	const x: number = (x2 - x1) * pro + x1
	const y: number = (y2 - y1) * pro + y1
	const lineA: number = x2 - x1
	const lineB: number = y2 - y1
	const offset: number = Math.max(r1, r2)
	let xl: number = undefined!
	let yl: number = undefined!
	let xr: number = undefined!
	let yr: number = undefined!
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
	let cnt: number = findPointAtLineAsDistance2(r21, x1, y1, xl, yl, x, y, 0)
	cnt = findPointAtLineAsDistance2(r21, x1, y1, x, y, xr, yr, cnt)
	if (cnt !== 4) {
		throw new Error(`cnt !== 4.`)
	}
	const p1: Vector2 = new Vector2(CACHE[0], CACHE[1])
	const p2: Vector2 = new Vector2(CACHE[2], CACHE[3])
	if (isOn(arc1, p1) && isOn(arc2, p1)) {
		if (isOn(arc1, p2) && isOn(arc2, p2)) {
			return 4
		}
		if (endpointIsOn(arc1.startPoint, arc2, p2, p1)) {
			CACHE[2] = arc1.startPoint.x
			CACHE[3] = arc1.startPoint.y
			return 4
		}
		if (endpointIsOn(arc1.endPoint, arc2, p2, p1)) {
			CACHE[2] = arc1.startPoint.x
			CACHE[3] = arc1.startPoint.y
			return 4
		}
		if (endpointIsOn(arc2.startPoint, arc1, p2, p1)) {
			CACHE[2] = arc2.startPoint.x
			CACHE[3] = arc2.startPoint.y
			return 4
		}
		if (endpointIsOn(arc2.endPoint, arc1, p2, p1)) {
			CACHE[2] = arc2.startPoint.x
			CACHE[3] = arc2.startPoint.y
			return 4
		}
		if (endpointIsOn(arc1.startPoint, arc2, p1, p2)) {
			CACHE[2] = arc1.startPoint.x
			CACHE[3] = arc1.startPoint.y
			return 2
		}
		if (endpointIsOn(arc1.endPoint, arc2, p1, p2)) {
			CACHE[2] = arc1.startPoint.x
			CACHE[3] = arc1.startPoint.y
			return 2
		}
		if (endpointIsOn(arc2.startPoint, arc1, p1, p2)) {
			CACHE[2] = arc2.startPoint.x
			CACHE[3] = arc2.startPoint.y
			return 2
		}
		if (endpointIsOn(arc2.endPoint, arc1, p1, p2)) {
			CACHE[2] = arc2.startPoint.x
			CACHE[3] = arc2.startPoint.y
			return 2
		}
		return 2
	}
	if (isOn(arc1, p2) && isOn(arc2, p2)) {
		if (endpointIsOn(arc1.startPoint, arc2, p1, p2)) {
			CACHE[2] = arc1.startPoint.x
			CACHE[3] = arc1.startPoint.y
			return 4
		}
		if (endpointIsOn(arc1.endPoint, arc2, p1, p2)) {
			CACHE[2] = arc1.startPoint.x
			CACHE[3] = arc1.startPoint.y
			return 4
		}
		if (endpointIsOn(arc2.startPoint, arc1, p1, p2)) {
			CACHE[2] = arc2.startPoint.x
			CACHE[3] = arc2.startPoint.y
			return 4
		}
		if (endpointIsOn(arc2.endPoint, arc1, p1, p2)) {
			CACHE[2] = arc2.startPoint.x
			CACHE[3] = arc2.startPoint.y
			return 4
		}
		if (endpointIsOn(arc1.startPoint, arc2, p2, p1)) {
			CACHE[2] = arc1.startPoint.x
			CACHE[3] = arc1.startPoint.y
			return 2
		}
		if (endpointIsOn(arc1.endPoint, arc2, p2, p1)) {
			CACHE[2] = arc1.startPoint.x
			CACHE[3] = arc1.startPoint.y
			return 2
		}
		if (endpointIsOn(arc2.startPoint, arc1, p2, p1)) {
			CACHE[2] = arc2.startPoint.x
			CACHE[3] = arc2.startPoint.y
			return 2
		}
		if (endpointIsOn(arc2.endPoint, arc1, p2, p1)) {
			CACHE[2] = arc2.startPoint.x
			CACHE[3] = arc2.startPoint.y
			return 2
		}
		CACHE[0] = CACHE[2]
		CACHE[1] = CACHE[3]
		return 2
	}
	let finded1: boolean = false
	let finded2: boolean = false
	let cnt2: number = 0
	const check = (p: Vector2, arc: Arc): void => {
		if (!(DoubleKit.eq(p.distance(arc.centerPoint), arc.rx) && isOn(arc, p))) {
			return
		}
		if (p.distance2(p1) < p.distance2(p2)) {
			if (finded1) {
				return
			}
			finded1 = true
		} else {
			if (finded2) {
				return
			}
			finded2 = true
		}
		CACHE[cnt2++] = p.x
		CACHE[cnt2++] = p.y
	}
	check(arc1.startPoint, arc2)
	check(arc1.endPoint, arc2)
	check(arc2.startPoint, arc1)
	check(arc2.endPoint, arc1)
	return cnt2
}
function endpointIsOn(endPoint: Vector2, arc: Arc, nearPoint: Vector2, farPoint: Vector2): boolean {
	return (
		DoubleKit.eq(endPoint.distance(arc.centerPoint), arc.rx) &&
		isOn(arc, endPoint) &&
		endPoint.distance2(nearPoint) < endPoint.distance2(farPoint)
	)
}
function endpointEquals(endPoint: Vector2, arc: Arc, point: Vector2): boolean {
	return DoubleKit.eq(endPoint.distance(arc.centerPoint), arc.rx) && isOn(arc, endPoint) && endPoint.equalsWithVector2(point)
}
function checkArcResult(arc1: Arc, arc2: Arc, idx: number, cnt: number): number {
	if (cnt > 0) {
		const offset: number = cnt * 2
		arrayCopy(CACHE, 0, CACHE, offset, cnt)
		for (let ii: number = 0; ii < cnt; ii += 2) {
			const x: number = CACHE[offset + ii]
			const y: number = CACHE[offset + ii + 1]
			const p: Vector2 = new Vector2(x, y)
			if (isOn(arc1, p) && isOn(arc2, p)) {
				CACHE[idx++] = x
				CACHE[idx++] = y
			}
		}
	}
	return idx
}
/**
 * 圆弧外切时检测点是否在圆弧上
 */
function checkArcResult1(arc: Arc, cnt: number): number {
	if (cnt === 0) {
		return 0
	}
	const x: number = CACHE[0]
	const y: number = CACHE[1]
	const p: Vector2 = new Vector2(x, y)
	if (isOn(arc, p)) {
		CACHE[0] = x
		CACHE[1] = y
		CACHE[2] = x
		CACHE[3] = y
		return 4
	}
	return 0
}
/**
 * 圆弧内切时检测点是否在圆弧上
 */
function checkArcResult2(arc1: Arc, arc2: Arc, cnt: number): number {
	if (cnt === 0) {
		return 0
	}
	const x: number = CACHE[0]
	const y: number = CACHE[1]
	const p: Vector2 = new Vector2(x, y)
	if (isOn(arc1, p) && isOn(arc2, p)) {
		CACHE[0] = x
		CACHE[1] = y
		CACHE[2] = x
		CACHE[3] = y
		return 4
	}
	return 0
}
function checkArcEndpoints(arc1: Arc, arc2: Arc): boolean {
	if (DoubleKit.eq(arc2.startPoint.distance(arc1.centerPoint), arc1.rx) && isOn(arc1, arc2.startPoint)) {
		CACHE[0] = arc2.startPoint.x
		CACHE[1] = arc2.startPoint.y
		CACHE[2] = arc2.startPoint.x
		CACHE[3] = arc2.startPoint.y
		return true
	}
	if (DoubleKit.eq(arc2.endPoint.distance(arc1.centerPoint), arc1.rx) && isOn(arc1, arc2.endPoint)) {
		CACHE[0] = arc2.endPoint.x
		CACHE[1] = arc2.endPoint.y
		CACHE[2] = arc2.endPoint.x
		CACHE[3] = arc2.endPoint.y
		return true
	}
	if (DoubleKit.eq(arc1.startPoint.distance(arc2.centerPoint), arc2.rx) && isOn(arc2, arc1.startPoint)) {
		CACHE[0] = arc1.startPoint.x
		CACHE[1] = arc1.startPoint.y
		CACHE[2] = arc1.startPoint.x
		CACHE[3] = arc1.startPoint.y
		return true
	}
	if (DoubleKit.eq(arc1.endPoint.distance(arc2.centerPoint), arc2.rx) && isOn(arc2, arc1.startPoint)) {
		CACHE[0] = arc1.endPoint.x
		CACHE[1] = arc1.endPoint.y
		CACHE[2] = arc1.endPoint.x
		CACHE[3] = arc1.endPoint.y
		return true
	}
	return false
}

export function isOn(a: Arc, p: Vector2): boolean {
	const b: BBox2 = a.bbox2
	if (p.x - b.minX > -ARC_EPS && p.x - b.maxX < ARC_EPS && p.y - b.minY > -ARC_EPS && p.y - b.maxY < ARC_EPS) {
		if (Math.abs(a.sweepAngle) >= 180) {
			let angle: number = Angles.regularDegress(p.getRadianByVector2(a.centerPoint))
			if (eq(angle, a.startAngle) || eq(angle, a.startAngle + 360) || eq(angle, a.startAngle - 360)) {
				return true
			}
			if (eq(angle, a.endAngle) || eq(angle, a.endAngle + 360) || eq(angle, a.endAngle - 360)) {
				return true
			}
			if (a.sweepAngle > 0) {
				if (DoubleKit.less(angle, a.startAngle)) {
					angle += 360
				}
				return DoubleKit.greatereq(a.endAngle, angle)
			}
			if (DoubleKit.greater(angle, a.startAngle)) {
				angle -= 360
			}
			return DoubleKit.lesseq(a.endAngle, angle)
		}
		return true
	}
	return false
}

export function isOn2(a: Arc, p: Vector2): boolean {
	if (DoubleKit.eq(a.sweepAngle, 360)) {
		return true
	}
	let angle: number = Angles.regularDegress(p.getRadianByVector2(a.centerPoint))
	if (a.sweepAngle > 0) {
		if (DoubleKit.less(angle, a.sweepAngle)) {
			angle += 360.0
		}
		return DoubleKit.greatereq(a.endAngle, angle)
	}
	if (DoubleKit.greater(angle, a.startAngle)) {
		angle -= 360.0
	}
	return DoubleKit.lesseq(a.endAngle, angle)
}

/**
 * 判断点 P 是否在 Polyline 上
 */
export function isDotInPolyline(point: Vector2, pl: Polyline): number | boolean {
	return pl.primitives.some((item: Primitive): boolean => {
		return pointIsContain(point, item.startPoint, item.endPoint)
	})
}

/**
 * 判断点是否在线段 L 上
 */
export function isDotInLineSegment(point: Vector2, lineStartPoint: Vector2, lineEndPoint: Vector2, place: number = 0.5): boolean {
	let maxX: number = lineStartPoint.x - lineEndPoint.x > 0 ? lineStartPoint.x : lineEndPoint.x
	let maxY: number = lineStartPoint.y - lineEndPoint.y > 0 ? lineStartPoint.y : lineEndPoint.y
	let minX: number = lineStartPoint.x - lineEndPoint.x > 0 ? lineEndPoint.x : lineStartPoint.x
	let minY: number = lineStartPoint.y - lineEndPoint.y > 0 ? lineEndPoint.y : lineStartPoint.y
	let x: number = point.x
	let y: number = point.y
	const flg: boolean = x <= maxX + 1e-3 + place && x >= minX - 1e-3 - place && y <= maxY + 1e-3 && y >= minY - 1e-3 - place
	if (!flg) {
		return false
	}
	return Vector2.crossProd2(point.x, point.y, lineStartPoint.x, lineStartPoint.y, lineEndPoint.x, lineEndPoint.y) < Math.sin(Math.PI / 180)
}

/**
 * 判断多点是否共线
 */
export function isSegmentStraightLine(pl: Polyline): boolean {
	const pointArr: Array<Vector2> = []
	pl.points(1, (p: Vector2): void => {
		pointArr.push(p)
	})
	for (let i: number = 0; i < pl.primitives.length; i++) {
		let pt: Primitive = pl.primitives[i]
		let nextPt: Primitive = pl.primitives[i + 1]
		while (nextPt && isSameSlope([pt.startPoint, pt.endPoint], [nextPt.startPoint, nextPt.endPoint])) {
			i++
			pt = pl.primitives[i]
			nextPt = pl.primitives[i + 1]
		}
		return i == pl.primitives.length - 1
	}
	return false
}

/**
 * 判断两个向量的斜率是否一致
 */
export function isSameSlope(v1: Array<Vector2>, v2: Array<Vector2>): boolean {
	const dx1: number = v1[1].x - v1[0].x
	const dy1: number = v1[1].y - v1[0].y
	const dx2: number = v2[1].x - v2[0].x
	const dy2: number = v2[1].y - v2[0].y
	if ((dx1 === 0 && dx2 !== 0) || (dx1 !== 0 && dx2 === 0)) {
		return false
	}
	if (dx1 === 0 && dx2 === 0) {
		return true
	}
	const slope1: number = dy1 / dx1
	const slope2: number = dy2 / dx2
	return isFloatEqual(slope1, slope2, Math.sin(Math.PI / 180))
}

/**
 * 获取两条线段交点
 */
export function getTwoSegmentsIntersection(A: Vector2, B: Vector2, C: Vector2, D: Vector2): Vector2 | false {
	const equals = (A: Vector2, B: Vector2, place: number): boolean => {
		if (A instanceof Vector2 && B instanceof Vector2) {
			return Math.abs(A.x - B.x) <= place && Math.abs(A.y - B.y) <= place
		}
		return false
	}
	let samePoint: Vector2 = equals(A, C, 0.5) || equals(A, D, 0.5) ? A : equals(B, C, 0.5) || equals(B, D, 0.5) ? B : null!
	if (samePoint) {
		return false
	}
	let dx: number = B.x - A.x
	let dy: number = B.y - A.y
	let da: number = D.x - C.x
	let db: number = D.y - C.y
	let t: number = undefined!
	let s: number = undefined!
	let u: number = undefined!
	let dx13: number = undefined!
	let dy13: number = undefined!
	u = da * dy - db * dx
	if (u === 0) {
		/**
		 * 平行或处于同一条直线上
		 **/
		return false
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
	return false
}

/**
 * 判断 polyline 是否自相交并返回交点
 */
export function selfIntersectionPoints(pl: Polyline): Array<Vector2> {
	let intersPoints: Array<Vector2> = []
	for (let i: number = 0; i < pl.primitives.length; i++) {
		const pt1: Primitive = pl.primitives[i]
		for (let j: number = i + 1; j < pl.primitives.length; j++) {
			const pt2: Primitive = pl.primitives[j]
			const intersPoint: Vector2 = getTwoSegmentsIntersection(
				pt1.startPoint.mul(0.1),
				pt1.endPoint.mul(0.1),
				pt2.startPoint.mul(0.1),
				pt2.endPoint.mul(0.1)
			) as Vector2
			if (intersPoint) {
				intersPoints.push(intersPoint)
			}
		}
	}
	return intersPoints
}

/**
 * 获取两线段是否相交或其延长线是否相交
 */
export function intersectionPoint(A: Vector2, B: Vector2, C: Vector2, D: Vector2): Vector2 {
	let a1: number = B.y - A.y
	let b1: number = A.x - B.x
	let c1: number = a1 * A.x + b1 * A.y
	let a2: number = D.y - C.y
	let b2: number = C.x - D.x
	let c2: number = a2 * C.x + b2 * C.y
	let d: number = a1 * b2 - a2 * b1
	if (d === 0) {
		/**
		 * 线段平行
		 **/
		return null!
	}
	let x: number = (b2 * c1 - b1 * c2) / d
	let y: number = (a1 * c2 - a2 * c1) / d
	return new Vector2(x, y)
}

/**
 * 判断点 P 是否在圆弧 A 上
 */
export function isPointOnArc(arc: Arc, p: Vector2, precise: number = 1e-3): boolean {
	const c: Vector2 = arc.centerPoint
	const s: Vector2 = arc.startPoint
	const rx: number = arc.rx
	const ry: number = arc.ry
	const radP: number = Math.atan2(p.y - c.y, p.x - c.x)
	const radPM: number = Math.atan2(s.y - c.y, s.x - c.x)
	const radPA: number = Math.atan2(ry - c.y, rx - c.x)
	if (Math.abs(radPM - radP) < precise || Math.abs(radPM - radP) > Math.PI * 2 - precise || Math.abs(radPA - radP) < precise) {
		return true
	}
	let bool: boolean = Math.abs(radPM - radPA) > Math.PI === arc.isLarge
	if (Math.abs(Math.abs(radPM - radPA) - Math.PI) < precise) {
		bool = (radPM <= 0 && radPA >= 0) === !(arc.sweepAngle >= 0)
	}
	if (radPM >= radPA && radPM >= radP && radP >= radPA) {
		return bool
	}
	if (radPM <= radPA && radPM <= radP && radP <= radPA) {
		return bool
	}
	return !bool
}
