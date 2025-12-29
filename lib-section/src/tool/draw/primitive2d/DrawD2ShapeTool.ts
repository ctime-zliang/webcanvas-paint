import { D2CrossAssist } from '../../auxiliary/primitive2d/D2CrossAssist'
import { InputInfo } from '../../InputInfo'
import { Tool } from '../../Tool'

export abstract class DrawD2ShapeTool extends Tool<InputInfo> {
	private _isDrawing: boolean
	private _hasMoveWhenAfterRightDown: boolean
	private _d2CrossAssist: D2CrossAssist
	private _toolData: { [key: string]: any }
	private _lastMoveRealScenePhysicsX: number
	private _lastMoveRealScenePhysicsY: number
	constructor(toolData: Partial<any>) {
		super()
		this._isDrawing = false
		this._hasMoveWhenAfterRightDown = false
		this._toolData = toolData
		this._lastMoveRealScenePhysicsX = 0
		this._lastMoveRealScenePhysicsY = 0
	}

	public get hasMoveWhenAfterRightDown(): boolean {
		return this._hasMoveWhenAfterRightDown
	}
	public set hasMoveWhenAfterRightDown(value: boolean) {
		this._hasMoveWhenAfterRightDown = value
	}

	public get isDrawing(): boolean {
		return this._isDrawing
	}
	public set isDrawing(value: boolean) {
		this._isDrawing = value
	}

	public get d2CrossAssist(): D2CrossAssist {
		return this._d2CrossAssist
	}
	public set d2CrossAssist(value: D2CrossAssist) {
		this._d2CrossAssist = value
	}

	public get toolData(): { [key: string]: any } {
		return this._toolData
	}
	public set toolData(value: { [key: string]: any }) {
		this._toolData = value
	}

	public get lastMoveRealScenePhysicsX(): number {
		return this._lastMoveRealScenePhysicsX
	}
	public set lastMoveRealScenePhysicsX(value: number) {
		this._lastMoveRealScenePhysicsX = value
	}

	public get lastMoveRealScenePhysicsY(): number {
		return this._lastMoveRealScenePhysicsY
	}
	public set lastMoveRealScenePhysicsY(value: number) {
		this._lastMoveRealScenePhysicsY = value
	}

	public initAuxiliaryTools(): D2CrossAssist {
		this.d2CrossAssist = new D2CrossAssist()
		this.d2CrossAssist.create()
		return this.d2CrossAssist
	}

	public destoryAuxiliaryTools(): void {
		if (this.d2CrossAssist) {
			this.d2CrossAssist.quit()
			this.d2CrossAssist = undefined!
		}
	}

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
