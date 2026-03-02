import { ESweep } from '../../engine/config/CommonProfile'
import { Vector2 } from '../../engine/algorithm/geometry/vector/Vector2'
import { D2CircleToolkit } from './D2CircleToolkit'
import { Arc } from './primitives/Arc'
import { BBox2, BBox2Fac } from '../../engine/algorithm/geometry/bbox/BBox2'
import { DoubleKit } from '../../engine/math/Doublekit'
import { Angles } from '../../engine/math/Angles'
import { ARC_EPS } from './Constant'
import { Line } from './primitives/Line'
import { isFloatEqual } from '../../engine/utils/Utils'
import { D2Intersection } from './D2Intersection'
import { Matrix4 } from '../../engine/algorithm/geometry/matrix/Matrix4'
import { D2ArcIdentify } from './D2ArcIdentify'

export class D2ArcToolkit {
	public static fixCircleRadian(point: Vector2, centerPoint: Vector2): number {
		const radian: number = Math.atan2(point.y - centerPoint.y, point.x - centerPoint.x)
		return radian < 0 ? radian + 2 * Math.PI : radian
	}

	/**
	 * 判断点 point 是否位于圆弧 arc 上
	 */
	public static isPointOnArc(arc: Arc, point: Vector2): boolean {
		const b: BBox2 = arc.bbox2
		if (point.x - b.minX > -ARC_EPS && point.x - b.maxX < ARC_EPS && point.y - b.minY > -ARC_EPS && point.y - b.maxY < ARC_EPS) {
			if (Math.abs(arc.sweepRadian) >= 180) {
				let radian: number = Angles.regularRadian(point.getRadianByVector2(arc.centerPoint))
				if (
					DoubleKit.eq(radian, arc.startRadian, DoubleKit.eps2) ||
					DoubleKit.eq(radian, arc.startRadian + Math.PI * 2, DoubleKit.eps2) ||
					DoubleKit.eq(radian, arc.startRadian - Math.PI * 2, DoubleKit.eps2)
				) {
					return true
				}
				if (
					DoubleKit.eq(radian, arc.endRadian, DoubleKit.eps2) ||
					DoubleKit.eq(radian, arc.endRadian + Math.PI * 2, DoubleKit.eps2) ||
					DoubleKit.eq(radian, arc.endRadian - Math.PI * 2, DoubleKit.eps2)
				) {
					return true
				}
				if (arc.sweepRadian > 0) {
					if (DoubleKit.less(radian, arc.startRadian)) {
						radian += Math.PI * 2
					}
					return DoubleKit.greatereq(arc.endRadian, radian)
				}
				if (DoubleKit.greater(radian, arc.startRadian)) {
					radian -= Math.PI * 2
				}
				return DoubleKit.lesseq(arc.endRadian, radian)
			}
			return true
		}
		return false
	}

	/**
	 * 判断点 point 是否位于圆弧 arc 上
	 */
	public static isPointOnArc2(arc: Arc, point: Vector2, precise: number = 1e-3): boolean {
		const [c, s]: [Vector2, Vector2] = [arc.centerPoint, arc.startPoint]
		const [rx, ry]: [number, number] = [arc.rx, arc.ry]
		const [radP, radPM, radPA]: [number, number, number] = [
			Math.atan2(point.y - c.y, point.x - c.x),
			Math.atan2(s.y - c.y, s.x - c.x),
			Math.atan2(ry - c.y, rx - c.x),
		]
		if (Math.abs(radPM - radP) < precise || Math.abs(radPM - radP) > Math.PI * 2 - precise || Math.abs(radPA - radP) < precise) {
			return true
		}
		let bool: boolean = Math.abs(radPM - radPA) > Math.PI === arc.isOverHalfCircle
		if (Math.abs(Math.abs(radPM - radPA) - Math.PI) < precise) {
			bool = (radPM <= 0 && radPA >= 0) === !(arc.sweepRadian >= 0)
		}
		if (radPM >= radPA && radPM >= radP && radP >= radPA) {
			return bool
		}
		if (radPM <= radPA && radPM <= radP && radP <= radPA) {
			return bool
		}
		return !bool
	}

	/**
	 * 判断点 point 是否位于圆弧 arc 上
	 */
	public static isPointOnArc3(arc: Arc, point: Vector2): boolean {
		const arcRadius: number = arc.rx
		const [arcLineStart, arcLineEnd, arcCenter]: [Vector2, Vector2, Vector2] = [arc.startPoint, arc.endPoint, arc.centerPoint]
		/**
		 * 圆弧线段中点
		 * 		待修改
		 */
		const arcLineCenter: Vector2 = arc.centerPoint
		const point2Center: number = point.distance(arcCenter)
		const [lineSP, lineEP, linePC]: [Line, Line, Line] = [
			new Line(arcLineStart, arcLineCenter),
			new Line(arcLineEnd, arcLineCenter),
			new Line(point, arcCenter),
		]
		/**
		 * 记圆弧端点 A 到圆弧中点 M 的线段为 LA
		 * 记圆弧端点 B 到圆弧中点 M 的线段为 LB
		 * 判断点 P 到圆弧中心点的线段 LP 是否与 LA 或 LB 相交
		 */
		const inter1: {
			count: number
			points: Array<Vector2>
		} = D2Intersection.getIntersectionsOfLines(lineSP, linePC)
		const inter2: {
			count: number
			points: Array<Vector2>
		} = D2Intersection.getIntersectionsOfLines(lineEP, linePC)
		const psIsInterSmOrm: number = inter1.count || inter2.count
		const isPoint2CenterEqualRadius: boolean = isFloatEqual(point2Center, arcRadius, 1e-3)
		return isPoint2CenterEqualRadius && !!psIsInterSmOrm
	}

	/**
	 * 判断点 point 是否位于圆弧 arc 上
	 */
	public static isPointOnArc4(
		point: Vector2,
		sRadian: number,
		eRadian: number,
		sweep: ESweep,
		radius: number,
		circleCenter: Vector2,
		strokeWidth: number,
		isFill: boolean
	): boolean {
		const [R, r]: [number, number] = [radius + strokeWidth / 2, radius - strokeWidth / 2]
		const [sng, eng]: [number, number] = [sRadian % (Math.PI * 2), eRadian % (Math.PI * 2)]
		const [sng1, eng1]: [number, number] = [sweep === ESweep.CCW ? sng : eng, sweep === ESweep.CCW ? eng : sng]
		const [startRadian, endRadian]: [number, number] = [sng1, eng1]
		const sweepRadian: number = eng1 > sng1 ? eng1 - sng1 : eng1 - sng1 + Math.PI
		/**
		 * 圆心到平面上任意点的向量, 并计算其单位向量
		 */
		const circleDirLine: Vector2 = point.sub(circleCenter)
		const norCircleDirLine: Vector2 = circleDirLine.normalize()
		/**
		 * 圆心到平面上任意点的距离
		 */
		const d: number = circleDirLine.length
		if (d > R) {
			return false
		}
		/**
		 * 圆心到 startRadian 对应的圆上的点的向量, 并计算其单位向量
		 * 圆心到 endRadian 对应的圆上的点的向量, 并计算其单位向量
		 */
		const [circleStartLine, circleEndLine]: [Vector2, Vector2] = [
			new Vector2(radius * Math.cos(startRadian), radius * Math.sin(startRadian)),
			new Vector2(radius * Math.cos(endRadian), radius * Math.sin(endRadian)),
		]
		const [norCircleStartLine, norCircleEndLine]: [Vector2, Vector2] = [circleStartLine.normalize(), circleEndLine.normalize()]
		/**
		 * startRadian 对应的角度在圆上的坐标(相对于坐标原点)
		 * endRadian 对应的角度在圆上的坐标(相对于坐标原点)
		 */
		const [startLine, endLine]: [Vector2, Vector2] = [circleCenter.add(circleStartLine), circleCenter.add(circleEndLine)]
		/**
		 * 平面上任意一点到 startRadian 对应的圆上的点的距离
		 * 平面上任意一点到 endRadian 对应的圆上的点的距离
		 */
		const [d1, d2]: [number, number] = [point.sub(startLine).length, point.sub(endLine).length]
		/**
		 * 向量 norCircleStartLine x norCircleDirLine
		 * 即 norCircleStartLine 与 norCircleDirLine 所构成的平行四边形的有向面积 SA
		 * SA 大于 0, 即 norCircleDirLine 位于 norCircleStartLine 的逆时针旋转方位
		 */
		const SA: number = norCircleStartLine.x * norCircleDirLine.y - norCircleStartLine.y * norCircleDirLine.x
		/**
		 * 向量 norCircleEndLine x norCircleDirLine
		 * 即 norCircleEndLine 与 norCircleDirLine 所构成的平行四边形的有向面积 EA
		 * EA 小于 0, 即 norCircleDirLine 位于 norCircleEndLine 的顺时针旋转方位
		 */
		const EA: number = norCircleEndLine.x * norCircleDirLine.y - norCircleEndLine.y * norCircleDirLine.x
		if ((sweepRadian < Math.PI && SA > 0.0 && EA < 0.0) || (sweepRadian >= Math.PI && (SA > 0.0 || EA < 0.0))) {
			/**
			 * 圆弧主段
			 */
			if (d < r) {
				/**
				 * 圆弧面
				 */
				if (isFill) {
					return true
				}
				return false
			}
			return true
		} else if (d1 < strokeWidth / 2.0 && SA <= 0.0) {
			/**
			 * 起始点圆角
			 */
			if (isFill) {
				return false
			}
			if (d < r) {
				return false
			}
			return true
		} else if (d2 < strokeWidth / 2.0 && EA >= 0.0) {
			/**
			 * 结束点圆角
			 */
			if (isFill) {
				return false
			}
			if (d < r) {
				return false
			}
			return true
		}
		return false
	}

	/**
	 * 已知:
	 * 		起始点坐标 startPoint
	 * 		结束点坐标 endPoint
	 * 		第三点坐标 thirdPoint
	 * 求解:
	 * 		起始弧度 startRadian
	 * 		终止弧度 endRadian
	 * 		半径 radius
	 * 		圆心坐标 centerPoint
	 * 		旋转方向 sweep
	 */
	public static calculateD2ArcProfileByThreePoint(
		startPoint: Vector2,
		endPoint: Vector2,
		thirdPoint: Vector2
	): {
		startRadian: number
		endRadian: number
		radius: number
		centerPoint: Vector2
		sweep: ESweep
	} {
		if (startPoint.equalsWithPoint(thirdPoint) || endPoint.equalsWithPoint(thirdPoint)) {
			const centerPoint: Vector2 = startPoint.add(thirdPoint).mul(0.5)
			return {
				centerPoint,
				radius: thirdPoint.distance(startPoint) / 2,
				startRadian: startPoint.getRadianByVector2(centerPoint),
				endRadian: endPoint.getRadianByVector2(centerPoint),
				sweep: ESweep.CCW,
			}
		}
		/**
		 * 计算圆参数
		 */
		const { centerPoint, radius, sweep } = D2CircleToolkit.calculateCircleProfileByByThreePoint(startPoint, endPoint, thirdPoint)
		/**
		 * 计算圆弧角度
		 */
		const [thetaA, thetaB, thetaC]: [number, number, number] = [
			D2ArcToolkit.fixCircleRadian(startPoint, centerPoint),
			D2ArcToolkit.fixCircleRadian(endPoint, centerPoint),
			D2ArcToolkit.fixCircleRadian(thirdPoint, centerPoint),
		]
		let [startRadian, endRadian]: [number, number] = [0, 0]
		if (thetaC < Math.min(thetaA, thetaB) || thetaC > Math.max(thetaA, thetaB)) {
			/**
			 * 若第三个点不在起始角度和结束角度之间, 调整角度范围
			 */
			if (thetaA < thetaB) {
				startRadian = thetaA
				endRadian = thetaB - 2 * Math.PI
			} else {
				startRadian = thetaA - 2 * Math.PI
				endRadian = thetaB
			}
		} else {
			startRadian = thetaA
			endRadian = thetaB
		}
		return {
			centerPoint: centerPoint,
			radius: radius,
			sweep: sweep,
			startRadian: startRadian,
			endRadian: endRadian,
		}
	}

	/**
	 * 已知:
	 * 		起始点坐标 startPoint
	 * 		结束点坐标 endPoint
	 * 		第三点坐标 thirdPoint
	 * 求解:
	 * 		起始弧度 startRadian
	 * 		终止弧度 endRadian
	 * 		半径 radius
	 * 		圆心坐标 centerPoint
	 * 		旋转方向 sweep
	 */
	public static calculateD2ArcProfileByThreePoint2(
		startPoint: Vector2,
		endPoint: Vector2,
		thirdPoint: Vector2
	): {
		startRadian: number
		endRadian: number
		radius: number
		centerPoint: Vector2
		sweep: ESweep
	} {
		if (startPoint.equalsWithVector2(endPoint)) {
			if (thirdPoint.equalsWithVector2(startPoint)) {
				const centerPoint: Vector2 = startPoint.add(new Vector2(0.001, 0))
				const radius: number = 0.001
				const [startRadian, endRadian]: [number, number] = [
					startPoint.getRadianByVector2(centerPoint),
					endPoint.getRadianByVector2(centerPoint),
				]
				const sweep: ESweep = ESweep.CCW
				return { centerPoint, radius, startRadian, endRadian, sweep }
			}
			const centerPoint: Vector2 = startPoint.add(thirdPoint).mul(0.5)
			const radius: number = thirdPoint.distance(startPoint) / 2
			const [startRadian, endRadian]: [number, number] = [startPoint.getRadianByVector2(centerPoint), endPoint.getRadianByVector2(centerPoint)]
			const sweep: ESweep = ESweep.CCW
			return { centerPoint, radius, startRadian, endRadian, sweep }
		}
		const [direct1, direct2]: [Vector2, Vector2] = [endPoint.sub(thirdPoint).normalize(), thirdPoint.sub(startPoint).normalize()]
		if (direct1.cross(direct2) === 0) {
			thirdPoint.add(new Vector2(-direct1.y, direct1.x)).mul(0.01)
		}
		const [A1, B1, C1]: [number, number, number] = [
			2 * (endPoint.x - startPoint.x),
			2 * (endPoint.y - startPoint.y),
			endPoint.x * endPoint.x + endPoint.y * endPoint.y - (startPoint.x * startPoint.x + startPoint.y * startPoint.y),
		]
		const [A2, B2, C2]: [number, number, number] = [
			2 * (thirdPoint.x - endPoint.x),
			2 * (thirdPoint.y - endPoint.y),
			thirdPoint.x * thirdPoint.x + thirdPoint.y * thirdPoint.y - (endPoint.x * endPoint.x + endPoint.y * endPoint.y),
		]
		const centerPoint: Vector2 = new Vector2((C1 * B2 - C2 * B1) / (A1 * B2 - A2 * B1), (A1 * C2 - A2 * C1) / (A1 * B2 - A2 * B1))
		const radius: number = centerPoint.distance(startPoint)
		const [startRadian, endRadian]: [number, number] = [startPoint.getRadianByVector2(centerPoint), endPoint.getRadianByVector2(centerPoint)]
		const crossV: number = direct2.cross(direct1)
		const sweep: ESweep = crossV > 0 ? ESweep.CCW : ESweep.CW
		return { centerPoint, radius, startRadian, endRadian, sweep }
	}

	/**
	 * 已知:
	 * 		半径 radius
	 * 		起始弧度 startRadian
	 * 		终止弧度 endRadian
	 * 求解:
	 * 		起始点坐标 startPoint
	 * 		结束点坐标 endPoint
	 * 		弧线中点坐标 middlePoint
	 */
	public static calculateThreePointByArcProfile(
		radius: number,
		startRadian: number,
		endRadian: number
	): {
		startPoint: Vector2
		endPoint: Vector2
		middlePoint: Vector2
	} {
		const [arcStartPoint, arcEndPoint]: [Vector2, Vector2] = [
			new Vector2(radius * Math.cos(startRadian), radius * Math.sin(startRadian)),
			new Vector2(radius * Math.cos(endRadian), radius * Math.sin(endRadian)),
		]
		const addPoint: Vector2 = arcStartPoint.add(arcEndPoint)
		const dir: number = Math.abs(endRadian - startRadian) > Math.PI ? -1 : 1
		return {
			startPoint: arcStartPoint,
			endPoint: arcEndPoint,
			middlePoint: addPoint.normalize().mul(dir * radius, dir * radius),
		}
	}

	/**
	 * 已知:
	 * 		起始点坐标 startPoint
	 * 		结束点坐标 endPoint
	 * 		圆心坐标 centerPoint
	 * 		旋转方向 sweep
	 * 求解:
	 * 		起始弧度 startRadian
	 * 		终止弧度 endRadian
	 */
	public static calculateRadianProfileByPoint(
		O: Vector2,
		A: Vector2,
		B: Vector2,
		sweep: ESweep
	): {
		startRadian: number
		endRadian: number
	} {
		const [vA, vB]: [{ x: number; y: number }, { x: number; y: number }] = [
			{ x: A.x - O.x, y: A.y - O.y },
			{ x: B.x - O.x, y: B.y - O.y },
		]
		let [start, end]: [number, number] = [Math.atan2(vA.y, vA.x), Math.atan2(vB.y, vB.x)]
		if (start < 0) {
			start += Math.PI * 2
		}
		if (end < 0) {
			end += Math.PI * 2
		}
		if (sweep === ESweep.CCW) {
			if (end < start) {
				end += Math.PI * 2
			}
		} else if (sweep === ESweep.CW) {
			if (end > start) {
				end -= Math.PI * 2
			}
		} else {
			throw new Error('dir must be "ccw" or "cw"')
		}
		return {
			startRadian: start,
			endRadian: end,
		}
	}

	/**
	 * 已知:
	 * 		起始点坐标 startPoint
	 * 		结束点坐标 endPoint
	 * 		旋转弧度 radian
	 * 求解:
	 * 		起始弧度 startRadian
	 * 		终止弧度 endRadian
	 * 		半径 radius
	 * 		圆心坐标 centerPoint
	 * 		旋转方向 sweep
	 */
	public static calculateD2ArcProfileTwoPointsAndRadian(
		startPoint: Vector2,
		endPoint: Vector2,
		radian: number
	): {
		centerPoint: Vector2
		radius: number
		startRadian: number
		endRadian: number
		sweep: ESweep
	} {
		const direct: Vector2 = endPoint.sub(startPoint)
		const v: Vector2 = new Vector2(-direct.y, direct.x).normalize()
		const radian2: number = Math.abs(radian) / 2
		let radius: number = 0
		if (radian2 !== 0) {
			radius = direct.length / 2 / Math.sin(radian2)
		} else {
			throw new Error(`can not represent circle.`)
		}
		let sweep: ESweep = undefined!
		let centerPoint: Vector2 = undefined!
		if (radian > 0) {
			sweep = ESweep.CCW
			centerPoint = endPoint.add(v.rotateSurround(Vector2.ORIGIN, radian2).mul(radius))
		} else {
			sweep = ESweep.CW
			centerPoint = startPoint.sub(v.rotateSurround(Vector2.ORIGIN, radian2).mul(radius))
		}
		const [startRadian, endRadian]: [number, number] = [startPoint.getRadianByVector2(centerPoint), endPoint.getRadianByVector2(centerPoint)]
		return { centerPoint, radius, startRadian, endRadian, sweep }
	}

	public static getMiddleInArc(pt: Arc): Vector2 {
		const sweepRadian: number = Math.abs(pt.sweepRadian % 360)
		const [v1, v2]: [Vector2, Vector2] = [pt.startPoint.sub(pt.centerPoint), pt.endPoint.sub(pt.centerPoint)]
		let centerDirect: Vector2 = v1.add(v2).normalize()
		if (sweepRadian > 180) {
			centerDirect = centerDirect.mul(-1)
		}
		const middle: Vector2 = pt.centerPoint.add(centerDirect.mul(pt.rx))
		return middle
	}

	public static getArcLength(radius: number, sweepRadian: number): number {
		return Math.abs((radius * sweepRadian * Math.PI) / Math.PI)
	}

	public static arcApplyTranslateMatrix4(
		matrix4: Matrix4,
		oldStartRadian: number,
		oldEndRadian: number,
		oldSweepRadian: number,
		oldRadius: number,
		oldCenter: Vector2
	): {
		center: Vector2
		startRadian: number
		endRadian: number
		sweep: ESweep
	} {
		const result: {
			center: Vector2
			startRadian: number
			endRadian: number
			sweep: ESweep
		} = {
			center: undefined!,
			startRadian: undefined!,
			endRadian: undefined!,
			sweep: undefined!,
		}
		const [newStartPoint, newEndPoint]: [Vector2, Vector2] = [
			oldCenter.add(new Vector2(Math.cos(oldStartRadian) * oldRadius, Math.sin(oldStartRadian) * oldRadius)),
			oldCenter.add(new Vector2(Math.cos(oldEndRadian) * oldRadius, Math.sin(oldEndRadian) * oldRadius)),
		]
		const radian: number = oldSweepRadian
		const midRadian: number = oldStartRadian + radian / 2
		const mid: Vector2 = oldCenter.add(new Vector2(Math.cos(midRadian) * oldRadius, Math.sin(midRadian) * oldRadius))
		const [c, s, e, m]: [Vector2, Vector2, Vector2, Vector2] = [
			oldCenter.multiplyMatrix4(matrix4),
			newStartPoint.multiplyMatrix4(matrix4),
			newEndPoint.multiplyMatrix4(matrix4),
			mid.multiplyMatrix4(matrix4),
		]
		const [newStartDir, newEndDir]: [Vector2, Vector2] = [s.sub(c), e.sub(c)]
		let [sRadian, eRadian]: [number, number] = [Math.atan2(newStartDir.y, newStartDir.x), Math.atan2(newEndDir.y, newEndDir.x)]
		if (sRadian < 0) {
			sRadian += Math.PI * 2
		}
		if (eRadian < 0) {
			eRadian += Math.PI * 2
		}
		result.center = c
		result.startRadian = sRadian
		result.endRadian = eRadian
		const [d1, d2]: [Vector2, Vector2] = [m.sub(s), e.sub(m)]
		if (d1.cross(d2) >= 0) {
			result.sweep = ESweep.CCW
		} else {
			result.sweep = ESweep.CW
		}
		return result
	}

	public static getArcBBox2(center: Vector2, radius: number, storkeWidth: number, startRadian: number, endRadian: number, sweep: ESweep): BBox2 {
		if (storkeWidth < 0) {
			return null!
		}
		const isContain = (radian: number): boolean => {
			if (startRadian === endRadian) {
				return true
			}
			if (sweep === ESweep.CCW) {
				if (startRadian > endRadian) {
					if (radian >= startRadian && radian <= Math.PI * 2) {
						return true
					}
					if (radian >= 0 && radian <= endRadian) {
						return true
					}
					return false
				}
				if (radian >= startRadian && radian <= endRadian) {
					return true
				}
				return false
			}
			if (startRadian > endRadian) {
				if (radian >= endRadian && radian <= startRadian) {
					return true
				}
				return false
			}
			if (radian >= endRadian && radian <= Math.PI * 2) {
				return true
			}
			if (radian >= 0 && radian <= startRadian) {
				return true
			}
			return false
		}
		if (radius <= 0) {
			return null!
		}
		const bbox2Fac: BBox2Fac = new BBox2Fac()
		const [start, end]: [Vector2, Vector2] = [
			center.add(new Vector2(Math.cos(startRadian) * radius, Math.sin(startRadian) * radius)),
			center.add(new Vector2(Math.cos(endRadian) * radius, Math.sin(endRadian) * radius)),
		]
		bbox2Fac.extendByValue(start.x, start.y).extendByValue(end.x, end.y)
		if (isContain(0)) {
			const p: Vector2 = center.add(new Vector2(radius, 0))
			bbox2Fac.extendByValue(p.x, p.y)
		}
		if (isContain(Math.PI / 2)) {
			const p: Vector2 = center.add(new Vector2(0, radius))
			bbox2Fac.extendByValue(p.x, p.y)
		}
		if (isContain(Math.PI)) {
			const p: Vector2 = center.add(new Vector2(-radius, 0))
			bbox2Fac.extendByValue(p.x, p.y)
		}
		if (isContain(Math.PI * (3 / 2))) {
			const p: Vector2 = center.add(new Vector2(0, -radius))
			bbox2Fac.extendByValue(p.x, p.y)
		}
		bbox2Fac.extendByOffset(storkeWidth / 2)
		return bbox2Fac.build()
	}

	public static getArcMiddlePoint(center: Vector2, radius: number, startRadian: number, endRadian: number, sweep: ESweep = ESweep.CCW): Vector2 {
		if (sweep === ESweep.CCW) {
			if (endRadian > startRadian) {
				const radian: number = (endRadian - startRadian) / 2 + startRadian
				const midPoint: Vector2 = center.add(new Vector2(Math.cos(radian), Math.sin(radian)).mul(radius))
				return midPoint
			}
			if (endRadian === startRadian) {
				const midPoint: Vector2 = center.add(new Vector2(Math.cos((Math.PI * 3) / 2), Math.sin((Math.PI * 3) / 2)).mul(radius))
				return midPoint
			}
			const radian: number = (endRadian + Math.PI * 2 - startRadian) / 2 + startRadian
			const midPoint: Vector2 = center.add(new Vector2(Math.cos(radian), Math.sin(radian)).mul(radius))
			return midPoint
		}
		if (endRadian > startRadian) {
			const radian: number = (startRadian = Math.PI * 2 - endRadian) / 2 + endRadian
			const midPoint: Vector2 = center.add(new Vector2(Math.cos(radian), Math.sin(radian)).mul(radius))
			return midPoint
		}
		if (endRadian === startRadian) {
			const midPoint: Vector2 = center.add(new Vector2(Math.cos((Math.PI * 3) / 2), Math.sin((Math.PI * 3) / 2)).mul(radius))
			return midPoint
		}
		const radian: number = (startRadian - endRadian) / 2 + endRadian
		const midPoint: Vector2 = center.add(new Vector2(Math.cos(radian), Math.sin(radian)).mul(radius))
		return midPoint
	}

	public static updateArcParamByNewStartPoint(
		newStartPoint: Vector2,
		oldStartPoint: Vector2,
		oldEndPoint: Vector2,
		oldMidPoint: Vector2,
		oldCenterPoint: Vector2,
		oldSweep: ESweep,
		oldRadius: number
	): {
		center: Vector2
		startRadian: number
		endRadian: number
		radius: number
	} {
		const result: {
			center: Vector2
			startRadian: number
			endRadian: number
			radius: number
		} = {
			center: null!,
			startRadian: undefined!,
			endRadian: undefined!,
			radius: undefined!,
		}
		const newStartPoint2: Vector2 = new D2ArcIdentify().fixStartPoint(newStartPoint, oldEndPoint, oldCenterPoint, oldRadius, oldSweep)
		let length2: number = oldEndPoint.distanceSquare(newStartPoint2)
		let distance: number = Math.sqrt(oldMidPoint.distanceSquare(oldStartPoint) - oldEndPoint.distanceSquare(oldStartPoint) / 4)
		if (distance < 0.1 || Number.isNaN(distance)) {
			distance = 0.1
		}
		let radius: number = distance / 2 + length2 / distance / 8
		if (radius === 0) {
			radius = 1e-8
		}
		result.radius = radius
		const [direct, mid]: [Vector2, Vector2] = [oldEndPoint.sub(newStartPoint2), newStartPoint2.add(oldEndPoint).mul(0.5)]
		let l: Vector2 = null!
		if (oldSweep === ESweep.CCW) {
			l = new Vector2(-direct.y, direct.x).normalize()
		} else {
			l = new Vector2(direct.y, -direct.x).normalize()
		}
		let center: Vector2 = mid.add(l.mul(radius - distance))
		result.center = center
		const [OS, OE]: [Vector2, Vector2] = [newStartPoint2.sub(center).normalize(), oldEndPoint.sub(center).normalize()]
		result.startRadian = Math.atan2(OS.y, OS.x)
		result.endRadian = Math.atan2(OE.y, OE.x)
		return result
	}

	public static updateArcParamByNewEndPoint(
		newEndPoint: Vector2,
		oldStartPoint: Vector2,
		oldEndPoint: Vector2,
		oldMidPoint: Vector2,
		oldSweep: ESweep
	): {
		center: Vector2
		startRadian: number
		endRadian: number
		radius: number
	} {
		const result: {
			center: Vector2
			startRadian: number
			endRadian: number
			radius: number
		} = {
			center: null!,
			startRadian: undefined!,
			endRadian: undefined!,
			radius: undefined!,
		}
		let length2: number = newEndPoint.distanceSquare(oldStartPoint)
		let distance: number = Math.sqrt(oldMidPoint.distanceSquare(oldStartPoint) - oldEndPoint.distanceSquare(oldStartPoint) / 4)
		if (distance < 0.1 || Number.isNaN(distance)) {
			distance = 0.1
		}
		let radius: number = distance / 2 + length2 / distance / 8
		if (radius === 0) {
			radius = 1e-8
		}
		result.radius = radius
		let direct: Vector2 = newEndPoint.sub(oldStartPoint)
		let mid: Vector2 = oldStartPoint.add(newEndPoint).mul(0.5)
		let l: Vector2 = null!
		if (oldSweep === ESweep.CCW) {
			l = new Vector2(-direct.y, direct.x).normalize()
		} else {
			l = new Vector2(direct.y, -direct.x)
		}
		let center: Vector2 = mid.add(l.mul(radius - distance))
		result.center = center
		const [OS, OE]: [Vector2, Vector2] = [oldStartPoint.sub(center).normalize(), newEndPoint.sub(center).normalize()]
		result.startRadian = Math.atan2(OS.y, OS.x)
		result.endRadian = Math.atan2(OE.y, OE.x)
		return result
	}

	/**
	 * 已知圆弧起始坐标/结束坐标/起始点切线方向(视作与圆弧旋转方向一致), 求圆弧参数
	 */
	public static tangentPositionDirect2Arc(
		startPoint: Vector2,
		startPointDirect: Vector2,
		endPoint: Vector2,
		fixStart: boolean = true
	): {
		centerPoint: Vector2
		radius: number
		startRadian: number
		endRadian: number
		sweep: ESweep
	} {
		if (startPoint.equalsWithVector2(endPoint)) {
			const v: Vector2 = new Vector2(startPointDirect.y, -startPointDirect.x).normalize()
			const centerPoint: Vector2 = startPoint.add(v)
			const startRadian: number = startPoint.getRadianByVector2(centerPoint)
			const endRadian: number = startRadian + Math.PI * 2
			if (fixStart) {
				return {
					centerPoint,
					radius: 1,
					startRadian,
					endRadian,
					sweep: ESweep.CW,
				}
			}
			return {
				centerPoint,
				radius: 1,
				startRadian: endRadian,
				endRadian: startRadian,
				sweep: ESweep.CW,
			}
		}
		const start2end: Vector2 = endPoint.sub(startPoint)
		const cross: number = startPointDirect.cross(start2end)
		let sweep: ESweep = undefined!
		let [v1, v2]: [Vector2, Vector2] = [undefined!, undefined!]
		if (cross > 0) {
			sweep = ESweep.CCW
			v1 = new Vector2(-startPointDirect.y, startPointDirect.x).normalize()
			v2 = new Vector2(-start2end.y, start2end.x).normalize()
		} else {
			sweep = ESweep.CW
			v1 = new Vector2(startPointDirect.y, -startPointDirect.x).normalize()
			v2 = new Vector2(start2end.y, -startPointDirect.x).normalize()
		}
		const line1: Line = new Line(startPoint, startPoint.add(v1.mul(100000)))
		const center1: Vector2 = startPoint.add(endPoint).mul(0.5)
		const line2: Line = new Line(center1.sub(v2.mul(100000)), center1.add(v2.mul(100000)))
		const interRes: {
			count: number
			points: Array<Vector2>
		} = D2Intersection.getIntersectionsOfPrimitives(line1, line2)
		if (interRes.count > 0) {
			const centerPoint: Vector2 = interRes.points[0]
			const [radius, startRadian, endRadian]: [number, number, number] = [
				centerPoint.distance(startPoint),
				startPoint.getRadianByVector2(centerPoint),
				endPoint.getRadianByVector2(centerPoint),
			]
			return {
				centerPoint,
				radius,
				startRadian,
				endRadian,
				sweep,
			}
		}
		const centerPoint: Vector2 = startPoint.add(v1.mul(100000))
		const [radius, startRadian, endRadian]: [number, number, number] = [
			centerPoint.distance(startPoint),
			startPoint.getRadianByVector2(centerPoint),
			endPoint.getRadianByVector2(centerPoint),
		]
		return {
			centerPoint,
			radius,
			startRadian,
			endRadian,
			sweep,
		}
	}
}
