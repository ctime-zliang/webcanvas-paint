import { Vector2 } from '../../../engine/algorithm/geometry/vector/Vector2'
import { ESweep } from '../../../engine/config/CommonProfile'
import { DoubleKit } from '../../../Main'
import { Arc } from '../primitives/Arc'
import { Line } from '../primitives/Line'
import { Primitive } from '../primitives/Primitive'
import { getPrimitiveLastDirect } from './primitivesUtils'

export function getSweep(point: Vector2, pt: Primitive): ESweep {
	if (pt instanceof Line) {
		const direct1: Vector2 = pt.endPoint.sub(pt.startPoint).normalize()
		const direct2: Vector2 = point.sub(pt.startPoint).normalize()
		const cross: number = direct1.cross(direct2)
		if (DoubleKit.greater(cross, 0)) {
			return ESweep.CCW
		}
		if (DoubleKit.less(cross, 0)) {
			return ESweep.CW
		}
		return null!
	}
	if (pt instanceof Arc) {
		const dis: number = point.distance(pt.centerPoint)
		if (DoubleKit.greater(dis, pt.rx)) {
			if (pt.sweep === ESweep.CCW) {
				return ESweep.CW
			}
			return ESweep.CCW
		}
		if (DoubleKit.less(dis, pt.rx)) {
			return pt.sweep
		}
		return null!
	}
	return null!
}

/**
 * 计算 point 是否处于 direct1 和 direct2 构成的劣弧扇形区域内
 */
export function isInInferiorArcFan(point: Vector2, direct1: Vector2, direct2: Vector2): boolean {
	const c1: number = direct1.cross(direct2)
	const c2: number = direct1.cross(point)
	const c3: number = direct2.cross(point)
	return c1 * c2 > 0 && c2 * c3 < 0
}

/**
 * 获取输入点 point 在由 [prev, curr, next] 构成的路径所分割的平面的哪一侧
 * 		CCW - 在逆时针方向
 * 		CW - 在顺时针方向
 * 		null - 共线
 */
export function getSweepForPts(point: Vector2, prev: Primitive, curr: Primitive, next: Primitive): ESweep {
	let startPoint: Vector2 = curr.startPoint
	let endPoint: Vector2 = curr.startPoint
	if (curr instanceof Arc) {
		let direct: Vector2 = point.sub(curr.centerPoint).normalize()
		let direct1: Vector2 = startPoint.sub(curr.centerPoint).normalize()
		let direct2: Vector2 = endPoint.sub(curr.centerPoint).normalize()
		if (isInInferiorArcFan(direct, direct1, direct2)) {
			return getSweep(point, curr)
		}
		if (DoubleKit.eq(Math.abs(curr.sweepAngle), 180)) {
			if (curr.sweepAngle > 0) {
				if (DoubleKit.greater(direct1.cross(direct), 0)) {
					return getSweep(point, curr)
				}
			}
			if (DoubleKit.greater(direct2.cross(direct), 0)) {
				return getSweep(point, curr)
			}
		}
	}
	/**
	 * - 判断输入点 point 靠近起点或终点
	 * - 除直线段外, 有拐角的路径会将平面分割成一个劣弧扇形区域和优弧扇形区域, 判断输入点 point 是否处于劣弧扇形区域
	 * 		- 若 point 处于劣弧扇形区域, 依据劣弧的前后路径判断点的前进方向, 输入点 point 所在的方向与劣弧方向一致
	 * - 若为直线段, 可以判断输入点 point 在路径的哪一侧
	 * - 若输入点 point 处于路劲起始端点附近或路径结束端点附近, 则直接判断输入点 point 位于路径的哪一侧
	 * 		- 若输入点 point 刚好处于路径端点的切线所在的延长线上, 则直接当做任意侧的端点
	 */
	if (point.distance2(startPoint) < point.distance2(endPoint)) {
		if (prev !== null) {
			let direct: Vector2 = point.sub(startPoint).normalize()
			let direct1: Vector2 = getPrimitiveLastDirect([prev]).mul(-1)
			let direct2: Vector2 = getPrimitiveLastDirect([curr], startPoint)
			let crossV: number = direct1.mul(-1).cross(direct2)
			if (DoubleKit.eq(crossV, 0)) {
				return getSweep(point, curr)
			}
			if (isInInferiorArcFan(direct, direct1, direct2)) {
				if (DoubleKit.greater(crossV, 0)) {
					return ESweep.CCW
				}
				return ESweep.CW
			}
			/**
			 * point 位于 线段上
			 */
			if (
				(Vector2.isParallel(direct, direct1) && prev.bbox2.isContainsPoint(point)) ||
				(Vector2.isParallel(direct, direct2) && curr.bbox2.isContainsPoint(point))
			) {
				return null!
			}
			if (DoubleKit.greater(crossV, 0)) {
				return ESweep.CW
			}
			return ESweep.CCW
		}
		return getSweep(point, curr)
	}
	if (next !== null) {
		let direct: Vector2 = point.sub(endPoint).normalize()
		let direct1: Vector2 = getPrimitiveLastDirect([curr], endPoint).mul(-1)
		let direct2: Vector2 = getPrimitiveLastDirect([next], next.startPoint)
		let crossV: number = direct1.mul(-1).cross(direct2)
		if (DoubleKit.eq(crossV, 0)) {
			return getSweep(point, curr)
		}
		if (isInInferiorArcFan(direct, direct1, direct2)) {
			if (DoubleKit.greater(crossV, 0)) {
				return ESweep.CCW
			}
			return ESweep.CW
		}
		/**
		 * point 位于 线段上
		 */
		if (
			(Vector2.isParallel(direct, direct1) && curr.bbox2.isContainsPoint(point)) ||
			(Vector2.isParallel(direct, direct2) && next.bbox2.isContainsPoint(point))
		) {
			return null!
		}
		if (DoubleKit.greater(crossV, 0)) {
			return ESweep.CW
		}
		return ESweep.CCW
	}
	return getSweep(point, curr)
}
