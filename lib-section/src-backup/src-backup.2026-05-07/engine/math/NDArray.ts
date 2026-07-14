export class View3DUint8Clamped {
	private _data: Uint8ClampedArray
	private _shape: Array<number>
	private _stride: Array<number>
	private _offset: number
	private _dtype: string
	private _dimension: number
	constructor(data: Uint8ClampedArray, shape: Array<number>, stride: Array<number>, offset: number) {
		this._data = data
		this._shape = shape.filter((item: number): boolean => {
			return typeof item !== 'undefined'
		})
		this._stride = stride.filter((item: number): boolean => {
			return typeof item !== 'undefined'
		})
		this._offset = offset | 0
		this._dtype = 'uint8_clamped'
		this._dimension = this._shape.length
	}

	public get data(): Uint8ClampedArray {
		return this._data
	}

	public get shape(): Array<number> {
		return this._shape
	}

	public get stride(): Array<number> {
		return this._stride
	}

	public get offset(): number {
		return this._offset
	}

	public get dtype(): string {
		return this._dtype
	}

	public get dimension(): number {
		return this._dimension
	}

	public get size(): number {
		return this.shape[0] * this.shape[1] * this.shape[2]
	}

	public get order(): Array<number> {
		const s0: number = Math.abs(this.stride[0])
		const s1: number = Math.abs(this.stride[1])
		const s2: number = Math.abs(this.stride[2])
		if (s0 > s1) {
			if (s1 > s2) {
				return [2, 1, 0]
			} else if (s0 > s2) {
				return [1, 2, 0]
			} else {
				return [1, 0, 2]
			}
		} else if (s0 > s2) {
			return [2, 0, 1]
		} else if (s2 > s1) {
			return [0, 1, 2]
		}
		return [0, 2, 1]
	}

	public set(i0: number, i1: number, i2: number, v: number): number {
		switch (arguments.length) {
			case 1: {
				return (this.data[this.offset] = arguments[arguments.length - 1])
			}
			case 2: {
				return (this.data[this.offset + this.stride[0] * arguments[0]] = arguments[arguments.length - 1])
			}
			case 3: {
				return (this.data[this.offset + this.stride[0] * arguments[0] + this.stride[1] * arguments[1]] = arguments[arguments.length - 1])
			}
			case 4: {
				return (this.data[this.offset + this.stride[0] * arguments[0] + this.stride[1] * arguments[1] + this.stride[2] * arguments[2]] =
					arguments[arguments.length - 1])
			}
		}
		throw new Error('View3DUint8Clamped.Set: arguments error.')
	}

	public get(i0: number, i1: number, i2: number): number {
		switch (arguments.length) {
			case 0: {
				return this.data[this.offset]
			}
			case 1: {
				return this.data[this.offset + this.stride[0] * arguments[0]]
			}
			case 2: {
				return this.data[this.offset + this.stride[0] * arguments[0] + this.stride[1] * arguments[1]]
			}
			case 3: {
				return this.data[this.offset + this.stride[0] * arguments[0] + this.stride[1] * arguments[1] + this.stride[2] * arguments[2]]
			}
		}
		throw new Error('View3DUint8Clamped.Get: arguments error.')
	}

	public index(i0: number, i1: number, i2: number): number {
		switch (arguments.length) {
			case 0: {
				return this.data[this.offset]
			}
			case 1: {
				return this.data[this.offset + this.stride[0] * arguments[0]]
			}
			case 2: {
				return this.data[this.offset + this.stride[0] * arguments[0] + this.stride[1] * arguments[1]]
			}
			case 3: {
				return this.data[this.offset + this.stride[0] * arguments[0] + this.stride[1] * arguments[1] + this.stride[2] * arguments[2]]
			}
		}
		throw new Error('View3DUint8Clamped.Index: arguments error.')
	}

	public hi(i0: number, i1: number, i2: number): View3DUint8Clamped {
		switch (arguments.length) {
			case 0: {
				return new View3DUint8Clamped(this.data, [undefined!, undefined!, undefined!], [undefined!, undefined!, undefined!], this.offset)
			}
			case 1: {
				return new View3DUint8Clamped(
					this.data,
					[typeof arguments[0] !== 'number' || arguments[0] < 0 ? this.shape[0] : arguments[0] | 0, undefined!, undefined!],
					[this.stride[0], undefined!, undefined!],
					this.offset
				)
			}
			case 2: {
				return new View3DUint8Clamped(
					this.data,
					[
						typeof arguments[0] !== 'number' || arguments[0] < 0 ? this.shape[0] : arguments[0] | 0,
						typeof arguments[1] !== 'number' || arguments[1] < 0 ? this.shape[1] : arguments[1] | 0,
						undefined!,
					],
					[this.stride[0], this.stride[1], undefined!],
					this.offset
				)
			}
			case 3: {
				return new View3DUint8Clamped(
					this.data,
					[
						typeof arguments[0] !== 'number' || arguments[0] < 0 ? this.shape[0] : arguments[0] | 0,
						typeof arguments[1] !== 'number' || arguments[1] < 0 ? this.shape[1] : arguments[1] | 0,
						typeof arguments[2] !== 'number' || arguments[2] < 0 ? this.shape[2] : arguments[2] | 0,
					],
					[this.stride[0], this.stride[1], this.stride[2]],
					this.offset
				)
			}
		}
		throw new Error('View3DUint8Clamped.Hi: arguments error.')
	}

	public lo(i0: number, i1: number, i2: number): View3DUint8Clamped {
		switch (arguments.length) {
			case 0: {
				let offset: number = this.offset
				return new View3DUint8Clamped(this.data, [undefined!, undefined!, undefined!], [undefined!, undefined!, undefined!], offset)
			}
			case 1: {
				let offset: number = this.offset
				let d: number = 0
				let a0: number = this.shape[0]
				let c0: number = this.stride[0]
				if (typeof arguments[0] === 'number' && arguments[0] >= 0) {
					d = arguments[0] | 0
					offset += c0 * d
					a0 -= d
				}
				return new View3DUint8Clamped(this.data, [a0, undefined!, undefined!], [c0, undefined!, undefined!], offset)
			}
			case 2: {
				let offset: number = this.offset
				let d: number = 0
				let a0: number = this.shape[0]
				let a1: number = this.shape[1]
				let c0: number = this.stride[0]
				let c1: number = this.stride[1]
				if (typeof arguments[0] === 'number' && arguments[0] >= 0) {
					d = arguments[0] | 0
					offset += c0 * d
					a0 -= d
				}
				if (typeof arguments[1] === 'number' && arguments[1] >= 0) {
					d = arguments[1] | 0
					offset += c1 * d
					a1 -= d
				}
				return new View3DUint8Clamped(this.data, [a0, a1, undefined!], [c0, c1, undefined!], offset)
			}
			case 3: {
				let offset: number = this.offset
				let d: number = 0
				let a0: number = this.shape[0]
				let a1: number = this.shape[1]
				let a2: number = this.shape[2]
				let c0: number = this.stride[0]
				let c1: number = this.stride[1]
				let c2: number = this.stride[2]
				if (typeof arguments[0] === 'number' && arguments[0] >= 0) {
					d = arguments[0] | 0
					offset += c0 * d
					a0 -= d
				}
				if (typeof arguments[1] === 'number' && arguments[1] >= 0) {
					d = arguments[1] | 0
					offset += c1 * d
					a1 -= d
				}
				if (typeof arguments[2] === 'number' && arguments[2] >= 0) {
					d = arguments[2] | 0
					offset += c2 * d
					a2 -= d
				}
				return new View3DUint8Clamped(this.data, [a0, a1, a2], [c0, c1, c2], offset)
			}
		}
		throw new Error('View3DUint8Clamped.Lo: arguments error.')
	}

	public step(i0: number, i1: number, i2: number): View3DUint8Clamped {
		switch (arguments.length) {
			case 0: {
				let offset: number = this.offset
				return new View3DUint8Clamped(this.data, [undefined!, undefined!, undefined!], [undefined!, undefined!, undefined!], offset)
			}
			case 1: {
				let a0: number = this.shape[0]
				let b0: number = this.stride[0]
				let offset: number = this.offset
				let d: number = 0
				if (typeof arguments[0] === 'number') {
					d = arguments[0] | 0
					if (d < 0) {
						offset += b0 * (a0 - 1)
						a0 = Math.ceil(-a0 / d)
					} else {
						a0 = Math.ceil(a0 / d)
					}
					b0 *= d
				}
				return new View3DUint8Clamped(this.data, [a0, undefined!, undefined!], [b0, undefined!, undefined!], offset)
			}
			case 2: {
				let a0: number = this.shape[0]
				let a1: number = this.shape[1]
				let b0: number = this.stride[0]
				let b1: number = this.stride[1]
				let offset: number = this.offset
				let d: number = 0
				if (typeof arguments[0] === 'number') {
					d = arguments[0] | 0
					if (d < 0) {
						offset += b0 * (a0 - 1)
						a0 = Math.ceil(-a0 / d)
					} else {
						a0 = Math.ceil(a0 / d)
					}
					b0 *= d
				}
				if (typeof arguments[1] === 'number') {
					d = arguments[1] | 0
					if (d < 0) {
						offset += b1 * (a1 - 1)
						a1 = Math.ceil(-a1 / d)
					} else {
						a1 = Math.ceil(a1 / d)
					}
					b1 *= d
				}
				return new View3DUint8Clamped(this.data, [a0, a1, undefined!], [b0, b1, undefined!], offset)
			}
			case 3: {
				let a0: number = this.shape[0]
				let a1: number = this.shape[1]
				let a2: number = this.shape[2]
				let b0: number = this.stride[0]
				let b1: number = this.stride[1]
				let b2: number = this.stride[2]
				let offset: number = this.offset
				let d: number = 0
				if (typeof arguments[0] === 'number') {
					d = arguments[0] | 0
					if (d < 0) {
						offset += b0 * (a0 - 1)
						a0 = Math.ceil(-a0 / d)
					} else {
						a0 = Math.ceil(a0 / d)
					}
					b0 *= d
				}
				if (typeof arguments[1] === 'number') {
					d = arguments[1] | 0
					if (d < 0) {
						offset += b1 * (a1 - 1)
						a1 = Math.ceil(-a1 / d)
					} else {
						a1 = Math.ceil(a1 / d)
					}
					b1 *= d
				}
				if (typeof arguments[2] === 'number') {
					d = arguments[2] | 0
					if (d < 0) {
						offset += b2 * (a2 - 1)
						a2 = Math.ceil(-a2 / d)
					} else {
						a2 = Math.ceil(a2 / d)
					}
					b2 *= d
				}
				return new View3DUint8Clamped(this.data, [a0, a1, a2], [b0, b1, b2], offset)
			}
		}
		throw new Error('View3DUint8Clamped.Step: arguments error.')
	}

	public transpose(i0: number = 0, i1: number = 0, i2: number = 0): View3DUint8Clamped {
		switch (arguments.length) {
			case 0: {
				const shape: Array<number> = this.shape
				const stride: Array<number> = this.stride
				return new View3DUint8Clamped(this.data, [undefined!, undefined!, undefined!], [undefined!, undefined!, undefined!], this.offset)
			}
			case 1: {
				arguments[0] = arguments[0] === undefined ? 0 : arguments[0] | 0
				const shape: Array<number> = this.shape
				const stride: Array<number> = this.stride
				return new View3DUint8Clamped(
					this.data,
					[shape[arguments[0]], undefined!, undefined!],
					[stride[arguments[0]], undefined!, undefined!],
					this.offset
				)
			}
			case 2: {
				arguments[0] = arguments[0] === undefined ? 0 : arguments[0] | 0
				arguments[1] = arguments[1] === undefined ? 1 : arguments[1] | 0
				const shape: Array<number> = this.shape
				const stride: Array<number> = this.stride
				return new View3DUint8Clamped(
					this.data,
					[shape[arguments[0]], shape[arguments[1]], undefined!],
					[stride[arguments[0]], stride[arguments[1]], undefined!],
					this.offset
				)
			}
			case 3: {
				arguments[0] = arguments[0] === undefined ? 0 : arguments[0] | 0
				arguments[1] = arguments[1] === undefined ? 1 : arguments[1] | 0
				arguments[2] = arguments[2] === undefined ? 2 : arguments[2] | 0
				const shape: Array<number> = this.shape
				const stride: Array<number> = this.stride
				return new View3DUint8Clamped(
					this.data,
					[shape[arguments[0]], shape[arguments[1]], shape[arguments[2]]],
					[stride[arguments[0]], stride[arguments[1]], stride[arguments[2]]],
					this.offset
				)
			}
		}
		throw new Error('View3DUint8Clamped.Transpose: arguments error.')
	}

	public pick(i0: number, i1: number, i2: number): View3DUint8Clamped {
		const stride: Array<number> = []
		const shape: Array<number> = []
		let offset: number = this.offset
		if (typeof arguments[0] === 'number' && arguments[0] >= 0) {
			offset = (offset + this.stride[0] * arguments[0]) | 0
		} else {
			stride.push(this.shape[0])
			shape.push(this.stride[0])
		}
		if (typeof arguments[1] === 'number' && arguments[1] >= 0) {
			offset = (offset + this.stride[1] * arguments[1]) | 0
		} else {
			stride.push(this.shape[1])
			shape.push(this.stride[1])
		}
		if (typeof arguments[2] === 'number' && arguments[2] >= 0) {
			offset = (offset + this.stride[2] * arguments[2]) | 0
		} else {
			stride.push(this.shape[2])
			shape.push(this.stride[2])
		}
		return new View3DUint8Clamped(this.data, stride, shape, offset)
	}
}

export function createCanvasImageDataArray(data: Uint8ClampedArray, shape: Array<number>): View3DUint8Clamped {
	const d: number = shape.length
	const stride: Array<number> = new Array(d)
	for (let i: number = d - 1, sz = 1; i >= 0; --i) {
		stride[i] = sz
		sz *= shape[i]
	}
	let offset: number = 0
	for (let i: number = 0; i < d; i++) {
		if (stride[i] < 0) {
			offset -= (shape[i] - 1) * stride[i]
		}
	}
	return new View3DUint8Clamped(data, shape, stride, offset)
}
