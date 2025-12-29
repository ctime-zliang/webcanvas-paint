import { Matrix3 } from '../../../engine/algorithm/geometry/matrix/Matrix3'

export abstract class StructPrimitive<T> {
	public abstract multiply3(matrix3: Matrix3): T
}
