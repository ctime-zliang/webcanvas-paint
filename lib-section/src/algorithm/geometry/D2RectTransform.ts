import { CanvasMatrix4 } from '../../engine/algorithm/geometry/matrix/CanvasMatrix4'
import { Matrix4 } from '../../engine/algorithm/geometry/matrix/Matrix4'
import { Vector2 } from '../../engine/algorithm/geometry/vector/Vector2'
import { Vector3 } from '../../engine/algorithm/geometry/vector/Vector3'

export class D2RectTransform {
	static rotationTranslate(
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

	static flipXTranslate(
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

	static flipYTranslate(
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
}
