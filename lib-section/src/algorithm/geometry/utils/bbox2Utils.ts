import { BBox2 } from '../../../engine/algorithm/geometry/bbox/BBox2'
import { Vector2 } from '../../../engine/algorithm/geometry/vector/Vector2'

export function createD2LineBbox2(startPoint: Vector2, endPoint: Vector2, strokeWidth: number): BBox2 {
	const halfStrokeWidth: number = strokeWidth * 0.5
	const minX: number = Math.min(startPoint.x, endPoint.x) - halfStrokeWidth
	const minY: number = Math.min(startPoint.y, endPoint.y) - halfStrokeWidth
	const maxX: number = Math.max(startPoint.x, endPoint.x) + halfStrokeWidth
	const maxY: number = Math.max(startPoint.y, endPoint.y) + halfStrokeWidth
	return new BBox2(minX, minY, maxX, maxY)
}

export function createD2CircleBbox2(centerPoint: Vector2, radius: number, skrokeWidth: number): BBox2 {
	const halfStrokeWidth: number = radius + skrokeWidth * 0.5
	const minX: number = centerPoint.x - halfStrokeWidth
	const minY: number = centerPoint.y - halfStrokeWidth
	const maxX: number = centerPoint.x + halfStrokeWidth
	const maxY: number = centerPoint.y + halfStrokeWidth
	return new BBox2(minX, minY, maxX, maxY)
}

export function createD2PointBbox2(centerPoint: Vector2, radius: number): BBox2 {
	const halfStrokeWidth: number = radius
	const minX: number = centerPoint.x - halfStrokeWidth
	const minY: number = centerPoint.y - halfStrokeWidth
	const maxX: number = centerPoint.x + halfStrokeWidth
	const maxY: number = centerPoint.y + halfStrokeWidth
	return new BBox2(minX, minY, maxX, maxY)
}

export function createD2ArcBbox2(centerPoint: Vector2, radius: number, skrokeWidth: number): BBox2 {
	const halfStrokeWidth: number = radius + skrokeWidth * 0.5
	const minX: number = centerPoint.x - halfStrokeWidth
	const minY: number = centerPoint.y - halfStrokeWidth
	const maxX: number = centerPoint.x + halfStrokeWidth
	const maxY: number = centerPoint.y + halfStrokeWidth
	return new BBox2(minX, minY, maxX, maxY)
}

export function createD2ImageBbox2(position: Vector2, width: number, height: number): BBox2 {
	const minX: number = position.x
	const minY: number = position.y - height
	const maxX: number = position.x + width
	const maxY: number = position.y
	return new BBox2(minX, minY, maxX, maxY)
}

export function createD2RectBbox2(position: Vector2, strokeWidth: number, width: number, height: number): BBox2 {
	const halfStrokeWidth: number = strokeWidth * 0.5
	const sia: number = width >= 0 ? 1 : -1
	const sib: number = height >= 0 ? 1 : -1
	const minX: number = position.x - sia * halfStrokeWidth
	const minY: number = position.y - sib * halfStrokeWidth - height
	const maxX: number = position.x + sia * halfStrokeWidth + width
	const maxY: number = position.y + sib * halfStrokeWidth
	return new BBox2(minX, minY, maxX, maxY)
}
