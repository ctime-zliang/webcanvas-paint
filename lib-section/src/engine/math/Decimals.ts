import { toFixed } from './Calculation'

/**
 * 浮点数比较工具类
 *
 * 数学背景:
 *   	- IEEE 754 双精度浮点数有约 15-17 位有效数字的精度
 *   	- 由于二进制表示限制, 大多数十进制小数不能被精确存储, 因此直接用 === 比较浮点数通常是不可靠的
 */
export class Decimals {
	/**
	 * 判断两个浮点数是否"相等"(在指定精度内)
	 *
	 * 算法原理:
	 *   	多层级精度筛查:
	 *   		- 快速路径: delta < 1e-13 → 绝对相等(硬件精度极限)
	 *   		- 粗筛: 若指定 places > 5, 且 delta > 1e-5 → 绝对不等(差距太大)
	 *   		- 粗筛: 若 places = NaN, 且 delta > 1e-8 → 绝对不等
	 *   		- 精确比较: 将两数格式化到相同小数位, 比较字符串是否相等
	 *      - 取两数实际小数位数的较小值(但不低于 10 位)
	 *      - 若指定了 places, 再取 min(min, places)
	 *      - 用 toFixed 格式化后比较字符串
	 */
	public static equalsFloat(num1: number, num2: number, places: number = 0): boolean {
		const delta: number = Math.abs(num1 - num2)
		if (places > 5 && delta > 1e-5) {
			return false
		}
		if (isNaN(places) && delta > 1e-8) {
			return false
		}
		if (delta < 1e-13) {
			return true
		}
		let min: number = Math.min(Decimals.getDecimalPlaces(num1), Decimals.getDecimalPlaces(num2))
		if (min < 10) {
			min = 10
		}
		if (!isNaN(places)) {
			min = Math.min(min, places)
		}
		return toFixed(num1, min) === toFixed(num2, min)
	}

	/**
	 * 获取一个数的小数位数
	 *
	 * 算法原理:
	 *   	- 提取小数部分: num - floor(num) 或 num - ceil(num)
	 *   	- 将小数部分转为字符串
	 *   	- 字符串长度 - 2 (减去 "0." 前缀) = 小数位数
	 *
	 * 局限性:
	 *   	- 依赖 String() 的默认格式化, 对于极小数可能使用科学记数法
	 *     		如 String(1e-20) = "1e-20", length = 5, 返回 3 (不正确)
	 *   	- 对于 num = 0, di = 0, String(0) = "0", length = 1 < 2, 返回 0 ✓
	 */
	public static getDecimalPlaces(num: number): number {
		let di: number = 0
		let dl: number = 0
		if (num > 0) {
			di = num - Math.floor(num)
		} else {
			di = num - Math.ceil(num)
		}
		dl = String(di).length
		if (dl > 2) {
			return dl - 2
		}
		return 0
	}
}
