import { TEarNode } from './Earcut'
import { cureLocalIntersections, equals, filterPoints, indexCurve, insertNode, isEar, isEarHashed, removeNode, signedArea, splitEarcut } from './Utils'

/**
 * 将扁平坐标数组转换为双向循环链表
 *
 * 		输入:
 * 			data: 扁平化坐标数组
 * 			start: 起始坐标索引
 * 			end: 结束坐标索引(不包含)
 * 			dim: 每个顶点的维度
 * 			clockwise: 期望的绕向是否为顺时针
 * 		输出:
 * 			链表的最后一个插入的节点
 *
 * 算法原理:
 *  	- 计算输入坐标的有向面积 (Shoelace 公式)
 * 		- 比较有向面积的符号与期望的绕向 (clockwise 参数)
 * 		- 如果方向一致: 按正序插入节点, 如果方向相反: 按逆序插入节点(等效于反转绕向)
 * 		- 最后检查并移除末尾与头部重合的退化点
 *
 * 需要统一绕向:
 * 		"耳朵"裁剪算法依赖于一致的绕向来判断凸凹性:
 * 			- 顺时针环中, area(prev, curr, next) < 0 表示凸顶点
 * 			- 如果绕向不一致, 凸凹判断会反转, 导致错误的三角化
 */
export function linkedList(data: Array<number>, start: number, end: number, dim: number, clockwise: boolean): TEarNode {
	let last: TEarNode = null!
	/**
	 * 绕向判定:
	 * 		signedArea > 0 表示当前数据为逆时针
	 * 		clockwise === (signedArea > 0) 为 true 时, 表示当前绕向与期望一致, 此时按正序插入, 否则按逆序插入以反转方向
	 */
	if (clockwise === signedArea(data, start, end, dim) > 0) {
		/**
		 * 正序插入
		 * 		按坐标在数组中的顺序依次链接
		 */
		for (let i: number = start; i < end; i += dim) {
			last = insertNode((i / dim) | 0, data[i], data[i + 1], last)
		}
	} else {
		/**
		 * 逆序插入
		 * 		从末尾向前遍历, 等效于反转绕向
		 */
		for (let i: number = end - dim; i >= start; i -= dim) {
			last = insertNode((i / dim) | 0, data[i], data[i + 1], last)
		}
	}
	/**
	 * 移除首尾重合的退化点(某些多边形数据首尾坐标重复)
	 */
	if (last && equals(last, last.next)) {
		removeNode(last)
		last = last.next
	}
	return last
}

/**
 * "耳朵"裁剪主循环
 *
 * 		输入:
 * 			ear: 起始"耳朵"候选节点
 * 			triangles: 输出三角形索引数组
 * 			dim: 顶点维度
 * 			minX: 包围盒最小 X (用于 Z-order 计算)
 * 			minY: 包围盒最小 Y
 * 			invSize: Z-order 归一化因子(0 表示不使用哈希加速)
 * 			pass: 当前处理轮次 (0, 1, 2)
 *
 * 核心算法:
 * 		遍历多边形链表, 对每个顶点检测是否为"耳朵":
 * 			- 如果是"耳朵": 输出三角形 (prev, ear, next), 从链表移除 ear 节点
 * 			- 如果不是: 移动到下一个顶点继续检测
 * 			- 当链表退化为 2 个节点时 (prev === next), 所有三角形已提取完毕
 *
 * 多轮次策略(Pass 机制):
 * 		某些复杂多边形可能在标准裁剪中"卡住"(遍历一圈没找到"耳朵"), 此时通过逐步放宽条件来处理:
 * 			- Pass 0(首轮 - 标准裁剪):
 *   			使用严格的"耳朵"检测, 优先移除最明显的"耳朵"
 *   			如果遍历一圈没有进展, 进入 Pass 1
 * 			- Pass 1 (过滤 + 修复局部自交):
 *  			- filterPoints: 移除重复点和共线点(面积为 0 的退化顶点)
 *   			- cureLocalIntersections: 检测并修复局部自交叉
 *   			- 重新尝试标准裁剪 (Pass 2)
 * 			- Pass 2 (分割策略):
 *   			- 寻找多边形中的有效对角线, 将其分割为两个子多边形, 对每个子多边形独立执行三角化, 这是最终的兜底策略
 *
 * Z-order 加速原理:
 * 		当 invSize > 0 时, 使用 isEarHashed 代替 isEar:
 * 			- isEar 检测需要遍历所有剩余顶点 (O(n))
 * 			- isEarHashed 只检测 Z-order 值在候选三角形范围内的节点
 * 		由于 Z-order 保持空间局部性, 远离候选三角形的点会被跳过
 */
export function earcutLinked(ear: TEarNode, triangles: Array<number>, dim: number, minX: number, minY: number, invSize: number, pass: number): void {
	if (!ear) {
		return
	}
	/**
	 * 首轮且启用 Z-order 时, 为所有节点计算 Morton Code 并排序
	 */
	if (!pass && invSize) {
		indexCurve(ear, minX, minY, invSize)
	}
	/**
	 * stop 标记: 当 ear 重新回到 stop 时, 说明遍历了一整圈没有进展
	 */
	let stop: TEarNode = ear
	while (ear.prev !== ear.next) {
		const prev: TEarNode = ear.prev
		const next: TEarNode = ear.next
		/**
		 * "耳朵"检测: 根据是否启用 Z-order 选择不同的检测方法
		 */
		if (invSize ? isEarHashed(ear, minX, minY, invSize) : isEar(ear)) {
			/**
			 *  找到"耳朵", 则输出三角形并移除该节点
			 */
			triangles.push(prev.i, ear.i, next.i)
			removeNode(ear)
			ear = next.next
			stop = next.next
			continue
		}
		ear = next
		/**
		 * 遍历一整圈后仍未找到"耳朵", 即进入下一轮次
		 */
		if (ear === stop) {
			if (!pass) {
				/**
				 * Pass 0 失败 → 过滤退化点后重试
				 */
				earcutLinked(filterPoints(ear), triangles, dim, minX, minY, invSize, 1)
			} else if (pass === 1) {
				/**
				 * Pass 1 失败 → 修复局部自交后重试
				 */
				ear = cureLocalIntersections(filterPoints(ear), triangles)
				earcutLinked(ear, triangles, dim, minX, minY, invSize, 2)
			} else if (pass === 2) {
				/**
				 * Pass 2 失败 → 对角线分割兜底
				 */
				splitEarcut(ear, triangles, dim, minX, minY, invSize)
			}
			break
		}
	}
}

/**
 * Z-order 链表归并排序(自底向上)
 *
 * 		输入:
 * 			list: Z-order 链表的起始节点
 * 		输出:
 * 			排序后的链表头节点
 *
 * 算法原理 - Bottom-Up Merge Sort:
 * 		对以 nextZ/prevZ 指针连接的链表按 z 值 (Morton Code) 升序排序
 *
 * 使用自底向上的归并排序:
 *  	- 初始步长 inSize = 1 (每个元素视为长度 1 的已排序子序列)
 * 		- 每轮将相邻的两个子序列合并为一个有序序列
 * 		- 步长翻倍: inSize *= 2
 * 		- 当一轮只产生 1 次合并时 (numMerges <= 1), 排序完成
 *
 * 使用归并排序
 * 		- 链表不支持随机访问, 归并排序只需顺序遍历
 * 		- 时间复杂度稳定 O(n·log(n))
 * 		- 空间复杂度 O(1) (原地排序, 只修改指针)
 *
 * Z-order 排序的作用:
 * 		- 排序后, 空间相邻的顶点在 Z-order 链中也相邻
 * 		- isEarHashed 利用这个性质: 只需检查 Z 值在候选三角形
 * 		- AABB 范围内的节点, 而非遍历所有节点
 */
export function sortLinked(list: TEarNode): TEarNode {
	let numMerges: number
	let inSize: number = 1
	do {
		let p: TEarNode = list
		let e: TEarNode = null!
		list = null!
		let tail: TEarNode = null!
		numMerges = 0
		while (p) {
			numMerges++
			/**
			 * 找到第二个子序列的起始位置(跳过 inSize 个节点)
			 */
			let q: TEarNode = p
			let pSize: number = 0
			for (let i: number = 0; i < inSize; i++) {
				pSize++
				q = q.nextZ
				if (!q) {
					break
				}
			}
			let qSize: number = inSize
			/**
			 * 合并 p 子序列(长度 pSize) 和 q 子序列(长度 qSize)
			 */
			while (pSize > 0 || (qSize > 0 && q)) {
				/**
				 * 选择较小的元素加入结果链表
				 */
				if (pSize !== 0 && (qSize === 0 || !q || p.z <= q.z)) {
					e = p
					p = p.nextZ
					pSize--
				} else {
					e = q
					q = q.nextZ
					qSize--
				}
				/**
				 * 将选中的节点追加到结果链表尾部
				 */
				if (tail) {
					tail.nextZ = e
				} else {
					list = e
				}
				e.prevZ = tail
				tail = e
			}
			/**
			 * 移动到下一对子序列
			 */
			p = q
		}
		/**
		 * 终止结果链表
		 */
		tail.nextZ = null!
		/**
		 * 步长翻倍
		 */
		inSize *= 2
	} while (
		/**
		 * 只剩一次合并说明全局有序
		 */
		numMerges > 1
	)
	return list
}
