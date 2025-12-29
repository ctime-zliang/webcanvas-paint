import { DoubleKit } from '../../../math/Doublekit'
import { Vector2 } from '../vector/Vector2'

export type TBBox2JSON = {
	minX: number
	minY: number
	maxX: number
	maxY: number
}

export class BBox2Fac {
	private _minX: number
	private _maxX: number
	private _minY: number
	private _maxY: number
	constructor() {
		this._minX = Number.POSITIVE_INFINITY
		this._maxX = Number.NEGATIVE_INFINITY
		this._minY = Number.POSITIVE_INFINITY
		this._maxY = Number.NEGATIVE_INFINITY
	}

	public extendByBBox2(bbox2: BBox2): BBox2Fac {
		this._minX = Math.min(this._minX, bbox2.minX)
		this._maxX = Math.max(this._maxX, bbox2.maxX)
		this._minY = Math.min(this._minY, bbox2.minY)
		this._maxY = Math.max(this._maxY, bbox2.maxY)
		return this
	}

	public extendByVector2(point: Vector2): BBox2Fac {
		this._minX = Math.min(this._minX, point.x)
		this._maxX = Math.max(this._maxX, point.x)
		this._minY = Math.min(this._minY, point.y)
		this._maxY = Math.max(this._maxY, point.y)
		return this
	}

	public extendByValue(x: number, y: number): BBox2Fac {
		this._minX = Math.min(this._minX, x)
		this._maxX = Math.max(this._maxX, x)
		this._minY = Math.min(this._minY, y)
		this._maxY = Math.max(this._maxY, y)
		return this
	}

	public extendByOffset(offset: number): BBox2Fac {
		if (offset < 0) {
			const s: number = offset * 2
			if (s < this._minX - this._maxX || s < this._minY - this._maxY) {
				throw new Error(`beyond boundary limits.`)
			}
		}
		this._minX -= offset
		this._maxX += offset
		this._minY -= offset
		this._maxY += offset
		return this
	}

	public build(): BBox2 {
		if (!this.isValid()) {
			return new BBox2(0, 0, 0, 0)
		}
		return new BBox2(this._minX, this._maxX, this._minY, this._maxY)
	}

	private isValid(): boolean {
		return Number.isFinite(this._minX) && Number.isFinite(this._maxX) && Number.isFinite(this._minY) && Number.isFinite(this._maxY)
	}
}

export class BBox2 {
	public static extend1(bbox2: BBox2, point: Vector2): BBox2 {
		if (!bbox2) {
			return new BBox2(point.x, point.x, point.y, point.y)
		}
		const minX: number = Math.min(bbox2.minX, point.x)
		const maxX: number = Math.max(bbox2.maxX, point.x)
		const minY: number = Math.min(bbox2.minY, point.y)
		const maxY: number = Math.max(bbox2.maxY, point.y)
		return new BBox2(minX, maxX, minY, maxY)
	}

	public static extend2(bbox2_1: BBox2, bbox2_2: BBox2): BBox2 {
		const minX: number = Math.min(bbox2_1.minX, bbox2_2.minX)
		const maxX: number = Math.max(bbox2_1.maxX, bbox2_2.maxX)
		const minY: number = Math.min(bbox2_1.minY, bbox2_2.minY)
		const maxY: number = Math.max(bbox2_1.maxY, bbox2_2.maxY)
		return new BBox2(minX, maxX, minY, maxY)
	}

	public static extend3(point1: Vector2, point2: Vector2): BBox2 {
		const minX: number = Math.min(point1.x, point2.x)
		const maxX: number = Math.max(point1.x, point2.x)
		const minY: number = Math.min(point1.y, point2.y)
		const maxY: number = Math.max(point1.y, point2.y)
		return new BBox2(minX, maxX, minY, maxY)
	}

	public static extend4(center: Vector2, width: number, height: number): BBox2 {
		const p1: Vector2 = center.add(new Vector2(-width / 2, -height / 2))
		const p2: Vector2 = center.add(new Vector2(width / 2, height / 2))
		return BBox2.extend3(p1, p2)
	}

	public static isValid(bbox2: BBox2): boolean {
		return Number.isFinite(bbox2.minX) && Number.isFinite(bbox2.minY) && Number.isFinite(bbox2.maxX) && Number.isFinite(bbox2.maxY)
	}

	public static createByJSONData(jsonData: TBBox2JSON): BBox2 {
		return new BBox2(jsonData.minX, jsonData.minY, jsonData.maxX, jsonData.maxY)
	}

	private readonly _data: Float64Array
	private _minX: number
	private _minY: number
	private _maxX: number
	private _maxY: number
	constructor(minX: number, minY: number, maxX: number, maxY: number) {
		this._data = new Float64Array(4)
		if (minX > maxX) {
			minX = [maxX, (maxX = minX)][0]
		}
		if (minY > maxY) {
			minY = [maxY, (maxY = minY)][0]
		}
		this._minX = minX
		this._minY = minY
		this._maxX = maxX
		this._maxY = maxY
	}

	public get minX(): number {
		return this._minX
	}
	public set minX(value: number) {
		this._minX = value
	}

	public get minY(): number {
		return this._minY
	}
	public set minY(value: number) {
		this._minX = value
	}

	public get maxX(): number {
		return this._maxX
	}
	public set maxX(value: number) {
		this._maxX = value
	}

	public get maxY(): number {
		return this._maxY
	}
	public set maxY(value: number) {
		this._maxY = value
	}

	public get width(): number {
		return this.maxX - this.minX
	}

	public get height(): number {
		return this.maxY - this.minY
	}

	public get area(): number {
		return this.width * this.height
	}

	/**
	 * 左上
	 */
	public get UpperLeftPoint(): Vector2 {
		return new Vector2(this.minX, this.maxY)
	}
	/**
	 * 右上
	 */
	public get UpperRightPoint(): Vector2 {
		return new Vector2(this.maxX, this.maxY)
	}
	/**
	 * 左下
	 */
	public get LowerLeftPoint(): Vector2 {
		return new Vector2(this.minX, this.minY)
	}
	/**
	 * 右下
	 */
	public get LowerRightPoint(): Vector2 {
		return new Vector2(this.maxX, this.minY)
	}

	public get CenterPoint(): Vector2 {
		return new Vector2(this.maxX - (this.maxX - this.minX) / 2, this.maxY - (this.maxY - this.minY) / 2)
	}

	public get data(): Float64Array {
		this._data[0] = this.minX
		this._data[1] = this.minY
		this._data[2] = this.maxX
		this._data[3] = this.maxY
		return this._data
	}

	/**
	 * 判断当前 BBox2 实例是否包裹了传入的 vector2
	 */
	public isContainsPoint(vector2: Vector2): boolean {
		return this.isContainsX(vector2.x) && this.isContainsY(vector2.y)
	}

	/**
	 * 判断当前 BBox2 实例是否包裹了传入的 bbox2
	 */
	public isConatinsBBox2(bbox2: BBox2): boolean {
		return this.maxX >= bbox2.maxX && this.minX <= bbox2.minX && this.maxY >= bbox2.maxY && this.minY <= bbox2.minY
	}

	/**
	 * 判断传入的 bbox2 是否包裹了当前 BBox2 实例
	 */
	public isBeWrappedByBBox2(bbox2: BBox2): boolean {
		return this.minX >= bbox2.minX && this.maxX <= bbox2.maxX && this.minY >= bbox2.minY && this.maxY <= bbox2.maxY
	}

	/**
	 * 判断当前 BBox2 实例与传入的 bbox2 边界范围是否相等
	 */
	public equals(bbox2: BBox2): boolean {
		if (this.minX === bbox2.minX && this.minY === bbox2.minY && this.maxX === bbox2.maxX && this.maxY === bbox2.maxY) {
			return true
		}
		return false
	}

	/**
	 * 判断当前 BBox2 实例与传入的 bbox2 边界范围是否交叉
	 */
	public isIntersect(bbox2: BBox2): boolean {
		const _minX: number = Math.max(this.minX, bbox2.minX)
		const _maxX: number = Math.max(this.maxX, bbox2.maxX)
		if (_minX > _maxX) {
			return false
		}
		const _minY: number = Math.max(this.minY, bbox2.minY)
		const _maxY: number = Math.max(this.maxY, bbox2.maxY)
		if (_minY > _maxY) {
			return false
		}
		return true
	}

	/**
	 * 求当前 BBox2 实例与传入的 bbox2 的交叉范围构成的 BBox2
	 */
	public getIntersection(bbox2: BBox2): BBox2 {
		let minX: number = Math.max(this.minX, bbox2.minX)
		let maxX: number = Math.min(this.maxX, bbox2.maxX)
		if (DoubleKit.greater(minX, maxX)) {
			return null!
		}
		if (minX > maxX) {
			maxX = minX
		}
		let minY: number = Math.max(this.minY, bbox2.minY)
		let maxY: number = Math.min(this.maxY, bbox2.maxY)
		if (DoubleKit.greater(minY, maxY)) {
			return null!
		}
		if (minY > maxY) {
			maxY = minY
		}
		return new BBox2(minX, minY, maxX, maxY)
	}

	public extendByDist(dist: number): BBox2 {
		if (dist >= 0) {
			return new BBox2(this.minX - dist, this.minY - dist, this.maxX + dist, this.maxY + dist)
		}
		const minSize: number = Math.min(this.maxX - this.minX, this.maxY - this.minY)
		const iDist: number = Math.abs(dist <= -minSize / 2 ? -minSize / 2 : dist)
		return new BBox2(this.minX + iDist, this.minY + iDist, this.maxX - iDist, this.maxY - iDist)
	}

	public isContainsX(x: number): boolean {
		return x >= this.minX && x <= this.maxX
	}

	public isContainsY(y: number): boolean {
		return y >= this.minY && y <= this.maxY
	}

	public zoom(ratio: number): BBox2 {
		let w: number = this.width
		let h: number = this.height
		let c: Vector2 = this.CenterPoint
		if (ratio !== 0) {
			w /= ratio / 2
			h /= ratio / 2
		}
		return new BBox2(c.x - w, c.x + w, c.y - h, c.y + h)
	}

	public reset(): void {
		this.minX = Number.POSITIVE_INFINITY
		this.maxX = Number.NEGATIVE_INFINITY
		this.minY = Number.POSITIVE_INFINITY
		this.maxY = Number.NEGATIVE_INFINITY
	}

	public toString(): string {
		return `BBox2 (${this.minX}, ${this.maxX}, ${this.minY}, ${this.maxY})`
	}

	public toJSON(): TBBox2JSON {
		return {
			minX: this.minX,
			minY: this.minY,
			maxX: this.maxX,
			maxY: this.maxY,
		}
	}
}
