export class Status {
	static isStatusMatch(nowStatus: number, bitIndex: number): boolean {
		return (nowStatus & bitIndex) === bitIndex
	}

	static setStatusMatch(bitIndex: number, nowStatus: number, value: boolean): number {
		const _v: boolean = !!value
		let statusResult: number = nowStatus
		if (_v) {
			statusResult = statusResult | bitIndex
			return statusResult
		}
		statusResult = statusResult & ~bitIndex
		return statusResult
	}
}
