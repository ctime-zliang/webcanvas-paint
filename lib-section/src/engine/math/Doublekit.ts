export class DoubleKit {
	public static eps1: number = 1e-8
	public static eps2: number = 1e-6
	public static precision: number = 1e8

	public static regular(dis: number = 0): number {
		return Math.round(dis * this.precision) / this.precision
	}

	public static eq(a: number, b: number, eps: number = this.eps1): boolean {
		return Math.abs(a - b) <= eps
	}

	public static neq(a: number, b: number, eps: number = this.eps1): boolean {
		return Math.abs(a - b) > eps
	}

	public static less(a: number, b: number, eps: number = this.eps1): boolean {
		return a - b < -eps
	}

	public static lesseq(a: number, b: number, eps: number = this.eps1): boolean {
		return a - b < eps
	}

	public static greater(a: number, b: number, eps: number = this.eps1): boolean {
		return a - b > eps
	}

	public static greatereq(a: number, b: number, eps: number = this.eps1): boolean {
		return a - b > -eps
	}

	public static sqrt(dis: number): number {
		if (Math.abs(dis) <= 1e-10) {
			return 0
		}
		return Math.sqrt(dis)
	}

	public static sortAsc(a: number, b: number): number {
		return a - b
	}

	public static sortDesc(a: number, b: number): number {
		return b - a
	}
}
