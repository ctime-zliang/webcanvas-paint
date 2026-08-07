export abstract class Vector {
	/**
	 * 计算由水平线段 deltaX 和垂直线段 deltaY 所构成的斜边长度(勾股定理)
	 *
	 * 算法说明 - 防溢出的 hypot 实现:
	 * 		- 直接计算 sqrt(x² + y²) 在 x 或 y 极大时可能产生中间溢出
	 * 		- 此实现使用等价变换避免溢出:
	 *   		hypot(x, y) = max(|x|, |y|) · sqrt(1 + (min / max)²)
	 *
	 * 由于 min / max ∈ [0, 1], 平方后仍在安全范围内
	 */
	public static hypot(deltaX: number, deltaY: number): number {
		let [xs, ys]: [number, number] = [Math.abs(deltaX), Math.abs(deltaY)]
		if (ys > xs) {
			const swap = ys
			ys = xs
			xs = swap
		}
		if (xs === 0) {
			return ys
		}
		const t: number = ys / xs
		return xs * Math.sqrt(1 + t * t)
	}

	public static distance(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
		return this.hypot(p2.x - p1.x, p2.y - p1.y)
	}

	public abstract toArray(): Array<number>
}
