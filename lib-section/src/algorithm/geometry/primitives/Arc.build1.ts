import { Vector2 } from '../../../engine/algorithm/geometry/vector/Vector2'
import { ESweep } from '../../../engine/config/CommonProfile'
import { DoubleKit } from '../../../engine/math/Doublekit'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 * 工业级 SVG 端点参数化圆弧 → 中心参数化圆弧 转换算法
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 *
 * 功能说明:
 *   将 SVG 圆弧的端点参数化表示 (Endpoint Parameterization) 转换为
 *   中心参数化表示 (Center Parameterization), 并构造 Arc 实例
 *
 * 算法依据:
 *   W3C SVG 1.1 Specification — Implementation Notes: Elliptical Arc
 *   Section F.6: Conversion from endpoint to center parameterization
 *   https://www.w3.org/TR/SVG/implnote.html#ArcImplementationNotes
 *
 * 适用范围:
 *   本实现针对正圆 (circular arc, rx = ry = r) 的特化版本
 *   椭圆旋转角 φ = 0, 简化了通用椭圆弧的变换过程
 *
 * 坐标系约定:
 *   - 外部接口使用数学坐标系 (Y 轴向上)
 *   - 内部 SVG 转换使用屏幕坐标系 (Y 轴向下)
 *   - 输入/输出时通过 y 取反进行坐标系转换
 *
 * 数值鲁棒性:
 *   - 处理退化情况: 起点终点重合 (整圆/零弧)
 *   - 半径修正: 当半径不足以连接两端点时, 按 SVG 规范等比放大
 *   - 判别式钳位: 避免浮点误差导致的负数开方
 *   - 绝对值半径: 始终取正值, 忽略负半径输入
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 */

// ─────────────────────────────────────────────────────────────────────────────────────────
// 类型定义
// ─────────────────────────────────────────────────────────────────────────────────────────

/** 中间计算结果: 旋转坐标系下的圆心坐标 */
interface RotatedCenter {
	cx1: number // 旋转坐标系下圆心的 x 坐标
	cy1: number // 旋转坐标系下圆心的 y 坐标
}

/** 最终计算结果: 中心参数化表示的全部参数 */
interface CenterParameterization {
	cx: number // 原始坐标系下圆心的 x 坐标
	cy: number // 原始坐标系下圆心的 y 坐标
	startAngle: number // 起始角 θ1 (弧度)
	sweepAngle: number // 扫掠角 Δθ (弧度, 正=CCW, 负=CW)
	correctedRadius: number // 修正后的半径 (可能被等比放大)
}

// ─────────────────────────────────────────────────────────────────────────────────────────
// 常量定义
// ─────────────────────────────────────────────────────────────────────────────────────────

/** 2π — 完整圆周弧度 */
const TAU: number = Math.PI * 2

/** 浮点比较容差: 用于判断起点终点是否重合 */
const COINCIDENCE_EPS: number = DoubleKit.eps1

// ─────────────────────────────────────────────────────────────────────────────────────────
// 核心算法实现
// ─────────────────────────────────────────────────────────────────────────────────────────

/**
 * Step 1: 半径修正 (Radius Correction)
 *
 * 当给定半径不足以连接起点和终点时, 按 SVG F.6.6 规范进行等比放大
 *
 * 数学原理:
 *   对于正圆, 两端点间距的一半不能超过半径:
 *     halfChord = |P0 - P1| / 2
 *   若 halfChord > radius, 则半径不够大, 需要放大:
 *     lambda = (dx²/r² + dy²/r²)   -- dx, dy 是中点偏移
 *     if lambda > 1: r = r * sqrt(lambda)
 *
 * @param radius    原始半径 (已取绝对值)
 * @param x1       旋转坐标系下起点的 x 坐标 (即 dx/2)
 * @param y1       旋转坐标系下起点的 y 坐标 (即 dy/2)
 * @returns        修正后的半径
 */
function correctRadius(radius: number, x1: number, y1: number): number {
	const rSq: number = radius * radius
	// lambda = (x1²+y1²) / r² 表示端点半距与半径的比率平方
	const lambda: number = (x1 * x1 + y1 * y1) / rSq
	if (lambda > 1.0) {
		// 半径不足, 等比放大使得恰好能连接两端点
		// 使用 lambda 而非 sqrt(lambda)*radius 以减少一次乘法
		return radius * Math.sqrt(lambda)
	}
	return radius
}

/**
 * Step 2: 计算旋转坐标系下的圆心 (Rotated Center Computation)
 *
 * 在正圆 (φ=0) 的简化条件下, 利用两端点到圆心等距的几何约束求解圆心
 *
 * 数学原理 (SVG F.6.5):
 *   设旋转坐标系下的端点为 (x1', y1'), 半径为 r, 则:
 *
 *   判别式:
 *     sq = (r⁴ - r²·y1'² - r²·x1'²) / (r²·y1'² + r²·x1'²)
 *        = (r² - x1'² - y1'²) / (x1'² + y1'²)
 *
 *   圆心坐标:
 *     cx' = ±√sq · y1'
 *     cy' = ±√sq · (-x1')
 *
 *   符号选择:
 *     sign = (largeArc === sweepFlag) ? -1 : +1
 *     当 largeArc 和 sweepFlag 同号时, 选择"近侧"圆心 (取负号)
 *     当 largeArc 和 sweepFlag 异号时, 选择"远侧"圆心 (取正号)
 *
 * 退化处理:
 *   - sq < 0: 由于浮点舍入可能出现极小负值, 钳位到 0 (退化为半圆)
 *   - sq = 0: 恰好是半圆, 圆心为两端点的中点 (在旋转坐标系下为原点)
 *
 * @param radius       修正后的半径
 * @param x1           旋转坐标系下端点的 x 坐标
 * @param y1           旋转坐标系下端点的 y 坐标
 * @param isLarge      大弧标志 (true = 大弧, false = 小弧)
 * @param sweepFlag    扫掠标志 (true = CW in screen coords)
 * @returns            旋转坐标系下的圆心坐标
 */
function computeRotatedCenter(radius: number, x1: number, y1: number, isLarge: boolean, sweepFlag: boolean): RotatedCenter {
	const rSq: number = radius * radius
	const x1Sq: number = x1 * x1
	const y1Sq: number = y1 * y1

	// 分子: r² - (x1² + y1²), 表示"剩余几何空间"
	// 对于正圆, 通用公式 (rx²·ry² - rx²·y1'² - ry²·x1'²) 退化为 r²·(r² - x1² - y1²)
	// 分母: x1² + y1², 表示端点半距的平方
	// 最终 sq = (r² - x1² - y1²) / (x1² + y1²)
	const numerator: number = rSq - x1Sq - y1Sq
	const denominator: number = x1Sq + y1Sq

	// 防止除零: 当 denominator = 0 时, 起点终点重合, 此分支不应到达 (由上层处理)
	let sq: number = denominator > 0 ? numerator / denominator : 0

	// 浮点钳位: 由于半径修正后理论上 sq >= 0, 但浮点误差可能导致极小负值
	if (sq < 0) {
		sq = 0
	}

	// 符号决策: largeArc XOR sweepFlag
	// - 当 largeArc === sweepFlag (同为 true 或同为 false): sign = -1
	// - 当 largeArc !== sweepFlag (一真一假): sign = +1
	const sign: number = isLarge === sweepFlag ? -1 : 1

	// 系数 = sign * sqrt(sq)
	const coef: number = sign * Math.sqrt(sq)

	// 旋转坐标系下的圆心:
	//   cx' = coef * (r * y1' / r) = coef * y1'    (正圆简化, rx=ry=r)
	//   cy' = coef * (-r * x1' / r) = coef * (-x1') (正圆简化)
	return {
		cx1: coef * y1,
		cy1: coef * -x1,
	}
}

/**
 * Step 3: 将旋转坐标系下的圆心变换回原始坐标系 (Inverse Transform)
 *
 * 数学原理 (SVG F.6.5.3):
 *   cx = cos(φ)·cx' - sin(φ)·cy' + (x0+x1)/2
 *   cy = sin(φ)·cx' + cos(φ)·cy' + (y0+y1)/2
 *
 *   由于正圆 φ=0: cos(φ)=1, sin(φ)=0
 *   简化为:
 *     cx = cx' + (x0+x1)/2
 *     cy = cy' + (y0+y1)/2
 *
 * @param cx1      旋转坐标系下圆心 x
 * @param cy1      旋转坐标系下圆心 y
 * @param x0       起点 x (屏幕坐标)
 * @param y0       起点 y (屏幕坐标)
 * @param x1End    终点 x (屏幕坐标)
 * @param y1End    终点 y (屏幕坐标)
 * @returns        [cx, cy] 原始坐标系下的圆心
 */
function transformCenterToOriginal(cx1: number, cy1: number, x0: number, y0: number, x1End: number, y1End: number): [number, number] {
	// 逆旋转 (φ=0 时为恒等变换) + 平移回中点
	const cx: number = cx1 + (x0 + x1End) * 0.5
	const cy: number = cy1 + (y0 + y1End) * 0.5
	return [cx, cy]
}

/**
 * Step 4: 计算起始角和扫掠角 (Angle Computation)
 *
 * 数学原理 (SVG F.6.5.4 & F.6.5.5):
 *   定义单位向量:
 *     u = ((x1'-cx')/r, (y1'-cy')/r)   -- 从圆心指向起点的单位向量
 *     v = ((-x1'-cx')/r, (-y1'-cy')/r)  -- 从圆心指向终点的单位向量
 *
 *   起始角 θ1 = angle((1,0), u):
 *     θ1 = atan2(uy, ux)
 *     (利用 atan2 替代 acos+sign 的方式, 避免 acos 的数值不稳定性)
 *
 *   扫掠角 Δθ = angle(u, v):
 *     Δθ = atan2(ux·vy - uy·vx, ux·vx + uy·vy)
 *     (使用叉积和点积的 atan2 形式, 同时获得角度大小和方向)
 *
 *   扫掠角修正:
 *     if sweepFlag && Δθ < 0:  Δθ += 2π   (强制正向)
 *     if !sweepFlag && Δθ > 0: Δθ -= 2π   (强制负向)
 *
 * 为什么使用 atan2 而非 acos:
 *   1. atan2 在全象限内均稳定, 而 acos 在 ±1 附近梯度无穷大, 数值敏感
 *   2. atan2 直接给出带符号角度, 无需额外的 sign 判断
 *   3. 避免了 dot / (|u|·|v|) 可能超出 [-1,1] 的钳位问题
 *
 * @param x1          旋转坐标系下端点的 x 坐标 (= dx/2)
 * @param y1          旋转坐标系下端点的 y 坐标 (= dy/2)
 * @param cx1         旋转坐标系下圆心的 x 坐标
 * @param cy1         旋转坐标系下圆心的 y 坐标
 * @param radius      修正后的半径
 * @param sweepFlag   扫掠方向标志
 * @returns           [startAngle, sweepAngle] 起始角和扫掠角 (弧度)
 */
function computeAngles(x1: number, y1: number, cx1: number, cy1: number, radius: number, sweepFlag: boolean): [number, number] {
	// 构造从圆心指向起点和终点的单位向量
	// u = (起点 - 圆心) / r, 其中起点在旋转坐标系下为 (x1, y1)
	const ux: number = (x1 - cx1) / radius
	const uy: number = (y1 - cy1) / radius

	// v = (终点 - 圆心) / r, 其中终点在旋转坐标系下为 (-x1, -y1) (因为中点为原点)
	const vx: number = (-x1 - cx1) / radius
	const vy: number = (-y1 - cy1) / radius

	// 起始角: (1,0) 到 u 的有符号角度
	// angle((1,0), u) = atan2(0·uy - 1·uy ... ) 简化为 atan2(uy, ux)
	const startAngle: number = Math.atan2(uy, ux)

	// 扫掠角: u 到 v 的有符号角度
	// cross(u,v) = ux·vy - uy·vx  (叉积, 决定旋转方向)
	// dot(u,v) = ux·vx + uy·vy    (点积, 决定旋转量)
	const cross: number = ux * vy - uy * vx
	const dot: number = ux * vx + uy * vy
	let sweepAngle: number = Math.atan2(cross, dot)

	// 根据 sweepFlag 修正扫掠角到正确的象限范围
	// sweepFlag = true (CW in screen) → sweepAngle 应为正
	// sweepFlag = false (CCW in screen) → sweepAngle 应为负
	if (sweepFlag && sweepAngle < 0) {
		sweepAngle += TAU
	} else if (!sweepFlag && sweepAngle > 0) {
		sweepAngle -= TAU
	}

	return [startAngle, sweepAngle]
}

/**
 * Step 5: 将屏幕坐标系角度转换为数学坐标系角度
 *
 * 由于 SVG 算法在 Y 轴向下的屏幕坐标系中计算, 而 Arc 构造函数使用 Y 轴向上的数学坐标系:
 *   - 角度取反: 屏幕坐标系的 CCW 在数学坐标系中是 CW
 *   - 起始角规范化: 确保弧度落在 [0, 2π) 范围内
 *
 * @param startAngle  屏幕坐标系下的起始角
 * @param sweepAngle  屏幕坐标系下的扫掠角
 * @returns           [normalizedStart, sweepInMathCoords] 数学坐标系下的角度参数
 */
function convertToMathCoordinates(startAngle: number, sweepAngle: number): [number, number] {
	// 取反: 屏幕坐标 → 数学坐标
	let normalizedStart: number = -startAngle

	// 规范化到 [0, 2π): 确保起始角为非负值
	normalizedStart = normalizedStart % TAU
	if (normalizedStart < 0) {
		normalizedStart += TAU
	}

	// 扫掠角也取反 (方向翻转)
	const sweepInMathCoords: number = -sweepAngle

	return [normalizedStart, sweepInMathCoords]
}

// ─────────────────────────────────────────────────────────────────────────────────────────
// 公开 API: build1 工业级实现
// ─────────────────────────────────────────────────────────────────────────────────────────

/**
 * 根据 SVG 圆弧端点参数化表示 (Endpoint Parameterization) 构建 Arc 实例
 *
 * ┌─────────────────────────────────────────────────────────────────────────────────────┐
 * │ 完整算法流水线 (Pipeline)                                                          │
 * ├─────────────────────────────────────────────────────────────────────────────────────┤
 * │ 1. 输入校验 & 退化处理                                                             │
 * │    ├─ 半径取绝对值                                                                 │
 * │    └─ 起点终点重合 → 构造整圆或零弧                                                 │
 * │ 2. 坐标系转换: 数学坐标 → 屏幕坐标 (y 取反)                                        │
 * │ 3. Step 1: 半径修正 (F.6.6)                                                        │
 * │ 4. Step 2: 计算旋转坐标系下圆心 (F.6.5.2)                                          │
 * │ 5. Step 3: 圆心逆变换到原始坐标系 (F.6.5.3)                                        │
 * │ 6. Step 4: 计算起始角和扫掠角 (F.6.5.4 & F.6.5.5)                                  │
 * │ 7. Step 5: 坐标系转换: 屏幕角度 → 数学角度                                         │
 * │ 8. 构造 Arc 实例                                                                   │
 * └─────────────────────────────────────────────────────────────────────────────────────┘
 *
 * @param startPoint   圆弧起点坐标 (数学坐标系, Y 轴向上)
 * @param endPoint     圆弧终点坐标 (数学坐标系, Y 轴向上)
 * @param radius       圆弧半径 (取绝对值, 负值被视为正值)
 * @param isLarge      大弧标志:
 *                       true  → 选择大于 π 的弧段
 *                       false → 选择小于 π 的弧段
 * @param sweep        扫掠方向:
 *                       ESweep.CW  → 顺时针绘制 (数学坐标系中)
 *                       ESweep.CCW → 逆时针绘制 (数学坐标系中)
 * @returns            Arc 实例, 参数化为 (radius, center, startRadian, endRadian)
 *
 * @example
 *   // 构建从 (0,0) 到 (1,0) 的小弧, 半径 1, 逆时针
 *   const arc = Arc.build1(new Vector2(0, 0), new Vector2(1, 0), 1, false, ESweep.CCW)
 *
 * @throws 无 — 所有退化情况均有兜底处理, 不会抛出异常
 */
export function arcBuild1(
	startPoint: Vector2,
	endPoint: Vector2,
	radius: number,
	isLarge: boolean,
	sweep: ESweep
): {
	radius: number
	centerPoint: Vector2
	startRadian: number
	endRadian: number
} {
	// ─────────────────────────────────────────────────────────────────────────────────
	// 阶段 0: 输入规范化 & 退化处理
	// ─────────────────────────────────────────────────────────────────────────────────

	// 半径始终为正值 (SVG 规范: 负半径视为正值)
	radius = Math.abs(radius)

	// 退化情况: 起点与终点重合
	// - isLarge = true: 视为整圆 (扫掠 2π)
	// - isLarge = false: 视为零弧 (扫掠 0)
	const isCoincident: boolean = startPoint.equalsWithVector2(endPoint)
	if (isCoincident) {
		return {
			radius,
			centerPoint: startPoint,
			startRadian: 0,
			endRadian: isLarge ? TAU : 0,
		}
	}

	// ─────────────────────────────────────────────────────────────────────────────────
	// 阶段 1: 坐标系转换 — 数学坐标系 → SVG 屏幕坐标系
	// ─────────────────────────────────────────────────────────────────────────────────
	// SVG 使用 Y 轴向下的坐标系, 而外部接口使用 Y 轴向上
	// 通过对 y 坐标取反进行转换

	const sweepFlag: boolean = sweep === ESweep.CW

	const x0: number = startPoint.x
	const y0: number = -startPoint.y // y 取反: 数学坐标 → 屏幕坐标
	const x1End: number = endPoint.x
	const y1End: number = -endPoint.y // y 取反: 数学坐标 → 屏幕坐标

	// ─────────────────────────────────────────────────────────────────────────────────
	// 阶段 2: 中点坐标系变换 (SVG F.6.5.1)
	// ─────────────────────────────────────────────────────────────────────────────────
	// 将坐标原点平移到起点与终点的中点, 并应用旋转角 φ 的逆旋转
	// 对于正圆 φ=0, 旋转退化为恒等变换:
	//   x1' = (x0 - x1End) / 2
	//   y1' = (y0 - y1End) / 2

	const x1: number = (x0 - x1End) * 0.5
	const y1: number = (y0 - y1End) * 0.5

	// ─────────────────────────────────────────────────────────────────────────────────
	// 阶段 3: 半径修正 (SVG F.6.6)
	// ─────────────────────────────────────────────────────────────────────────────────
	// 如果半径太小, 等比放大使其恰好能连接两端点

	radius = correctRadius(radius, x1, y1)

	// ─────────────────────────────────────────────────────────────────────────────────
	// 阶段 4: 计算旋转坐标系下的圆心 (SVG F.6.5.2)
	// ─────────────────────────────────────────────────────────────────────────────────

	const { cx1, cy1 }: RotatedCenter = computeRotatedCenter(radius, x1, y1, isLarge, sweepFlag)

	// ─────────────────────────────────────────────────────────────────────────────────
	// 阶段 5: 圆心逆变换到原始坐标系 (SVG F.6.5.3)
	// ─────────────────────────────────────────────────────────────────────────────────

	const [cx, cy]: [number, number] = transformCenterToOriginal(cx1, cy1, x0, y0, x1End, y1End)

	// ─────────────────────────────────────────────────────────────────────────────────
	// 阶段 6: 计算起始角和扫掠角 (SVG F.6.5.4 & F.6.5.5)
	// ─────────────────────────────────────────────────────────────────────────────────

	const [startAngle, sweepAngle]: [number, number] = computeAngles(x1, y1, cx1, cy1, radius, sweepFlag)

	// ─────────────────────────────────────────────────────────────────────────────────
	// 阶段 7: 坐标系转换 — 屏幕角度 → 数学角度
	// ─────────────────────────────────────────────────────────────────────────────────

	const [startRadian, sweepRadian]: [number, number] = convertToMathCoordinates(startAngle, sweepAngle)

	// ─────────────────────────────────────────────────────────────────────────────────
	// 阶段 8: 构造并返回 Arc 实例参数
	// ─────────────────────────────────────────────────────────────────────────────────
	// Arc 构造函数签名: Arc(radius, centerPoint, startRadian, endRadian)
	// 其中 endRadian = startRadian + sweepRadian

	return {
		radius,
		centerPoint: new Vector2(cx, -cy), // cy 取反: 屏幕坐标 → 数学坐标
		startRadian,
		endRadian: startRadian + sweepRadian,
	}
}
