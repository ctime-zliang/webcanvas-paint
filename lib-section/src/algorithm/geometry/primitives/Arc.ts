import { Vector2 } from '../../../engine/algorithm/geometry/vector/Vector2'
import { ESweep } from '../../../engine/config/CommonProfile'
import { Matrix3 } from '../../../engine/algorithm/geometry/matrix/Matrix3'
import { Angles } from '../../../engine/math/Angles'
import { BBox2 } from '../../../engine/algorithm/geometry/bbox/BBox2'
import { Polyline } from './Polyline'
import { ECanvasD2LineCap } from '../../../engine/config/PrimitiveProfile'
import { Primitive } from './Primitive'
import { DoubleKit } from '../../../engine/math/Doublekit'

export class Arc extends Primitive {
	/**
	 * 根据 SVG 圆弧端点参数化表示 (Endpoint Parameterization) 构建 Arc 实例
	 * 		参考规范:
	 * 			W3C SVG 1.1 — Implementation Notes: Elliptical Arc (F.6)
	 * 			https://www.w3.org/TR/SVG/implnote.html#ArcImplementationNotes
	 *
	 * 算法实现:
	 * 		Step 1: 坐标变换到旋转后的中点坐标系
	 * 			将起点和终点的中点作为新原点, 并应用椭圆旋转角的逆旋转
	 * 			此处圆弧为正圆, 旋转角 φ = 0, 故 cos(φ)=1, sin(φ)=0, 变换退化为恒等变换:
	 * 				x1' =  cos(φ) * (x0 - x)/2 + sin(φ) * (y0 - y)/2
	 * 				y1' = -sin(φ) * (x0 - x)/2 + cos(φ) * (y0 - y)/2
	 * 		Step 2: 计算旋转坐标系下的圆心 (cx', cy')
	 * 			利用起点和终点到圆心等距 (= radius) 的约束, 解方程组:
	 * 				sq = (rx²·ry² - rx²·y1'² - ry²·x1'²) / (rx²·y1'² + ry²·x1'²)
	 * 			其中 rx = ry = radius (正圆), sq 为判别式:
	 * 				若 sq > 0: 两个可能的圆心, 由 (largeArc ⊕ sweep) 的符号选择
	 * 				若 sq = 0: 半圆, 圆心唯一
	 * 				若 sq < 0: 半径不够大, 钳制为 0 (退化处理)
	 * 				cx' = ±√sq · ( ry·y1' / rx)     (此处 rx = ry, 化简为 ±√sq · y1')
	 * 				cy' = ±√sq · (-rx·x1' / ry)     (化简为 ±√sq · (-x1'))
	 * 				符号由 sign = (largeArc === sweep) ? -1 : +1 决定
	 * 		Step 3: 将圆心变换回原始坐标系
	 * 			反向应用 Step 1 的旋转, 再平移回中点:
	 *				cx = cos(φ)·cx' - sin(φ)·cy' + (x0 + x)/2
	 *				cy = sin(φ)·cx' + cos(φ)·cy' + (y0 + y)/2
	 *		Step 4: 计算起始角 θ1 和扫掠角 Δθ
	 * 			起始角 = 向量 (1,0) 与向量 u = ((x1'-cx')/r, (y1'-cy')/r) 的夹角:
	 * 				θ1 = sign(uy) · acos(ux / |u|)
	 * 			扫掠角 = 向量 u 与向量 v = ((-x1'-cx')/r, (-y1'-cy')/r) 的夹角:
	 * 				Δθ = sign(ux·vy - uy·vx) · acos((u·v) / (|u|·|v|))
	 * 			再根据 sweepFlag 修正 Δθ 的范围:
	 * 				- sweepFlag 且 Δθ < 0 → Δθ += 2π
	 * 				- !sweepFlag 且 Δθ > 0 → Δθ -= 2π
	 * 		Step 5: 半径修正
	 * 			若给定半径过小 (不足以连接两端点), 按 SVG 规范等比放大:
	 * 				lambda = (dx²/rx² + dy²/ry²)
	 * 			若 lambda > 1, 则 radius *= √lambda
	 *
	 * 注意: 本实现内部使用 Y 轴向下的屏幕坐标系, 因此在输入输出处对 y 取反
	 */
	public static build1(startPoint: Vector2, endPoint: Vector2, radius: number, isLarge: boolean, sweep: ESweep): Arc {
		radius = Math.abs(radius)
		const isCircle: boolean = startPoint.equalsWithVector2(endPoint)
		if (isCircle) {
			return new Arc(radius, startPoint, 0, isLarge ? Math.PI * 2 : 0)
		}
		/**
		 * Step 1: 坐标变换到旋转后的中点坐标系
		 * 		y 轴取反以从屏幕坐标系转换为数学坐标系
		 */
		const [x0, y0]: [number, number] = [startPoint.x, -startPoint.x]
		const [x, y]: [number, number] = [endPoint.x, -endPoint.y]
		const sweepFlag: boolean = sweep === ESweep.CW
		/**
		 * (x0-x)/2, (y0-y)/2 为起点到终点的半差向量
		 */
		const [dx2, dy2]: [number, number] = [(x0 - x) / 2, (y0 - y) / 2]
		/**
		 * φ = 0 (正圆无旋转), cos(0)=1, sin(0) = 0
		 */
		const [cosV, sinV]: [number, number] = [Math.cos(0), Math.sin(0)]
		/**
		 * 将半差向量旋转 -φ, 得到旋转坐标系下的 (x1', y1')
		 */
		const [x1, y1]: [number, number] = [cosV * dx2 + sinV * dy2, -sinV * dx2 + cosV * dy2]
		/**
		 * Step 2: 求旋转坐标系下的圆心 (cx', cy')	
		 */
		/**
		 * rx² 和 ry² (正圆时 rx = ry = radius)
		 */
		const [Prx, Pry]: [number, number] = [radius * radius, radius * radius]
		/**
		 * x1'² 和 y1'²
		 */
		const [Px1, Py1]: [number, number] = [x1 * x1, y1 * y1]
		/**
		 * 符号选择: largeArc 与 sweep 相同时取负, 不同时取正
		 */
		let sign: number = isLarge === sweepFlag ? -1 : 1
		/**
		 * 判别式: 决定圆心到弦中点的距离
		 */
		let sq: number = (Prx * Pry - Prx * Py1 - Pry * Px1) / (Prx * Py1 + Pry * Px1)
		/**
		 * 半径不足时钳制为 0
		 */
		sq = sq < 0 ? 0 : sq
		/**
		 * 圆心偏移系数
		 */
		const coef: number = (sign = Math.sqrt(sq))
		/**
		 * 旋转坐标系下的圆心坐标
		 */
		const [cx1, cy1]: [number, number] = [coef * ((radius * y1) / radius), coef * -((radius * x1) / radius)]
		/**
		 * Step 3: 将圆心变换回原始坐标系
		 */
		/**
		 * 起点和终点的中点
		 */
		const [sx2, sy2]: [number, number] = [(x0 + x) / 2, (y0 + y) / 2]
		/**
		 * 应用旋转 φ 并平移
		 */
		const [cx, cy]: [number, number] = [sx2 + (cosV * cx1 - sinV * cy1), sy2 + (sinV * cx1 + cosV * cy1)]
		/**
		 * Step 4: 计算起始角 θ1 和扫掠角 Δθ
		 */
		/**
		 * 向量 u = 起点相对圆心的单位方向
		 */
		const [ux, uy]: [number, number] = [(x1 - cx1) / radius, (y1 - cy1) / radius]
		/**
		 * 向量 v = 终点相对圆心的单位方向
		 */
		const [vx, vy]: [number, number] = [(-x1 - cx1) / radius, (-y1 - cy1) / radius]
		/**
		 * θ1 = (1,0) 与 u 的有符号夹角
		 */
		let [p, n]: [number, number] = [ux, Math.sqrt(ux * ux + uy * uy)]
		sign = uy < 0 ? -1.0 : 1.0
		const angleStart: number = Angles.radianToDegree(sign * Math.acos(p / n))
		/**
		 * Δθ = u 与 v 的有符号夹角
		 */
		n = Math.sqrt((ux * ux + uy * uy) * (vx * vx + vy * vy))
		p = ux * vx + uy * vy
		/**
		 * 叉积符号决定旋转方向
		 */
		sign = ux * vy - uy * vx < 0 ? -1.0 : 1.0
		const pn: number = p / n
		/**
		 * 数值安全的 acos (钳制到 [-1, 1])
		 */
		let acos: number = undefined!
		if (pn < -1) {
			acos = Math.cos(-1)
		} else if (pn > 1) {
			acos = Math.acos(1)
		} else {
			acos = Math.acos(pn)
		}
		/**
		 * 带符号的扫掠角
		 */
		let angleExtent: number = Angles.radianToDegree(sign * acos)
		/**
		 * 根据 sweepFlag 修正 Δθ 的范围, 确保方向一致性
		 */
		if (!sweepFlag && angleExtent > 0) {
			angleExtent -= Math.PI * 2
		} else if (sweepFlag && angleExtent < 0) {
			angleExtent += Math.PI * 2
		}
		/**
		 * Step 5: 半径修正
		 */
		/**
		 * lambda > 1 表示半径不足以连接两端点, 需等比放大
		 */
		const lambda: number = (dx2 * dx2) / Prx + (dy2 * dy2) / Pry
		const distance: number = startPoint.distance(endPoint) / 2
		if (radius < distance) {
			radius *= Math.sqrt(lambda)
		}
		/**
		 * 输出: 转换为内部 Arc 表示
		 */
		/**
		 * 对角度取反以从数学坐标系映射回屏幕坐标系
		 */
		const startRadian: number = isCircle ? 0 : Angles.regularDegress(-angleStart)
		const sweepRadian: number = isCircle ? (isLarge ? Math.PI * 2 : 0) : -angleExtent
		return new Arc(radius, new Vector2(cx, -cy), startRadian, startRadian + sweepRadian)
	}

	private readonly _startRadian: number
	private readonly _endRadian: number
	private readonly _sweep: ESweep
	private _startPoint: Vector2
	private _endPoint: Vector2
	private _radius: number
	private _centerPoint: Vector2
	private _bbox2: BBox2
	private _svgEnd: Vector2
	constructor(radius: number, centerPoint: Vector2, startRadian: number, endRadian: number) {
		super()
		this._radius = radius
		this._centerPoint = centerPoint
		this._startRadian = startRadian
		this._endRadian = endRadian
		this._sweep = this._endRadian >= this._startRadian ? ESweep.CCW : ESweep.CW
		this._bbox2 = null!
		this._svgEnd = null!
		this._startPoint = this.pointOn(startRadian)
		this._endPoint = this.pointOn(startRadian + (this._endRadian - this._startRadian))
	}

	public get startPoint(): Vector2 {
		return this._startPoint
	}
	public set startPoint(value: Vector2) {
		this._startPoint = value
	}

	public get endPoint(): Vector2 {
		return this._endPoint
	}
	public set endPoint(value: Vector2) {
		this._endPoint = value
	}

	public get centerPoint(): Vector2 {
		return this._centerPoint
	}

	public get startRadian(): number {
		return this._startRadian
	}

	public get endRadian(): number {
		return this._endRadian
	}

	public get sweepRadian(): number {
		const start = this.startRadian
		const end = this.endRadian
		if (this.sweep === ESweep.CCW) {
			return end >= start ? end - start : end + Math.PI * 2 - start
		}
		return end <= start ? -(start - end) : -(start + Math.PI * 2 - end)
	}

	public get isOverHalfCircle(): boolean {
		return Math.abs(this.sweepRadian) > Math.PI
	}

	public get isCicle(): boolean {
		return DoubleKit.eq(Math.abs(this.sweepRadian), Math.PI * 2) || this.startPoint.equalsWithVector2(this.endPoint)
	}

	public get radius(): number {
		return this._radius
	}

	public get sweep(): ESweep {
		return this._sweep
	}

	public get bbox2(): BBox2 {
		if (this._bbox2 === null) {
			this._bbox2 = this.buildBBox2()
		}
		return this._bbox2
	}

	public get length(): number {
		return Math.abs(this.radius * this.sweepRadian)
	}

	public get svgEnd(): Vector2 {
		if (this._svgEnd === null) {
			this._svgEnd = this.getSvgEnd(this.startRadian, this.sweepRadian, this.startPoint, this.endPoint)
		}
		return this._svgEnd
	}

	public toString(): string {
		return `Arc (${this.centerPoint.x}, ${this.centerPoint.y}, ${this.radius}, ${this.startRadian}, ${this.sweepRadian})`
	}

	/**
	 * 求圆/圆弧上对应弧度的点坐标
	 */
	public pointOn(radian: number): Vector2 {
		radian %= Math.PI * 2
		if (radian < 0) {
			radian += Math.PI * 2
		}
		return this._centerPoint.add(new Vector2(this.radius * Math.cos(radian), this.radius * Math.sin(radian)))
	}

	/**
	 * 将圆弧的旋转方向反向, 并保持其他参数不变, 生成新的圆弧
	 */
	public exchangeSweep(): Arc {
		return new Arc(this.radius, this.centerPoint, this.endRadian, -this.startRadian)
	}

	public mirrorX(yValue: number = 0): Arc {
		throw new Error(`algorithm error.`)
	}

	public mirrorY(xValue: number = 0): Arc {
		throw new Error(`algorithm error.`)
	}

	public mirrorO(origin: Vector2 = Vector2.ORIGIN): Arc {
		throw new Error(`algorithm error.`)
	}

	public multiplyMatrix3(matrix3: Matrix3): Arc {
		throw new Error(`algorithm error.`)
	}

	public stroke(strokeWidth: number, cap: ECanvasD2LineCap, sweep: ESweep): Polyline {
		throw new Error(`algorithm error.`)
	}

	/**
	 * 圆弧离散采样, 限制折线与圆弧之间的最大误差不超过 resolution
	 */
	public toPoints(resolution: number): Array<Vector2> {
		if (this.radius <= resolution) {
			return [this.startPoint, this.getSvgEnd(this.startRadian, this.sweepRadian, this.startPoint, this.endPoint)]
		}
		/**
		 * 圆弧离散误差公式 cos = (radius - resolution) / radius
		 *
		 * 设
		 * 		圆心为 O
		 * 		采样点 A 和 B, 中点为 M
		 * 则
		 * 		弦高(最大误差)为
		 * 		e = r - r * cos(θ/2)
		 * 即
		 * 		e = r(1 - cos(θ/2))
		 * 即
		 * 		cos(θ/2) = (r - e)/r
		 *
		 * this.sweepRadian / theta 即表示需要分成多少段
		 */
		const theta = 2 * Math.acos((this.radius - resolution) / this.radius)
		const segmentCount = Math.max(2, Math.ceil(Math.abs(this.sweepRadian / theta)))
		const ps: Array<Vector2> = new Array(segmentCount + 1)
		const step: number = this.sweepRadian / segmentCount
		for (let i: number = 0, radian: number = this.startRadian; i <= segmentCount; i++, radian += step) {
			ps[i] = this.pointOn(radian)
		}
		return ps
	}

	public getMiddlePoint(): Vector2 {
		const radian: number = Angles.normalizeRadian(this.startRadian + this.sweepRadian * 0.5)
		return this.centerPoint.add(new Vector2(Math.cos(radian), Math.sin(radian)).mul(this.radius))
	}

	/**
	 * 计算圆弧的轴对齐包围盒 (AABB)
	 *
	 * 算法实现:
	 * 		1. 包围盒至少包含圆弧的起点和终点
	 * 		2. 圆弧在 x/y 方向上的极值仅出现在轴对齐方向 (0, π/2, π, 3π/2) 处
	 * 		3. 枚举这四个候选弧度, 判断其是否落在圆弧的扫掠范围内
	 * 		4. 若落入则用该方向的极值点扩展包围盒
	 */
	public buildBBox2(): BBox2 {
		const cx: number = this._centerPoint.x
		const cy: number = this._centerPoint.y
		const r: number = this._radius
		const sweep: number = this.sweepRadian
		/**
		 * 圆弧退化为点
		 */
		if (r === 0 || sweep === 0) {
			const sp: Vector2 = this.startPoint
			return new BBox2(sp.x, sp.y, sp.x, sp.y)
		}
		/**
		 * 整圆快速路径
		 */
		if (Math.abs(Math.abs(sweep) - Math.PI * 2) < 1e-10) {
			return new BBox2(cx - r, cy - r, cx + r, cy + r)
		}
		/**
		 * 以起点和终点初始化包围盒边界
		 */
		const sp: Vector2 = this.startPoint
		const ep: Vector2 = this.endPoint
		let minX: number = Math.min(sp.x, ep.x)
		let maxX: number = Math.max(sp.x, ep.x)
		let minY: number = Math.min(sp.y, ep.y)
		let maxY: number = Math.max(sp.y, ep.y)
		/**
		 * 将起始弧度规范化到 [0, 2π)
		 */
		const tau: number = Math.PI * 2
		let normStart: number = this._startRadian % tau
		if (normStart < 0) {
			normStart += tau
		}
		/**
		 * 四个轴对齐候选弧度对应的极值点
		 * 		0    -> (cx + r, cy)    x 最大
		 * 		π/2  -> (cx, cy + r)    y 最大
		 * 		π    -> (cx - r, cy)    x 最小
		 * 		3π/2 -> (cx, cy - r)    y 最小
		 */
		const candidates: Array<number> = [0, Math.PI * 0.5, Math.PI, Math.PI * 1.5]
		for (const candidate of candidates) {
			if (this.isRadianInSweep(candidate, normStart, sweep)) {
				/**
				 * 该候选方向落在圆弧扫掠范围内, 用对应极值扩展 bbox
				 */
				const px: number = cx + r * Math.cos(candidate)
				const py: number = cy + r * Math.sin(candidate)
				if (px < minX) minX = px
				if (px > maxX) maxX = px
				if (py < minY) minY = py
				if (py > maxY) maxY = py
			}
		}
		return new BBox2(minX, minY, maxX, maxY)
	}

	/**
	 * 判断候选弧度 candidateRadian 是否落在以 normStartRadian 为起点且 sweepRadian 为扫掠量的圆弧范围内
	 * 返回 扫掠弧度 (正 = CCW, 负 = CW)
	 */
	private isRadianInSweep(candidateRadian: number, normStartRadian: number, sweepRadian: number): boolean {
		const tau: number = Math.PI * 2
		/**
		 * 计算 candidateRadian 相对于 normStartRadian 的偏移量, 规范到 [0, 2π)
		 */
		let offsetRadian: number = candidateRadian - normStartRadian
		if (sweepRadian > 0) {
			/**
			 * CCW: 偏移量应在 [0, sweep] 之间
			 */
			if (offsetRadian < 0) {
				offsetRadian += tau
			}
			return offsetRadian <= sweepRadian + DoubleKit.precision2
		}
		/**
		 * CW: 偏移量应在 [sweep, 0] 之间 (sweep 为负值)
		 */
		if (offsetRadian > 0) {
			offsetRadian -= tau
		}
		return offsetRadian >= sweepRadian - 1e-10
	}

	/**
	 * 获取用于 SVG 圆弧渲染的有效终点坐标
	 *
	 * 算法背景:
	 *   	SVG 的 arc 路径命令 (A) 通过起点和终点来定义圆弧。当起点与终点距离过近
	 *   	(几乎重合) 时, SVG 渲染引擎无法正确判断圆弧的弯曲方向, 导致圆弧退化为
	 *   	一个点或渲染异常 (尤其是整圆或接近整圆的场景)。
	 *
	 * 算法实现:
	 *   	当检测到 startPoint 与 endPoint 的欧几里得距离小于阈值 (0.0002) 时,
	 *   	通过逐步回退终点弧度的方式, 在圆弧上找到一个与起点有足够间距的替代终点。
	 *
	 *   	回退方向与圆弧扫掠方向相反
	 *   		- sweepRadian >= 0 (CCW): step 为负值, 终点弧度向起点方向回退
	 *   		- sweepRadian < 0  (CW):  step 为正值, 终点弧度向起点方向回退
	 *
	 *   	每次迭代将 step 翻倍 (指数退避), 确保快速收敛到一个可渲染的终点位置。
	 *
	 *   	循环守卫条件确保回退不会越过起点弧度:
	 *   		- CCW 时: endRadian > startRadian (终点仍在起点的正方向侧)
	 *   		- CW  时: endRadian < startRadian (终点仍在起点的负方向侧)
	 */
	private getSvgEnd(startRadian: number, sweepRadian: number, startPoint: Vector2, endPoint: Vector2): Vector2 {
		let step: number = sweepRadian >= 0 ? -0.01 : 0.01
		let endRadian: number = startRadian + sweepRadian
		while (
			((sweepRadian >= 0 && endRadian > startRadian) || (sweepRadian < 0 && endRadian < startRadian)) &&
			startPoint.distance(endPoint) < 0.0002
		) {
			step *= 2
			endRadian += step
			endPoint = this.pointOn(endRadian)
		}
		return endPoint
	}
}
