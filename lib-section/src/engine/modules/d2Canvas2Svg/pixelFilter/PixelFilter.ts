import { View3DUint8Clamped } from '../../../math/NDArray'
import { Simplifys } from '../simplify/Simplifys'
import { SurfaceNets } from '../surfaceNets/SurfaceNets'
import { Cdt2ds } from '../cdt2ds/Cdt2ds'
import { TD2EdgeItem, TD2PointItem, TD2TriangleIndicesItem } from '../../../types/Common'

export type TPixelProgressResult = {
	triangles?: {
		indices: Array<Array<number>>
		positions: Array<TD2PointItem>
	}
	graphs?: {
		edges: Array<Array<number>>
		positions: Array<TD2PointItem>
	}
}

export enum EPixelFilterResult {
	GRAHP = 'GRAHP',
	TRIANGLE = 'TRIANGLE',
}

export class PixelFilter {
	private _type: EPixelFilterResult
	constructor(type: EPixelFilterResult) {
		this._type = type
	}

	public process(pixels: View3DUint8Clamped): TPixelProgressResult {
		try {
			if (this._type === EPixelFilterResult.TRIANGLE) {
				return {
					triangles: this.covertPixel2Triangles(pixels, true),
				}
			}
			return {
				graphs: this.covertPixel2GraphLines(pixels, true),
			}
		} catch (e: any) {
			console.error(e)
		}
		return {
			triangles: null!,
			graphs: null!,
		}
	}

	private covertPixel2GraphLines(
		pixels: View3DUint8Clamped,
		simplify: boolean
	): {
		edges: Array<Array<number>>
		positions: Array<[number, number]>
	} {
		const surface: {
			cells: Array<TD2EdgeItem>
			positions: Array<TD2PointItem>
		} = SurfaceNets.process(pixels, 128)
		const contour: {
			edges: Array<TD2EdgeItem>
			positions: Array<TD2PointItem>
		} = { edges: null!, positions: null! }
		if (simplify) {
			const { edges, positions } = Simplifys.proecss(surface.cells, surface.positions, 0.25)
			contour.edges = edges
			contour.positions = positions
		} else {
			contour.edges = surface.cells
			contour.positions = surface.positions
		}
		return {
			edges: contour.edges,
			positions: contour.positions,
		}
	}

	private covertPixel2Triangles(
		pixels: View3DUint8Clamped,
		simplify: boolean = true
	): {
		indices: Array<Array<number>>
		positions: Array<TD2PointItem>
	} {
		const surface: {
			cells: Array<TD2EdgeItem>
			positions: Array<TD2PointItem>
		} = SurfaceNets.process(pixels, 128)
		const contour: {
			edges: Array<TD2EdgeItem>
			positions: Array<TD2PointItem>
		} = { edges: [], positions: [] }
		if (simplify) {
			const { edges, positions } = Simplifys.proecss(surface.cells, surface.positions, 0.25)
			contour.edges = edges
			contour.positions = positions
		} else {
			contour.edges = surface.cells as Array<TD2EdgeItem>
			contour.positions = surface.positions
		}
		/**
		 * 三角剖分
		 */
		const indices: Array<TD2TriangleIndicesItem> = Cdt2ds.process(contour.positions, contour.edges)
		return {
			indices,
			positions: contour.positions,
		}
	}
}
