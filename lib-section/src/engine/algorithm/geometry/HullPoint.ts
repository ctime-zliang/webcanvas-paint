import { Vector2 } from './vector/Vector2'

export class HullPoint extends Vector2 {
	public static dgree(p1: Vector2, p2: Vector2): number {
		return (p2.y - p1.y) / (p2.x - p1.x)
	}

	public static sortByDgreeDesc(hp1: HullPoint, hp2: HullPoint): number {
		return hp2._degree - hp1._degree
	}
	private readonly _degree: number
	private readonly _origin: Vector2
	private readonly _dist: number
	constructor(point: Vector2, origin: Vector2) {
		super(point.x, point.y)
		this._origin = origin
		this._degree = HullPoint.dgree(origin, point)
		this._dist = origin.distance(this)
	}

	public get degree(): number {
		return this._degree
	}

	public get origin(): Vector2 {
		return this._origin
	}

	public get dist(): number {
		return this._dist
	}
}
