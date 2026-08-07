import { TSimpleRect } from './Rtree'

/**
 * R-Tree 矩形几何运算工具类
 *
 * 封装 R-Tree 数据结构中所有涉及的矩形几何运算, 包括: 重叠检测、包含检测、最小外接矩形(MBR)计算、矩形扩展与正方化评估
 *
 * R-Tree 的核心思想是通过层级化的矩形包围盒(MBR, Minimum Bounding Rectangle) 来组织空间对象, 从而实现高效的空间查询(如范围搜索、碰撞检测)
 * 本类中的方法是 R-Tree 节点插入、分裂、搜索、删除等操作的底层数学基础
 *
 * 坐标系约定:
 * 		- 所有矩形使用 (x, y, w, h) 表示, 其中 (x, y) 为左上角坐标, w 为宽度, h 为高度
 * 		- 矩形右下角坐标为 (x + w, y + h)
 */

export class Rectangle {
	/**
	 * 判断 a 与 b 是否有重叠
	 */
	public static overlapRectangle(a: TSimpleRect, b: TSimpleRect): boolean {
		/**
		 * 矩形重叠检测 (AABB 碰撞检测)
		 *
		 * 数学原理:
		 * 		两个轴对齐矩形 A 和 B 在二维平面上不重叠的充要条件为:
		 *   		- A 在 B 的左边 (A.x + A.w <= B.x) 或
		 *   		- A 在 B 的右边 (A.x >= B.x + B.w) 或
		 *   		- A 在 B 的上方 (A.y + A.h <= B.y) 或
		 *   		- A 在 B 的下方 (A.y >= B.y + B.h)
		 *
		 * 取其逆命题即可得到重叠的条件:
		 *  	A.x < B.x + B.w && A.x + A.w > B.x && A.y < B.y + B.h && A.y + A.h > B.y
		 *
		 * 退化情况处理:
		 * 		当矩形退化为点(w = 0, h = 0)时, 使用非严格不等式(<=, >=)允许边界接触视为重叠, 以确保零面积的点或线段也能被正确检索到
		 */
		if ((a.h === 0 && a.w === 0) || (b.h === 0 && b.w === 0)) {
			return a.x <= b.x + b.w && a.x + a.w >= b.x && a.y <= b.y + b.h && a.y + a.h >= b.y
		}
		return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
	}

	/**
	 * 判断 a 是否包含于 b 中
	 */
	public static containsRectangle(a: TSimpleRect, b: TSimpleRect): boolean {
		/**
		 * 矩形包含检测
		 *
		 * 数学原理:
		 * 		矩形 A 被矩形 B 完全包含的充要条件为:
		 *   		A 的左边界 >= B 的左边界 (A.x >= B.x)
		 *   		A 的右边界 <= B 的右边界 (A.x + A.w <= B.x + B.w)
		 *   		A 的上边界 >= B 的上边界 (A.y >= B.y)
		 *   		A 的下边界 <= B 的下边界 (A.y + A.h <= B.y + B.h)
		 * 即 A 的四条边均不超出 B 的对应边
		 */
		return a.x + a.w <= b.x + b.w && a.x >= b.x && a.y + a.h <= b.y + b.h && a.y >= b.y
	}

	/**
	 * 读取 nodes 中各项的矩形尺寸, 重新修改 expandRect 的矩形尺寸
	 * 以使得 expandRect 能够包含所有 nodes[i]
	 */
	public static makeMBR(expandRect: TSimpleRect, nodes: Array<TSimpleRect>): TSimpleRect {
		/**
		 * 最小外接矩形 (MBR - Minimum Bounding Rectangle) 计算
		 *
		 * 数学原理:
		 * 		给定一组矩形集合 S = {R₁, R₂, ..., Rₙ}, 其 MBR 为:
		 *   		- MBR.x = min(R₁.x, R₂.x, ..., Rₙ.x)
		 *   		- MBR.y = min(R₁.y, R₂.y, ..., Rₙ.y)
		 *   		- MBR.x + MBR.w = max(R₁.x + R₁.w, R₂.x + R₂.w, ..., Rₙ.x + Rₙ.w)
		 *   		- MBR.y + MBR.h = max(R₁.y + R₁.h, R₂.y + R₂.h, ..., Rₙ.y + Rₙ.h)
		 *
		 * 该操作等价于对所有子矩形取并集后求外接矩形
		 * 在 R-Tree 中, 每个内部节点的 MBR 恰好是其所有子节点 MBR 的最小外接矩形
		 *
		 * 实现策略:
		 * 		- 以第一个节点初始化 expandRect, 然后逐一将后续节点"扩展"进来
		 * 		- 当 nodes 为空时, 返回零矩形以表示空集
		 */
		if (!nodes.length) {
			return {
				x: 0,
				y: 0,
				w: 0,
				h: 0,
			}
		}
		expandRect.x = nodes[0].x
		expandRect.y = nodes[0].y
		expandRect.w = nodes[0].w
		expandRect.h = nodes[0].h
		let len: number = nodes.length
		for (let i: number = 1; i < len; i++) {
			Rectangle.expandRectangle(expandRect, nodes[i])
		}
		return expandRect
	}

	/**
	 * 读取 b 的尺寸数据来修改 a 的尺寸数据
	 * 使得 a 占用范围能够"包裹" b
	 *
	 * a - 待扩展的矩形
	 * b - 被覆盖的矩形
	 */
	public static expandRectangle(a: TSimpleRect, b: TSimpleRect): TSimpleRect {
		/**
		 * 矩形扩展(合并)运算
		 *
		 * 数学原理:
		 * 		给定矩形 A 和 B, 计算能同时包含 A 和 B 的最小矩形 C:
		 *   		- C.x = min(A.x, B.x)  // 新左边界取两者最左
		 *   		- C.y = min(A.y, B.y)  // 新上边界取两者最上
		 *   		- C.w = max(A.x + A.w, B.x + B.w) - C.x  // 新宽度 = 最右边界 - 新左边界
		 *   		- C.h = max(A.y + A.h, B.y + B.h) - C.y  // 新高度 = 最下边界 - 新上边界
		 *
		 * 该操作是 R-Tree 节点插入后向上逐层更新 MBR 的核心运算
		 * 每当子节点被插入到某个内部节点后, 该内部节点的 MBR 可能需要扩展, 以确保其仍然能包含所有子节点
		 *
		 * 注意:
		 * 		此方法直接修改 a 的值(原地操作)并返回 a 的引用
		 */
		let nx: number = 0
		let ny: number = 0
		let axw: number = a.x + a.w
		let bxw: number = b.x + b.w
		let ayh: number = a.y + a.h
		let byh: number = b.y + b.h
		nx = a.x > b.x ? b.x : a.x
		ny = a.y > b.y ? b.y : a.y
		a.w = axw > bxw ? axw - nx : bxw - nx
		a.h = ayh > byh ? ayh - ny : byh - ny
		a.x = nx
		a.y = ny
		return a
	}

	public static squarifiedRatio(l: number, w: number, fill: number): number {
		/**
		 * 正方化比率(Squarified Ratio)评估函数
		 *
		 * 数学原理:
		 * 		该函数用于评估矩形在给定填充因子下的"质量", 用于节点分裂和子树选择的决策
		 *
		 * 原始公式(已简化):
		 *   	半周长: perimeter = (l + w) / 2
		 *   	面积: area = l * w
		 *   	几何因子: geo = area / (perimeter²)
		 *   	评估值: result = (area * fill) / geo = perimeter² * fill
		 *
		 * 简化后:
		 * 		result = ((l + w) / 2)² × fill
		 *
		 * 设计意图:
		 * 		- 当矩形趋近于正方形时(l ≈ w), 对于相同面积, 半周长最小, 因此 squarifiedRatio 值最小
		 * 		- fill 参数代表节点中元素的填充数量, 值越大意味着节点越"满"
		 * 		- 在 chooseLeafSubtree 和 pickNext 中, 选择使该值变化量最小的节点, 即倾向于选择插入后形状仍接近正方形、且面积增长最小的节点, 从而减少无效覆盖面积(dead space)
		 */
		// const lperi = (l + w) / 2
		// const larea = l * w
		// const lgeo = larea / (lperi * lperi)
		// return (larea * fill) / lgeo
		const a = (l + w) / 2
		return a * a * fill
	}
}
