import { toFixed } from '../engine/math/Calculation'

export function getLimitRange(inputNumber: number, min: number = 0.01, max: number = Number.MAX_SAFE_INTEGER): number {
	if (inputNumber >= max) {
		return max
	}
	if (inputNumber <= min) {
		return min
	}
	return inputNumber
}

export function isEqualOfFloat(v1: number, v2: number, place: number = 6): boolean {
	let equalDelta: number = Math.abs(v1 - v2)
	if (place >= 5 && equalDelta > 1e-8) {
		return false
	}
	if (Number.isNaN(place) && equalDelta > 1e-8) {
		return false
	}
	if (equalDelta < 1e-13) {
		return true
	}
	let equalMin: number = Math.min(getDecimalPlaces(v1), getDecimalPlaces(v2))
	if (equalMin < 10) {
		equalMin = 10
	}
	if (!Number.isNaN(place)) {
		equalMin = Math.min(equalMin, place)
	}
	return toFixed(v1, equalMin) === toFixed(v2, equalMin)
}

export function getDecimalPlaces(n: number): number {
	let decIdx: number = 0
	let decLen: number = 0
	if (n > 0) {
		decIdx = n - Math.floor(n)
	} else {
		decIdx = n - Math.ceil(n)
	}
	decLen = (decIdx.toString() || '').length
	if (decLen > 2) {
		return decLen - 2
	}
	return 0
}
