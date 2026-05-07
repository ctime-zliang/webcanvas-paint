import { Constant } from '../../Constant'
import { InputInfo } from '../InputInfo'
import { Tool } from '../Tool'

export class DropDragTool extends Tool<InputInfo> {
	constructor() {
		super()
	}

	public keyDownHandler(inputInfo: InputInfo): void {
		// console.log(`DropDragTool: KeyDownHandler`)
		Constant.selectManager.keyDownHandler(inputInfo)
	}

	public keyUpHandler(inputInfo: InputInfo): void {
		// console.log(`DropDragTool: KeyUpHandler`)
		Constant.selectManager.keyUpHandler(inputInfo)
	}

	public mouseLeftDownHandler(inputInfo: InputInfo): void {
		// console.log(`DropDragTool: MouseLeftDown`, inputInfo)
		Constant.selectManager.mouseLeftDownHandler(inputInfo)
	}

	public mouseMiddleDownHandler(inputInfo: InputInfo): void {
		// console.log(`DropDragTool: MouseMiddleDown`)
		Constant.selectManager.mouseMiddleDownHandler(inputInfo)
	}

	public mouseRightDownHandler(inputInfo: InputInfo): void {
		// console.log(`DropDragTool: MouseRightDown`)
		Constant.selectManager.mouseRightDownHandler(inputInfo)
	}

	public mouseMoveHandler(inputInfo: InputInfo): void {
		// console.log(`DropDragTool: MouseMove`)
		Constant.selectManager.mouseMoveHandler(inputInfo)
	}

	public mouseLeftUpHandler(inputInfo: InputInfo): void {
		// console.log(`DropDragTool: MouseLeftUp`, inputInfo)
		Constant.selectManager.mouseLeftUpHandler(inputInfo)
	}

	public mouseMiddleUpHandler(inputInfo: InputInfo): void {
		// console.log(`DropDragTool: MouseMiddleUp`)
	}

	public mouseRightUpHandler(inputInfo: InputInfo): void {
		// console.log(`DropDragTool: MouseRightUp`)
	}

	public mouseWheelHandler(inputInfo: InputInfo): void {
		// console.log(`DropDragTool: MouseWheel`)
	}

	public mouseLeaveHandler(inputInfo: InputInfo): void {
		// console.log(`DropDragTool: MouseLeave`)
	}

	public mouseEnterHandler(inputInfo: InputInfo): void {
		// console.log(`DropDragTool: MouseEnter`)
	}

	public quit(): void {}
}
