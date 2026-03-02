export function getRandomInArea(min: number = 0, max: number = Number.MAX_SAFE_INTEGER): number {
	return Math.floor(Math.random() * (max - min + 1)) + min
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
