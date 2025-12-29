import { Vector2 } from '../../engine/algorithm/geometry/vector/Vector2'
import { ESweep } from '../../engine/config/CommonProfile'

export class D2CrossRelationShips {
	/**
	 * 点与直线的重叠关系
	 */
	static pointAndLine(point: Vector2, startPoint: Vector2, endPoint: Vector2, strokeWidth: number): boolean {
		const startPoint2Point: Vector2 = point.sub(startPoint)
		const endPoint2Point: Vector2 = point.sub(endPoint)
		const lineDirect: Vector2 = endPoint.sub(startPoint)
		// const lineLength: number = Math.sqrt(lineDirect.x * lineDirect.x + lineDirect.y * lineDirect.y)
		/**
		 * 当前点击位置与线段起点的连线向量(线段起点到当前点击点)在线段向量上的投影向量
		 */
		const cl: Vector2 = new Vector2(
			((startPoint2Point.x * lineDirect.x + startPoint2Point.y * lineDirect.y) * lineDirect.x) /
				(lineDirect.x * lineDirect.x + lineDirect.y * lineDirect.y),
			((startPoint2Point.x * lineDirect.x + startPoint2Point.y * lineDirect.y) * lineDirect.y) /
				(lineDirect.x * lineDirect.x + lineDirect.y * lineDirect.y)
		)
		const norLineDirect: Vector2 = lineDirect.normalize()
		const halfWidthDirect: Vector2 = new Vector2(-norLineDirect.y, norLineDirect.x).scale(strokeWidth / 2, strokeWidth / 2)
		const lineCorner: Vector2 = halfWidthDirect.add(lineDirect)
		const lineCornerLengthSqu: number = lineCorner.x * lineCorner.x + lineCorner.y * lineCorner.y
		const startPoint2PointLengthSqu: number = startPoint2Point.x * startPoint2Point.x + startPoint2Point.y * startPoint2Point.y
		const endPoint2PointLengthSqu: number = endPoint2Point.x * endPoint2Point.x + endPoint2Point.y * endPoint2Point.y
		if (
			startPoint2Point.sub(cl).length <= strokeWidth / 2 &&
			startPoint2PointLengthSqu <= lineCornerLengthSqu &&
			endPoint2PointLengthSqu <= lineCornerLengthSqu
		) {
			return true
		}
		const r: number = strokeWidth / 2
		if (startPoint2PointLengthSqu <= r * r) {
			return true
		}
		if (endPoint2PointLengthSqu <= r * r) {
			return true
		}
		return false
	}

	/**
	 * 点与圆的重叠关系
	 */
	static pointAndCirlce(point: Vector2, radius: number, circleCenter: Vector2, strokeWidth: number, isFill: boolean): boolean {
		const circleDirLine: Vector2 = point.sub(circleCenter)
		const isOuter: boolean = circleDirLine.length > radius + strokeWidth / 2
		const isInner: boolean = circleDirLine.length < radius - strokeWidth / 2
		if (isOuter) {
			return false
		} else if (isInner) {
			if (!isFill) {
				return false
			}
			return true
		}
		return true
	}

	/**
	 * 点与圆弧的重叠关系
	 */
	static pointAndArc(
		point: Vector2,
		sAngle: number,
		eAngle: number,
		sweep: ESweep,
		radius: number,
		circleCenter: Vector2,
		strokeWidth: number,
		isFill: boolean
	): boolean {
		const R: number = radius + strokeWidth / 2
		const r: number = radius - strokeWidth / 2
		let sng: number = sAngle % (Math.PI * 2)
		let eng: number = eAngle % (Math.PI * 2)
		let sng1: number = sweep === ESweep.CCW ? sng : eng
		let eng1: number = sweep === ESweep.CCW ? eng : sng
		const startAngle: number = sng1
		const endAngle: number = eng1
		const sweepAngle: number = eng1 > sng1 ? eng1 - sng1 : eng1 - sng1 + Math.PI
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
		 * 圆心到 startAngle 对应的圆上的点的向量, 并计算其单位向量
		 * 圆心到 endAngle 对应的圆上的点的向量, 并计算其单位向量
		 */
		const circleStartLine: Vector2 = new Vector2(radius * Math.cos(startAngle), radius * Math.sin(startAngle))
		const circleEndLine: Vector2 = new Vector2(radius * Math.cos(endAngle), radius * Math.sin(endAngle))
		const norCircleStartLine: Vector2 = circleStartLine.normalize()
		const norCircleEndLine: Vector2 = circleEndLine.normalize()
		/**
		 * startAngle 对应的角度在圆上的坐标(相对于坐标原点)
		 * endAngle 对应的角度在圆上的坐标(相对于坐标原点)
		 */
		const startLine: Vector2 = circleCenter.add(circleStartLine)
		const endLine: Vector2 = circleCenter.add(circleEndLine)
		/**
		 * 平面上任意一点到 startAngle 对应的圆上的点的距离
		 * 平面上任意一点到 endAngle 对应的圆上的点的距离
		 */
		const d1: number = point.sub(startLine).length
		const d2: number = point.sub(endLine).length
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
		if ((sweepAngle < Math.PI && SA > 0.0 && EA < 0.0) || (sweepAngle >= Math.PI && (SA > 0.0 || EA < 0.0))) {
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
}
