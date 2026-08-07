import { arrayCopy } from '../../../utils/Utils'

export class Matrix {
	/**
	 * 计算矩阵 A 与矩阵 B 的乘积 C = A × B
	 * 		输入:
	 * 			mA 矩阵 A 的行数
	 * 			nA 矩阵 A 的列数
	 * 			mB 矩阵 B 的行数(必须等于 nA)
	 * 			nB 矩阵 B 的列数
	 * 			A 矩阵 A 的行主序数据
	 * 			B 矩阵 B 的行主序数据
	 * 		返回:
	 * 			结果矩阵 C 的行主序数据
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
	 * 依据某个数值在矩阵中的"坐标"参数, 获取其在一维数组中的真实索引
	 */
	public static matrixAt(colLen: number, rowIndex: number, columnIndex: number): number {
		return colLen * rowIndex + columnIndex
	}

	/**
	 * 通过高斯-约旦消元法计算矩阵的秩
	 *
	 * 算法 - 高斯消元(部分选主元):
	 * 		- 对角线上如果为 0, 向下找非零行并交换(部分选主元)
	 * 		- 用对角线元素消去同一列的其他行(行变换使矩阵趋于行阶梯形)
	 * 		- 如果某列找不到非零主元, 秩减 1
	 *
	 * 矩阵秩的意义:
	 * 		- 秩 = 线性无关行/列的最大数量
	 * 		- 满秩(rank = min(m, n)): 矩阵可逆(方阵时)
	 * 		- 秩亏: 方程组有无穷多解或无解
	 */
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
	 *
	 * 算法 - 增广矩阵法 (Gauss - Jordan Elimination)
	 * 		- 构造增广矩阵 [A | I] (原矩阵拼接单位矩阵)
	 * 		- 对增广矩阵进行高斯-约旦消元(行变换使左半部分变为单位矩阵)
	 * 		- 消元完成后, 右半部分即为 A⁻¹
	 * 		- 最后将对角线归一化(每行除以主元)
	 *
	 * 前提条件
	 * 		- 矩阵必须为方阵 (m === n)
	 * 		- 矩阵必须满秩 (rank === m), 否则不可逆
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
	 *
	 * 定义:
	 * 			A^T[i][j] = A[j][i]
	 * 		将行变为列, 列变为行 m × n 矩阵转置后变为 n × m 矩阵
	 *
	 * 性质:
	 * 		- (A^T)^T = A
	 * 		- (AB)^T = B^T × A^T
	 * 		- 正交矩阵: A^T = A⁻¹
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
