import { EDrawLayerCode } from '../../../config/DrawLayerProfile'
import { InsConfig } from '../../../engine/common/InsConfig'
import { px2mm } from '../../../engine/math/Calculation'
import { Color } from '../../../engine/common/Color'
import { buildD2AssistLineShape, D2AssistLineShape } from '../../../objects/assist/primitive2d/D2AssistLineShape'
import { setCanvasNativePixelPos2ScenePhysicsPos } from '../../EventsLoader'
import { InputInfo } from '../../InputInfo'
import { BaseAuxiliary } from '../BaseAuxiliary'
import { Vector2 } from '../../../engine/algorithm/geometry/vector/Vector2'
import { Constant } from '../../../Constant'

export class D2CrossAssist extends BaseAuxiliary {
	private _strokeWidth: number
	private _segSize: number
	private _gapSize: number
	private _xLineShape: D2AssistLineShape
	private _yLineShape: D2AssistLineShape
	constructor() {
		super()
		this._strokeWidth = px2mm(1, InsConfig.DPI[0])
		this._segSize = 1.0
		this._gapSize = 0.5
		this._xLineShape = null!
		this._yLineShape = null!
	}

	public hasInstance(): boolean {
		return this._xLineShape !== null && this._yLineShape !== null
	}

	public create(): void {
		const [leftTopScenePhysicsX, leftTopScenePhysicsY] = setCanvasNativePixelPos2ScenePhysicsPos(0, 0)
		const [rightBottomScenePhysicsX, rightBottomScenePhysicsY] = setCanvasNativePixelPos2ScenePhysicsPos(
			Constant.environment.canvasWidth,
			-Constant.environment.canvasHeight
		)
		this._xLineShape = buildD2AssistLineShape(
			EDrawLayerCode.MaskLayer,
			new Vector2(leftTopScenePhysicsX, 0),
			new Vector2(rightBottomScenePhysicsX, 0),
			this._strokeWidth,
			Color.LIGHT_STEE_BLUE
		)
		this._yLineShape = buildD2AssistLineShape(
			EDrawLayerCode.MaskLayer,
			new Vector2(0, leftTopScenePhysicsY),
			new Vector2(0, rightBottomScenePhysicsY),
			this._strokeWidth,
			Color.LIGHT_STEE_BLUE
		)
		this._xLineShape.segSize = this._yLineShape.segSize = this._segSize
		this._xLineShape.gapSize = this._yLineShape.gapSize = this._gapSize
	}

	public update(inputInfo: InputInfo): void {
		const [leftTopScenePhysicsX, leftTopScenePhysicsY] = setCanvasNativePixelPos2ScenePhysicsPos(0, 0)
		const [rightBottomScenePhysicsX, rightBottomScenePhysicsY] = setCanvasNativePixelPos2ScenePhysicsPos(
			Constant.environment.canvasWidth,
			-Constant.environment.canvasHeight
		)
		if (this._xLineShape) {
			this._xLineShape.startPoint = new Vector2(leftTopScenePhysicsX, inputInfo.moveScenePhysicsY)
			this._xLineShape.endPoint = new Vector2(rightBottomScenePhysicsX, inputInfo.moveScenePhysicsY)
		}
		if (this._yLineShape) {
			this._yLineShape.startPoint = new Vector2(inputInfo.moveScenePhysicsX, leftTopScenePhysicsY)
			this._yLineShape.endPoint = new Vector2(inputInfo.moveScenePhysicsX, rightBottomScenePhysicsY)
		}
	}

	public destory(): void {
		this._xLineShape && this._xLineShape.setDelete()
		this._yLineShape && this._yLineShape.setDelete()
		this._xLineShape = null!
		this._yLineShape = null!
	}

	public quit(): void {
		super.quit()
	}
}
