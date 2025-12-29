const SPLITTER: number = +(Math.pow(2, 27) + 1.0)

export class Twos {
	static twoProduct(a: number, b: number, result: Array<number> = null!): Array<number> {
		let x: number = a * b
		let c: number = SPLITTER * a
		let abig: number = c - a
		let ahi: number = c - abig
		let alo: number = a - ahi
		let d: number = SPLITTER * b
		let bbig: number = d - b
		let bhi: number = d - bbig
		let blo: number = b - bhi
		let err1: number = x - ahi * bhi
		let err2: number = err1 - alo * bhi
		let err3: number = err2 - ahi * blo
		let y: number = alo * blo - err3
		if (result) {
			result[0] = y
			result[1] = x
			return result
		}
		return [y, x]
	}

	static twoSum(a: number, b: number, result: Array<number> = null!): Array<number> {
		let x: number = a + b
		let bv: number = x - a
		let av: number = x - bv
		let br: number = b - bv
		let ar: number = a - av
		if (result) {
			result[0] = ar + br
			result[1] = x
			return result
		}
		return [ar + br, x]
	}
}
