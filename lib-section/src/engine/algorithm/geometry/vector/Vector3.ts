import { Matrix4 } from '../matrix/Matrix4'
import { Vector } from './Vector'
import { Vector2 } from './Vector2'

const VEN$VECTOR3_ORIGIN_DATA: Array<number> = [0, 0, 0]

export class Vector3 extends Vector {
	public static ORIGIN = new Vector3()
	public static X_INIT_UNIT_VERCTOR2 = new Vector3(1, 0, 0)
	public static Y_INIT_UNIT_VERCTOR2 = new Vector3(0, 1, 0)
	public static Z_INIT_UNIT_VERCTOR2 = new Vector3(0, 0, 1)

	public static createByJSONData(jsonData: { x: number; y: number; z: number }): Vector3 {
		return new Vector3(jsonData.x, jsonData.y, jsonData.z)
	}

	private _x: number
	private _y: number
	private _z: number
	constructor(x: number = VEN$VECTOR3_ORIGIN_DATA[0], y: number = VEN$VECTOR3_ORIGIN_DATA[1], z = VEN$VECTOR3_ORIGIN_DATA[2]) {
		super()
		this._x = x
		this._y = y
		this._z = z
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

	public get z(): number {
		return this._z
	}
	public set z(value: number) {
		this._z = value
	}

	/**
	 * 向量长度
	 */
	public get length(): number {
		return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z)
	}

	/**
	 * 向量副本
	 */
	public copy(): Vector3 {
		return new Vector3(this.x, this.y, this.z)
	}

	/**
	 * 向量与向量相加
	 */
	public add(vector3: Vector3): Vector3 {
		return new Vector3(this.x + vector3.x, this.y + vector3.y, this.z + vector3.z)
	}

	/**
	 * 向量与标量相加
	 */
	public addScalar(x: number, y: number, z: number): Vector3 {
		return new Vector3(this.x + x, this.y + y, this.z + z)
	}

	/**
	 * 向量与向量相减
	 */
	public sub(vector3: Vector3): Vector3 {
		return new Vector3(this.x - vector3.x, this.y - vector3.y, this.z - vector3.z)
	}

	/**
	 * 向量与标量相减
	 */
	public subScalar(x: number, y: number, z: number): Vector3 {
		return new Vector3(this.x - x, this.y - y, this.z - z)
	}

	/**
	 * 向量缩放
	 */
	public scale(x: number = 0, y: number = 0, z: number = 0): Vector3 {
		return new Vector3(this.x * x, this.y * y, this.z * z)
	}

	/**
	 * 向量与标量的乘积
	 */
	public mul(x: number = 0, y: number = 0, z: number = 0): Vector3 {
		return this.scale(x, y, z)
	}

	/**
	 * 向量与向量叉乘
	 */
	public cross(vector3: Vector3): Vector3 {
		const x: number = this.y * vector3.z - this.z * vector3.y
		const y: number = this.z * vector3.x - this.x * vector3.z
		const z: number = this.x * vector3.y - this.y * vector3.x
		return new Vector3(x, y, z)
	}

	/**
	 * 向量与向量点乘
	 */
	public dot(vector3: Vector3): number {
		return this.x * vector3.x + this.y * vector3.y + this.z * vector3.z
	}

	/**
	 * 应用 matrix4
	 */
	public multiplyMatrix4(matrix4: Matrix4): Vector3 {
		const x: number = this.x * matrix4.data[0] + this.y * matrix4.data[4] + this.z * matrix4.data[8] + matrix4.data[12]
		const y: number = this.x * matrix4.data[1] + this.y * matrix4.data[5] + this.z * matrix4.data[9] + matrix4.data[13]
		const z: number = this.x * matrix4.data[2] + this.y * matrix4.data[6] + this.z * matrix4.data[10] + matrix4.data[14]
		const w: number = this.x * matrix4.data[3] + this.y * matrix4.data[7] + this.z * matrix4.data[11] + matrix4.data[15]
		return new Vector3(x / w, y / w, z / w)
	}

	public toString(): string {
		return `Vector3 (${this.x}, ${this.y}, ${this.z})`
	}

	public toJSON(): { x: number; y: number; z: number } {
		return {
			x: this._x,
			y: this._y,
			z: this._z,
		}
	}

	/**
	 * 向量的单位向量
	 */
	public normalize(): Vector3 {
		if (this.x === 0 && this.y === 0 && this.z === 0) {
			return new Vector3(0, 0, 0)
		}
		const sx: number = this.x / this.length
		const sy: number = this.y / this.length
		const sz: number = this.z / this.length
		return new Vector3(sx, sy, sz)
	}

	public toArray(): Array<number> {
		return [this.x, this.y, this.z]
	}

	public toVector2(): Vector2 {
		return new Vector2(this.x, this.y)
	}
}
