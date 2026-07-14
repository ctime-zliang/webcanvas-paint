import { BBox2 } from '../../../../engine/algorithm/geometry/bbox/BBox2'
import { Vector2 } from '../../../../engine/algorithm/geometry/vector/Vector2'

export abstract class D2ElementModelBase {
	constructor() {}

	public abstract isInGraphical(...args: Array<any>): boolean

	public abstract getBBox2(): BBox2

	public abstract updatePosition(value: Vector2): void
	public abstract updateRotation(value: number): void
	public abstract updateIsFlipX(value: boolean): void
	public abstract updateIsFlipY(value: boolean): void
	public abstract updateBBox2(...args: Array<any>): BBox2
}
