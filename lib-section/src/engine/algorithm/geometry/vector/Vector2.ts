import { BBox2 } from '../bbox/BBox2'
import { Decimals } from '../../../math/Decimals'
import { DoubleKit } from '../../../math/Doublekit'
import { Matrix3 } from '../matrix/Matrix3'
import { Matrix4 } from '../matrix/Matrix4'
import { Vector } from './Vector'
import { Vector3 } from './Vector3'

const VEN$VECTOR2_ORIGIN_DATA: Array<number> = [0, 0]

export class Vector2 extends Vector {
	public static ORIGIN = new Vector2()
	public static X_INIT_UNIT_VERCTOR2 = new Vector2(1, 0)
	public static Y_INIT_UNIT_VERCTOR2 = new Vector2(0, 1)

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

	/**
	 * 计算 AB 向量的弧度
	 */
	public static getRadianByVector2(vector1: Vector2, vector2: Vector2): number {
		return Math.atan2(vector2.y - vector1.y, vector2.x - vector1.x)
	}

	public static dotProd1(x1: number, y1: number, x2: number, y2: number): number {
		return x1 * x2 + y1 * y2
	}
	public static dotProd2(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number): number {
		return Vector2.dotProd1(x2 - x1, y2 - y1, x3 - x2, y3 - y2)
	}

	/**
	 * 求向量(x1, y1) 与向量(x2, y2) 的叉乘
	 */
	public static crossProd1(x1: number, y1: number, x2: number, y2: number): number {
		return x1 * y2 - x2 * y1
	}
	/**
	 * 求向量(x2 - x1, y2 - y1) 与向量(x3 - x2, y3 - y2) 的叉乘
	 *
	 * (x1, y1)
	 * |
	 * |
	 * |
	 * |
	 * |
	 * (x2, y2) ---------- (x3, y3)
	 */
	public static crossProd2(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number): number {
		return (x2 - x1) * (y3 - y2) - (x3 - x2) * (y2 - y1)
	}

	static createByJSONData(jsonData: { x: number; y: number }): Vector2 {
		return new Vector2(jsonData.x, jsonData.y)
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
	 * 计算两向量组成的夹角对应的弧度值
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
	public static caculateAngle(radian: number, matrix4: Matrix4): number {
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

	public static distance2(x1: number, y1: number, x2: number, y2: number): number {
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
	 * 设当前向量为 B, 输入向量 A, 计算 AB 向量的弧度
	 */
	public getRadianByVector2(vector2: Vector2): number {
		return Math.atan2(this.y - vector2.y, this.x - vector2.x)
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

	public distance2(vector2: Vector2): number {
		const deltaX: number = vector2.x - this._x
		const deltaY: number = vector2.y - this._y
		return deltaX * deltaX + deltaY * deltaY
	}

	/**
	 * 向量旋转 - 绕起点旋转 radian(弧度) 后的结果向量
	 * 		将向量 v0(x0, y0) 旋转 θ 角度后
	 * 			x = x0 * cos(θ) - y0 * sin(θ)
	 * 			y = x0 * sin(θ) + x0 * cos(θ)
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
	 */
	public mirrorSurround(origin2: Vector2 = Vector2.ORIGIN): Vector2 {
		return new Vector2(2 * origin2.x, 2 * origin2.y - this.y)
	}

	/**
	 * 向量关于 origin2 坐标点的 x 坐标值的 X 轴镜像
	 */
	public mirrorSurroundX(origin2: Vector2 = Vector2.ORIGIN): Vector2 {
		return new Vector2(this.x, 2 * origin2.y - this.y)
	}

	/**
	 * 向量关于 origin2 坐标点的 y 坐标值的 Y 轴镜像
	 */
	public mirrorSurroundY(origin2: Vector2 = Vector2.ORIGIN): Vector2 {
		return new Vector2(2 * origin2.x - this.x, this.y)
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
