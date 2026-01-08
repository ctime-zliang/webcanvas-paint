import { BBox2, BBox2Fac } from '../../../engine/algorithm/geometry/bbox/BBox2'
import { Matrix4 } from '../../../engine/algorithm/geometry/matrix/Matrix4'
import { Vector2 } from '../../../engine/algorithm/geometry/vector/Vector2'
import { ESweep } from '../../../engine/config/CommonProfile'
import { Angles } from '../../../engine/math/Angles'
import { Arc } from '../primitives/Arc'

function getBox(v1: Vector2, v2: Vector2): [number, number, number, number] {
	const minX: number = Math.min(v1.x, v2.x)
	let maxX: number = Math.max(v1.x, v2.x)
	let minY: number = Math.min(v1.y, v2.y)
	const maxY: number = Math.max(v1.y, v2.y)
	if (maxX - minX < 0.01) {
		maxX = minX + 0.01
	}
	if (maxY - minY < 0.01) {
		minY = maxY + 0.01
	}
	return [minX, minY, maxX, maxY]
}

export function getRectLeftLow(position: Vector2, height: number, rotation: number): Vector2 {
	const matrix4: Matrix4 = Matrix4.rotateZForPoint(position, rotation)
	return new Vector2(position.x, position.y - height).multiplyMatrix4(matrix4)
}

export function setRectLeftLow(
	value: Vector2,
	position: Vector2,
	width: number,
	rotation: number
): {
	position: Vector2
	width: number
	height: number
} {
	const result: {
		position: Vector2
		width: number
		height: number
	} = {
		position: null!,
		width: undefined!,
		height: undefined!,
	}
	const matrix4_1: Matrix4 = Matrix4.rotateZForPoint(position, -rotation)
	const matrix4_2: Matrix4 = Matrix4.rotateZForPoint(position, rotation)
	const leftLow: Vector2 = value.multiplyMatrix4(matrix4_1)
	const box: [number, number, number, number] = getBox(leftLow, new Vector2(position.x + width, position.y))
	const newPosition: Vector2 = new Vector2(box[0], box[3]).multiplyMatrix4(matrix4_2)
	const newWidth: number = Math.abs(box[2 - box[0]])
	const newHeight: number = Math.abs(box[3] - box[1])
	result.position = newPosition
	result.width = newWidth
	result.height = newHeight
	return result
}

export function getRectLeftUp(position: Vector2): Vector2 {
	return position
}
export function setRectLeftUP(
	value: Vector2,
	position: Vector2,
	width: number,
	height: number,
	rotation: number
): {
	position: Vector2
	width: number
	height: number
} {
	const result: {
		position: Vector2
		width: number
		height: number
	} = {
		position: null!,
		width: undefined!,
		height: undefined!,
	}
	const matrix4_1: Matrix4 = Matrix4.rotateZForPoint(position, -rotation)
	const matrix4_2: Matrix4 = Matrix4.rotateZForPoint(position, rotation)
	const leftUp: Vector2 = value.multiplyMatrix4(matrix4_1)
	const box: [number, number, number, number] = getBox(leftUp, new Vector2(position.x + width, position.y - height))
	const newPosition: Vector2 = new Vector2(box[0], box[3]).multiplyMatrix4(matrix4_2)
	const newWidth: number = Math.abs(box[2 - box[0]])
	const newHeight: number = Math.abs(box[3] - box[1])
	result.position = newPosition
	result.width = newWidth
	result.height = newHeight
	return result
}

export function getRectRightLow(position: Vector2, width: number, height: number, rotation: number): Vector2 {
	const matrix4: Matrix4 = Matrix4.rotateZForPoint(position, rotation)
	return new Vector2(position.x + width, position.y - height).multiplyMatrix4(matrix4)
}
export function setRectRightLow(
	value: Vector2,
	position: Vector2,
	rotation: number
): {
	position: Vector2
	width: number
	height: number
} {
	const result: {
		position: Vector2
		width: number
		height: number
	} = {
		position: null!,
		width: undefined!,
		height: undefined!,
	}
	const matrix4_1: Matrix4 = Matrix4.rotateZForPoint(position, -rotation)
	const matrix4_2: Matrix4 = Matrix4.rotateZForPoint(position, rotation)
	const rightLow: Vector2 = value.multiplyMatrix4(matrix4_1)
	const box: [number, number, number, number] = getBox(rightLow, position)
	const newPosition: Vector2 = new Vector2(box[0], box[3]).multiplyMatrix4(matrix4_2)
	const newWidth: number = Math.abs(box[2 - box[0]])
	const newHeight: number = Math.abs(box[3] - box[1])
	result.position = newPosition
	result.width = newWidth
	result.height = newHeight
	return result
}

export function getRectRightUp(position: Vector2, width: number, rotation: number): Vector2 {
	const matrix4: Matrix4 = Matrix4.rotateZForPoint(position, rotation)
	return new Vector2(position.x + width, position.y).multiplyMatrix4(matrix4)
}
export function setRectRightUp(
	value: Vector2,
	position: Vector2,
	height: number,
	rotation: number
): {
	position: Vector2
	width: number
	height: number
} {
	const result: {
		position: Vector2
		width: number
		height: number
	} = {
		position: null!,
		width: undefined!,
		height: undefined!,
	}
	const matrix4_1: Matrix4 = Matrix4.rotateZForPoint(position, -rotation)
	const matrix4_2: Matrix4 = Matrix4.rotateZForPoint(position, rotation)
	const rightUp: Vector2 = value.multiplyMatrix4(matrix4_1)
	const box: [number, number, number, number] = getBox(rightUp, new Vector2(position.x, position.y - height))
	const newPosition: Vector2 = new Vector2(box[0], box[3]).multiplyMatrix4(matrix4_2)
	const newWidth: number = Math.abs(box[2 - box[0]])
	const newHeight: number = Math.abs(box[3] - box[1])
	result.position = newPosition
	result.width = newWidth
	result.height = newHeight
	return result
}

export function rotationRect(
	center: Vector2,
	angle: number,
	oldRotation: number,
	oldStartPoint: Vector2,
	oldRightLow: Vector2
): {
	startPoint: Vector2
	rotation: number
} {
	const result: {
		startPoint: Vector2
		rotation: number
	} = {
		startPoint: null!,
		rotation: undefined!,
	}
	const matrix4: Matrix4 = Matrix4.rotateZForPoint(center, angle)
	let rightLow: Vector2 = oldRightLow
	const startPoint: Vector2 = oldStartPoint.multiplyMatrix4(matrix4)
	rightLow = rightLow.multiplyMatrix4(matrix4)
	const newRotation: number = Vector2.caculateAngle(oldRotation, matrix4) % Math.PI
	const matrix4_1: Matrix4 = Matrix4.translate(-startPoint.x, -startPoint.y, 0).rotateZ(-newRotation)
	const matrix4_2: Matrix4 = Matrix4.rotateZ(newRotation).translate(startPoint.x, startPoint.y, 0)
	const bbox2Fac: BBox2Fac = new BBox2Fac()
	bbox2Fac.extendByVector2(startPoint.multiplyMatrix4(matrix4_1)).extendByVector2(rightLow.multiplyMatrix4(matrix4_1))
	const bbox2: BBox2 = bbox2Fac.build()
	result.startPoint = bbox2.leftUp.multiplyMatrix4(matrix4_2)
	result.rotation = newRotation
	return result
}

export function getRectCornerArcs(
	width: number,
	height: number,
	leftUp: Vector2,
	leftLow: Vector2,
	rightUp: Vector2,
	rightLow: Vector2,
	radius: number
): Array<Arc> {
	const arcs: Array<Arc> = []
	if (radius <= 0) {
		return arcs
	}
	const realCornerRadius: number = Math.min(width / 2, height / 2, radius)
	const horizontal: Vector2 = rightLow.sub(leftLow).normalize()
	const vertical: Vector2 = leftUp.sub(leftLow).normalize()
	const p1: Vector2 = leftLow.add(horizontal.mul(realCornerRadius))
	const p2: Vector2 = rightLow.add(horizontal.mul(-realCornerRadius))
	const p3: Vector2 = rightLow.add(vertical.mul(realCornerRadius))
	const p4: Vector2 = rightUp.add(vertical.mul(-realCornerRadius))
	const p5: Vector2 = rightUp.add(horizontal.mul(-realCornerRadius))
	const p6: Vector2 = leftUp.add(horizontal.mul(realCornerRadius))
	const p7: Vector2 = leftUp.add(vertical.mul(-realCornerRadius))
	const p8: Vector2 = leftLow.add(vertical.mul(realCornerRadius))
	const c1: Vector2 = p1.add(vertical.mul(realCornerRadius))
	const c2: Vector2 = p3.add(horizontal.mul(-realCornerRadius))
	const c3: Vector2 = p5.add(vertical.mul(-realCornerRadius))
	const c4: Vector2 = p7.add(horizontal.mul(realCornerRadius))
	const ps: Array<Vector2> = [p8, p1, p2, p3, p4, p5, p6, p7]
	const cs: Array<Vector2> = [c1, c2, c3, c4]
	for (let i: number = 0; i < cs.length; i++) {
		const c: Vector2 = cs[i]
		arcs.push(
			Arc.build2(
				c,
				Angles.radianToDegree(ps[i * 2].getRadianByVector2(c)),
				Angles.radianToDegree(ps[i * 2 + 1].getRadianByVector2(c)),
				realCornerRadius,
				realCornerRadius,
				ESweep.CCW
			)
		)
	}
	return arcs
}

export function getRectArcCenters(
	width: number,
	height: number,
	leftUp: Vector2,
	leftLow: Vector2,
	rightUp: Vector2,
	rightLow: Vector2,
	radius: number
): Array<Vector2> {
	const centerPoints: Array<Vector2> = []
	if (radius <= 0) {
		return centerPoints
	}
	const realCornerRadius: number = Math.min(width / 2, height / 2, radius)
	const horizontal: Vector2 = rightLow.sub(leftLow).normalize()
	const vertical: Vector2 = leftUp.sub(leftLow).normalize()
	const p1: Vector2 = leftLow.add(horizontal.mul(realCornerRadius))
	const p2: Vector2 = rightLow.add(horizontal.mul(realCornerRadius))
	const p3: Vector2 = rightLow.add(vertical.mul(-realCornerRadius))
	const p4: Vector2 = rightUp.add(vertical.mul(-realCornerRadius))
	const c1: Vector2 = p1.add(vertical.mul(realCornerRadius))
	const c2: Vector2 = p2.add(horizontal.mul(-realCornerRadius))
	const c3: Vector2 = p3.add(vertical.mul(-realCornerRadius))
	const c4: Vector2 = p4.add(horizontal.mul(realCornerRadius))
	centerPoints.push(c1, c2, c3, c4)
	return centerPoints
}
