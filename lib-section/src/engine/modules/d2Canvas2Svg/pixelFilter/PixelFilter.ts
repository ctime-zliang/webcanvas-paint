/**
 * 素到矢量图形的转换管线 (Pixel-to-Vector Pipeline)
 * 		将 Canvas 上的像素数据转换为矢量图形(线段图或三角形网格)
 *
 * 处理管线 (Pipeline):
 * 		Canvas 像素 -> 等值线提取(SurfaceNets) -> 线段简化() -> Graph / 三角剖分 / Triangle
 *
 * 输出类型:
 *   	1. GRAPH: 像素 → 等值线 → 简化 → 线段图 (用于 SVG stroke/path)
 *   	2. TRIANGLE: 像素 → 等值线 → 简化 → 三角剖分 → 三角形网格 (用于 SVG fill)
 */

import { View3DUint8Clamped } from '../../../math/NDArray'
import { Simplifys } from '../simplify/Simplifys'
import { SurfaceNets } from '../surfaceNets/SurfaceNets'
import { Cdt2ds } from '../cdt2ds/Cdt2ds'
import { TD2EdgeItem, TD2PointItem, TD2TriangleIndicesItem } from '../../../types/Common'

/**
 * 管线处理结果类型
 *
 * graphs: 线段图结果 (GRAPH 模式)
 *   - edges: 边索引数组 [[i, j], ...]
 *   - positions: 顶点坐标数组 [[x, y], ...]
 *
 * triangles: 三角形网格结果 (TRIANGLE 模式)
 *   - indices: 三角形索引数组 [[a, b, c], ...]
 *   - positions: 顶点坐标数组 [[x, y], ...]
 */
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

	/**
	 * 执行像素到矢量的转换管线
	 * 		输入:
	 * 			pixels: 3D 像素数据视图 (来自 Canvas getImageData)
	 */
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

	/**
	 * 像素 → 线段图 管线
	 * 		输入:
	 * 			pixels: 输入像素数据
	 * 		输出:
	 * 			{ edges, positions }: 轮廓线段图
	 *
	 * 处理流程:
	 *   	1. SurfaceNets.process(pixels, 128)
	 *      	从像素中提取等值线轮廓(阈值 = 128, 即白色区域的边界)
	 *   	2. Simplifys.proecss(cells, positions, 0.25) [可选]
	 *      	简化轮廓: 移除距离连线 < 0.25 像素的冗余顶点, 减少数据量 60 ~ 80%, 同时保持视觉上的轮廓精度
	 */
	private covertPixel2GraphLines(
		pixels: View3DUint8Clamped,
		simplify: boolean
	): {
		edges: Array<Array<number>>
		positions: Array<[number, number]>
	} {
		/**
		 * 等值线提取: 将像素边界转为顶点和边
		 */
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

	/**
	 * 像素 → 三角形网格 管线
	 * 		输入:
	 * 			pixels: 输入像素数据
	 * 		输出:
	 * 			{ indices, positions }: 三角形网格
	 *
	 * 处理流程:
	 *   	1. SurfaceNets.process(pixels, 128)
	 *      	从像素中提取等值线轮廓
	 *   	2. Simplifys.proecss(cells, positions, 0.25) [可选]
	 *      	简化轮廓线段
	 *   	3. Cdt2ds.process(positions, edges)
	 *      	对简化后的多边形轮廓执行约束 Delaunay 三角剖分, 将封闭轮廓内部填充为三角形网格
	 */
	private covertPixel2Triangles(
		pixels: View3DUint8Clamped,
		simplify: boolean = true
	): {
		indices: Array<Array<number>>
		positions: Array<TD2PointItem>
	} {
		/**
		 * 等值线提取: 将像素边界转为顶点和边
		 */
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
		 * 约束 Delaunay 三角剖分
		 * 		将轮廓多边形(由顶点 + 边定义)分解为三角形网格
		 * 		仅生成位于轮廓内部的三角形(外部区域被过滤)
		 */
		const indices: Array<TD2TriangleIndicesItem> = Cdt2ds.process(contour.positions, contour.edges)
		return {
			indices,
			positions: contour.positions,
		}
	}
}
