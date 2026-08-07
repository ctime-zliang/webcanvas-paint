export class LogicMathe {
	/**
	 * 符号函数 - 返回数值的符号标志
	 *
	 * 数学定义:
	 *        		 ┌  1   if value > 0
	 *   	sgn(x) = │  0   if value = 0
	 *        		 └ -1   if value < 0
	 *
	 * 	与 Math.sign() 的区别:
	 *   	- Math.sign(NaN) = NaN, 本实现中 NaN > 0 为 false, NaN === 0 为 false, 返回 -1
	 *   	- Math.sign(-0) = -0, 本实现中 -0 === 0 为 true, 返回 0
	 *  	- Math.sign(Infinity) = 1, 本实现中 Infinity > 0 为 true, 返回 1
	 *
	 * 	潜在问题:
	 *   	- 对于 NaN 输入, 返回 -1 而非 NaN, 可能导致静默错误
	 *   	- 如果严格需求建议改用 Math.sign() 或加 NaN 检查
	 */
	public static sign(value: number): number {
		if (value > 0) {
			return 1
		}
		if (value === 0) {
			return 0
		}
		return -1
	}
}
