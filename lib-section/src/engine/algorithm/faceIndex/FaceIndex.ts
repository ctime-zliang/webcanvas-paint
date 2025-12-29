import { TD2TriangleIndicesItem } from '../../types/Common'
import { Triangulation } from '../triangulation/Triangulation'

/**
 * 传入一组三角形顶点索引, 输出三角形顶点索引
 * 		将索引列表的第一项设置为最小值
 */
function arrangement(a: number, b: number, c: number): { p: number; q: number; r: number } {
	let p: number = a
	let q: number = b
	let r: number = c
	if (b < c) {
		if (b < a) {
			p = b
			q = c
			r = a
		}
	} else if (c < a) {
		p = c
		q = a
		r = b
	}
	return {
		p,
		q,
		r,
	}
}

function indexCells(triangulation: Triangulation): {
	faceIndex: FaceIndex
	initActive: Array<number>
	initNext: Array<number>
} {
	const cells: Array<TD2TriangleIndicesItem> = triangulation.cells()
	const nc: number = cells.length
	/**
	 * 遍历所有由凸包多边形三角剖分生成的三角形列表
	 * 		将每个三角形的顶点列表重新排序, 使得 cells[n][0] 的顶点索引值为最小值
	 */
	for (let n: number = 0; n < nc; n++) {
		const { p, q, r } = arrangement(cells[n][0], cells[n][1], cells[n][2])
		cells[n][0] = p
		cells[n][1] = q
		cells[n][2] = r
	}
	/**
	 * 将所有由凸包多边形三角剖分生成的三角形按顶点索引排序
	 */
	cells.sort((a: TD2TriangleIndicesItem, b: TD2TriangleIndicesItem): number => {
		return a[0] - b[0] || a[1] - b[1] || a[2] - b[2]
	})
	const flags: Array<number> = new Array(nc)
	for (let i: number = 0; i < flags.length; i++) {
		flags[i] = 0
	}
	/**
	 * 初始化 FaceIndex 类
	 * 		记 allPointsSize 为所有三角形顶点总个数
	 * 		生成长度为 allPointsSize 的 neighbor 列表
	 * 		生成长度为 allPointsSize 的 constraint 列表
	 */
	const allPointsSize: number = 3 * nc
	const faceIndex: FaceIndex = new FaceIndex(cells, new Array(allPointsSize), new Array(allPointsSize), flags, [])
	/**
	 * 存储多边形的外部三角形(多边形"内凹"位置构成的外部三角形)
	 */
	const active: Array<number> = []
	/**
	 * 存储多边形的边界三角形索引列表
	 */
	const next: Array<number> = []
	/**
	 * 遍历所有三角形
	 */
	for (let triangleIndex: number = 0; triangleIndex < nc; triangleIndex++) {
		/**
		 * 遍历当前三角形的每个顶点
		 */
		for (let pointIndex: number = 0; pointIndex < 3; pointIndex++) {
			const ai: number = faceIndex.cells[triangleIndex][pointIndex]
			const bi: number = faceIndex.cells[triangleIndex][(pointIndex + 1) % 3]
			/**
			 * 查找与当前三角形 A = FaceIndex.cells[i] 共用边 [ai, bi] 的另一个三角形 B 的第三个顶点 o_ci
			 */
			const o_ci: number = triangulation.opposite(ai, bi)
			/**
			 * 3 * triangleIndex + pointIndex 即表示第 triangleIndex 个三角形第 pointIndex 个顶点在所有三角形顶点总列表中的索引
			 *
			 * m 将作为对象键写入到对象存储中
			 * m 为当前遍历的三角形某个点的索引值, 同样也可以看做三角形对应边 [ai, bi] 的索引值
			 * 因此 FaceIndex.neighbor 即存储了与共享该边 [ai, bi] 的三角形 B 的索引值
			 * 因此 FaceIndex.constraint 即存储了该边 [ai, bi] 的是否是约束边的断言情况
			 */
			const m: number = 3 * triangleIndex + pointIndex
			/**
			 * 获取另一个三角形 B 在 FaceIndex.cells 中的位置索引
			 * 即当前三角形 A 的边 [ai, bi] 的邻接三角形 B 在 FaceIndex.cells 中的位置索引
			 */
			faceIndex.neighbor[m] = faceIndex.findIndexByFullMatch(bi, ai, o_ci)
			/**
			 * 检查由当前三角形 A 顶点 ai 和 bi 构成的边是否是约束边
			 */
			faceIndex.constraint[m] = triangulation.isConstraint(ai, bi)
			/**
			 * faceIndex.neighbor[m] === -1, 即表示边 [ai, bi] 没有邻接三角形 B
			 * 此时, 边 [ai, bi] 即为虚拟凸多边形的轮廓边
			 * 		如果边 [ai, bi] 在此前提下被检测为约束边
			 * 			则该边为该实际多边形的轮廓边
			 * 		否则该多边形在该边对应的两点处出现了"内凹"
			 */
			if (faceIndex.neighbor[m] < 0) {
				if (faceIndex.constraint[m]) {
					next.push(triangleIndex)
					continue
				}
				active.push(triangleIndex)
				faceIndex.flags[triangleIndex] = 1
			}
		}
	}
	return {
		faceIndex,
		initActive: active,
		initNext: next,
	}
}

function classifyFaces(triangulation: Triangulation): FaceIndex {
	let { faceIndex, initActive: active, initNext: next } = indexCells(triangulation)
	let side: number = 1
	while (active.length > 0 || next.length > 0) {
		while (active.length > 0) {
			const triangleIndex: number = active.pop()!
			if (faceIndex.flags[triangleIndex] === -side) {
				continue
			}
			faceIndex.flags[triangleIndex] = side
			for (let pointIndex: number = 0; pointIndex < 3; pointIndex++) {
				/**
				 * 3 * triangleIndex + pointIndex 即表示第 triangleIndex 个三角形第 pointIndex 个顶点在所有三角形顶点总列表中的索引
				 *
				 * m 为当前指向的三角形某个点的索引值, 同样也可以看做三角形对应边 [pointIndex, pointIndex + 1] 的索引值
				 * 因此此处从 FaceIndex.neighbor 读取出该边 [pointIndex, pointIndex + 1] 对应的三角形 B 在 FaceIndex.cells 中的索引 nIdx
				 */
				const m: number = 3 * triangleIndex + pointIndex
				const nIdx: number = faceIndex.neighbor[m]
				/**
				 * 处理未被标记的邻接三角形 B
				 */
				if (nIdx >= 0 && faceIndex.flags[nIdx] === 0) {
					if (faceIndex.constraint[m]) {
						next.push(nIdx)
						continue
					}
					active.push(nIdx)
					faceIndex.flags[nIdx] = side
				}
			}
		}
		const tmp: Array<number> = next
		next = active
		active = tmp
		next.length = 0
		side = -side
	}
	return faceIndex
}

class FaceIndex {
	/**
	 * 由凸包多边形三角剖分生成的所有三角形定点列表(按三角形分组)
	 */
	private _cells: Array<TD2TriangleIndicesItem>
	/**
	 * 邻接索引
	 */
	private _neighbor: Array<number>
	/**
	 * 约束标记
	 */
	private _constraint: Array<boolean>
	private _flags: Array<number>
	/**
	 * 边界三角形顶点索引列表
	 */
	private _boundary: Array<TD2TriangleIndicesItem>
	constructor(
		cells: Array<TD2TriangleIndicesItem>,
		neighbor: Array<number>,
		constraint: Array<boolean>,
		flags: Array<number>,
		boundary: Array<TD2TriangleIndicesItem>
	) {
		this._cells = cells
		this._neighbor = neighbor
		this._constraint = constraint
		this._flags = flags
		this._cells = cells
		this._boundary = boundary
	}

	public get cells(): Array<TD2TriangleIndicesItem> {
		return this._cells
	}
	public set cells(value: Array<TD2TriangleIndicesItem>) {
		this._cells = value
	}

	public get neighbor(): Array<number> {
		return this._neighbor
	}
	public set neighbor(value: Array<number>) {
		this._neighbor = value
	}

	public get constraint(): Array<boolean> {
		return this._constraint
	}
	public set constraint(value: Array<boolean>) {
		this._constraint = value
	}

	public get flags(): Array<number> {
		return this._flags
	}
	public set flags(value: Array<number>) {
		this._flags = value
	}

	public get boundary(): Array<TD2TriangleIndicesItem> {
		return this._boundary
	}
	public set boundary(value: Array<TD2TriangleIndicesItem>) {
		this._boundary = value
	}

	/**
	 * 查找由顶点 a b c 尝试构成的三角形是否存在于 this.cells 中, 并返回在 this.cells 中的索引
	 * 		未找到时返回 -1
	 * 		通过索引逐项逐项匹配
	 */
	public findIndexByFullMatch(a: number, b: number, c: number): number {
		/**
		 * 由于 this.cells 已经被标准化处理(参考函数 indexCells)
		 * 在查找之前需要将 a b c 按同样的流程标准化处理
		 */
		const { p, q, r } = arrangement(a, b, c)
		if (p < 0) {
			return -1
		}
		const key: TD2TriangleIndicesItem = [p, q, r]
		let idx: number = -1
		for (let n: number = 0; n < this.cells.length; n++) {
			if (this.cells[n][0] === key[0] && this.cells[n][1] === key[1] && this.cells[n][2] === key[2]) {
				idx = n
				break
			}
		}
		return idx
	}
}

export function createCells(triangulation: Triangulation): Array<TD2TriangleIndicesItem> {
	const faceIndex: FaceIndex = classifyFaces(triangulation)
	const resultCells: Array<TD2TriangleIndicesItem> = []
	const target: number = -1
	for (let i: number = 0; i < faceIndex.cells.length; i++) {
		if (faceIndex.flags[i] === target) {
			resultCells.push(faceIndex.cells[i])
		}
	}
	return resultCells
}
