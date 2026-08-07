import { ArraySort } from '../../math/ArraySort'
import { HullPoint } from './HullPoint'
import { Vector2 } from './vector/Vector2'

/**
 * Convex - 二维凸包计算 (Graham Scan 算法)
 *
 * 凸包定义:
 * 		给定平面上的一组点, 凸包 (Convex Hull) 是能包含所有点的最小凸多边形
 * 		直觉上可以理解为: 在所有点外围绷一根橡皮筋, 橡皮筋收缩后的形状即为凸包
 *
 * Graham Scan 算法原理:
 * 		- 选择一个"极点" (pivot): 通常选 y 坐标最小的点 (y 相同选 x 最小的)
 * 		- 按极角排序: 以极点为原点, 计算其他所有点的极角(斜率), 按极角从大到小排序
 * 		- 逐点扫描: 按排序顺序依次处理每个点, 维护一个栈:
 *    		- 若新点使得栈顶两点与新点构成"左转"(叉积 > 0), 则新点在凸包上, 入栈
 *   		- 若构成"右转"或共线(叉积 ≤ 0), 则栈顶点不在凸包上, 出栈, 继续检查
 *
 * 案例说明:
 * 		输入点集:
 * 				(0, 0), (1, 0), (2, 0), (2, 2), (1, 3), (0, 2), (1, 1)
 *    					(1, 3)
 *     				  	/ \
 *  			 	(0, 2) (2, 2)
 *    			  	 | (1, 1) |     // 内部点, 不在凸包上
 *  			(0, 0) ─ (1, 0) ─ (2, 0)
 * 			极点选择: y最小, x最小
 * 				(0, 0)
 * 			按斜率排序后: 斜率从小到大
 * 				(2, 0), (2, 2), (1, 3), (0, 2)
 * 			扫描结果: 凸包顶点按序为:
 * 				(0, 0), (2, 0), (2, 2), (1, 3), (0, 2)
 * ============================================================================
 */
export class Convex {
	/**
	 * 对按斜率排序后的点集进行去重(相同斜率方向只保留一个代表点)
	 *
	 * 		输入:
	 * 			hullPoints: 按斜率排序后的点数组
	 * 			start: 起始索引
	 * 			len: 处理的点数量
	 * 		返回:
	 * 			去重后的 HullPoint 数组
	 *
	 * 算法说明:
	 * 		- 在 Graham Scan 中, 如果多个点具有相同的极角(斜率),
	 * 		- 只需要保留距离极点最远的那个点(或第一个遇到的不同斜率的点)
	 * 		- 此函数遍历 [start, start+len) 范围内的 HullPoint, 跳过相邻的同斜率点
	 */
	public static reduce(hullPoints: Array<HullPoint>, start: number, len: number): Array<HullPoint> {
		const results: Array<HullPoint> = [hullPoints[start]]
		let prev: number = hullPoints[start].degree
		let end: number = start + len
		for (let i: number = start + 1; i < end; i++) {
			let cur: HullPoint = hullPoints[i]
			if (prev !== cur.degree) {
				results.push(cur)
				prev = cur.degree
			}
		}
		return results
	}

	/**
	 * Graham Scan 主算法 - 计算点集的凸包顶点序列
	 *
	 * 		输入:
	 * 			hullPoints: 输入点集
	 * 		返回:
	 * 			凸包顶点的有序数组(逆时针方向)
	 *
	 * 算法流程:
	 * 		- 找极点: 遍历所有点, 找 y 最小(y 相同则 x 最小)的点作为 origin
	 * 		- 计算极角: 对每个非极点的点, 计算其相对于 origin 的斜率(作为极角的代替)
	 * 		- 排序: 按斜率降序排列(对应极角从大到小)
	 * 		- 去重: 相同斜率的点只保留一个
	 * 	栈扫描:
	 *    	- 初始将 origin 和第一个排序点入栈
	 *    	- 对每个后续点 cur:
	 *      	- 检查 (栈倒数第二 → 栈顶 → cur) 的叉积
	 *      	- 若叉积 > 0(左转), 说明栈顶点在凸包上, 将 cur 入栈
	 *      	- 若叉积 ≤ 0(右转/共线), 弹出栈顶, 继续检查
	 *    	- 最后以 origin 作为闭合点执行同样的检查
	 *
	 * 叉积判断方向:
	 * 		- 向量 AB × AC = (B - A) · cross(C - B)
	 * 			值 > 0: A → B → C 构成逆时针方向(左转), 即 B 在凸包上
	 * 			值 ≤ 0: A → B → C 构成顺时针方向或共线(右转), 即 B 不在凸包上
	 */
	public static pull(hullPoints: Array<HullPoint>): Array<Vector2> {
		let origin: Vector2 = null!
		for (let hp of hullPoints) {
			if (origin) {
				if (origin.y > hp.y || (origin.y === hp.y && origin.x > hp.x)) {
					origin = hp
				}
			} else {
				origin = hp
			}
		}
		if (origin === null) {
			throw new Error(`error hull-points.`)
		}
		let hps: Array<HullPoint> = new Array<HullPoint>(hullPoints.length)
		let cnt: number = 0
		for (let hp of hullPoints) {
			if (!hp.equalsWithVector2(origin)) {
				hps[cnt++] = new HullPoint(hp, origin)
			}
		}
		ArraySort.quickSort(hps, HullPoint.sortByDgreeDesc, 0, cnt)
		hps = Convex.reduce(hps, 0, cnt)
		if (hps.length === 1) {
			return [origin, hps[0]]
		}
		const results: Array<Vector2> = []
		results.push(origin)
		results.push(hps[0])
		for (let i: number = 0; i <= hps.length; i++) {
			let cur: Vector2 = null!
			if (i === hps.length) {
				cur = origin
			} else {
				cur = hps[i]
			}
			while (true) {
				const prev: Vector2 = results.pop()!
				if (typeof prev !== 'undefined') {
					const last: Vector2 = results[results.length - 1]
					const crossValue: number = prev.sub(last).cross(cur.sub(prev))
					if (crossValue > 0) {
						results.push(prev, cur)
						break
					}
				} else {
					break
				}
			}
		}
		results.pop()
		return results
	}
}
