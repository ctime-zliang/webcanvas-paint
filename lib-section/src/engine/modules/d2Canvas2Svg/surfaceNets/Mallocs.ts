function bitsNextPow2(v: number): number {
	let _v: number = v
	_v += +(_v === 0)
	_v -= 1
	_v |= _v >>> 1
	_v |= _v >>> 2
	_v |= _v >>> 4
	_v |= _v >>> 8
	_v |= _v >>> 16
	return _v + 1
}

export function mallocUint32(n: number): Uint32Array {
	return new Uint32Array(new ArrayBuffer(bitsNextPow2(4 * n)), 0, n)
}
