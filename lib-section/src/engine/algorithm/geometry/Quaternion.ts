import { EEulerOrder, Euler } from './Euler'
import { Matrix4 } from './matrix/Matrix4'
import { Vector3 } from './vector/Vector3'

export class Quaternion {
	public static initQuaternion(): Quaternion {
		return new Quaternion()
	}

	/**
	 * @description 欧拉角转四元数
	 * @function setFromEuler
	 * @param {Euler} euler 欧拉角
	 * @return {Quaternion}
	 */
	public static setFromEuler(euler: Euler): Quaternion {
		const quaternion: Quaternion = new Quaternion()
		const x: number = euler.x
		const y: number = euler.y
		const z: number = euler.z
		const order: string = euler.order
		const cosx: number = Math.cos(x / 2)
		const cosy: number = Math.cos(y / 2)
		const cosz: number = Math.cos(z / 2)
		const sinx: number = Math.sin(x / 2)
		const siny: number = Math.sin(y / 2)
		const sinz: number = Math.sin(z / 2)
		if (order === EEulerOrder.XYZ) {
			quaternion.x = sinx * cosy * cosz + cosx * siny * sinz
			quaternion.y = cosx * siny * cosz - sinx * cosy * sinz
			quaternion.z = cosx * cosy * sinz + sinx * siny * cosz
			quaternion.w = cosx * cosy * cosz - sinx * siny * sinz
		} else if (order === EEulerOrder.YXZ) {
			quaternion.x = sinx * cosy * cosz + cosx * siny * sinz
			quaternion.y = cosx * siny * cosz - sinx * cosy * sinz
			quaternion.z = cosx * cosy * sinz - sinx * siny * cosz
			quaternion.w = cosx * cosy * cosz + sinx * siny * sinz
		} else if (order === EEulerOrder.ZXY) {
			quaternion.x = sinx * cosy * cosz - cosx * siny * sinz
			quaternion.y = cosx * siny * cosz + sinx * cosy * sinz
			quaternion.z = cosx * cosy * sinz + sinx * siny * cosz
			quaternion.w = cosx * cosy * cosz - sinx * siny * sinz
		} else if (order === EEulerOrder.ZYX) {
			quaternion.x = sinx * cosy * cosz - cosx * siny * sinz
			quaternion.y = cosx * siny * cosz + sinx * cosy * sinz
			quaternion.z = cosx * cosy * sinz - sinx * siny * cosz
			quaternion.w = cosx * cosy * cosz + sinx * siny * sinz
		} else if (order === EEulerOrder.YZX) {
			quaternion.x = sinx * cosy * cosz + cosx * siny * sinz
			quaternion.y = cosx * siny * cosz + sinx * cosy * sinz
			quaternion.z = cosx * cosy * sinz - sinx * siny * cosz
			quaternion.w = cosx * cosy * cosz - sinx * siny * sinz
		} else if (order === EEulerOrder.XZY) {
			quaternion.x = sinx * cosy * cosz - cosx * siny * sinz
			quaternion.y = cosx * siny * cosz - sinx * cosy * sinz
			quaternion.z = cosx * cosy * sinz + sinx * siny * cosz
			quaternion.w = cosx * cosy * cosz + sinx * siny * sinz
		}
		return quaternion
	}

	/**
	 * @description 旋转轴向量旋转指定角度后对应的四元数
	 * @function setFromAxisAngle
	 * @param {number} radian 旋转弧度
	 * @param {Vector3} axisVector3 旋转轴(向量)
	 * @return {Quaternion}
	 */
	public static setFromAxisAngle(radian: number, axisVector3: Vector3): Quaternion {
		const quaternion: Quaternion = new Quaternion()
		const iAxisVector3: Vector3 = axisVector3.copy().normalize()
		const halfRadian: number = radian / 2
		const s: number = Math.sin(halfRadian)
		quaternion.x = iAxisVector3.x * s
		quaternion.y = iAxisVector3.y * s
		quaternion.z = iAxisVector3.z * s
		quaternion.w = Math.cos(halfRadian)
		return quaternion
	}

	/**
	 * @description 旋转矩阵对应的四元数
	 * @function setFromRotationMatrix
	 * @param {Matrix4} matrix4 旋转矩阵
	 * @return {Quaternion}
	 */
	public static setFromRotationMatrix(matrix4: Matrix4): Quaternion {
		const quaternion: Quaternion = new Quaternion()
		const m11: number = matrix4.data[0]
		const m12: number = matrix4.data[4]
		const m13: number = matrix4.data[8]
		const m21: number = matrix4.data[1]
		const m22: number = matrix4.data[5]
		const m23: number = matrix4.data[9]
		const m31: number = matrix4.data[2]
		const m32: number = matrix4.data[6]
		const m33: number = matrix4.data[10]
		let t: number = m11 + m22 + m33
		let s: number = undefined!
		if (t > 0) {
			s = 0.5 / Math.sqrt(t + 1.0)
			quaternion.w = 0.25 / s
			quaternion.x = (m32 - m23) * s
			quaternion.y = (m13 - m31) * s
			quaternion.z = (m21 - m12) * s
		} else if (m11 > m22 && m11 > m33) {
			s = 2 * Math.sqrt(1.0 + m11 - m22 - m33)
			quaternion.w = (m32 - m23) / s
			quaternion.x = 0.25 * s
			quaternion.y = (m12 + m21) / s
			quaternion.z = (m13 + m31) / s
		} else if (m22 > m33) {
			s = 2 * Math.sqrt(1.0 + m22 - m11 - m33)
			quaternion.w = (m13 - m31) / s
			quaternion.x = (m12 + m21) / s
			quaternion.y = 0.25 * s
			quaternion.z = (m23 + m32) / s
		} else {
			s = 2 * Math.sqrt(1.0 + m33 - m11 - m22)
			quaternion.w = (m21 - m12) / s
			quaternion.x = (m13 + m31) / s
			quaternion.y = (m23 + m32) / s
			quaternion.z = 0.25 * s
		}
		return quaternion
	}

	/**
	 * @description 求 qs 到 qe 的四元数球面差值
	 * @function setSlerp
	 * @param {Quaternion} qs 起始四元数
	 * @param {Quaternion} qe 结束四元数
	 * @param {number} t 差值比率
	 * @return {Quaternion}
	 */
	public static setSlerp(qs: Quaternion, qe: Quaternion, t: number): Quaternion {
		const quaternion: Quaternion = qs.copy()
		if (t === 0) {
			return quaternion
		}
		if (t === 1) {
			return Quaternion.copyBy(qe)
		}
		const x: number = quaternion.x
		const y: number = quaternion.y
		const z: number = quaternion.z
		const w: number = quaternion.w
		let cosHalfTheta: number = w * qe.w + x * qe.x + y * qe.y + z * qe.z
		if (cosHalfTheta < 0) {
			quaternion.w = -qe.w
			quaternion.x = -qe.x
			quaternion.y = -qe.y
			quaternion.z = -qe.z
			cosHalfTheta = -cosHalfTheta
		} else {
			quaternion.resetBy(qe)
		}
		if (cosHalfTheta >= 1) {
			quaternion.w = w
			quaternion.x = x
			quaternion.y = y
			quaternion.z = z
			return quaternion
		}
		const sqrSinHalfTheta: number = 1 - cosHalfTheta * cosHalfTheta
		if (sqrSinHalfTheta <= Number.EPSILON) {
			const s: number = 1 - t
			quaternion.w = s * w + t * quaternion.w
			quaternion.x = s * x + t * quaternion.x
			quaternion.y = s * y + t * quaternion.y
			quaternion.z = s * z + t * quaternion.z
			return quaternion.normalize()
		}
		const sinHalfTheta: number = Math.sqrt(sqrSinHalfTheta)
		const halfTheta: number = Math.atan2(sinHalfTheta, cosHalfTheta)
		const ratioA: number = Math.sin((1 - t) * halfTheta) / sinHalfTheta
		const ratioB: number = Math.sin(t * halfTheta) / sinHalfTheta
		quaternion.w = w * ratioA + quaternion.w * ratioB
		quaternion.x = x * ratioA + quaternion.x * ratioB
		quaternion.y = y * ratioA + quaternion.y * ratioB
		quaternion.z = z * ratioA + quaternion.z * ratioB
		return quaternion
	}

	public static fromRotation(radian: number, axisVector3: Vector3): Quaternion {
		const { x, y, z } = axisVector3
		const cos: number = Math.cos(radian / 2)
		const sin: number = Math.sin(radian / 2)
		return new Quaternion(x * sin, y * sin, z * sin, cos)
	}

	public static multiplyQuaternions(quaternion1: Quaternion, quaternion2: Quaternion): Quaternion {
		const quaternion: Quaternion = new Quaternion()
		const qax: number = quaternion1.x
		const qay: number = quaternion1.y
		const qaz: number = quaternion1.z
		const qaw: number = quaternion1.w
		const qbx: number = quaternion2.x
		const qby: number = quaternion2.y
		const qbz: number = quaternion2.z
		const qbw: number = quaternion2.w
		quaternion.x = qax * qbw + qaw * qbx + qay * qbz - qaz * qby
		quaternion.y = qay * qbw + qaw * qby + qaz * qbx - qax * qbz
		quaternion.z = qaz * qbw + qaw * qbz + qax * qby - qay * qbx
		quaternion.w = qaw * qbw - qax * qbx - qay * qby - qaz * qbz
		return quaternion
	}

	public static makeRotationFromQuaternion(quaternion: Quaternion): Array<number> {
		const zero: Vector3 = new Vector3(0, 0, 0)
		const one: Vector3 = new Vector3(1, 1, 1)
		return QuaternionCompose(zero, quaternion, one)
	}

	public static copyBy(quaternion: Quaternion): Quaternion {
		const iQuaternion: Quaternion = new Quaternion()
		iQuaternion.x = quaternion.x
		iQuaternion.y = quaternion.y
		iQuaternion.z = quaternion.z
		iQuaternion.w = quaternion.w
		return iQuaternion
	}

	private _x: number
	private _y: number
	private _z: number
	private _w: number
	constructor(x: number = 0, y: number = 0, z: number = 0, w: number = 1) {
		this._x = x
		this._y = y
		this._z = z
		this._w = w
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

	public get w(): number {
		return this._w
	}
	public set w(value: number) {
		this._w = value
	}

	public get length(): number {
		return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w)
	}

	public get lengthSq(): number {
		return this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w
	}

	public resetBy(quaternion: Quaternion) {
		this.x = quaternion.x
		this.y = quaternion.y
		this.z = quaternion.z
		this.w = quaternion.w
	}

	/**
	 * 求出当前四元数旋转到目标四元数所经过的角度
	 */
	public angleTo(targetQuaternion: Quaternion): number {
		const clamp = (value: number, min: number, max: number): number => {
			return Math.max(min, Math.min(value, max))
		}
		return 2 * Math.acos(Math.abs(clamp(this.dot(targetQuaternion), -1, 1)))
	}

	/**
	 * 当前四元数的共轭四元数
	 */
	public conjugate(): Quaternion {
		this.x *= -1
		this.y *= -1
		this.z *= -1
		return this
	}

	/**
	 * 当前四元数的逆四元数
	 */
	public inverse(): Quaternion {
		return this.conjugate()
	}

	/**
	 * 当前四元数的点积
	 */
	public dot(quaternion: Quaternion): number {
		return this.x * quaternion.x + this.y * quaternion.y + this.z * quaternion.z + this.w * quaternion.w
	}

	public normalize(): Quaternion {
		let len: number = this.length
		if (len === 0) {
			this.x = 0
			this.y = 0
			this.z = 0
			this.w = 1
		} else {
			len = 1 / len
			this.x *= len
			this.y *= len
			this.z *= len
			this.w *= len
		}
		return this
	}

	public multiply(quaternion: Quaternion): Quaternion {
		return Quaternion.multiplyQuaternions(this, quaternion)
	}

	public copy(): Quaternion {
		const quaternion: Quaternion = new Quaternion()
		quaternion.x = this.x
		quaternion.y = this.y
		quaternion.z = this.z
		quaternion.w = this.w
		return quaternion
	}

	public toString(): string {
		return `Quaternion(${this.x}, ${this.y}, ${this.z}, ${this.w})`
	}
}

function QuaternionCompose(position: Vector3, quaternion: Quaternion, scale: Vector3): Array<number> {
	const array: Array<number> = new Array(16)
	const x: number = quaternion.x
	const y: number = quaternion.y
	const z: number = quaternion.z
	const w: number = quaternion.w
	const x2: number = x + x
	const y2: number = y + y
	const z2: number = z + z
	const xx: number = x * x2
	const xy: number = x * y2
	const xz: number = x * z2
	const yy: number = y * y2
	const yz: number = y * z2
	const zz: number = z * z2
	const wx: number = w * x2
	const wy: number = w * y2
	const wz: number = w * z2
	const sx: number = scale.x
	const sy: number = scale.y
	const sz: number = scale.z
	array[0] = (1 - (yy + zz)) * sx
	array[1] = (xy + wz) * sx
	array[2] = (xz - wy) * sx
	array[3] = 0
	array[4] = (xy - wz) * sy
	array[5] = (1 - (xx + zz)) * sy
	array[6] = (yz + wx) * sy
	array[7] = 0
	array[8] = (xz + wy) * sz
	array[9] = (yz - wx) * sz
	array[10] = (1 - (xx + yy)) * sz
	array[11] = 0
	array[12] = position.x
	array[13] = position.y
	array[14] = position.z
	array[15] = 1
	return array
}
