import { BBox2, BBox2Fac } from '../../../engine/algorithm/geometry/bbox/BBox2'
import { Matrix3 } from '../../../engine/algorithm/geometry/matrix/Matrix3'
import { Vector2 } from '../../../engine/algorithm/geometry/vector/Vector2'
import { Polyline } from './Polyline'
import { Primitive } from './Primitive'
import { StructPrimitive } from './StructPrimitive'

export class PolylineGroup extends StructPrimitive<PolylineGroup> {
	private readonly _polylines: Array<Polyline>
	private readonly _bbox2: BBox2
	constructor(polylines: Array<Polyline>) {
		super()
		this._polylines = Array.from(polylines)
		this._bbox2 = this.calcBBox2()
	}

	public get bbox2(): BBox2 {
		return this._bbox2
	}

	public get polylines(): Array<Polyline> {
		return this._polylines
	}

	public get primitives(): Array<Primitive> {
		return this._polylines
			.map((item: Polyline): Array<Primitive> => {
				return item.primitives
			})
			.flat(2)
	}

	public multiply3(matrix3: Matrix3): PolylineGroup {
		let pls: Array<Polyline> = new Array(this._polylines.length)
		for (let i: number = 0; i < this._polylines.length; i++) {
			pls[i] = this._polylines[i].multiply3(matrix3)
		}
		return new PolylineGroup(pls)
	}

	public asClose(): PolylineGroup {
		for (let i: number = 0; i < this._polylines.length; i++) {
			this._polylines[i].asClose()
		}
		return this
	}

	public mirror(origin: Vector2): PolylineGroup {
		for (let i: number = 0; i < this._polylines.length; i++) {
			this._polylines[i].mirror(origin)
		}
		return this
	}

	public isEqual(plg: PolylineGroup): boolean {
		if (!(plg instanceof PolylineGroup)) {
			return false
		}
		return this._polylines.every((pl1: Polyline): boolean => {
			return plg._polylines.some((pl2: Polyline): boolean => {
				return pl2.isEqual(pl1)
			})
		})
	}

	public getOutMostPolyline(): Polyline {
		return this._polylines.reduce((res: Polyline, pl: Polyline): Polyline => {
			return pl.bbox2.area > res.bbox2.area ? pl : res
		}, this._polylines[0])
	}

	public closeEndPoint(): PolylineGroup {
		for (let i: number = 0; i < this._polylines.length; i++) {
			this._polylines[i].closeEndPooint()
		}
		return this
	}

	private calcBBox2(): BBox2 {
		const bbox2Fac: BBox2Fac = new BBox2Fac()
		for (let i: number = 0; i < this._polylines.length; i++) {
			bbox2Fac.extendByBBox2(this._polylines[i].bbox2)
		}
		return bbox2Fac.build()
	}
}
