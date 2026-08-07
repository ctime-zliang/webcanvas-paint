import { BBox2 } from '../bbox/BBox2'
import { Decimals } from '../../../math/Decimals'
import { DoubleKit } from '../../../math/Doublekit'
import { Matrix3 } from '../matrix/Matrix3'
import { Matrix4 } from '../matrix/Matrix4'
import { Vector } from './Vector'
import { Vector3 } from './Vector3'
import { isFloatEqual } from '../../../utils/Utils'

const VEN$VECTOR2_ORIGIN_DATA: Array<number> = [0, 0]

export class Vector2 extends Vector {
	public static ORIGIN = new Vector2()
	public static X_INIT_UNIT_VERCTOR2 = new Vector2(1, 0)
	public static Y_INIT_UNIT_VERCTOR2 = new Vector2(0, 1)

	/**
	 * 判断两个向量的斜率是否相同
	 */
	public static isSameSlope(vector2_1: Vector2, vector2_2: Vector2): boolean {
		if ((vector2_1.x === 0 && vector2_2.x !== 0) || (vector2_1.x !== 0 && vector2_2.x === 0)) {
			return false
		}
		if (vector2_1.x === 0 && vector2_2.x === 0) {
			return true
		}
		const slope1: number = vector2_1.y / vector2_1.x
		const slope2: number = vector2_2.y / vector2_2.x
		return isFloatEqual(slope1, slope2, Math.sin(Math.PI / 180))
	}

	/**
	 * 判断两个向量是否平行
	 */
	public static isParallel(vector2_1: Vector2, vector2_2: Vector2, eps: number = 1e-8): boolean {
		return Math.abs(vector2_1.cross(vector2_2)) <= eps
	}

	/**
	 * 判断两个向量是否垂直
	 */
	public static isVertical(vector2_1: Vector2, vector2_2: Vector2, eps: number = 1e-8): boolean {
		return Math.abs(vector2_1.dot(vector2_2)) <= eps
	}

	/**
	 * 计算弧度 radian 对应的单位向量
	 */
	public static getNorVector2ByRadian(radian: number): Vector2 {
		return new Vector2(Math.cos(radian), Math.sin(radian))
	}

	public static createByJSONData(jsonData: { x: number; y: number }): Vector2 {
		return new Vector2(jsonData.x, jsonData.y)
	}

	public static createByArray(array: Array<number>): Vector2 {
		return new Vector2(array[0] || 0, array[1] || 0)
	}

	public static hypot(x: number, y: number = x): number {
		let _x: number = Math.abs(x)
		let _y: number = Math.abs(y)
		if (_y > _x) {
			let tmp: number = _y
			_y = _x
			_x = tmp
		}
		if (_x === 0) {
			return _y
		}
		let t: number = _y / _x
		return _x * Math.sqrt(1 + t * t)
	}

	/**
	 * 计算两向量组成的夹角对应的弧度值(有向角)
	 * 		即将 vector2_1 逆时针旋转到 vector2_2 所需要的旋转弧度值
	 *
	 * 数学公式:
	 * 		利用点积和叉积的几何意义:
	 *   		dot = |v₁| · |v₂| · cos(θ) = x₁x₂ + y₁y₂
	 *   		cross = |v₁| · |v₂| · sin(θ) = x₁y₂ - y₁x₂
	 *  		θ = atan2(cross, dot)
	 *
	 * 返回值范围 (-π, π]:
	 * 		- 正值: 从 v1 到 v2 需要逆时针旋转
	 * 		- 负值: 从 v1 到 v2 需要顺时针旋转
	 *
	 * 案例:
	 * 		v1 = (1, 0), v2 = (0, 1)
	 * 			dot = 0, cross = 1
	 * 			θ = atan2(1, 0) = π / 2 (逆时针 90°)
	 *
	 * 		v1 = (1, 0), v2 = (0, -1)
	 * 			dot = 0, cross = -1
	 * 			θ = atan2(-1, 0) = -π / 2 (顺时针 90°)
	 */
	public static calculateRadianCCWByTwoVector2(vector2_1: Vector2, vector2_2: Vector2): number {
		const { x: x1, y: y1 } = vector2_1
		const { x: x2, y: y2 } = vector2_2
		const dot: number = x1 * x2 + y1 * y2
		const cross: number = x1 * y2 - y1 * x2
		return Math.atan2(cross, dot)
	}

	/**
	 * 计算某个初始弧度在经过特定矩阵变换后的弧度
	 */
	public static caculateRadian(radian: number, matrix4: Matrix4): number {
		const cos: number = Math.cos(radian)
		const sin: number = Math.sin(radian)
		const x: number = cos * matrix4.data[0] + sin * matrix4.data[4]
		const y: number = cos * matrix4.data[1] + sin * matrix4.data[5]
		const vector2: Vector2 = new Vector2(x, y).normalize()
		return Math.atan2(vector2.x, vector2.y)
	}

	/**
	 * 计算某个弧度的单位向量
	 */
	public static getInitVector2ByRadian(radian: number): Vector2 {
		return new Vector2(Math.cos(radian), Math.sin(radian))
	}

	public static distanceSquare(x1: number, y1: number, x2: number, y2: number): number {
		return (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1)
	}

	private _x: number
	private _y: number
	constructor(x: number = VEN$VECTOR2_ORIGIN_DATA[0], y: number = VEN$VECTOR2_ORIGIN_DATA[1]) {
		super()
		this._x = x
		this._y = y
	}

	public get x(): number {
		return this._x
	}
	public set x(value: number) {
		this._x = value
	}

	public get y(): number {
		return this._y
	}
	public set y(value: number) {
		this._y = value
	}

	/**
	 * 向量长度
	 */
	public get length(): number {
		return Math.hypot(this.x, this.y)
	}

	/**
	 * 向量弧度方向
	 */
	public get dir(): number {
		return Math.atan2(this.y, this.x)
	}

	/**
	 * 向量角度方向
	 */
	public get dirDeg(): number {
		return Math.atan2(this.y, this.x) * (180 / Math.PI)
	}

	/**
	 * 向量副本
	 */
	public copy(): Vector2 {
		return new Vector2(this.x, this.y)
	}

	/**
	 * 向量与向量相加
	 */
	public add(vector2: Vector2): Vector2 {
		return new Vector2(this.x + vector2.x, this.y + vector2.y)
	}

	/**
	 * 向量与标量相加
	 */
	public addScalar(x: number, y: number = x): Vector2 {
		return new Vector2(this.x + x, this.y + y)
	}

	/**
	 * 向量与向量相减
	 */
	public sub(vector2: Vector2): Vector2 {
		return new Vector2(this.x - vector2.x, this.y - vector2.y)
	}

	/**
	 * 向量与标量相减
	 */
	public subScalar(x: number, y: number): Vector2 {
		return new Vector2(this.x - x, this.y - y)
	}

	/**
	 * 向量缩放
	 */
	public scale(x: number = 0, y: number = x): Vector2 {
		return new Vector2(this.x * x, this.y * y)
	}

	/**
	 * 向量与标量的乘积
	 */
	public mul(x: number = 0, y: number = x): Vector2 {
		return this.scale(x, y)
	}

	/**
	 * 向量与向量叉乘
	 */
	public cross(vector2: Vector2): number {
		return this.x * vector2.y - vector2.x * this.y
	}

	/**
	 * 向量与向量点乘
	 */
	public dot(vector2: Vector2): number {
		return this.x * vector2.x + this.y * vector2.y
	}

	/**
	 * 向量 sin 值
	 */
	public getSin(): number {
		return this.y / this.length
	}

	/**
	 * 向量 cos 值
	 */
	public getCos(): number {
		return this.x / this.length
	}

	/**
	 * 该向量的终点的 bbox2
	 */
	public getEndDotBbbox2(): BBox2 {
		return new BBox2(this.x, this.x, this.y, this.y)
	}

	/**
	 * 计算任意坐标点 point 到当前坐标点的向量与 X 轴正方向的夹角
	 * 		方法返回值包含于 [-Math.PI, Math.PI]
	 * 		返回正数表示逆时针旋转, 返回负数表示顺时针旋转
	 */
	public getRadianByVector2(point: Vector2): number {
		const dx: number = this.x - point.x
		const dy: number = this.y - point.y
		if (dx === 0 && dy === 0) {
			return 0
		}
		return Math.atan2(dy, dx)
	}

	/**
	 * 计算当前点与输入点 P(vector2) 的距离
	 * 		向量与向量 vector2 的距离
	 */
	public distance(vector2: Vector2): number {
		const deltaX: number = vector2.x - this._x
		const deltaY: number = vector2.y - this._y
		return Vector.hypot(deltaX, deltaY)
	}

	public distanceSquare(vector2: Vector2): number {
		const deltaX: number = vector2.x - this._x
		const deltaY: number = vector2.y - this._y
		return deltaX * deltaX + deltaY * deltaY
	}

	/**
	 * 向量旋转 - 绕原点旋转 radian(弧度) 后的结果向量
	 *
	 * 数学公式 - 2D 旋转矩阵:
	 * 		将向量 (x₀, y₀) 绕原点逆时针旋转角度 θ:
	 *   		| x' |   | cos(θ)  -sin(θ) |   | x₀ |
	 *   		| y' | = | sin(θ)   cos(θ) | × | y₀ |
	 *
	 * 		展开为:
	 *  		x' = x₀ · cos(θ) - y₀ · sin(θ)
	 *   		y' = x₀ · sin(θ) + y₀ · cos(θ)
	 *
	 * 案例:
	 * 		- v = (1, 0), θ = π / 2 (90°)
	 * 			v' = (1 × 0 - 0 × 1, 1 × 1 + 0 × 0) = (0, 1), 即逆时针旋转 90°
	 *
	 * 		- v = (1, 1), θ = π / 4 (45°)
	 * 			v' = (1 × 0.707 - 1 × 0.707, 1 × 0.707 + 1 × 0.707) = (0, 1.414), 即指向正上方
	 */
	public rotate(radian: number): Vector2 {
		const c: number = Math.cos(radian)
		const s: number = Math.sin(radian)
		const [x, y] = [this.x, this.y]
		return new Vector2(x * c + y * -s, x * s + y * c)
	}

	/**
	 * 向量旋转 - 绕向量外定点旋转 radian(弧度) 后的结果向量
	 */
	public rotateSurround(center2: Vector2, radian: number): Vector2 {
		const cos: number = Math.cos(radian)
		const sin: number = Math.sin(radian)
		const dx: number = this.x - center2.x
		const dy: number = this.y - center2.y
		return new Vector2(dx * cos + dy * -sin, dx * sin + dy * cos)
	}

	/**
	 * 向量关于 origin2 坐标点的中心对称向量
	 *
	 * 数学公式 - 中心对称(点对称):
	 * 		给定点 P 和对称中心 O, 对称点 P' 满足:
	 *   		P' = 2 · O - P
	 * 		即:
	 *   		P'.x = 2 · O.x - P.x
	 *   		P'.y = 2 · O.y - P.y
	 *
	 * 案例:
	 * 		- P = (3, 1), O = (1, 2)
	 * 			P' = (2×1 - 3, 2 × 2 - 1) = (-1, 3)
	 */
	public mirrorSurround(origin2: Vector2 = Vector2.ORIGIN): Vector2 {
		return new Vector2(2 * origin2.x - this.x, 2 * origin2.y - this.y)
	}

	/**
	 * 当前向量关于直线 y = value 的镜像向量坐标
	 */
	public mirrorSurroundX(yValue: number = 0): Vector2 {
		return new Vector2(this.x, 2 * yValue - this.y)
	}

	/**
	 * 当前向量关于直线 x = value 的镜像向量坐标
	 */
	public mirrorSurroundY(xValue: number = 0): Vector2 {
		return new Vector2(2 * xValue - this.x, this.y)
	}

	/**
	 * 应用 matrix3
	 */
	public multiplyMatrix3(matrix3: Matrix3): Vector2 {
		const x: number = this.x * matrix3.data[0] + this.y * matrix3.data[3] + matrix3.data[6]
		const y: number = this.x * matrix3.data[1] + this.y * matrix3.data[4] + matrix3.data[7]
		return new Vector2(x, y)
	}

	/**
	 * 应用 matrix4
	 */
	public multiplyMatrix4(matrix4: Matrix4): Vector2 {
		const x: number = this.x * matrix4.data[0] + this.y * matrix4.data[4] + matrix4.data[12]
		const y: number = this.x * matrix4.data[1] + this.y * matrix4.data[5] + matrix4.data[13]
		return new Vector2(x, y)
	}

	public toString(): string {
		return `Vector2 (${this.x}, ${this.y})`
	}

	public toJSON(): { x: number; y: number } {
		return {
			x: this._x,
			y: this._y,
		}
	}

	/**
	 * 向量的单位向量
	 */
	public normalize(): Vector2 {
		if (this.x === 0 && this.y === 0) {
			return new Vector2(0, 0)
		}
		const sx: number = this.x / this.length
		const sy: number = this.y / this.length
		return new Vector2(sx, sy)
	}

	/**
	 * 判断当前向量与输入向量是否相等
	 */
	public equalsWithVector2(vector2: Vector2, place: number = 0): boolean {
		if (vector2 instanceof Vector2) {
			return Decimals.equalsFloat(vector2.x, this.x, place) && Decimals.equalsFloat(vector2.y, this.y, place)
		}
		return false
	}

	/**
	 * 判断当前坐标点与输入坐标点是否相等
	 */
	public equalsWithPoint(p: Vector2): boolean {
		return DoubleKit.eq(this.x, p.x) && DoubleKit.eq(this.y, p.y)
	}

	/**
	 * 获取从 origin 到当前坐标点的延长线上距离当前点 dist 长度的点的坐标
	 */
	public getPointOnRays(origin: Vector2, dist: number): Vector2 {
		const d: number = origin.getRadianByVector2(this)
		return new Vector2(this.x + Math.cos(d) * dist, this.y + Math.sin(d) * dist)
	}

	public toArray(): Array<number> {
		return [this.x, this.y]
	}

	public toVector3(z: number = 0): Vector3 {
		return new Vector3(this.x, this.y, z)
	}
}
