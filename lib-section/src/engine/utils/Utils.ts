export function getRandomInArea(min: number = 0, max: number = Number.MAX_SAFE_INTEGER): number {
	return Math.floor(Math.random() * (max - min + 1)) + min
}

export function getHashIden(length: number = 36): string {
	const s: Array<string> = []
	const HEX_DIGITS: string = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
	for (let i: number = 0; i < length; i++) {
		s[i] = HEX_DIGITS.substr(Math.floor(Math.random() * 0x10), 1)
	}
	s[14] && (s[14] = String(getRandomInArea(1, 9)))
	s[19] && (s[19] = HEX_DIGITS.substr(((+s[19] as number) & 0x3) | 0x8, 1))
	s[8] && (s[8] = String(getRandomInArea(1, 9)))
	s[13] && (s[13] = String(getRandomInArea(1, 9)))
	s[18] && (s[18] = String(getRandomInArea(1, 9)))
	s[23] && (s[23] = String(getRandomInArea(1, 9)))
	return s.join('')
}

export function getLimitRange(inputNumber: number, min: number = 0.01, max: number = Number.MAX_SAFE_INTEGER): number {
	if (inputNumber >= max) {
		return max
	}
	if (inputNumber <= min) {
		return min
	}
	return inputNumber
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

export async function isSupportWebGPU(): Promise<boolean> {
	try {
		if (!(navigator as any).gpu) {
			throw new Error(`navigator.gpu is undefined.`)
		}
		const adapter = await (navigator as any).gpu.requestAdapter()
		const device = await adapter.requestDevice()
		if (device) {
			return true
		}
	} catch (e) {
		console.error(`The current environment does not support WebGPU: ${e}`)
	}
	return false
}

export function format2Binary(num: number): string {
	const str: string = num.toString(2)
	const leftPad: number = 32 - str.length
	if (leftPad > 0) {
		return '0'.repeat(leftPad) + str
	}
	return str
}

export function removeItemFromList<T>(list: Array<T>, item: T): void {
	let len: number = list.length
	for (let i: number = 0; i < list.length; i++) {
		if (list[i] === item) {
			list.splice(i, 1)
			i--
			len--
		}
	}
}

export function getAllKeysFromMap<T>(map: Map<string, T>): Array<string> {
	const allKeys: Array<string> = []
	for (let [key, value] of map) {
		allKeys.push(key)
	}
	return allKeys
}

export function isFloatEqual(a: number, b: number, precise: number = 1e-10): boolean {
	const d: number = a - b
	return (d > 0 ? d : -d) < precise
}

export function nextFrameTick(callback: (timeStamp: number) => void, delay: number = 0): void {
	window.setTimeout((): void => {
		window.requestAnimationFrame((timeStamp: number): void => {
			callback(timeStamp)
		})
	}, delay)
}
