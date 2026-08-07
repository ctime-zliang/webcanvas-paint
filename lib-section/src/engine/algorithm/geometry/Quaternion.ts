import { EEulerOrder, Euler } from './Euler'
import { Matrix4 } from './matrix/Matrix4'
import { Vector3 } from './vector/Vector3'

/**
 * 四元数类, 用于表示三维空间中的旋转
 *
 * 四元数 q = w + xi + yj + zk, 其中:
 * 		- w 为实部(标量部分), 表示旋转角度的余弦分量
 * 		- (x, y, z) 为虚部(向量部分), 表示旋转轴方向与角度正弦的乘积
 * 		- 单位四元数满足 |q| = sqrt(x² + y² + z² + w²) = 1
 *
 * 四元数相比欧拉角的优势:
 * 		- 避免万向节锁 (Gimbal Lock)
 * 		- 支持平滑的球面线性插值 (Slerp)
 * 		- 运算效率优于旋转矩阵
 *
 * 默认值 (0, 0, 0, 1) 表示零旋转(单位四元数)
 */
export class Quaternion {
	public static initQuaternion(): Quaternion {
		return new Quaternion()
	}

	/**
	 * 欧拉角转四元数
	 *
	 * 算法原理:
	 * 		- 欧拉角描述了绕三个坐标轴的连续旋转将每个单轴旋转转化为四元数后,
	 * 		- 按照指定的旋转顺序(如 XYZ 表示先绕X轴, 再绕Y轴, 最后绕Z轴)进行四元数乘法组合
	 *
	 * 单轴旋转 θ 绕轴 a 的四元数为:
	 *   	q = (sin(θ / 2) · ax, sin(θ / 2) · ay, sin(θ / 2) · az, cos(θ / 2))
	 *
	 * 对于 XYZ 顺序, 最终四元数 = Qz * Qy * Qx(注意: 四元数乘法是右结合的), 展开后得到各分量的解析公式, 避免了逐步矩阵乘法的开销
	 * 不同旋转顺序的展开公式中, 各项的符号不同, 这由四元数乘法的非交换性(Hamilton积)决定
	 */
	public static setFromEuler(euler: Euler): Quaternion {
		const quaternion: Quaternion = new Quaternion()
		const x: number = euler.x
		const y: number = euler.y
		const z: number = euler.z
		const order: string = euler.order
		/**
		 * 预计算各轴半角的三角函数值
		 * 半角来源于四元数旋转公式 q = cos(θ / 2) + sin(θ / 2) · (axis)
		 */
		const cosx: number = Math.cos(x / 2)
		const cosy: number = Math.cos(y / 2)
		const cosz: number = Math.cos(z / 2)
		const sinx: number = Math.sin(x / 2)
		const siny: number = Math.sin(y / 2)
		const sinz: number = Math.sin(z / 2)
		/**
		 * 根据旋转顺序展开四元数乘法的解析公式
		 * 每个分支对应不同的旋转组合顺序, 公式由 Qfirst * Qsecond * Qthird 展开得到
		 */
		if (order === EEulerOrder.XYZ) {
			/**
			 * 旋转顺序: 先 X -> 再 Y -> 最后 Z, 即 Qz * Qy * Qx
			 */
			quaternion.x = sinx * cosy * cosz + cosx * siny * sinz
			quaternion.y = cosx * siny * cosz - sinx * cosy * sinz
			quaternion.z = cosx * cosy * sinz + sinx * siny * cosz
			quaternion.w = cosx * cosy * cosz - sinx * siny * sinz
		} else if (order === EEulerOrder.YXZ) {
			/**
			 * 旋转顺序: 先 Y -> 再 X -> 最后 Z, 即 Qz * Qx * Qy
			 */
			quaternion.x = sinx * cosy * cosz + cosx * siny * sinz
			quaternion.y = cosx * siny * cosz - sinx * cosy * sinz
			quaternion.z = cosx * cosy * sinz - sinx * siny * cosz
			quaternion.w = cosx * cosy * cosz + sinx * siny * sinz
		} else if (order === EEulerOrder.ZXY) {
			/**
			 * 旋转顺序: 先 Z -> 再 X -> 最后 Y, 即 Qy * Qx * Qz
			 */
			quaternion.x = sinx * cosy * cosz - cosx * siny * sinz
			quaternion.y = cosx * siny * cosz + sinx * cosy * sinz
			quaternion.z = cosx * cosy * sinz + sinx * siny * cosz
			quaternion.w = cosx * cosy * cosz - sinx * siny * sinz
		} else if (order === EEulerOrder.ZYX) {
			/**
			 * 旋转顺序: 先 Z -> 再 Y -> 最后 X, 即 Qx * Qy * Qz
			 */
			quaternion.x = sinx * cosy * cosz - cosx * siny * sinz
			quaternion.y = cosx * siny * cosz + sinx * cosy * sinz
			quaternion.z = cosx * cosy * sinz - sinx * siny * cosz
			quaternion.w = cosx * cosy * cosz + sinx * siny * sinz
		} else if (order === EEulerOrder.YZX) {
			/**
			 * 旋转顺序: 先 Y -> 再 Z -> 最后 X, 即 Qx * Qz * Qy
			 */
			quaternion.x = sinx * cosy * cosz + cosx * siny * sinz
			quaternion.y = cosx * siny * cosz + sinx * cosy * sinz
			quaternion.z = cosx * cosy * sinz - sinx * siny * cosz
			quaternion.w = cosx * cosy * cosz - sinx * siny * sinz
		} else if (order === EEulerOrder.XZY) {
			/**
			 * 旋转顺序: 先 X -> 再 Z -> 最后 Y, 即 Qy * Qz * Qx
			 */
			quaternion.x = sinx * cosy * cosz - cosx * siny * sinz
			quaternion.y = cosx * siny * cosz - sinx * cosy * sinz
			quaternion.z = cosx * cosy * sinz + sinx * siny * cosz
			quaternion.w = cosx * cosy * cosz + sinx * siny * sinz
		}
		return quaternion
	}

	/**
	 * 旋转轴向量旋转指定角度后对应的四元数(轴角表示法)
	 *
	 * 算法原理 (Axis - Angle to Quaternion):
	 * 		给定旋转轴的单位向量 n = (nx, ny, nz) 和旋转角度 θ, 对应的四元数为:
	 *   		q = cos(θ / 2) + sin(θ / 2) · (nx · i + ny · j + nz · k)
	 * 		即:
	 *   		w = cos(θ / 2)
	 *   		x = nx · sin(θ / 2)
	 *   		y = ny · sin(θ / 2)
	 *   		z = nz · sin(θ / 2)
	 *
	 * 使用半角是因为四元数旋转公式 p' = q · p · q⁻¹ 中, 旋转了角度 θ 而非 2θ轴向量必须先归一化, 否则结果不是单位四元数
	 */
	public static setFromAxisRadian(radian: number, axisVector3: Vector3): Quaternion {
		const quaternion: Quaternion = new Quaternion()
		/**
		 * 归一化旋转轴, 确保结果为单位四元数
		 */
		const iAxisVector3: Vector3 = axisVector3.copy().normalize()
		const halfRadian: number = radian / 2
		const s: number = Math.sin(halfRadian)
		/**
		 * 虚部 = 旋转轴单位向量 × sin(θ / 2)
		 */
		quaternion.x = iAxisVector3.x * s
		quaternion.y = iAxisVector3.y * s
		quaternion.z = iAxisVector3.z * s
		/**
		 * 实部 = cos(θ / 2)
		 */
		quaternion.w = Math.cos(halfRadian)
		return quaternion
	}

	/**
	 * 从旋转矩阵提取对应的四元数(Shepperd方法)
	 *
	 * 算法原理(Rotation Matrix to Quaternion - Shepperd's Method):
	 * 		旋转矩阵 R 与单位四元数 q = (x, y, z, w) 的关系:
	 *   		R = | 1 - 2 · (y² + z²)   2 · (xy - wz)      2 · (xz + wy)    |
	 *       		| 2 · (xy + wz)       1 - 2(x² + z²)     2 · (yz - wx)    |
	 *       		| 2 · (xz -wy)        2 · (yz + wx)      1 - 2 ·(x² + y²) |
	 *
	 * 		从矩阵迹(trace) t = m11 + m22 + m33 可得:
	 *   		t = 3 - 4 · (x² + y² + z²) = 4w² - 1
	 *
	 * 为了避免数值不稳定(除零), 使用 Shepperd 方法:
	 * 根据对角线元素的大小, 选择分母最大的分量来计算, 共4种情况:
	 * 		情况1:
	 * 			t > 0(w 最大)
	 *   			s = 0.5 / sqrt(t + 1), w = 0.25/s
	 *   		利用矩阵的反对称部分提取 x, y, z
	 *
	 * 		情况2:
	 * 			m11 最大 → x 分量最大
	 *   			s = 2·sqrt(1 + m11 - m22 - m33)
	 *
	 * 		情况3:
	 * 			m22 最大 → y 分量最大
	 *   		s = 2·sqrt(1 + m22 - m11 - m33)
	 *
	 * 		情况4:
	 * 			m33 最大 → z 分量最大
	 *   		s = 2·sqrt(1 + m33 - m11 - m22)
	 *
	 * 矩阵以列主序 (Column-Major) 存储, 因此 data[1] = m21, data[4] = m12 等
	 */
	public static setFromRotationMatrix(matrix4: Matrix4): Quaternion {
		const quaternion: Quaternion = new Quaternion()
		/**
		 * 提取 3 x 3 旋转子矩阵元素(列主序: data[col*4 + row])
		 */
		const m11: number = matrix4.data[0]
		const m12: number = matrix4.data[4]
		const m13: number = matrix4.data[8]
		const m21: number = matrix4.data[1]
		const m22: number = matrix4.data[5]
		const m23: number = matrix4.data[9]
		const m31: number = matrix4.data[2]
		const m32: number = matrix4.data[6]
		const m33: number = matrix4.data[10]
		/**
		 * 计算矩阵的迹 trace = m11 + m22 + m33 = 4w² - 1
		 */
		let t: number = m11 + m22 + m33
		let s: number = undefined!
		if (t > 0) {
			/**
			 * 情况1: w 分量数值最大, 直接从 trace 计算
			 * 		s = 1 / (4w), 其中 w = sqrt(t + 1) / 2
			 */
			s = 0.5 / Math.sqrt(t + 1.0)
			quaternion.w = 0.25 / s
			/**
			 * 利用矩阵反对称部分:
			 * 		m32 - m23 = 4wx
			 * 		m13 - m31 = 4wy
			 * 		m21 - m12 = 4wz
			 */
			quaternion.x = (m32 - m23) * s
			quaternion.y = (m13 - m31) * s
			quaternion.z = (m21 - m12) * s
		} else if (m11 > m22 && m11 > m33) {
			/**
			 * 情况2: x 分量数值最大
			 * 		s = 4x, 其中 x = sqrt(1 + m11 - m22 - m33) / 2
			 */
			s = 2 * Math.sqrt(1.0 + m11 - m22 - m33)
			quaternion.w = (m32 - m23) / s
			quaternion.x = 0.25 * s
			quaternion.y = (m12 + m21) / s
			quaternion.z = (m13 + m31) / s
		} else if (m22 > m33) {
			/**
			 * 情况3: y 分量数值最大
			 * 		s = 4y, 其中 y = sqrt(1 + m22 - m11 - m33) / 2
			 */
			s = 2 * Math.sqrt(1.0 + m22 - m11 - m33)
			quaternion.w = (m13 - m31) / s
			quaternion.x = (m12 + m21) / s
			quaternion.y = 0.25 * s
			quaternion.z = (m23 + m32) / s
		} else {
			/**
			 * 情况4: z 分量数值最大
			 * 		s = 4z, 其中 z = sqrt(1 + m33 - m11 - m22) / 2
			 */
			s = 2 * Math.sqrt(1.0 + m33 - m11 - m22)
			quaternion.w = (m21 - m12) / s
			quaternion.x = (m13 + m31) / s
			quaternion.y = (m23 + m32) / s
			quaternion.z = 0.25 * s
		}
		return quaternion
	}

	/**
	 * 四元数球面线性插值 (Slerp - Spherical Linear Interpolation)
	 * 		输入:
	 * 			qs: 起始四元数
	 * 			qe: 结束四元数
	 * 			t: 插值参数, 范围 [0, 1], 0 返回 qs, 1 返回 qe
	 *
	 * 算法原理:
	 * 		Slerp 在四维超球面上沿大弧(Great Arc)进行等角速度插值
	 * 		公式:
	 *   		Slerp(qs, qe, t) = qs · sin((1 - t)·Ω) / sin(Ω) + qe · sin(t · Ω) / sin(Ω)
	 * 		其中 Ω = arccos(qs · qe) 是两个四元数之间的夹角(通过点积计算)
	 *
	 * 特殊情况处理:
	 *  	- 若点积 < 0, 说明两四元数在超球面上的夹角 > 90°, 此时取 qe 的负值 (-q 和 q 表示同一旋转), 走短弧路径
	 * 		- 若 cosHalfTheta ≈ 1, 两四元数几乎相同, 直接返回 qs
	 * 		- 若 sin²(Ω) ≤ ε (近似平行), 退化为线性插值 (Lerp + 归一化), 避免 sin(Ω) ≈ 0 造成除零
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
		/**
		 * 计算两个四元数的点积 = cos(Ω), Ω 为它们在 4D 超球面上的夹角
		 */
		let cosHalfTheta: number = w * qe.w + x * qe.x + y * qe.y + z * qe.z
		if (cosHalfTheta < 0) {
			/**
			 * 点积为负 → 夹角 > 90° → 取反以走最短路径, 因为 q 和 -q 表示完全相同的旋转
			 */
			quaternion.w = -qe.w
			quaternion.x = -qe.x
			quaternion.y = -qe.y
			quaternion.z = -qe.z
			cosHalfTheta = -cosHalfTheta
		} else {
			quaternion.resetBy(qe)
		}
		if (cosHalfTheta >= 1) {
			/**
			 * cos(Ω) = 1 → Ω = 0 → 两个四元数相同, 直接返回起始值
			 */
			quaternion.w = w
			quaternion.x = x
			quaternion.y = y
			quaternion.z = z
			return quaternion
		}
		/**
		 * sin²(Ω) = 1 - cos²(Ω)
		 */
		const sqrSinHalfTheta: number = 1 - cosHalfTheta * cosHalfTheta
		if (sqrSinHalfTheta <= Number.EPSILON) {
			/**
			 * sin(Ω) ≈ 0(近似平行), 退化为线性插值避免除零
			 * Nlerp: 线性插值后归一化
			 */
			const s: number = 1 - t
			quaternion.w = s * w + t * quaternion.w
			quaternion.x = s * x + t * quaternion.x
			quaternion.y = s * y + t * quaternion.y
			quaternion.z = s * z + t * quaternion.z
			return quaternion.normalize()
		}
		/**
		 *  标准 Slerp 公式
		 **/
		const sinHalfTheta: number = Math.sqrt(sqrSinHalfTheta)
		/**
		 * Ω = atan2(sin, cos)
		 */
		const halfTheta: number = Math.atan2(sinHalfTheta, cosHalfTheta)
		/**
		 * 计算两个插值权重系数
		 **/
		/**
		 * 起始四元数权重
		 */
		const ratioA: number = Math.sin((1 - t) * halfTheta) / sinHalfTheta
		/**
		 * 目标四元数权重
		 */
		const ratioB: number = Math.sin(t * halfTheta) / sinHalfTheta
		/**
		 * 加权组合
		 */
		quaternion.w = w * ratioA + quaternion.w * ratioB
		quaternion.x = x * ratioA + quaternion.x * ratioB
		quaternion.y = y * ratioA + quaternion.y * ratioB
		quaternion.z = z * ratioA + quaternion.z * ratioB
		return quaternion
	}

	/**
	 * 轴角表示法转四元数(简洁版, 不归一化输入轴)
	 *
	 * 算法说明:
	 * 		- 与 setFromAxisRadian 相同的数学原理, 但假设输入轴已经是单位向量,
	 * 		- 不进行额外的归一化操作调用方需确保 axisVector3 已归一化
	 * 		- q = (x · sin(θ / 2), y · sin(θ / 2), z · sin(θ / 2), cos(θ / 2))
	 */
	public static fromRotation(radian: number, axisVector3: Vector3): Quaternion {
		const { x, y, z } = axisVector3
		const cos: number = Math.cos(radian / 2)
		const sin: number = Math.sin(radian / 2)
		return new Quaternion(x * sin, y * sin, z * sin, cos)
	}

	/**
	 *四元数乘法 (Hamilton 积), 表示两次旋转的组合
	 *
	 * 算法原理 (Hamilton Product):
	 * 		给定 q1 = (a₁, b₁, c₁, d₁) 和 q2 = (a₂, b₂, c₂, d₂), 其中前三个为虚部 (x, y, z), 最后为实部 (w):
	 *
	 * Hamilton 积定义(基于 i² = j² = k² = ijk = -1):
	 *   	(q1 * q2).x = a₁ · d₂ + d₁ · a₂ + b₁ · c₂ - c₁ · b₂
	 *   	(q1 * q2).y = b₁ · d₂ + d₁ · b₂ + c₁ · a₂ - a₁ · c₂
	 *   	(q1 * q2).z = c₁ · d₂ + d₁ · c₂ + a₁ · b₂ - b₁ · a₂
	 *   	(q1 * q2).w = d₁ · d₂ - a₁ · a₂ - b₁ · b₂ - c₁ · c₂
	 */
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
		/**
		 *  Hamilton 积展开
		 */
		quaternion.x = qax * qbw + qaw * qbx + qay * qbz - qaz * qby
		quaternion.y = qay * qbw + qaw * qby + qaz * qbx - qax * qbz
		quaternion.z = qaz * qbw + qaw * qbz + qax * qby - qay * qbx
		quaternion.w = qaw * qbw - qax * qbx - qay * qby - qaz * qbz
		return quaternion
	}

	/**
	 * 将四元数转换为 4 x 4 旋转矩阵(列主序数组)
	 *
	 * 算法说明:
	 * 		- 使用 QuaternionCompose 函数, 将平移设为零向量、缩放设为单位向量, 仅提取旋转部分生成 4 x 4 齐次变换矩阵
	 */
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

	/**
	 * 四元数
	 * 		输入:
	 * 			x 虚部 i 分量(旋转轴 x 方向 × sin(θ / 2)), 默认 0
	 * 			y 虚部 j 分量(旋转轴 y 方向 × sin(θ / 2)), 默认 0
	 * 			z 虚部 k 分量(旋转轴 z 方向 × sin(θ / 2)), 默认 0
	 * 			w 实部(cos(θ / 2)), 默认 1 (表示无旋转)
	 */
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

	/**
	 * 四元数的模(L2 范数)
	 * 		|q| = sqrt(x² + y² + z² + w²)
	 * 单位四元数的 length 恒为 1
	 */
	public get length(): number {
		return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w)
	}

	/**
	 * 四元数的模的平方(避免开方运算, 用于比较大小等场景)
	 *		|q|² = x² + y² + z² + w²
	 */
	public get lengthSq(): number {
		return this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w
	}

	/**
	 * 用另一个四元数的值重置当前四元数
	 */
	public resetBy(quaternion: Quaternion) {
		this.x = quaternion.x
		this.y = quaternion.y
		this.z = quaternion.z
		this.w = quaternion.w
	}

	/**
	 * 计算当前四元数旋转到目标四元数所经过的角度(弧度)
	 *
	 * 算法原理:
	 * 		- 两个单位四元数之间的旋转角度 Ω 满足:
	 *   		cos(Ω / 2) = |q1 · q2|
	 * 		因此:
	 *   		Ω = 2 · arccos(|q1 · q2|)
	 *
	 * 取绝对值是为了处理 q 和 -q 表示同一旋转的情况, clamp 到 [-1, 1] 防止浮点误差导致 arccos 返回 NaN
	 */
	public angleTo(targetQuaternion: Quaternion): number {
		const clamp = (value: number, min: number, max: number): number => {
			return Math.max(min, Math.min(value, max))
		}
		return 2 * Math.acos(Math.abs(clamp(this.dot(targetQuaternion), -1, 1)))
	}

	/**
	 * 当前四元数的共轭四元数(就地修改)
	 *
	 * 算法说明:
	 * 		- 四元数 q = w + xi + yj + zk 的共轭为 q* = w - xi - yj - zk
	 * 		- 即保持实部不变, 虚部全部取反
	 *
	 * 物理意义:
	 * 		- 对于单位四元数, 共轭等于逆, 表示反方向的旋转
	 *
	 * 性质:
	 * 		q · q* = |q|²
	 */
	public conjugate(): Quaternion {
		this.x *= -1
		this.y *= -1
		this.z *= -1
		return this
	}

	/**
	 * 当前四元数的逆四元数(就地修改)
	 *
	 * 算法说明:
	 * 		- 四元数的逆定义为: q⁻¹ = q* / |q|²
	 * 		- 对于单位四元数 (|q| = 1), 逆等于共轭: q⁻¹ = q*
	 *
	 * 本实现假设当前四元数已归一化, 因此直接返回共轭, 如果四元数未归一化, 应额外除以 lengthSq
	 *
	 * 物理意义:
	 * 		- q⁻¹ 表示 q 的逆旋转, 满足 q · q⁻¹ = 1(单位四元数)
	 */
	public inverse(): Quaternion {
		return this.conjugate()
	}

	/**
	 * 四元数点积(内积)
	 *
	 * 算法说明:
	 * 		q1 · q2 = x1 · x2 + y1 · y2 + z1 · z2 + w1 · w2
	 *
	 * 物理意义:
	 * 		- 点积的绝对值 = cos(Ω / 2), 其中 Ω 是两个旋转之间的夹角
	 * 		- 点积 = 1: 两个四元数相同
	 * 		- 点积 = -1: 两个四元数表示相同旋转(因为 q 和 -q 等价)
	 * 		- 点积 = 0: 两个旋转之间夹角为 180°
	 *
	 * 常用于 Slerp 中计算两个四元数的"距离"
	 */
	public dot(quaternion: Quaternion): number {
		return this.x * quaternion.x + this.y * quaternion.y + this.z * quaternion.z + this.w * quaternion.w
	}

	/**
	 * 四元数归一化(就地修改为单位四元数)
	 *
	 * 算法说明:
	 * 		- 将四元数除以其模长, 使 |q| = 1:
	 *   		q_norm = q / |q| = (x / |q|, y / |q|, z / |q|, w / |q|)
	 *
	 * 只有单位四元数才能正确表示旋转由于浮点累积误差, 经过多次运算后的四元数可能偏离单位长度, 需要重新归一化
	 *
	 * 特殊情况:
	 * 		- 零四元数 (0, 0, 0, 0) 归一化为 (0, 0, 0, 1)(单位四元数)
	 */
	public normalize(): Quaternion {
		let len: number = this.length
		if (len === 0) {
			/**
			 * 零四元数无法归一化, 重置为单位四元数
			 */
			this.x = 0
			this.y = 0
			this.z = 0
			this.w = 1
		} else {
			/**
			 * 除以模长得到单位四元数
			 */
			len = 1 / len
			this.x *= len
			this.y *= len
			this.z *= len
			this.w *= len
		}
		return this
	}

	/**
	 * 四元数乘法
	 */
	public multiply(quaternion: Quaternion): Quaternion {
		return Quaternion.multiplyQuaternions(this, quaternion)
	}

	/**
	 * 创建当前四元数的深拷贝副本
	 */
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

/**
 * 将平移 (position)、旋转 (quaternion) / 缩放 (scale) 组合为 4 x 4 齐次变换矩阵 (TRS 组合)
 * 		输入:
 * 			position: 平移向量
 * 			quaternion: 旋转四元数
 * 			scale: 缩放向量
 *
 * 算法原理 (Quaternion to Rotation Matrix + TRS Compose):
 * 		单位四元数 q = (x, y, z, w) 对应的 3x3 旋转矩阵 R:
 *   		R = | 1 - 2 · (y² + z²)   2 · (xy - wz)    2 · (xz + wy)    |
 *       		| 2 · (xy + wz)       1 - 2 · (x² + z²)   2 · (yz - wx)    |
 *       		| 2 · (xz - wy)       2 · (yz + wx)    1 - 2 ·(x² + y²) |
 *
 * 		利用 x2 = 2x, y2 = 2y, z2 = 2z 预计算减少乘法次数:
 *   		xx = x · x2, xy = x · y2, xz = x · z2
 *   		yy = y · y2, yz = y · z2, zz = z · z2
 *   		wx = w · x2, wy = w · y2, wz = w · z2
 *
 * 		最终矩阵 M = T · R · S(列主序存储):
 * 			- 前三列为旋转矩阵各列乘以对应轴的缩放因子
 * 			- 第四列为平移分量
 * 			- 最后一行为 [0, 0, 0, 1] (齐次坐标)
 */
function QuaternionCompose(position: Vector3, quaternion: Quaternion, scale: Vector3): Array<number> {
	const array: Array<number> = new Array(16)
	const x: number = quaternion.x
	const y: number = quaternion.y
	const z: number = quaternion.z
	const w: number = quaternion.w
	/**
	 * 预计算 2倍 值, 减少后续重复乘法(共享中间结果优化)
	 */
	const x2: number = x + x // 2x
	const y2: number = y + y // 2y
	const z2: number = z + z // 2z
	/**
	 * 计算旋转矩阵所需的 9 个中间项
	 **/
	/**
	 * 2x²
	 */
	const xx: number = x * x2
	/**
	 * 2xy
	 */
	const xy: number = x * y2
	/**
	 * 2xz
	 */
	const xz: number = x * z2
	/**
	 * 2y²
	 */
	const yy: number = y * y2
	/**
	 * 2yz
	 */
	const yz: number = y * z2
	/**
	 * 2z²
	 */
	const zz: number = z * z2
	/**
	 * 2wx
	 */
	const wx: number = w * x2
	/**
	 * 2wy
	 */
	const wy: number = w * y2
	/**
	 * 2wz
	 */
	const wz: number = w * z2
	/**
	 * 缩放分量
	 */
	const sx: number = scale.x
	const sy: number = scale.y
	const sz: number = scale.z
	/**
	 * 列主序矩阵: array[col * 4 + row]
	 */
	/**
	 * 第 1 列 (X 轴方向) × scaleX
	 */
	array[0] = (1 - (yy + zz)) * sx
	array[1] = (xy + wz) * sx
	array[2] = (xz - wy) * sx
	array[3] = 0
	/**
	 * 第 2 列 (Y 轴方向) × scaleY
	 */
	array[4] = (xy - wz) * sy
	array[5] = (1 - (xx + zz)) * sy
	array[6] = (yz + wx) * sy
	array[7] = 0
	/**
	 * 第 3 列 (Z 轴方向) × scaleZ
	 */
	array[8] = (xz + wy) * sz
	array[9] = (yz - wx) * sz
	array[10] = (1 - (xx + yy)) * sz
	array[11] = 0
	/**
	 * 第 4 列(平移分量)
	 */
	array[12] = position.x
	array[13] = position.y
	array[14] = position.z
	array[15] = 1
	return array
}
