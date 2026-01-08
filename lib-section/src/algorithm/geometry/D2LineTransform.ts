import { Vector2 } from '../../engine/algorithm/geometry/vector/Vector2'

export class D2LineTransform {
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

	/**
	 * 已知一段位移向量 moveDiffVector2, 求 moveDiffVector2 位移向量在 lineVector2 向量垂线方向上的投影向量
	 */
	static calculateVectorProjection(lineVector2: Vector2, moveDiffVector2: Vector2): Vector2 {
		/**
		 * 计算当前线段的垂线向量 B
		 * 计算当前的位移向量 A
		 * 计算向量 A 在向量 B 上的投影 C
		 */
		const perpendicular: { v1: Vector2; v2: Vector2 } = D2LineTransform.calculatePerpendicular(lineVector2)
		const B: Vector2 = perpendicular.v1
		const A: Vector2 = moveDiffVector2
		const C: Vector2 = new Vector2(
			((A.x * B.x + A.y * B.y) * B.x) / (B.x * B.x + B.y * B.y),
			((A.x * B.x + A.y * B.y) * B.y) / (B.x * B.x + B.y * B.y)
		)
		return C
	}
}
