/**
 * 双精度浮点数工具类 - 基于 epsilon 容差的数值比较与运算
 *
 *   典型容差选择:
 *   	- 1e-6:  适用于图形渲染(屏幕分辨率约 1e6 级别)
 *   	- 1e-8:  适用于 CAD 等高精度场景(本类默认)
 *   	- 1e-10: 适用于数值分析中的"几乎为零"判断
 *
 *   regular 的精度 1e8 意味着保留到 8 位有效小数, 适合坐标规整化
 */
export class DoubleKit {
	/**
	 * 高精度容差: 1e-10, 用于判断"几乎为零"
	 */
	public static eps1: number = 1e-10
	/**
	 * 默认比较容差: 1e-8
	 */
	public static eps2: number = 1e-8
	/**
	 * 宽松容差: 1e-6, 用于图形级别的粗略比较
	 */
	public static eps3: number = 1e-6
	/**
	 * 规整化精度因子: 10^10 (保留 10 位小数)
	 */
	public static precision1: number = 1e10
	/**
	 * 备用精度因子: 10^8 (保留 8 位小数)
	 */
	public static precision2: number = 1e8

	/**
	 * 数值规整化 - 将浮点数精确到 8 位小数
	 *
	 * 算法:
	 * 		Math.round(dis * 1e8) / 1e8
	 * 等效于:
	 * 		保留 8 位有效小数, 四舍五入截断更低位
	 *
	 * 用途: 消除计算累积误差, 使坐标值"干净"
	 *
	 * 案例:
	 *   	- regular(1.00000000004)  // 1.0  (第 11 位被截断)
	 *   	- regular(3.141592653)  // 3.14159265  (保留 8 位)
	 *   	- regular(0)  // 0
	 */
	public static regular(dis: number = 0): number {
		return Math.round(dis * this.precision2) / this.precision2
	}

	/**
	 * 相等比较: |a - b| ≤ ε
	 */
	public static eq(a: number, b: number, eps: number = this.eps2): boolean {
		return Math.abs(a - b) <= eps
	}

	/**
	 * 不等比较: |a - b| > ε
	 */
	public static neq(a: number, b: number, eps: number = this.eps2): boolean {
		return Math.abs(a - b) > eps
	}

	/**
	 * 严格小于: a - b < -ε (即 a 确实比 b 小, 不是"差不多相等")
	 */
	public static less(a: number, b: number, eps: number = this.eps2): boolean {
		return a - b < -eps
	}

	/**
	 * 小于等于: a - b ≤ -ε
	 */
	public static lesseq(a: number, b: number, eps: number = this.eps2): boolean {
		return a - b <= -eps
	}

	/**
	 * 严格大于: a - b > ε (即 a 确实比 b 大)
	 */
	public static greater(a: number, b: number, eps: number = this.eps2): boolean {
		return a - b > eps
	}

	/**
	 * 大于等于: a - b ≥ ε
	 */
	public static greatereq(a: number, b: number, eps: number = this.eps2): boolean {
		return a - b >= eps
	}

	/**
	 * 安全平方根 - 处理浮点误差导致的微小负数
	 *
	 * 算法原理:
	 *   	- 在计算几何中, 理论上应为 0 或正数的值(如距离的平方)
	 *   	- 可能因浮点精度变成极小的负数(如 -1e-15)
	 *   	- Math.sqrt 对负数返回 NaN, 所以需要特殊处理
	 *
	 *   	策略: |dis| ≤ 1e-10 → 视为零, 返回 0
	 *
	 * 		潜在问题:
	 * 			如果 dis < -1e-10 (真正的负数), 仍然会调用 Math.sqrt(dis), 返回 NaN
	 * 			调用方应确保输入合理, 或在此处增加负数判断抛出异常
	 */
	public static sqrt(dis: number): number {
		if (Math.abs(dis) <= 1e-10) {
			return 0
		}
		return Math.sqrt(dis)
	}

	/**
	 * 升序排序比较函数(用于 Array.sort)
	 */
	public static sortAsc(a: number, b: number): number {
		return a - b
	}

	/**
	 * 降序排序比较函数(用于 Array.sort)
	 */
	public static sortDesc(a: number, b: number): number {
		return b - a
	}
}
