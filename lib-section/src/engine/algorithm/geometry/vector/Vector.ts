export abstract class Vector {
	/**
	 * 计算由水平线段 deltaX 和垂直线段 deltaY 所构成的斜边长度
	 */
	public static hypot(deltaX: number, deltaY: number): number {
		let xs: number = Math.abs(deltaX)
		let ys: number = Math.abs(deltaY)
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

	/**
	 * 计算平面上坐标点 P1(x1, y1) 和 P2(x2, y2) 的距离
	 * */
	public static distance(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
		return this.hypot(p2.x - p1.x, p2.y - p1.y)
	}

	public abstract toArray(): Array<number>
}
