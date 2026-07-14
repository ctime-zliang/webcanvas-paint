import { BaseInterface } from '../../controller/BaseInterface'
import { Camera } from '../../engine/common/Camera'
import { InputInfo } from '../InputInfo'

export abstract class BaseAuxiliary extends BaseInterface {
	private _camera: Camera
	constructor() {
		super()
		this._camera = Camera.getInstance()
	}

	public get camera(): Camera {
		return this._camera
	}

	public abstract create(): any

	public abstract update(inputInfo: InputInfo): any

	public abstract destory(): any

	public quit(): void {
		this._camera = undefined!
	}
}
