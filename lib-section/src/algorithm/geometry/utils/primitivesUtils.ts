import { BBox2, BBox2Fac } from '../../../engine/algorithm/geometry/bbox/BBox2'
import { Matrix4 } from '../../../engine/algorithm/geometry/matrix/Matrix4'
import { Vector2 } from '../../../engine/algorithm/geometry/vector/Vector2'
import { ESweep } from '../../../engine/config/CommonProfile'
import { Angles } from '../../../engine/math/Angles'
import { DoubleKit } from '../../../engine/math/Doublekit'
import { ArcIdentify } from '../ArcIdentify'
import { isOn } from '../intersection/utils'
import { Arc } from '../primitives/Arc'
import { Line } from '../primitives/Line'
import { Primitive } from '../primitives/Primitive'

export function isEmptyPrimitive(pt: Primitive): boolean {
	if (pt instanceof Line) {
		return DoubleKit.eq(pt.length, 0)
	}
	if (pt instanceof Arc) {
		return DoubleKit.eq(pt.sweepAngle, 0)
	}
	return true
}

export function getPrimitivesLength(pts: Array<Primitive>): number {
	let lenSum: number = 0
	for (let i: number = 0; i < pts.length; i++) {
		if (pts[i] instanceof Line) {
			lenSum += pts[i].length
			continue
		}
		if (pts[i] instanceof Arc) {
			lenSum += pts[i].length
			continue
		}
	}
	return lenSum
}

export function getPrimitiveItemLength(pt: Primitive): number {
	if (pt instanceof Line) {
		return pt.length
	}
	if (pt instanceof Arc) {
		const sweepAngle: number = Angles.degreeToRadian(pt.sweepAngle)
		return Math.abs(pt.rx * sweepAngle)
	}
	return 0
}

/**
 * 获取 Primitive 结束点的方向向量
 *      对于圆弧 Arc, 即结束点位置的切线方向
 */
export function getPrimitiveLastDirect(pts: Array<Primitive>, end?: Vector2): Vector2 {
	for (let i: number = pts.length - 1; i >= 0; i--) {
		const pt: Primitive = pts[i]
		if (i > 0 && isEmptyPrimitive(pt)) {
			continue
		}
		if (pt instanceof Line) {
			return pt.direct
		}
		if (pt instanceof Arc) {
			let _end: Vector2 = end || pt.endPoint
			const direc: Vector2 = _end.sub(pt.centerPoint).normalize()
			if (pt.sweep === ESweep.CCW) {
				return new Vector2(-direc.y, direc.x)
			}
			return new Vector2(direc.y, -direc.x)
		}
	}
	return null!
}

/**
 * 获取圆弧 Arc 中点
 */
export function getMiddleInArc(pt: Arc): Vector2 {
	const sweepAngle: number = Math.abs(pt.sweepAngle % 360)
	const v1: Vector2 = pt.startPoint.sub(pt.centerPoint)
	const v2: Vector2 = pt.endPoint.sub(pt.centerPoint)
	let centerDirect: Vector2 = v1.add(v2).normalize()
	if (sweepAngle > 180) {
		centerDirect = centerDirect.mul(-1)
	}
	const middle: Vector2 = pt.centerPoint.add(centerDirect.mul(pt.rx))
	return middle
}

export function isPointInPt(p: Vector2, pt: Primitive): boolean {
	if (pt instanceof Line) {
		const v1: Vector2 = p.sub(pt.startPoint)
		const v2: Vector2 = p.sub(pt.endPoint)
		return DoubleKit.eq(Math.abs(v1.cross(v2)), 0) && DoubleKit.lesseq(v1.dot(v2), 0)
	}
	if (pt instanceof Arc) {
		return DoubleKit.eq(p.distance(pt.centerPoint), pt.rx) && isOn(pt, p)
	}
	return false
}

export function splitPrimitive(pt: Primitive, point: Vector2): Array<Primitive> {
	if (pt instanceof Line) {
		return [new Line(pt.startPoint, point), new Line(point, pt.endPoint)]
	}
	if (pt instanceof Arc) {
		if (Math.abs(pt.sweepAngle) === 360.0) {
			const mid: Vector2 = pt.centerPoint.sub(point).mul(2).add(point)
			const pt1: Arc = Arc.build4(mid, point, pt.centerPoint, pt.rx, pt.rx, pt.sweep)
			const pt2: Arc = Arc.build4(point, mid, pt.centerPoint, pt.rx, pt.rx, pt.sweep)
			return [pt1, pt2]
		}
		let pt1: Arc | Line = Arc.build4(pt.startPoint, point, pt.centerPoint, pt.rx, pt.rx, pt.sweep)
		let pt2: Arc | Line = Arc.build4(point, pt.endPoint, pt.centerPoint, pt.rx, pt.rx, pt.sweep)
		if (pt1.startPoint.equalsWithVector2(pt1.endPoint)) {
			pt1 = new Line(pt.startPoint, point)
		}
		if (pt2.startPoint.equalsWithVector2(pt2.endPoint)) {
			pt2 = new Line(point, pt.endPoint)
		}
		return [pt1, pt2]
	}
	return []
}

export function getArcLength(radius: number, sweepAngle: number): number {
	return Math.abs((radius * sweepAngle * Math.PI) / Math.PI)
}

export function isPointInRect(
	point: Vector2,
	rectStartPoint: Vector2,
	rectWidth: number,
	rectHeight: number,
	rectRotation: number,
	rectCornerRadius: number
): boolean {
	const matrix: Matrix4 = Matrix4.rotateZForPoint(rectStartPoint, -rectRotation)
	const p: Vector2 = point.multiplyMatrix4(matrix)
	const radius: number = Math.min(rectWidth / 2, rectHeight / 2, rectCornerRadius)
	const leftUp: Vector2 = rectStartPoint
	const leftLow: Vector2 = new Vector2(rectStartPoint.x, rectStartPoint.y - rectHeight)
	const rightUp: Vector2 = new Vector2(rectStartPoint.x + rectWidth, rectStartPoint.y)
	const rightLow: Vector2 = new Vector2(rectStartPoint.x + rectWidth, rectStartPoint.y - rectHeight)
	const center1: Vector2 = leftLow.add(new Vector2(radius, radius))
	const center2: Vector2 = rightLow.add(new Vector2(-radius, radius))
	const center3: Vector2 = rightUp.add(new Vector2(-radius, -radius))
	const center4: Vector2 = leftUp.add(new Vector2(radius, -radius))
	if (new BBox2(leftLow.x, rightUp.x, leftLow.y, rightUp.y).isContainsPoint(p)) {
		if (p.x < center1.x) {
			if (p.y < center1.y) {
				return p.distance(center1) <= radius
			}
			if (p.y > center4.y) {
				return p.distance(center4) <= radius
			}
		}
		if (p.x > center2.x) {
			if (p.y < center2.y) {
				return p.distance(center2) <= radius
			}
			if (p.y > center3.y) {
				return p.distance(center3) <= radius
			}
		}
		return true
	}
	return false
}

export function isPointInArc(
	point: Vector2,
	arcCenter: Vector2,
	arcRadius: number,
	arcStartAngle: number,
	arcEndAngle: number,
	arcSweep: ESweep,
	arcStrokeWidth: number,
	scale: number = 1
): boolean {
	let arcStartAngle2: number = Angles.limitAngularRange(arcStartAngle)
	let arcEndAngle2: number = Angles.limitAngularRange(arcEndAngle)
	if (arcRadius <= 0) {
		return false
	}
	let arcStrokeWidth2: number = arcStrokeWidth
	if (arcStrokeWidth2 === 0 && scale !== null) {
		arcStrokeWidth2 = 10 / scale
	}
	if (arcSweep === ESweep.CW) {
		const t: number = arcStartAngle2
		arcStartAngle2 = arcEndAngle2
		arcEndAngle2 = t
	}
	const { x, y } = point
	const w2: number = arcStrokeWidth2 / 2
	const innerRadius: number = arcRadius - w2
	const outerRadius: number = arcRadius + w2
	const dx: number = x - arcCenter.x
	const dy: number = y - arcCenter.y
	let angle: number = Math.atan2(dy, dx)
	if (angle < 0) {
		angle += Math.PI * 2
	}
	if (
		(arcStartAngle2 <= arcEndAngle2 && angle >= arcStartAngle2 && angle <= arcEndAngle2) ||
		(arcStartAngle2 > arcEndAngle2 && ((angle >= arcStartAngle2 && angle <= Math.PI * 2) || (angle >= 0 && angle <= arcEndAngle2))) ||
		arcStartAngle2 === arcEndAngle2
	) {
		const r: number = Math.sqrt(dx * dx + dy * dy)
		if (r <= outerRadius && r >= innerRadius) {
			return true
		}
		return false
	}
	const r: number = (outerRadius + innerRadius) / 2
	const start: Vector2 = new Vector2(arcCenter.x + Math.cos(arcStartAngle2) * r, arcCenter.y + Math.sin(arcStartAngle2) * r)
	const end: Vector2 = new Vector2(arcCenter.x + Math.cos(arcEndAngle2) * r, arcCenter.y + Math.sin(arcEndAngle2) * r)
	const dx1: number = x - start.x
	const dy1: number = y - start.y
	const dx2: number = x - end.x
	const dy2: number = y - end.y
	if (dx1 * dx1 + dy1 * dy1 <= (arcStrokeWidth2 * arcStrokeWidth2) / 4) {
		return true
	}
	if (dx2 * dx2 + dy2 * dy2 <= (arcStrokeWidth2 * arcStrokeWidth2) / 4) {
		return true
	}
	return false
}

export function isPointInCircle(point: Vector2, circleCenter: Vector2, circleRadius: number): boolean {
	return circleCenter.distance(point) <= circleRadius
}

export function isPointInLine(point: Vector2, lineStartPoint: Vector2, lineEndPoint: Vector2, lineWidth: number, scale: number = 1): boolean {
	let lineWdith2: number = lineWidth
	if (lineWidth === 0 && scale !== null) {
		lineWdith2 = 10 / scale
	}
	const { x, y } = point
	const dx: number = x - lineStartPoint.x
	const dy: number = y - lineStartPoint.y
	const dx2: number = x - lineEndPoint.x
	const dy2: number = y - lineEndPoint.y
	const X: number = lineEndPoint.x - lineStartPoint.x
	const Y: number = lineEndPoint.y - lineStartPoint.y
	const vertical: Vector2 = new Vector2(-Y, X).normalize()
	const limitX: number = X + (vertical.x * lineWdith2) / 2
	const limitY: number = Y + (vertical.y * lineWdith2) / 2
	const limit: number = limitX * limitX + limitY * limitY
	const len: number = dx * dx + dy * dy
	const len2: number = dx2 * dx2 + dy2 * dy2
	const area: number = Math.abs(dx * Y - dy * X) / 2
	const length: number = Math.sqrt(X * X + Y * Y)
	const area2: number = (length * lineWidth) / 4
	if (area <= area2 && len <= limit && len2 <= limit) {
		return true
	}
	const r: number = lineWdith2 / 2
	if (len <= r * r) {
		return true
	}
	if (len2 <= r * r) {
		return true
	}
	return false
}

export function isPointInStrokeRect(
	point: Vector2,
	rectStartPoint: Vector2,
	rectWidth: number,
	rectHeight: number,
	rectRotation: number,
	rectCornerRadius: number,
	rectStrokeWidth: number,
	isIgnoreArc: boolean = false
): boolean {
	const matrix: Matrix4 = Matrix4.rotateZForPoint(rectStartPoint, -rectRotation)
	const p: Vector2 = point.multiplyMatrix4(matrix)
	const radius: number = Math.min(rectWidth / 2, rectHeight / 2, rectCornerRadius)
	const leftUp: Vector2 = rectStartPoint
	const leftLow: Vector2 = new Vector2(rectStartPoint.x, rectStartPoint.y - rectHeight)
	const rightUp: Vector2 = new Vector2(rectStartPoint.x + rectWidth, rectStartPoint.y)
	const rightLow: Vector2 = new Vector2(rectStartPoint.x + rectWidth, rectStartPoint.y - rectHeight)
	const center1: Vector2 = leftLow.add(new Vector2(radius, radius))
	const center2: Vector2 = rightLow.add(new Vector2(-radius, radius))
	const center3: Vector2 = rightUp.add(new Vector2(-radius, -radius))
	const center4: Vector2 = leftUp.add(new Vector2(radius, -radius))
	const p1: Vector2 = new Vector2(leftUp.x, center1.y)
	const p2: Vector2 = new Vector2(leftUp.x, center4.y)
	const p3: Vector2 = new Vector2(center4.x, leftUp.y)
	const p4: Vector2 = new Vector2(center3.x, leftUp.y)
	const p5: Vector2 = new Vector2(rightLow.x, center3.y)
	const p6: Vector2 = new Vector2(rightLow.x, center2.y)
	const p7: Vector2 = new Vector2(center2.x, rightLow.y)
	const p8: Vector2 = new Vector2(center1.x, rightLow.y)
	if (isPointInLine(p, p1, p2, rectStrokeWidth)) {
		return true
	}
	if (isPointInLine(p, p3, p4, rectStrokeWidth)) {
		return true
	}
	if (isPointInLine(p, p5, p6, rectStrokeWidth)) {
		return true
	}
	if (isPointInLine(p, p7, p8, rectStrokeWidth)) {
		return true
	}
	if (!isIgnoreArc) {
		if (isPointInArc(p, center1, radius, Math.PI, Math.PI * 1.5, ESweep.CCW, rectStrokeWidth)) {
			return true
		}
		if (isPointInArc(p, center2, radius, Math.PI * 1.5, Math.PI * 2.0, ESweep.CCW, rectStrokeWidth)) {
			return true
		}
		if (isPointInArc(p, center3, radius, Math.PI * 0, Math.PI / 2.0, ESweep.CCW, rectStrokeWidth)) {
			return true
		}
		if (isPointInArc(p, center4, radius, Math.PI / 2.0, Math.PI, ESweep.CCW, rectStrokeWidth)) {
			return true
		}
	}
	return false
}

export function getArcBBox2(center: Vector2, radius: number, storkeWidth: number, startAngle: number, endAngle: number, sweep: ESweep): BBox2 {
	if (storkeWidth < 0) {
		return null!
	}
	const isContain = (angle: number): boolean => {
		if (startAngle === endAngle) {
			return true
		}
		if (sweep === ESweep.CCW) {
			if (startAngle > endAngle) {
				if (angle >= startAngle && angle <= Math.PI * 2) {
					return true
				}
				if (angle >= 0 && angle <= endAngle) {
					return true
				}
				return false
			}
			if (angle >= startAngle && angle <= endAngle) {
				return true
			}
			return false
		}
		if (startAngle > endAngle) {
			if (angle >= endAngle && angle <= startAngle) {
				return true
			}
			return false
		}
		if (angle >= endAngle && angle <= Math.PI * 2) {
			return true
		}
		if (angle >= 0 && angle <= startAngle) {
			return true
		}
		return false
	}
	if (radius <= 0) {
		return null!
	}
	const bbox2Fac: BBox2Fac = new BBox2Fac()
	const start: Vector2 = center.add(new Vector2(Math.cos(startAngle) * radius, Math.sin(startAngle) * radius))
	const end: Vector2 = center.add(new Vector2(Math.cos(endAngle) * radius, Math.sin(endAngle) * radius))
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

export function getArcMiddlePoint(center: Vector2, radius: number, startAngle: number, endAngle: number, sweep: ESweep = ESweep.CCW): Vector2 {
	if (sweep === ESweep.CCW) {
		if (endAngle > startAngle) {
			const angle: number = (endAngle - startAngle) / 2 + startAngle
			const midPoint: Vector2 = center.add(new Vector2(Math.cos(angle), Math.sin(angle)).mul(radius))
			return midPoint
		}
		if (endAngle === startAngle) {
			const midPoint: Vector2 = center.add(new Vector2(Math.cos((Math.PI * 3) / 2), Math.sin((Math.PI * 3) / 2)).mul(radius))
			return midPoint
		}
		const angle: number = (endAngle + Math.PI * 2 - startAngle) / 2 + startAngle
		const midPoint: Vector2 = center.add(new Vector2(Math.cos(angle), Math.sin(angle)).mul(radius))
		return midPoint
	}
	if (endAngle > startAngle) {
		const angle: number = (startAngle = Math.PI * 2 - endAngle) / 2 + endAngle
		const midPoint: Vector2 = center.add(new Vector2(Math.cos(angle), Math.sin(angle)).mul(radius))
		return midPoint
	}
	if (endAngle === startAngle) {
		const midPoint: Vector2 = center.add(new Vector2(Math.cos((Math.PI * 3) / 2), Math.sin((Math.PI * 3) / 2)).mul(radius))
		return midPoint
	}
	const angle: number = (startAngle - endAngle) / 2 + endAngle
	const midPoint: Vector2 = center.add(new Vector2(Math.cos(angle), Math.sin(angle)).mul(radius))
	return midPoint
}

export function getCircleBBox2(center: Vector2, radius: number, storkeWidth: number): BBox2 {
	if (radius <= 0) {
		return null!
	}
	const bbox2Fac: BBox2Fac = new BBox2Fac()
	bbox2Fac.extendByVector2(center).extendByOffset(radius + storkeWidth / 2)
	return bbox2Fac.build()
}

export function getLineBBox2(startPoint: Vector2, endPoint: Vector2, lineWidth: number): BBox2 {
	if (lineWidth <= 0) {
		return null!
	}
	const w2: number = lineWidth / 2
	return new BBox2(
		Math.min(startPoint.x, endPoint.x) - w2,
		Math.max(startPoint.x, endPoint.x) + w2,
		Math.min(startPoint.y, endPoint.y) - w2,
		Math.max(startPoint.y, endPoint.y) + w2
	)
}

export function isPrimitivesClosed(pts: Array<Primitive>, range: number = 1e-8): boolean {
	if (pts.length === 1) {
		const pt: Primitive = pts[0]
		if (pt instanceof Arc && DoubleKit.greatereq(Math.abs(pt.sweepAngle), 359.9)) {
			return true
		}
	}
	if (pts.length === 2) {
		if (pts[0] instanceof Line && pts[1] instanceof Line) {
			return false
		}
		const f: Primitive = pts[0]
		const l: Primitive = pts[pts.length - 1]
		if (f.startPoint.distance(l.endPoint) <= range) {
			return true
		}
	}
	const f: Primitive = pts[0]
	const l: Primitive = pts[pts.length - 1]
	if (f.startPoint.distance(l.endPoint) <= range) {
		return true
	}
	return false
}

export function getRectBBox2(startPoint: Vector2, width: number, height: number, storkeWidth: number, rotation: number, cornerRadius: number): BBox2 {
	const radius: number = Math.min(width / 2, height / 2, cornerRadius)
	const matrix4: Matrix4 = Matrix4.rotateZForPoint(startPoint, rotation)
	const leftUp: Vector2 = startPoint
	const leftLow: Vector2 = new Vector2(startPoint.x, startPoint.y - height)
	const rightUp: Vector2 = new Vector2(startPoint.x + width, startPoint.y)
	const rightLow: Vector2 = new Vector2(startPoint.x + width, startPoint.y - height)
	const center1: Vector2 = leftLow.add(new Vector2(radius, radius)).multiplyMatrix4(matrix4)
	const center2: Vector2 = rightLow.add(new Vector2(-radius, radius)).multiplyMatrix4(matrix4)
	const center3: Vector2 = rightUp.add(new Vector2(-radius, -radius)).multiplyMatrix4(matrix4)
	const center4: Vector2 = leftUp.add(new Vector2(radius, -radius)).multiplyMatrix4(matrix4)
	const bbox2Fac: BBox2Fac = new BBox2Fac()
	bbox2Fac
		.extendByVector2(center1)
		.extendByVector2(center2)
		.extendByVector2(center3)
		.extendByVector2(center4)
		.extendByOffset(radius + storkeWidth / 2)
	return bbox2Fac.build()
}

/**
 * 判断线段是否相交
 */
export function isSegmentIntered(p1: Vector2, p2: Vector2, p3: Vector2, p4: Vector2): boolean {
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

export function interceptPt(pt: Primitive, dis1: number, dis2?: number): Primitive {
	if (DoubleKit.eq(dis1, 0) && !dis2) {
		return pt
	}
	if (pt instanceof Line) {
		const startPoint: Vector2 = pt.startPoint.add(pt.direct.mul(dis1))
		const endPoint: Vector2 = dis2 ? pt.startPoint.add(pt.direct.mul(dis2)) : pt.endPoint
		return new Line(startPoint, endPoint)
	}
	if (pt instanceof Arc) {
		const originStartAngle: number = Angles.regularDegress(pt.startAngle)
		const len: number = Math.PI * 1 * pt.rx * 2
		const angle1: number = (dis1 / len) * 360
		const startAngle: number = pt.sweep === ESweep.CW ? originStartAngle - angle1 : originStartAngle + angle1
		let endAngle: number = pt.endAngle
		if (typeof dis2 === 'number') {
			const angle2: number = (dis2 / len) * 360
			endAngle = pt.sweep === ESweep.CW ? originStartAngle - angle2 : originStartAngle + angle2
		}
		return Arc.build2(pt.centerPoint, startAngle, endAngle, pt.rx, pt.rx, pt.sweep)
	}
	return pt
}

export function getPointInArcLength(points: Array<Vector2>, pt: Arc): Array<{ p: Vector2; dis: number }> {
	const len: number = Math.PI * 2 * pt.rx * 2
	const startAngle: number = Angles.regularDegress(pt.startAngle)
	const results: Array<{ p: Vector2; dis: number }> = []
	for (let i: number = 0; i < points.length; i++) {
		const p: Vector2 = points[i]
		const angleX: number = Angles.regularDegress(Angles.radianToDegree(p.getRadianByVector2(pt.centerPoint)))
		const isInArc: boolean = isOn(pt, p)
		let angle: number = undefined!
		let sweep: ESweep = pt.sweep
		if (!isInArc) {
			sweep = sweep === ESweep.CW ? ESweep.CCW : ESweep.CW
		}
		if (DoubleKit.eq(startAngle, angleX)) {
			angle = 0
		} else if (startAngle > angleX) {
			if (pt.sweep === ESweep.CW) {
				angle = startAngle - angleX
			} else {
				angle = 360 - (startAngle - angleX)
			}
		} else {
			if (pt.sweep === ESweep.CW) {
				angle = 360 - (angleX - startAngle)
			} else {
				angle = angleX - startAngle
			}
		}
		angle = isInArc ? Math.abs(angle) : -Math.abs(angle)
		const dis: number = (angle / 360) * len
		results.push({ p, dis })
	}
	return results
}

export function updateArcParamByNewStartPoint(
	newStartPoint: Vector2,
	oldStartPoint: Vector2,
	oldEndPoint: Vector2,
	oldMidPoint: Vector2,
	oldCenterPoint: Vector2,
	oldSweep: ESweep,
	oldRadius: number
): {
	center: Vector2
	startAngle: number
	endAngle: number
	radius: number
} {
	const result: {
		center: Vector2
		startAngle: number
		endAngle: number
		radius: number
	} = {
		center: null!,
		startAngle: undefined!,
		endAngle: undefined!,
		radius: undefined!,
	}
	const newStartPoint2: Vector2 = new ArcIdentify().fixStartPoint(newStartPoint, oldEndPoint, oldCenterPoint, oldRadius, oldSweep)
	let length2: number = oldEndPoint.distance2(newStartPoint2)
	let distance: number = Math.sqrt(oldMidPoint.distance2(oldStartPoint) - oldEndPoint.distance2(oldStartPoint) / 4)
	if (distance < 0.1 || Number.isNaN(distance)) {
		distance = 0.1
	}
	let radius: number = distance / 2 + length2 / distance / 8
	if (radius === 0) {
		radius = 1e-8
	}
	result.radius = radius
	let direct: Vector2 = oldEndPoint.sub(newStartPoint2)
	let mid: Vector2 = newStartPoint2.add(oldEndPoint).mul(0.5)
	let l: Vector2 = null!
	if (oldSweep === ESweep.CCW) {
		l = new Vector2(-direct.y, direct.x).normalize()
	} else {
		l = new Vector2(direct.y, -direct.x).normalize()
	}
	let center: Vector2 = mid.add(l.mul(radius - distance))
	result.center = center
	let OS: Vector2 = newStartPoint2.sub(center).normalize()
	let OE: Vector2 = oldEndPoint.sub(center).normalize()
	result.startAngle = Math.atan2(OS.y, OS.x)
	result.endAngle = Math.atan2(OE.y, OE.x)
	return result
}

export function updateArcParamByNewEndPoint(
	newEndPoint: Vector2,
	oldStartPoint: Vector2,
	oldEndPoint: Vector2,
	oldMidPoint: Vector2,
	oldSweep: ESweep
): {
	center: Vector2
	startAngle: number
	endAngle: number
	radius: number
} {
	const result: {
		center: Vector2
		startAngle: number
		endAngle: number
		radius: number
	} = {
		center: null!,
		startAngle: undefined!,
		endAngle: undefined!,
		radius: undefined!,
	}
	let length2: number = newEndPoint.distance2(oldStartPoint)
	let distance: number = Math.sqrt(oldMidPoint.distance2(oldStartPoint) - oldEndPoint.distance2(oldStartPoint) / 4)
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
	let OS: Vector2 = oldStartPoint.sub(center).normalize()
	let OE: Vector2 = newEndPoint.sub(center).normalize()
	result.startAngle = Math.atan2(OS.y, OS.x)
	result.endAngle = Math.atan2(OE.y, OE.x)
	return result
}
