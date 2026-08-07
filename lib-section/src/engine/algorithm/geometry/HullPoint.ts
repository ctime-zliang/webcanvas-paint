import { Vector2 } from './vector/Vector2'

/**
 * HullPoint - 凸包计算中使用的增强点类
 *
 * 在 Graham Scan 凸包算法中, 每个点除了自身坐标外, 还需要额外信息:
 * 		- degree (斜率): 相对于极点 (origin) 的方向斜率, 用于极角排序
 * 		- dist (距离): 到极点的距离, 用于同斜率时的优先级判断
 *
 * 斜率 vs 极角:
 * 		使用斜率 (dy / dx) 代替 atan2 计算极角的原因:
 * 			- 避免三角函数运算, 提升性能
 * 			- 斜率的单调性与极角一致(在相同象限内), 排序结果等价
 *
 * 案例:
 * 		origin = (0, 0), point = (3, 4)
 * 		degree = (4 - 0) / (3 - 0) = 4 / 3 ≈ 1.333
 * 		dist = sqrt(9 + 16) = 5
 *
 * 		origin = (0, 0), point = (1, 2)
 * 		degree = (2 - 0) / (1 - 0) = 2
 * 		dist = sqrt(1 + 4) ≈ 2.236
 */
export class HullPoint extends Vector2 {
	/**
	 * 计算从点 p1 到点 p2 的斜率
	 * 		斜率 = Δy / Δx = (p2.y - p1.y) / (p2.x - p1.x)
	 *
	 * 当 p2.x === p1.x 时(垂直线), 结果为 ±Infinity
	 */
	public static dgree(p1: Vector2, p2: Vector2): number {
		return (p2.y - p1.y) / (p2.x - p1.x)
	}

	/**
	 * 排序比较器: 按斜率降序排列
	 * 在 Graham Scan 中, 降序斜率对应从"最远离水平方向"到"最接近水平方向"的扫描顺序
	 */
	public static sortByDgreeDesc(hp1: HullPoint, hp2: HullPoint): number {
		return hp2._degree - hp1._degree
	}
	private readonly _degree: number
	private readonly _origin: Vector2
	private readonly _dist: number
	constructor(point: Vector2, origin: Vector2) {
		super(point.x, point.y)
		this._origin = origin
		this._degree = HullPoint.dgree(origin, point)
		this._dist = origin.distance(this)
	}

	public get degree(): number {
		return this._degree
	}

	public get origin(): Vector2 {
		return this._origin
	}

	public get dist(): number {
		return this._dist
	}
}
