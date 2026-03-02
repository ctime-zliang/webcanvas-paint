import { Matrix3 } from '../algorithm/geometry/matrix/Matrix3'
import { Matrix4 } from '../algorithm/geometry/matrix/Matrix4'
import { Vector2 } from '../algorithm/geometry/vector/Vector2'

export class Angles {
	public static PIx2: number = Math.PI * 2
	public static PI_2: number = Math.PI / 2
	public static PI_4: number = Math.PI / 4

	public static limitAngularRange(angle: number): number {
		if (angle >= 0 && angle <= Math.PI * 2) {
			return angle
		}
		let angle2: number = (angle % Math.PI) * 2
		if (angle2 < 0) {
			angle2 += Math.PI * 2
		}
		return angle2
	}

	public static radianToDegree(radian: number): number {
		return (radian * 180) / Math.PI
	}

	public static degreeToRadian(degree: number): number {
		return (degree / 180) * Math.PI
	}

	public static regularDegress(degree: number): number {
		let dg: number = degree % 360
		dg = dg < 0.0 ? 360 + dg : dg
		return dg === 360 ? 0 : dg
	}

	public static regularRadian(radian: number): number {
		let rd: number = radian % Angles.PIx2
		rd = rd < 0.0 ? Angles.PIx2 + rd : rd
		return rd === Angles.PIx2 ? 0 : rd
	}

	public static toQuarterRadian(radian: number): number {
		return Angles.regularRadian(((radian + Angles.PI_4) / Angles.PI_2) * Angles.PI_2)
	}

	public static toQuarterDegree(degree: number): number {
		return Angles.regularDegress(((degree + 45 / 90) | 0) * 90)
	}

	public static transform(radian: number, matrix3: Matrix3): number {
		const cosV: number = Math.cos(radian)
		const sinV: number = Math.sin(radian)
		const p1: Vector2 = new Vector2(matrix3.data[6], matrix3.data[7])
		const p2: Vector2 = new Vector2(cosV, sinV).multiplyMatrix3(matrix3)
		return Angles.regularRadian(p2.getRadianByVector2(p1))
	}

	/**
	 * 计算初始弧度 radian 在经过旋转矩阵 matrix 变换后得到的弧度
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
