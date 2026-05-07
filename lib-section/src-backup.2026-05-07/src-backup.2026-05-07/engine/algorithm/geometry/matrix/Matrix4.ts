import { Vector2 } from '../vector/Vector2'
import { Matrix } from './Matrix'
import { Matrix3 } from './Matrix3'

// prettier-ignore
const VEN$MATRIX4_ORIGIN_DATA: Array<number> = [
	1, 0, 0, 0, 
	0, 1, 0, 0, 
	0, 0, 1, 0,
	0, 0, 0, 1
]

export class Matrix4 extends Matrix {
	public static ORIGIN = new Matrix4()

	public static translate(xOff: number, yOff: number, zOff: number): Matrix4 {
		// prettier-ignore
		return new Matrix4([
			1,    0,    0,    0, 
			0,    1,    0,    0, 
			0,    0,    1,    0, 
			xOff, yOff, zOff, 1
		])
	}

	public static rotateX(radian: number): Matrix4 {
		const cosV: number = Math.cos(radian)
		const sinV: number = Math.sin(radian)
		// prettier-ignore
		return new Matrix4([
			1, 0,     0,    0, 
			0, cosV,  sinV, 0, 
			0, -sinV, cosV, 0, 
			0, 0,     0,    1
		])
	}

	public static rotateY(radian: number): Matrix4 {
		const cosV: number = Math.cos(radian)
		const sinV: number = Math.sin(radian)
		// prettier-ignore
		return new Matrix4([
			cosV, 0, -sinV, 0, 
			0,    1, 0,     0, 
			sinV, 0, cosV,  0, 
			0,    0, 0,    1
		])
	}

	public static rotateZ(radian: number): Matrix4 {
		const cosV: number = Math.cos(radian)
		const sinV: number = Math.sin(radian)
		// prettier-ignore
		return new Matrix4([
			cosV,  sinV, 0, 0, 
			-sinV, cosV, 0, 0, 
			0,     0,    1, 0, 
			0,     0,    0, 1
		])
	}

	public static rotateZForPoint(center: Vector2, radian: number): Matrix4 {
		if (center.equalsWithVector2(Vector2.ORIGIN)) {
			return Matrix4.rotateZ(radian)
		}
		return Matrix4.translate(-center.x, -center.y, 0).rotateZ(radian).translate(center.x, center.y, 0)
	}

	public static scale(xR: number, yR: number, zR: number): Matrix4 {
		// prettier-ignore
		return new Matrix4([
			xR, 0,  0,  0, 
			0,  yR, 0,  0, 
			0,  0,  zR, 0, 
			0,  0,  0,  1
		])
	}

	public static flipX(): Matrix4 {
		// prettier-ignore
		return new Matrix4([
			1, 0,  0, 0, 
			0, -1, 0, 0, 
			0, 0,  1, 0, 
			0, 0,  0, 1
		])
	}

	public static flipY(): Matrix4 {
		// prettier-ignore
		return new Matrix4([
			-1, 0, 0, 0, 
			0,  1, 0, 0, 
			0,  0, 1, 0, 
			0,  0, 0, 1
		])
	}

	public static getMatrix4(startTranslate: Vector2, endTranslate: Vector2, radian: number, scaleX: number): Matrix4 {
		const cos: number = Math.cos(radian)
		const sin: number = Math.sin(radian)
		const x: number = scaleX * (startTranslate.x * cos - startTranslate.y * sin) + endTranslate.x
		const y: number = startTranslate.x * sin + startTranslate.y * cos + endTranslate.y
		// prettier-ignore
		const data: Array<number> = [
			scaleX * cos,  sin, 0, 0, 
			-sin * scaleX, cos, 0, 0, 
			0,             0,   1, 0, 
			x,             y,   0, 1
		]
		return new Matrix4(data)
	}

	constructor(data: Array<number> = [...VEN$MATRIX4_ORIGIN_DATA]) {
		super(4, 4, data)
	}

	public multiply4(matrix4: Matrix4): Matrix4 {
		return new Matrix4(Matrix.matrixMul(4, 4, 4, 4, this.data, matrix4.data))
	}

	public toMatrix3(): Matrix3 {
		// prettier-ignore
		return new Matrix3([
			this.data[0],  this.data[1],  0, 
			this.data[4],  this.data[5],  0, 
			this.data[12], this.data[13], 1
		])
	}

	public resetBy(matrix4: Matrix4): void {
		for (let i: number = 0; i < matrix4.data.length; i++) {
			this.data[i] = matrix4.data[i]
		}
	}

	public rotateX(radian: number): Matrix4 {
		return this.multiply4(Matrix4.rotateX(radian))
	}

	public rotateY(radian: number): Matrix4 {
		return this.multiply4(Matrix4.rotateY(radian))
	}

	public rotateZ(radian: number): Matrix4 {
		return this.multiply4(Matrix4.rotateZ(radian))
	}

	public scale(xR: number, yR: number, zR: number): Matrix4 {
		return this.multiply4(Matrix4.scale(xR, yR, zR))
	}

	public translate(xOff: number, yOff: number, zOff: number): Matrix4 {
		return this.multiply4(Matrix4.translate(xOff, yOff, zOff))
	}

	public setOrigin(x: number, y: number, z: number): Matrix4 {
		return Matrix4.translate(-x, -y, -z).multiply4(this).translate(x, y, z)
	}

	/**
	 * 矩阵转置
	 */
	public transpose(): Matrix4 {
		return new Matrix4(super.transpose().data)
	}

	/**
	 * 计算当前矩阵(满足条件时)的逆矩阵
	 */
	public getInverseMatrix(): Matrix4 {
		return new Matrix4(super.getInverseMatrix().data)
	}
}
