import { BBox2 } from '../../../engine/algorithm/geometry/bbox/BBox2'
import { Matrix3 } from '../../../engine/algorithm/geometry/matrix/Matrix3'
import { Vector2 } from '../../../engine/algorithm/geometry/vector/Vector2'
import { ESweep } from '../../../engine/config/CommonProfile'
import { ECanvas2DLineCap } from '../../../engine/config/PrimitiveProfile'
import { Polyline } from './Polyline'
import { StructPrimitive } from './StructPrimitive'

export abstract class Primitive extends StructPrimitive<Primitive> {
	public abstract get startPoint(): Vector2
	public abstract get endPoint(): Vector2
	public abstract get bbox2(): BBox2
	public abstract get length(): number
	public abstract multiply3(matrix3: Matrix3): Primitive
	public abstract points(resolution: number): Array<Vector2>
	public abstract reverse(): Primitive
	public abstract storke(width: number, cap: ECanvas2DLineCap, sweep: ESweep): Polyline
}
