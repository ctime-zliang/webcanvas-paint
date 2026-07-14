import { Twos } from '../../math/Twos'

const EPSILON: number = 1.1102230246251565e-16
const ERRBOUND3: number = (3.0 + 16.0 * EPSILON) * EPSILON
const ERRBOUND4: number = (7.0 + 56.0 * EPSILON) * EPSILON

function scalarScalar(a: number, b: number): Array<number> {
	let x: number = a + b
	let bv: number = x - a
	let av: number = x - bv
	let br: number = b - bv
	let ar: number = a - av
	let y: number = ar + br
	if (y) {
		return [y, x]
	}
	return [x]
}

function linearExpansionSum(e: Array<number>, f: Array<number>): Array<number> {
	let ne: number = e.length | 0
	let nf: number = f.length | 0
	if (ne === 1 && nf === 1) {
		return scalarScalar(e[0], f[0])
	}
	let n: number = ne + nf
	let g: Array<number> = new Array(n)
	let count: number = 0
	let eptr: number = 0
	let fptr: number = 0
	let ei: number = e[eptr]
	let ea: number = Math.abs(ei)
	let fi: number = f[fptr]
	let fa: number = Math.abs(fi)
	let a: number
	let b: number
	if (ea < fa) {
		b = ei
		eptr += 1
		if (eptr < ne) {
			ei = e[eptr]
			ea = Math.abs(ei)
		}
	} else {
		b = fi
		fptr += 1
		if (fptr < nf) {
			fi = f[fptr]
			fa = Math.abs(fi)
		}
	}
	if ((eptr < ne && ea < fa) || fptr >= nf) {
		a = ei
		eptr += 1
		if (eptr < ne) {
			ei = e[eptr]
			ea = Math.abs(ei)
		}
	} else {
		a = fi
		fptr += 1
		if (fptr < nf) {
			fi = f[fptr]
			fa = Math.abs(fi)
		}
	}
	let x: number = a + b
	let bv: number = x - a
	let y: number = b - bv
	let q0: number = y
	let q1: number = x
	let _x: number
	let _bv: number
	let _av: number
	let _br: number
	let _ar: number
	while (eptr < ne && fptr < nf) {
		if (ea < fa) {
			a = ei
			eptr += 1
			if (eptr < ne) {
				ei = e[eptr]
				ea = Math.abs(ei)
			}
		} else {
			a = fi
			fptr += 1
			if (fptr < nf) {
				fi = f[fptr]
				fa = Math.abs(fi)
			}
		}
		b = q0
		x = a + b
		bv = x - a
		y = b - bv
		if (y) {
			g[count++] = y
		}
		_x = q1 + x
		_bv = _x - q1
		_av = _x - _bv
		_br = x - _bv
		_ar = q1 - _av
		q0 = _ar + _br
		q1 = _x
	}
	while (eptr < ne) {
		a = ei
		b = q0
		x = a + b
		bv = x - a
		y = b - bv
		if (y) {
			g[count++] = y
		}
		_x = q1 + x
		_bv = _x - q1
		_av = _x - _bv
		_br = x - _bv
		_ar = q1 - _av
		q0 = _ar + _br
		q1 = _x
		eptr += 1
		if (eptr < ne) {
			ei = e[eptr]
		}
	}
	while (fptr < nf) {
		a = fi
		b = q0
		x = a + b
		bv = x - a
		y = b - bv
		if (y) {
			g[count++] = y
		}
		_x = q1 + x
		_bv = _x - q1
		_av = _x - _bv
		_br = x - _bv
		_ar = q1 - _av
		q0 = _ar + _br
		q1 = _x
		fptr += 1
		if (fptr < nf) {
			fi = f[fptr]
		}
	}
	if (q0) {
		g[count++] = q0
	}
	if (q1) {
		g[count++] = q1
	}
	if (!count) {
		g[count++] = 0.0
	}
	g.length = count
	return g
}

function robustSubtract(e: Array<number>, f: Array<number>): Array<number> {
	let ne: number = e.length | 0
	let nf: number = f.length | 0
	if (ne === 1 && nf === 1) {
		return scalarScalar(e[0], -f[0])
	}
	let n: number = ne + nf
	let g: Array<number> = new Array(n)
	let count: number = 0
	let eptr: number = 0
	let fptr: number = 0
	let ei: number = e[eptr]
	let ea: number = Math.abs(ei)
	let fi: number = -f[fptr]
	let fa: number = Math.abs(fi)
	let a: number
	let b: number
	if (ea < fa) {
		b = ei
		eptr += 1
		if (eptr < ne) {
			ei = e[eptr]
			ea = Math.abs(ei)
		}
	} else {
		b = fi
		fptr += 1
		if (fptr < nf) {
			fi = -f[fptr]
			fa = Math.abs(fi)
		}
	}
	if ((eptr < ne && ea < fa) || fptr >= nf) {
		a = ei
		eptr += 1
		if (eptr < ne) {
			ei = e[eptr]
			ea = Math.abs(ei)
		}
	} else {
		a = fi
		fptr += 1
		if (fptr < nf) {
			fi = -f[fptr]
			fa = Math.abs(fi)
		}
	}
	let x: number = a + b
	let bv: number = x - a
	let y: number = b - bv
	let q0: number = y
	let q1: number = x
	let _x: number
	let _bv: number
	let _av: number
	let _br: number
	let _ar: number
	while (eptr < ne && fptr < nf) {
		if (ea < fa) {
			a = ei
			eptr += 1
			if (eptr < ne) {
				ei = e[eptr]
				ea = Math.abs(ei)
			}
		} else {
			a = fi
			fptr += 1
			if (fptr < nf) {
				fi = -f[fptr]
				fa = Math.abs(fi)
			}
		}
		b = q0
		x = a + b
		bv = x - a
		y = b - bv
		if (y) {
			g[count++] = y
		}
		_x = q1 + x
		_bv = _x - q1
		_av = _x - _bv
		_br = x - _bv
		_ar = q1 - _av
		q0 = _ar + _br
		q1 = _x
	}
	while (eptr < ne) {
		a = ei
		b = q0
		x = a + b
		bv = x - a
		y = b - bv
		if (y) {
			g[count++] = y
		}
		_x = q1 + x
		_bv = _x - q1
		_av = _x - _bv
		_br = x - _bv
		_ar = q1 - _av
		q0 = _ar + _br
		q1 = _x
		eptr += 1
		if (eptr < ne) {
			ei = e[eptr]
		}
	}
	while (fptr < nf) {
		a = fi
		b = q0
		x = a + b
		bv = x - a
		y = b - bv
		if (y) {
			g[count++] = y
		}
		_x = q1 + x
		_bv = _x - q1
		_av = _x - _bv
		_br = x - _bv
		_ar = q1 - _av
		q0 = _ar + _br
		q1 = _x
		fptr += 1
		if (fptr < nf) {
			fi = -f[fptr]
		}
	}
	if (q0) {
		g[count++] = q0
	}
	if (q1) {
		g[count++] = q1
	}
	if (!count) {
		g[count++] = 0.0
	}
	g.length = count
	return g
}

function scaleLinearExpansion(e: Array<number>, scale: number) {
	let n: number = e.length
	if (n === 1) {
		let ts: Array<number> = Twos.twoProduct(e[0], scale)
		if (ts[0]) {
			return ts
		}
		return [ts[1]]
	}
	let g: Array<number> = new Array(2 * n)
	let q: Array<number> = [0.1, 0.1]
	let t: Array<number> = [0.1, 0.1]
	let count: number = 0
	Twos.twoProduct(e[0], scale, q)
	if (q[0]) {
		g[count++] = q[0]
	}
	for (let i = 1; i < n; i++) {
		Twos.twoProduct(e[i], scale, t)
		let pq = q[1]
		Twos.twoSum(pq, t[0], q)
		if (q[0]) {
			g[count++] = q[0]
		}
		let a: number = t[1]
		let b: number = q[1]
		let x: number = a + b
		let bv: number = x - a
		let y: number = b - bv
		q[1] = x
		if (y) {
			g[count++] = y
		}
	}
	if (q[1]) {
		g[count++] = q[1]
	}
	if (count === 0) {
		g[count++] = 0.0
	}
	g.length = count
	return g
}

function orientation3Exact(...args: Array<Array<number>>) {
	const m0: Array<number> = arguments[0]
	const m1: Array<number> = arguments[1]
	const m2: Array<number> = arguments[2]
	let p: Array<number> = linearExpansionSum(
		linearExpansionSum(Twos.twoProduct(m1[1], m2[0]), Twos.twoProduct(-m2[1], m1[0])),
		linearExpansionSum(Twos.twoProduct(m0[1], m1[0]), Twos.twoProduct(-m1[1], m0[0]))
	)
	let n: Array<number> = linearExpansionSum(Twos.twoProduct(m0[1], m2[0]), Twos.twoProduct(-m2[1], m0[0]))
	let d: Array<number> = robustSubtract(p, n)
	return d[d.length - 1]
}

function orientation4Exact(...args: Array<Array<number>>) {
	const m0: Array<number> = arguments[0]
	const m1: Array<number> = arguments[1]
	const m2: Array<number> = arguments[2]
	const m3: Array<number> = arguments[4]
	let p: Array<number> = linearExpansionSum(
		linearExpansionSum(
			scaleLinearExpansion(linearExpansionSum(Twos.twoProduct(m2[1], m3[0]), Twos.twoProduct(-m3[1], m2[0])), m1[2]),
			linearExpansionSum(
				scaleLinearExpansion(linearExpansionSum(Twos.twoProduct(m1[1], m3[0]), Twos.twoProduct(-m3[1], m1[0])), -m2[2]),
				scaleLinearExpansion(linearExpansionSum(Twos.twoProduct(m1[1], m2[0]), Twos.twoProduct(-m2[1], m1[0])), m3[2])
			)
		),
		linearExpansionSum(
			scaleLinearExpansion(linearExpansionSum(Twos.twoProduct(m1[1], m3[0]), Twos.twoProduct(-m3[1], m1[0])), m0[2]),
			linearExpansionSum(
				scaleLinearExpansion(linearExpansionSum(Twos.twoProduct(m0[1], m3[0]), Twos.twoProduct(-m3[1], m0[0])), -m1[2]),
				scaleLinearExpansion(linearExpansionSum(Twos.twoProduct(m0[1], m1[0]), Twos.twoProduct(-m1[1], m0[0])), m3[2])
			)
		)
	)
	let n: Array<number> = linearExpansionSum(
		linearExpansionSum(
			scaleLinearExpansion(linearExpansionSum(Twos.twoProduct(m2[1], m3[0]), Twos.twoProduct(-m3[1], m2[0])), m0[2]),
			linearExpansionSum(
				scaleLinearExpansion(linearExpansionSum(Twos.twoProduct(m0[1], m3[0]), Twos.twoProduct(-m3[1], m0[0])), -m2[2]),
				scaleLinearExpansion(linearExpansionSum(Twos.twoProduct(m0[1], m2[0]), Twos.twoProduct(-m2[1], m0[0])), m3[2])
			)
		),
		linearExpansionSum(
			scaleLinearExpansion(linearExpansionSum(Twos.twoProduct(m1[1], m2[0]), Twos.twoProduct(-m2[1], m1[0])), m0[2]),
			linearExpansionSum(
				scaleLinearExpansion(linearExpansionSum(Twos.twoProduct(m0[1], m2[0]), Twos.twoProduct(-m2[1], m0[0])), -m1[2]),
				scaleLinearExpansion(linearExpansionSum(Twos.twoProduct(m0[1], m1[0]), Twos.twoProduct(-m1[1], m0[0])), m2[2])
			)
		)
	)
	let d: Array<number> = robustSubtract(p, n)
	return d[d.length - 1]
}

/**
 * 判断点的绕转方向
 * 		orient([0, 0], [1, 0], [0, 1]) === -1  // 逆时针
 * 		orient([0, 0], [0, 1], [1, 0]) === 1  // 顺时针
 *
 * 		返回负值, 逆时针方向绕转
 * 		返回正值, 顺时针方向绕转
 * 		返回 0, 共线
 */
export function orient(...args: Array<Array<number>>): number {
	switch (arguments.length) {
		case 0: {
			return 0
		}
		case 1: {
			return 0
		}
		case 2: {
			return arguments[0] - arguments[0]
		}
		case 3: {
			const a: number = arguments[0]
			const b: number = arguments[1]
			const c: number = arguments[2]
			let l: number = (b[0] - c[0]) * (a[1] - c[1])
			let r: number = (b[1] - c[1]) * (a[0] - c[0])
			let det: number = l - r
			let s: number = undefined!
			if (l > 0) {
				if (r <= 0) {
					return det
				} else {
					s = l + r
				}
			} else if (l < 0) {
				if (r >= 0) {
					return det
				} else {
					s = -(l + r)
				}
			} else {
				return det
			}
			let tol = ERRBOUND3 * s
			if (det >= tol || det <= -tol) {
				return det
			}
			return orientation3Exact(...args)
		}
	}
	return 0
}
