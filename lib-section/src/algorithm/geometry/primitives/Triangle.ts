import { Matrix3 } from '../../../engine/algorithm/geometry/matrix/Matrix3'
import { Vector2 } from '../../../engine/algorithm/geometry/vector/Vector2'

export class Triangle {
	/**
	 * 重心
	 */
	public static getBaryCentre(p1: Vector2, p2: Vector2, p3: Vector2): Vector2 {
		const x: number = p1.x + p2.x + p3.x
		const y: number = p1.y + p2.y + p3.y
		return new Vector2(x / 3, y / 3)
	}

	/**
	 * 内心
	 */
	public static getInCentre(p1: Vector2, p2: Vector2, p3: Vector2): Vector2 {
		const l1: number = p2.sub(p3).length
		const l2: number = p1.sub(p3).length
		const l3: number = p1.sub(p2).length
		const d: number = l1 + l2 + l3
		const x: number = l1 * p1.x + l2 * p2.x + l3 * p3.x
		const y: number = l1 * p1.y + l2 * p2.y + l3 * p3.y
		return new Vector2(x / d, y / d)
	}

	public static getArea(p1: Vector2, p2: Vector2, p3: Vector2): number {
		return Math.abs(Vector2.crossProd2(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y)) / 2
	}

	private readonly _p1: Vector2
	private readonly _p2: Vector2
	private readonly _p3: Vector2
	constructor(p1: Vector2, p2: Vector2, p3: Vector2) {
		this._p1 = p1
		this._p2 = p2
		this._p3 = p3
	}

	public get p1(): Vector2 {
		return this._p1
	}

	public get p2(): Vector2 {
		return this._p2
	}

	public get p3(): Vector2 {
		return this._p3
	}

	public getBaryCentre(): Vector2 {
		return Triangle.getBaryCentre(this.p1, this.p2, this.p3)
	}

	public getInCentre(): Vector2 {
		return Triangle.getInCentre(this.p1, this.p2, this.p3)
	}

	public getArea(): number {
		return Triangle.getArea(this.p1, this.p2, this.p3)
	}

	public scaleOnBarycentre(ratio: number): Triangle {
		return this.sacle(this.getBaryCentre(), ratio)
	}

	public scaleOnIncentre(ratio: number): Triangle {
		return this.sacle(this.getInCentre(), ratio)
	}

	public extend(ext: number): Triangle {
		const incentre: Vector2 = this.getInCentre()
		const cpp: Vector2 = this.p1
			.add(this.p2)
			.sub(incentre)
			.scale(1 / 2)
		const len: number = cpp.length
		const ncpp: Vector2 = Vector2.ORIGIN.getPointOnRays(cpp, len + ext)
		return this.scaleOnIncentre(ncpp.length / len)
	}

	private sacle(center: Vector2, ratio: number): Triangle {
		const mat: Matrix3 = Matrix3.translate(-center.x, -center.y).scale(ratio, ratio).translate(center.x, center.y)
		return new Triangle(this.p1.multiplyMatrix3(mat), this.p2.multiplyMatrix3(mat), this.p3.multiplyMatrix3(mat))
	}
}
