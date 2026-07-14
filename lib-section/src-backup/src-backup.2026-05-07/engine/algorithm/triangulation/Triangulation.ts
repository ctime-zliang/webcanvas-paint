import { TD2EdgeItem, TD2TriangleIndicesItem } from '../../types/Common'

function removePair(list: Array<number>, j: number, k: number): void {
	for (let i: number = 1, n: number = list.length; i < n; i += 2) {
		if (list[i - 1] === j && list[i] === k) {
			list[i - 1] = list[n - 2]
			list[i] = list[n - 1]
			list.length = n - 2
			break
		}
	}
}

export class Triangulation {
	/**
	 * 顶点 i 所连接的所有三角形的邻接顶点(除去当前顶点 i 之外的另外两个顶点)列表(平铺)
	 * 		[
	 * 			[1, 2, 8, 1, 9, 8, 5, 9]  // 即顶点索引 0 可分别与 (1, 2), (8, 1), (9, 8), ... 构成三角形
	 * 			[2, 0, 8, 2, 0, 8]
	 * 		]
	 */
	private _stars: Array<Array<number>>
	private _edges: Array<TD2EdgeItem>
	constructor(stars: Array<Array<number>>, edges: Array<TD2EdgeItem>) {
		this._stars = stars
		this._edges = edges
	}

	public get stars(): Array<Array<number>> {
		return this._stars
	}
	public set stars(value: Array<Array<number>>) {
		this._stars = value
	}

	public get edges(): Array<TD2EdgeItem> {
		return this._edges
	}
	public set edges(value: Array<TD2EdgeItem>) {
		this._edges = value
	}

	/**
	 * 判断顶点 i 和 j 组成的边是否是约束边
	 */
	public isConstraint(i: number, j: number): boolean {
		const e: TD2EdgeItem = [Math.min(i, j), Math.max(i, j)]
		let idx: number = -1
		for (let i: number = 0; i < this.edges.length; i++) {
			if (this.edges[i][0] === e[0] && this.edges[i][1] === e[1]) {
				idx = i
				break
			}
		}
		return idx >= 0
	}

	/**
	 * 从 this.stars 中移除由顶点 i j k 组成的三角形连接关系
	 */
	public removeTriangle(i: number, j: number, k: number): void {
		removePair(this.stars[i], j, k)
		removePair(this.stars[j], k, i)
		removePair(this.stars[k], i, j)
	}

	/**
	 * 向 this.stars 中新增由顶点 i j k 组成的三角形连接关系
	 */
	public addTriangle(i: number, j: number, k: number): void {
		this.stars[i].push(j, k)
		this.stars[j].push(k, i)
		this.stars[k].push(i, j)
	}

	/**
	 * 查找顶点 refi 的邻接顶点列表中, 与顶点 j 共同构成三角形的第三个顶点
	 */
	public opposite(refi: number, j: number): number {
		const list: Array<number> = this.stars[refi]
		for (let k: number = 1, n: number = list.length; k < n; k += 2) {
			if (list[k] === j) {
				return list[k - 1]
			}
		}
		return -1
	}

	/**
	 * 翻转边 (i, j), 即将其相邻的两个三角形拆分为另外两个新的三角形
	 */
	public flip(i: number, j: number): void {
		const a: number = this.opposite(j, i)
		const b: number = this.opposite(i, j)
		this.removeTriangle(i, j, a)
		this.removeTriangle(j, i, b)
		this.addTriangle(i, b, a)
		this.addTriangle(j, a, b)
	}

	/**
	 * 生成三角形顶点列表
	 */
	public cells(): Array<TD2TriangleIndicesItem> {
		const result: Array<TD2TriangleIndicesItem> = []
		for (let i: number = 0, n: number = this.stars.length; i < n; i++) {
			for (let j: number = 0, m: number = this.stars[i].length; j < m; j += 2) {
				let s: number = this.stars[i][j]
				let t: number = this.stars[i][j + 1]
				if (i < Math.min(s, t)) {
					result.push([i, s, t])
				}
			}
		}
		return result
	}
}

export function createTriangulation(numVerts: number, edges: Array<TD2EdgeItem>): Triangulation {
	const filterEdges: Array<TD2EdgeItem> = edges
		.map((e: TD2EdgeItem): TD2EdgeItem => {
			return [Math.min(e[0], e[1]), Math.max(e[0], e[1])]
		})
		.sort((a: TD2EdgeItem, b: TD2EdgeItem): number => {
			return a[0] - b[0] || a[1] - b[1]
		})
	const stars: Array<Array<number>> = new Array(numVerts)
	for (let i: number = 0; i < numVerts; i++) {
		stars[i] = []
	}
	return new Triangulation(stars, filterEdges)
}
