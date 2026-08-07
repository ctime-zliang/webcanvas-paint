import { earcutLinked, linkedList } from './Link'
import { eliminateHoles } from './Utils'

/**
 * Earcut - 多边形三角剖分算法 (Ear Clipping)
 *
 * Earcut 是一种基于"耳朵裁剪" (Ear Clipping) 的多边形三角剖分算法
 * 将任意简单多边形(可带孔洞)分解为一组三角形, 使这些三角形完全覆盖原始多边形区域且互不重叠
 *
 * 在简单多边形中, 如果连续三个顶点 (prev, curr, next) 形成的三角形:
 *  		- 是凸的(三角形面积为负, 即逆时针方向的有向面积 < 0)
 * 			- 三角形内部不包含多边形的其他任何顶点
 * 		则顶点 curr 被称为"耳朵"
 *
 * 核心定理:
 * 		任何至少有 4 个顶点的简单多边形至少存在 2 个"耳朵" (Two-Ears Theorem)
 * 		因此可以反复裁剪"耳朵"直到多边形退化为三角形
 *
 * 算法复杂度:
 * 		- 基本版本: O(n²)
 * 		- Z-order 哈希优化版本: 接近 O(n·log(n))(对于大多数实际输入)
 *
 * 数据结构:
 * 		使用双向循环链表表示多边形顶点:
 * 			- 每个节点存储顶点坐标 (x, y) 和原始索引 i
 * 			- prev/next 指针形成多边形环
 * 			- prevZ/nextZ 指针形成 Z-order 排序链(空间局部性优化)
 * 			- z 值是 Morton Code(Z-order curve 编码), 用于空间哈希加速
 *
 * 处理流程:
 * 		- 将坐标数组转为双向循环链表(顺时针方向)
 * 		- 如果有孔洞, 通过"桥接边"将孔洞合并到外轮廓
 * 		- 对大型多边形(> 80 顶点)启用 Z-order 空间索引加速
 * 		- 执行"耳朵"裁剪循环:
 *    		- Pass 0: 标准"耳朵"裁剪
 *    		- Pass 1: 过滤退化点 + 修复局部自交后重试
 *    		- Pass 2: 寻找有效对角线分割多边形后分别三角化
 */

/**
 * "耳朵"裁剪链表节点类型
 * 		i: 顶点在原始坐标数组中的索引 (data[i * dim], data[i * dim + 1])
 * 		x: 顶点 X 坐标
 * 		y: 顶点 Y 坐标
 * 		z: Z-order 曲线编码值 (Morton Code), 用于空间局部性排序
 * 		prev: 多边形环中的前驱节点
 * 		next: 多边形环中的后继节点
 * 		prevZ: Z-order 排序链中的前驱节点
 * 		nextZ: Z-order 排序链中的后继节点
 * 		steiner: 是否为 Steiner 点(孔洞桥接时引入的辅助点)
 */
export type TEarNode = {
	i: number
	x: number
	y: number
	z: number
	prev: TEarNode
	next: TEarNode
	prevZ: TEarNode
	nextZ: TEarNode
	steiner: boolean
}

export class Earcut {
	/**
	 * 执行多边形三角剖分
	 *
	 * 输入:
	 * 		data: [x0, y0, x1, y1, ..., xn, yn]: 坐标列表
	 * 		如果 dim > 2, 每个顶点可携带额外数据(如 z 坐标), 但只使用前两维
	 *
	 * 孔洞通过 holeIndices 指定:
	 * 		holeIndices[0] 表示第一个孔洞起始顶点的索引(非坐标索引)
	 * 		例: holeIndices = [4] 表示 data 中第 4 * dim 个坐标开始是孔洞
	 *
	 * 输出:
	 * 		返回三角形索引数组: [i0, i1, i2, i3, i4, i5, ...], 每 3 个连续索引构成一个三角形
	 *
	 * Z-order 优化阈值:
	 * 		- 当顶点数 > 80 时启用 Z-order 空间索引
	 * 		- Z-order 将 2D 坐标映射到 1D 空间填充曲线, 使空间相邻的点在排序后也相邻, 加速"耳朵"内是否有其他点"的检测
	 */
	public static convert(data: Array<number>, holeIndices: Array<number> = null!, dim: number = 2): Array<number> {
		const hasHoles: number = holeIndices && holeIndices.length
		/**
		 *  外轮廓的坐标范围: 从索引 0 到第一个孔洞起始位置
		 */
		const outerLen: number = hasHoles ? holeIndices[0] * dim : data.length
		const triangles: Array<number> = []
		/**
		 * 将外轮廓坐标转为双向循环链表(确保顺时针方向)
		 **/
		let outerNode: TEarNode = linkedList(data, 0, outerLen, dim, true)
		/**
		 * 退化检查: 少于 3 个有效顶点则无法三角化
		 */
		if (!outerNode || outerNode.next === outerNode.prev) {
			return triangles
		}
		let minX: number = undefined!
		let minY: number = undefined!
		let invSize: number = undefined!
		/**
		 * 如果有孔洞, 通过桥接边将孔洞合并到外轮廓链表中
		 **/
		if (hasHoles) {
			outerNode = eliminateHoles(data, holeIndices, outerNode, dim)
		}
		/**
		 * 对大型多边形启用 Z-order 空间索引加速
		 **/
		/**
		 * 阈值 80 是经验值: 小于 80 个顶点时暴力检测足够快
		 */
		if (data.length > 80 * dim) {
			minX = Infinity
			minY = Infinity
			let maxX: number = -Infinity
			let maxY: number = -Infinity
			/**
			 * 计算外轮廓的包围盒(不含孔洞坐标)
			 */
			for (let i: number = dim; i < outerLen; i += dim) {
				const x: number = data[i]
				const y: number = data[i + 1]
				if (x < minX) {
					minX = x
				}
				if (y < minY) {
					minY = y
				}
				if (x > maxX) {
					maxX = x
				}
				if (y > maxY) {
					maxY = y
				}
			}
			/**
			 * invSize: 坐标归一化因子
			 * 		- 将坐标映射到 [0, 32767] 整数范围, 用于 Z-order 编码
			 * 		- 32767 = 2^15 - 1, 使用 15 位精度
			 * 		- 取包围盒宽高的较大值作为归一化基准, 保持纵横比
			 *
			 * 数学:
			 * 			invSize = 32767 / max(width, height)
			 * 		归一化坐标: nx = (x - minX) * invSize
			 */
			invSize = Math.max(maxX - minX, maxY - minY)
			invSize = invSize !== 0 ? 32767 / invSize : 0
		}
		/**
		 * 执行"耳朵"裁剪 (pass = 0 为首轮标准裁剪)
		 */
		earcutLinked(outerNode, triangles, dim, minX, minY, invSize, 0)
		return triangles
	}
}
