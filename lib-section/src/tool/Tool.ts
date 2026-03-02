import { EFrameCommand } from '../config/CommandEnum'
import { Constant } from '../Constant'
import { InputInfo } from './InputInfo'
import { ToolChain } from './ToolChain'

export abstract class Tool<T> extends ToolChain<T> {
	private _drawing: boolean
	constructor() {
		super()
		this._drawing = false
	}

	public get drawing(): boolean {
		return this._drawing
	}
	public set drawing(value: boolean) {
		this._drawing = value
	}

	public handler(process: (tool: Tool<T>) => void): void {
		if (this.nextTool) {
			process(this.nextTool)
		}
		Constant.messageTool.messageBus.publish(EFrameCommand.RENDER_FRAME, null)
	}

	public viewResizeHandler(inputInfo: InputInfo, offset?: any): void {}

	public abstract keyDownHandler(inputInfo: InputInfo): void

	public abstract keyUpHandler(inputInfo: InputInfo): void

	public abstract mouseLeftDownHandler(inputInfo: InputInfo): void

	public abstract mouseMiddleDownHandler(inputInfo: InputInfo): void

	public abstract mouseRightDownHandler(inputInfo: InputInfo): void

	public abstract mouseMoveHandler(inputInfo: InputInfo): void

	public abstract mouseLeftUpHandler(inputInfo: InputInfo): void

	public abstract mouseMiddleUpHandler(inputInfo: InputInfo): void

	public abstract mouseRightUpHandler(inputInfo: InputInfo): void

	public abstract mouseWheelHandler(inputInfo: InputInfo): void

	public abstract mouseLeaveHandler(inputInfo: InputInfo): void

	public abstract mouseEnterHandler(inputInfo: InputInfo): void
}
