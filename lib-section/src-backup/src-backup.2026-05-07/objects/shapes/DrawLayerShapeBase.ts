import { Context } from '../../engine/common/Context'
import { EPlaneStatus, PLANE_INIT_STATUS } from '../../engine/config/PlaneProfile'

export abstract class DrawLayerShapeBase extends Context {
	constructor() {
		super(PLANE_INIT_STATUS)
	}

	public abstract refreshRender(): void

	public abstract setUnSelect(): void

	public abstract setSelect(): void

	public abstract setDelete(): void

	public abstract getType(): number

	public abstract getStatus(): EPlaneStatus

	public abstract toJSON(): any
}
