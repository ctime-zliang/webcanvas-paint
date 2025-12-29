import { BBox2 } from '../../../../engine/algorithm/geometry/bbox/BBox2'

export abstract class ElementModelBase {
	constructor() {}

	public abstract isInGraphical(...args: Array<any>): boolean

	public abstract updateBBox2(...args: Array<any>): BBox2
}
