import { TEarNode } from './Earcut'
import { earcutLinked, linkedList, sortLinked } from './Link'

/**
 * - 叉积 (Cross Product):
 * 		给定向量 AB 和 AC, 叉积 = (B - A) × (C - A) = (Bx - Ax)(Cy - Ay) - (By - Ay)(Cx - Ax)
 *    		Result > 0: C 在 AB 左侧(逆时针)
 *    		Result < 0: C 在 AB 右侧(顺时针)
 *    		Result = 0: 三点共线
 *
 * - Shoelace 公式(鞋带公式):
 *    	多边形面积 = |Σ(x_i · y_{i + 1} - x_{i + 1} · y_i)| / 2
 *    	符号表示绕向: 正值逆时针, 负值顺时针
 *
 * - Morton Code(Z-order 编码):
 *    	将 2D 整数坐标的比特位交错排列, 形成 1D 编码
 *    	保持空间局部性: 相邻 2D 点的 Morton Code 值也接近
 *    	用于空间索引加速邻域查询
 */

/**
 * 将嵌套多边形数组扁平化为一维坐标数组
 *
 * 		输入:
 * 			data: [ring0, ring1, ring2, ...]
 * 				其中 ring0 是外轮廓, ring1+ 是孔洞
 * 				每个 ring 是点数组: [[x0, y0], [x1, y1], ...]
 * 		输出:
 * 			result.vertices: 扁平化坐标 [x0, y0, x1, y1, ...]
 * 			result.holes: 孔洞起始的顶点索引(非坐标索引)
 * 			result.dimensions: 坐标维度(从第一个点的长度推断)
 */
export function flatten(data: Array<any>): {
	vertices: Array<any>
	holes: Array<number>
	dimensions: number
} {
	const vertices: Array<any> = []
	const holes: Array<number> = []
	const dimensions: number = data[0][0].length
	let holeIndex: number = 0
	let prevLen: number = 0
	for (const ring of data) {
		for (const p of ring) {
			for (let d: number = 0; d < dimensions; d++) {
				vertices.push(p[d])
			}
		}
		/**
		 * 第一个 ring 是外轮廓, 从第二个开始记录孔洞索引
		 */
		if (prevLen) {
			holeIndex += prevLen
			holes.push(holeIndex)
		}
		prevLen = ring.length
	}
	return { vertices, holes, dimensions }
}

/**
 * 计算多边形的有向面积 (Shoelace 公式 / 鞋带公式)
 *
 * 		输入:
 * 			data: 扁平坐标数组
 * 			start: 起始坐标索引
 * 			end: 结束坐标索引
 * 			dim: 每个顶点的维度
 * 		输出:
 * 			有向面积的 2 倍值
 *
 * 数学公式:
 * 		有向面积:
 * 				S = Σ [(x_j - x_i) * (y_i + y_j)] / 2
 * 			其中 j 是 i 的前一个顶点索引(循环)
 *
 * 此为 Shoelace 公式的一种变形, 标准形式为:
 * 		A = Σ (x_i * y_{i + 1} - x_{i + 1} * y_i) / 2
 *
 * 本实现使用的等价形式(展开后数学相等):
 * 		A = Σ (x_prev - x_curr) * (y_curr + y_prev) / 2
 *
 * 符号含义:
 * 		- 返回值 > 0: 顶点按逆时针排列 (CCW)
 * 		- 返回值 < 0: 顶点按顺时针排列 (CW)
 * 		- 返回值 = 0: 退化多边形(所有点共线)
 */
export function signedArea(data: Array<any>, start: number, end: number, dim: number): number {
	let sum: number = 0
	for (let i: number = start, j = end - dim; i < end; i += dim) {
		sum += (data[j] - data[i]) * (data[i + 1] + data[j + 1])
		j = i
	}
	return sum
}

/**
 * 计算三角化质量的偏差值 (Deviation)
 *
 * 		输入:
 * 			data: 扁平坐标数组
 * 			holeIndices: 孔洞索引
 * 			dim: 维度
 * 			triangles: 三角化结果索引数组
 * 		输出:
 * 			偏差值 (0 为完美)
 *
 * 原理:
 * 		理想的三角化应该满足: 所有三角形面积之和 = 原始多边形面积
 * 		偏差值 = |三角形总面积 - 多边形面积| / 多边形面积
 * 			- 偏差 = 0: 完美三角化(无重叠、无遗漏)
 * 			- 偏差 > 0: 存在面积差异(可能有重叠或遗漏区域)
 *
 * 多边形面积计算:
 * 		带孔洞的多边形面积 = 外轮廓面积 - Σ(孔洞面积)
 *
 * 三角形面积计算:
 * 		三角形 ABC 的面积
 * 			S = |(A - C) × (B - A)| / 2 = |(Ax - Cx)(By - Ay) - (Ax - Bx)(Cy - Ay)| / 2
 */
export function deviation(data: Array<any>, holeIndices: Array<number>, dim: number, triangles: Array<number>): number {
	const hasHoles: number = holeIndices && holeIndices.length
	const outerLen: number = hasHoles ? holeIndices[0] * dim : data.length
	/**
	 * 计算多边形净面积: 外轮廓面积 - 孔洞面积之和
	 **/
	let polygonArea: number = Math.abs(signedArea(data, 0, outerLen, dim))
	if (hasHoles) {
		for (let i: number = 0, len = holeIndices.length; i < len; i++) {
			const start: number = holeIndices[i] * dim
			const end: number = i < len - 1 ? holeIndices[i + 1] * dim : data.length
			polygonArea -= Math.abs(signedArea(data, start, end, dim))
		}
	}
	/**
	 * 计算所有三角形面积之和
	 **/
	let trianglesArea: number = 0
	for (let i: number = 0; i < triangles.length; i += 3) {
		const a: number = triangles[i] * dim
		const b: number = triangles[i + 1] * dim
		const c: number = triangles[i + 2] * dim
		/**
		 * 叉积计算三角形面积
		 */
		trianglesArea += Math.abs((data[a] - data[c]) * (data[b + 1] - data[a + 1]) - (data[a] - data[b]) * (data[c + 1] - data[a + 1]))
	}
	/**
	 * 两者都为 0 说明退化多边形
	 */
	return polygonArea === 0 && trianglesArea === 0 ? 0 : Math.abs((trianglesArea - polygonArea) / polygonArea)
}

export function createNode(i: number, x: number, y: number): TEarNode {
	return {
		i,
		x,
		y,
		prev: null!,
		next: null!,
		z: 0,
		prevZ: null!,
		nextZ: null!,
		steiner: false,
	}
}

/**
 * 从双向循环链表中移除节点
 *
 * 操作:
 * 		- 将前驱的 next 指向后继, 后继的 prev 指向前驱(断开环中的连接)
 * 		- 如果存在 Z-order 链接, 也将其断开
 */
export function removeNode(p: TEarNode): void {
	p.next.prev = p.prev
	p.prev.next = p.next

	if (p.prevZ) {
		p.prevZ.nextZ = p.nextZ
	}
	if (p.nextZ) {
		p.nextZ.prevZ = p.prevZ
	}
}

/**
 * 在链表中插入新节点(插入到 last 之后)
 *
 * 		输入:
 * 			i: 顶点索引
 * 			x: X 坐标
 * 			y: Y 坐标
 * 			last: 插入位置的前驱节点 (null 则创建首节点)
 * 		输出:
 * 			新插入的节点
 *
 * 操作:
 * 		- 如果 last 为 null: 创建自循环节点 (prev = next = self)
 * 		- 否则: 将新节点插入 last 与 last.next 之间
 */
export function insertNode(i: number, x: number, y: number, last: TEarNode): TEarNode {
	const p: TEarNode = createNode(i, x, y)
	if (!last) {
		/**
		 * 首节点: 自循环
		 */
		p.prev = p
		p.next = p
	} else {
		/**
		 * 插入到 last 和 last.next 之间
		 */
		p.next = last.next
		p.prev = last
		last.next.prev = p
		last.next = p
	}
	return p
}

/**
 * 通过对角线 (a, b) 将多边形分割为两个独立的环
 *
 * 		输入:
 * 			a: 对角线端点 A
 * 			b: 对角线端点 B
 * 		输出:
 * 			第二个环的起始节点 (b2)
 *
 * 几何原理:
 * 		在多边形中连接两个不相邻顶点 a 和 b 形成一条对角线, 将原始多边形分割为两个子多边形
 *
 * 链表操作:
 * 		需要创建 a 和 b 的副本 (a2, b2), 因为分割后, 同一个顶点需要同时存在于两个环中
 * 		分割前:
 * 			... → a → (中间节点) → b → (后续节点) → ... → a
 * 		分割后:
 *  		环1: a → b → (后续节点) → ... → a  // 原始指针
 *  		环2: b2 → a2 → (中间节点) → b2  // 副本指针
 *
 * 案例:
 * 		- 多边形 A - B - C - D - E, 对角线连接 B 和 D:
 *   		环1: B → D → E → A → B
 *   		环2: D' → B' → C → D'
 */
export function splitPolygon(a: TEarNode, b: TEarNode): TEarNode {
	const a2: TEarNode = createNode(a.i, a.x, a.y)
	const b2: TEarNode = createNode(b.i, b.x, b.y)
	/**
	 * a 的原始后继
	 */
	const an: TEarNode = a.next
	/**
	 * b 的原始前驱
	 */
	const bp: TEarNode = b.prev
	/**
	 * 环 1: a → b (直接连接)
	 */
	a.next = b
	b.prev = a
	/**
	 * 环 2: a2 → an (a2 接管 a 的原始后续链)
	 */
	a2.next = an
	an.prev = a2
	/**
	 * 环 2: b2 → a2
	 */
	b2.next = a2
	a2.prev = b2
	/**
	 * 环 2: bp → b2 (b2 接管 b 的原始前驱链)
	 */
	bp.next = b2
	b2.prev = bp
	return b2
}

/**
 * 检测线段 (a, b) 的中点是否在多边形 a 所在环的内部
 *
 * 		输入:
 * 			a: 线段端点 A (同时是多边形环的引用)
 * 			b: 线段端点 B
 * 		输出:
 * 			中点是否在多边形内部
 *
 * 算法 - 射线法 (Ray Casting):
 * 		从中点向右发射水平射线, 统计与多边形边的交叉次数:
 * 			- 奇数次交叉 → 点在内部
 * 			- 偶数次交叉 → 点在外部
 *
 * 用途:
 * 		- 判断一条对角线是否完全位于多边形内部, 如果中点在内部, 则对角线很可能有效
 *
 * 数学细节 - 交点计算:
 * 		对于多边形边 (p, p.next), 水平射线 y = py 与边的交点 X:
 *   			X = p.x + (py - p.y) * (p.next.x - p.x) / (p.next.y - p.y)
 * 			如果 X > px, 则射线穿过该边
 */
export function middleInside(a: TEarNode, b: TEarNode): boolean {
	/**
	 * 计算中点
	 */
	const px: number = (a.x + b.x) / 2
	const py: number = (a.y + b.y) / 2
	let p: TEarNode = a
	let inside: boolean = false
	do {
		/**
		 * 射线法: 检测水平射线与多边形每条边的交叉
		 */
		if (p.y > py !== p.next.y > py && p.next.y !== p.y && px < ((p.next.x - p.x) * (py - p.y)) / (p.next.y - p.y) + p.x) {
			/**
			 * 每次交叉翻转内外状态
			 */
			inside = !inside
		}
		p = p.next
	} while (p !== a)
	return inside
}

/**
 * 判断点 b 是否在顶点 a 的"局部内部"
 *
 * 		输入:
 * 			a: 参考顶点
 * 			b: 测试点
 * 		输出:
 * 			b 是否在 a 的局部内部
 *
 * 几何含义:
 * 		"局部内部"指的是: 从顶点 a 的视角看, 点 b 位于多边形内侧
 *
 * 数学原理:
 * 		需要分两种情况讨论(取决于顶点 a 是凸还是凹):
 * 			- 情况1: a 是凹顶点 (area(a.prev, a, a.next) < 0), b 必须同时满足:
 *   			- 在射线 a→a.next 的左侧或上方: area(a, b, a.next) >= 0
 *   			- 在射线 a→a.prev 的右侧或上方: area(a, a.prev, b) >= 0
 * 			- 情况2: a 是凸顶点 (area(a.prev, a, a.next) >= 0), b 必须不满足以下任一条件(取反):
 *   			- 在射线 a→a.prev 的左侧: area(a, b, a.prev) < 0
 *   			- 在射线 a→a.next 的右侧: area(a, a.next, b) < 0
 */
export function locallyInside(a: TEarNode, b: TEarNode): boolean {
	return area(a.prev, a, a.next) < 0 ? area(a, b, a.next) >= 0 && area(a, a.prev, b) >= 0 : area(a, b, a.prev) < 0 || area(a, a.next, b) < 0
}

/**
 * 判断点 q 是否在线段 (p, r) 的包围盒内
 *
 * 		输入:
 * 			p: 线段端点 P
 * 			q: 测试点 Q
 * 			r: 线段端点 R
 * 		输出:
 * 			q 是否在 (p, r) 的包围盒内
 *
 * 用途:
 * 		- 当三点共线时(叉积为 0), 需要进一步判断中间点是否落在线段上, 即需检查 q 的坐标是否在 p 和 r 坐标范围内
 */
export function onSegment(p: TEarNode, q: TEarNode, r: TEarNode): boolean {
	return q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) && q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y)
}

export function sign(num: number): number {
	return num > 0 ? 1 : num < 0 ? -1 : 0
}

/**
 * 检测线段 (a, b) 是否与多边形的任何边相交
 *
 * 		输入:
 * 			a: 对角线端点 A (同时用于遍历多边形环)
 * 			b: 对角线端点 B
 * 		输出:
 * 			是否存在交叉
 *
 * 用途:
 * 		- 验证对角线是否与多边形的其他边产生交叉
 * 		- 有效的对角线不能与多边形的任何非相邻边相交
 *
 * 排除条件:
 * 		跳过与 a 或 b 共享端点的边(相邻边必然在端点相交, 不算交叉)
 */
export function intersectsPolygon(a: TEarNode, b: TEarNode): boolean {
	let p: TEarNode = a
	do {
		/**
		 * 跳过与 a 或 b 共享端点的边
		 */
		if (p.i !== a.i && p.next.i !== a.i && p.i !== b.i && p.next.i !== b.i && intersects(p, p.next, a, b)) {
			return true
		}
		p = p.next
	} while (p !== a)
	return false
}

/**
 * 计算三角形 (p, q, r) 的有向面积的 2 倍(即叉积)
 *
 * 数学公式:
 * 		area = (q - p) × (r - q) = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y)
 *
 * 几何含义:
 * 		- area < 0: 三点按顺时针排列(在本算法中表示凸角)
 * 		- area > 0: 三点按逆时针排列(凹角)
 * 		- area = 0: 三点共线
 */
export function area(p: TEarNode, q: TEarNode, r: TEarNode): number {
	return (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y)
}

/**
 * 判断两个节点坐标是否完全相同
 */
export function equals(p1: TEarNode, p2: TEarNode): boolean {
	return p1.x === p2.x && p1.y === p2.y
}

/**
 * 判断线段 (p1, q1) 和线段 (p2, q2) 是否相交
 *
 * 算法 - 方向测试法 (Orientation Test):
 * 		- 两条线段相交的充要条件是:
 * 			- 一般情况: 两条线段互相"跨越"对方
 *    			- 线段 1 的两端点分别在线段2的两侧
 *    			- 线段 2 的两端点分别在线段1的两侧
 *    			数学表达:
 * 					sign(area(p1, q1, p2)) ≠ sign(area(p1, q1, q2)) 且 sign(area(p2, q2, p1)) ≠ sign(area(p2, q2, q1))
 * 		- 退化情况(共线): 某个端点落在另一条线段上
 *    		当某个方向测试返回 0 时, 检查该点是否在对应线段的包围盒内
 *
 * 案例:
 * 		- 线段 1: (0, 0) → (10, 10), 线段 2: (0, 10) → (10, 0)  // 相交(X 形)
 * 		- 线段 1: (0, 0) → (5, 5), 线段 2: (6, 6) → (10, 10)  // 不相交(共线不重叠)
 *
 * @returns 两线段是否相交
 */
export function intersects(p1: TEarNode, q1: TEarNode, p2: TEarNode, q2: TEarNode): boolean {
	/**
	 * 计算四个方向测试的符号
	 **/
	/**
	 * p2 相对于线段 1 的方向
	 */
	const o1: number = sign(area(p1, q1, p2))
	/**
	 * 相对于线段 1 的方向
	 */
	const o2: number = sign(area(p1, q1, q2))
	/**
	 * p1 相对于线段 2 的方向
	 */
	const o3: number = sign(area(p2, q2, p1))
	/**
	 * q1 相对于线段 2 的方向
	 */
	const o4: number = sign(area(p2, q2, q1))
	/**
	 * 两端点在线段的不同侧
	 */
	if (o1 !== o2 && o3 !== o4) {
		return true
	}
	/**
	 * 某点恰好在另一条线段上(共线且在包围盒内)
	 */
	if (o1 === 0 && onSegment(p1, p2, q1)) {
		return true
	}
	if (o2 === 0 && onSegment(p1, q2, q1)) {
		return true
	}
	if (o3 === 0 && onSegment(p2, p1, q2)) {
		return true
	}
	if (o4 === 0 && onSegment(p2, q1, q2)) {
		return true
	}
	return false
}

/**
 * 检测点 (px, py) 是否在三角形 (a, b, c) 内部, 但排除与 A 点重合的情况
 *
 * 用途:
 * 		- 在"耳朵"检测中, 需要排除三角形的顶点自身(它们必然"在"三角形上, 但不应该作为阻止"耳朵"裁剪的因素)
 * 		- 特别排除第一个顶点 A 是因为在遍历时 A 是候选三角形的 prev 节点
 */
export function pointInTriangleExceptFirst(ax: number, ay: number, bx: number, by: number, cx: number, cy: number, px: number, py: number): boolean {
	return !(ax === px && ay === py) && pointInTriangle(ax, ay, bx, by, cx, cy, px, py)
}

/**
 * 验证对角线 (a, b) 是否为有效的多边形对角线
 *
 * 		输入:
 * 			a: 对角线端点 A
 * 			b: 对角线端点 B
 * 		输出:
 * 			是否为有效对角线
 *
 * 有效对角线的条件:
 * 			- a 和 b 不相邻(不是 prev / next 关系)
 * 			- 对角线不与多边形的任何边相交 (intersectsPolygon)
 * 			- 对角线在两端点处都是"局部内部"的 (locallyInside)
 * 			- 对角线的中点在多边形内部 (middleInside)
 * 			- 对角线不会创建面积为零的退化三角形
 * 		或者(特殊情况):
 * 			- a 和 b 坐标相同(重合点), 且两端的局部面积都为正
 */
export function isValidDiagonal(a: TEarNode, b: TEarNode): number | boolean {
	return (
		a.next.i !== b.i &&
		a.prev.i !== b.i &&
		!intersectsPolygon(a, b) &&
		((locallyInside(a, b) && locallyInside(b, a) && middleInside(a, b) && (area(a.prev, a, b.prev) || area(a, b.prev, b))) || // 不创建反向扇区
			(equals(a, b) && area(a.prev, a, a.next) > 0 && area(b.prev, b, b.next) > 0))
	)
}

/**
 * 计算 2D 坐标的 Z-order 曲线编码 (Morton Code)
 *
 * 		输入:
 * 			x: X 坐标
 * 			y: Y 坐标
 * 			minX: 包围盒最小 X
 * 			minY: 包围盒最小 Y
 * 			invSize: 归一化因子 (32767 / max(width, height))
 * 		输出:
 * 			32 位 Morton Code
 *
 * Z-order 曲线 (Morton Code) 原理:
 * 		Z-order 曲线是一种空间填充曲线, 通过交错 x 和 y 坐标的二进制位
 * 		将 2D 空间映射到 1D 空间, 同时保持良好的空间局部性
 *
 * 编码过程:
 * 		- 归一化坐标到 [0, 32767] 整数范围
 *   		nx = ((x - minX) * invSize) | 0
 *   		ny = ((y - minY) * invSize) | 0
 *		- 比特位展开 (Bit Spreading)
 *   		将 16 位整数的比特位散开, 在每个位之间插入一个 0 位
 *   		例: 原始 x = 0b1101 → 展开后 = 0b01_01_00_01
 *   		展开通过 4 步位操作实现(分治法):
 *   			x = (x | (x << 8)) & 0x00FF00FF  // 分离高低 8 位
 *   			x = (x | (x << 4)) & 0x0F0F0F0F  // 每 8 位组内分离 4 位
 *   			x = (x | (x << 2)) & 0x33333333  // 每 4 位组内分离 2 位
 *   			x = (x | (x << 1)) & 0x55555555  // 每 2 位组内分离 1 位
 * 		- 交错合并
 *   		z = x | (y << 1)
 *  		x 占偶数位(0, 2, 4,...), y 占奇数位(1, 3, 5,...)
 *
 * 案例:
 * 		- 坐标 (5, 3), 二进制 x = 0101, y = 0011:
 *   		x 展开: 0_1_0_1  // 0b00010001
 *   		y 展开: 0_0_1_1  // 0b00000101
 *   		y << 1:  // 0b00001010
 *   		z = x | (y<<1)  // 0b00011011 = 27
 *
 * 空间局部性说明:
 * 		Z 曲线遍历顺序:
 *   		(0, 0) = 0  (1, 0) = 1  (0, 1) = 2  (1, 1) = 3
 *   		(2, 0) = 4  (3, 0) = 5  (2, 1) = 6  (3, 1) = 7
 *   	空间相邻的点, 其 Z 值也倾向于接近
 */
export function zOrder(x: number, y: number, minX: number, minY: number, invSize: number): number {
	/**
	 * 归一化到 [0, 32767] 整数范围
	 **/
	x = ((x - minX) * invSize) | 0
	y = ((y - minY) * invSize) | 0
	/**
	 * 比特位展开(将连续位散开为隔位排列)
	 **/
	/**
	 * ____hgfe ____dcba → ____hgfe dcba____
	 */
	x = (x | (x << 8)) & 0x00ff00ff
	/**
	 * ____hgfe → __hg__fe __dc__ba
	 */
	x = (x | (x << 4)) & 0x0f0f0f0f
	/**
	 * __hg → _h_g _f_e _d_c _b_a
	 */
	x = (x | (x << 2)) & 0x33333333
	/**
	 * 最终: 每个原始位之间有一个 0 位
	 */
	x = (x | (x << 1)) & 0x55555555
	y = (y | (y << 8)) & 0x00ff00ff
	y = (y | (y << 4)) & 0x0f0f0f0f
	y = (y | (y << 2)) & 0x33333333
	y = (y | (y << 1)) & 0x55555555
	/**
	 * 交错合并 —— x 占偶数位, y 占奇数位
	 **/
	return x | (y << 1)
}

/**
 * 获取多边形环中 X 坐标最小的顶点(最左点)
 *
 * 		输入:
 * 			start: 多边形环的起始节点
 * 		输出:
 * 			最左侧的节点
 *
 * 用途:
 * 		- 在孔洞处理中, 需要找到每个孔洞的最左点作为桥接的起始候选
 * 		- 最左点保证在外轮廓的内部(对于有效的孔洞), 便于寻找桥接边
 *
 * X 相同时取 Y 较小的(确保唯一性)
 */
export function getLeftmost(start: TEarNode): TEarNode {
	let p: TEarNode = start
	let leftmost: TEarNode = start
	do {
		if (p.x < leftmost.x || (p.x === leftmost.x && p.y < leftmost.y)) {
			leftmost = p
		}
		p = p.next
	} while (p !== start)
	return leftmost
}

/**
 * 判断点 (px, py) 是否在三角形 (a, b, c) 内部
 *
 * 算法 - 叉积符号法 (Same Side Test)
 * 		- 点 P 在三角形 ABC 内部的充要条件是: P 在 AB、BC、CA 三条边的同一侧
 *
 * 数学表达(对于顺时针三角形):
 *   	(C - P) × (A - P) >= 0 且 (A - P) × (B - P) >= 0 且 (B - P) × (C - P) >= 0
 *
 * 展开为坐标形式:
 *   	(cx - px)(ay - py) >= (ax - px)(cy - py)
 *   	(ax - px)(by - py) >= (bx - px)(ay - py)
 *   	(bx - px)(cy - py) >= (cx - px)(by - py)
 *
 * 案例:
 * 		- 三角形 A = (0, 0), B = (10, 0), C = (5, 10)
 * 			点 P = (5, 5): 三个叉积同号   // 在内部
 * 			点 P = (0, 10): 叉积异号  // 在外部 ✗
 */
export function pointInTriangle(ax: number, ay: number, bx: number, by: number, cx: number, cy: number, px: number, py: number): boolean {
	return (cx - px) * (ay - py) >= (ax - px) * (cy - py) && (ax - px) * (by - py) >= (bx - px) * (ay - py) && (bx - px) * (cy - py) >= (cx - px) * (by - py)
}

/**
 * 判断以 p 为中心的扇区是否包含以 m 为中心的扇区
 *
 * 		输入:
 * 			m: 当前最佳候选
 * 			p: 新候选
 * 		输出:
 * 			p 的扇区是否包含 m 的扇区
 *
 * 几何含义:
 * 		- 顶点 m 的"扇区"是指 m.prev 到 m.next 之间的角域
 * 		- 如果 p 的扇区完全包含 m 的扇区, 则 p 是更好的桥接候选
 */
export function sectorContainsSector(m: TEarNode, p: TEarNode): boolean {
	return area(m.prev, m, p.prev) < 0 && area(p.next, m, m.next) < 0
}

/**
 * 为多边形环中的所有节点计算 Z-order 编码并建立排序链表
 *
 * 		输入:
 * 			start: 多边形环的起始节点
 * 			minX: 包围盒最小 X
 * 			minY: 包围盒最小 Y
 * 			invSize: 归一化因子
 *
 * 处理流程:
 * 		- 遍历环中所有节点, 计算每个节点的 Morton Code (z 值)
 * 		- 初始化 prevZ / nextZ 指针为 prev / next(与环结构相同)
 * 		- 断开循环链接 (tail.nextZ = null)
 * 		- 调用 sortLinked 按 z 值排序
 *
 * 排序后, prevZ / nextZ 形成一条按 Z-order 值有序的单独链表, 与 prev / next 的多边形环结构完全独立
 */
export function indexCurve(start: TEarNode, minX: number, minY: number, invSize: number): void {
	let p: TEarNode = start
	do {
		/**
		 * 仅为尚未计算过 z 值的节点计算
		 */
		if (p.z === 0) {
			p.z = zOrder(p.x, p.y, minX, minY, invSize)
		}
		/**
		 * 初始化 Z-order 链表指针
		 */
		p.prevZ = p.prev
		p.nextZ = p.next
		p = p.next
	} while (p !== start)
	/**
	 * 断开循环, 使其成为普通双向链表(可排序)
	 */
	p.prevZ.nextZ = null!
	p.prevZ = null!
	/**
	 * 按 z 值归并排序
	 */
	sortLinked(p)
}

/**
 * 寻找孔洞与外轮廓之间的桥接点
 *
 * 		输入:
 * 			hole: 孔洞的最左点
 * 			outerNode: 外轮廓的任意节点(用于遍历)
 * 		输出:
 * 			外轮廓上的最优桥接点
 *
 * 算法原理 - 可见性桥接 (Visibility Bridge)
 *
 * 目标: 找到外轮廓上的一个顶点 M, 使得从孔洞最左点 H 到 M 的连线不与任何多边形边相交(即 H 能"看到" M)
 *
 * 算法步骤:
 * 		- 寻找"最近可见点"
 *   		从 H 向左 (-X 方向) 发射水平射线, 找到射线与外轮廓边的第一个交点
 *   		取该交叉边上 X 坐标较小的端点作为初始候选 M
 *
 *   		数学: 对于边 (p, p.next), 射线 y = hy 的交点 X: x_intersect = p.x + (hy - p.y) * (p.next.x - p.x) / (p.next.y - p.y)
 * 		- 优化候选点
 *   		如果交点恰好是某个顶点(x_intersect === hx), 直接返回该顶点
 *   		否则, 在三角形 (H, M, 交点) 内部搜索更好的候选:
 *   			- 候选必须在 M 的右侧(更靠近 H)
 *   			- 候选必须在上述三角形内部
 *   			- 优先选择与 H 连线斜率最小的点(最"水平"的连接)
 *   			- 斜率相同时选择扇区更优的点
 *
 * 策略背景
 * 		直接连接 H 和最近交点可能不是最优的:
 * 			- 连接线可能穿过多边形外部
 * 			- 存在离 H 更近的凸顶点更适合桥接
 * 		通过在三角形区域内搜索凸顶点, 可以找到保证不交叉的最优桥接
 */
export function findHoleBridge(hole: TEarNode, outerNode: TEarNode): TEarNode {
	let p: TEarNode = outerNode
	const hx: number = hole.x
	const hy: number = hole.y
	/**
	 * 记录射线的最近交点 X 坐标
	 */
	let qx: number = -Infinity
	/**
	 * 当前最优桥接候选
	 */
	let m: TEarNode = undefined!
	/**
	 * 特殊情况: 孔洞点与外轮廓点重合
	 */
	if (equals(hole, p)) {
		return p
	}
	/**
	 * 水平射线向左扫描, 寻找与外轮廓边的交点
	 **/
	do {
		if (equals(hole, p.next)) {
			return p.next
		} else if (hy <= p.y && hy >= p.next.y && p.next.y !== p.y) {
			/**
			 * 射线 y = hy 与边 (p, p.next) 有交点
			 **/
			/**
			 * 计算交点 X 坐标(线性插值)
			 */
			const x: number = p.x + ((hy - p.y) * (p.next.x - p.x)) / (p.next.y - p.y)
			/**
			 * 交点必须在 H 的左侧 (x <= hx), 且是最近的 (x > qx)
			 */
			if (x <= hx && x > qx) {
				qx = x
				/**
				 * 取边上 X 较小的端点作为候选
				 */
				m = p.x < p.next.x ? p : p.next
				/**
				 * 如果交点恰好等于 H 的 X 坐标, 这是最理想的情况
				 */
				if (x === hx) {
					return m
				}
			}
		}
		p = p.next
	} while (p !== outerNode)
	if (!m) {
		return null!
	}
	/**
	 * 在三角形 (H, M, 交点) 内搜索更优的桥接点
	 **/
	const stop: TEarNode = m
	const mx: number = m.x
	const my: number = m.y
	/**
	 * 记录最小斜率
	 */
	let tanMin: number = Infinity
	p = m
	do {
		/**
		 * 候选条件: 顶点在 H 和 M 之间的 X 范围内
		 */
		if (hx >= p.x && p.x >= mx && hx !== p.x && pointInTriangle(hy < my ? hx : qx, hy, mx, my, hy < my ? qx : hx, hy, p.x, p.y)) {
			/**
			 * 计算 H 到 p 的斜率(越小越"水平", 连线越短)
			 */
			const tan: number = Math.abs(hy - p.y) / (hx - p.x)
			/**
			 * 选择斜率最小且局部可见的点
			 */
			if (locallyInside(p, hole) && (tan < tanMin || (tan === tanMin && (p.x > m.x || (p.x === m.x && sectorContainsSector(m, p)))))) {
				m = p
				tanMin = tan
			}
		}
		p = p.next
	} while (p !== stop)
	return m
}

/**
 * 比较两个孔洞节点的优先级(用于排序)
 *
 * 		输入:
 * 			a: 孔洞节点 A
 * 			b: 孔洞节点 B
 * 		输出:
 * 			负值 A 优先, 正值 B 优先
 *
 * 排序规则(优先级从高到低):
 * 		- X 坐标小的优先(最左的先处理)
 * 		- X 相同时 Y 坐标小的优先
 *		- XY 都相同时按边斜率排序
 *
 * 从左到右处理孔洞:
 * 		桥接算法基于向左射线, 先处理最左的孔洞可以避免后续孔洞的桥接边与已有桥接边交叉
 */
export function compareXYSlope(a: TEarNode, b: TEarNode): number {
	let result: number = a.x - b.x
	if (result === 0) {
		result = a.y - b.y
		if (result === 0) {
			const aSlope: number = (a.next.y - a.y) / (a.next.x - a.x)
			const bSlope: number = (b.next.y - b.y) / (b.next.x - b.x)
			result = aSlope - bSlope
		}
	}
	return result
}

/**
 * 将单个孔洞通过桥接边合并到外轮廓
 *
 * 		输入:
 * 			hole: 孔洞的最左点
 * 			outerNode: 外轮廓节点
 * 		输出:
 * 			合并后的外轮廓节点
 *
 * 操作流程
 * 		- 调用 findHoleBridge 找到外轮廓上的最优桥接点 bridge
 * 		- 调用 splitPolygon 在 bridge 和 hole 之间创建连接, 这会将孔洞的节点"缝合"到外轮廓链表中
 * 		- 对两个分割点执行 filterPoints 清理退化节点
 *
 * 合并后的效果:
 * 		原本独立的外轮廓和孔洞变成一个单一的多边形环:
 *   		... → bridge → hole → hole.next → ... → hole.prev → bridge_copy → bridge.next → ...
 *
 * 桥接边被遍历两次(一去一回), 在三角化时会产生零面积三角形被自动忽略
 */
export function eliminateHole(hole: TEarNode, outerNode: TEarNode): TEarNode {
	const bridge: TEarNode = findHoleBridge(hole, outerNode)
	if (!bridge) {
		return outerNode
	}
	const bridgeReverse: TEarNode = splitPolygon(bridge, hole)
	/**
	 * 清理两个连接点周围可能产生的退化节点
	 */
	filterPoints(bridgeReverse, bridgeReverse.next)
	return filterPoints(bridge, bridge.next)
}

/**
 * 将所有孔洞通过桥接边合并到外轮廓
 *
 * 		输入:
 * 			data: 扁平坐标数组
 * 			holeIndices: 孔洞起始索引
 * 			outerNode: 外轮廓链表节点
 * 			dim: 顶点维度
 * 		输出:
 * 			合并所有孔洞后的外轮廓节点
 *
 * 算法流程:
 * 		- 将每个孔洞转为逆时针链表(与外轮廓方向相反)
 * 		- 找到每个孔洞的最左点
 * 		- 按 X 坐标从左到右排序所有孔洞
 * 		- 依次将每个孔洞桥接到外轮廓
 *
 * 孔洞是逆时针:
 * 		外轮廓顺时针 + 孔洞逆时针 = 桥接后整体仍保持一致的绕向, 这确保了"耳朵"裁剪的凸凹判断不会出错
 *
 * 退化孔洞处理:
 * 		如果孔洞退化为单点 (list === list.next), 将其标记为 steiner 点, Steiner 点不会被 filterPoints 移除
 */
export function eliminateHoles(data: Array<number>, holeIndices: Array<number>, outerNode: TEarNode, dim: number): TEarNode {
	const queue: Array<any> = []
	for (let i: number = 0, len: number = holeIndices.length; i < len; i++) {
		const start: number = holeIndices[i] * dim
		const end: number = i < len - 1 ? holeIndices[i + 1] * dim : data.length
		/**
		 * 将孔洞坐标转为逆时针链表 (clockwise=false)
		 */
		const list: TEarNode = linkedList(data, start, end, dim, false)
		/**
		 * 退化孔洞标记为 Steiner 点
		 */
		if (list === list.next) {
			list.steiner = true
		}
		/**
		 * 取孔洞最左点加入优先队列
		 */
		queue.push(getLeftmost(list))
	}
	/**
	 * 从左到右排序(避免桥接边交叉)
	 */
	queue.sort(compareXYSlope)
	/**
	 * 依次桥接每个孔洞
	 */
	for (let i: number = 0; i < queue.length; i++) {
		outerNode = eliminateHole(queue[i], outerNode)
	}
	return outerNode
}

/**
 * 修复局部自交叉 (Pass 1 的容错处理)
 *
 * 		输入:
 * 			start: 起始节点
 * 			triangles: 输出三角形数组
 * 		输出:
 * 			修复后的新起始节点
 *
 * 问题场景
 * 		当相邻的两条边 (a → p) 和 (p.next → b) 发生交叉时, 标准的"耳朵"裁剪无法处理
 *
 * 修复策略:
 * 		检测四边形 (a, p, p.next, b) 是否存在自交:
 * 			- 边 (a, p) 与边 (p.next, b) 相交
 * 			- 且对角线 (a, b) 对两端点都是局部可见的
 *
 * 如果满足条件, 直接输出三角形 (a, p, b) 并移除 p 和 p.next, 相当于用三角形填充自交区域并修复链表
 *
 * 案例:
 *       	   p
 *      	  / \
 *     		 /   \      // 边 ap 和边 p.next→b 交叉
 *    		a  ×  b
 *     		 \   /
 *      	  \ /
 *     		 p.next
 *
 * 		修复后: 移除 p 和 p.next, 输出三角形 (a, p, b)
 */
export function cureLocalIntersections(start: TEarNode, triangles: Array<number>): TEarNode {
	let p: TEarNode = start
	do {
		const a: TEarNode = p.prev
		const b: TEarNode = p.next.next
		if (!equals(a, b) && intersects(a, p, p.next, b) && locallyInside(a, b) && locallyInside(b, a)) {
			/**
			 * 输出修复三角形
			 */
			triangles.push(a.i, p.i, b.i)
			/**
			 * 移除自交的两个节点
			 */
			removeNode(p)
			removeNode(p.next)
			/**
			 * 从修复点继续
			 */
			p = start = b
		}
		p = p.next
	} while (p !== start)
	return filterPoints(p)
}

/**
 * 对角线分割兜底策略
 *
 * 		输入:
 * 			start: 起始节点
 * 			triangles: 输出三角形数组
 * 			dim: 顶点维度
 * 			minX: 包围盒最小 X
 * 			minY: 包围盒最小 Y
 * 			invSize: Z-order 归一化因子
 *
 * 使用场景:
 * 		当 Pass 0 和 Pass 1 都无法找到"耳朵"时, 说明多边形可能存在复杂的几何退化
 * 		此时尝试找到一条有效对角线将多边形分割为两个子多边形, 对每个子多边形独立执行三角化
 *
 * 算法:
 * 		- 双重循环: 对于每个顶点 a, 尝试与所有非相邻顶点 b 连接
 * 		- 如果 (a, b) 是有效对角线 (isValidDiagonal), 则执行分割
 *
 * 分割后得到两个独立的多边形环, 分别从 Pass 0 重新开始三角化
 */
export function splitEarcut(start: TEarNode, triangles: Array<number>, dim: number, minX: number, minY: number, invSize: number): void {
	let a: TEarNode = start
	do {
		let b: TEarNode = a.next.next
		while (b !== a.prev) {
			if (a.i !== b.i && isValidDiagonal(a, b)) {
				/**
				 * 找到有效对角线, 分割多边形为两个环
				 */
				let c: TEarNode = splitPolygon(a, b)
				/**
				 * 清理两个环中的退化点
				 */
				a = filterPoints(a, a.next)
				c = filterPoints(c, c.next)
				/**
				 * 对两个子多边形分别从头开始三角化
				 */
				earcutLinked(a, triangles, dim, minX, minY, invSize, 0)
				earcutLinked(c, triangles, dim, minX, minY, invSize, 0)
				return
			}
			b = b.next
		}
		a = a.next
	} while (a !== start)
}

/**
 * Z-order 加速的"耳朵"检测
 *
 * 		输入:
 * 			ear: 候选"耳朵"节点
 * 			minX: 包围盒最小 X
 * 			minY: 包围盒最小 Y
 * 			invSize: Z-order 归一化因子
 * 		输出:
 * 			是否为有效"耳朵"
 *
 * 优化原理:
 * 		- 标准 isEar 需要遍历所有剩余顶点检查是否有点在候选三角形内
 * 		- isEarHashed 利用 Z-order 空间索引将检查范围缩小到空间邻域
 *
 * 检测流程:
 * 		- 凸性检查: area(a, b, c) < 0(必须是凸角/顺时针)
 *    		如果 >= 0 则不是"耳朵"(凹角不可能是"耳朵")
 * 		- 计算候选三角形的 AABB 包围盒 (x0, y0) → (x1, y1)
 * 		- 将 AABB 转换为 Z-order 范围 [minZ, maxZ]
 * 		- 从当前节点的 Z-order 链同时向前 (prevZ) 和向后 (nextZ) 搜索:
 *    		- 只检查 z 值在 [minZ, maxZ] 范围内的节点
 *    		- 只检查坐标在 AABB 内的节点
 *    		- 如果该点在三角形内且该点处为凸角 → 不是"耳朵"
 *
 * Z-order 范围有效:
 * 		Z-order 曲线保持空间局部性: 坐标在 AABB 内的点, 其 Z 值大概率落在 [minZ, maxZ] 范围内, 不在范围内的点大概率不在 AABB 内, 可以安全跳过
 *
 * 排除凹角点:
 * 		- area(p.prev, p, p.next) >= 0 的点是凹角 (reflex vertex)
 * 		- 凹角点即使在三角形内也不影响"耳朵"的有效性, 因为凹角点的存在不会导致三角形与多边形其他部分重叠
 */
export function isEarHashed(ear: TEarNode, minX: number, minY: number, invSize: number): boolean {
	const a: TEarNode = ear.prev
	const b: TEarNode = ear
	const c: TEarNode = ear.next
	/**
	 * 凸性检查: 顺时针方向面积必须为负
	 */
	if (area(a, b, c) >= 0) {
		return false
	}
	/**
	 * 提取三角形顶点坐标
	 */
	const ax: number = a.x
	const bx: number = b.x
	const cx: number = c.x
	const ay: number = a.y
	const by: number = b.y
	const cy: number = c.y
	/**
	 * 计算三角形的 AABB 包围盒
	 */
	const x0: number = Math.min(ax, bx, cx)
	const y0: number = Math.min(ay, by, cy)
	const x1: number = Math.max(ax, bx, cx)
	const y1: number = Math.max(ay, by, cy)
	/**
	 * AABB 转换为 Z-order 范围
	 */
	const minZ: number = zOrder(x0, y0, minX, minY, invSize)
	const maxZ: number = zOrder(x1, y1, minX, minY, invSize)
	/**
	 * 从当前节点同时向 Z-order 链的两个方向搜索
	 */
	let p: TEarNode = ear.prevZ
	let n: TEarNode = ear.nextZ
	/**
	 * 双向搜索: 同时向前后两个方向扩展
	 */
	while (p && p.z >= minZ && n && n.z <= maxZ) {
		/**
		 * 向前搜索(Z 值递减方向)
		 */
		if (
			p.x >= x0 &&
			p.x <= x1 &&
			p.y >= y0 &&
			p.y <= y1 &&
			p !== a &&
			p !== c &&
			pointInTriangleExceptFirst(ax, ay, bx, by, cx, cy, p.x, p.y) &&
			/**
			 * 排除凹角
			 */
			area(p.prev, p, p.next) >= 0 //
		) {
			return false
		}
		p = p.prevZ
		/**
		 * 向后搜索(Z 值递增方向)
		 */
		if (n.x >= x0 && n.x <= x1 && n.y >= y0 && n.y <= y1 && n !== a && n !== c && pointInTriangleExceptFirst(ax, ay, bx, by, cx, cy, n.x, n.y) && area(n.prev, n, n.next) >= 0) {
			return false
		}
		n = n.nextZ
	}
	/**
	 * 处理一侧已到达边界但另一侧仍未完成的情况
	 */
	while (p && p.z >= minZ) {
		if (p.x >= x0 && p.x <= x1 && p.y >= y0 && p.y <= y1 && p !== a && p !== c && pointInTriangleExceptFirst(ax, ay, bx, by, cx, cy, p.x, p.y) && area(p.prev, p, p.next) >= 0) {
			return false
		}
		p = p.prevZ
	}
	while (n && n.z <= maxZ) {
		if (n.x >= x0 && n.x <= x1 && n.y >= y0 && n.y <= y1 && n !== a && n !== c && pointInTriangleExceptFirst(ax, ay, bx, by, cx, cy, n.x, n.y) && area(n.prev, n, n.next) >= 0) {
			return false
		}
		n = n.nextZ
	}
	/**
	 * 没有任何阻塞点, 即有效"耳朵"
	 */
	return true
}

/**
 * 暴力"耳朵"检测(无 Z-order 加速), 检查是否为有效"耳朵"
 *
 * 算法:
 * 		- 凸性检查: area(a, b, c) 必须 < 0 (顺时针凸角)
 * 		- 计算三角形 AABB 包围盒作为快速过滤(粗筛)
 * 		- 遍历多边形中所有其他顶点(从 c.next 到 a)
 * 		- 对每个顶点检查:
 *    		a. 是否在 AABB 内(粗筛, O(1))
 *    		b. 是否在三角形内(精确检测)
 *    		c. 是否为凸角 (area >= 0, 排除凹角点)
 *
 * 如果任何顶点同时满足以上三个条件, 即不是"耳朵"
 */
export function isEar(ear: TEarNode): boolean {
	const a: TEarNode = ear.prev
	const b: TEarNode = ear
	const c: TEarNode = ear.next
	/**
	 * 凸性检查
	 */
	if (area(a, b, c) >= 0) {
		return false
	}
	/**
	 * 三角形顶点坐标
	 */
	const ax: number = a.x
	const bx: number = b.x
	const cx: number = c.x
	const ay: number = a.y
	const by: number = b.y
	const cy: number = c.y
	/**
	 * AABB 包围盒(用于粗筛)
	 */
	const x0: number = Math.min(ax, bx, cx)
	const y0: number = Math.min(ay, by, cy)
	const x1: number = Math.max(ax, bx, cx)
	const y1: number = Math.max(ay, by, cy)
	/**
	 * 遍历所有其他顶点
	 **/
	let p: TEarNode = c.next
	while (p !== a) {
		if (
			/**
			 * AABB 粗筛
			 */
			p.x >= x0 &&
			p.x <= x1 &&
			p.y >= y0 &&
			p.y <= y1 &&
			/**
			 * 精确检测
			 */
			pointInTriangleExceptFirst(ax, ay, bx, by, cx, cy, p.x, p.y) &&
			/**
			 * 排除凹角
			 */
			area(p.prev, p, p.next) >= 0 //
		) {
			return false
		}
		p = p.next
	}

	return true
}

/**
 * 过滤多边形链表中的退化顶点
 *
 * 		输入:
 * 			start: 起始节点
 * 			end: 结束节点(默认等于 start, 遍历一圈)
 * 		输出:
 * 			过滤后的某个有效节点
 *
 * 退化顶点的定义:
 * 	 	- 重复点: 与下一个顶点坐标完全相同 (equals)
 * 		- 共线点: 三角形面积为 0(area(prev, p, next) === 0), 即该点在前后两点的连线上, 对多边形形状无贡献
 *
 * 处理方式:
 * 		- 移除退化点后, 设置 again = true 重新检查(因为移除一个点可能暴露新的退化)
 *		- 跳过标记为 steiner 的点(这些是孔洞桥接引入的辅助点, 不能移除)
 * 		- 当链表只剩一个点时停止
 *
 * 案例:
 * 		A → B → C → D, 如果 B 和 C 重合:
 * 			→ 移除 C → A → B → D
 * 			→ 检查 B 是否与 D 共线...
 */
export function filterPoints(start: TEarNode, end: TEarNode = null!): TEarNode {
	if (!start) {
		return start
	}
	if (!end) {
		end = start
	}
	let p: TEarNode = start
	let again: boolean
	do {
		again = false
		if (!p.steiner && (equals(p, p.next) || area(p.prev, p, p.next) === 0)) {
			/**
			 * 移除退化点
			 */
			removeNode(p)
			p = end = p.prev
			/**
			 * 只剩一个节点
			 */
			if (p === p.next) {
				break
			}
			/**
			 * 标记需要重新检查(移除可能暴露新的退化)
			 */
			again = true
		} else {
			p = p.next
		}
	} while (again || p !== end)
	return end
}
