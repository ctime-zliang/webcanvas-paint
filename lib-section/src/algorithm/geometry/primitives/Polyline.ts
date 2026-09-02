import { Primitive } from './Primitive'
import { BBox2 } from '../../../engine/algorithm/geometry/bbox/BBox2'
import { Vector2 } from '../../../engine/algorithm/geometry/vector/Vector2'
import { Line } from './Line'
import { Matrix3 } from '../../../engine/algorithm/geometry/matrix/Matrix3'
import { StructPrimitive } from './StructPrimitive'
import { Arc } from './Arc'
import { DoubleKit } from '../../../Main'

/**
 * Polyline (折线/复合曲线)
 *
 * 连续性约定:
 *   	理想情况下前一段的终点应与后一段的起点重合(C0 连续)
 *   	当相邻基元之间存在缝隙时, build1 会自动插入直线段进行"缝合", 从而保证折线的连通性
 */
export class Polyline extends StructPrimitive<Polyline> {
	/**
	 * 从一组基元构造闭合连续的折线
	 *
	 * 目的:
	 *   	原始基元数组可能存在"断点", 即前一段的终点与后一段的起点不重合
	 *   	当前方法会遍历基元, 在检测到断点时插入一条连接直线, 使整条折线在几何上连续
	 *
	 * 算法步骤:
	 *   	- 维护游标 prev, 记录"上一段的实际终点"
	 *   	- 对每个基元 p:
	 *   		- 若 p 是整圆 (Arc.isCicle), 整圆自成闭环, 无需缝合, 直接加入
	 *   		- 否则取 p 的起点 start, 若 prev 存在且 start ≠ prev, 说明存在缝隙, 插入连接线 Line(prev, start) 补齐
	 *   		- 加入 p 本身
	 *   		- 更新 prev: 圆弧使用 svgEnd (可渲染的有效终点), 其他使用 endPoint
	 *   	- 若最终没有任何基元被加入但 prev 存在, 补一个退化线段 Line(prev, prev), 以保留该点信息(避免产生空折线丢失位置)
	 *
	 * 针对圆弧使用 svgEnd 而非 endPoint:
	 *   	整圆或近似整圆的圆弧, 其 startPoint 与 endPoint 坐标几乎重合, 直接用 endPoint 作为连接点可能因浮点误差导致后续缝合逻辑异常
	 *   	svgEnd 是经过回退修正, 与起点保持足够间距的有效终点, 更适合作为连接锚点
	 */
	public static build1(primitives: Array<Primitive>): Polyline {
		const ps: Array<Primitive> = []
		/**
		 * prev: 上一段的实际终点, 初始为 null (尚无前驱段)
		 */
		let prev: Vector2 = null!
		for (let i: number = 0; i < primitives.length; i++) {
			const p: Primitive = primitives[i]
			/**
			 * 整圆自成闭环, 不参与首尾缝合, 直接加入
			 */
			if (p instanceof Arc && p.isCicle) {
				ps.push(p)
				continue
			}
			const start: Vector2 = p.startPoint
			/**
			 * 检测断点: 若存在前驱段且当前段起点与前驱终点不重合, 插入连接线缝合缝隙
			 */
			if (prev !== null && !start.equalsWithVector2(prev)) {
				ps.push(new Line(prev, start))
			}
			ps.push(p)
			/**
			 * 更新游标: 圆弧取 svgEnd (有效可渲染终点), 直线/其他取 endPoint
			 */
			if (p instanceof Arc) {
				prev = p.svgEnd
			} else {
				prev = p.endPoint
			}
		}
		/**
		 * 退化保护: 输入非空但未产生任何段(例如全部被跳过)且已记录到某点, 补一个零长线段以保留该点位置
		 */
		if (ps.length === 0 && prev !== null) {
			ps.push(new Line(prev, prev))
		}
		return new Polyline(ps)
	}

	private _primitives: Array<Primitive>
	private _bbox2: BBox2
	constructor(primitives: Array<Primitive>) {
		super()
		this._bbox2 = null!
		this._primitives = primitives
	}

	public get primitives(): Array<Primitive> {
		return this._primitives
	}

	public get startPoint(): Vector2 {
		const pt: Primitive = this.primitives[0]
		return pt ? pt.startPoint : null!
	}

	public get endPoint(): Vector2 {
		const len: number = this.primitives.length
		const pt: Primitive = len > 0 ? this.primitives[len - 1] : null!
		return pt ? pt.endPoint : null!
	}

	public get bbox2(): BBox2 {
		if (this._bbox2 === null) {
			this._bbox2 = this.buildBBox2()
		}
		return this._bbox2
	}

	/**
	 * 计算折线所围成多边形的有向面积(鞋带公式 / Shoelace Formula)
	 *
	 * 数学原理:
	 *   	对于顶点序列 P0, P1, ..., P(n - 1) 构成的封闭多边形, 其有向面积为
	 *   		A = (1 / 2) * Σ (x_i * y_(i + 1) - x_(i + 1) * y_i)  // 下标模 n 循环
	 *   	本实现使用等价的梯形累加变体:
	 *   		A = (1 / 2) * Σ (x_i + x_(i + 1)) * (y_(i + 1) - y_i)
	 *   	该式将每条边与 x 轴之间的梯形有向面积累加, 数学上与标准鞋带公式恒等(展开后交叉项相互抵消, 结果一致)
	 *
	 * 符号含义(有向面积):
	 *   	- 结果 > 0: 顶点整体呈某一绕向(取决于坐标系, 常见为逆时针)
	 *   	- 结果 < 0: 相反绕向
	 *   	- 取绝对值即得到多边形的实际面积
	 *
	 * 实现说明:
	 *   	- resolution 控制圆弧离散精度: 曲线段先被采样为折线点再参与累加
	 *   	- 遍历中记录首点 startPoint 与前一点 prevPoint
	 *   	- 循环结束后手动补上"末点 -> 首点"这条闭合边, 因此即使折线未显式闭合, 该方法也按"隐式闭合"来计算所围面积
	 */
	public getArea(resolution: number): number {
		resolution = resolution <= 0 ? DoubleKit.eps3 : resolution
		let [startPoint, prevPoint]: [Vector2, Vector2] = [null!, null!]
		let sum: number = 0
		this.points(resolution, (nowPoint: Vector2): void => {
			if (prevPoint) {
				/**
				 * 累加当前边 (prevPoint -> nowPoint) 对应的梯形有向面积项
				 */
				sum += (nowPoint.x + prevPoint.x) * (nowPoint.y - prevPoint.y)
			} else {
				/**
				 * 记录首点, 用于最后闭合多边形
				 */
				startPoint = nowPoint
			}
			prevPoint = nowPoint
		})
		/**
		 * 补上闭合边 (末点 prevPoint -> 首点 startPoint)
		 */
		sum += (startPoint.x + prevPoint.x) * (startPoint.y - prevPoint.y)
		return sum / 2
	}

	/**
	 * 判断折线是否闭合(首端点与末端点在给定精度下重合)
	 *
	 * 		输入:
	 * 			place: 小数比较精度位数
	 *
	 * 判定逻辑:
	 *   	- 空折线: 无法构成闭环, 返回 false
	 *   	- 单段整圆: 圆弧自身即封闭, 直接返回 true
	 *   	- 其余情形: 比较整体首端点 start.startPoint 与整体末端点 end.endPoint 是否重合; 单段非整圆时 start === end, 即比较该段自身的起止点
	 */
	public isClosed(place: number = 0): boolean {
		const len: number = this.primitives.length
		if (len === 0) {
			return false
		}
		const start: Primitive = this.primitives[0]
		const end: Primitive = this.primitives[len - 1]
		/**
		 * 单段整圆: 自身即封闭, 直接判定闭合
		 *   	其余单段情形自然落入下方首末点比较 (start === end, 即比较该段自身起止点)
		 */
		if (len === 1 && start instanceof Arc && start.isCicle) {
			return true
		}
		/**
		 * 通用判定: 整体首端点与整体末端点在给定精度下是否重合
		 */
		return start.startPoint.equalsWithVector2(end.endPoint, place)
	}

	/**
	 * 将折线强制闭合 (就地修改当前实例并返回)
	 *
	 * 几何原理:
	 *   	一条折线闭合的充要条件是其整体首端点与整体末端点重合: startPoint == endPoint
	 *   	若两端点不重合, 则在末端追加一条从"末端点"指向"首端点"的直线段 Line(endPoint, startPoint), 即可在几何上补齐缺口, 使遍历轨迹形成闭环 (C0 连续的封闭多边形)
	 */
	public asClose(): Polyline {
		if (this.isClosed()) {
			return this
		}
		this._primitives.push(new Line(this.endPoint, this.startPoint))
		this._bbox2 = null!
		return this
	}

	public reverse(): Polyline {
		const pts: Array<Primitive> = new Array(this.primitives.length)
		for (let i: number = 0, j = this.primitives.length - 1; j >= 0; i++, j--) {
			const pt: Primitive = this.primitives[j]
			let nPt: Primitive = null!
			if (pt instanceof Line) {
				/**
				 * 直线反向: 交换起止点
				 */
				nPt = new Line(pt.endPoint, pt.startPoint)
			} else if (pt instanceof Arc) {
				/**
				 * 圆弧反向: 交换起止弧度并翻转扫掠方向
				 */
				nPt = pt.exchangeSweep()
			}
			if (nPt) {
				pts[i] = nPt
			}
		}
		return new Polyline(pts)
	}

	/**
	 * 折线关于水平线 y = yValue 的镜像
	 *
	 * 数学原理:
	 *   	点变换: P(x, y) -> P'(x, 2 * yValue - y), 即 y 坐标关于 y = yValue 对称
	 *   	这是一个反向等距变换 (行列式为 -1), 会翻转图形的手性
	 *
	 * 实现方式:
	 *   	对每个子基元 (Line / Arc) 分别调用其 mirrorX, 组合成映射后的基元数组
	 *   	最后用 build1 重建折线 (自动缝合可能因方向翻转而产生的连接关系)
	 *   	注意: 圆弧镜像后扫掠方向会翻转 (CCW <-> CW), 详见 Arc.mirrorX
	 */
	public mirrorX(yValue: number = 0): Polyline {
		const pts: Array<Primitive> = new Array(this.primitives.length)
		for (let i: number = 0; i < this.primitives.length; i++) {
			const p: Primitive = this.primitives[i]
			if (p instanceof Line) {
				pts[i] = p.mirrorX(yValue)
			} else if (p instanceof Arc) {
				pts[i] = p.mirrorX(yValue)
			}
		}
		return Polyline.build1(pts)
	}

	/**
	 * 折线关于垂直线 x = xValue 的镜像
	 *
	 * 数学原理:
	 *   	点变换: P(x, y) -> P'(2 * xValue - x, y), 即 x 坐标关于 x = xValue 对称
	 *   	同样是反向等距变换 (行列式为 -1), 翻转手性
	 *
	 * 实现方式:
	 *   	对每个子基元分别调用其 mirrorY, 再用 build1 重建折线
	 *   	圆弧镜像后扫掠方向翻转 (CCW <-> CW), 详见 Arc.mirrorY
	 */
	public mirrorY(xValue: number = 0): Polyline {
		const pts: Array<Primitive> = new Array(this.primitives.length)
		for (let i: number = 0; i < this.primitives.length; i++) {
			const p: Primitive = this.primitives[i]
			if (p instanceof Line) {
				pts[i] = p.mirrorY(xValue)
			} else if (p instanceof Arc) {
				pts[i] = p.mirrorY(xValue)
			}
		}
		return Polyline.build1(pts)
	}

	/**
	 * 折线关于点 origin 的中心对称 (点镜像)
	 *
	 * 数学原理:
	 *   	点变换: P(x, y) -> P'(2 * ox - x, 2 * oy - y), 等价于将 P 绕 origin 旋转 180°
	 *   	中心对称是保向等距变换 (行列式为 +1), 不翻转手性
	 *   	因此圆弧的扫掠方向保持不变 (与 mirrorX / mirrorY 相反), 详见 Arc.mirrorO
	 *
	 * 实现方式:
	 *   	对每个子基元分别调用其 mirrorO, 再用 build1 重建折线
	 */
	public mirrorO(origin: Vector2 = Vector2.ORIGIN): Polyline {
		const pts: Array<Primitive> = new Array(this.primitives.length)
		for (let i: number = 0; i < this.primitives.length; i++) {
			const p: Primitive = this.primitives[i]
			if (p instanceof Line) {
				pts[i] = p.mirrorO(origin)
			} else if (p instanceof Arc) {
				pts[i] = p.mirrorO(origin)
			}
		}
		return Polyline.build1(pts)
	}

	/**
	 * 将整条折线离散采样为一串顶点, 逐点回调
	 *
	 * @param resolution 采样精度: 传递给各基元的 toPoints, 控制圆弧离散的弦高误差上限
	 * @param calback    每采样到一个点就调用一次 (point, index)
	 *
	 * 去重原理 (关键点):
	 *   	相邻两段基元在连接处共享同一个点 (前段终点 == 后段起点)
	 *   	若直接拼接每段的采样点, 该连接点会被重复输出
	 *   	因此对"非最后一段"调用 points.pop() 丢弃其最后一个点,
	 *   	把连接点的输出权交给下一段的起点, 从而保证整条折线上的点序列不重复
	 *   	最后一段则完整保留 (它没有后继段, 其终点是折线的真正终点)
	 *
	 * 索引 idx 在所有段之间连续递增, 表示该点在整条折线中的全局序号
	 */
	public points(resolution: number, calback: (point: Vector2, index: number) => void): void {
		if (this.primitives.length <= 0) {
			return
		}
		let idx: number = 0
		/**
		 * 处理除最后一段外的所有段: 采样后丢弃末点以避免连接处重复
		 */
		for (let i: number = 0; i < this.primitives.length - 1; i++) {
			const points: Array<Vector2> = this.primitives[i].toPoints(resolution)
			points.pop()
			for (let j: number = 0; j < points.length; j++) {
				calback(points[j], idx++)
			}
		}
		/**
		 * 处理最后一段: 完整保留所有点 (含终点)
		 */
		const points: Array<Vector2> = this.primitives[this.primitives.length - 1].toPoints(resolution)
		for (let j: number = 0; j < points.length; j++) {
			calback(points[j], idx++)
		}
	}

	public multiplyMatrix3(matrix3: Matrix3): Polyline {
		const pts: Array<Primitive> = new Array(this.primitives.length)
		for (let i: number = 0; i < this.primitives.length; i++) {
			pts[i] = this.primitives[i].multiplyMatrix3(matrix3)
		}
		return Polyline.build1(pts)
	}

	public clone(): Polyline {
		return Polyline.build1(this.primitives)
	}

	public buildBBox2(): BBox2 {
		if (this._primitives.length === 0) {
			return new BBox2(0, 0, 0, 0)
		}
		let result: BBox2 = this._primitives[0].bbox2
		for (let i: number = 1; i < this._primitives.length; i++) {
			result = BBox2.extend2(result, this._primitives[i].bbox2)
		}
		return result
	}
}
