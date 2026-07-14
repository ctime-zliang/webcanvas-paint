import { EFrameCommand } from '../config/CommandEnum'
import { Scene } from '../engine/common/Scene'
import { DrawLayerPresenter } from '../presenter/DrawLayerPresenter'
import { ElementPresenter } from '../presenter/ElementPresenter'
import { Constant } from '../Constant'
import { createEngine, destoryEngine } from '../engine/common/init'

export class Launcher {
	private _scene: Scene
	private _isShouldHandleElementsPriority: boolean
	private _isShouldUpdateCanvasView: boolean
	private _rAFId: number
	constructor() {
		this._scene = null!
		this._isShouldHandleElementsPriority = false
		this._isShouldUpdateCanvasView = false
		this._rAFId = undefined!
		Constant.messageTool.messageBus.subscribe(EFrameCommand.RENDER_FRAME, (params: { elementPriority: boolean }): void => {
			this._isShouldHandleElementsPriority = !params ? false : !!params.elementPriority
			this._isShouldUpdateCanvasView = true
		})
	}

	public async init(canvasElement: HTMLCanvasElement): Promise<void> {
		this._scene = await createEngine(Constant.systemConfig.coreEngineType, Constant.systemConfig.renderMode, canvasElement)
		Constant.modifyController.setLayerPresenter(new DrawLayerPresenter(this._scene))
		Constant.modifyController.setElementPresenter(new ElementPresenter(this._scene))
	}

	public get scene(): Scene {
		return this._scene
	}

	public get rAFId(): number {
		return this._rAFId
	}
	public set rAFId(value: number) {
		this._rAFId = value
	}

	public renderFrame(timeStamp: number): void {
		if (this._isShouldUpdateCanvasView) {
			Constant.modifyController.notify(this._isShouldHandleElementsPriority)
			this._scene.render(timeStamp)
			this._isShouldUpdateCanvasView = false
			this._isShouldHandleElementsPriority = false
		}
	}

	public quit(): void {
		destoryEngine(Constant.systemConfig.coreEngineType, this._scene)
		this._isShouldHandleElementsPriority = false
		this._isShouldUpdateCanvasView = false
		this._scene = undefined!
	}
}
