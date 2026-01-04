import { BBox2 } from '../../../engine/algorithm/geometry/bbox/BBox2'
import { Vector2 } from '../../../engine/algorithm/geometry/vector/Vector2'
import { DoubleKit } from '../../../engine/math/Doublekit'
import { Arc } from '../primitives/Arc'
import { Line } from '../primitives/Line'
import { Polyline } from '../primitives/Polyline'
import { Primitive } from '../primitives/Primitive'
import { Triangle } from '../primitives/Triangle'
import { CACHE } from './profile'
import { fastIntersectionDetection, inters1, intersExtendRegularArcLine, intersRegularArcLine } from './utils'

/**
 * 获取 Primitive 交点个数
 */
export function intersPP(m: Primitive, n: Primitive): number {
	if (m instanceof Line && n instanceof Line) {
		return intersLL(m, n)
	}
	if (m instanceof Arc && n instanceof Line) {
		return intersAL(m, n)
	}
	if (m instanceof Line && n instanceof Arc) {
		return intersAL(n, m)
	}
	if (m instanceof Arc && n instanceof Arc) {
		return intersAA(m, n)
	}
	return 0
}

/**
 * 判断 Polyline 是否相交
 */
export function intersPolyline(m: Polyline, n: Polyline): boolean {
	const mps: Array<Primitive> = m.primitives
	const nps: Array<Primitive> = n.primitives
	const minPs: Array<Primitive> = mps.length > nps.length ? nps : mps
	const maxPs: Array<Primitive> = mps.length > nps.length ? mps : nps
	let inter: boolean = false
	minPs.some((p1: Primitive): boolean => {
		maxPs.some((p2: Primitive): boolean => {
			inter = intersPP(p1, p2) > 0
			return inter
		})
		return inter
	})
	return inter
}

export function intersPy(m: Primitive, y: number): number {
	if (m instanceof Line) {
		return intersLy(m, y)
	}
	if (m instanceof Arc) {
		return intersAy(m, y)
	}
	return 0
}

export function intersLy(line: Line, y: number): number {
	const bbox2: BBox2 = line.bbox2
	if (bbox2.isContainsY(y)) {
		const nl: Line = new Line(new Vector2(bbox2.minX - 1, y), new Vector2(bbox2.maxX + 1, y))
		if (intersLL(nl, line) > 0) {
			return 1
		}
		return 0
	}
	return 0
}

export function intersAy(arc: Arc, y: number): number {
	if (arc.rx === arc.ry) {
		const bbox2: BBox2 = arc.bbox2
		if (bbox2.isContainsY(y)) {
			const nl: Line = new Line(new Vector2(bbox2.minX - 1, y), new Vector2(bbox2.maxX + 1, y))
			const idx: number = intersRegularArcLine(arc, nl)
			if (idx > 0) {
				return 1
			}
			return 0
		}
		return 0
	}
	throw new Error(`not supported ops.`)
}

export function intersArcY(arc: Arc, y: number): number {
	if (arc.rx === arc.ry) {
		const bbox2: BBox2 = arc.bbox2
		if (bbox2.isContainsY(y)) {
			const nl: Line = new Line(new Vector2(bbox2.minX - 1, y), new Vector2(bbox2.maxX + 1, y))
			const idx: number = intersRegularArcLine(arc, nl)
			if (idx > 0) {
				return idx
			}
			return 0
		}
		return 0
	}
	throw new Error(`not supported ops.`)
}

/**
 * 获取线段 1 与线段 2 的交点个数
 */
export function intersLL(m: Line, n: Line): number {
	if (m.isPoint1()) {
		return intersLP(n, m.startPoint)
	}
	if (n.isPoint1()) {
		return intersLP(m, n.startPoint)
	}
	const inters: BBox2 = fastIntersectionDetection(m, n)
	if (inters === null) {
		return 0
	}
	const x1: number = m.startPoint.x
	const y1: number = m.startPoint.y
	const x2: number = m.endPoint.x
	const y2: number = m.endPoint.y
	const x3: number = n.startPoint.x
	const y3: number = n.startPoint.y
	const x4: number = n.endPoint.x
	const y4: number = n.endPoint.y
	/**
	 * 向量叉积 判断线段 n(p3-p4) 是否跨越线段 m(p1, p2)
	 */
	const cross1: number = Vector2.crossProd2(x1, y1, x3, y3, x4, y4)
	const cross2: number = Vector2.crossProd2(x2, y2, x3, y3, x4, y4)
	if (cross1 * cross2 > 0 && !DoubleKit.eq(cross1, 0) && !DoubleKit.eq(cross2, 0)) {
		return 0
	}
	/**
	 * 向量叉积 判断线段 m(p1, p2) 是否跨越线段 n(p3-p4)
	 */
	const cross3: number = Vector2.crossProd2(x3, y3, x1, y1, x2, y2)
	const cross4: number = Vector2.crossProd2(x4, y4, x1, y1, x2, y2)
	if (cross3 * cross4 > 0 && !DoubleKit.eq(cross3, 0) && !DoubleKit.eq(cross4, 0)) {
		return 0
	}
	let idx: number = 0
	if (DoubleKit.eq(cross1, 0) && DoubleKit.eq(cross2, 0)) {
		/**
		 * 两线段重合
		 **/
		if (DoubleKit.eq(inters.width, 0)) {
			if (DoubleKit.eq(inters.height, 0)) {
				CACHE[idx++] = inters.leftUp.x
				CACHE[idx++] = inters.leftUp.y
			} else {
				CACHE[idx++] = inters.leftUp.x
				CACHE[idx++] = inters.leftUp.y
				CACHE[idx++] = inters.leftDown.x
				CACHE[idx++] = inters.leftDown.y
			}
		} else if (DoubleKit.eq(inters.height, 0)) {
			CACHE[idx++] = inters.leftUp.x
			CACHE[idx++] = inters.leftUp.y
			CACHE[idx++] = inters.rightUp.x
			CACHE[idx++] = inters.rightUp.y
		} else {
			const ulArea: number = Triangle.getArea(inters.leftUp, new Vector2(x3, y3), new Vector2(x4, y4))
			const urArea: number = Triangle.getArea(inters.rightUp, new Vector2(x3, y3), new Vector2(x4, y4))
			if (ulArea < urArea) {
				CACHE[idx++] = inters.leftUp.x
				CACHE[idx++] = inters.leftUp.y
				CACHE[idx++] = inters.rightDown.x
				CACHE[idx++] = inters.rightDown.y
			} else {
				CACHE[idx++] = inters.rightUp.x
				CACHE[idx++] = inters.rightUp.y
				CACHE[idx++] = inters.leftDown.x
				CACHE[idx++] = inters.leftDown.y
			}
		}
	} else if (DoubleKit.eq(cross1, 0)) {
		/**
		 * 在线段端点相交
		 **/
		if (inters.isContainsPoint(new Vector2(x1, y1))) {
			CACHE[idx++] = x1
			CACHE[idx++] = y1
		}
	} else if (DoubleKit.eq(cross2, 0)) {
		/**
		 * 在线段端点相交
		 **/
		if (inters.isContainsPoint(new Vector2(x2, y2))) {
			CACHE[idx++] = x2
			CACHE[idx++] = y2
		}
	} else {
		/**
		 * 线段不重合且不在端点相交
		 * 		参数方程求线段交点
		 * 			cross1 = (x3 - x1) * (y4 - y3) - (x4 - x3) * (y3 - y1)
		 * 			cross2 = (x3 - x2) * (y4 - y3) - (x4 - x3) * (y3 - y2)
		 **/
		const t0: number = Math.abs(((x4 - x3) * (y3 - y1) - (y4 - y3) * (x3 - x1)) / ((y2 - y1) * (x4 - x3) - (x2 - x1) * (y4 - y3)))
		const t: number = Math.abs(cross1 / (cross1 - cross2))
		const _x: number = x1 + (x2 - x1) * t
		const _y: number = y1 + (y2 - y1) * t
		if (inters.isContainsPoint(new Vector2(_x, _y))) {
			CACHE[idx++] = _x
			CACHE[idx++] = _y
		}
	}
	return idx
}

/**
 * 判断点 P 是否在线段 L 上
 */
export function intersLP(l: Line, p: Vector2): number {
	if (!l.bbox2.extendByDist(1e-8).isContainsPoint(p)) {
		/**
		 * 排除以线段为对角线的矩形之外的点
		 **/
		return 0
	}
	if (l.isPoint1()) {
		if (p.equalsWithVector2(l.startPoint)) {
			CACHE[0] = p.x
			CACHE[1] = p.y
			return 2
		}
		return 0
	}
	if (DoubleKit.eq(Triangle.getArea(l.startPoint, l.endPoint, p), 0)) {
		/**
		 * 线段 L 的两个端点 A, B 与点 P 共线且 P 处于以该线段为对角线的矩形之内, 则 P 在线段 L 上
		 **/
		CACHE[0] = p.x
		CACHE[1] = p.y
		return 2
	}
	return 0
}

/**
 * 获取圆弧 A 与线段 L 的交点
 */
export function intersAL(m: Arc, n: Line): number {
	if (m.rx === m.ry) {
		return intersRegularArcLine(m, n)
	}
	throw new Error(`not supportes ops.`)
}

/**
 * 获取圆弧 A 与线段 L (包含延长线)的交点
 */
export function intersExtendAL(m: Arc, n: Line): number {
	if (m.rx === m.ry) {
		return intersExtendRegularArcLine(m, n)
	}
	throw new Error(`not supportes ops.`)
}

/**
 * 获取圆弧 A1 与圆弧 A2 的交点
 */
export function intersAA(arc1: Arc, arc2: Arc): number {
	const inters: BBox2 = arc1.bbox2.getIntersection(arc2.bbox2)
	if (inters === null) {
		return 0
	}
	if (arc1.rx === arc1.ry && arc2.rx === arc2.ry) {
		return inters1(arc1, arc2)
	}
	throw new Error(`not supportes ops.`)
}
