import { ESweep } from '../../engine/config/CommonProfile'
import { Vector2 } from '../../engine/algorithm/geometry/vector/Vector2'
import { D2CircleToolkit } from './D2CircleToolkit'
import { Arc } from './primitives/Arc'
import { BBox2, BBox2Fac } from '../../engine/algorithm/geometry/bbox/BBox2'
import { DoubleKit } from '../../engine/math/Doublekit'

export class D2ArcToolkit {
	public static fixCircleRadian(point: Vector2, centerPoint: Vector2): number {
		const radian: number = Math.atan2(point.y - centerPoint.y, point.x - centerPoint.x)
		return radian < 0 ? radian + 2 * Math.PI : radian
	}

	/**
	 * 判断点 point 是否位于圆弧 arc 上
	 */
	public static isPointOnArc(arc: Arc, point: Vector2): boolean {
		const arcRadius: number = arc.radius
		/**
		 * 圆弧半径退化
		 */
		if (arcRadius <= DoubleKit.eps2) {
			return false
		}
		const [dx, dy]: [number, number] = [point.x - arc.centerPoint.x, point.y - arc.centerPoint.y]
		const dist2: number = dx * dx + dy * dy
		const r2: number = arcRadius * arcRadius
		/**
		 * 点在圆弧所在的圆的外侧
		 */
		if (Math.abs(dist2 - r2) > DoubleKit.eps2 * Math.max(1, r2)) {
			return false
		}
		/**
		 * 构造向量
		 * 		向量 S, 即圆弧中心点到圆弧起始点的向量
		 * 		向量 E, 即圆弧中心点到圆弧结束点的向量
		 * 		向量 P, 即圆弧中心点到平面上任意点的向量
		 */
		const [sx, sy]: [number, number] = [arc.startPoint.x - arc.centerPoint.x, arc.startPoint.y - arc.centerPoint.y]
		const [ex, ey]: [number, number] = [arc.endPoint.x - arc.centerPoint.x, arc.endPoint.y - arc.centerPoint.y]
		const [px, py]: [number, number] = [point.x - arc.centerPoint.x, point.y - arc.centerPoint.y]
		/**
		 * 向量叉乘
		 * 		判断旋转方向
		 * 		S x P
		 * 			值大于 0, 即向量 P 位于向量 S 的逆时针旋转方位, 也即向量 P 位于向量 S 的左侧
		 * 			值小于 0, 即向量 P 位于向量 S 的顺时针旋转方位, 也即向量 P 位于向量 S 的右侧
		 * 			值等于 0, 即向量 P 与向量 S 共线
		 * 		P x E
		 * 			值大于 0, 即向量 E 位于向量 P 的逆时针旋转方位, 也即向量 E 位于向量 P 的左侧
		 * 			值小于 0, 即向量 E 位于向量 P 的顺时针旋转方位, 也即向量 E 位于向量 P 的右侧
		 * 			值等于 0, 即向量 E 与向量 P 共线
		 * 		S x E
		 * 			值大于 0, 即向量 E 位于向量 S 的逆时针旋转方位, 也即向量 E 位于向量 S 的左侧
		 * 			值小于 0, 即向量 E 位于向量 S 的顺时针旋转方位, 也即向量 E 位于向量 S 的右侧
		 * 			值等于 0, 即向量 E 与向量 S 共线
		 */
		const [crossSP, crossPE, crossSE]: [number, number, number] = [sx * py - sy * px, px * ey - py * ex, sx * ey - sy * ex]
		if (Math.abs(crossSE) <= DoubleKit.eps2) {
			/**
			 * IF:
			 * 		圆弧起点坐标与圆弧终点坐标共线或近似共线
			 * 			场景一: 极小圆弧(近似共线)
			 * 			场景二: 半圆圆弧(共线)
			 **/
			/**
			 * 向量点乘
			 * 		判断夹角
			 * 		S · E
			 * 			值大于 0, 即夹角小于 90 度
			 * 			值小于 0, 即夹角大于 90 度
			 * 			值等于 0, 即夹角等于 90 度
			 */
			const dotSE: number = sx * ex + sy * ey
			if (dotSE > 0) {
				/**
				 * IF:
				 * 		极小圆弧
				 **/
				return sx * px + sy * py > 0
			}
			if (arc.sweep === ESweep.CCW) {
				return crossSP >= -DoubleKit.eps2
			}
			return crossSP <= DoubleKit.eps2
		}
		if (arc.sweep === ESweep.CCW) {
			if (crossSE > 0) {
				/**
				 * IF:
				 * 		小圆弧
				 **/
				return crossSP >= -DoubleKit.eps2 && crossPE >= -DoubleKit.eps2
			}
			return !(crossSP < -DoubleKit.eps2 && crossPE < -DoubleKit.eps2)
		}
		if (crossSE < 0) {
			/**
			 * IF:
			 * 		大圆弧
			 **/
			return crossSP <= DoubleKit.eps2 && crossPE <= DoubleKit.eps2
		}
		return !(crossSP > DoubleKit.eps2 && crossPE > DoubleKit.eps2)
	}

	/**
	 * 判断点 point 是否位于圆弧 arc 上
	 */
	public static isPointOnStrokeArc(point: Vector2, sRadian: number, eRadian: number, sweep: ESweep, radius: number, circleCenter: Vector2, strokeWidth: number, isFill: boolean): boolean {
		const [R, r]: [number, number] = [radius + strokeWidth / 2, radius - strokeWidth / 2]
		const [sng, eng]: [number, number] = [sRadian % (Math.PI * 2), eRadian % (Math.PI * 2)]
		const [sng1, eng1]: [number, number] = [sweep === ESweep.CCW ? sng : eng, sweep === ESweep.CCW ? eng : sng]
		const [startRadian, endRadian]: [number, number] = [sng1, eng1]
		const sweepRadian: number = eng1 > sng1 ? eng1 - sng1 : eng1 - sng1 + Math.PI * 2
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
		const [circleStartLine, circleEndLine]: [Vector2, Vector2] = [new Vector2(radius * Math.cos(startRadian), radius * Math.sin(startRadian)), new Vector2(radius * Math.cos(endRadian), radius * Math.sin(endRadian))]
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
		const circleResultParams = D2CircleToolkit.calculateCircleProfileByByThreePoint(startPoint, endPoint, thirdPoint)
		if (!circleResultParams) {
			return null!
		}
		/**
		 * 计算圆弧角度
		 */
		const [thetaA, thetaB, thetaC]: [number, number, number] = [
			D2ArcToolkit.fixCircleRadian(startPoint, circleResultParams.centerPoint),
			D2ArcToolkit.fixCircleRadian(endPoint, circleResultParams.centerPoint),
			D2ArcToolkit.fixCircleRadian(thirdPoint, circleResultParams.centerPoint),
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
			centerPoint: circleResultParams.centerPoint,
			radius: circleResultParams.radius,
			sweep: circleResultParams.sweep,
			startRadian: startRadian,
			endRadian: endRadian,
		}
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
		const [arcStartPoint, arcEndPoint]: [Vector2, Vector2] = [new Vector2(radius * Math.cos(startRadian), radius * Math.sin(startRadian)), new Vector2(radius * Math.cos(endRadian), radius * Math.sin(endRadian))]
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
		centerPoint: Vector2,
		startPoint: Vector2,
		endPoint: Vector2,
		sweep: ESweep
	): {
		startRadian: number
		endRadian: number
	} {
		if (DoubleKit.neq(centerPoint.distanceSquare(startPoint), centerPoint.distanceSquare(endPoint))) {
			return null!
		}
		const [vA, vB]: [{ x: number; y: number }, { x: number; y: number }] = [
			{ x: startPoint.x - centerPoint.x, y: startPoint.y - centerPoint.y },
			{ x: endPoint.x - centerPoint.x, y: endPoint.y - centerPoint.y },
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
		} else {
			if (end > start) {
				end -= Math.PI * 2
			}
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
		sweepRadian: number,
		startPoint: Vector2,
		endPoint: Vector2
	): {
		centerPoint: Vector2
		radius: number
		startRadian: number
		endRadian: number
		sweep: ESweep
	} {
		const direct: Vector2 = endPoint.sub(startPoint)
		const v: Vector2 = new Vector2(-direct.y, direct.x).normalize()
		const radian2: number = Math.abs(sweepRadian) / 2
		if (radian2 === 0) {
			return null!
		}
		const radius: number = direct.length / 2 / Math.sin(radian2)
		let sweep: ESweep = undefined!
		let centerPoint: Vector2 = undefined!
		if (sweepRadian > 0) {
			sweep = ESweep.CCW
			centerPoint = endPoint.add(v.rotateSurround(Vector2.ORIGIN, radian2).mul(radius))
		} else {
			sweep = ESweep.CW
			centerPoint = startPoint.sub(v.rotateSurround(Vector2.ORIGIN, radian2).mul(radius))
		}
		const [startRadian, endRadion]: [number, number] = [startPoint.getRadianByVector2(centerPoint), endPoint.getRadianByVector2(centerPoint)]
		return { centerPoint, radius, startRadian, endRadian: endRadion < 0 ? endRadion + Math.PI * 2 : endRadion, sweep }
	}

	public static getArcBBox2(centerPoint: Vector2, radius: number, storkeWidth: number, startRadian: number, endRadian: number, sweep: ESweep): BBox2 {
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
		const [startPoint, endPoint]: [Vector2, Vector2] = [
			centerPoint.add(new Vector2(Math.cos(startRadian) * radius, Math.sin(startRadian) * radius)),
			centerPoint.add(new Vector2(Math.cos(endRadian) * radius, Math.sin(endRadian) * radius)),
		]
		bbox2Fac.extendByValue(startPoint.x, startPoint.y).extendByValue(endPoint.x, endPoint.y)
		if (isContain(0)) {
			const p: Vector2 = centerPoint.add(new Vector2(radius, 0))
			bbox2Fac.extendByValue(p.x, p.y)
		}
		if (isContain(Math.PI / 2)) {
			const p: Vector2 = centerPoint.add(new Vector2(0, radius))
			bbox2Fac.extendByValue(p.x, p.y)
		}
		if (isContain(Math.PI)) {
			const p: Vector2 = centerPoint.add(new Vector2(-radius, 0))
			bbox2Fac.extendByValue(p.x, p.y)
		}
		if (isContain(Math.PI * (3 / 2))) {
			const p: Vector2 = centerPoint.add(new Vector2(0, -radius))
			bbox2Fac.extendByValue(p.x, p.y)
		}
		bbox2Fac.extendByOffset(storkeWidth / 2)
		return bbox2Fac.build()
	}
}
