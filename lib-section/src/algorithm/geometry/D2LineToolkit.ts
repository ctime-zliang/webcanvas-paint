import { BBox2 } from '../../engine/algorithm/geometry/bbox/BBox2'
import { Vector } from '../../engine/algorithm/geometry/vector/Vector'
import { Vector2 } from '../../engine/algorithm/geometry/vector/Vector2'
import { ESweep } from '../../engine/config/CommonProfile'
import { DoubleKit } from '../../engine/math/Doublekit'
import { isFloatEqual } from '../../engine/utils/Utils'
import { D2PrimitiveToolkit } from './D2PrimitiveToolkit'
import { Arc } from './primitives/Arc'
import { Line } from './primitives/Line'
import { Polyline } from './primitives/Polyline'
import { Primitive } from './primitives/Primitive'
import { Triangle } from './primitives/Triangle'

export class D2LineToolkit {
	/**
	 * 计算点 point 到直线 line 的垂足坐标
	 * 		令
	 * 			t = ((px - xa) * (xb - xa) + (py - ay) * (by - ay)) / ((bx - ax) * (bx - ax) + (by - ay) * (by - ay))
	 * 		则
	 * 			xf = xa + t * (bx - ax)
	 * 			yf = ya + t * (by - ay)
	 * 		当 t < 0 时, F 点在线段 L 的延长线上且靠近 A
	 * 		当 t > 1 时, F 点在线段 L 的延长线上且靠近 B
	 * 		当 0 <= t <= 1 时, F 点在线段 L 上
	 */
	public static calcFootOfPoint2Line(line: Line, point: Vector2): { point: Vector2; t: number } {
		const t: number =
			((point.x - line.startPoint.x) * (line.endPoint.x - line.startPoint.x) +
				(point.y - line.startPoint.y) * (line.endPoint.y - line.startPoint.y)) /
			((line.endPoint.x - line.startPoint.x) * (line.endPoint.x - line.startPoint.x) +
				(line.endPoint.y - line.startPoint.y) * (line.endPoint.y - line.startPoint.y))
		if (line.isPoint()) {
			return { point: line.startPoint, t }
		}
		if (!DoubleKit.eq(line.b, 0) && !DoubleKit.eq(line.a, 0)) {
			/**
			 * 已知直线 L 的一般式为 ax + by + c = 0, 坐标点 P(px, py) 到直线 L 的垂足 F(xf, yf) 坐标为:
			 * 		xf = (b * (b * px - a * py) - a * c) / (b * b + a * a)
			 * 		yf = (a * (-b * px + a * py) - b * c) / (b * b + a * a)
			 */
			const [x, y]: [number, number] = [
				(line.b * line.b * point.x - line.a * line.b * point.y - line.a * line.c) / (line.b * line.b + line.a * line.a),
				(-line.a * line.b * point.x + line.a * line.a * point.y - line.b * line.c) / (line.b * line.b + line.a * line.a),
			]
			return { point: new Vector2(x, y), t }
		}
		if (DoubleKit.eq(line.b, 0) && !DoubleKit.eq(line.a, 0)) {
			return { point: new Vector2(line.startPoint.x, point.y), t }
		}
		if (!DoubleKit.eq(line.b, 0) && DoubleKit.eq(line.a, 0)) {
			return { point: new Vector2(point.x, line.startPoint.y), t }
		}
		return { point, t }
	}

	/**
	 * 判断点 point 是否位于线段 line 上
	 */
	public static isPointOnLine(line: Line, point: Vector2, place: number = DoubleKit.eps1): boolean {
		if (!line.bbox2.extendByDist(1e-8).isContainsPoint(point)) {
			/**
			 * 排除以线段为对角线的矩形之外的点
			 **/
			return false
		}
		if (line.isPoint()) {
			if (point.equalsWithVector2(line.startPoint)) {
				return true
			}
			return false
		}
		if (DoubleKit.eq(Triangle.getArea(line.startPoint, line.endPoint, point), place)) {
			/**
			 * 线段 L 的两个端点 A, B 与点 P 共线且 P 处于以该线段为对角线的矩形之内, 则 P 在线段 L 上
			 **/
			return true
		}
		return false
	}

	/**
	 * 判断点 point 是否位于线段 line 上
	 */
	public static isPointOnLine2(line: Line, point: Vector2, place: number = 0.5): boolean {
		const eps: number = DoubleKit.eps1
		const [maxX, maxY, minX, minY]: [number, number, number, number] = [
			line.startPoint.x - line.endPoint.x > 0 ? line.startPoint.x : line.endPoint.x,
			line.startPoint.y - line.endPoint.y > 0 ? line.startPoint.y : line.endPoint.y,
			line.startPoint.x - line.endPoint.x > 0 ? line.endPoint.x : line.startPoint.x,
			line.startPoint.y - line.endPoint.y > 0 ? line.endPoint.y : line.startPoint.y,
		]
		const flg: boolean =
			point.x <= maxX + eps + place && point.x >= minX - eps - place && point.y <= maxY + eps + place && point.y >= minY - eps - place
		if (!flg) {
			return false
		}
		const crossValue: number = line.startPoint.sub(point).cross(line.endPoint.sub(line.startPoint))
		return crossValue < Math.sin(Math.PI / 180) + place
	}

	/**
	 * 判断点 point 是否位于有宽线段 stroke-line 上
	 */
	public static isPointOnStrokeLine(
		point: Vector2,
		startPoint: Vector2,
		endPoint: Vector2,
		strokeWidth: number,
		isRound: boolean = false,
		rectBorderRadius: number = 0
	): boolean {
		const [startPoint2Point, endPoint2Point, lineDirect]: [Vector2, Vector2, Vector2] = [
			point.sub(startPoint),
			point.sub(endPoint),
			endPoint.sub(startPoint),
		]
		// const lineLength: number = Math.sqrt(lineDirect.x * lineDirect.x + lineDirect.y * lineDirect.y)
		/**
		 * 当前点击位置 point 与线段起点的连线向量(线段起点到当前点击点) startPoint2Point 在线段向量 lineDirect 上的投影向量
		 */
		const cl: Vector2 = new Vector2(
			((startPoint2Point.x * lineDirect.x + startPoint2Point.y * lineDirect.y) * lineDirect.x) /
				(lineDirect.x * lineDirect.x + lineDirect.y * lineDirect.y),
			((startPoint2Point.x * lineDirect.x + startPoint2Point.y * lineDirect.y) * lineDirect.y) /
				(lineDirect.x * lineDirect.x + lineDirect.y * lineDirect.y)
		)
		const norLineDirect: Vector2 = lineDirect.normalize()
		const halfWidthDirect: Vector2 = new Vector2(-norLineDirect.y, norLineDirect.x).scale(strokeWidth / 2)
		const lineCorner: Vector2 = halfWidthDirect.add(lineDirect)
		const [lineCornerLengthSqu, startPoint2PointLengthSqu, endPoint2PointLengthSqu]: [number, number, number] = [
			lineCorner.x * lineCorner.x + lineCorner.y * lineCorner.y,
			startPoint2Point.x * startPoint2Point.x + startPoint2Point.y * startPoint2Point.y,
			endPoint2Point.x * endPoint2Point.x + endPoint2Point.y * endPoint2Point.y,
		]
		if (
			startPoint2Point.sub(cl).length <= strokeWidth / 2 &&
			startPoint2PointLengthSqu <= lineCornerLengthSqu &&
			endPoint2PointLengthSqu <= lineCornerLengthSqu
		) {
			if (rectBorderRadius > 0) {
				const [lineMiddle, lineDirect]: [Vector2, Vector2] = [startPoint.add(endPoint).scale(0.5), endPoint.sub(startPoint)]
				const [norLineDirect, point2LineMiddle]: [Vector2, Vector2] = [lineDirect.normalize(), point.sub(lineMiddle)]
				/**
				 * 参考: \src\engine\webgl\primitives\d2Line\doc\linerect-radius.jpg
				 *
				 * 	x 即为当前点 point 与线段中点 lineMiddle 的连线的"水平"长度
				 * 	y 即为当前点 point 与线段中点 lineMiddle 的连线的"垂直"长度
				 */
				const [x, y]: [number, number] = [Math.abs(norLineDirect.dot(point2LineMiddle)), Math.abs(point2LineMiddle.cross(norLineDirect))]
				/**
				 * 参考: \src\engine\webgl\primitives\d2Line\doc\linerect-radius.jpg
				 *
				 * 	在四分之一线段矩形面上, 排除半径为 rectBorderRadius 的四分之一圆后的最大矩形
				 * 		xEdge 即该矩形的长
				 * 		yEdge 即该矩形的宽
				 */
				const [xEdge, yEdge]: [number, number] = [lineDirect.length * 0.5 - rectBorderRadius, strokeWidth * 0.5 - rectBorderRadius]
				if (x > xEdge && y >= yEdge) {
					const [deltaX, deltaY]: [number, number] = [x - xEdge, y - yEdge]
					const dis: number = new Vector2(deltaX, deltaY).length
					if (dis >= rectBorderRadius) {
						// console.log(`线条本体圆角圆弧外侧`)
						return false
					} else {
						// console.log(`线条本体圆角圆弧`)
						return true
					}
				} else {
					// console.log(`线条本体`)
					return true
				}
			}
			return true
		}
		const r: number = strokeWidth / 2
		if (isRound) {
			if (startPoint2PointLengthSqu <= r * r) {
				// console.log(`线条起点外侧半圆`)
				return true
			}
			if (endPoint2PointLengthSqu <= r * r) {
				// console.log(`线条终点外侧半圆`)
				return true
			}
		}
		return false
	}

	// /**
	//  * 判断点 point 是否位于线段 AB 上
	//  */
	// public static isPointOnSegment(A: Vector2, B: Vector2, point: Vector2, place: number = 0.5): boolean {
	// 	const data: {
	// 		point: Vector2
	// 		d: number
	// 	} = D2LineToolkit.getClosedPointOnSegmentWithPoint(point, A, B)
	// 	if (data.d <= place) {
	// 		point = data.point
	// 	}
	// 	const [start2End, start2Point, end2Point]: [number, number, number] = [A.distance(B), A.distance(point), B.distance(point)]
	// 	const isInLine: boolean = isFloatEqual(start2Point + end2Point, start2End, 1e-3)
	// 	return isInLine
	// }

	public static isSegmentIntered(p1: Vector2, p2: Vector2, p3: Vector2, p4: Vector2): boolean {
		const determinant = (a: number, b: number, c: number, d: number): number => {
			return a * d - b * c
		}
		let V1: number = determinant(p2.x - p1.x, p3.x - p4.x, p2.y - p1.y, p3.y - p4.y)
		if (Math.abs(V1) < 1e-6) {
			return false
		}
		let V2: number = determinant(p3.x - p1.x, p3.x - p4.x, p3.y - p1.y, p3.y - p4.y) / V1
		if (V2 > 1 || V2 < 0) {
			return false
		}
		let V3: number = determinant(p2.x - p1.x, p3.x - p1.x, p2.y - p1.y, p3.y - p1.y) / V1
		if (V3 > 1 || V3 < 0) {
			return false
		}
		return true
	}

	/**
	 * 计算点 point 到线段 line 的最近点坐标
	 */
	public static getClosedPointOnLineWithPoint(line: Line, point: Vector2): Vector2 {
		const [px, py]: [number, number] = [point.x, point.y]
		const [x1, y1, x2, y2]: [number, number, number, number] = [line.startPoint.x, line.startPoint.y, line.endPoint.x, line.endPoint.y]
		const c1: number = line.endPoint.sub(line.startPoint).cross(point.sub(line.endPoint))
		if (c1 === 0) {
			/**
			 * 三点共线
			 **/
			const [dp1, dp2]: [number, number] = [
				line.endPoint.sub(line.startPoint).dot(point.sub(line.endPoint)),
				line.startPoint.sub(line.endPoint).dot(point.sub(line.startPoint)),
			]
			if (dp1 < 0 && dp2 < 0) {
				return new Vector2(px, py)
			}
			if (dp1 >= 0) {
				return new Vector2(x2, y2)
			}
			return new Vector2(x1, y1)
		}
		let [x, y]: [number, number] = [NaN, NaN]
		let [startX, startY]: [number, number] = [x1, y1]
		let [endX, endY]: [number, number] = [x2, y2]
		let [startD, endD, midD]: [number, number, number] = [
			Vector2.distanceSquare(x1, y1, px, py),
			Vector2.distanceSquare(x2, y2, px, py),
			Number.POSITIVE_INFINITY,
		]
		let times: number = 0
		while (midD > 0) {
			times++
			x = startX + (endX - startX) * 0.5
			y = startY + (endY - startY) * 0.5
			if (startD === endD || (startX === x && startY === y) || (endX === x && endY === y)) {
				break
			}
			midD = Vector2.distanceSquare(x, y, px, py)
			const dp: number = new Vector2(x, y).sub(new Vector2(startX, startY)).dot(new Vector2(px, py).sub(new Vector2(x, y)))
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
		return new Vector2(x, y)
	}

	/**
	 * 计算点 point 到线段 AB 的最短距离及端点坐标
	 */
	public static getClosedPointOnSegmentWithPoint(A: Vector2, B: Vector2, point: Vector2): { point: Vector2; d: number } {
		let t: number = undefined!
		const [dx, dy]: [number, number] = [B.x - A.x, B.y - A.y]
		const [dxPA, dyPA]: [number, number] = [point.x - A.x, point.y - A.y]
		if (dx === 0 && dy === 0) {
			return {
				d: Math.sqrt(dxPA * dxPA + dyPA * dyPA),
				point: new Vector2(A.x, A.y),
			}
		}
		t = (dxPA * dx + dyPA * dy) / (dx * dx + dy * dy)
		if (t < 0) {
			return {
				d: Math.sqrt(dxPA * dxPA + dyPA * dyPA),
				point: new Vector2(B.x, B.y),
			}
		}
		if (t > 1) {
			const [dxPB, dyPB]: [number, number] = [point.x - B.x, point.y - B.y]
			return {
				d: Math.sqrt(dxPB * dxPB + dyPB * dyPB),
				point: new Vector2(B.x, B.y),
			}
		}
		const [qx, qy]: [number, number] = [A.x + t * dx, A.y + t * dy]
		const [dxPQ, dyPQ]: [number, number] = [point.x - qx, point.y - qy]
		return {
			d: Math.sqrt(dxPQ * dxPQ + dyPQ * dyPQ),
			point: new Vector2(qx, qy),
		}
	}

	/**
	 * 求线段 line 上距离点 point 距离值为 distance 的点坐标
	 */
	public static getPointsOnLineWithDistance(d: number, line: Line, point: Vector2): Array<Vector2> {
		const [px, py, d2]: [number, number, number] = [point.x, point.y, d * d]
		const [x1, y1, x2, y2]: [number, number, number, number] = [line.startPoint.x, line.startPoint.y, line.endPoint.x, line.endPoint.y]
		const points: Array<Vector2> = []
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
				const [result1, result2]: [number, number] = [px - x, px + x]
				const [minX, maxX]: [number, number] = [Math.min(x1, x2), Math.max(x1, x2)]
				if (result1 >= minX && result1 <= maxX) {
					points.push(new Vector2(result1, y1))
				}
				if (result2 >= minX && result2 <= maxX) {
					points.push(new Vector2(result2, y1))
				}
				return points
			}
		}
		/**
		 * 迭代法求解 逼近交点
		 */
		let [startD, endD]: [number, number] = [Vector2.distanceSquare(x1, y1, px, py) - d2, Vector2.distanceSquare(x2, y2, px, py) - d2]
		let [startX, startY, endX, endY]: [number, number, number, number] = [x1, y1, x2, y2]
		let [x, y, midD]: [number, number, number] = [NaN!, NaN!, Number.POSITIVE_INFINITY]
		while (midD !== 0) {
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
				midD = Vector2.distanceSquare(x, y, px, py) - d2
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
			points.push(new Vector2(x, y))
			return points
		}
		return points
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
	 * 获取线段 lineA 与线段 lineB 的重叠区域(返回 BBox2)
	 */
	public static fastIntersectionDetection(lineA: Line, lineB: Line): BBox2 {
		const inters: BBox2 = lineA.bbox2.getIntersection(lineB.bbox2)
		if (inters === null) {
			return null!
		}
		const c1: number = lineB.endPoint.sub(lineB.startPoint).cross(lineA.startPoint.sub(lineB.endPoint))
		const c2: number = lineB.endPoint.sub(lineB.startPoint).cross(lineA.endPoint.sub(lineB.endPoint))
		if (Math.abs(c1) < 1e-8 || Math.abs(c2) < 1e-8 || c1 * c2 < 0) {
			return inters
		}
		return null!
	}

	/**
	 * 计算向量的垂线向量(单位化)
	 */
	public static calculatePerpendicular(vector2: Vector2): {
		v1: Vector2
		v2: Vector2
	} {
		const [v1, v2]: [Vector2, Vector2] = [new Vector2(-vector2.y, vector2.x), new Vector2(vector2.y, -vector2.x)]
		const length: number = Math.sqrt(vector2.x * vector2.x + vector2.y * vector2.y)
		return {
			v1: new Vector2(v1.x / length, v1.y / length),
			v2: new Vector2(v2.x / length, v2.y / length),
		}
	}

	/**
	 * 已知一段位移向量 moveDiffVector2, 求 moveDiffVector2 位移向量在 lineVector2 向量垂线方向上的投影向量
	 */
	public static calculateVectorProjection(lineVector2: Vector2, moveDiffVector2: Vector2): Vector2 {
		/**
		 * 计算当前线段的垂线向量 B
		 * 计算当前的位移向量 A
		 * 计算向量 A 在向量 B 上的投影 C
		 */
		const perpendicular: { v1: Vector2; v2: Vector2 } = D2LineToolkit.calculatePerpendicular(lineVector2)
		const B: Vector2 = perpendicular.v1
		const A: Vector2 = moveDiffVector2
		const C: Vector2 = new Vector2(
			((A.x * B.x + A.y * B.y) * B.x) / (B.x * B.x + B.y * B.y),
			((A.x * B.x + A.y * B.y) * B.y) / (B.x * B.x + B.y * B.y)
		)
		return C
	}

	/**
	 * 获取从 startPoint 到 endPoint 的线宽为 width 的线段 L 的外轮廓线集合
	 * 		ratio 为线段 L 的端点圆角直径与线段 L 的 min(width, height) 的比值
	 */
	public static getCornerRectOutline(startPoint: Vector2, endPoint: Vector2, width: number, ratio: number, sweep: ESweep = ESweep.CW): Polyline {
		const direct: Vector2 = endPoint.sub(startPoint).normalize()
		const vertical: Vector2 = new Vector2(-direct.y, direct.x)
		const length: number = startPoint.distance(endPoint)
		const radius: number = (Math.min(length, width) / 2) * ratio
		const diameter: number = radius * 2
		const deltaY: number = (width - diameter) / 2
		const v: Vector2 = vertical.mul(deltaY)
		const [radiusDir, radiusVertical]: [Vector2, Vector2] = [direct.mul(radius), vertical.mul(radius)]
		const [startTop, startBottom]: [Vector2, Vector2] = [startPoint.add(v), startPoint.sub(v)]
		const [endTop, endBottom]: [Vector2, Vector2] = [endPoint.add(v), endPoint.sub(v)]
		const [startTopCenter, startBottomCenter]: [Vector2, Vector2] = [startTop.add(radiusDir), startBottom.add(radiusDir)]
		const [endTopCenter, endBottomCenter]: [Vector2, Vector2] = [endTop.sub(radiusDir), endBottom.sub(radiusDir)]
		const [topLeft, topRight]: [Vector2, Vector2] = [startTopCenter.sub(radiusVertical), endTopCenter.add(radiusVertical)]
		const [bottomLeft, bottomRight]: [Vector2, Vector2] = [startBottomCenter.sub(radiusVertical), endBottomCenter.sub(radiusVertical)]
		const pts: Array<Primitive> = []
		if (sweep === ESweep.CCW) {
			const [line1, line2, line3, line4]: [Line, Line, Line, Line] = [
				new Line(startTop, startBottom),
				new Line(bottomLeft, bottomRight),
				new Line(endBottom, endTop),
				new Line(topRight, topLeft),
			]
			if (radius > 0) {
				const [arc1, arc2, arc3, arc4]: [Arc, Arc, Arc, Arc] = [
					Arc.build1(startBottom, bottomLeft, radius, radius, false, ESweep.CCW),
					Arc.build1(bottomRight, endBottom, radius, radius, false, ESweep.CCW),
					Arc.build1(endTop, topRight, radius, radius, false, ESweep.CCW),
					Arc.build1(topLeft, startTop, radius, radius, false, ESweep.CCW),
				]
				const list: Array<Primitive> = [line1, arc1, line2, arc2, line3, arc3, line4, arc4]
				for (let pt of list) {
					if (pt && D2PrimitiveToolkit.getPrimitiveItemLength(pt) > 0) {
						pts.push(pt)
					}
				}
			} else {
				const list: Array<Primitive> = [line1, line2, line3, line4]
				for (let pt of list) {
					if (pt && D2PrimitiveToolkit.getPrimitiveItemLength(pt) > 0) {
						pts.push(pt)
					}
				}
			}
			return Polyline.build2(pts).asClose()
		}
		const [line1, line2, line3, line4]: [Line, Line, Line, Line] = [
			new Line(startBottom, startTop),
			new Line(topLeft, topRight),
			new Line(endTop, endBottom),
			new Line(bottomRight, bottomLeft),
		]
		if (radius > 0) {
			const [arc1, arc2, arc3, arc4]: [Arc, Arc, Arc, Arc] = [
				Arc.build1(startTop, topLeft, radius, radius, false, ESweep.CW),
				Arc.build1(topRight, endTop, radius, radius, false, ESweep.CW),
				Arc.build1(endBottom, bottomRight, radius, radius, false, ESweep.CW),
				Arc.build1(bottomLeft, startBottom, radius, radius, false, ESweep.CW),
			]
			const list: Array<Primitive> = [line1, arc1, line2, arc2, line3, arc3, line4, arc4]
			for (let pt of list) {
				if (pt && D2PrimitiveToolkit.getPrimitiveItemLength(pt) > 0) {
					pts.push(pt)
				}
			}
		} else {
			const list: Array<Primitive> = [line1, line2, line3, line4]
			for (let pt of list) {
				if (pt && D2PrimitiveToolkit.getPrimitiveItemLength(pt) > 0) {
					pts.push(pt)
				}
			}
		}
		return Polyline.build2(pts).asClose()
	}
}
