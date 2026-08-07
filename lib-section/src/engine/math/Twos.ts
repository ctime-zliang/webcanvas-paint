/**
 * Veltkamp 分裂常数 (Splitter)
 * 		SPLITTER = 2^27 + 1 = 134217729
 *
 * 用于将一个 53-bit 尾数的双精度浮点数分裂为两个不超过 26-bit 尾数的部分
 *
 * 		取值 2^27, 即 53 = 26 + 27, 分裂后:
 *   		- 高位部分 (ahi) 有 ≤ 26 位有效数字
 *   		- 低位部分 (alo) 有 ≤ 26 位有效数字
 * 		即 ahi * bhi 的乘积最多 52 位, 可以被双精度精确表示
 *
 * 案例:
 *   a = 1.0000000000000002 (即 1 + 2^-52)
 *   c = SPLITTER * a
 *   经过分裂后 ahi ≈ 1.0, alo ≈ 2^-52
 */
const SPLITTER: number = +(Math.pow(2, 27) + 1.0)

export class Twos {
	/**
	 * Two-Product (精确乘法) Dekker 算法
	 *
	 * 将浮点乘法 a * b 精确表示为两个浮点数之和:
	 *   	a * b = x + y (数学精确等式)
	 * 		其中
	 * 			x = fl(a * b) 是标准浮点乘法结果
	 * 			y 是被舍去的误差
	 *
	 * 案例:
	 * 		a = 3.0, b = 7.0
	 *   		x = 21.0(精确, 无舍入)
	 *   		y = 0.0
	 *   	返回 [0, 21]
	 *
	 * 案例:
	 * 		a = 1e15 + 1, b = 1e15 + 1
	 *   		x = fl((1e15+1)²) ≈ 1e30 (丢失低位信息)
	 *   		y = 精确值 - x = 被丢弃的低位部分
	 *   	返回 [y, x], 其中 y + x = (1e15 + 1)² 精确
	 *
	 * 案例:
	 *   	计算向量叉积 (b.x - a.x) * (c.y - a.y) 时, 若坐标接近, 差值很小但乘积可能丢精度
	 *   	Two-Product 保证不丢失任何位
	 */
	public static twoProduct(a: number, b: number, result: Array<number> = null!): Array<number> {
		/**
		 * 标准浮点乘法(高位结果)
		 */
		const x: number = a * b
		/**
		 * 将 a 分裂为 ahi + alo
		 **/
		/**
		 * 将 a 分为高位和低位, 即将 a 乘以 2^27 + 1, 制造溢出
		 * 		a * (2^27 + 1), 强制高位对齐
		 */
		const c: number = SPLITTER * a
		const abig: number = c - a
		/**
		 * 取 a 的高 26 位部分
		 */
		const ahi: number = c - abig
		/**
		 * 取 a 的低 26 位(精确, 因为 a = ahi + alo)
		 */
		const alo: number = a - ahi
		/**
		 * 将 b 分裂为 bhi + blo
		 **/
		const d: number = SPLITTER * b
		const bbig: number = d - b
		const bhi: number = d - bbig
		const blo: number = b - bhi
		/**
		 * 误差恢复: 逐步减去各部分乘积
		 **/
		/**
		 * 浮点乘法结果(53位精度, 有舍入)
		 * a * b = (ahi + alo) * (bhi + blo) = ahi * bhi + ahi * blo + alo * bhi + alo * blo
		 */
		/**
		 * 减去 高 × 高(精确, ≤52位)
		 */
		const err1: number = x - ahi * bhi
		/**
		 * 减去 低 × 高
		 */
		const err2: number = err1 - alo * bhi
		/**
		 * 减去 高 × 低
		 */
		const err3: number = err2 - ahi * blo
		/**
		 * 低 × 低 - 剩余 = 总舍入误差(低位)
		 */
		const y: number = alo * blo - err3
		if (result) {
			result[0] = y
			result[1] = x
			return result
		}
		return [y, x]
	}

	/**
	 * Two-Sum (精确加法) Knuth / Møller 算法
	 *
	 * 将浮点加法 a + b 精确表示为两个浮点数之和:
	 *   	a + b = x + y  (数学精确等式)
	 * 			其中
	 * 				x = fl(a + b) 是标准浮点加法结果
	 * 				y 是被舍去的误差
	 *
	 * 当计算 x = a + b 时, 如果 a 和 b 的指数差距较大, 较小数的低位会被"挤出" 53 位尾数而丢失
	 * 			bv = x - a 试图从 x 中"恢复" b, 但由于 x 已经舍入,  bv 只是 b 的近似值
	 * 			br = b - bv 就是 b 中被丢弃的部分
	 * 			ar = a - av 是 a 中被丢弃的部分
	 * 		y = ar + br 把两个被丢弃的部分加起来就是总误差
	 *
	 * 案例:
	 * 		a = 1.0, b = 2^-53 (最小 epsilon)
	 *   		x  = 1.0 + 2^-53 = 1.0000000000000002 (精确, 恰好可表示)
	 *   		bv = x - 1.0 = 2^-53
	 *   		av = x - 2^-53 = 1.0
	 *   		br = 2^-53 - 2^-53 = 0
	 *   		ar = 1.0 - 1.0 = 0
	 *   		y  = 0 (无误差)
	 *   	返回 [0, 1.0000000000000002]
	 *
	 * 案例:
	 * 		a = 1.0, b = 2^-54 (比 epsilon 还小)
	 *   		x  = 1.0 (舍入后 b 被完全吞掉)
	 *   		bv = 1.0 - 1.0 = 0
	 *   		av = 1.0 - 0 = 1.0
	 *   		br = 2^-54 - 0 = 2^-54
	 *   		ar = 1.0 - 1.0 = 0
	 *   		y  = 2^-54 (误差就是被吞掉的 b)
	 *   		返回 [2^-54, 1.0]
	 *   	验证: 2^-54 + 1.0 = 1.0 + 2^-54
	 *
	 * 案例:
	 *   	在扩展精度算术中, 多个 Two-Sum 串联起来,  每一步的误差 y 都被保存下来, 最终所有分量的和, 就是精确结果
	 */
	public static twoSum(a: number, b: number, result: Array<number> = null!): Array<number> {
		/**
		 * 标准浮点加法(高位结果), 可能有舍入
		 */
		const x: number = a + b
		/**
		 * "虚拟的 b": 从结果中恢复 b 的近似值
		 * 		恢复 b 的"虚拟值": 如果 x 没有舍入, bv 就等于 b
		 */
		const bv: number = x - a
		/**
		 * "虚拟的 a": 从结果中恢复 a 的近似值
		 * 		恢复 a 的"虚拟值": 如果 x 没有舍入, av 就等于 a
		 */
		const av: number = x - bv
		/**
		 * b 的舍入残差: b 中被丢弃的部分
		 */
		const br: number = b - bv
		/**
		 * a 的舍入残差: a 中被丢弃的部分
		 */
		const ar: number = a - av
		/**
		 * 总误差 = 两个残差之和
		 */
		if (result) {
			result[0] = ar + br
			result[1] = x
			return result
		}
		return [ar + br, x]
	}
}
