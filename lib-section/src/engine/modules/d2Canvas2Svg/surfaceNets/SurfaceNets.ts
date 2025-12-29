import { TD2EdgeItem, TD2PointItem } from '../../../types/Common'
import { View3DUint8Clamped } from '../../../math/NDArray'
import { mallocUint32 } from './Mallocs'

type ICreateSurfaceExtractorArgsVertex = (...args: Array<any>) => void
type ICreateSurfaceExtractorArgsPhase = (...args: Array<any>) => number
type ICreateSurfaceExtractorArgsCell = (...args: Array<any>) => void

interface ICreateSurfaceExtractorArgs {
	order: Array<number>
	phase: ICreateSurfaceExtractorArgsPhase
	vertex: ICreateSurfaceExtractorArgsVertex
	cell: ICreateSurfaceExtractorArgsCell
}

function createHandleParam(order: Array<number>): ICreateSurfaceExtractorArgs {
	const handleParam: ICreateSurfaceExtractorArgs = {
		order,
		phase: function (p: number, a: number, b: number, c: number): number {
			return +(p > c) | 0
		},
		vertex: function (
			d0: number,
			d1: number,
			v0: number,
			v1: number,
			v2: number,
			v3: number,
			p0: number,
			p1: number,
			p2: number,
			p3: number,
			a: Array<Array<number>>,
			b: Array<Array<number>>,
			c: number
		): void {
			const m: number = ((p0 << 0) + (p1 << 1) + (p2 << 2) + (p3 << 3)) | 0
			if (m === 0 || m === 15) {
				return
			}
			const yFlip: number = -1
			switch (m) {
				case 0: {
					a.push([d0 - 0.5, (d1 - 0.5) * yFlip])
					break
				}
				case 1: {
					a.push([d0 - 0.25 - (0.25 * (v1 + v0 - 2 * c)) / (v0 - v1), (d1 - 0.25 - (0.25 * (v2 + v0 - 2 * c)) / (v0 - v2)) * yFlip])
					break
				}
				case 2: {
					a.push([d0 - 0.75 - (0.25 * (-v1 - v0 + 2 * c)) / (v1 - v0), (d1 - 0.25 - (0.25 * (v3 + v1 - 2 * c)) / (v1 - v3)) * yFlip])
					break
				}

				case 3: {
					a.push([d0 - 0.5, (d1 - 0.5 - (0.5 * (v2 + v0 + v3 + v1 - 4 * c)) / (v0 - v2 + v1 - v3)) * yFlip])
					break
				}
				case 4: {
					a.push([d0 - 0.25 - (0.25 * (v3 + v2 - 2 * c)) / (v2 - v3), (d1 - 0.75 - (0.25 * (-v2 - v0 + 2 * c)) / (v2 - v0)) * yFlip])
					break
				}
				case 5: {
					a.push([d0 - 0.5 - (0.5 * (v1 + v0 + v3 + v2 - 4 * c)) / (v0 - v1 + v2 - v3), (d1 - 0.5) * yFlip])
					break
				}
				case 6: {
					a.push([
						d0 - 0.5 - (0.25 * (-v1 - v0 + v3 + v2)) / (v1 - v0 + v2 - v3),
						(d1 - 0.5 - (0.25 * (-v2 - v0 + v3 + v1)) / (v2 - v0 + v1 - v3)) * yFlip,
					])
					break
				}
				case 7: {
					a.push([d0 - 0.75 - (0.25 * (v3 + v2 - 2 * c)) / (v2 - v3), (d1 - 0.75 - (0.25 * (v3 + v1 - 2 * c)) / (v1 - v3)) * yFlip])
					break
				}
				case 8: {
					a.push([d0 - 0.75 - (0.25 * (-v3 - v2 + 2 * c)) / (v3 - v2), (d1 - 0.75 - (0.25 * (-v3 - v1 + 2 * c)) / (v3 - v1)) * yFlip])
					break
				}
				case 9: {
					a.push([
						d0 - 0.5 - (0.25 * (v1 + v0 + -v3 - v2)) / (v0 - v1 + v3 - v2),
						(d1 - 0.5 - (0.25 * (v2 + v0 + -v3 - v1)) / (v0 - v2 + v3 - v1)) * yFlip,
					])
					break
				}
				case 10: {
					a.push([d0 - 0.5 - (0.5 * (-v1 - v0 + -v3 - v2 + 4 * c)) / (v1 - v0 + v3 - v2), (d1 - 0.5) * yFlip])
					break
				}
				case 11: {
					a.push([d0 - 0.25 - (0.25 * (-v3 - v2 + 2 * c)) / (v3 - v2), (d1 - 0.75 - (0.25 * (v2 + v0 - 2 * c)) / (v0 - v2)) * yFlip])
					break
				}
				case 12: {
					a.push([d0 - 0.5, (d1 - 0.5 - (0.5 * (-v2 - v0 + -v3 - v1 + 4 * c)) / (v2 - v0 + v3 - v1)) * yFlip])
					break
				}
				case 13: {
					a.push([d0 - 0.75 - (0.25 * (v1 + v0 - 2 * c)) / (v0 - v1), (d1 - 0.25 - (0.25 * (-v3 - v1 + 2 * c)) / (v3 - v1)) * yFlip])
					break
				}
				case 14: {
					a.push([d0 - 0.25 - (0.25 * (-v1 - v0 + 2 * c)) / (v1 - v0), (d1 - 0.25 - (0.25 * (-v2 - v0 + 2 * c)) / (v2 - v0)) * yFlip])
					break
				}
				case 15: {
					a.push([d0 - 0.5, (d1 - 0.5) * yFlip])
					break
				}
			}
		},
		cell: function (
			v0: number,
			v1: number,
			c0: number,
			c1: number,
			p0: number,
			p1: number,
			a: Array<Array<number>>,
			b: Array<Array<number>>,
			c: number
		): void {
			if (p0) {
				b.push([v0, v1])
			} else {
				b.push([v1, v0])
			}
		},
	}
	return handleParam
}

function fillVertexData(
	handleParam: ICreateSurfaceExtractorArgs,
	pixels: View3DUint8Clamped,
	verts: Array<Array<number>>,
	cells: Array<Array<number>>,
	level: number
): void {
	const shape0: number = pixels.shape[0] | 0
	const shape1: number = pixels.shape[1] | 0
	const pixelData: Uint8ClampedArray = pixels.data
	const stride0: number = pixels.stride[0] | 0
	const stride1: number = pixels.stride[1] | 0
	let p0: number = pixels.offset | 0
	let c0_0: number = 0
	let d0_1: number = -stride0 | 0
	let c0_1: number = 0
	let d0_2: number = -stride1 | 0
	let c0_2: number = 0
	let d0_3: number = (-stride0 - stride1) | 0
	let c0_3: number = 0
	let u0_0: number = stride0 | 0
	let u0_1: number = (stride1 - stride0 * shape0) | 0
	let i0: number = 0
	let i1: number = 0
	let N: number = 0
	let Q: number = (2 * shape0) | 0
	let P: Uint32Array = mallocUint32(Q)
	let V: Uint32Array = mallocUint32(Q)
	let X: number = 0
	let b0: number = 0
	let e1: number = -1 | 0
	let y1: number = -1 | 0
	let b1: number = 0
	let e2: number = -shape0 | 0
	let y2: number = shape0 | 0
	let b2: number = 0
	let e3: number = (-shape0 - 1) | 0
	let y3: number = (shape0 - 1) | 0
	let b3: number = 0
	let v0: number = 0
	let T: number = 0
	for (i0 = 0; i0 < shape0; ++i0) {
		P[X++] = handleParam.phase(pixelData[p0], verts, cells, level)
		p0 += u0_0
	}
	p0 += u0_1
	if (shape1 > 0) {
		i1 = 1
		P[X++] = handleParam.phase(pixelData[p0], verts, cells, level)
		p0 += u0_0
		if (shape0 > 0) {
			i0 = 1
			c0_0 = pixelData[p0]
			b0 = P[X] = handleParam.phase(c0_0, verts, cells, level)
			b1 = P[X + e1]
			b2 = P[X + e2]
			b3 = P[X + e3]
			if (b0 !== b1 || b0 !== b2 || b0 !== b3) {
				c0_1 = pixelData[p0 + d0_1]
				c0_2 = pixelData[p0 + d0_2]
				c0_3 = pixelData[p0 + d0_3]
				handleParam.vertex(i0, i1, c0_0, c0_1, c0_2, c0_3, b0, b1, b2, b3, verts, cells, level)
				v0 = V[X] = N++
			}
			X += 1
			p0 += u0_0
			for (i0 = 2; i0 < shape0; ++i0) {
				c0_0 = pixelData[p0]
				b0 = P[X] = handleParam.phase(c0_0, verts, cells, level)
				b1 = P[X + e1]
				b2 = P[X + e2]
				b3 = P[X + e3]
				if (b0 !== b1 || b0 !== b2 || b0 !== b3) {
					c0_1 = pixelData[p0 + d0_1]
					c0_2 = pixelData[p0 + d0_2]
					c0_3 = pixelData[p0 + d0_3]
					handleParam.vertex(i0, i1, c0_0, c0_1, c0_2, c0_3, b0, b1, b2, b3, verts, cells, level)
					v0 = V[X] = N++
					if (b3 !== b1) {
						handleParam.cell(V[X + e1], v0, c0_3, c0_1, b3, b1, verts, cells, level)
					}
				}
				X += 1
				p0 += u0_0
			}
		}
		p0 += u0_1
		X = 0
		T = e1
		e1 = y1
		y1 = T
		T = e2
		e2 = y2
		y2 = T
		T = e3
		e3 = y3
		y3 = T
		for (i1 = 2; i1 < shape1; ++i1) {
			P[X++] = handleParam.phase(pixelData[p0], verts, cells, level)
			p0 += u0_0
			if (shape0 > 0) {
				i0 = 1
				c0_0 = pixelData[p0]
				b0 = P[X] = handleParam.phase(c0_0, verts, cells, level)
				b1 = P[X + e1]
				b2 = P[X + e2]
				b3 = P[X + e3]
				if (b0 !== b1 || b0 !== b2 || b0 !== b3) {
					c0_1 = pixelData[p0 + d0_1]
					c0_2 = pixelData[p0 + d0_2]
					c0_3 = pixelData[p0 + d0_3]
					handleParam.vertex(i0, i1, c0_0, c0_1, c0_2, c0_3, b0, b1, b2, b3, verts, cells, level)
					v0 = V[X] = N++
					if (b3 !== b2) {
						handleParam.cell(V[X + e2], v0, c0_2, c0_3, b2, b3, verts, cells, level)
					}
				}
				X += 1
				p0 += u0_0
				for (i0 = 2; i0 < shape0; ++i0) {
					c0_0 = pixelData[p0]
					b0 = P[X] = handleParam.phase(c0_0, verts, cells, level)
					b1 = P[X + e1]
					b2 = P[X + e2]
					b3 = P[X + e3]
					if (b0 !== b1 || b0 !== b2 || b0 !== b3) {
						c0_1 = pixelData[p0 + d0_1]
						c0_2 = pixelData[p0 + d0_2]
						c0_3 = pixelData[p0 + d0_3]
						handleParam.vertex(i0, i1, c0_0, c0_1, c0_2, c0_3, b0, b1, b2, b3, verts, cells, level)
						v0 = V[X] = N++
						if (b3 !== b2) {
							handleParam.cell(V[X + e2], v0, c0_2, c0_3, b2, b3, verts, cells, level)
						}
						if (b3 !== b1) {
							handleParam.cell(V[X + e1], v0, c0_3, c0_1, b3, b1, verts, cells, level)
						}
					}
					X += 1
					p0 += u0_0
				}
			}
			if (i1 & 1) {
				X = 0
			}
			T = e1
			e1 = y1
			y1 = T
			T = e2
			e2 = y2
			y2 = T
			T = e3
			e3 = y3
			y3 = T
			p0 += u0_1
		}
	}
}

export class SurfaceNets {
	static CACHE: {
		[key: string]: (
			pixels: View3DUint8Clamped,
			level: number
		) => {
			positions: Array<TD2PointItem>
			cells: Array<TD2EdgeItem>
		}
	} = {}

	/**
	 * 将阵列化像素图形分解成顶点坐标
	 */
	static process(
		pixels: View3DUint8Clamped,
		level: number
	): {
		positions: Array<TD2PointItem>
		cells: Array<TD2EdgeItem>
	} {
		const typesig: string = pixels.order.join() + '-' + pixels.dtype
		let proc: (
			pixels: View3DUint8Clamped,
			level: number
		) => {
			positions: Array<TD2PointItem>
			cells: Array<TD2EdgeItem>
		} = SurfaceNets.CACHE[typesig]
		level = +level || 0.0
		if (!proc) {
			proc = SurfaceNets.CACHE[typesig] = function (
				pixels: View3DUint8Clamped,
				level: number
			): {
				positions: Array<TD2PointItem>
				cells: Array<TD2EdgeItem>
			} {
				const handleParam: ICreateSurfaceExtractorArgs = createHandleParam(pixels.order)
				const verts: Array<TD2PointItem> = []
				const cells: Array<TD2EdgeItem> = []
				fillVertexData(handleParam, pixels, verts, cells, level)
				return {
					positions: verts,
					cells: cells,
				}
			}
		}
		return proc(pixels, level)
	}
}
