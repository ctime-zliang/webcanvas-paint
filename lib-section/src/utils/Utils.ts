import { ECanvas2DLineCap } from '../engine/config/PrimitiveProfile'
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

export function isEqualOfArray<T>(a1: ReadonlyArray<T> | Array<T>, a2: ReadonlyArray<T> | Array<T>): boolean {
	const len1: number = a1.length
	const len2: number = a2.length
	if (len1 !== len2) {
		return false
	}
	for (let k1: number = 0; k1 < len1; k1++) {
		for (let k2: number = 0; k2 < len2; k2++) {
			if (a1[k1] !== a2[k2]) {
				return false
			}
		}
	}
	return true
}

export function arrayCopy(
	sourceArray: Array<number>,
	sourceIndex: number,
	resultArray: Array<number>,
	resultIndex: number,
	copyLength: number
): void {
	if (sourceArray.length >= sourceIndex + copyLength && resultArray.length >= resultIndex + copyLength) {
		while (copyLength-- > 0) {
			resultArray[resultIndex++] = sourceArray[sourceIndex++]
		}
		return
	}
	throw new Error('cannot read array out of range.')
}

export function throttle1(fn: (...args: any) => void, delay: number = 500): () => void {
	let previous: number = 0
	return function (): void {
		let now: number = +new Date()
		if (now - previous > delay) {
			//@ts-ignore
			fn.apply(this as any, arguments as any)
			previous = now
		}
	}
}

export function throttle2(fn: (...args: any) => void, delay: number = 500): () => void {
	let timer: any = null
	return function (): void {
		if (!timer) {
			timer = window.setTimeout((): void => {
				timer = null
				//@ts-ignore
				fn.apply(this as any, arguments as any)
			}, delay)
		}
	}
}

export function updateDashedSegProfile(
	lineCap: ECanvas2DLineCap,
	strokeWidth: number
): {
	segSize: number
	gapSize: number
} {
	let segSize: number = 2
	let gapSize: number = 1.5
	if (lineCap === ECanvas2DLineCap.ROUND) {
		segSize = 2
		gapSize = (strokeWidth / 2) * 5
	}
	return {
		segSize,
		gapSize,
	}
}

export function nextFrameTick(callback: (timeStamp: number) => void, delay: number = 0): void {
	window.setTimeout((): void => {
		window.requestAnimationFrame((timeStamp: number): void => {
			callback(timeStamp)
		})
	}, delay)
}
