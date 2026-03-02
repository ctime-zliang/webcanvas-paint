export function remove1<T>(list: Array<T>, item: T): Array<T> {
	const newList: Array<T> = []
	for (let i: number = 0; i < list.length; i++) {
		if (list[i] !== item) {
			newList.push(list[i])
		}
	}
	return newList
}

export function remove2<T>(list: Array<T>, item: T): number {
	let count: number = 0
	let len: number = list.length
	for (let i: number = 0; i < len; i++) {
		if (list[i] === item) {
			list.splice(i, 1)
			i--
			len--
			count++
		}
	}
	return count
}

export function deepClone<T>(data: T): T {
	return traverse(data)

	function traverse(data: T): T {
		if (
			typeof data !== 'object' ||
			data === null ||
			data instanceof Date ||
			data instanceof ArrayBuffer ||
			data instanceof Uint8ClampedArray ||
			data instanceof Uint8Array ||
			data instanceof Uint16Array ||
			data instanceof Uint32Array
		) {
			return data
		}
		if (Array.isArray(data)) {
			return data.map(traverse) as any as T
		}
		const obj: any = {}
		for (let key in data) {
			if ((data as any).hasOwnProperty(key)) {
				obj[key] = traverse(data[key] as any as T) as any as T
			}
		}
		return obj as any as T
	}
}

export function getOrInit<T>(obj: { [key: string]: T }, key: string | number, initializer: (key: string | number) => T = (key: string | number) => null!): T {
	let value: any = obj[key]
	if (typeof value !== 'undefined') {
		return value
	}
	value = initializer(key)
	obj[key] = value
	return value
}

export function getOrInitArr<T>(obj: { [key: string]: Array<T> }, key: string | number): Array<T> {
	return getOrInit(obj, key, (): Array<T> => {
		return [] as Array<T>
	})
}

export async function sha256hex(data: string | BufferSource): Promise<string> {
	const encoded: BufferSource = typeof data === 'string' ? new TextEncoder().encode(data) : data
	const hashBuffer: BufferSource = await crypto.subtle.digest('SHA-256', encoded)
	const hashArr: Array<number> = Array.from(new Uint8Array(hashBuffer))
	const hasHex: string = hashArr
		.map((b: number): string => {
			return b.toString(16).padStart(2, '0')
		})
		.join('')
	return hasHex
}
