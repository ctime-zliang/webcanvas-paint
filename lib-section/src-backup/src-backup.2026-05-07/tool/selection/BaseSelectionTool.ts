import { Camera } from '../../engine/common/Camera'
import { Vector2 } from '../../engine/algorithm/geometry/vector/Vector2'
import { TAllElementShapeType, TElementShapeType } from '../../types/Element'
import { InputInfo } from '../InputInfo'
import { BaseInterface } from '../../controller/BaseInterface'

export abstract class BaseSelectionTool extends BaseInterface {
	private _camrea: Camera
	private _selectedItems: Array<TElementShapeType>
	private _moveStartPosition: Vector2
	private _moveScenePhysicsX: number
	private _moveScenePhysicsY: number
	constructor() {
		super()
		this._camrea = Camera.getInstance()
		this._moveStartPosition = null!
		this._moveScenePhysicsX = 0
		this._moveScenePhysicsY = 0
	}

	public get camrea(): Camera {
		return this._camrea
	}

	public set selectedItems(value: Array<TElementShapeType>) {
		this._selectedItems = value
	}
	public get selectedItems(): Array<TElementShapeType> {
		return this._selectedItems
	}

	protected set moveStartPosition(value: Vector2) {
		this._moveStartPosition = value
	}
	protected get moveStartPosition(): Vector2 {
		return this._moveStartPosition
	}

	protected set moveScenePhysicsX(value: number) {
		this._moveScenePhysicsX = value
	}
	protected get moveScenePhysicsX(): number {
		return this._moveScenePhysicsX
	}

	protected set moveScenePhysicsY(value: number) {
		this._moveScenePhysicsY = value
	}
	protected get moveScenePhysicsY(): number {
		return this._moveScenePhysicsY
	}

	public quit(): void {
		this._camrea = undefined!
		this._moveStartPosition = undefined!
	}

	public abstract mouseLeftDownSelect(inputInfo: InputInfo): TAllElementShapeType

	public abstract keyDownHandler(inputInfo: InputInfo): void

	public abstract keyUpHandler(inputInfo: InputInfo): void

	public abstract mouseLeftDownHandler(inputInfo: InputInfo): void

	public abstract mouseLeftUpHandler(inputInfo: InputInfo): void

	public abstract mouseMoveHandler(inputInfo: InputInfo): void

	public abstract mouseUpMoveHandler(inputInfo: InputInfo): void

	public abstract clear(): void
}
