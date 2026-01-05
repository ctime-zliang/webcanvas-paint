import { D2FlipUtils } from '../utils/D2FlipUtils'
import { D2RotationUtils } from '../utils/D2RotationUtils'
import { ED2ElementType } from '../../../../config/D2ElementProfile'
import { BBox2 } from '../../../../engine/algorithm/geometry/bbox/BBox2'
import { CanvasMatrix4 } from '../../../../engine/algorithm/geometry/matrix/CanvasMatrix4'
import { Matrix4 } from '../../../../engine/algorithm/geometry/matrix/Matrix4'
import { Vector2 } from '../../../../engine/algorithm/geometry/vector/Vector2'
import { Vector3 } from '../../../../engine/algorithm/geometry/vector/Vector3'
import { ElementModelBase } from './ElementModelBase'

export abstract class ElementModelItemBase extends ElementModelBase {
	private _elementItemId: string
	private _elementItemName: string
	private _groupId: string
	private _parent: ElementModelBase
	private _visible: boolean
	private _modelType: ED2ElementType
	private _layerItemId: string
	private _alpha: number
	private _bbox2: BBox2
	private _position: Vector2
	private _rotation: number
	private _isFlipX: boolean
	private _isFlipY: boolean
	private _matrix: Matrix4
	constructor(elementItemId: string, layerItemId: string) {
		super()
		this._elementItemId = elementItemId
		this._elementItemName = ''
		this._groupId = undefined as any
		this._parent = null as any
		this._visible = true
		this._layerItemId = layerItemId
		this._alpha = 1.0
		this._bbox2 = null as any
		this._position = new Vector2(0, 0)
		this._rotation = 0
		this._isFlipX = false
		this._isFlipY = false
		this._matrix = Matrix4.ORIGIN
	}

	public get elementItemName(): string {
		return this._elementItemName
	}
	public set elementItemName(value: string) {
		this._elementItemName = value
	}

	public get elementItemId(): string {
		return this._elementItemId
	}
	public set elementItemId(value: string) {
		this._elementItemId = value
	}

	public get groupId(): string {
		return this._groupId
	}
	public set groupId(value: string) {
		this._groupId = value
	}

	public get parent(): ElementModelBase {
		return this._parent as ElementModelBase
	}
	public set parent(value: ElementModelBase) {
		this._parent = value
	}

	public get visible(): boolean {
		return this._visible
	}
	public set visible(value: boolean) {
		this._visible = value
	}

	public get modelType(): ED2ElementType {
		return this._modelType
	}
	public set modelType(value: ED2ElementType) {
		this._modelType = value
	}

	public get layerItemId(): string {
		return this._layerItemId
	}
	public set layerItemId(value: string) {
		this._layerItemId = value
	}

	public get alpha(): number {
		return this._alpha
	}
	public set alpha(value: number) {
		this._alpha = value
	}

	public get bbox2(): BBox2 {
		return this._bbox2
	}
	public set bbox2(value: BBox2) {
		this._bbox2 = value
	}

	public get position(): Vector2 {
		return this._position
	}
	public set position(value: Vector2) {
		const prevPosition: Vector2 = this._position
		this.matrix = this.matrix.multiply4(CanvasMatrix4.setTranslateByVector3(new Vector3(value.x - prevPosition.x, value.y - prevPosition.y, 0)))
		this._position = value
	}

	public get rotation(): number {
		return this._rotation
	}
	public set rotation(value: number) {
		const { rotation, matrix4 } = D2RotationUtils.d2ElementRotation(this, value)
		this._rotation = rotation
		this._matrix = matrix4
	}

	public get isFlipX(): boolean {
		return this._isFlipX
	}
	public set isFlipX(value: boolean) {
		if (this._isFlipX !== value) {
			this._isFlipX = value
			const { matrix4 } = D2FlipUtils.d2ElementFlipX(this)
			this._matrix = matrix4
		}
	}

	public get isFlipY(): boolean {
		return this._isFlipY
	}
	public set isFlipY(value: boolean) {
		if (this._isFlipY !== value) {
			this._isFlipY = value
			const { matrix4 } = D2FlipUtils.d2ElementFlipY(this)
			this._matrix = matrix4
		}
	}

	public get matrix(): Matrix4 {
		return this._matrix
	}
	public set matrix(value: Matrix4) {
		this._matrix = value
	}
}
