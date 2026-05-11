import { CanvasMatrix4 } from '../../engine/algorithm/geometry/matrix/CanvasMatrix4'
import { Matrix4 } from '../../engine/algorithm/geometry/matrix/Matrix4'
import { Vector2 } from '../../engine/algorithm/geometry/vector/Vector2'
import { Vector3 } from '../../engine/algorithm/geometry/vector/Vector3'

function isPointInRect(rectPoints: Array<Vector2>, point: Vector2): boolean {
	let sign: number = 0
	for (let i: number = 0; i < 4; i++) {
		const a: Vector2 = rectPoints[i]
		const b: Vector2 = rectPoints[(i + 1) % 4]
		const cross: number = (b.x - a.x) * (point.y - a.y) - (b.y - a.y) * (point.x - a.x)
		if (cross !== 0) {
			const s: number = Math.sign(cross)
			if (sign === 0) {
				sign = s
				continue
			}
			if (sign !== s) {
				return false
			}
		}
	}
	return true
}

function lineIntersection(p1: Vector2, d1: Vector2, p2: Vector2, d2: Vector2): Vector2 {
	const cross: number = d1.x * d2.y - d1.y * d2.x
	const t: number = ((p2.x - p1.x) * d2.y - (p2.y - p1.y) * d2.x) / cross
	return new Vector2(p1.x + d1.x * t, p1.y + d1.y * t)
}

export class D2RectToolkit {
	public static rotationTranslate(
		newRotation: number,
		oldRotation: number,
		leftUp: Vector2,
		rightUp: Vector2,
		leftDown: Vector2,
		rightDown: Vector2
	): {
		rotation: number
		maxtrix4: Matrix4
	} {
		const rotation: number = newRotation % (Math.PI * 2)
		const effectMatrix: Matrix4 = CanvasMatrix4.setRotationByLine(
			rotation - oldRotation,
			new Vector3((leftUp.x + leftDown.x + rightUp.x + rightDown.x) / 4, (leftUp.y + leftDown.y + rightUp.y + rightDown.y) / 4, 0),
			new Vector3((leftUp.x + leftDown.x + rightUp.x + rightDown.x) / 4, (leftUp.y + leftDown.y + rightUp.y + rightDown.y) / 4, 1)
		)
		return {
			rotation,
			maxtrix4: effectMatrix,
		}
	}

	public static flipXTranslate(
		leftUp: Vector2,
		rightUp: Vector2,
		leftDown: Vector2,
		rightDown: Vector2
	): {
		maxtrix4: Matrix4
	} {
		const effectMatrix: Matrix4 = CanvasMatrix4.setFlipByLine(
			leftUp.add(rightUp).mul(0.5).toVector3(0),
			leftDown.add(rightDown).mul(0.5).toVector3(0)
		)
		return {
			maxtrix4: effectMatrix,
		}
	}

	public static flipYTranslate(
		leftUp: Vector2,
		rightUp: Vector2,
		leftDown: Vector2,
		rightDown: Vector2
	): {
		maxtrix4: Matrix4
	} {
		const effectMatrix: Matrix4 = CanvasMatrix4.setFlipByLine(
			leftUp.add(leftDown).mul(0.5).toVector3(0),
			rightUp.add(rightDown).mul(0.5).toVector3(0)
		)
		return {
			maxtrix4: effectMatrix,
		}
	}

	/**
	 * 判断点 point 是否处于矩形(由 rectPoints 构成的矩形)内部
	 */
	public static isPointOnRect(rectPoints: Array<Vector2>, cornerRadius: number, point: Vector2): boolean {
		if (rectPoints.length !== 4) {
			throw new Error('rect must have 4 points')
		}
		if (cornerRadius <= 0) {
			return isPointInRect(rectPoints, point)
		}
		const insetRect: Array<Vector2> = []
		for (let i: number = 0; i < 4; i++) {
			const [prev, cur, next]: [Vector2, Vector2, Vector2] = [rectPoints[(i + 3) % 4], rectPoints[i], rectPoints[(i + 1) % 4]]
			const [v1, v2]: [Vector2, Vector2] = [new Vector2(cur.x - prev.x, cur.y - prev.y), new Vector2(next.x - cur.x, next.y - cur.y)]
			const [n1, n2]: [Vector2, Vector2] = [new Vector2(-v1.y, v1.x).normalize(), new Vector2(-v2.y, v2.x).normalize()]
			const [p1, p2]: [Vector2, Vector2] = [
				new Vector2(cur.x + n1.x * cornerRadius, cur.y + n1.y * cornerRadius),
				new Vector2(cur.x + n2.x * cornerRadius, cur.y + n2.y * cornerRadius),
			]
			insetRect.push(lineIntersection(p1, v1, p2, v2))
		}
		if (isPointInRect(insetRect, point)) {
			return true
		}
		for (const v of rectPoints) {
			const dx: number = point.x - v.x
			const dy: number = point.y - v.y
			if (dx * dx + dy * dy <= cornerRadius * cornerRadius) {
				return true
			}
		}
		return false
	}
}
