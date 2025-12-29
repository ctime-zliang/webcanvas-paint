import { Vector2 } from '../../../engine/algorithm/geometry/vector/Vector2'

/**
 * 计算任意 Polygon 面积
 *      顶点列表按照顺时针或逆时针排序
 */
export function calcPolygonArea(points: Array<Vector2>): number {
	const len: number = points.length
	if (len <= 2) {
		return 0
	}
	let area: number = points[0].x * (points[len - 1].y - points[1].y)
	for (let i: number = 0; i < len - 1; i++) {
		area += points[i].x * (points[i - 1].y - points[i + 1].y)
	}
	area += points[len - 1].x * (points[len - 2].y - points[0].y)
	return Math.abs(area / 2.0)
}

/**
 * 计算任意 Polygon (带洞)面积
 */
export function calcPolygonsArea(points: Array<Array<Vector2>>): number {
	let len: number = points.length
	if (len <= 0) {
		return 0
	}
	let outlineArea: number = calcPolygonArea(points[0])
	for (let i: number = 1; i < len; i++) {
		outlineArea -= calcPolygonArea(points[i])
	}
	return outlineArea
}
