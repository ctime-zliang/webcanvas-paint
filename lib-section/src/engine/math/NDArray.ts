/**
 * N 维数组视图类 (NDArray View) - 基于 Uint8ClampedArray 的 3D 视图
 *
 * 数学原理:
 *   	- NDArray (多维数组)在内存中以一维连续方式存储, 通过 shape (形状)、stride (步幅) 和 offset (偏移量) 来实现多维索引到一维地址的映射
 *
 * 一维地址公式:
 *     	addr = offset + i0 * stride[0] + i1 * stride[1] + i2 * stride[2]
 *   	其中:
 *   		- shape = [d0, d1, d2]: 各维度的大小
 *   		- stride = [s0, s1, s2]: 各维度的步幅(相邻元素在一维数组中的间距)
 *   		- offset: 视图的起始偏移量
 *
 *   	例如: 一个 height×width×channels 的图像数据:
 *     		- shape = [height, width, 4]  (4通道: RGBA)
 *     		- stride = [width * 4, 4, 1]    (行优先存储)
 *     		- 访问像素 (y, x, c) 的地址 = offset + y * (width * 4) + x * 4 + c
 *
 * 主要用途:
 *   	- Canvas ImageData 的结构化访问 (RGBA 像素数据)
 *   	- 图像处理中的子区域切片、翻转、转置等操作
 *   	- 无需复制数据, 仅通过改变 shape / stride / offset 实现视图变换
 */
export class View3DUint8Clamped {
	private _data: Uint8ClampedArray
	private _shape: Array<number>
	private _stride: Array<number>
	private _offset: number
	private _dtype: string
	private _dimension: number

	/**
	 * 构造 3D 视图
	 * 		输入:
	 * 			data: 底层 Uint8ClampedArray 数据缓冲区
	 * 			shape: 各维度大小 [d0, d1, d2], undefined 值会被过滤
	 * 			stride: 各维度步幅 [s0, s1, s2], undefined 值会被过滤
	 * 			offset: 数据起始偏移量
	 */
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

	/**
	 * 视图总元素数量
	 *
	 * 计算:
	 * 		shape[0] × shape[1] × shape[2]
	 */
	public get size(): number {
		return this.shape[0] * this.shape[1] * this.shape[2]
	}

	/**
	 * 获取维度的存储顺序(从最快变化到最慢变化)
	 *
	 * 算法原理:
	 *   	- 步幅最小的维度变化最快(在内存中相邻), 步幅最大的变化最慢
	 *   	- 返回维度索引数组, 按步幅从小到大排序
	 *
	 *   	- 行优先 (C-order): stride = [w * 4, 4, 1]  // order = [2, 1, 0]
	 *   	- 列优先 (F-order): stride = [1, h, h * w]  // order = [0, 1, 2]
	 */
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

	/**
	 * 设置指定多维索引处的值
	 *
	 * 地址计算:
	 * 		addr = offset + i0 * stride[0] + i1 * stride[1] + i2 * stride[2]
	 * 		最后一个参数总是要设置的值(v)
	 *
	 * 重载行为(基于参数数量):
	 *   	set(v)           	// data[offset] = v              					(0 维标量)
	 *   	set(i0, v)       	// data[offset + i0 * s0] = v      					(1 维)
	 *   	set(i0, i1, v)   	// data[offset + i0 * s0 + i1 * s1] = v  			(2 维)
	 *   	set(i0, i1, i2, v) 	// data[offset + i0 * s0 + i1 * s1 + i2 * s2] = v  	(3 维)
	 *
	 * 案例:
	 *   	- 设置像素 (10, 20) 的红色通道为 255:
	 *   		view.set(10, 20, 0, 255)
	 *   		地址 = 0 + 10 * 800 + 20 * 4 + 0 * 1 = 8080
	 */
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
				return (this.data[this.offset + this.stride[0] * arguments[0] + this.stride[1] * arguments[1] + this.stride[2] * arguments[2]] = arguments[arguments.length - 1])
			}
		}
		throw new Error('View3DUint8Clamped.Set: arguments error.')
	}

	/**
	 * 获取指定多维索引处的值
	 *
	 * 地址计算:
	 * 		addr = offset + i0 * stride[0] + i1 * stride[1] + i2 * stride[2]
	 *
	 * 重载行为(基于参数数量):
	 *   	get()        		// data[offset]                       			(0 维标量)
	 *   	get(i0)       		// data[offset + i0 * s0]               		(1 维)
	 *   	get(i0, i1)   		// data[offset + i0 * s0 + i1 * s1]      		(2 维)
	 *   	get(i0, i1, i2) 	// data[offset + i0 * s0 + i1 * s1 + i2 * s2]  	(3 维)
	 *
	 * 案例:
	 *   	- 获取像素 (10, 20) 的蓝色通道值(RGBA 中 index = 2)
	 *   		view.get(10, 20, 2)
	 */
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

	/**
	 * 计算指定多维索引在底层数组中的线性地址(功能与 get 完全相同)
	 *
	 * 当前实现返回的是 data[addr] 的值, 而非 addr 本身
	 * 如需真正的索引计算, 应返回 this.offset + Σ(stride[k] * i_k)
	 */
	public indexValue(i0: number, i1: number, i2: number): number {
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

	/**
	 * 上界切片(High bound) - 截取视图的前 N 个元素
	 *
	 * 算法原理:
	 *   	- 保持 offset 和 stride 不变, 仅缩小 shape, 等效于 NumPy 的 array[:i0, :i1, :i2]
	 *
	 *  对于每个维度:
	 *   	- 若参数为正数: 新 shape[k] = min (参数值, 原 shape[k])
	 *   	- 若参数为负数或非数字: 保持原 shape[k] (传 undefined)
	 */
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
					[typeof arguments[0] !== 'number' || arguments[0] < 0 ? this.shape[0] : arguments[0] | 0, typeof arguments[1] !== 'number' || arguments[1] < 0 ? this.shape[1] : arguments[1] | 0, undefined!],
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

	/**
	 * 下界切片 (Low bound) - 跳过视图前 N 个元素
	 *
	 * 算法原理:
	 *   	- 通过增加 offset 并减小 shape 来"跳过"前面的元素
	 *   	- 等效于 NumPy 的 array[i0:, i1:, i2:]
	 *
	 * 对于每个维度:
	 *   	- offset += stride[k] * d  (向后偏移 d 个元素)
	 *   	- shape[k] -= d            (可用范围减少 d)
	 */
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

	/**
	 * 步进切片 (Step/Stride) - 每隔 d 个元素取一个
	 *
	 * 算法原理:
	 *   	- 通过修改 stride 实现等间隔采样, 同时调整 shape
	 *   	- 等效于 NumPy 的 array[::d0, ::d1, ::d2]
	 *
	 * 正步长(d > 0):
	 *   	- stride[k] *= d       				(步幅变为 d 倍)
	 *   	- shape[k] = ceil(shape[k] / d)  	(元素数量变为 1 / d)
	 *
	 * 负步长(d < 0): 反转该维度
	 *   	- offset += stride[k] * (shape[k] - 1)  (从末尾开始)
	 *   	- shape[k] = ceil(-shape[k] / d)        (向反方向遍历)
	 *   	- stride[k] *= d                        (步幅变负, 方向反转)
	 */
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

	/**
	 * 转置 - 重新排列维度顺序
	 *
	 * 算法原理:
	 *   	- 转置不移动数据, 仅重排 shape 和 stride 数组
	 *   	- 等效于 NumPy 的 array.transpose(i0, i1, i2)
	 *
	 * 		例如 transpose(1, 0, 2) 交换第 0 和第 1 维(行列转置):
	 *   		- 新 shape = [原 shape[1], 原 shape[0], 原 shape[2]]
	 *   		- 新 stride = [原 stride[1], 原 stride[0], 原 stride[2]]
	 */
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
				return new View3DUint8Clamped(this.data, [shape[arguments[0]], undefined!, undefined!], [stride[arguments[0]], undefined!, undefined!], this.offset)
			}
			case 2: {
				arguments[0] = arguments[0] === undefined ? 0 : arguments[0] | 0
				arguments[1] = arguments[1] === undefined ? 1 : arguments[1] | 0
				const shape: Array<number> = this.shape
				const stride: Array<number> = this.stride
				return new View3DUint8Clamped(this.data, [shape[arguments[0]], shape[arguments[1]], undefined!], [stride[arguments[0]], stride[arguments[1]], undefined!], this.offset)
			}
			case 3: {
				arguments[0] = arguments[0] === undefined ? 0 : arguments[0] | 0
				arguments[1] = arguments[1] === undefined ? 1 : arguments[1] | 0
				arguments[2] = arguments[2] === undefined ? 2 : arguments[2] | 0
				const shape: Array<number> = this.shape
				const stride: Array<number> = this.stride
				return new View3DUint8Clamped(this.data, [shape[arguments[0]], shape[arguments[1]], shape[arguments[2]]], [stride[arguments[0]], stride[arguments[1]], stride[arguments[2]]], this.offset)
			}
		}
		throw new Error('View3DUint8Clamped.Transpose: arguments error.')
	}

	/**
	 * 维度选取 (Pick/Slice) - 固定某些维度的索引, 降低维度
	 *
	 * 算法原理:
	 *   	- 对于指定了具体索引的维度: 将该索引乘以对应 stride 加到 offset 上,
	 *   	- 并从结果视图中移除该维度
	 *   	- 对于未指定(负数/非数字)的维度: 保留在结果中
	 *
	 * 等效于 NumPy 的高级索引:
	 *   	- pick(5, -1, -1) → array[5, :, :]  (3D → 2D, 固定第 0 维为 5)
	 *   	- pick(-1, 10, -1) → array[:, 10, :] (固定第 1 维为 10)
	 *   	- pick(5, 10, -1) → array[5, 10, :]  (3D → 1D)
	 */
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

/**
 * 工厂函数: 从 Canvas ImageData 创建 3D NDArray 视图
 *
 * 		输入:
 * 			data: Canvas ImageData 的 Uint8ClampedArray
 * 			shape: 维度形状, 通常为 [height, width, 4]
 *
 * 算法原理:
 *   	- 根据 shape 数组计算行优先 (C-order) 的 stride:
 *      		stride[i] = shape[i+1] * shape[i+2] * ... * shape[d-1]
 *      	即从最后一维开始, 逐步累乘
 *   	- 计算 offset: 如果有负 stride (反向遍历), 需要调整起始偏移
 *      	使得第一个元素的地址为正
 *
 * 典型用法:
 *   		- const imageData = ctx.getImageData(0, 0, width, height)
 *   		- const view = createCanvasImageDataArray(imageData.data, [height, width, 4])
 * 		此后可以用 view.get(y, x, channel) 来访问像素
 *
 * Stride 计算案例:
 *   	shape = [100, 200, 4]
 *   		- i = 2: stride[2] = 1,    sz = 1 * 4 = 4
 *   		- i = 1: stride[1] = 4,    sz = 4 * 200 = 800
 *   		- i = 0: stride[0] = 800,  sz = 800 * 100 = 80000
 *   	最终 stride = [800, 4, 1]
 */
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
