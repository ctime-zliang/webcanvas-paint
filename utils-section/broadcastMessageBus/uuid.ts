const ab_8: ArrayBuffer = new ArrayBuffer(8)
const u8_8: Uint8Array = new Uint8Array(ab_8)

export function hex(unit8Array: Uint8Array): string {
	const buffer: Array<string> = new Array<string>(unit8Array.length)
	for (let i: number = 0; i < unit8Array.length; i++) {
		buffer[i] = unit8Array[i].toString(16).padStart(2, '0')
	}
	return buffer.join('')
}

export function getShortUuid(): string {
	crypto.getRandomValues(u8_8)
	return hex(u8_8)
}
