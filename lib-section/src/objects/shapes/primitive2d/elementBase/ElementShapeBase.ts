import { ED2ElementType } from '../../../../config/D2ElementProfile'
import { Matrix4 } from '../../../../engine/algorithm/geometry/matrix/Matrix4'
import { Context } from '../../../../engine/common/Context'
import { EPrimitiveStatus, PRIMITIVE_INIT_STATUS } from '../../../../engine/config/PrimitiveProfile'

export abstract class ElementShapeBase extends Context {
	constructor() {
		super(PRIMITIVE_INIT_STATUS)
	}

	public abstract refreshRender(): void

	public abstract transform(matrix4: Matrix4): void

	public abstract isSelect(...args: Array<any>): boolean

	public abstract setUnSelect(): void

	public abstract setSelect(): void

	public abstract setDelete(): void

	public abstract getType(): ED2ElementType

	public abstract getStatus(): EPrimitiveStatus

	public abstract toJSON(): any
}
