import { Vector2 } from '../../engine/algorithm/geometry/vector/Vector2'

export class D2LineTransitions {
	/**
	 * 计算向量的垂线向量(单位化)
	 */
	static calculatePerpendicular(vector2: Vector2): {
		v1: Vector2
		v2: Vector2
	} {
		const v1: Vector2 = new Vector2(-vector2.y, vector2.x)
		const v2: Vector2 = new Vector2(vector2.y, -vector2.x)
		const length: number = Math.sqrt(vector2.x * vector2.x + vector2.y * vector2.y)
		return {
			v1: new Vector2(v1.x / length, v1.y / length),
			v2: new Vector2(v2.x / length, v2.y / length),
		}
	}
}
