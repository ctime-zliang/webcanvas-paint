export type TPlainObject = {
	[key: string]: any
}

export type TypedArray64 = Float64Array
export type TypedArray32 = Int32Array | Uint32Array | Float32Array
export type TypedArray16 = Int16Array | Uint16Array

export type TypedArrayN = TypedArray16 | TypedArray32 | TypedArray64

export interface ArrayConstructor<T extends TypedArray32> {
	new (length: number): T
	new (buffer: ArrayBuffer): T
}

export type TD2PointItem = [number, number]
export type TD2EdgeItem = [number, number]
export type TD2TriangleIndicesItem = [number, number, number]
