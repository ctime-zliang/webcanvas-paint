function qsort<T>(arr: Array<T>, cache: Array<T> | null, compara: (i1: T, i2: T) => number, start: number, end: number): void {
	let pivot: T = undefined!
	let i: number = 0
	let j: number = 0
	let hole: number = undefined!
	if (start < end - 1) {
		let length: number = end - start
		if (length > 50) {
			if (!cache) {
				cache = new Array<T>(length + 1)
			}
			mergeSort(arr, cache, compara, start, ((start + end) / 2) | 0, end)
		} else {
			pivot = arr[start]
			i = start
			hole = start
			j = end
			let i2: number = i + 1
			while (i2 < j) {
				if (hole !== j) {
					j = j - 1
					if (compara(pivot, arr[j]) <= 0) {
						continue
					}
					arr[hole] = arr[j]
					hole = j
					continue
				}
				if (compara(pivot, arr[i2]) >= 0) {
					i = i2
					i2 = i + 1
					continue
				}
				arr[hole] = arr[i2]
				i = i2
				hole = i2
				i2 = i + 1
			}
			arr[hole] = pivot
			qsort(arr, cache, compara, start, hole)
			qsort(arr, cache, compara, hole + 1, end)
		}
	}
}

function mergeSort<T>(arr: Array<T>, cache: Array<T>, compara: (i1: T, i2: T) => number, start: number, mid: number, end: number): void {
	qsort(arr, cache, compara, start, mid)
	qsort(arr, cache, compara, mid, end)
	let i: number = start
	let j: number = mid
	let k: number = 0
	let left: T = arr[i]
	let right: T = arr[j]
	while (i < mid && j < end) {
		let c: number = compara(left, right)
		if (Number.isNaN(c)) {
			cache[k++] = right
			right = arr[++j]
		} else {
			if (c <= 0) {
				cache[k++] = left
				left = arr[++i]
			}
			if (c >= 0) {
				cache[k++] = right
				right = arr[++j]
			}
		}
	}
	for (; i < mid; i++) {
		cache[k++] = arr[i]
	}
	for (; j < end; j++) {
		cache[k++] = arr[j]
	}
	for (i = start, j = 0; j < k; i++, j++) {
		arr[i] = cache[j]
	}
}

export class ArraySort {
	public static quickSort<T>(arr: Array<T>, compara: (i1: T, i2: T) => number, start: number = 0, end: number = arr.length): void {
		qsort(arr, null, compara, start, end)
	}
}
