import { BaseInterface } from '../controller/BaseInterface'
import { Tool } from './Tool'

export abstract class ToolChain<T> extends BaseInterface {
	private _nextTool: Tool<any> | null
	constructor() {
		super()
		this._nextTool = null
	}

	public get nextTool(): Tool<T> | null {
		return this._nextTool
	}
	public set nextTool(value: Tool<T> | null) {
		this._nextTool = value
	}

	public handler(process: (tool: Tool<T>) => void): void {
		if (this.nextTool !== null) {
			process(this.nextTool)
		}
	}
}
