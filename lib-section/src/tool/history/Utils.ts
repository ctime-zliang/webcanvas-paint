export function removeFromTo(array: Array<any>, from: number, to?: number): number {
	//@ts-ignore
	array.splice(from, !to || 1 + to - from + (!((to < 0) ^ (from >= 0)) && (to < 0 || -1) * array.length))
	return array.length
}
