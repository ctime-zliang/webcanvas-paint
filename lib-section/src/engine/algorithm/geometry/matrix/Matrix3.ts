import { Matrix } from './Matrix'

// prettier-ignore
const VEN$MATRIX3_ORIGIN_DATA: Array<number> = [
	1, 0, 0, 
	0, 1, 0, 
	0, 0, 1
]

export class Matrix3 extends Matrix {
	public static ORIGIN = new Matrix3()
	// prettier-ignore
	public static readonly MIRROR_X = new Matrix3([
		-1, 0, 0, 
		0,  1, 0, 
		0,  0, 1
	])
	// prettier-ignore
	public static readonly MIRROR_Y = new Matrix3([
		1, 0,  0, 
		0, -1, 0, 
		0, 0,  1
	])
	// prettier-ignore
	public static readonly ROT_90 = new Matrix3([
		0,  1, 0, 
		-1, 0, 0, 
		0,  0, 1
	])
	// prettier-ignore
	public static readonly ROT_N90 = new Matrix3([
		0, -1, 0, 
		1, 0,  0, 
		0, 0,  1
	])

	public static translate(xOff: number, yOff: number): Matrix3 {
		// prettier-ignore
		return new Matrix3([
			1,    0,    0, 
			0,    1,    0, 
			xOff, yOff, 1
		])
	}

	public static rotate(radian: number): Matrix3 {
		const cosV: number = Math.cos(radian)
		const sinV: number = Math.sin(radian)
		// prettier-ignore
		return new Matrix3([
			cosV,  sinV, 0, 
			-sinV, cosV, 0, 
			0,     0,    1
		])
	}

	public static scale(xR: number, yR: number): Matrix3 {
		// prettier-ignore
		return new Matrix3([
			xR, 0,  0, 
			0,  yR, 0, 
			0,  0,  1
		])
	}

	private _iScale: number
	private _jScale: number
	constructor(data: Array<number> = [...VEN$MATRIX3_ORIGIN_DATA]) {
		super(3, 3, data)
		const a: number = this.data[0]
		const b: number = this.data[3]
		const d: number = this.data[1]
		const e: number = this.data[4]
		this._iScale = Math.sqrt(a * a + d * d)
		this._jScale = Math.sqrt(b * b + e * e)
	}

	public get iScale(): number {
		return this._iScale
	}

	public get jScale(): number {
		return this._jScale
	}

	public multiply3(matrix3: Matrix3): Matrix3 {
		return new Matrix3(Matrix.matrixMul(3, 3, 3, 3, this.data, matrix3.data))
	}

	public det(): number {
		return this.data[0] * this.data[4] - this.data[3] * this.data[1]
	}

	public isMirrored(): boolean {
		return this.det() < 0
	}

	public scale(ratioX: number, ratioY: number): Matrix3 {
		return this.multiply3(Matrix3.scale(ratioX, ratioY))
	}

	public resetBy(matrix3: Matrix3): void {
		for (let i: number = 0; i < matrix3.data.length; i++) {
			this.data[i] = matrix3.data[i]
		}
	}

	public translate(xOff: number, yOff: number): Matrix3 {
		return this.multiply3(Matrix3.translate(xOff, yOff))
	}

	public setOrigin(x: number, y: number): Matrix3 {
		return Matrix3.translate(-x, -y).multiply3(this).translate(x, y)
	}

	/**
	 * 矩阵转置
	 */
	public transpose(): Matrix3 {
		return new Matrix3(super.transpose().data)
	}

	/**
	 * 计算当前矩阵(满足条件时)的逆矩阵
	 */
	public getInverseMatrix(): Matrix3 {
		return new Matrix3(super.getInverseMatrix().data)
	}
}
