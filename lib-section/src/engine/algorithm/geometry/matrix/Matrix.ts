import { arrayCopy } from '../../../utils/Utils'
import { Matrix3 } from './Matrix3'

export class Matrix {
	/**
	 * 计算矩阵 A 与矩阵 B 的乘积
	 * 		mA - 矩阵 A 的行数
	 * 		nA - 矩阵 A 的列数
	 * 		mB - 矩阵 B 的行数
	 * 		nB - 矩阵 B 的列数
	 */
	public static matrixMul(mA: number, nA: number, mB: number, nB: number, A: Array<number>, B: Array<number>): Array<number> {
		if (nA !== mB) {
			throw new Error('does not satisfy the condition of matrix multiplication: nA === mB')
		}
		const result: Array<number> = new Array(mA * nB)
		let ri: number = 0
		let ai: number = 0
		/**
		 * 遍历矩阵 A 的行
		 */
		for (let riA: number = 0; riA < mA; riA++) {
			/**
			 * 遍历矩阵 B 的列
			 */
			for (let ciB: number = 0; ciB < nB; ciB++) {
				let bi: number = ciB
				let sum: number = 0
				/**
				 * 遍历矩阵 A 的列
				 */
				for (let ciA: number = 0; ciA < nA; ciA++) {
					sum += A[ai + ciA] * B[bi]
					bi += nB
				}
				result[ri++] = sum
			}
			ai += nA
		}
		return result
	}

	/**
	 * 依据某个数值在矩阵中的"坐标"参数, 获取其在数组中的真实索引
	 *      例如
	 *          A =
	 * 			    1  2  3
	 *    		    4  5  6
	 *      需要获取矩阵 A 中第 2 行第 2 列的项(item = 5)在数组中的索引
	 *      即 index = Matrix.matrixAt(3, 1, 1)
	 */
	public static matrixAt(colLen: number, rowIndex: number, columnIndex: number): number {
		return colLen * rowIndex + columnIndex
	}

	public static getMatrixRankResult(
		matrixArr: Array<number>,
		rowLen: number,
		colLen: number
	): {
		rank: number
		updatedMatrixArr: Array<number>
	} {
		const copyMatrixArr: Array<number> = matrixArr.slice(0)
		let rank: number = Math.min(rowLen, colLen)
		for (let ri: number = 0; ri < rowLen; ri++) {
			if (copyMatrixArr[Matrix.matrixAt(colLen, ri, ri)] === 0) {
				let tmp: Array<number> = new Array(colLen)
				let ci: number = 0
				for (ci = ri; ci < rowLen; ci++) {
					if (copyMatrixArr[Matrix.matrixAt(colLen, ci, ri)] !== 0) {
						arrayCopy(copyMatrixArr, Matrix.matrixAt(colLen, ci, 0), tmp, 0, colLen)
						arrayCopy(copyMatrixArr, Matrix.matrixAt(colLen, ri, 0), copyMatrixArr, Matrix.matrixAt(colLen, ci, 0), colLen)
						arrayCopy(tmp, 0, copyMatrixArr, Matrix.matrixAt(colLen, ri, 0), colLen)
						break
					}
				}
				if (ci >= rowLen) {
					rank -= 1
				}
			}
			if (rank < rowLen) {
				continue
			}
			for (let rii: number = 0; rii < rowLen; rii++) {
				if (rii === ri) {
					continue
				}
				let multiplier: number = copyMatrixArr[Matrix.matrixAt(colLen, rii, ri)] / copyMatrixArr[Matrix.matrixAt(colLen, ri, ri)]
				for (let cii: number = 0; cii < colLen; cii++) {
					copyMatrixArr[Matrix.matrixAt(colLen, rii, cii)] -= copyMatrixArr[Matrix.matrixAt(colLen, ri, cii)] * multiplier
				}
			}
		}
		return {
			rank,
			updatedMatrixArr: copyMatrixArr,
		}
	}

	private _m: number
	private _n: number
	private _data: Array<number>
	constructor(m: number, n: number, data: Array<number>) {
		this._m = m
		this._n = n
		this._data = data
	}

	public get m(): number {
		return this._m
	}

	public get n(): number {
		return this._n
	}

	public get data(): Array<number> {
		return this._data
	}

	/**
	 * 将当前矩阵与矩阵 B 相乘
	 */
	public multiply(B: Matrix): Matrix {
		const resultMatrixArr: Array<number> = Matrix.matrixMul(this.m, this.n, B.m, B.n, this.data, B.data)
		return new Matrix(this.m, B.n, resultMatrixArr)
	}

	/**
	 * 计算当前矩阵的秩
	 */
	public getMatrixRankResult(): number {
		return Matrix.getMatrixRankResult(this.data, this.m, this.n).rank
	}

	/**
	 * 计算当前矩阵(满足条件时)的逆矩阵
	 */
	public getInverseMatrix(): Matrix {
		const matrixArr: Array<number> = this.data.slice(0)
		if (this.m !== this.n) {
			throw new Error(`getInverseMatrix error: this.m !== this.n`)
		}
		const expandColLen: number = this.n * 2
		const newMatrixArr: Array<number> = new Array(this.m * this.n).fill(0)
		let expandMatrixArr: Array<number> = this.initExpandMatrix(matrixArr)
		const { rank, updatedMatrixArr } = Matrix.getMatrixRankResult(expandMatrixArr, this.m, expandColLen)
		expandMatrixArr = updatedMatrixArr
		if (rank !== this.m) {
			throw new Error(`getInverseMatrix error: rank !== this.m`)
		}
		expandMatrixArr = this.inverseMatrix(expandMatrixArr, this.m, expandColLen)
		for (let ri: number = 0; ri < this.m; ri++) {
			for (let ci: number = this.n; ci < expandColLen; ci++) {
				newMatrixArr[Matrix.matrixAt(this.n, ri, ci - this.n)] = expandMatrixArr[Matrix.matrixAt(expandColLen, ri, ci)]
			}
		}
		return new Matrix(this.m, this.n, newMatrixArr.slice(0))
	}

	public hashCode(): number {
		let sum: number = 0
		for (let num of this.data) {
			sum += num
		}
		return sum
	}

	/**
	 * 以平铺模式生成矩阵字符串值
	 */
	public toString(): string {
		let b: Array<string> = []
		b.push(`Matrix (`)
		for (let i: number = 0; i < this.data.length; i++) {
			b.push(String(this.data[i]))
			if (i >= this.data.length - 1) {
				continue
			}
			b.push(', ')
		}
		b.push(`)`)
		return b.join('')
	}

	/**
	 * 以格式化模式生成矩阵字符串值
	 */
	public toStringFormat(): string {
		let b: Array<string> = []
		b.push(`Matrix (`)
		b.push(String(this.m))
		b.push(` x `)
		b.push(String(this.n))
		b.push(`)`)
		let idx: number = 0
		for (let i: number = 0; i < this.m; i++) {
			for (let j: number = 0; j < this.n; j++) {
				let d: string = String(this.data[idx++])
				if (j === 0) {
					b.push(`\n`)
					b.push(`\t`)
					b.push(d)
					continue
				}
				b.push(', ')
				b.push(d)
			}
		}
		return b.join('')
	}

	/**
	 * 矩阵转置
	 */
	public transpose(): Matrix {
		const colLen: number = this.n
		const rowLen: number = this.m
		const transposeArr: Array<number> = []
		for (let ci: number = 0; ci <= colLen - 1; ci++) {
			for (let ri: number = 0; ri <= rowLen - 1; ri++) {
				const index: number = ci + ri * colLen
				transposeArr.push(this.data[index])
			}
		}
		return new Matrix(this.n, this.m, transposeArr)
	}

	public equals(matrix: Object): boolean {
		if (matrix === null) {
			return false
		}
		if (this === matrix) {
			return true
		}
		if (matrix instanceof Matrix3) {
			if (this.m !== matrix.m) {
				return false
			}
			if (this.n !== matrix.n) {
				return false
			}
			let isEqual: boolean = true
			loop1: for (let i: number = 0; i < this.data.length; i++) {
				for (let j: number = 0; j < matrix.data.length; j++) {
					if (this.data[i] !== matrix.data[j]) {
						isEqual = false
						break loop1
					}
				}
			}
			return isEqual
		}
		return false
	}

	private initExpandMatrix(matrixArr: Array<number>): Array<number> {
		const rowLen: number = this.m
		const colLen: number = this.n
		const expandColLen: number = this.n * 2
		const expandMatrixArr: Array<number> = new Array(rowLen * expandColLen)
		for (let ri: number = 0; ri < rowLen; ri++) {
			for (let ci: number = 0; ci < expandColLen; ci++) {
				if (ci < colLen) {
					expandMatrixArr[Matrix.matrixAt(expandColLen, ri, ci)] = matrixArr[Matrix.matrixAt(colLen, ri, ci)]
					continue
				}
				if (ci === rowLen + ri) {
					expandMatrixArr[Matrix.matrixAt(expandColLen, ri, ci)] = 1
					continue
				}
				expandMatrixArr[Matrix.matrixAt(expandColLen, ri, ci)] = 0
			}
		}
		return expandMatrixArr
	}

	private inverseMatrix(expandMatrixArr: Array<number>, rowLen: number, colLen: number): Array<number> {
		const copyExpandMatrixArr: Array<number> = expandMatrixArr.slice(0)
		for (let ri: number = 0; ri < rowLen; ri++) {
			let firstItem: number = copyExpandMatrixArr[Matrix.matrixAt(colLen, ri, ri)]
			for (let ci: number = 0; ci < colLen; ci++) {
				copyExpandMatrixArr[Matrix.matrixAt(colLen, ri, ci)] /= firstItem
			}
		}
		return copyExpandMatrixArr
	}
}
