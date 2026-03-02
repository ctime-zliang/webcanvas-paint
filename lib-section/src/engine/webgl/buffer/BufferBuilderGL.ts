import { TypedArrayN } from '../../types/Common'
import { DataBufferGL } from './DataBufferGL'

interface ArrayConstructor<T extends TypedArrayN> {
	new (length: number): T
	new (buffer: ArrayBuffer): T
}

export class BufferBuilderGL<T extends TypedArrayN> {
	private _dataBuffer: DataBufferGL
	private _arrayConstructor: ArrayConstructor<T>
	private _maxLength: number
	private _arr: T
	private _upperItemIndex: number
	constructor(arrayConstructor: ArrayConstructor<T>, dataBuffer: DataBufferGL, arr: T, maxLength: number = Number.POSITIVE_INFINITY) {
		this._arrayConstructor = arrayConstructor
		this._dataBuffer = dataBuffer
		this._arr = arr
		this._maxLength = maxLength
		this._upperItemIndex = -1
	}

	public get dataBuffer(): DataBufferGL {
		return this._dataBuffer
	}

	public get arr(): T {
		return this._arr
	}

	public get arrItemSize(): number {
		return this._upperItemIndex + 1
	}

	public get arrayConstructor(): ArrayConstructor<T> {
		return this._arrayConstructor
	}

	public getItemByIndex(index: number): number {
		return this._arr[index]
	}

	public setUpperItemIndex(value: number): void {
		if (value <= -1) {
			value = -1
		}
		if (value >= this._arr.length - 1) {
			value = this._arr.length - 1
		}
		this._upperItemIndex = value
	}

	public getUpperItemIndex(): number {
		return this._upperItemIndex
	}

	public extArr(size: number): void {
		const rsize: number = 2 ** Math.ceil(Math.log2(size))
		const arr: T = new this.arrayConstructor(Math.min(rsize, rsize >= this._maxLength ? rsize : this._maxLength))
		arr.set(this._arr)
		this._arr = arr
		this._maxLength = this._arr.length
	}

	public setValueByIndex(index: number, value: number): void {
		this._upperItemIndex = index >= this._upperItemIndex ? index : this._upperItemIndex
		if (this._upperItemIndex > this._arr.length - 1) {
			this.extArr(this._upperItemIndex + 2)
		}
		this._arr[index] = value
	}

	public setArrByIndex(index: number, arr: T): void {
		const endIndex: number = index + arr.length - 1
		this._upperItemIndex = endIndex >= this._upperItemIndex ? endIndex : this._upperItemIndex
		if (this._upperItemIndex > this._arr.length - 1) {
			this.extArr(this._upperItemIndex + 2)
		}
		this._arr.set(arr, index)
	}

	// public clearItemByIndex(index: number, value: number = 0): void {
	// 	if (this._upperItemIndex < index) {
	// 		return
	// 	}
	// 	if (this._upperItemIndex === index) {
	// 		this._upperItemIndex -= 1
	// 	}
	// 	this._arr[index] = value
	// }

	public clearArrByIndex(index: number, arr: T): void {
		if (this._upperItemIndex < index) {
			return
		}
		if (this._upperItemIndex === index) {
			this._upperItemIndex -= 1
		}
		this._arr.set(arr, index)
	}

	public stretchArr(startIndex: number, endIndex: number, size: number): number {
		const oldSize: number = endIndex - startIndex
		const stretchSize: number = size - oldSize
		if (stretchSize >= this._arr.length) {
			this.extArr(stretchSize + 2)
		}
		const subArray: TypedArrayN = this.arr.subarray(startIndex, endIndex)
		const newArr: TypedArrayN = new this.arrayConstructor(size)
		for (let i: number = startIndex; i < endIndex; i++) {
			newArr[i] = subArray[i]
		}
		subArray.set(newArr)
		if (this._upperItemIndex >= endIndex) {
			this._upperItemIndex += stretchSize
		}
		return stretchSize
	}

	public update(): DataBufferGL {
		// this._dataBuffer.submitData(this._arr.slice(0, this._upperItemIndex + 10))
		this._dataBuffer.submitData(this._arr)
		return this._dataBuffer
	}

	public clearArr(): void {
		this._arr = new this.arrayConstructor(this._maxLength)
		this._upperItemIndex = -1
	}

	public clear(): void {
		this._arr = new this.arrayConstructor(this._maxLength)
		this._upperItemIndex = -1
		this._dataBuffer.setSize(1)
		this._dataBuffer.submitData(this._arr.slice(0, 0))
	}
}
