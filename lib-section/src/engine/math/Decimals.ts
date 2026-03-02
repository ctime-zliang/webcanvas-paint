import { toFixed } from './Calculation'

export class Decimals {
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
