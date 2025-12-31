import { EEulerOrder, Euler } from '../Euler'
import { Quaternion } from '../Quaternion'
import { Vector3 } from '../vector/Vector3'
import { Matrix4 } from './Matrix4'

export class CanvasMatrix4 {
	public static initMatrix(): Matrix4 {
		return new Matrix4()
	}

	public static setFromArray(array: Array<number>): Matrix4 {
		if (array.length !== 16) {
			return new Matrix4()
		}
		const matrix4: Matrix4 = new Matrix4()
		for (let i: number = 0; i < 16; i++) {
			matrix4.data[i] = array[i]
		}
		return matrix4
	}

	public static copyMatrix(refMatrix4: Matrix4): Matrix4 {
		const matrix4: Matrix4 = new Matrix4()
		for (let i: number = 0; i < refMatrix4.data.length; i++) {
			matrix4.data[i] = refMatrix4.data[i]
		}
		return matrix4
	}

	public static setRotationFromEuler(euler: Euler): Matrix4 {
		const matrix4: Matrix4 = new Matrix4()
		const { x, y, z, order } = euler
		const a: number = Math.cos(x)
		const b: number = Math.sin(x)
		const c: number = Math.cos(y)
		const d: number = Math.sin(y)
		const e: number = Math.cos(z)
		const f: number = Math.sin(z)
		if (order === EEulerOrder.XYZ) {
			const ae: number = a * e
			const af: number = a * f
			const be: number = b * e
			const bf: number = b * f
			matrix4.data[0] = c * e
			matrix4.data[4] = -c * f
			matrix4.data[8] = d
			matrix4.data[1] = af + be * d
			matrix4.data[5] = ae - bf * d
			matrix4.data[9] = -b * c
			matrix4.data[2] = bf - ae * d
			matrix4.data[6] = be + af * d
			matrix4.data[10] = a * c
		} else if (order === EEulerOrder.YXZ) {
			const ce: number = c * e
			const cf: number = c * f
			const de: number = d * e
			const df: number = d * f
			matrix4.data[0] = ce + df * b
			matrix4.data[4] = de * b - cf
			matrix4.data[8] = a * d
			matrix4.data[1] = a * f
			matrix4.data[5] = a * e
			matrix4.data[9] = -b
			matrix4.data[2] = cf * b - de
			matrix4.data[6] = df + ce * b
			matrix4.data[10] = a * c
		} else if (order === EEulerOrder.ZXY) {
			const ce: number = c * e
			const cf: number = c * f
			const de: number = d * e
			const df: number = d * f
			matrix4.data[0] = ce - df * b
			matrix4.data[4] = -a * f
			matrix4.data[8] = de + cf * b
			matrix4.data[1] = cf + de * b
			matrix4.data[5] = a * e
			matrix4.data[9] = df - ce * b
			matrix4.data[2] = -a * d
			matrix4.data[6] = b
			matrix4.data[10] = a * c
		} else if (order === EEulerOrder.ZYX) {
			const ae: number = a * e
			const af: number = a * f
			const be: number = b * e
			const bf: number = b * f
			matrix4.data[0] = c * e
			matrix4.data[4] = be * d - af
			matrix4.data[8] = ae * d + bf
			matrix4.data[1] = c * f
			matrix4.data[5] = bf * d + ae
			matrix4.data[9] = af * d - be
			matrix4.data[2] = -d
			matrix4.data[6] = b * c
			matrix4.data[10] = a * c
		} else if (order === EEulerOrder.YZX) {
			const ac: number = a * c
			const ad: number = a * d
			const bc: number = b * c
			const bd: number = b * d
			matrix4.data[0] = c * e
			matrix4.data[4] = bd - ac * f
			matrix4.data[8] = bc * f + ad
			matrix4.data[1] = f
			matrix4.data[5] = a * e
			matrix4.data[9] = -b * e
			matrix4.data[2] = -d * e
			matrix4.data[6] = ad * f + bc
			matrix4.data[10] = ac - bd * f
		} else if (order === EEulerOrder.XZY) {
			const ac: number = a * c
			const ad: number = a * d
			const bc: number = b * c
			const bd: number = b * d
			matrix4.data[0] = c * e
			matrix4.data[4] = -f
			matrix4.data[8] = d * e
			matrix4.data[1] = ac * f + bd
			matrix4.data[5] = a * e
			matrix4.data[9] = ad * f - bc
			matrix4.data[2] = bc * f - ad
			matrix4.data[6] = b * e
			matrix4.data[10] = bd * f + ac
		}
		matrix4.data[3] = 0
		matrix4.data[7] = 0
		matrix4.data[11] = 0
		matrix4.data[12] = 0
		matrix4.data[13] = 0
		matrix4.data[14] = 0
		matrix4.data[15] = 1
		return matrix4
	}

	public static setRotationFromQuaternion(quaternion: Quaternion): Matrix4 {
		const matrix4: Matrix4 = new Matrix4()
		const { x, y, z, w } = quaternion
		const x2: number = 2 * x
		const y2: number = 2 * y
		const z2: number = 2 * z
		const xx: number = x * x2
		const xy: number = x * y2
		const xz: number = x * z2
		const yy: number = y * y2
		const yz: number = y * z2
		const zz: number = z * z2
		const wx: number = w * x2
		const wy: number = w * y2
		const wz: number = w * z2
		matrix4.data[0] = 1 - (yy + zz)
		matrix4.data[1] = xy + wz
		matrix4.data[2] = xz - wy
		matrix4.data[3] = 0
		matrix4.data[4] = xy - wz
		matrix4.data[5] = 1 - (xx + zz)
		matrix4.data[6] = yz + wx
		matrix4.data[7] = 0
		matrix4.data[8] = xz + wy
		matrix4.data[9] = yz - wx
		matrix4.data[10] = 1 - (xx + yy)
		matrix4.data[11] = 0
		matrix4.data[12] = 0
		matrix4.data[13] = 0
		matrix4.data[14] = 0
		matrix4.data[15] = 1
		return matrix4
	}

	public static setFlipByLine(PA: Vector3, PB: Vector3): Matrix4 {
		const ax: number = PA.x
		const ay: number = PA.y
		const az: number = PA.z
		const bx: number = PB.x
		const by: number = PB.y
		const bz: number = PB.z
		let dx: number = bx - ax
		let dy: number = by - ay
		let dz: number = bz - az
		const len: number = Math.hypot(dx, dy, dz)
		dx /= len
		dy /= len
		dz /= len
		const r00: number = 2 * dx * dx - 1
		const r01: number = 2 * dx * dy
		const r02: number = 2 * dx * dz
		const r10: number = 2 * dy * dx
		const r11: number = 2 * dy * dy - 1
		const r12: number = 2 * dy * dz
		const r20: number = 2 * dz * dx
		const r21: number = 2 * dz * dy
		const r22: number = 2 * dz * dz - 1
		const tx: number = ax - (r00 * ax + r01 * ay + r02 * az)
		const ty: number = ay - (r10 * ax + r11 * ay + r12 * az)
		const tz: number = az - (r20 * ax + r21 * ay + r22 * az)
		return new Matrix4([r00, r10, r20, 0, r01, r11, r21, 0, r02, r12, r22, 0, tx, ty, tz, 1])
	}

	public static setRotationByLine(radian: number, PA: Vector3, PB: Vector3): Matrix4 {
		const ax: number = PA.x
		const ay: number = PA.y
		const az: number = PA.z
		let ux: number = PB.x - PA.x
		let uy: number = PB.y - PA.y
		let uz: number = PB.z - PA.z
		const len: number = Math.hypot(ux, uy, uz)
		ux /= len
		uy /= len
		uz /= len
		const c: number = Math.cos(radian)
		const s: number = Math.sin(radian)
		const t: number = 1 - c
		const r00: number = c + ux * ux * t
		const r01: number = ux * uy * t - uz * s
		const r02: number = ux * uz * t + uy * s
		const r10: number = uy * ux * t + uz * s
		const r11: number = c + uy * uy * t
		const r12: number = uy * uz * t - ux * s
		const r20: number = uz * ux * t - uy * s
		const r21: number = uz * uy * t + ux * s
		const r22: number = c + uz * uz * t
		const tx: number = ax - (r00 * ax + r01 * ay + r02 * az)
		const ty: number = ay - (r10 * ax + r11 * ay + r12 * az)
		const tz: number = az - (r20 * ax + r21 * ay + r22 * az)
		return new Matrix4([r00, r10, r20, 0, r01, r11, r21, 0, r02, r12, r22, 0, tx, ty, tz, 1])
	}

	public static setRotationByVector3(radian: number, axisVector3: Vector3): Matrix4 {
		const matrix4: Matrix4 = new Matrix4()
		const { x, y, z } = axisVector3
		if (x === 0 && y === 0 && z === 0) {
			throw new Error('[CanvasMatrix4] the rotation vector cannot be a point.')
		}
		let vx: number = x
		let vy: number = y
		let vz: number = z
		let s: number = Math.sin(radian)
		let c: number = Math.cos(radian)
		if (0 !== vx && 0 === vy && 0 === vz) {
			/**
			 * 绕 X 轴
			 */
			if (vx < 0) {
				s = -s
			}
			matrix4.data[0] = 1
			matrix4.data[4] = 0
			matrix4.data[8] = 0
			matrix4.data[12] = 0
			matrix4.data[1] = 0
			matrix4.data[5] = c
			matrix4.data[9] = -s
			matrix4.data[13] = 0
			matrix4.data[2] = 0
			matrix4.data[6] = s
			matrix4.data[10] = c
			matrix4.data[14] = 0
			matrix4.data[3] = 0
			matrix4.data[7] = 0
			matrix4.data[11] = 0
			matrix4.data[15] = 1
		} else if (0 === vx && 0 !== vy && 0 === vz) {
			/**
			 * 绕 Y 轴
			 */
			if (vy < 0) {
				s = -s
			}
			matrix4.data[0] = c
			matrix4.data[4] = 0
			matrix4.data[8] = s
			matrix4.data[12] = 0
			matrix4.data[1] = 0
			matrix4.data[5] = 1
			matrix4.data[9] = 0
			matrix4.data[13] = 0
			matrix4.data[2] = -s
			matrix4.data[6] = 0
			matrix4.data[10] = c
			matrix4.data[14] = 0
			matrix4.data[3] = 0
			matrix4.data[7] = 0
			matrix4.data[11] = 0
			matrix4.data[15] = 1
		} else if (0 === vx && 0 === vy && 0 !== vz) {
			/**
			 * 绕 Z 轴
			 */
			if (vz < 0) {
				s = -s
			}
			matrix4.data[0] = c
			matrix4.data[4] = -s
			matrix4.data[8] = 0
			matrix4.data[12] = 0
			matrix4.data[1] = s
			matrix4.data[5] = c
			matrix4.data[9] = 0
			matrix4.data[13] = 0
			matrix4.data[2] = 0
			matrix4.data[6] = 0
			matrix4.data[10] = 1
			matrix4.data[14] = 0
			matrix4.data[3] = 0
			matrix4.data[7] = 0
			matrix4.data[11] = 0
			matrix4.data[15] = 1
		} else {
			/**
			 * 绕任意方向轴
			 */
			const len: number = Math.sqrt(vx * vx + vy * vy + vz * vz)
			if (len !== 1) {
				const rlen = 1 / len
				vx *= rlen
				vy *= rlen
				vz *= rlen
			}
			let nc: number = 1 - c
			let xy: number = vx * vy
			let yz: number = vy * vz
			let zx: number = vz * vx
			let xs: number = vx * s
			let ys: number = vy * s
			let zs: number = vz * s
			matrix4.data[0] = vx * vx * nc + c
			matrix4.data[1] = xy * nc + zs
			matrix4.data[2] = zx * nc - ys
			matrix4.data[3] = 0
			matrix4.data[4] = xy * nc - zs
			matrix4.data[5] = vy * vy * nc + c
			matrix4.data[6] = yz * nc + xs
			matrix4.data[7] = 0
			matrix4.data[8] = zx * nc + ys
			matrix4.data[9] = yz * nc - xs
			matrix4.data[10] = vz * vz * nc + c
			matrix4.data[11] = 0
			matrix4.data[12] = 0
			matrix4.data[13] = 0
			matrix4.data[14] = 0
			matrix4.data[15] = 1
		}
		return matrix4
	}

	public static setTranslateByVector3(directionVector3: Vector3): Matrix4 {
		const matrix4: Matrix4 = new Matrix4()
		const { x, y, z } = directionVector3
		matrix4.data[0] = 1
		matrix4.data[4] = 0
		matrix4.data[8] = 0
		matrix4.data[12] = x
		matrix4.data[1] = 0
		matrix4.data[5] = 1
		matrix4.data[9] = 0
		matrix4.data[13] = y
		matrix4.data[2] = 0
		matrix4.data[6] = 0
		matrix4.data[10] = 1
		matrix4.data[14] = z
		matrix4.data[3] = 0
		matrix4.data[7] = 0
		matrix4.data[11] = 0
		matrix4.data[15] = 1
		return matrix4
	}

	public static setScaleByValue(x: number, y: number, z: number): Matrix4 {
		const matrix4: Matrix4 = new Matrix4()
		matrix4.data[0] = x
		matrix4.data[4] = 0
		matrix4.data[8] = 0
		matrix4.data[12] = 0
		matrix4.data[1] = 0
		matrix4.data[5] = y
		matrix4.data[9] = 0
		matrix4.data[13] = 0
		matrix4.data[2] = 0
		matrix4.data[6] = 0
		matrix4.data[10] = z
		matrix4.data[14] = 0
		matrix4.data[3] = 0
		matrix4.data[7] = 0
		matrix4.data[11] = 0
		matrix4.data[15] = 1
		return matrix4
	}

	/**
	 * @description 创建正交投影矩阵
	 * @function setOrtho
	 * @param {number} left 可视范围左侧裁剪位置(左侧边界)
	 * @param {number} right 可视范围右侧裁剪位置(右侧边界)
	 * @param {number} bottom 可视范围底部裁剪位置(底部边界)
	 * @param {number} top 可视范围顶部裁剪位置(顶部边界)
	 * @param {number} near 可视范围纵深方向近端裁剪位置(近端边界)
	 * @param {number} far 可视范围纵深方向远端裁剪位置(远端边界)
	 * @return {Matrix4}
	 */
	public static setOrtho(left: number, right: number, bottom: number, top: number, near: number, far: number): Matrix4 {
		const matrix4: Matrix4 = new Matrix4()
		if (left === right || bottom === top || near === far) {
			throw 'null frustum'
		}
		const rw: number = 1 / (right - left)
		const rh: number = 1 / (top - bottom)
		const rd: number = 1 / (far - near)
		matrix4.data[0] = 2 * rw
		matrix4.data[1] = 0
		matrix4.data[2] = 0
		matrix4.data[3] = 0
		matrix4.data[4] = 0
		matrix4.data[5] = 2 * rh
		matrix4.data[6] = 0
		matrix4.data[7] = 0
		matrix4.data[8] = 0
		matrix4.data[9] = 0
		matrix4.data[10] = -2 * rd
		matrix4.data[11] = 0
		matrix4.data[12] = -(right + left) * rw
		matrix4.data[13] = -(top + bottom) * rh
		matrix4.data[14] = -(far + near) * rd
		matrix4.data[15] = 1
		return matrix4
	}
	public static setOrthoRectView(aspect: number, near: number = 100, far: number = -100, padding: number = 1): Matrix4 {
		return this.setOrtho(-aspect * padding, aspect * padding, -padding, padding, near, far)
	}

	/**
	 * @description 创建透视投影矩阵
	 * @function setPerspective
	 * @param {number} fovy 可视范围上下边界面构成的夹角
	 * @param {number} aspect 可视范围宽高比
	 * @param {number} near 可视范围纵深方向近端裁剪位置(近端边界)
	 * @param {number} far 可视范围纵深方向远端裁剪位置(远端边界)
	 * @return {Matrix4}
	 */
	public static setPerspective(fovy: number, aspect: number, near: number, far: number): Matrix4 {
		const matrix4: Matrix4 = new Matrix4()
		if (near === far || aspect === 0) {
			throw 'null frustum'
		}
		if (near <= 0) {
			throw 'near <= 0'
		}
		if (far <= 0) {
			throw 'far <= 0'
		}
		let _fovy: number = (Math.PI * fovy) / 180 / 2
		let s: number = Math.sin(_fovy)
		if (s === 0) {
			throw 'null frustum'
		}
		let rd: number = 1 / (far - near)
		let ct: number = Math.cos(_fovy) / s
		matrix4.data[0] = ct / aspect
		matrix4.data[1] = 0
		matrix4.data[2] = 0
		matrix4.data[3] = 0
		matrix4.data[4] = 0
		matrix4.data[5] = ct
		matrix4.data[6] = 0
		matrix4.data[7] = 0
		matrix4.data[8] = 0
		matrix4.data[9] = 0
		matrix4.data[10] = -(far + near) * rd
		matrix4.data[11] = -1
		matrix4.data[12] = 0
		matrix4.data[13] = 0
		matrix4.data[14] = -2 * near * far * rd
		matrix4.data[15] = 0
		return matrix4
	}

	/**
	 * @description 创建透视投影矩阵
	 * @function setOrtho
	 * @param {number} left 可视范围左侧裁剪位置(左侧边界)
	 * @param {number} right 可视范围右侧裁剪位置(右侧边界)
	 * @param {number} bottom 可视范围底部裁剪位置(底部边界)
	 * @param {number} top 可视范围顶部裁剪位置(顶部边界)
	 * @param {number} near 可视范围纵深方向近端裁剪位置(近端边界)
	 * @param {number} far 可视范围纵深方向远端裁剪位置(远端边界)
	 * @return {Matrix4}
	 */
	public static setFrustum(left: number, right: number, bottom: number, top: number, near: number, far: number): Matrix4 {
		const matrix4: Matrix4 = new Matrix4()
		if (left === right || top === bottom || near === far) {
			throw 'null frustum'
		}
		if (near <= 0) {
			throw 'near <= 0'
		}
		if (far <= 0) {
			throw 'far <= 0'
		}
		const rw: number = 1 / (right - left)
		const rh: number = 1 / (top - bottom)
		const rd: number = 1 / (far - near)
		matrix4.data[0] = 2 * near * rw
		matrix4.data[1] = 0
		matrix4.data[2] = 0
		matrix4.data[3] = 0
		matrix4.data[4] = 0
		matrix4.data[5] = 2 * near * rh
		matrix4.data[6] = 0
		matrix4.data[7] = 0
		matrix4.data[8] = (right + left) * rw
		matrix4.data[9] = (top + bottom) * rh
		matrix4.data[10] = -(far + near) * rd
		matrix4.data[11] = -1
		matrix4.data[12] = 0
		matrix4.data[13] = 0
		matrix4.data[14] = -2 * near * far * rd
		matrix4.data[15] = 0
		return matrix4
	}

	/**
	 * @description 创建视图矩阵
	 * @function setLookAt
	 * @param {Vector3} eyeVector3 观察者视点位置
	 * @param {Vector3} atVector3 观察目标点位置
	 * @param {Vector3} upVector3 观察者上方向
	 * @return {Matrix4}
	 */
	public static setLookAt(eyeVector3: Vector3, atVector3: Vector3, upVector3: Vector3 = new Vector3(0, 1, 0)): Matrix4 {
		const matrix4: Matrix4 = new Matrix4()
		const { x: eyeX, y: eyeY, z: eyeZ } = eyeVector3
		const { x: atX, y: atY, z: atZ } = atVector3
		const { x: upX, y: upY, z: upZ } = upVector3
		let fx: number = atX - eyeX
		let fy: number = atY - eyeY
		let fz: number = atZ - eyeZ
		const rlf: number = 1 / Math.sqrt(fx * fx + fy * fy + fz * fz)
		fx *= rlf
		fy *= rlf
		fz *= rlf
		let sx: number = fy * upZ - fz * upY
		let sy: number = fz * upX - fx * upZ
		let sz: number = fx * upY - fy * upX
		const rls: number = 1 / Math.sqrt(sx * sx + sy * sy + sz * sz)
		sx *= rls
		sy *= rls
		sz *= rls
		let ux: number = sy * fz - sz * fy
		let uy: number = sz * fx - sx * fz
		let uz: number = sx * fy - sy * fx
		matrix4.data[0] = sx
		matrix4.data[1] = ux
		matrix4.data[2] = -fx
		matrix4.data[3] = 0
		matrix4.data[4] = sy
		matrix4.data[5] = uy
		matrix4.data[6] = -fy
		matrix4.data[7] = 0
		matrix4.data[8] = sz
		matrix4.data[9] = uz
		matrix4.data[10] = -fz
		matrix4.data[11] = 0
		matrix4.data[12] = 0
		matrix4.data[13] = 0
		matrix4.data[14] = 0
		matrix4.data[15] = 1
		return CanvasMatrix4.setTranslateByVector3(new Vector3(-eyeX, -eyeY, -eyeZ)).multiply4(matrix4)
	}

	/**
	 * @description 创建转置矩阵
	 * @function setTranspose
	 * @param {Matrix4} sourceMatrix4 矩阵
	 * @return {Matrix4}
	 */
	public static setTranspose(sourceMatrix4: Matrix4): Matrix4 {
		const matrix4: Matrix4 = new Matrix4()
		for (let i: number = 0; i < sourceMatrix4.data.length; i++) {
			matrix4.data[i] = sourceMatrix4.data[i]
		}
		let t: number = undefined!
		t = matrix4.data[1]
		matrix4.data[1] = matrix4.data[4]
		matrix4.data[4] = t
		t = matrix4.data[2]
		matrix4.data[2] = matrix4.data[8]
		matrix4.data[8] = t
		t = matrix4.data[3]
		matrix4.data[3] = matrix4.data[12]
		matrix4.data[12] = t
		t = matrix4.data[6]
		matrix4.data[6] = matrix4.data[9]
		matrix4.data[9] = t
		t = matrix4.data[7]
		matrix4.data[7] = matrix4.data[13]
		matrix4.data[13] = t
		t = matrix4.data[11]
		matrix4.data[11] = matrix4.data[14]
		matrix4.data[14] = t
		return matrix4
	}

	/**
	 * @description 创建逆矩阵
	 * @function setInverse
	 * @param {Matrix4} sourceMatrix4 矩阵
	 * @return {Matrix4}
	 */
	public static setInverse(sourceMatrix4: Matrix4): Matrix4 {
		const invMatrix4: Matrix4 = new Matrix4()
		const resultMatrix4: Matrix4 = new Matrix4()
		invMatrix4.data[0] =
			sourceMatrix4.data[5] * sourceMatrix4.data[10] * sourceMatrix4.data[15] -
			sourceMatrix4.data[5] * sourceMatrix4.data[11] * sourceMatrix4.data[14] -
			sourceMatrix4.data[9] * sourceMatrix4.data[6] * sourceMatrix4.data[15] +
			sourceMatrix4.data[9] * sourceMatrix4.data[7] * sourceMatrix4.data[14] +
			sourceMatrix4.data[13] * sourceMatrix4.data[6] * sourceMatrix4.data[11] -
			sourceMatrix4.data[13] * sourceMatrix4.data[7] * sourceMatrix4.data[10]
		invMatrix4.data[4] =
			-sourceMatrix4.data[4] * sourceMatrix4.data[10] * sourceMatrix4.data[15] +
			sourceMatrix4.data[4] * sourceMatrix4.data[11] * sourceMatrix4.data[14] +
			sourceMatrix4.data[8] * sourceMatrix4.data[6] * sourceMatrix4.data[15] -
			sourceMatrix4.data[8] * sourceMatrix4.data[7] * sourceMatrix4.data[14] -
			sourceMatrix4.data[12] * sourceMatrix4.data[6] * sourceMatrix4.data[11] +
			sourceMatrix4.data[12] * sourceMatrix4.data[7] * sourceMatrix4.data[10]
		invMatrix4.data[8] =
			sourceMatrix4.data[4] * sourceMatrix4.data[9] * sourceMatrix4.data[15] -
			sourceMatrix4.data[4] * sourceMatrix4.data[11] * sourceMatrix4.data[13] -
			sourceMatrix4.data[8] * sourceMatrix4.data[5] * sourceMatrix4.data[15] +
			sourceMatrix4.data[8] * sourceMatrix4.data[7] * sourceMatrix4.data[13] +
			sourceMatrix4.data[12] * sourceMatrix4.data[5] * sourceMatrix4.data[11] -
			sourceMatrix4.data[12] * sourceMatrix4.data[7] * sourceMatrix4.data[9]
		invMatrix4.data[12] =
			-sourceMatrix4.data[4] * sourceMatrix4.data[9] * sourceMatrix4.data[14] +
			sourceMatrix4.data[4] * sourceMatrix4.data[10] * sourceMatrix4.data[13] +
			sourceMatrix4.data[8] * sourceMatrix4.data[5] * sourceMatrix4.data[14] -
			sourceMatrix4.data[8] * sourceMatrix4.data[6] * sourceMatrix4.data[13] -
			sourceMatrix4.data[12] * sourceMatrix4.data[5] * sourceMatrix4.data[10] +
			sourceMatrix4.data[12] * sourceMatrix4.data[6] * sourceMatrix4.data[9]
		invMatrix4.data[1] =
			-sourceMatrix4.data[1] * sourceMatrix4.data[10] * sourceMatrix4.data[15] +
			sourceMatrix4.data[1] * sourceMatrix4.data[11] * sourceMatrix4.data[14] +
			sourceMatrix4.data[9] * sourceMatrix4.data[2] * sourceMatrix4.data[15] -
			sourceMatrix4.data[9] * sourceMatrix4.data[3] * sourceMatrix4.data[14] -
			sourceMatrix4.data[13] * sourceMatrix4.data[2] * sourceMatrix4.data[11] +
			sourceMatrix4.data[13] * sourceMatrix4.data[3] * sourceMatrix4.data[10]
		invMatrix4.data[5] =
			sourceMatrix4.data[0] * sourceMatrix4.data[10] * sourceMatrix4.data[15] -
			sourceMatrix4.data[0] * sourceMatrix4.data[11] * sourceMatrix4.data[14] -
			sourceMatrix4.data[8] * sourceMatrix4.data[2] * sourceMatrix4.data[15] +
			sourceMatrix4.data[8] * sourceMatrix4.data[3] * sourceMatrix4.data[14] +
			sourceMatrix4.data[12] * sourceMatrix4.data[2] * sourceMatrix4.data[11] -
			sourceMatrix4.data[12] * sourceMatrix4.data[3] * sourceMatrix4.data[10]
		invMatrix4.data[9] =
			-sourceMatrix4.data[0] * sourceMatrix4.data[9] * sourceMatrix4.data[15] +
			sourceMatrix4.data[0] * sourceMatrix4.data[11] * sourceMatrix4.data[13] +
			sourceMatrix4.data[8] * sourceMatrix4.data[1] * sourceMatrix4.data[15] -
			sourceMatrix4.data[8] * sourceMatrix4.data[3] * sourceMatrix4.data[13] -
			sourceMatrix4.data[12] * sourceMatrix4.data[1] * sourceMatrix4.data[11] +
			sourceMatrix4.data[12] * sourceMatrix4.data[3] * sourceMatrix4.data[9]
		invMatrix4.data[13] =
			sourceMatrix4.data[0] * sourceMatrix4.data[9] * sourceMatrix4.data[14] -
			sourceMatrix4.data[0] * sourceMatrix4.data[10] * sourceMatrix4.data[13] -
			sourceMatrix4.data[8] * sourceMatrix4.data[1] * sourceMatrix4.data[14] +
			sourceMatrix4.data[8] * sourceMatrix4.data[2] * sourceMatrix4.data[13] +
			sourceMatrix4.data[12] * sourceMatrix4.data[1] * sourceMatrix4.data[10] -
			sourceMatrix4.data[12] * sourceMatrix4.data[2] * sourceMatrix4.data[9]
		invMatrix4.data[2] =
			sourceMatrix4.data[1] * sourceMatrix4.data[6] * sourceMatrix4.data[15] -
			sourceMatrix4.data[1] * sourceMatrix4.data[7] * sourceMatrix4.data[14] -
			sourceMatrix4.data[5] * sourceMatrix4.data[2] * sourceMatrix4.data[15] +
			sourceMatrix4.data[5] * sourceMatrix4.data[3] * sourceMatrix4.data[14] +
			sourceMatrix4.data[13] * sourceMatrix4.data[2] * sourceMatrix4.data[7] -
			sourceMatrix4.data[13] * sourceMatrix4.data[3] * sourceMatrix4.data[6]
		invMatrix4.data[6] =
			-sourceMatrix4.data[0] * sourceMatrix4.data[6] * sourceMatrix4.data[15] +
			sourceMatrix4.data[0] * sourceMatrix4.data[7] * sourceMatrix4.data[14] +
			sourceMatrix4.data[4] * sourceMatrix4.data[2] * sourceMatrix4.data[15] -
			sourceMatrix4.data[4] * sourceMatrix4.data[3] * sourceMatrix4.data[14] -
			sourceMatrix4.data[12] * sourceMatrix4.data[2] * sourceMatrix4.data[7] +
			sourceMatrix4.data[12] * sourceMatrix4.data[3] * sourceMatrix4.data[6]
		invMatrix4.data[10] =
			sourceMatrix4.data[0] * sourceMatrix4.data[5] * sourceMatrix4.data[15] -
			sourceMatrix4.data[0] * sourceMatrix4.data[7] * sourceMatrix4.data[13] -
			sourceMatrix4.data[4] * sourceMatrix4.data[1] * sourceMatrix4.data[15] +
			sourceMatrix4.data[4] * sourceMatrix4.data[3] * sourceMatrix4.data[13] +
			sourceMatrix4.data[12] * sourceMatrix4.data[1] * sourceMatrix4.data[7] -
			sourceMatrix4.data[12] * sourceMatrix4.data[3] * sourceMatrix4.data[5]
		invMatrix4.data[14] =
			-sourceMatrix4.data[0] * sourceMatrix4.data[5] * sourceMatrix4.data[14] +
			sourceMatrix4.data[0] * sourceMatrix4.data[6] * sourceMatrix4.data[13] +
			sourceMatrix4.data[4] * sourceMatrix4.data[1] * sourceMatrix4.data[14] -
			sourceMatrix4.data[4] * sourceMatrix4.data[2] * sourceMatrix4.data[13] -
			sourceMatrix4.data[12] * sourceMatrix4.data[1] * sourceMatrix4.data[6] +
			sourceMatrix4.data[12] * sourceMatrix4.data[2] * sourceMatrix4.data[5]
		invMatrix4.data[3] =
			-sourceMatrix4.data[1] * sourceMatrix4.data[6] * sourceMatrix4.data[11] +
			sourceMatrix4.data[1] * sourceMatrix4.data[7] * sourceMatrix4.data[10] +
			sourceMatrix4.data[5] * sourceMatrix4.data[2] * sourceMatrix4.data[11] -
			sourceMatrix4.data[5] * sourceMatrix4.data[3] * sourceMatrix4.data[10] -
			sourceMatrix4.data[9] * sourceMatrix4.data[2] * sourceMatrix4.data[7] +
			sourceMatrix4.data[9] * sourceMatrix4.data[3] * sourceMatrix4.data[6]
		invMatrix4.data[7] =
			sourceMatrix4.data[0] * sourceMatrix4.data[6] * sourceMatrix4.data[11] -
			sourceMatrix4.data[0] * sourceMatrix4.data[7] * sourceMatrix4.data[10] -
			sourceMatrix4.data[4] * sourceMatrix4.data[2] * sourceMatrix4.data[11] +
			sourceMatrix4.data[4] * sourceMatrix4.data[3] * sourceMatrix4.data[10] +
			sourceMatrix4.data[8] * sourceMatrix4.data[2] * sourceMatrix4.data[7] -
			sourceMatrix4.data[8] * sourceMatrix4.data[3] * sourceMatrix4.data[6]
		invMatrix4.data[11] =
			-sourceMatrix4.data[0] * sourceMatrix4.data[5] * sourceMatrix4.data[11] +
			sourceMatrix4.data[0] * sourceMatrix4.data[7] * sourceMatrix4.data[9] +
			sourceMatrix4.data[4] * sourceMatrix4.data[1] * sourceMatrix4.data[11] -
			sourceMatrix4.data[4] * sourceMatrix4.data[3] * sourceMatrix4.data[9] -
			sourceMatrix4.data[8] * sourceMatrix4.data[1] * sourceMatrix4.data[7] +
			sourceMatrix4.data[8] * sourceMatrix4.data[3] * sourceMatrix4.data[5]
		invMatrix4.data[15] =
			sourceMatrix4.data[0] * sourceMatrix4.data[5] * sourceMatrix4.data[10] -
			sourceMatrix4.data[0] * sourceMatrix4.data[6] * sourceMatrix4.data[9] -
			sourceMatrix4.data[4] * sourceMatrix4.data[1] * sourceMatrix4.data[10] +
			sourceMatrix4.data[4] * sourceMatrix4.data[2] * sourceMatrix4.data[9] +
			sourceMatrix4.data[8] * sourceMatrix4.data[1] * sourceMatrix4.data[6] -
			sourceMatrix4.data[8] * sourceMatrix4.data[2] * sourceMatrix4.data[5]
		let det: number =
			sourceMatrix4.data[0] * invMatrix4.data[0] +
			sourceMatrix4.data[1] * invMatrix4.data[4] +
			sourceMatrix4.data[2] * invMatrix4.data[8] +
			sourceMatrix4.data[3] * invMatrix4.data[12]
		if (det === 0) {
			return resultMatrix4
		}
		det = 1 / det
		for (let i: number = 0; i < invMatrix4.data.length; i++) {
			resultMatrix4.data[i] = invMatrix4.data[i] * det
		}
		return resultMatrix4
	}
}
