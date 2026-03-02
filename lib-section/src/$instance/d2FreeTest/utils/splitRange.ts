export function splitRange(min: number, max: number, chunk: number): Array<number> {
	const iChunk: number = chunk <= 2 ? 2 : chunk
	const result: Array<number> = []
	result.push(min)
	for (let i: number = 1; i < iChunk; i++) {
		result[i] = result[i - 1] + (max - min) / iChunk
	}
	result[result.length - 1] = max
	return result
}
