/**
 * 精确几何方向判定算法 (Robust Orientation Predicates)
 *
 * 用于判断点的方向关系
 *
 * 核心思想:
 * 		先用浮点运算快速估算, 当结果接近零(存在舍入误差风险)时, 使用"扩展精度算术"(expansion arithmetic)进行精确计算, 确保结果正确
 */

import { Twos } from '../../math/Twos'

/**
 * 机器精度 epsilon = 2^-53 ≈ 1.11e-16
 * 双精度浮点数中, 1.0 和下一个可表示浮点数之间的差值
 */
const EPSILON: number = 1.1102230246251565e-16

/**
 * 三点方向判定的误差界
 * 		当 |det| < ERRBOUND3 * s 时, 浮点快速路径可能不可靠, 需要切换到精确计算
 * 		公式来源:
 * 			Shewchuk 的误差分析: (3 + 16ε) * ε
 */
const ERRBOUND3: number = (3.0 + 16.0 * EPSILON) * EPSILON

/**
 * 四点方向判定的误差界(用于三维空间中四点共面判定)
 * 		公式: (7 + 56ε) * ε
 */
const ERRBOUND4: number = (7.0 + 56.0 * EPSILON) * EPSILON
void ERRBOUND4

/**
 * 标量 - 标量精确加法 (Two-Sum)
 *
 * 将两个浮点数 a + b 精确表示为一个扩展 [y, x]
 * 		其中
 * 			x 是浮点加法结果(高位), y 是舍入误差(低位)
 * 		满足
 * 			a + b = y + x (数学精确等式)
 */
function scalarScalar(a: number, b: number): Array<number> {
	/**
	 * 浮点加法, 可能有舍入
	 */
	let x: number = a + b
	/**
	 * 恢复 b 的虚拟值
	 */
	let bv: number = x - a
	/**
	 * 恢复 a 的虚拟值
	 */
	let av: number = x - bv
	/**
	 * b 的舍入误差
	 */
	let br: number = b - bv
	/**
	 * a 的舍入误差
	 */
	let ar: number = a - av
	let y: number = ar + br
	/**
	 * 总舍入误差
	 */
	if (y) {
		return [y, x]
	}
	return [x]
}

/**
 * 线性扩展求和 (Linear Expansion Sum)
 *
 * 将两个扩展 e 和 f 相加, 返回精确表示 e + f 的新扩展
 *
 * 算法思路(归并式扫描):
 * 		- 两个扩展的分量已按绝对值从小到大排列
 *   	- 使用类似归并排序的双指针, 每次从 e 或 f 中取绝对值更小的分量
 *   	- 对取出的分量逐一用 "Grow-Expansion" 技术累加到结果中
 *   	- 保证输出扩展的每个分量都是不重叠的 (non-overlapping)
 *
 * Grow-Expansion 核心步骤(对累加器 [q0, q1] 加入新分量 a):
 *   	- 先计算 a + q0 的精确二分量表示 (y, x)
 *   	- y 若非零则输出到结果
 *   	- 再计算 q1 + x 的精确二分量表示, 更新累加器
 */
function linearExpansionSum(e: Array<number>, f: Array<number>): Array<number> {
	const ne: number = e.length | 0
	const nf: number = f.length | 0
	if (ne === 1 && nf === 1) {
		return scalarScalar(e[0], f[0])
	}
	const n: number = ne + nf
	const g: Array<number> = new Array(n)
	let count: number = 0
	let eptr: number = 0
	let fptr: number = 0
	let ei: number = e[eptr]
	let ea: number = Math.abs(ei)
	let fi: number = f[fptr]
	let fa: number = Math.abs(fi)
	let a: number
	let b: number
	/**
	 * 选出绝对值最小的分量作为 b, 即初始化累加器的起点
	 **/
	if (ea < fa) {
		b = ei
		eptr += 1
		if (eptr < ne) {
			ei = e[eptr]
			ea = Math.abs(ei)
		}
	} else {
		b = fi
		fptr += 1
		if (fptr < nf) {
			fi = f[fptr]
			fa = Math.abs(fi)
		}
	}
	/**
	 * 出第二小的分量作为 a, 与 b 一起构成初始累加器
	 **/
	if ((eptr < ne && ea < fa) || fptr >= nf) {
		a = ei
		eptr += 1
		if (eptr < ne) {
			ei = e[eptr]
			ea = Math.abs(ei)
		}
	} else {
		a = fi
		fptr += 1
		if (fptr < nf) {
			fi = f[fptr]
			fa = Math.abs(fi)
		}
	}
	/**
	 * 初始化累加器
	 * 		[q0, q1]: q0 是低位(舍入误差), q1 是高位
	 **/
	let x: number = a + b
	let bv: number = x - a
	let y: number = b - bv
	/**
	 * 低位分量
	 */
	let q0: number = y
	/**
	 * 高位分量
	 */
	let q1: number = x
	let _x: number
	let _bv: number
	let _av: number
	let _br: number
	let _ar: number
	/**
	 * loop:
	 * 		归并处理两个扩展的剩余分量
	 **/
	while (eptr < ne && fptr < nf) {
		if (ea < fa) {
			a = ei
			eptr += 1
			if (eptr < ne) {
				ei = e[eptr]
				ea = Math.abs(ei)
			}
		} else {
			a = fi
			fptr += 1
			if (fptr < nf) {
				fi = f[fptr]
				fa = Math.abs(fi)
			}
		}
		/**
		 * Grow-Expansion: 将 a 累加到 [q0, q1]
		 */
		b = q0
		x = a + b
		bv = x - a
		y = b - bv
		if (y) {
			/**
			 * 输出非零低位分量
			 */
			g[count++] = y
		}
		_x = q1 + x
		_bv = _x - q1
		_av = _x - _bv
		_br = x - _bv
		_ar = q1 - _av
		/**
		 * 新的低位
		 */
		q0 = _ar + _br
		/**
		 * 新的高位
		 */
		q1 = _x
	}
	/**
	 * 处理 e 的剩余分量
	 */
	while (eptr < ne) {
		a = ei
		b = q0
		x = a + b
		bv = x - a
		y = b - bv
		if (y) {
			g[count++] = y
		}
		_x = q1 + x
		_bv = _x - q1
		_av = _x - _bv
		_br = x - _bv
		_ar = q1 - _av
		q0 = _ar + _br
		q1 = _x
		eptr += 1
		if (eptr < ne) {
			ei = e[eptr]
		}
	}
	/**
	 * 处理 f 的剩余分量
	 */
	while (fptr < nf) {
		a = fi
		b = q0
		x = a + b
		bv = x - a
		y = b - bv
		if (y) {
			g[count++] = y
		}
		_x = q1 + x
		_bv = _x - q1
		_av = _x - _bv
		_br = x - _bv
		_ar = q1 - _av
		q0 = _ar + _br
		q1 = _x
		fptr += 1
		if (fptr < nf) {
			fi = f[fptr]
		}
	}
	/**
	 * 输出累加器中剩余的非零分量
	 */
	if (q0) {
		g[count++] = q0
	}
	if (q1) {
		g[count++] = q1
	}
	/**
	 * 确保至少有一个分量(零值)
	 */
	if (!count) {
		g[count++] = 0.0
	}
	g.length = count
	return g
}

/**
 * 精确扩展减法 (Robust Subtract)
 * 		e - 被减数扩展
 * 		f - 减数扩展
 *
 * 计算 e - f, 等价于 e + (-f), 返回精确表示 e - f 的扩展
 *
 * 实现方式:
 * 		对 f 的每个分量取反后, 使用与 linearExpansionSum 相同的归并累加算法
 */
function robustSubtract(e: Array<number>, f: Array<number>): Array<number> {
	const ne: number = e.length | 0
	const nf: number = f.length | 0
	if (ne === 1 && nf === 1) {
		return scalarScalar(e[0], -f[0])
	}
	const n: number = ne + nf
	const g: Array<number> = new Array(n)
	let count: number = 0
	let eptr: number = 0
	let fptr: number = 0
	let ei: number = e[eptr]
	let ea: number = Math.abs(ei)
	let fi: number = -f[fptr]
	let fa: number = Math.abs(fi)
	let a: number
	let b: number
	if (ea < fa) {
		b = ei
		eptr += 1
		if (eptr < ne) {
			ei = e[eptr]
			ea = Math.abs(ei)
		}
	} else {
		b = fi
		fptr += 1
		if (fptr < nf) {
			fi = -f[fptr]
			fa = Math.abs(fi)
		}
	}
	if ((eptr < ne && ea < fa) || fptr >= nf) {
		a = ei
		eptr += 1
		if (eptr < ne) {
			ei = e[eptr]
			ea = Math.abs(ei)
		}
	} else {
		a = fi
		fptr += 1
		if (fptr < nf) {
			fi = -f[fptr]
			fa = Math.abs(fi)
		}
	}
	let x: number = a + b
	let bv: number = x - a
	let y: number = b - bv
	let q0: number = y
	let q1: number = x
	let _x: number
	let _bv: number
	let _av: number
	let _br: number
	let _ar: number
	while (eptr < ne && fptr < nf) {
		if (ea < fa) {
			a = ei
			eptr += 1
			if (eptr < ne) {
				ei = e[eptr]
				ea = Math.abs(ei)
			}
		} else {
			a = fi
			fptr += 1
			if (fptr < nf) {
				fi = -f[fptr]
				fa = Math.abs(fi)
			}
		}
		b = q0
		x = a + b
		bv = x - a
		y = b - bv
		if (y) {
			g[count++] = y
		}
		_x = q1 + x
		_bv = _x - q1
		_av = _x - _bv
		_br = x - _bv
		_ar = q1 - _av
		q0 = _ar + _br
		q1 = _x
	}
	while (eptr < ne) {
		a = ei
		b = q0
		x = a + b
		bv = x - a
		y = b - bv
		if (y) {
			g[count++] = y
		}
		_x = q1 + x
		_bv = _x - q1
		_av = _x - _bv
		_br = x - _bv
		_ar = q1 - _av
		q0 = _ar + _br
		q1 = _x
		eptr += 1
		if (eptr < ne) {
			ei = e[eptr]
		}
	}
	while (fptr < nf) {
		a = fi
		b = q0
		x = a + b
		bv = x - a
		y = b - bv
		if (y) {
			g[count++] = y
		}
		_x = q1 + x
		_bv = _x - q1
		_av = _x - _bv
		_br = x - _bv
		_ar = q1 - _av
		q0 = _ar + _br
		q1 = _x
		fptr += 1
		if (fptr < nf) {
			fi = -f[fptr]
		}
	}
	if (q0) {
		g[count++] = q0
	}
	if (q1) {
		g[count++] = q1
	}
	if (!count) {
		g[count++] = 0.0
	}
	g.length = count
	return g
}

/**
 * 扩展标量乘法 (Scale Linear Expansion)
 *
 * 计算扩展 e 乘以标量 scale 的精确结果, 返回精确表示 e * scale 的扩展
 *
 * 算法思路:
 *   	- 对扩展的每个分量 e[i], 用 Two-Product 得到精确乘积 [t_lo, t_hi]
 *   	- 用类似 Grow-Expansion 的方式将各乘积分量累加到结果中
 *   	- 利用 Two-Sum 保持中间过程的精确性
 */
function scaleLinearExpansion(e: Array<number>, scale: number): Array<number> {
	const n: number = e.length
	if (n === 1) {
		let ts: Array<number> = Twos.twoProduct(e[0], scale)
		if (ts[0]) {
			return ts
		}
		return [ts[1]]
	}
	const g: Array<number> = new Array(2 * n)
	const q: Array<number> = [0.1, 0.1]
	const t: Array<number> = [0.1, 0.1]
	let count: number = 0
	/**
	 * 第一个分量的乘积
	 */
	Twos.twoProduct(e[0], scale, q)
	if (q[0]) {
		g[count++] = q[0]
	}
	for (let i = 1; i < n; i++) {
		/**
		 * 计算 e[i] * scale 的精确双分量表示
		 */
		Twos.twoProduct(e[i], scale, t)
		/**
		 * 将 q[1] (前一步高位)与 t[0] (当前低位)求和
		 */
		let pq: number = q[1]
		Twos.twoSum(pq, t[0], q)
		if (q[0]) {
			g[count++] = q[0]
		}
		/**
		 * 将 t[1] (当前高位)与 q[1] 精确相加
		 **/
		let a: number = t[1]
		let b: number = q[1]
		let x: number = a + b
		let bv: number = x - a
		let y: number = b - bv
		q[1] = x
		if (y) {
			g[count++] = y
		}
	}
	if (q[1]) {
		g[count++] = q[1]
	}
	if (count === 0) {
		g[count++] = 0.0
	}
	g.length = count
	return g
}

/**
 * 三点方向精确计算 (Exact Orientation 2D)
 * 		输入:
 * 			m0: 第一个点 [x, y]
 * 			m1: 第二个点 [x, y]
 * 			m2: 第三个点 [x, y]
 * 		返回:
 * 			行列式的精确值
 *
 * 当浮点快速路径无法确定方向时调用此函数
 *
 * 使用扩展精度算术精确计算行列式:
 *       	det = 	| m0[0] - m2[0]   m0[1] - m2[1] |
 * 					| m1[0] - m2[0]   m1[1] - m2[1] |
 * 		展开为:
 * 			det = (m1[0] - m2[0]) * (m0[1] - m2[1]) - (m1[1] - m2[1]) * (m0[0] - m2[0])
 * 		等价表达:
 * 			det = [m1[1] * m2[0] - m2[1] * m1[0] + m0[1] * m1[0] - m1[1] * m0[0]] - [m0[1] * m2[0] - m2[1] * m0[0]]
 * 		即
 * 			det = p - n
 * 			其中:
 *   			p = m1[1] * m2[0] - m2[1] * m1[0] + m0[1] * m1[0] - m1[1] * m0[0]
 *   			n = m0[1] * m2[0] - m2[1] * m0[0]
 */
function orientation3Exact(m0: Array<number>, m1: Array<number>, m2: Array<number>): number {
	const p: Array<number> = linearExpansionSum(linearExpansionSum(Twos.twoProduct(m1[1], m2[0]), Twos.twoProduct(-m2[1], m1[0])), linearExpansionSum(Twos.twoProduct(m0[1], m1[0]), Twos.twoProduct(-m1[1], m0[0])))
	const n: Array<number> = linearExpansionSum(Twos.twoProduct(m0[1], m2[0]), Twos.twoProduct(-m2[1], m0[0]))
	const d: Array<number> = robustSubtract(p, n)
	/**
	 * 扩展的最后一个分量是最高有效位, 代表结果的符号
	 */
	return d[d.length - 1]
}

/**
 * 四点方向精确计算 (Exact Orientation 3D)
 * 		输入:
 * 			m0: 第一个点 [x, y, z]
 * 			m1: 第二个点 [x, y, z]
 * 			m2: 第三个点 [x, y, z]
 * 			m3: 第四个点 [x, y, z]
 * 		返回:
 * 			行列式的精确值
 *
 * 判断三维空间中第四个点相对于前三个点构成的平面的方向
 *
 * 计算 4 x 4 行列式(齐次坐标形式), 等价于:
 *       		| m0[0] - m3[0]  m0[1] - m3[1]  m0[2] - m3[2] |
 * 		det = 	| m1[0] - m3[0]  m1[1] - m3[1]  m1[2] - m3[2] |
 *       		| m2[0] - m3[0]  m2[1] - m3[1]  m2[2] - m3[2] |
 * 		使用拉普拉斯展开(按第三列的余子式展开), 通过精确扩展运算计算
 */
function orientation4Exact(m0: Array<number>, m1: Array<number>, m2: Array<number>, m3: Array<number>): number {
	const p: Array<number> = linearExpansionSum(
		linearExpansionSum(
			/**
			 * m1[2] * det2(m2, m3)  其中 det2 是 m2,m3 在 xy 平面的 2x2 行列式
			 */
			scaleLinearExpansion(linearExpansionSum(Twos.twoProduct(m2[1], m3[0]), Twos.twoProduct(-m3[1], m2[0])), m1[2]),
			linearExpansionSum(
				/**
				 * -m2[2] * det2(m1, m3)
				 */
				scaleLinearExpansion(linearExpansionSum(Twos.twoProduct(m1[1], m3[0]), Twos.twoProduct(-m3[1], m1[0])), -m2[2]),
				/**
				 * m3[2] * det2(m1, m2)
				 */
				scaleLinearExpansion(linearExpansionSum(Twos.twoProduct(m1[1], m2[0]), Twos.twoProduct(-m2[1], m1[0])), m3[2])
			)
		),
		linearExpansionSum(
			/**
			 * m0[2] * det2(m1, m3)
			 */
			scaleLinearExpansion(linearExpansionSum(Twos.twoProduct(m1[1], m3[0]), Twos.twoProduct(-m3[1], m1[0])), m0[2]),
			linearExpansionSum(
				/**
				 * -m1[2] * det2(m0, m3)
				 */
				scaleLinearExpansion(linearExpansionSum(Twos.twoProduct(m0[1], m3[0]), Twos.twoProduct(-m3[1], m0[0])), -m1[2]),
				/**
				 * m3[2] * det2(m0, m1)
				 */
				scaleLinearExpansion(linearExpansionSum(Twos.twoProduct(m0[1], m1[0]), Twos.twoProduct(-m1[1], m0[0])), m3[2])
			)
		)
	)
	const n: Array<number> = linearExpansionSum(
		linearExpansionSum(
			/**
			 * m0[2] * det2(m2, m3)
			 */
			scaleLinearExpansion(linearExpansionSum(Twos.twoProduct(m2[1], m3[0]), Twos.twoProduct(-m3[1], m2[0])), m0[2]),
			linearExpansionSum(
				/**
				 * -m2[2] * det2(m0, m3)
				 */
				scaleLinearExpansion(linearExpansionSum(Twos.twoProduct(m0[1], m3[0]), Twos.twoProduct(-m3[1], m0[0])), -m2[2]),
				/**
				 * m3[2] * det2(m0, m2)
				 */
				scaleLinearExpansion(linearExpansionSum(Twos.twoProduct(m0[1], m2[0]), Twos.twoProduct(-m2[1], m0[0])), m3[2])
			)
		),
		linearExpansionSum(
			/**
			 * m0[2] * det2(m1, m2)
			 */
			scaleLinearExpansion(linearExpansionSum(Twos.twoProduct(m1[1], m2[0]), Twos.twoProduct(-m2[1], m1[0])), m0[2]),
			linearExpansionSum(
				/**
				 * -m1[2] * det2(m0, m2)
				 */
				scaleLinearExpansion(linearExpansionSum(Twos.twoProduct(m0[1], m2[0]), Twos.twoProduct(-m2[1], m0[0])), -m1[2]),
				/**
				 * m2[2] * det2(m0, m1)
				 */
				scaleLinearExpansion(linearExpansionSum(Twos.twoProduct(m0[1], m1[0]), Twos.twoProduct(-m1[1], m0[0])), m2[2])
			)
		)
	)
	const d: Array<number> = robustSubtract(p, n)
	return d[d.length - 1]
}

/**
 * 方向判定主函数 (Orientation Predicate)
 * 判断点集的绕转方向 (2D) 或相对平面的位置 (3D)
 */
export function orient(...args: Array<Array<number>>): number {
	switch (args.length) {
		case 0:
		case 1: {
			return 0
		}
		case 2: {
			return 0
		}
		case 3: {
			/**
			 * 2D 方向判定:
			 * 		计算由三点 a, b, c 构成的有符号面积(行列式(行顺序)):
			 * 						| b[0] - c[0]  b[1] - c[1] |
			 * 				det = 	| a[0] - c[0]  a[1] - c[1] |
			 * 			即
			 * 				det = (b[0] - c[0]) * (a[1] - c[1]) - (b[1] - c[1]) * (a[0] - c[0])
			 * 		返回值含义:
			 * 			- 负值: 点 a, b, c 按逆时针方向排列(左转)
			 * 			- 正值: 点 a, b, c 按顺时针方向排列(右转)
			 * 			- 零: 三点共线
			 *
			 * 算法实现:
			 * 		- 快速路径: 用普通浮点运算计算行列式
			 * 		- 误差过滤: 计算误差界 tol = ERRBOUND3 * s
			 * 			- 若 |det| >= tol, 浮点结果可信, 直接返回
			 * 			- 若 |det| < tol, 结果可能被舍入误差翻转, 调用精确版本
			 * 		- 精确路径: 使用扩展精度算术计算精确行列式
			 **/
			const a: Array<number> = args[0]
			const b: Array<number> = args[1]
			const c: Array<number> = args[2]
			/**
			 * 快速浮点计算行列式的两个乘积项:
			 * 		l = (b[0] - c[0]) * (a[1] - c[1]), 即行列式的"左"项
			 * 		r = (b[1] - c[1]) * (a[0] - c[0]), 即行列式的"右"项
			 */
			const l: number = (b[0] - c[0]) * (a[1] - c[1])
			const r: number = (b[1] - c[1]) * (a[0] - c[0])
			const det: number = l - r
			/**
			 * 误差过滤(Error Filter):
			 * 		s 是行列式各项绝对值之和, 用于衡量计算规模
			 * 		只有当 |det| 相对于 s 足够大时, 浮点结果才可信
			 */
			let s: number
			if (l > 0) {
				if (r <= 0) {
					/**
					 * l > 0 且 r <= 0 → det = l - r > 0, 符号确定, 无需精确计算
					 */
					return det
				} else {
					/**
					 * l > 0 且 r > 0 → 两项同号, 可能抵消, 计算规模上界
					 */
					s = l + r
				}
			} else if (l < 0) {
				if (r >= 0) {
					/**
					 * l < 0 且 r >= 0 → det = l - r < 0, 符号确定
					 */
					return det
				} else {
					/**
					 * l < 0 且 r < 0 → 两项同号(负), 取绝对值作为规模
					 */
					s = -(l + r)
				}
			} else {
				/**
				 * l === 0 → det = -r, 符号由 r 决定, 无抵消风险
				 */
				return det
			}
			/**
			 * 误差容限判断:
			 * 		若 |det| 超过误差界, 浮点结果可信
			 */
			const tol: number = ERRBOUND3 * s
			if (det >= tol || det <= -tol) {
				return det
			}
			/**
			 * 浮点结果不可信, 回退到精确计算
			 */
			return orientation3Exact(a, b, c)
		}
		case 4: {
			/**
			 * 3D 方向判定
			 **/
			const a: Array<number> = args[0]
			const b: Array<number> = args[1]
			const c: Array<number> = args[2]
			const d: Array<number> = args[3]
			/**
			 * TODO: 可添加浮点快速路径 + ERRBOUND4 过滤(类似3D情况)
			 * 当前直接使用精确计算
			 */
			return orientation4Exact(a, b, c, d)
		}
	}
	return 0
}
