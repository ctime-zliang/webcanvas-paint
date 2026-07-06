import { BBox2 } from '../../../engine/algorithm/geometry/bbox/BBox2'
import { Matrix3 } from '../../../engine/algorithm/geometry/matrix/Matrix3'
import { Vector2 } from '../../../engine/algorithm/geometry/vector/Vector2'
import { ESweep } from '../../../engine/config/CommonProfile'
import { ECanvasD2LineCap } from '../../../engine/config/PrimitiveProfile'
import { Polyline } from './Polyline'
import { StructPrimitive } from './StructPrimitive'

export abstract class Primitive extends StructPrimitive<Primitive> {
	public abstract get startPoint(): Vector2
	public abstract get endPoint(): Vector2
	public abstract get bbox2(): BBox2
	public abstract get length(): number
	public abstract toPoints(resolution: number): Array<Vector2>
	public abstract reverse(): Primitive
	public abstract multiplyMatrix3(matrix3: Matrix3): Primitive
	public abstract mirrorX(yValue: number): Primitive
	public abstract mirrorY(xValue: number): Primitive
	// public abstract mirrorO(): Primitive
	public abstract stroke(width: number, cap: ECanvasD2LineCap, sweep: ESweep): Polyline
}
