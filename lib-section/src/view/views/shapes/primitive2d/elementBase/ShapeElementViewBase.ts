import { ED2ElementType } from '../../../../../config/D2ElementProfile'
import { Context } from '../../../../../engine/common/Context'
import { EPrimitiveStatus, PRIMITIVE_INIT_STATUS } from '../../../../../engine/config/PrimitiveProfile'
import { ElementShapeItemBase } from '../../../../../objects/shapes/primitive2d/elementBase/ElementShapeItemBase'
import { DrawLayerViewManager } from '../../../../manager/DrawLayerViewManager'
import { DrawLayerView } from '../../DrawLayerView'

export abstract class ShapeElementViewBase extends Context {
	private _type: ED2ElementType
	private _layerItemId: string
	private _elementItemId: string
	private _shapeObjectItem: ElementShapeItemBase
	constructor(shapeObjectItem: ElementShapeItemBase) {
		super(PRIMITIVE_INIT_STATUS)
		this._shapeObjectItem = shapeObjectItem
		this._elementItemId = shapeObjectItem.elementItemId
	}

	public get type(): ED2ElementType {
		return this._type
	}
	public set type(value: ED2ElementType) {
		this._type = value
	}

	public get layerItemId(): string {
		return this._layerItemId
	}
	public set layerItemId(value: string) {
		this._layerItemId = value
	}

	public get elementItemId(): string {
		return this._elementItemId
	}

	public get shapeObjectItem(): ElementShapeItemBase {
		return this._shapeObjectItem
	}

	abstract modify(shapeObjectItem: ElementShapeItemBase): any

	abstract delete(...args: any): any

	abstract hightlighting(...args: any): any

	abstract normalview(...args: any): any

	public getDrawLayerViewItem(layerItemId: string): DrawLayerView {
		return DrawLayerViewManager.getInstance().items.get(layerItemId) as DrawLayerView
	}

	public updateMaskElementItemId(elementItemId: string): string {
		return elementItemId + '_mask'
	}

	public get visible(): boolean {
		return this.isStatusMatch(EPrimitiveStatus.VISIBLE)
	}
	public set visible(value: boolean) {
		this.setStatusMatch(EPrimitiveStatus.VISIBLE, value)
	}

	public get hightlight(): boolean {
		return this.isStatusMatch(EPrimitiveStatus.HIGHTLIGHT)
	}
	public set hightlight(value: boolean) {
		this.setStatusMatch(EPrimitiveStatus.HIGHTLIGHT, value)
	}

	public get locked(): boolean {
		return this.isStatusMatch(EPrimitiveStatus.LOCKED)
	}
	public set locked(value: boolean) {
		this.setStatusMatch(EPrimitiveStatus.LOCKED, value)
	}

	public get killed(): boolean {
		return this.isStatusMatch(EPrimitiveStatus.KILLED)
	}
	public set killed(value: boolean) {
		this.setStatusMatch(EPrimitiveStatus.KILLED, value)
	}
}
