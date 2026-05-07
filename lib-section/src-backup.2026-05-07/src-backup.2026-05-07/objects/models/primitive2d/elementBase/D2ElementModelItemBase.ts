import { D2FlipUtils } from '../utils/D2FlipUtils'
import { D2RotationUtils } from '../utils/D2RotationUtils'
import { ED2ElementType } from '../../../../config/D2ElementProfile'
import { BBox2 } from '../../../../engine/algorithm/geometry/bbox/BBox2'
import { Matrix4 } from '../../../../engine/algorithm/geometry/matrix/Matrix4'
import { Vector2 } from '../../../../engine/algorithm/geometry/vector/Vector2'
import { D2ElementModelBase } from './D2ElementModelBase'
import { D2PositionUtils } from '../utils/D2PositionUtils'

export type TD2TextModelTransformCache = {
	position: Vector2
	rotation: number
	isFlipX: boolean
	isFlipY: boolean
}

export abstract class D2ElementModelItemBase extends D2ElementModelBase {
	private _elementItemId: string
	private _elementItemName: string
	private _groupId: string
	private _parent: D2ElementModelBase
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
	private _isEnableSelect: boolean
	private _transformCache: TD2TextModelTransformCache
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
		this._isEnableSelect = true
		this._transformCache = {
			position: new Vector2(0, 0),
			rotation: 0,
			isFlipX: false,
			isFlipY: false,
		}
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

	public get parent(): D2ElementModelBase {
		return this._parent as D2ElementModelBase
	}
	public set parent(value: D2ElementModelBase) {
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
		this._transformCache.position = value.copy()
		const { position, matrix4 } = D2PositionUtils.d2ElementPosition(this, value)
		this._position = position
		this._matrix = matrix4
	}

	public get rotation(): number {
		return this._rotation
	}
	public set rotation(value: number) {
		this._transformCache.rotation = value
		const { rotation, matrix4 } = D2RotationUtils.d2ElementRotation(this, value)
		this._rotation = rotation
		this._matrix = matrix4
	}

	public get isFlipX(): boolean {
		return this._isFlipX
	}
	public set isFlipX(value: boolean) {
		this._transformCache.isFlipX = value
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
		this._transformCache.isFlipY = value
		if (this._isFlipY !== value) {
			this._isFlipY = value
			const { matrix4 } = D2FlipUtils.d2ElementFlipY(this)
			this._matrix = matrix4
		}
	}

	public get matrix(): Matrix4 {
		return this._matrix
	}

	public get isEnableSelect(): boolean {
		return this._isEnableSelect
	}
	public set isEnableSelect(value: boolean) {
		this._isEnableSelect = value
	}

	public get transformCache(): TD2TextModelTransformCache {
		return { ...this._transformCache }
	}
}
