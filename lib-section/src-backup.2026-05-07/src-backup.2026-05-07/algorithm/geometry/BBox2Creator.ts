import { BBox2 } from '../../engine/algorithm/geometry/bbox/BBox2'
import { Vector2 } from '../../engine/algorithm/geometry/vector/Vector2'

export class BBox2Creator {
	public static createD2LineBbox2(startPoint: Vector2, endPoint: Vector2, strokeWidth: number): BBox2 {
		const halfStrokeWidth: number = strokeWidth * 0.5
		const minX: number = Math.min(startPoint.x, endPoint.x) - halfStrokeWidth
		const minY: number = Math.min(startPoint.y, endPoint.y) - halfStrokeWidth
		const maxX: number = Math.max(startPoint.x, endPoint.x) + halfStrokeWidth
		const maxY: number = Math.max(startPoint.y, endPoint.y) + halfStrokeWidth
		return new BBox2(minX, minY, maxX, maxY)
	}

	public static createD2CircleBbox2(centerPoint: Vector2, radius: number, skrokeWidth: number): BBox2 {
		const halfStrokeWidth: number = radius + skrokeWidth * 0.5
		const minX: number = centerPoint.x - halfStrokeWidth
		const minY: number = centerPoint.y - halfStrokeWidth
		const maxX: number = centerPoint.x + halfStrokeWidth
		const maxY: number = centerPoint.y + halfStrokeWidth
		return new BBox2(minX, minY, maxX, maxY)
	}

	public static createD2PointBbox2(centerPoint: Vector2, radius: number): BBox2 {
		const halfStrokeWidth: number = radius
		const minX: number = centerPoint.x - halfStrokeWidth
		const minY: number = centerPoint.y - halfStrokeWidth
		const maxX: number = centerPoint.x + halfStrokeWidth
		const maxY: number = centerPoint.y + halfStrokeWidth
		return new BBox2(minX, minY, maxX, maxY)
	}

	public static createD2ArcBbox2(centerPoint: Vector2, radius: number, skrokeWidth: number): BBox2 {
		const halfStrokeWidth: number = radius + skrokeWidth * 0.5
		const minX: number = centerPoint.x - halfStrokeWidth
		const minY: number = centerPoint.y - halfStrokeWidth
		const maxX: number = centerPoint.x + halfStrokeWidth
		const maxY: number = centerPoint.y + halfStrokeWidth
		return new BBox2(minX, minY, maxX, maxY)
	}

	public static createD2ImageBbox2(leftUp: Vector2, rightUp: Vector2, leftDown: Vector2, rightDown: Vector2): BBox2 {
		let [minX, maxX, minY, maxY]: [number, number, number, number] = [leftUp.x, leftUp.x, leftUp.y, leftUp.y]
		minX = Math.min(minX, leftUp.x, leftDown.x, rightUp.x, rightDown.x)
		maxX = Math.max(maxX, leftUp.x, leftDown.x, rightUp.x, rightDown.x)
		minY = Math.min(minY, leftUp.y, leftDown.y, rightUp.y, rightDown.y)
		maxY = Math.max(maxY, leftUp.y, leftDown.y, rightUp.y, rightDown.y)
		return new BBox2(minX, minY, maxX, maxY)
	}

	public static createD2RectBbox2(leftUp: Vector2, rightUp: Vector2, leftDown: Vector2, rightDown: Vector2): BBox2 {
		let [minX, maxX, minY, maxY]: [number, number, number, number] = [leftUp.x, leftUp.x, leftUp.y, leftUp.y]
		minX = Math.min(minX, leftUp.x, leftDown.x, rightUp.x, rightDown.x)
		maxX = Math.max(maxX, leftUp.x, leftDown.x, rightUp.x, rightDown.x)
		minY = Math.min(minY, leftUp.y, leftDown.y, rightUp.y, rightDown.y)
		maxY = Math.max(maxY, leftUp.y, leftDown.y, rightUp.y, rightDown.y)
		return new BBox2(minX, minY, maxX, maxY)
	}

	public static createD2TextBbox2(leftUp: Vector2, rightUp: Vector2, leftDown: Vector2, rightDown: Vector2): BBox2 {
		let [minX, maxX, minY, maxY]: [number, number, number, number] = [leftUp.x, leftUp.x, leftUp.y, leftUp.y]
		minX = Math.min(minX, leftUp.x, leftDown.x, rightUp.x, rightDown.x)
		maxX = Math.max(maxX, leftUp.x, leftDown.x, rightUp.x, rightDown.x)
		minY = Math.min(minY, leftUp.y, leftDown.y, rightUp.y, rightDown.y)
		maxY = Math.max(maxY, leftUp.y, leftDown.y, rightUp.y, rightDown.y)
		return new BBox2(minX, minY, maxX, maxY)
	}
}
