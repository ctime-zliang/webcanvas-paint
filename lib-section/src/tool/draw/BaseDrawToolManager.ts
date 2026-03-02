import { BaseInterface } from '../../controller/BaseInterface'
import { BaseFrameTool } from '../frameTool/BaseFrameTool'

export abstract class BaseDrawToolManager extends BaseInterface {
	private _frameToolHandler: BaseFrameTool
	constructor() {
		super()
		this._frameToolHandler = null!
	}

	public get frameToolHandler(): BaseFrameTool {
		return this._frameToolHandler
	}
	public set frameToolHandler(value: BaseFrameTool) {
		this._frameToolHandler = value
	}

	public abstract update(data: any): void
}
