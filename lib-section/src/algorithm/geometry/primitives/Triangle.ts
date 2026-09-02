import { Matrix3 } from '../../../engine/algorithm/geometry/matrix/Matrix3'
import { Vector2 } from '../../../engine/algorithm/geometry/vector/Vector2'

/**
 * 三角形
 *
 * 约定(全局记号):
 * 		- 顶点: A = p1, B = p2, C = p3
 * 		- 边长(对边命名法, 边名与其所对顶点同名):
 * 			a = |BC| = |p2 - p3|  // 顶点 A 的对边
 * 			b = |CA| = |p3 - p1|  // 顶点 B 的对边
 * 			c = |AB| = |p1 - p2|  // 顶点 C 的对边
 * 		- 面积: S
 *
 * "五心"概述:
 * 		- 重心 (Centroid / Barycentre): 三条中线的交点
 * 		- 外心 (Circumcentre): 三条边垂直平分线的交点, 也是外接圆圆心
 * 		- 内心 (Incentre): 三条内角平分线的交点, 也是内切圆圆心
 * 		- 垂心 (Orthocentre): 三条高线的交点
 * 		- 旁心 (Excentre): 一条内角平分线与另两个外角平分线的交点, 每个三角形有三个旁心
 */
export class Triangle {
	/**
	 * 重心 (Centroid / Barycentre) - 静态方法
	 *
	 * 三条中线(顶点到对边中点的连线)的交点
	 * 重心把每条中线按 2 : 1 的比例分割(靠近顶点的一段较长)
	 *
	 * 数学原理:
	 * 		重心坐标就是三个顶点坐标的算术平均值:
	 * 			G = (A + B + C) / 3
	 * 		即:
	 * 			G.x = (x₁ + x₂ + x₃) / 3
	 * 			G.y = (y₁ + y₂ + y₃) / 3
	 *
	 * 用重心坐标 (barycentric) 表示: 权重为 (1 : 1 : 1)
	 */
	public static getBaryCentre(p1: Vector2, p2: Vector2, p3: Vector2): Vector2 {
		const [x, y]: [number, number] = [p1.x + p2.x + p3.x, p1.y + p2.y + p3.y]
		return new Vector2(x / 3, y / 3)
	}

	/**
	 * 内心 (Incentre) - 静态方法
	 *
	 * 三条内角平分线的交点, 到三条边的距离相等, 该距离即为内切圆半径 r
	 *
	 * 数学原理:
	 * 		内心的重心坐标 (barycentric) 权重为三边边长 (a : b : c):
	 * 			I = (a · A + b · B + c · C) / (a + b + c)
	 * 		其中:
	 * 			a = |BC| (顶点 A 的对边), b = |CA| (顶点 B 的对边), c = |AB| (顶点 C 的对边)
	 *
	 * 本实现中变量对应:
	 * 			l1 = |p2 - p3| = a
	 * 			l2 = |p1 - p3| = b
	 * 			l3 = |p1 - p2| = c
	 * 			d  = a + b + c (周长)
	 * 			I.x = (a · x₁ + b · x₂ + c · x₃) / d
	 * 			I.y = (a · y₁ + b · y₂ + c · y₃) / d
	 */
	public static getInCentre(p1: Vector2, p2: Vector2, p3: Vector2): Vector2 {
		const [l1, l2, l3]: [number, number, number] = [p2.sub(p3).length, p1.sub(p3).length, p1.sub(p2).length]
		const [d, x, y]: [number, number, number] = [l1 + l2 + l3, l1 * p1.x + l2 * p2.x + l3 * p3.x, l1 * p1.y + l2 * p2.y + l3 * p3.y]
		return new Vector2(x / d, y / d)
	}

	/**
	 * 外心 (Circumcentre) - 静态方法
	 *
	 * 三条边垂直平分线的交点, 到三个顶点的距离相等, 该距离即为外接圆半径 R
	 * 锐角三角形外心在内部, 直角三角形外心在斜边中点, 钝角三角形外心在外部
	 *
	 * 数学原理(垂直平分线联立求解):
	 * 		外心 O 满足 |O - A|² = |O - B|² = |O - C|²
	 * 		将 |O - A|² = |O - B|² 与 |O - A|² = |O - C|² 展开, 二次项 (Ox² + Oy²) 相消, 得到关于 (Ox, Oy) 的线性方程组, 解得(以 A、B、C 表示):
	 * 			d = 2 · [Ax · (By - Cy) + Bx · (Cy - Ay) + Cx · (Ay - By)]
	 * 				Ox = {(Ax² + Ay²) · (By - Cy) + (Bx² + By²) · (Cy - Ay) + (Cx² + Cy²)·(Ay - By)} / d
	 * 				Oy = {(Ax² + Ay²) · (Cx - Bx) + (Bx² + By²) · (Ax - Cx) + (Cx² + Cy²)·(Bx - Ax)} / d
	 * 		其中 d 与三角形有向面积成正比 (d = 4S 的符号形式)
	 * 		当三点共线时 d = 0, 外心不存在
	 */
	public static getCircumCentre(p1: Vector2, p2: Vector2, p3: Vector2): Vector2 {
		const { x: ax, y: ay } = p1
		const { x: bx, y: by } = p2
		const { x: cx, y: cy } = p3
		/**
		 * d = 2 · (三点构成的有向面积的两倍), 三点共线时为 0
		 */
		const d: number = 2 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by))
		if (d === 0) {
			throw new Error('Triangle.getCircumCentre: the circumcenter of a triangle does not exist.')
		}
		const a2: number = ax * ax + ay * ay
		const b2: number = bx * bx + by * by
		const c2: number = cx * cx + cy * cy
		const x: number = (a2 * (by - cy) + b2 * (cy - ay) + c2 * (ay - by)) / d
		const y: number = (a2 * (cx - bx) + b2 * (ax - cx) + c2 * (bx - ax)) / d
		return new Vector2(x, y)
	}

	/**
	 * 垂心 (Orthocentre) - 静态方法
	 *
	 * 三条高线(过顶点且垂直于对边的直线)的交点
	 *
	 * 数学原理(欧拉线关系, 最简洁的求法):
	 * 		重心 G、外心 O、垂心 H 三点共线(欧拉线), 且满足向量关系:
	 * 			H = A + B + C - 2·O
	 * 		等价地:
	 * 			OH = 3·OG
	 *		即 H = O + 3·(G - O)
	 *
	 * 推导:
	 * 		已知
	 * 			G = (A + B + C) / 3, 故 A + B + C = 3G
	 * 		由欧拉线
	 * 			H = O + 3(G - O) = 3G - 2O = (A + B + C) - 2O
	 * 		本实现直接用 H = (A + B + C) - 2·O 计算, 需要先求外心 O, 当三点共线时外心不存在, 垂心也将不存在
	 */
	public static getOrthoCentre(p1: Vector2, p2: Vector2, p3: Vector2): Vector2 {
		const o: Vector2 = Triangle.getCircumCentre(p1, p2, p3)
		/**
		 * H = (A + B + C) - 2·O
		 */
		const x: number = p1.x + p2.x + p3.x - 2 * o.x
		const y: number = p1.y + p2.y + p3.y - 2 * o.y
		return new Vector2(x, y)
	}

	/**
	 * 旁心 (Excentres) - 静态方法
	 *
	 * 		输出:
	 * 			三个旁心 [I_A, I_B, I_C] 的数组, 顺序对应顶点 [p1, p2, p3]
	 *
	 * 旁切圆的圆心。旁切圆与三角形的某一条边相切, 并与另两条边的延长线相切
	 * 每个三角形有三个旁心, 分别记为 I_A、I_B、I_C, 各自与顶点 A、B、C 的对边相切
	 *
	 * 数学原理(旁心的重心坐标):
	 * 		以边长 a = |BC|, b = |CA|, c = |AB| 表示:
	 * 			I_A 权重为 (-a : b : c)  // 与顶点 A 的对边 BC 相切的旁切圆圆心
	 * 			I_B 权重为 (a : -b : c)  // 与顶点 B 的对边 CA 相切的旁切圆圆心
	 * 			I_C 权重为 (a : b : -c)  // 与顶点 C 的对边 AB 相切的旁切圆圆心
	 * 		归一化公式(以 I_A 为例):
	 * 			I_A = (-a · A + b · B + c · C) / (-a + b + c)
	 */
	public static getExCentres(p1: Vector2, p2: Vector2, p3: Vector2): [Vector2, Vector2, Vector2] {
		/**
		 * 顶点 A(p1) 的对边 BC
		 */
		const a: number = p2.sub(p3).length
		/**
		 * 顶点 B(p2) 的对边 CA
		 */
		const b: number = p3.sub(p1).length
		/**
		 * 顶点 C(p3) 的对边 AB
		 */
		const c: number = p1.sub(p2).length
		/**
		 * 以三个带符号权重加权求旁心
		 */
		const combine = (wa: number, wb: number, wc: number): Vector2 => {
			const d: number = wa + wb + wc
			if (d === 0) {
				throw new Error('Triangle.getExCentres: the sum of weights is 0, and the side center does not exist (possibly three points are collinear).')
			}
			const x: number = (wa * p1.x + wb * p2.x + wc * p3.x) / d
			const y: number = (wa * p1.y + wb * p2.y + wc * p3.y) / d
			return new Vector2(x, y)
		}

		const excentreA: Vector2 = combine(-a, b, c)
		const excentreB: Vector2 = combine(a, -b, c)
		const excentreC: Vector2 = combine(a, b, -c)
		return [excentreA, excentreB, excentreC]
	}

	/**
	 * 三角形面积 - 静态方法
	 *
	 * 数学原理(叉积法 / 鞋带公式):
	 * 		两条边向量的叉积模长的一半即为面积:
	 * 			S = |(B - A) × (C - B)| / 2
	 * 		二维叉积 u × v = u.x · v.y - u.y · v.x 的绝对值等于以 u、v 为邻边的平行四边形面积, 三角形面积取其一半
	 */
	public static getArea(p1: Vector2, p2: Vector2, p3: Vector2): number {
		return Math.abs(p2.sub(p1).cross(p3.sub(p2))) / 2
	}

	/**
	 * 内切圆半径 r - 静态方法
	 *
	 * 数学原理(面积法):
	 * 		三角形面积 S 可由内切圆半径 r 与半周长 s 表示:
	 * 			S = r · s,   其中 s = (a + b + c) / 2
	 * 		故:
	 * 			r = S / s = 2S / (a + b + c)
	 * 直观理解:
	 * 		将三角形按内心分割成三个以三边为底、以 r 为高的小三角形, 面积之和 = (a · r + b · r + c · r) / 2 = r · s
	 */
	public static getInRadius(p1: Vector2, p2: Vector2, p3: Vector2): number {
		const a: number = p2.sub(p3).length
		const b: number = p3.sub(p1).length
		const c: number = p1.sub(p2).length
		const s: number = (a + b + c) / 2
		if (s === 0) {
			return 0
		}
		return Triangle.getArea(p1, p2, p3) / s
	}

	/**
	 * 外接圆半径 R - 静态方法
	 *
	 * 数学原理(正弦定理的等价形式):
	 * 		由正弦定理 a / sin A = 2R, 结合面积公式 S = (a · b · c) / (4R) 可得:
	 * 			R = (a · b · c) / (4S)
	 * 		当三点共线时 S = 0, 外接圆不存在(半径为无穷大), 此处返回 Infinity
	 */
	public static getCircumRadius(p1: Vector2, p2: Vector2, p3: Vector2): number {
		const a: number = p2.sub(p3).length
		const b: number = p3.sub(p1).length
		const c: number = p1.sub(p2).length
		const area: number = Triangle.getArea(p1, p2, p3)
		if (area === 0) {
			return Infinity
		}
		return (a * b * c) / (4 * area)
	}

	private readonly _p1: Vector2
	private readonly _p2: Vector2
	private readonly _p3: Vector2
	constructor(p1: Vector2, p2: Vector2, p3: Vector2) {
		this._p1 = p1
		this._p2 = p2
		this._p3 = p3
	}

	public get p1(): Vector2 {
		return this._p1
	}

	public get p2(): Vector2 {
		return this._p2
	}

	public get p3(): Vector2 {
		return this._p3
	}

	/**
	 * 重心 (Centroid / Barycentre)
	 */
	public getBaryCentre(): Vector2 {
		return Triangle.getBaryCentre(this.p1, this.p2, this.p3)
	}

	/**
	 * 内心 (Incentre)
	 */
	public getInCentre(): Vector2 {
		return Triangle.getInCentre(this.p1, this.p2, this.p3)
	}

	/**
	 * 外心 (Circumcentre)
	 */
	public getCircumCentre(): Vector2 {
		return Triangle.getCircumCentre(this.p1, this.p2, this.p3)
	}

	/**
	 * 垂心 (Orthocentre)
	 */
	public getOrthoCentre(): Vector2 {
		return Triangle.getOrthoCentre(this.p1, this.p2, this.p3)
	}

	/**
	 * 旁心 (Excentres), 返回 [I_A, I_B, I_C]
	 */
	public getExCentres(): [Vector2, Vector2, Vector2] {
		return Triangle.getExCentres(this.p1, this.p2, this.p3)
	}

	/**
	 * 内切圆半径 r
	 */
	public getInRadius(): number {
		return Triangle.getInRadius(this.p1, this.p2, this.p3)
	}

	/**
	 * 外接圆半径 R
	 */
	public getCircumRadius(): number {
		return Triangle.getCircumRadius(this.p1, this.p2, this.p3)
	}

	/**
	 * 三角形面积 S
	 */
	public getArea(): number {
		return Triangle.getArea(this.p1, this.p2, this.p3)
	}

	/**
	 * 以重心为中心按比例缩放三角形
	 */
	public scaleOnBarycentre(ratio: number): Triangle {
		return this.sacle(this.getBaryCentre(), ratio)
	}

	/**
	 * 以内心为中心按比例缩放三角形
	 */
	public scaleOnIncentre(ratio: number): Triangle {
		return this.sacle(this.getInCentre(), ratio)
	}

	/**
	 * 沿内心方向外扩(或内缩) ext 个单位
	 */
	public extend(ext: number): Triangle {
		const incentre: Vector2 = this.getInCentre()
		const cpp: Vector2 = this.p1
			.add(this.p2)
			.sub(incentre)
			.scale(1 / 2)
		const len: number = cpp.length
		const ncpp: Vector2 = Vector2.ORIGIN.getPointOnRays(cpp, len + ext)
		return this.scaleOnIncentre(ncpp.length / len)
	}

	/**
	 * 以 center 为不动点, 按 ratio 缩放三角形
	 * 		变换顺序: 平移到原点 -> 缩放 -> 平移回原位置
	 */
	private sacle(center: Vector2, ratio: number): Triangle {
		const mat: Matrix3 = Matrix3.translate(-center.x, -center.y).scale(ratio, ratio).translate(center.x, center.y)
		return new Triangle(this.p1.multiplyMatrix3(mat), this.p2.multiplyMatrix3(mat), this.p3.multiplyMatrix3(mat))
	}
}
