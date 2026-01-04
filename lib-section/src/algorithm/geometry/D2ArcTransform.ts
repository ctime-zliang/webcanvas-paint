import { ESweep } from '../../engine/config/CommonProfile'
import { Vector2 } from '../../engine/algorithm/geometry/vector/Vector2'
import { D2CircleTransform } from './D2CircleTransform'

export class D2ArcTransform {
	static fixCircleAngle(point: Vector2, centerPoint: Vector2): number {
		const angle: number = Math.atan2(point.y - centerPoint.y, point.x - centerPoint.x)
		return angle < 0 ? angle + 2 * Math.PI : angle
	}

	/**
	 * 非共线三点计算圆弧参数
	 */
	static calculateD2ArcProfileByThreePoint(
		startPoint: Vector2,
		endPoint: Vector2,
		thirdPoint: Vector2
	): {
		startAngle: number
		endAngle: number
		radius: number
		centerPoint: Vector2
		sweep: ESweep
	} {
		if (startPoint.equalsWithPoint(thirdPoint) || endPoint.equalsWithPoint(thirdPoint)) {
			const centerPoint: Vector2 = startPoint.add(thirdPoint).mul(0.5)
			return {
				centerPoint,
				radius: thirdPoint.distance(startPoint) / 2,
				startAngle: startPoint.getRadianByVector2(centerPoint),
				endAngle: endPoint.getRadianByVector2(centerPoint),
				sweep: ESweep.CCW,
			}
		}
		/**
		 * 计算圆参数
		 */
		const { centerPoint, radius, sweep } = D2CircleTransform.calculateCircleProfileByByThreePoint(startPoint, endPoint, thirdPoint)
		/**
		 * 计算圆弧角度
		 */
		const thetaA: number = D2ArcTransform.fixCircleAngle(startPoint, centerPoint)
		const thetaB: number = D2ArcTransform.fixCircleAngle(endPoint, centerPoint)
		const thetaC: number = D2ArcTransform.fixCircleAngle(thirdPoint, centerPoint)
		let startAngle: number = 0
		let endAngle: number = 0
		if (thetaC < Math.min(thetaA, thetaB) || thetaC > Math.max(thetaA, thetaB)) {
			/**
			 * 若第三个点不在起始角度和结束角度之间, 调整角度范围
			 */
			if (thetaA < thetaB) {
				startAngle = thetaA
				endAngle = thetaB - 2 * Math.PI
			} else {
				startAngle = thetaA - 2 * Math.PI
				endAngle = thetaB
			}
		} else {
			startAngle = thetaA
			endAngle = thetaB
		}
		return {
			centerPoint: centerPoint,
			radius: radius,
			sweep: sweep,
			/* ... */
			startAngle: startAngle,
			endAngle: endAngle,
		}
	}

	/**
	 * 由圆弧参数计算起点坐标/末点坐标/中点坐标
	 */
	static calculateThreePointByArcProfile(
		radius: number,
		startAngle: number,
		endAngle: number
	): {
		startPoint: Vector2
		endPoint: Vector2
		middlePoint: Vector2
	} {
		const arcStartPoint: Vector2 = new Vector2(radius * Math.cos(startAngle), radius * Math.sin(startAngle))
		const arcEndPoint: Vector2 = new Vector2(radius * Math.cos(endAngle), radius * Math.sin(endAngle))
		const addPoint: Vector2 = arcStartPoint.add(arcEndPoint)
		const dir: number = Math.abs(endAngle - startAngle) > Math.PI ? -1 : 1
		return {
			startPoint: arcStartPoint,
			endPoint: arcEndPoint,
			middlePoint: addPoint.normalize().mul(dir * radius, dir * radius),
		}
	}
}
