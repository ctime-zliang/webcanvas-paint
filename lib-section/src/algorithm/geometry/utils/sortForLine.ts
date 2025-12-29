import { Vector2 } from '../../../engine/algorithm/geometry/vector/Vector2'
import { ESweep } from '../../../engine/config/CommonProfile'
import { ArraySort } from '../../../engine/math/ArraySort'
import { toFix } from '../../../engine/math/Calculation'
import { DoubleKit } from '../../../Main'
import { Arc } from '../primitives/Arc'
import { Line } from '../primitives/Line'

export function sortForLine(points: Array<Vector2>, line: Line | Arc): Array<Vector2> {
	if (points.length <= 0) {
		return points
	}
	if (line instanceof Line) {
		const startPoint: Vector2 = line.startPoint
		ArraySort.quickSort(
			points,
			(p1: Vector2, p2: Vector2): number => {
				return p1.distance2(startPoint) - p2.distance2(startPoint)
			},
			0,
			points.length
		)
		return points
	}
	if (line instanceof Arc) {
		const centerPoint: Vector2 = line.centerPoint
		const direct: Vector2 = line.startPoint.sub(centerPoint).normalize()
		const sweep: ESweep = line.sweep
		ArraySort.quickSort(
			points,
			(p1: Vector2, p2: Vector2): number => {
				const direct1: Vector2 = p1.sub(centerPoint).normalize()
				const direct2: Vector2 = p2.sub(centerPoint).normalize()
				const dot1: number = toFix(direct.dot(direct1), 8)
				const dot2: number = toFix(direct.dot(direct2), 8)
				const corss1: number = direct.cross(direct1)
				const corss2: number = direct.cross(direct2)
				let angle1: number = Math.acos(dot1)
				let angle2: number = Math.acos(dot2)
				if ((sweep === ESweep.CCW && DoubleKit.less(corss1, 0)) || (sweep === ESweep.CW && DoubleKit.greater(corss1, 0))) {
					angle1 = Math.PI * 2 - angle1
				}
				if ((sweep === ESweep.CCW && DoubleKit.less(corss2, 0)) || (sweep === ESweep.CW && DoubleKit.greater(corss2, 0))) {
					angle2 = Math.PI * 2 - angle2
				}
				return angle1 - angle2
			},
			0,
			points.length
		)
		if (line.startPoint.equalsWithVector2(line.endPoint)) {
			points.push(line.endPoint)
		}
		return points
	}
	return points
}
