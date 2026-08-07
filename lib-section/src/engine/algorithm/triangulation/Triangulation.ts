import { TD2EdgeItem, TD2TriangleIndicesItem } from '../../types/Common'

/**
 * 从邻接列表中移除一对相邻顶点 (j, k)
 *
 * 		输入:
 * 			list: 某个顶点的邻接顶点列表(平铺的成对存储)
 * 			j: 要移除的第一个顶点索引
 * 			k: 要移除的第二个顶点索引
 *
 * 算法说明:
 * 		- stars 中每个顶点的邻接列表以 [v1, v2, v3, v4, ...] 格式存储,
 * 		- 其中 (v1, v2) 表示一个三角形的另外两个顶点, (v3, v4) 表示另一个三角形, 依此类推
 * 		- 移除时, 用列表末尾的一对替换被删除的一对 (O(1) 删除, 类似 swap - remove)
 */
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

/**
 * Triangulation - 约束 Delaunay 三角剖分数据结构
 *
 * 概述:
 * 管理三角剖分的拓扑结构, 支持:
 * 		- 邻接查询(给定一条边, 找对面的三角形)
 * 		- 三角形的增删操作
 * 		- 边翻转(Delaunay 优化的核心操作)
 * 		- 约束边标记
 *
 * 数据结构 - Star 邻接表:
 * 		- stars[i] 存储与顶点 i 相关的所有三角形信息
 * 		- 格式为平铺的成对列表: [a1, b1, a2, b2, ...]
 * 			其中 (i, a_k, b_k) 构成一个三角形
 *
 * 案例:
 * 		假设有三角形 (0, 1, 2) 和 (0, 2, 3):
 * 			stars[0] = [1, 2, 2, 3]
 * 				顶点 0 参与: △(0, 1, 2) 和 △(0, 2, 3)
 * 			stars[1] = [2, 0]
 * 				顶点 1 参与: △(1, 2, 0)
 * 			stars[2] = [0, 1, 3, 0]
 * 				顶点 2 参与: △(2, 0, 1) 和 △(2, 3, 0)
 * 			stars[3] = [0, 2]
 * 				顶点 3 参与: △(3, 0, 2)
 *
 * 边翻转操作案例 (Flip):
 * 		翻转边 (i, j):
 * 			将共享边 ij 的两个三角形 △(i, j, a) 和 △(j, i, b) 替换为 △(i, b, a) 和 △(j, a, b)
 *
 *    		翻转前:          翻转后:
 *      	    a                a
 *     		   /|\              / \
 *    		  / | \            /   \
 *   		 i--+--j    →    i  ×  j
 *    		  \ | /            \   /
 *     		   \|/              \ /
 *      		b                b
 *
 * 			边从 i - j 变为 a - b, 改善局部 Delaunay 性质
 */
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

/**
 * 创建三角剖分实例的工厂函数
 *
 * 		输入:
 * 			numVerts 顶点总数
 * 			edges 约束边列表 [[v1, v2], ...]
 * 		返回:
 * 			初始化好的 Triangulation 实例(尚未包含三角形, 需后续填充)
 *
 * 算法说明:
 * 		- 将所有约束边标准化: 确保 edge[0] < edge[1](便于后续二分查找或线性查找)
 * 		- 按字典序排序约束边数组
 * 		- 初始化空的邻接表 stars (每个顶点一个空数组)
 */
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
