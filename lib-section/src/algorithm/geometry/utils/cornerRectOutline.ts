import { Vector2 } from '../../../engine/algorithm/geometry/vector/Vector2'
import { ESweep } from '../../../engine/config/CommonProfile'
import { Arc } from '../primitives/Arc'
import { Line } from '../primitives/Line'
import { Polyline } from '../primitives/Polyline'
import { Primitive } from '../primitives/Primitive'
import { getPrimitiveItemLength } from './primitivesUtils'

/**
 * 获取从 startPoint 到 endPoint 的线宽为 width 的线段 L 的外轮廓线集合
 * 		ratio 为线段 L 的端点圆角直径与线段 L 的 min(width, height) 的比值
 */
export function getCornerRectOutline(startPoint: Vector2, endPoint: Vector2, width: number, ratio: number, sweep: ESweep = ESweep.CW): Polyline {
	const direct: Vector2 = endPoint.sub(startPoint).normalize()
	const vertical: Vector2 = new Vector2(-direct.y, direct.x)
	const length: number = startPoint.distance(endPoint)
	const radius: number = (Math.min(length, width) / 2) * ratio
	const diameter: number = radius * 2
	const deltaY: number = (width - diameter) / 2
	const v: Vector2 = vertical.mul(deltaY)
	const radiusDir: Vector2 = direct.mul(radius)
	const radiusVertical: Vector2 = vertical.mul(radius)
	const startTop: Vector2 = startPoint.add(v)
	const startBottom: Vector2 = startPoint.sub(v)
	const endTop: Vector2 = endPoint.add(v)
	const endBottom: Vector2 = endPoint.sub(v)
	const startTopCenter: Vector2 = startTop.add(radiusDir)
	const startBottomCenter: Vector2 = startBottom.add(radiusDir)
	const endTopCenter: Vector2 = endTop.sub(radiusDir)
	const endBottomCenter: Vector2 = endBottom.sub(radiusDir)
	const topLeft: Vector2 = startTopCenter.sub(radiusVertical)
	const topRight: Vector2 = endTopCenter.add(radiusVertical)
	const bottomLeft: Vector2 = startBottomCenter.sub(radiusVertical)
	const bottomRight: Vector2 = endBottomCenter.sub(radiusVertical)
	const pts: Array<Primitive> = []
	if (sweep === ESweep.CCW) {
		const line1: Line = new Line(startTop, startBottom)
		const line2: Line = new Line(bottomLeft, bottomRight)
		const line3: Line = new Line(endBottom, endTop)
		const line4: Line = new Line(topRight, topLeft)
		if (radius > 0) {
			const arc1: Arc = Arc.build1(startBottom, bottomLeft, radius, radius, false, ESweep.CCW)
			const arc2: Arc = Arc.build1(bottomRight, endBottom, radius, radius, false, ESweep.CCW)
			const arc3: Arc = Arc.build1(endTop, topRight, radius, radius, false, ESweep.CCW)
			const arc4: Arc = Arc.build1(topLeft, startTop, radius, radius, false, ESweep.CCW)
			const list: Array<Primitive> = [line1, arc1, line2, arc2, line3, arc3, line4, arc4]
			for (let pt of list) {
				if (pt && getPrimitiveItemLength(pt) > 0) {
					pts.push(pt)
				}
			}
		} else {
			const list: Array<Primitive> = [line1, line2, line3, line4]
			for (let pt of list) {
				if (pt && getPrimitiveItemLength(pt) > 0) {
					pts.push(pt)
				}
			}
		}
		return Polyline.build2(pts).asClose()
	}
	const line1: Line = new Line(startBottom, startTop)
	const line2: Line = new Line(topLeft, topRight)
	const line3: Line = new Line(endTop, endBottom)
	const line4: Line = new Line(bottomRight, bottomLeft)
	if (radius > 0) {
		const arc1: Arc = Arc.build1(startTop, topLeft, radius, radius, false, ESweep.CW)
		const arc2: Arc = Arc.build1(topRight, endTop, radius, radius, false, ESweep.CW)
		const arc3: Arc = Arc.build1(endBottom, bottomRight, radius, radius, false, ESweep.CW)
		const arc4: Arc = Arc.build1(bottomLeft, startBottom, radius, radius, false, ESweep.CW)
		const list: Array<Primitive> = [line1, arc1, line2, arc2, line3, arc3, line4, arc4]
		for (let pt of list) {
			if (pt && getPrimitiveItemLength(pt) > 0) {
				pts.push(pt)
			}
		}
	} else {
		const list: Array<Primitive> = [line1, line2, line3, line4]
		for (let pt of list) {
			if (pt && getPrimitiveItemLength(pt) > 0) {
				pts.push(pt)
			}
		}
	}
	return Polyline.build2(pts).asClose()
}
