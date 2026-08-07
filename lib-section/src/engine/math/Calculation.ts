/**
 * 将数值格式化为指定小数位数的字符串
 *
 * 算法原理:
 *   	方案A (fixedDecimal = true, 固定小数位):
 *     		- 将数字乘以 10^digit 后四舍五入为整数(消除浮点尾部)
 *     		- 转为字符串, 前补零至位数够
 *     		- 在倒数第 digit 位插入小数点
 *     	优点: 完全避免浮点除法带来的精度问题
 *
 *   	方案 B (fixedDecimal = false, 非固定小数位):
 *     		- Math.round(number * p + 1e-10) / p
 *     		- 加 1e-10, 即修正 "银行家舍入" 的边界情况
 */
export function toFixed(number: number | string, digit: number = 2, fixedDecimal: boolean = true): string {
	if (typeof number !== 'number') {
		number = +number
	}
	if (isNaN(number)) {
		throw new Error('nedd number or <number>string')
	}
	digit = digit | 0
	if (digit <= 0 || (!number && !fixedDecimal)) {
		return String(Math.round(number))
	}
	const p: number = [1, 10, 100, 1000, 10000][digit] || Math.pow(10, digit) || 10
	if (fixedDecimal) {
		const sign: string = number < 0 ? '-' : ''
		number = number < 0 ? -number : number
		number = Math.round(number * p) + ''
		while (number.length <= digit) {
			number = '0' + number
		}
		number = number.slice(0, -digit) + '.' + number.slice(-digit)
		return sign + number
	}
	return String(Math.round(number * p + 1e-10) / p)
}

/**
 * 将数值精确到指定小数位(返回数值类型)
 */
export function toFix(number: number, precision: number = 1): number {
	const ratio: number = Math.pow(10, precision)
	return Math.round(number * ratio + 1e-10) / ratio
}

/**
 * 像素值转换为毫米值
 */
export function px2mm(pxValue: number, DPI: number): number {
	if (typeof pxValue === 'undefined' || isNaN(pxValue)) {
		return 0
	}
	return (pxValue * 25.4) / DPI
}

/**
 * 毫米值转换为像素值
 */
export function mm2px(mmValue: number, DPI: number): number {
	if (typeof mmValue === 'undefined' || isNaN(mmValue)) {
		return 0
	}
	return (mmValue * DPI) / 25.4
}
