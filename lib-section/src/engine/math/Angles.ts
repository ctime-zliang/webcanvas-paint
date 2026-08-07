import { Matrix3 } from '../algorithm/geometry/matrix/Matrix3'
import { Matrix4 } from '../algorithm/geometry/matrix/Matrix4'
import { Vector2 } from '../algorithm/geometry/vector/Vector2'

export class Angles {
	public static PIx2: number = Math.PI * 2
	public static PI_2: number = Math.PI / 2
	public static PI_4: number = Math.PI / 4

	/**
	 * 将角度(弧度)限制到 [0, 2π] 范围内
	 *
	 * 算法原理:
	 *   	- 如果 angle 已在 [0, 2π] 范围内, 直接返回
	 *   	- 否则使用取模运算将角度映射到标准范围
	 *   	- 若结果为负数, 加上 2π 使其为正
	 */
	public static limitAngularRange(angle: number): number {
		if (angle >= 0 && angle <= Math.PI * 2) {
			return angle
		}
		let angle2: number = angle % (Math.PI * 2)
		if (angle2 < 0) {
			angle2 += Math.PI * 2
		}
		return angle2
	}

	/**
	 * 弧度转角度
	 *
	 * 数学公式:
	 * 		degree = radian × (180 / π)
	 */
	public static radianToDegree(radian: number): number {
		return (radian * 180) / Math.PI
	}

	/**
	 * 角度转弧度
	 *
	 * 数学公式:
	 * 		radian = degree × (π / 180)
	 */
	public static degreeToRadian(degree: number): number {
		return (degree / 180) * Math.PI
	}

	/**
	 * 将角度规范化到 [0°, 360°) 范围
	 *
	 * 算法原理:
	 *   	- degree % 360 将角度映射到 (-360, 360)
	 *   	- 若为负数, 加 360 使其为正
	 *   	- 若恰好等于 360, 返回 0 (开区间上界)
	 */
	public static regularDegress(degree: number): number {
		let dg: number = degree % 360
		dg = dg < 0.0 ? 360 + dg : dg
		return dg === 360 ? 0 : dg
	}

	/**
	 * 将弧度规范化到 [0, 2π) 范围
	 *
	 * 算法原理:
	 * 		- 同 regularDegress, 但工作在弧度域
	 */
	public static regularRadian(radian: number): number {
		let rd: number = radian % Angles.PIx2
		rd = rd < 0.0 ? Angles.PIx2 + rd : rd
		return rd === Angles.PIx2 ? 0 : rd
	}

	/**
	 * 弧度规范化(等价于 regularRadian 的简洁实现)
	 */
	public static normalizeRadian(radian: number): number {
		const tau: number = Math.PI * 2
		radian %= tau
		if (radian < 0) {
			radian += tau
		}
		return radian
	}

	/**
	 * 将弧度对齐到最近的 π / 2 (90°) 整数倍
	 *
	 * 算法原理:
	 *   	- 加 π / 4 偏移(半个步长), 使四舍五入生效
	 *   	- 除以 π / 2 得到象限索引(含浮点值)
	 *   	- 取整后乘回 π / 2 得到对齐值
	 *   	- 规范化到 [0, 2π)
	 */
	public static toQuarterRadian(radian: number): number {
		return Angles.regularRadian(Math.round(radian / Angles.PI_2) * Angles.PI_2)
	}

	/**
	 * 将角度对齐到最近的 90° 整数倍
	 *
	 * 算法原理:
	 *   	- 加 45° 偏移(半个步长)
	 *   	- 除以 90, 取整(| 0 截断)
	 *   	- 乘以 90 得到对齐值
	 *   	- 规范化到 [0°, 360°)
	 */
	public static toQuarterDegree(degree: number): number {
		return Angles.regularDegress((((degree + 45) / 90) | 0) * 90)
	}

	/**
	 * 将弧度通过 3 x 3 仿射矩阵进行变换
	 *
	 * 算法原理:
	 *   	- 将弧度转换为单位方向向量 (cos, sin)
	 *   	- 从矩阵中提取平移分量作为原点 p1
	 *   	- 将方向向量通过矩阵变换得到 p2
	 *   	- 计算 p2 相对于 p1 的角度
	 */
	public static transform(radian: number, matrix3: Matrix3): number {
		const cosV: number = Math.cos(radian)
		const sinV: number = Math.sin(radian)
		const p1: Vector2 = new Vector2(matrix3.data[6], matrix3.data[7])
		const p2: Vector2 = new Vector2(cosV, sinV).multiplyMatrix3(matrix3)
		return Angles.regularRadian(p2.getRadianByVector2(p1))
	}

	/**
	 * 计算弧度在经过 4 x 4 或 3 x 3 旋转矩阵变换后的新弧度
	 *
	 * 算法原理:
	 *   	- 将弧度转为方向向量 (cosV, sinV)
	 *   	- 仅取矩阵的旋转/缩放部分(左上 2 x 2 子矩阵)进行变换:
	 *      	x' = cos(θ) * m[0] + sin(θ) * m[4]
	 *      	y' = cos(θ) * m[1] + sin(θ) * m[5]
	 *   	- 归一化后用 atan2 得到变换后的弧度
	 */
	public calcRotationMatrix4(radian: number, matrix: Matrix4 | Matrix3): number {
		const cosV: number = Math.cos(radian)
		const sinV: number = Math.sin(radian)
		const x: number = cosV * matrix.data[0] + sinV * matrix.data[4]
		const y: number = cosV * matrix.data[1] + sinV * matrix.data[5]
		const v: Vector2 = new Vector2(x, y).normalize()
		return Math.atan2(v.y, v.x)
	}
}
