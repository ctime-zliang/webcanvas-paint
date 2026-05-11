import { BBox2 } from '../../engine/algorithm/geometry/bbox/BBox2'
import { CanvasMatrix4 } from '../../engine/algorithm/geometry/matrix/CanvasMatrix4'
import { Matrix4 } from '../../engine/algorithm/geometry/matrix/Matrix4'
import { Vector2 } from '../../engine/algorithm/geometry/vector/Vector2'
import { Vector3 } from '../../engine/algorithm/geometry/vector/Vector3'
import { DoubleKit } from '../../engine/math/Doublekit'
import { Line } from './primitives/Line'
import { Triangle } from './primitives/Triangle'

export class D2LineToolkit {
	public static rotationTranslate(
		newRotation: number,
		oldRotation: number,
		startPoint: Vector2,
		endPoint: Vector2
	): {
		rotation: number
		maxtrix4: Matrix4
	} {
		const rotation: number = newRotation % (Math.PI * 2)
		const effectMatrix: Matrix4 = CanvasMatrix4.setRotationByLine(
			rotation - oldRotation,
			new Vector3((startPoint.x + endPoint.x) / 2, (startPoint.y + endPoint.y) / 2, 0),
			new Vector3((startPoint.x + endPoint.x) / 2, (startPoint.y + endPoint.y) / 2, 1)
		)
		return {
			rotation,
			maxtrix4: effectMatrix,
		}
	}

	public static flipXTranslate(
		startPoint: Vector2,
		endPoint: Vector2
	): {
		maxtrix4: Matrix4
	} {
		const cx: number = (startPoint.x + endPoint.x) * 0.5
		const cy: number = (startPoint.y + endPoint.y) * 0.5
		return {
			maxtrix4: new Matrix4([-1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 2 * cx, 0, 0, 1]),
		}
	}

	public static flipYTranslate(
		startPoint: Vector2,
		endPoint: Vector2
	): {
		maxtrix4: Matrix4
	} {
		const cx: number = (startPoint.x + endPoint.x) * 0.5
		const cy: number = (startPoint.y + endPoint.y) * 0.5
		return {
			maxtrix4: new Matrix4([1, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1, 0, 0, 2 * cy, 0, 1]),
		}
	}

	public static rotation(line: Line, newRotation: number, oldRotation: number): Line {
		const { maxtrix4 } = D2LineToolkit.rotationTranslate(newRotation, oldRotation, line.startPoint, line.endPoint)
		return line.multiplyMatrix3(maxtrix4.toMatrix3())
	}

	public static flipX(line: Line): Line {
		const { maxtrix4 } = D2LineToolkit.flipXTranslate(line.startPoint, line.endPoint)
		return line.multiplyMatrix3(maxtrix4.toMatrix3())
	}

	public static flipY(line: Line): Line {
		const { maxtrix4 } = D2LineToolkit.flipYTranslate(line.startPoint, line.endPoint)
		return line.multiplyMatrix3(maxtrix4.toMatrix3())
	}

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
			 * IF:
			 * 		排除以线段为对角线的矩形之外的点
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
			 * IF:
			 * 		线段 L 的两个端点 A, B 与点 P 共线且 P 处于以该线段为对角线的矩形之内, 则 P 在线段 L 上
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

	/**
	 * 判断线段 line12 与线段 line34 是否相交, 并返回交点
	 *
	 * 求线段 AB 与线段 CD 的交点
	 * 		解参数方程
	 * 			A + t(B − A) = C + s(D − C)
	 * 		则
	 * 			t = ((C − A) * (D − C)​) / ((B - A) * (D - C))
	 * 		则交点 P
	 * 			P = A + t * (B - A)
	 */
	public static isSegmentIntered(line1: Line, line2: Line): Vector2 {
		const eps: number = DoubleKit.eps1
		/**
		 * orient(A, B, C) = (B − A) × (C − A)
		 * 		即 (xB​ − xA​) * (yC ​− yA​) − (yB ​− yA​) * (xC ​− xA​)
		 *
		 * 判断点 c 在向量 AB 的哪一侧
		 * 		> 0, 即在左侧
		 * 		< 0, 即在右侧
		 * 		= 0, 共线
		 *
		 * 本质: 有向三角形 ABC 的面积 x 2
		 */
		const orient = (a: Vector2, b: Vector2, c: Vector2): number => {
			return b.sub(a).cross(c.sub(a))
		}
		const onSegment = (a: Vector2, b: Vector2, p: Vector2): boolean => {
			const bl1: boolean = Math.min(a.x, b.x) - p.x <= eps
			const bl2: boolean = Math.max(a.x, b.x) - p.x >= -eps
			const bl3: boolean = Math.min(a.y, b.y) - p.y <= eps
			const bl4: boolean = Math.max(a.y, b.y) - p.y >= -eps
			return bl1 && bl2 && bl3 && bl4
		}
		/**
		 * 跨立试验
		 * 		线段 AB 与线段 CD 相交在线段内部相交判定条件
		 * 			当且仅当
		 * 				orient(A, B, C) * orient(A, B, D) < 0 且 orient(C, D, A) * orient(C, D, B) < 0
		 *
		 */
		const [d1, d2, d3, d4]: [number, number, number, number] = [
			orient(line1.startPoint, line1.endPoint, line2.startPoint),
			orient(line1.startPoint, line1.endPoint, line2.endPoint),
			orient(line2.startPoint, line2.endPoint, line1.startPoint),
			orient(line2.startPoint, line2.endPoint, line1.endPoint),
		]
		if (((d1 > eps && d2 < -eps) || (d1 < -eps && d2 > eps)) && ((d3 > eps && d4 < -eps) || (d3 < -eps && d4 > eps))) {
			/**
			 * IF:
			 * 		一般相交
			 **/
			const R: Vector2 = line1.endPoint.sub(line1.startPoint)
			const S: Vector2 = line2.endPoint.sub(line2.startPoint)
			const t: number = line2.startPoint.sub(line1.startPoint).cross(S) / R.cross(S)
			return new Vector2(line1.startPoint.x + t * R.x, line1.startPoint.y + t * R.y)
		}
		/**
		 * 共线 & 端点接触
		 */
		if (Math.abs(d1) <= eps && onSegment(line1.startPoint, line1.endPoint, line2.startPoint)) {
			return line2.startPoint.copy()
		}
		if (Math.abs(d2) <= eps && onSegment(line1.startPoint, line1.endPoint, line2.endPoint)) {
			return line2.endPoint.copy()
		}
		if (Math.abs(d3) <= eps && onSegment(line2.startPoint, line2.endPoint, line1.startPoint)) {
			return line1.startPoint.copy()
		}
		if (Math.abs(d4) <= eps && onSegment(line2.startPoint, line2.endPoint, line1.endPoint)) {
			return line1.endPoint.copy()
		}
		return null!
	}

	/**
	 * 计算点 point 到线段 line 的最近点坐标
	 */
	public static getClosedPointOnLineWithPoint(line: Line, point: Vector2): Vector2 {
		/**
		 * 向量叉乘 AB x BP
		 */
		const c1: number = line.endPoint.sub(line.startPoint).cross(point.sub(line.endPoint))
		if (c1 === 0) {
			/**
			 * IF:
			 * 		A B P 三点共线
			 **/
			/**
			 * 向量点积 AB · BP 和 BA · AP
			 */
			const [dp1, dp2]: [number, number] = [
				line.endPoint.sub(line.startPoint).dot(point.sub(line.endPoint)),
				line.startPoint.sub(line.endPoint).dot(point.sub(line.startPoint)),
			]
			if (dp1 < 0 && dp2 < 0) {
				/**
				 * IF:
				 * 		点 P 在线段 AB 中间
				 **/
				return point.copy()
			}
			if (dp1 >= 0) {
				return line.endPoint.copy()
			}
			return line.startPoint.copy()
		}
		const Q: { x: number; y: number } = { x: NaN, y: NaN }
		/**
		 * 定义截取端点 S/E
		 */
		const startCut: { x: number; y: number } = { x: line.startPoint.x, y: line.startPoint.y }
		const endCut: { x: number; y: number } = { x: line.endPoint.x, y: line.endPoint.y }
		/**
		 * 线段起点 A 与点 P 的距离的平方
		 * 线段终点 B 与点 P 的距离的平方
		 * 线段上任意动点 Q 与点 P 的距离的平方
		 */
		let [startDS, endDS, midDS]: [number, number, number] = [
			Vector2.distanceSquare(line.startPoint.x, line.startPoint.y, point.x, point.y),
			Vector2.distanceSquare(line.endPoint.x, line.endPoint.y, point.x, point.y),
			Number.POSITIVE_INFINITY,
		]
		let times: number = 0
		while (midDS > 0) {
			times++
			Q.x = startCut.x + (endCut.x - startCut.x) * 0.5
			Q.y = startCut.y + (endCut.y - startCut.y) * 0.5
			if (startDS === endDS || (startCut.x === Q.x && startCut.y === Q.y) || (endCut.x === Q.x && endCut.y === Q.y)) {
				/**
				 * IF:
				 * 		1. 线段 L 上的截取端点 S/E 与点 Q 的距离相等(即无法再将两个端点拆分)
				 * 		2. 线段 L 上的任意动点 Q 与左右端点中的其中一个重合
				 *
				 * 		即表示此时的点 Q 为线段 L 上最靠近点 P 的点
				 **/
				break
			}
			midDS = Vector2.distanceSquare(Q.x, Q.y, point.x, point.y)
			/**
			 * 向量 SQ 点乘向量 QP
			 */
			const dp: number = new Vector2(Q.x, Q.y)
				.sub(new Vector2(startCut.x, startCut.y))
				.dot(new Vector2(point.x, point.y).sub(new Vector2(Q.x, Q.y)))
			if (dp === 0) {
				break
			}
			if (dp < 0) {
				/**
				 * IF:
				 * 		即表示向量 SQ 与向量 QP 的夹角大于 90 角度, 则点 Q 在靠近结束端点 E 的那一侧
				 * 		也即表示目标点 M 位于起始端点 S 与当前点 Q 的中间那一段的某一位置
				 **/
				endCut.x = Q.x
				endCut.y = Q.y
				endDS = midDS
			} else {
				startCut.x = Q.x
				startCut.y = Q.y
				startDS = midDS
			}
		}
		return new Vector2(Q.x, Q.y)
	}

	/**
	 * 计算点 point 到线段 line 的最近点坐标, 并计算该最近坐标点与点 point 的距离
	 */
	public static getClosedPointOnSegmentWithPoint(line: Line, point: Vector2): { point: Vector2; d: number } {
		/**
		 * 线段 AB 所在的直线 L 的参数方程
		 * 		L(t) = A + t * (B − A)
		 * 即
		 * 		L(t) = { xA + t * (xB - xA), yA + t * (yB - yA) }
		 *
		 * 直线 L 外一点 P 到直线 L 的最短距离所相交的点 Q 满足
		 * 		PQ 垂直 AB
		 * 即
		 * 		(Q - P) · (B - A) = 0
		 *
		 * 数学推导
		 * 		设
		 * 			Q = A + t * (B - A)
		 * 		则
		 * 			Q - P = A + t * (B - A) - P
		 * 		则
		 * 			(A + t * (B - A) - P) · (B - A) = 0
		 * 		展开
		 * 			(A - P) · (B - A) + t * (B - A) · (B - A) = 0
		 * 		即
		 * 			t = ((P - A) · (B - A)) / ((B - A) · (B - A))
		 */
		/**
		 * 定义 t, 即表示投影点 Q 在 AB 上的相对位置
		 * 		0 <= t <= 1, Q 在 AB 之间
		 * 		t < 0, Q 在 A 外侧
		 * 		t > 1, Q 在 B 外侧
		 */
		let t: number = undefined!
		const [dx, dy]: [number, number] = [line.endPoint.x - line.startPoint.x, line.endPoint.y - line.startPoint.y]
		const [dxPA, dyPA]: [number, number] = [point.x - line.startPoint.x, point.y - line.startPoint.y]
		if (dx === 0 && dy === 0) {
			/**
			 * IF:
			 * 		线段 L 退化为点
			 **/
			return {
				d: Math.sqrt(dxPA * dxPA + dyPA * dyPA),
				point: new Vector2(line.startPoint.x, line.startPoint.y),
			}
		}
		t = (dxPA * dx + dyPA * dy) / (dx * dx + dy * dy)
		if (t < 0) {
			return {
				d: Math.sqrt(dxPA * dxPA + dyPA * dyPA),
				point: new Vector2(line.startPoint.x, line.startPoint.y),
			}
		}
		if (t > 1) {
			const [dxPB, dyPB]: [number, number] = [point.x - line.endPoint.x, point.y - line.endPoint.y]
			return {
				d: Math.sqrt(dxPB * dxPB + dyPB * dyPB),
				point: new Vector2(line.endPoint.x, line.endPoint.y),
			}
		}
		const [qx, qy]: [number, number] = [line.startPoint.x + t * dx, line.startPoint.y + t * dy]
		const [dxPQ, dyPQ]: [number, number] = [point.x - qx, point.y - qy]
		return {
			d: Math.sqrt(dxPQ * dxPQ + dyPQ * dyPQ),
			point: new Vector2(qx, qy),
		}
	}

	/**
	 * 求线段 line 上距离点 point 距离值为 distance 的点坐标
	 *
	 * 线段 L 参数方程:
	 * 		P(t) = start + t * (end - start)
	 * 			0 <= t <= 1
	 * 也即:
	 * 		L(t) = { startX + t * (endX - startX), startY + t * (endY - startY) }
	 * 			0 <= t <= 1
	 *
	 * 圆方程:
	 * 		(x - Ox) * (x - Ox) + (y - Oy) * (y - Oy) = r * r
	 *
	 * 将线段参数方程代入圆方程后得到一元二次方程:
	 * 		At² + Bt + C = 0
	 * 		其中:
	 * 			A = (endX - startX) * (endX - startX) + (endY - startY) * (endY - startY)
	 * 			B = 2 * ((endX - startX) * (startX - Ox) + (endY - startY) * (startY - Oy))
	 * 			C = (startX - Ox) * (startX - Ox) + (startY - Oy) * (startY - Oy) - r * r
	 *
	 * 判别式:
	 * 		Δ = B * B - 4 * A * C
	 */
	public static getPointsOnLineWithDistance(d: number, line: Line, point: Vector2, epsilon: number = DoubleKit.eps1): Array<Vector2> {
		const result: Array<Vector2> = []
		if (!Number.isFinite(d) || d < 0) {
			return result
		}
		const [startX, startY, endX, endY]: [number, number, number, number] = [
			line.startPoint.x,
			line.startPoint.y,
			line.endPoint.x,
			line.endPoint.y,
		]
		const [dx, dy]: [number, number] = [endX - startX, endY - startY]
		const appendPoint = (t: number): void => {
			if (t < -epsilon || t > 1 + epsilon) {
				return
			}
			const clamped: number = Math.min(1, Math.max(0, t))
			const [x, y]: [number, number] = [startX + dx * clamped, startY + dy * clamped]
			for (const p of result) {
				if (Math.abs(p.x - x) <= epsilon && Math.abs(p.y - y) <= epsilon) {
					return
				}
			}
			result.push(new Vector2(x, y))
		}
		const A: number = dx * dx + dy * dy
		/**
		 * 线段 L 退化为点
		 */
		if (A <= epsilon) {
			const dist2: number = (startX - point.x) * (startX - point.x) + (startY - point.y) * (startY - point.y)
			if (Math.abs(dist2 - d * d) <= epsilon) {
				result.push(new Vector2(startX, startY))
			}
			return result
		}
		const fx: number = startX - point.x
		const fy: number = startY - point.y
		const B: number = 2 * (dx * fx + dy * fy)
		const C: number = fx * fx + fy * fy - d * d
		const discriminant: number = B * B - 4 * A * C
		if (discriminant < -epsilon) {
			return result
		}
		/**
		 * 直线与圆相切
		 */
		if (Math.abs(discriminant) <= epsilon) {
			/**
			 * IF:
			 * 		直线与圆相切
			 *
			 * 二次方程的解退化为 t = -B / (2 * A)
			 * 		t = 0: 交点为线段 L 的起点
			 * 		t = 1: 交点为线段 L 的终点
			 * 		t 属于 (0, 1): 交点在线段 L 的内部(不含端点)
			 * 		t > 1: 交点在线段 L 靠近终点的延长线上
			 *      t < 0: 交点在线段 L 靠近起点的延长线上
			 **/
			const t: number = -B / (2 * A)
			if (t >= -epsilon && t <= 1 + epsilon) {
				const clamped: number = Math.min(1, Math.max(0, t))
				result.push(new Vector2(startX + dx * clamped, startY + dy * clamped))
			}
			return result
		}
		/**
		 * 直线与圆相交
		 */
		const sqrtDiscriminant: number = Math.sqrt(discriminant)
		appendPoint((-B - sqrtDiscriminant) / (2 * A))
		appendPoint((-B + sqrtDiscriminant) / (2 * A))
		return result
	}

	/**
	 * 获取线段 lineA 与线段 lineB 的重叠区域(返回 BBox2)
	 * 		计算 lineA 所构成的 BBox2 与 lineB 所构成的 BBox2 的重叠区域, 生成新的 BBox2
	 */
	public static getIntersectionByLines(lineA: Line, lineB: Line): BBox2 {
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
}
