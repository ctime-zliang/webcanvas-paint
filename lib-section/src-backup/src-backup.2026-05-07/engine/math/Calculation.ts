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

export function toFix(number: number, precision: number = 1): number {
	const ratio: number = Math.pow(10, precision)
	return Math.round(number * ratio + 1e-10) / ratio
}

export function px2mm(pxValue: number, DPI: number): number {
	if (typeof pxValue === 'undefined' || isNaN(pxValue)) {
		return 0
	}
	return (pxValue * 25.4) / DPI
}

export function mm2px(mmValue: number, DPI: number): number {
	if (typeof mmValue === 'undefined' || isNaN(mmValue)) {
		return 0
	}
	return (mmValue * DPI) / 25.4
}
