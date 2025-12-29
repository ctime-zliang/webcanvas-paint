import { BBox2 } from '../engine/algorithm/geometry/bbox/BBox2'
import { TSimpleRect } from '../algorithm/rtree2/Rtree'
import { ElementShapeItemBase } from '../objects/shapes/primitive2d/elementBase/ElementShapeItemBase'

export class RtreeItem {
	static getSimpleRectFromBbox2(bbox2: BBox2): TSimpleRect {
		return {
			x: bbox2.minX,
			y: bbox2.minY,
			w: Math.abs(bbox2.maxX - bbox2.minX),
			h: Math.abs(bbox2.maxY - bbox2.minY),
		}
	}

	static getSimpleRectFromModelBbox2(item: ElementShapeItemBase): TSimpleRect {
		const bbox2: BBox2 = item.model.bbox2
		return {
			x: bbox2.minX,
			y: bbox2.minY,
			w: Math.abs(bbox2.maxX - bbox2.minX),
			h: Math.abs(bbox2.maxY - bbox2.minY),
		}
	}

	private _bbox2: BBox2
	private _target: ElementShapeItemBase
	constructor(target: ElementShapeItemBase) {
		this._target = target
		this._bbox2 = target.model.bbox2
	}

	public get target(): ElementShapeItemBase {
		return this._target
	}

	public get targetId(): string {
		return this._target.elementItemId
	}

	public getBBox2(): BBox2 {
		return this._bbox2
	}

	public updateBBox2(bbox2: BBox2): void {
		this._bbox2 = new BBox2(bbox2.minX, bbox2.minY, bbox2.maxX, bbox2.maxY)
	}
}
