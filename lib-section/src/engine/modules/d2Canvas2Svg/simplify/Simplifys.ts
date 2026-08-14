/**
 * 轮廓线段简化算法 (Graph Simplification)
 *
 * 功能概述:
 *   	对 SurfaceNets 提取的轮廓线段进行简化, 移除不重要的顶点, 减少顶点和边的数量, 同时保持轮廓的几何形状特征
 *
 * 核心算法原理:
 *   	基于「面积误差权重」的贪心顶点消除算法:
 *   		- 将轮廓视为有向图: 每个顶点有唯一的前驱 (inv) 和后继 (outv)
 *   		- 对每个可移除的顶点计算其「误差权重」:
 *      		weight = area (前驱, 当前点, 后继) / distance (前驱, 后继), 即: 三角形面积 / 底边长度 = 点到边的垂直距离
 *   		- 使用最小堆 (Min-Heap) 管理所有顶点, 按权重排序
 *   		- 贪心地从堆顶取出权重最小的顶点进行消除:
 *      		- 将其标记为 dead
 *      		- 更新前驱和后继的连接关系
 *      		- 重新计算前驱和后继的权重并更新堆
 *   		- 当堆顶权重 > minArea 阈值时停止
 *   		- 用存活的顶点重建边集合
 *
 * 该算法等价于 Visvalingam-Whyatt 算法的变体, 适用于图结构
 *
 * 误差权重的几何含义:
 *   	errorWeight(P, A, B) = |cross(PA, PB)| / |AB| = 点 P 到直线 AB 的垂直距离
 *   	该值越小说明顶点 P 越接近其前后两点的连线, 移除后形状变化越小
 *
 * 时间复杂度: O(n log(n))
 *   	- 堆操作: O(log(n))
 *   	- 每个顶点最多被处理一次: O(n)
 */

import { TD2EdgeItem, TD2PointItem } from '../../../types/Common'
import { orient } from '../../../algorithm/geometry/Orients'

/**
 * 计算顶点的误差权重(即点到相邻两点连线的垂直距离)
 *
 * 		输入:
 * 			base: 待评估的顶点坐标
 * 			a: 前驱顶点坐标
 * 			b: 后继顶点坐标
 * 		输出:
 * 			误差权重值(非负)
 *
 * 算法:
 *   	weight = |orient(base, a, b)| / |AB|
 *   		orient() 返回三角形 (base, a, b) 的有符号面积的 2 倍
 *   		|AB| = sqrt((ax - bx)² + (ay - by)²) 为前驱到后继的距离
 *  		 weight = 面积 / 底边长 = 三角形的高 = 点到线段的距离
 *
 * 案例:
 *   	- 三点共线: base = [1, 1], a = [0, 0], b = [2, 2]
 *   		errorWeight([1, 1], [0, 0], [2, 2])  // (点在线上, 可安全移除)
 *
 *   	- 三点成直角三角形: base = [1,0], a = [0,0], b = [0,1]
 *   		errorWeight([1, 0], [0, 0], [0, 1])  // 1.0 (距离较大, 不宜移除)
 */
function errorWeight(base: TD2PointItem, a: Array<number>, b: Array<number>): number {
	/**
	 * orient 返回三角形有符号面积的 2 倍, 取绝对值作为面积度量
	 */
	const area: number = Math.abs(orient(base, a, b))
	/**
	 * 前驱到后继的欧几里得距离(即三角形底边长度)
	 */
	const perim: number = Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2))
	/**
	 * 面积/底边 = 三角形的高 = 点到 AB 连线的垂直距离
	 */
	return area / perim
}

/**
 * 比较两个单元格(索引数组)的字典序
 *
 * 		输入:
 * 			a: 第一个单元格
 * 			b: 第二个单元格
 * 		输出:
 * 			负数 (a < b), 0 (相等), 正数 (a > b)
 *
 * 比较规则:
 *   	- 先比较长度
 *   	- 长度相同时, 对不同维度使用优化的比较策略:
 *      	- 0 维: 始终相等
 *      	- 1 维: 直接比较元素
 *      	- 2 维(边): 先比较元素和, 再比较最小元素
 *      	- 3 维(三角形): 多级和 / 最小值比较
 *      	- 高维: 排序后逐元素比较
 *
 * 案例:
 *   	- compareCells([0, 1], [0, 2])  // -1 (和相同, 最小值相同, 但第二元素更小)
 *   	- compareCells([1, 2], [0, 3])  // 0  (和相等 = 3, min 相等 = 0... 实际 min(1, 2) = 1 > min(0, 3) = 0 // 正数)
 */
function compareCells(a: Array<number>, b: Array<number>): number {
	let n: number = a.length
	/**
	 * 优先按长度排序
	 */
	let t: number = a.length - b.length
	if (t) {
		return t
	}
	switch (n) {
		case 0:
			return 0
		case 1:
			return a[0] - b[0]
		case 2: {
			/**
			 * 边的比较: 先比较索引和(无序标识), 再比较最小索引
			 */
			const d: number = a[0] + a[1] - (b[0] + b[1])
			if (d) {
				return d
			}
			return Math.min(a[0], a[1]) - Math.min(b[0], b[1])
		}
		case 3: {
			/**
			 * 三角形的比较: 多级比较确保唯一排序
			 */
			const l1: number = a[0] + a[1]
			const m1: number = b[0] + b[1]
			let d: number = l1 + a[2] - (m1 + b[2])
			if (d) {
				return d
			}
			const l0: number = Math.min(a[0], a[1])
			const m0: number = Math.min(b[0], b[1])
			d = Math.min(l0, a[2]) - Math.min(m0, b[2])
			if (d) {
				return d
			}
			return Math.min(l0 + a[2], l1) - Math.min(m0 + b[2], m1)
		}
		default: {
			/**
			 * 高维: 排序后逐元素比较
			 */
			const as: Array<number> = a.slice(0)
			as.sort()
			const bs: Array<number> = b.slice(0)
			bs.sort()
			for (let i: number = 0; i < n; i++) {
				t = as[i] - bs[i]
				if (t) {
					return t
				}
			}
			return 0
		}
	}
}

/**
 * 对单元格数组进行规范化排序
 * 使单元格数组具有确定性的顺序, 便于后续去重
 *
 * 		输入:
 * 			cells: 待排序的单元格数组
 * 			attr: 可选的属性数组(与 cells 一一对应, 同步排序)
 * 		输出:
 * 			排序后的 cells 数组(原地修改)
 *
 * 案例:
 *   	- normalize([[2, 3], [0, 1], [1, 2]])  // [[0, 1], [1, 2], [2, 3]]  (按 compareCells 排序)
 */
function normalize(cells: Array<Array<number>>, attr: Array<Array<number>> = undefined!) {
	if (attr) {
		/**
		 * 带属性的排序: 将 cells 和 attr 打包后一起排序
		 */
		const len: number = cells.length
		const zipped: Array<Array<Array<number>>> = new Array(len)
		for (let i: number = 0; i < len; i++) {
			zipped[i] = [cells[i], attr[i]]
		}
		zipped.sort((a: Array<Array<number>>, b: Array<Array<number>>): number => {
			return compareCells(a[0], b[0])
		})
		for (let i: number = 0; i < len; i++) {
			cells[i] = zipped[i][0]
			attr[i] = zipped[i][1]
		}
		return cells
	}
	cells.sort(compareCells)
	return cells
}

/**
 * 移除已排序数组中的重复单元格
 * 前提: cells 必须已排序(由 normalize 保证)
 *
 * 		输入:
 * 			cells: 已经过 normalize() 排序的单元格数组
 * 		输出:
 * 			去重后的数组(原地修改, 截断长度)
 *
 * 案例:
 *   	- unique([[0,1], [0, 1], [1, 2], [1, 2], [2, 3]])  // [[0, 1], [1, 2], [2, 3]]  (移除重复项)
 */
function unique(cells: Array<Array<number>>): Array<Array<number>> {
	if (cells.length === 0) {
		return []
	}
	/**
	 * 写入指针
	 */
	let ptr: number = 1
	for (let i: number = 1; i < cells.length; i++) {
		let a: Array<number> = cells[i]
		/**
		 * 与前一个元素比较, 不同则保留
		 */
		if (compareCells(a, cells[i - 1])) {
			if (i === ptr) {
				ptr++
				continue
			}
			cells[ptr++] = a
		}
	}
	/**
	 * 截断数组到去重后的长度
	 */
	cells.length = ptr
	return cells
}

/**
 * 轮廓线段简化控制
 *
 * 简化流程:
 *   	- 构建有向图: 从 cells (边) 中提取 inv / outv 关系
 *   	- 计算所有顶点权重, 构建最小堆
 *   	- 循环弹出最小权重顶点并消除, 直到最小权重 > minArea
 *   	- 用存活顶点重建紧凑的顶点数组和边数组
 *
 * 不可移除的顶点 (weight = Infinity):
 *   	 已被消除的顶点 (dead = true)
 *   	- 端点 (inv = -1 或 outv = -1): 链的首尾
 *   	- 分叉点 (inv = -2 或 outv = -2): 图中度 > 1 的节点
 */
export class Simplifys {
	/**
	 * 执行轮廓简化
	 *
	 * 		输入:
	 * 			cells: 输入边数组 (每条边为 [from, to] 顶点索引对)
	 * 			positions: 输入顶点坐标数组
	 * 			minArea: 误差阈值: 权重 < minArea 的顶点将被移除
	 * 				典型值 0.25: 移除距离连线不超过 0.25 像素的顶点
	 * 		输出:
	 * 			{ positions, edges }: 简化后的顶点和边
	 *
	 * 案例:
	 *   	- 一条包含 5 个点的折线
	 *   		positions: [[0, 0], [1, 0.1], [2, 0], [3, 0.05], [4, 0]]
	 *   		cells: [[0, 1], [1, 2], [2, 3], [3, 4]]
	 *   		minArea = 0.15
	 *   		// 点 1 的权重: 距离 (0, 0) - (2, 0) 连线 = 0.1 < 0.15  // 消除
	 *   		// 点 3 的权重: 距离 (2, 0) - (4, 0) 连线 = 0.05 < 0.15  // 消除
	 *   		结果: positions = [[0, 0], [2, 0], [4, 0]], edges = [[0, 1], [1, 2]]
	 */
	public static proecss(
		cells: Array<TD2EdgeItem>,
		positions: Array<TD2PointItem>,
		minArea: number
	): {
		positions: Array<TD2PointItem>
		edges: Array<TD2EdgeItem>
	} {
		const positionsLen: number = positions.length
		const cellsLen: number = cells.length
		/**
		 * 前驱索引
		 * 		inv[i]: 顶点 i 的前驱顶点索引 (-1 = 无前驱, -2 = 多前驱/分叉点)
		 */
		const inv: Array<number> = new Array(positionsLen)
		/**
		 * 后继索引
		 * 		outv[i]: 顶点 i 的后继顶点索引 (-1 = 无后继, -2 = 多后继/分叉点)
		 */
		const outv: Array<number> = new Array(positionsLen)
		/**
		 * 误差权重
		 * 		weights[i]: 顶点 i 的误差权重
		 */
		const weights: Array<number> = new Array(positionsLen)
		/**
		 * 消除标记
		 * 		dead[i]: 顶点 i 是否已被消除
		 */
		const dead: Array<boolean> = new Array(positionsLen)
		/**
		 * 最小堆(存顶点索引, 按权重排序)
		 */
		const heap: Array<number> = []
		/**
		 * 顶点 → 堆位置映射
		 * 		index[i]: 顶点 i 在堆中的位置 (-1 = 不在堆中)
		 */
		const index: Array<number> = new Array(positionsLen)
		/**
		 * 输出顶点数组
		 */
		const npositions: Array<TD2PointItem> = []
		/**
		 * 输出边数组
		 */
		const ncells: Array<TD2EdgeItem> = []
		/**
		 * 堆中有效元素数
		 */
		let heapCount: number = heap.length

		/**
		 * 计算顶点 i 的误差权重
		 * 		输出:
		 * 			Infinity 表示不可移除 (dead /端点/分叉点)
		 */
		const computeWeight = (i: number): number => {
			if (dead[i]) {
				return Infinity
			}
			/**
			 * 前驱
			 */
			const s: number = inv[i]
			/**
			 * 后继
			 */
			const t: number = outv[i]
			/**
			 * 端点或分叉点不可移除
			 */
			if (s < 0 || t < 0) {
				return Infinity
			}
			return errorWeight(positions[i], positions[s], positions[t])
		}

		/**
		 * 最小堆操作
		 **/
		/**
		 * 交换堆中两个位置的元素, 并更新 index 映射
		 */
		const heapSwap = (i: number, j: number): void => {
			const a: number = heap[i]
			const b: number = heap[j]
			heap[i] = b
			heap[j] = a
			index[a] = j
			index[b] = i
		}
		/**
		 * 获取父节点索引
		 */
		const heapParent = (i: number): number => {
			if (i & 1) {
				/**
				 * 奇数位置: (i - 1) / 2
				 */
				return (i - 1) >> 1
			}
			/**
			 * 偶数位置: i / 2 - 1
			 */
			return (i >> 1) - 1
		}
		/**
		 * 下沉操作: 将位置 i 的元素向下调整到正确位置, 使得弹出堆顶后恢复堆性质
		 */
		const heapDown = (i: number): number => {
			let w: number = weights[heap[i]]
			while (true) {
				let tw: number = w
				let left: number = 2 * i + 1
				let right: number = 2 * (i + 1)
				let next: number = i
				/**
				 * 与左子节点比较
				 */
				if (left < heapCount) {
					const lw: number = weights[heap[left]]
					if (lw < tw) {
						next = left
						tw = lw
					}
				}
				/**
				 * 与右子节点比较
				 */
				if (right < heapCount) {
					const rw: number = weights[heap[right]]
					if (rw < tw) {
						next = right
					}
				}
				/**
				 * 已是最小值, 停止
				 */
				if (next === i) {
					return i
				}
				heapSwap(i, next)
				i = next
			}
		}
		/**
		 * 上浮操作: 将位置 i 的元素向上调整到正确位置, 使得插入新元素或降低元素权重后恢复堆性质
		 */
		const heapUp = (i: number): number | undefined => {
			const w: number = weights[heap[i]]
			while (i > 0) {
				const parent: number = heapParent(i)
				if (parent >= 0) {
					const pw: number = weights[heap[parent]]
					if (w < pw) {
						heapSwap(i, parent)
						i = parent
						continue
					}
				}
				return i
			}
		}
		/**
		 * 弹出堆顶(最小权重顶点), 返回最小权重的顶点索引, 或 -1 表示堆空
		 */
		const heapPop = (): number => {
			if (heapCount > 0) {
				const head: number = heap[0]
				heapSwap(0, heapCount - 1)
				heapCount -= 1
				heapDown(0)
				return head
			}
			return -1
		}
		/**
		 * 更新堆中位置 i 处元素的权重
		 * 		先将权重设为 -Infinity 上浮到堆顶, 弹出, 再以新权重重新插入, 即避免了复杂的"任意位置删除"操作
		 */
		const heapUpdate = (i: number, w: number): number | undefined => {
			const a: number = heap[i]
			if (weights[a] === w) {
				return i
			}
			/**
			 * 设为最小值
			 */
			weights[a] = -Infinity
			/**
			 * 上浮到堆顶
			 */
			heapUp(i)
			/**
			 * 弹出
			 */
			heapPop()
			/**
			 * 设置新权重
			 */
			weights[a] = w
			/**
			 * 重新入堆
			 */
			heapCount += 1
			return heapUp(heapCount - 1)
		}
		/**
		 * 消除顶点 i: 将其标记为 dead 并修复前后连接
		 *
		 * 消除过程:
		 *   	- 设 s = inv[i] (前驱), t = outv[i] (后继)
		 *   	- 消除 i 后: s → t 直接连接(跳过 i)
		 *   	- 更新 s 和 t 的权重(因为邻居变了)
		 */
		const kill = (i: number): void => {
			if (dead[i]) {
				return
			}
			dead[i] = true
			/**
			 * 前驱
			 */
			const s: number = inv[i]
			/**
			 * 后继
			 */
			const t: number = outv[i]
			/**
			 * 修复连接: t 的前驱变为 s
			 */
			if (inv[t] >= 0) {
				inv[t] = s
			}
			/**
			 * 修复连接: s 的后继变为 t
			 */
			if (outv[s] >= 0) {
				outv[s] = t
			}
			/**
			 * 更新 s 和 t 的堆权重
			 */
			if (index[s] >= 0) {
				heapUpdate(index[s], computeWeight(s))
			}
			if (index[t] >= 0) {
				heapUpdate(index[t], computeWeight(t))
			}
		}
		/**
		 * 龟兔赛跑路径压缩 (Floyd's Tortoise and Hare + Path Compression)
		 *
		 * 沿着 seq[] 链表找到从 start 出发的第一个存活(非 dead )节点, 并压缩中间所有 dead 节点的指针(路径压缩优化)
		 * 重建边时, 原始边的端点可能已被消除, 需要找到该端点链上最近的存活节点作为替代
		 *
		 * 龟兔算法确保: 即使链中存在环也不会无限循环
		 *
		 * 案例:
		 *   	- inv = [_, _, 0, 2, 3], dead = [F, T, T, F, F]
		 *   	- tortoiseHare(inv, 4)  // 寻找4的前驱链中第一个存活节点
		 *   	- 4 → inv[4] = 3 (alive)  // 返回 3
		 *   	- tortoiseHare(inv, 3)  // 3 → inv[3] = 2 (dead) → inv[2] = 0 (alive) → 返回 0
		 */
		const tortoiseHare = (seq: Array<number>, start: number): number => {
			if (seq[start] < 0) {
				return start
			}
			/**
			 * 慢指针
			 */
			let t: number = start
			/**
			 * 快指针
			 */
			let h: number = start
			do {
				let nh: number = seq[h]
				if (!dead[h] || nh < 0 || nh === h) {
					break
				}
				h = nh
				nh = seq[h]
				if (!dead[h] || nh < 0 || nh === h) {
					break
				}
				h = nh
				t = seq[t]
			} while (t !== h)
			/**
			 * 路径压缩: 将所有中间节点直接指向最终存活节点
			 */
			for (let v: number = start; v !== h; v = seq[v]) {
				seq[v] = h
			}
			return h
		}
		/**
		 * 初始化数据结构
		 **/
		for (let i: number = 0; i < positionsLen; i++) {
			/**
			 * 初始无前驱无后继
			 */
			inv[i] = outv[i] = -1
			/**
			 * 初始不可移除
			 */
			weights[i] = Infinity
			dead[i] = false
		}
		/**
		 * 从边集构建有向图 (inv/outv)
		 **/
		for (let i: number = 0; i < cellsLen; i++) {
			const c: Array<number> = cells[i]
			if (c.length !== 2) {
				throw new Error('input must be a graph.')
			}
			/**
			 * 边的终点
			 */
			const s: number = c[1]
			/**
			 * 边的起点
			 */
			const t: number = c[0]
			/**
			 * 设置 t 的后继为 s
			 */
			if (outv[t] !== -1) {
				/**
				 * 已有后继 → 分叉点, 标记为 -2 (不可移除)
				 */
				outv[t] = -2
			} else {
				outv[t] = s
			}
			/**
			 * 设置 s 的前驱为 t
			 */
			if (inv[s] !== -1) {
				/**
				 * 已有前驱 → 汇合点, 标记为 -2 (不可移除)
				 */
				inv[s] = -2
			} else {
				inv[s] = t
			}
		}
		/**
		 * 计算初始权重并构建最小堆
		 **/
		for (let i: number = 0; i < positionsLen; i++) {
			const w: number = (weights[i] = computeWeight(i))
			if (w < Infinity) {
				/**
				 * 权重有限 = 该顶点可能被移除, 加入堆
				 */
				index[i] = heap.length
				heap.push(i)
			} else {
				/**
				 * 权重无限 = 端点 / 分叉点 / dead, 不加入堆
				 */
				index[i] = -1
			}
		}
		heapCount = heap.length
		/**
		 * 自底向上建堆 (Floyd's heap construction, O(n))
		 */
		for (let i: number = heapCount >> 1; i >= 0; --i) {
			heapDown(i)
		}
		/**
		 * 贪心消除 - 循环弹出最小权重顶点
		 **/
		while (true) {
			const hmin: number = heapPop()
			/**
			 * 堆空或最小权重超过阈值时停止
			 */
			if (hmin < 0 || weights[hmin] > minArea) {
				break
			}
			/**
			 * 消除该顶点(修复前后连接并更新邻居权重)
			 */
			kill(hmin)
		}
		/**
		 * 用存活顶点构建紧凑的输出数据
		 **/
		/**
		 * 建立旧索引 → 新索引的映射
		 */
		for (let i: number = 0; i < positionsLen; i++) {
			if (!dead[i]) {
				index[i] = npositions.length
				npositions.push(positions[i].slice() as TD2PointItem)
			}
		}
		/**
		 * 重建边集: 对每条原始边, 找到两端存活的顶点
		 */
		for (let i: number = 0; i < cells.length; i++) {
			const c: Array<number> = cells[i]
			/**
			 * 使用路径压缩找到边两端的存活替代顶点
			 */
			const tin: number = tortoiseHare(inv, c[0])
			const tout: number = tortoiseHare(outv, c[1])
			if (tin >= 0 && tout >= 0 && tin !== tout) {
				const cin: number = index[tin]
				const cout: number = index[tout]
				/**
				 * 避免自环边
				 */
				if (cin !== cout) {
					ncells.push([cin, cout])
				}
			}
		}
		/**
		 * 排序并去重(消除重复边)
		 */
		unique(normalize(ncells))
		return {
			positions: npositions,
			edges: ncells,
		}
	}
}
