export interface Comparable {
	equlas(item: Object): boolean
}

export type Comparator<T> = (v1: T, v2: T) => number

export interface IIterator<T> {
	hasNext: () => boolean
	next: () => T
}

export interface IIterable<T> {
	iterator: () => IIterator<T>
}
