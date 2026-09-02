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
	private _startRadian: number
	private _endRadian: number
	private _sweep: ESweep
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
		const start: number = this.startRadian
		const end: number = this.endRadian
		const diff: number = end - start
		if (this.sweep === ESweep.CCW) {
			if (diff >= 0 && diff <= Math.PI * 2) {
				return diff
			}
			let normalized = diff % (Math.PI * 2)
			if (normalized <= 0) {
				normalized += Math.PI * 2
			}
			return normalized
		}
		if (diff <= 0 && diff >= -Math.PI * 2) {
			return diff
		}
		let normalized = diff % (Math.PI * 2)
		if (normalized >= 0) {
			normalized -= Math.PI * 2
		}
		return normalized
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
	 * 求圆弧上对应弧度的点坐标
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

	/**
	 * 圆弧关于水平线 y = yValue 的镜像
	 *
	 * 数学原理:
	 *   	对于平面上任意一点 P(x, y), 其关于直线 y = k 的镜像点为 P'(x, 2k - y)
	 *   	即 x 坐标不变, y 坐标关于 k 做对称: y' = 2k - y
	 *
	 * 对于圆弧:
	 *     	- 圆心 C(cx, cy) 镜像为 C'(cx, 2k - cy)
	 *     	- 半径不变 (镜像是等距变换)
	 *     	- 起止点分别做镜像变换
	 *
	 * 弧度变换:
	 *     	设原始点在极坐标中的弧度为 θ, 即
	 * 			P = C + r * (cosθ, sinθ)
	 *     	镜像后
	 * 			P' = C' + r * (cosθ, -sinθ)
	 *     	因此镜像后的弧度为 -θ (即关于 X 轴翻转弧度)
	 *     	用 atan2 表示:
	 * 			θ' = atan2(-sinθ, cosθ) = -θ
	 *
	 * 扫掠方向:
	 *     镜像变换的行列式为 -1 (det < 0), 属于反向等距变换, 因此扫掠方向翻转: CCW -> CW, CW -> CCW
	 *     具体表现为: 若原始 endRadian > startRadian (CCW), 镜像后需要 endRadian < startRadian (CW), 反之亦然
	 */
	public mirrorX(yValue: number = 0): Arc {
		/**
		 * 镜像圆心: y 坐标关于 y = yValue 对称
		 */
		const newCenter: Vector2 = this._centerPoint.mirrorSurroundX(yValue)
		/**
		 * 镜像半径: 镜像是等距变换, 半径不变
		 */
		const newRadius: number = this._radius
		/**
		 * 镜像起止点并计算新弧度
		 *   	关于水平线镜像: (x, y) -> (x, 2k - y)
		 *   	新弧度 = atan2(newPoint.y - newCenter.y, newPoint.x - newCenter.x)
		 *   	由于 y 分量取反, 等价于 newRadian = -oldRadian
		 */
		const newStartPoint: Vector2 = this._startPoint.mirrorSurroundX(yValue)
		const newEndPoint: Vector2 = this._endPoint.mirrorSurroundX(yValue)
		const newStartRadian: number = Math.atan2(newStartPoint.y - newCenter.y, newStartPoint.x - newCenter.x)
		const newEndRadian: number = Math.atan2(newEndPoint.y - newCenter.y, newEndPoint.x - newCenter.x)
		/**
		 * 翻转扫掠方向
		 *   	镜像变换翻转手性: CCW <-> CW
		 *   	Arc 构造函数约定: endRadian >= startRadian => CCW, endRadian < startRadian => CW
		 */
		const newSweep: ESweep = this._sweep === ESweep.CCW ? ESweep.CW : ESweep.CCW
		/**
		 * 调整 endRadian 使其满足构造函数的方向约定
		 *   	CCW: 需要 end >= start, 若不满足则 end += 2π
		 *   	CW:  需要 end < start,  若不满足则 end -= 2π
		 */
		let adjustedEndRadian: number = newEndRadian
		if (newSweep === ESweep.CCW) {
			if (adjustedEndRadian < newStartRadian) {
				adjustedEndRadian += Math.PI * 2
			}
		} else {
			if (adjustedEndRadian >= newStartRadian) {
				adjustedEndRadian -= Math.PI * 2
			}
		}
		/**
		 * 整圆特殊处理:
		 *   	起止点重合时 atan2 返回相同值, 扫掠量退化为 0
		 *   	需强制设为完整的 ±2π 以保持整圆语义
		 */
		if (this.isCicle) {
			const fullSweep: number = newSweep === ESweep.CCW ? Math.PI * 2 : -Math.PI * 2
			adjustedEndRadian = newStartRadian + fullSweep
		}
		return new Arc(newRadius, newCenter, newStartRadian, adjustedEndRadian)
	}

	/**
	 * 圆弧关于垂直线 x = xValue 的镜像
	 *
	 * 数学原理:
	 *   	对于平面上任意一点
	 * 			P(x, y)
	 * 		其关于直线 x = k 的镜像点为
	 * 			P'(2k - x, y)
	 *   	即 y 坐标不变, x 坐标关于 k 做对称: x' = 2k - x
	 *
	 * 对于圆弧:
	 *     - 圆心 C(cx, cy) 镜像为 C'(2k - cx, cy)
	 *     - 半径不变 (镜像是等距变换)
	 *     - 起止点分别做镜像变换
	 *
	 * 弧度变换:
	 *     设原始点在极坐标中的弧度为 θ, 即
	 * 			P = C + r * (cosθ, sinθ)
	 *     镜像后
	 * 			P' = C' + r * (-cosθ, sinθ)
	 *     因此镜像后的弧度为
	 * 			π - θ
	 *     用 atan2 表示:
	 * 			θ' = atan2(sinθ, -cosθ) = π - θ
	 *
	 * 扫掠方向:
	 *     与 mirrorX 相同, 镜像变换翻转手性
	 *     扫掠方向翻转: CCW -> CW, CW -> CCW
	 */
	public mirrorY(xValue: number = 0): Arc {
		/**
		 * 镜像圆心: x 坐标关于 x = xValue 对称
		 */
		const newCenter: Vector2 = this._centerPoint.mirrorSurroundY(xValue)
		/**
		 * 镜像半径: 镜像是等距变换, 半径不变
		 */
		const newRadius: number = this._radius
		/**
		 * 镜像起止点并计算新弧度
		 *   	关于垂直线镜像: (x, y) -> (2k - x, y)
		 *   	新弧度 = atan2(newPoint.y - newCenter.y, newPoint.x - newCenter.x)
		 *   	由于 x 分量取反, 等价于 newRadian = π - oldRadian
		 */
		const newStartPoint: Vector2 = this._startPoint.mirrorSurroundY(xValue)
		const newEndPoint: Vector2 = this._endPoint.mirrorSurroundY(xValue)
		const newStartRadian: number = Math.atan2(newStartPoint.y - newCenter.y, newStartPoint.x - newCenter.x)
		const newEndRadian: number = Math.atan2(newEndPoint.y - newCenter.y, newEndPoint.x - newCenter.x)
		/**
		 * 翻转扫掠方向
		 *   	镜像变换翻转手性: CCW <-> CW
		 */
		const newSweep: ESweep = this._sweep === ESweep.CCW ? ESweep.CW : ESweep.CCW
		/**
		 * 调整 endRadian 使其满足构造函数的方向约定
		 *   	CCW: 需要 end >= start, 若不满足则 end += 2π
		 *   	CW:  需要 end < start,  若不满足则 end -= 2π
		 */
		let adjustedEndRadian: number = newEndRadian
		if (newSweep === ESweep.CCW) {
			if (adjustedEndRadian < newStartRadian) {
				adjustedEndRadian += Math.PI * 2
			}
		} else {
			if (adjustedEndRadian >= newStartRadian) {
				adjustedEndRadian -= Math.PI * 2
			}
		}
		/**
		 * 整圆特殊处理:
		 *   	起止点重合时 atan2 返回相同值, 扫掠量退化为 0
		 *   	需强制设为完整的 ±2π 以保持整圆语义
		 */
		if (this.isCicle) {
			const fullSweep: number = newSweep === ESweep.CCW ? Math.PI * 2 : -Math.PI * 2
			adjustedEndRadian = newStartRadian + fullSweep
		}
		return new Arc(newRadius, newCenter, newStartRadian, adjustedEndRadian)
	}

	/**
	 * 圆弧关于点 origin 的中心对称 (点镜像)
	 *
	 * 数学原理:
	 *   	对于平面上任意一点
	 * 			P(x, y)
	 *		其关于点 O(ox, oy) 的中心对称点为:
	 *     		P'(2 * ox - x, 2 * oy - y)
	 *   	即 x 和 y 坐标均关于 O 做对称
	 *   	等价于将 P 绕 O 旋转 180°:
	 *     		P' = O + (O - P) = 2  *O - P
	 *
	 * 对于圆弧:
	 *     - 圆心 C 中心对称为 C' = 2 * O - C
	 *     - 半径不变 (中心对称是等距变换, 也是旋转 180° 的特例)
	 *     - 起止点分别做中心对称
	 *
	 * 弧度变换:
	 *     设原始点在极坐标中的弧度为 θ, 即
	 * 			P = C + r * (cosθ, sinθ)
	 *     中心对称后
	 * 			P' = C' + r * (-cosθ, -sinθ)
	 *     因此镜像后的弧度为
	 * 			θ + π (旋转 180°)
	 *     用 atan2 表示:
	 * 			θ' = atan2(-sinθ, -cosθ) = θ + π
	 *
	 * 扫掠方向:
	 *     中心对称等价于旋转 180°, 旋转是保向变换 (行列式为 +1)
	 *     因此扫掠方向不变: CCW 仍为 CCW, CW 仍为 CW
	 *     这与镜像 (mirrorX/mirrorY) 不同 — 镜像会翻转方向, 旋转不会
	 */
	public mirrorO(origin: Vector2 = Vector2.ORIGIN): Arc {
		/**
		 * 中心对称圆心: C' = 2 * O - C
		 */
		const newCenter: Vector2 = new Vector2(2 * origin.x - this._centerPoint.x, 2 * origin.y - this._centerPoint.y)
		/**
		 * 中心对称半径: 中心对称是旋转 180° 的特例, 半径不变
		 */
		const newRadius: number = this._radius
		/**
		 * 中心对称起止点并计算新弧度
		 *   	中心对称: (x, y) -> (2 * ox - x, 2 * oy - y)
		 *   	新弧度 = atan2(newPoint.y - newCenter.y, newPoint.x - newCenter.x)
		 *   	由于 x, y 分量均取反, 等价于 newRadian = oldRadian + π
		 */
		const newStartPoint: Vector2 = new Vector2(2 * origin.x - this._startPoint.x, 2 * origin.y - this._startPoint.y)
		const newEndPoint: Vector2 = new Vector2(2 * origin.x - this._endPoint.x, 2 * origin.y - this._endPoint.y)
		const newStartRadian: number = Math.atan2(newStartPoint.y - newCenter.y, newStartPoint.x - newCenter.x)
		const newEndRadian: number = Math.atan2(newEndPoint.y - newCenter.y, newEndPoint.x - newCenter.x)
		/**
		 * 扫掠方向保持不变
		 *   	中心对称 = 旋转 180°, 旋转是保向变换 (det = +1)
		 *   	不翻转手性, CCW 仍为 CCW, CW 仍为 CW
		 */
		const newSweep: ESweep = this._sweep
		/**
		 * 调整 endRadian 使其满足构造函数的方向约定
		 *   	CCW: 需要 end >= start, 若不满足则 end += 2π
		 *   	CW:  需要 end < start,  若不满足则 end -= 2π
		 */
		let adjustedEndRadian: number = newEndRadian
		if (newSweep === ESweep.CCW) {
			if (adjustedEndRadian < newStartRadian) {
				adjustedEndRadian += Math.PI * 2
			}
		} else {
			if (adjustedEndRadian >= newStartRadian) {
				adjustedEndRadian -= Math.PI * 2
			}
		}
		/**
		 * 整圆特殊处理:
		 *   	起止点重合时 atan2 返回相同值, 扫掠量退化为 0
		 *   	需强制设为完整的 ±2π 以保持整圆语义
		 */
		if (this.isCicle) {
			const fullSweep: number = newSweep === ESweep.CCW ? Math.PI * 2 : -Math.PI * 2
			adjustedEndRadian = newStartRadian + fullSweep
		}
		return new Arc(newRadius, newCenter, newStartRadian, adjustedEndRadian)
	}

	/**
	 * 圆弧矩阵变换
	 *
	 * 算法步骤:
	 *   	- 圆心直接施加矩阵变换得到新圆心
	 *   	- 半径乘以矩阵的均匀缩放因子 (iScale) 得到新半径
	 *   	- 将原始起止点施加矩阵变换, 再用 atan2 计算它们相对于新圆心的弧度
	 *   	- 根据原始扫掠方向和镜像状态, 调整终止弧度使其满足构造函数的方向约定:
	 *      	- CCW (逆时针): endRadian >= startRadian
	 *      	- CW  (顺时针): endRadian <  startRadian
	 *   	- 整圆特殊处理: atan2 对重合点会返回相同值, 需强制设为 ±2π 的扫掠量
	 *
	 * 镜像处理:
	 *   	当矩阵行列式为负 (det < 0) 时, 变换包含镜像/反射
	 *   	镜像会将逆时针弧翻转为顺时针, 反之亦然
	 */
	public multiplyMatrix3(matrix3: Matrix3): Arc {
		/**
		 * 变换圆心坐标
		 * 		将圆心作为普通点施加矩阵变换: P' = P * M
		 */
		const newCenter: Vector2 = this._centerPoint.multiplyMatrix3(matrix3)
		/**
		 * 缩放半径
		 * 		iScale 为矩阵第一基向量 (i 轴) 的长度, 即 sqrt(a² + d²)
		 * 		对于等比缩放矩阵, iScale === jScale, 圆弧变换后仍为圆弧
		 */
		const newRadius: number = this._radius * matrix3.iScale
		/**
		 * 变换起止点并反推弧度
		 * 		将原始起止点施加相同的矩阵变换, 得到它们在新坐标系下的位置, 再用 atan2(dy, dx) 计算相对于新圆心的极角(弧度)
		 * 		atan2 返回值范围为 (-π, π]
		 */
		const newStartPoint: Vector2 = this._startPoint.multiplyMatrix3(matrix3)
		const newEndPoint: Vector2 = this._endPoint.multiplyMatrix3(matrix3)
		const newStartRadian: number = Math.atan2(newStartPoint.y - newCenter.y, newStartPoint.x - newCenter.x)
		const newEndRadian: number = Math.atan2(newEndPoint.y - newCenter.y, newEndPoint.x - newCenter.x)
		/**
		 * 确定变换后的扫掠方向
		 * 		镜像矩阵 (det < 0) 会翻转旋转方向:
		 *   		- 原始 CCW -> 镜像后 CW
		 *   		- 原始 CW  -> 镜像后 CCW
		 * 		非镜像矩阵保持原方向不变
		 */
		const originalSweep: ESweep = this._sweep
		const newSweep: ESweep = matrix3.isMirrored() ? (originalSweep === ESweep.CCW ? ESweep.CW : ESweep.CCW) : originalSweep
		/**
		 * 调整终止弧度以满足构造函数的方向约定
		 * 		Arc 构造函数通过 endRadian 与 startRadian 的大小关系判断扫掠方向:
		 *   		- endRadian >= startRadian => ESweep.CCW
		 *   		- endRadian <  startRadian => ESweep.CW
		 * 		由于 atan2 返回 (-π, π], 新的 start/end 弧度之间的大小关系可能与期望的扫掠方向不一致, 需要通过加减 2π 来修正:
		 *   		- CCW 但 end < start: end += 2π, 使 end > start
		 *   		- CW  但 end >= start: end -= 2π, 使 end < start
		 */
		let adjustedEndRadian: number = newEndRadian
		if (newSweep === ESweep.CCW) {
			if (adjustedEndRadian < newStartRadian) {
				adjustedEndRadian += Math.PI * 2
			}
		} else {
			if (adjustedEndRadian >= newStartRadian) {
				adjustedEndRadian -= Math.PI * 2
			}
		}
		/**
		 * 整圆特殊处理
		 * 		整圆的 startPoint 与 endPoint 坐标重合, atan2 会得到相同的弧度值, 导致 adjustedEndRadian === newStartRadian, 扫掠量变为 0 (退化为点)
		 * 		需要强制将扫掠量设为完整的 ±2π 以保持整圆语义
		 */
		if (this.isCicle) {
			const fullSweep: number = newSweep === ESweep.CCW ? Math.PI * 2 : -Math.PI * 2
			adjustedEndRadian = newStartRadian + fullSweep
		}
		return new Arc(newRadius, newCenter, newStartRadian, adjustedEndRadian)
	}

	public stroke(strokeWidth: number, cap: ECanvasD2LineCap, sweep: ESweep): Polyline {
		throw new Error(`algorithm error.`)
	}

	/**
	 * 圆弧离散采样
	 * 		限制折线与圆弧之间的最大误差不超过 resolution
	 */
	public toPoints(resolution: number): Array<Vector2> {
		if (this.radius <= resolution) {
			return [this.startPoint, this.getSvgEnd(this.startRadian, this.sweepRadian, this.startPoint, this.endPoint)]
		}
		/**
		 * 圆弧离散误差公式 cos = (radius - resolution) / radius
		 *
		 * 设
		 * 		圆心为 O, 采样点 A 和 B, 中点为 M
		 * 则
		 * 		弦高(最大误差)为
		 * 		e = r - r * cos(θ / 2)
		 * 即
		 * 		e = r(1 - cos(θ / 2))
		 * 即
		 * 		cos(θ / 2) = (r - e) / r
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
	 * 		- 包围盒至少包含圆弧的起点和终点
	 * 		- 圆弧在 x/y 方向上的极值仅出现在轴对齐方向 (0, π / 2, π, 3π / 2) 处
	 * 		- 枚举这四个候选弧度, 判断其是否落在圆弧的扫掠范围内
	 * 		- 若落入则用该方向的极值点扩展包围盒
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
		 * 		0  -> (cx + r, cy)  // x 最大
		 * 		π/2  -> (cx, cy + r)  // y 最大
		 * 		π  -> (cx - r, cy)  // x 最小
		 * 		3π/2  -> (cx, cy - r)  // y 最小
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
		/**
		 * 计算 candidateRadian 相对于 normStartRadian 的偏移量
		 */
		let offsetRadian: number = candidateRadian - normStartRadian
		if (sweepRadian > 0) {
			/**
			 * CCW: 偏移量应在 [0, sweep] 之间
			 */
			if (offsetRadian < 0) {
				offsetRadian += Math.PI * 2
			}
			return offsetRadian <= sweepRadian + DoubleKit.eps1
		}
		/**
		 * CW: 偏移量应在 [sweep, 0] 之间 (sweep 为负值)
		 */
		if (offsetRadian > 0) {
			offsetRadian -= Math.PI * 2
		}
		return offsetRadian >= sweepRadian - 1e-10
	}

	/**
	 * 获取用于 SVG 圆弧渲染的有效终点坐标
	 *
	 * 算法实现:
	 *   	当检测到 startPoint 与 endPoint 的欧几里得距离小于阈值 (0.0002) 时, 通过逐步回退终点弧度的方式, 在圆弧上找到一个与起点有足够间距的替代终点
	 *
	 *   	回退方向与圆弧扫掠方向相反
	 *   		- sweepRadian >= 0 (CCW): step 为负值, 终点弧度向起点方向回退
	 *   		- sweepRadian < 0  (CW):  step 为正值, 终点弧度向起点方向回退
	 *
	 *   	每次迭代将 step 翻倍 (指数退避), 确保快速收敛到一个可渲染的终点位置
	 *
	 *   	循环守卫条件确保回退不会越过起点弧度:
	 *   		- CCW 时: endRadian > startRadian (终点仍在起点的正方向侧)
	 *   		- CW  时: endRadian < startRadian (终点仍在起点的负方向侧)
	 */
	private getSvgEnd(startRadian: number, sweepRadian: number, startPoint: Vector2, endPoint: Vector2): Vector2 {
		let step: number = sweepRadian >= 0 ? -0.01 : 0.01
		let endRadian: number = startRadian + sweepRadian
		const maxIterations: number = 20
		let iterations: number = 0
		while (iterations < maxIterations && ((sweepRadian >= 0 && endRadian > startRadian) || (sweepRadian < 0 && endRadian < startRadian)) && startPoint.distance(endPoint) < 0.0002) {
			step *= 2
			endRadian += step
			endPoint = this.pointOn(endRadian)
			iterations++
		}
		return endPoint
	}
}
