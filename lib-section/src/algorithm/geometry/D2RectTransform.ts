import { BBox2 } from '../../engine/algorithm/geometry/bbox/BBox2'
import { CanvasMatrix4 } from '../../engine/algorithm/geometry/matrix/CanvasMatrix4'
import { Matrix4 } from '../../engine/algorithm/geometry/matrix/Matrix4'
import { Vector2 } from '../../engine/algorithm/geometry/vector/Vector2'
import { Vector3 } from '../../engine/algorithm/geometry/vector/Vector3'
import { BBox2Creator } from './utils/BBox2Creator'

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
		bbox2: BBox2
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
			bbox2: BBox2Creator.createD2ImageBbox2(leftUp, rightUp, leftDown, rightDown),
		}
	}

	static flipXTranslate(
		leftUp: Vector2,
		rightUp: Vector2,
		leftDown: Vector2,
		rightDown: Vector2
	): {
		maxtrix4: Matrix4
		bbox2: BBox2
	} {
		const effectMatrix: Matrix4 = CanvasMatrix4.setFlipByLine(
			new Vector3((leftUp.x + rightUp.x) / 2, (leftUp.y + rightUp.y) / 2, 0),
			new Vector3((leftDown.x + rightDown.x) / 2, (leftDown.y + rightDown.y) / 2, 1)
		)
		return {
			maxtrix4: effectMatrix,
			bbox2: BBox2Creator.createD2ImageBbox2(leftUp, rightUp, leftDown, rightDown),
		}
	}

	static flipYTranslate(
		leftUp: Vector2,
		rightUp: Vector2,
		leftDown: Vector2,
		rightDown: Vector2
	): {
		maxtrix4: Matrix4
		bbox2: BBox2
	} {
		const effectMatrix: Matrix4 = CanvasMatrix4.setFlipByLine(
			new Vector3((leftUp.x + leftDown.x) / 2, (leftUp.y + leftDown.y) / 2, 0),
			new Vector3((rightUp.x + rightDown.x) / 2, (rightUp.y + rightDown.y) / 2, 1)
		)
		return {
			maxtrix4: effectMatrix,
			bbox2: BBox2Creator.createD2ImageBbox2(leftUp, rightUp, leftDown, rightDown),
		}
	}
}
