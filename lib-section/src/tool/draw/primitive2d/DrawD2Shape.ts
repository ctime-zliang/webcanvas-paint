import { BaseInterface } from '../../../controller/BaseInterface'
import { Color } from '../../../engine/common/Color'
import { DrawLayerShape } from '../../../objects/shapes/DrawLayerShape'
import { ElementShapeItemBase } from '../../../objects/shapes/primitive2d/elementBase/ElementShapeItemBase'
import { InputInfo } from '../../InputInfo'

export abstract class DrawD2Shape extends BaseInterface {
	private _selectedDrawLayerShapeItem: DrawLayerShape
	private _strokeWidth: number
	private _strokeColor: Color
	private _isSolid: boolean
	private _isFill: boolean
	private _fillColor: Color
	private _inputInfo: InputInfo
	constructor() {
		super()
		this._selectedDrawLayerShapeItem = null!
		this._strokeWidth = 2
		this._strokeColor = Color.GOLDEN
		this._isSolid = true
		this._isFill = true
		this._fillColor = Color.ORIGIN
		this._inputInfo = null!
	}

	public get selectedDrawLayerShapeItem(): DrawLayerShape {
		return this._selectedDrawLayerShapeItem
	}
	public set selectedDrawLayerShapeItem(value: DrawLayerShape) {
		this._selectedDrawLayerShapeItem = value
	}

	public get strokeWidth(): number {
		return this._strokeWidth
	}
	public set strokeWidth(value: number) {
		this._strokeWidth = value
	}

	public get strokeColor(): Color {
		return this._strokeColor
	}
	public set strokeColor(value: Color) {
		this._strokeColor = value
	}

	public get isSolid(): boolean {
		return this._isSolid
	}
	public set isSolid(value: boolean) {
		this._isSolid = value
	}

	public get isFill(): boolean {
		return this._isFill
	}
	public set isFill(value: boolean) {
		this._isFill = value
	}

	public get fillColor(): Color {
		return this._fillColor
	}
	public set fillColor(value: Color) {
		this._fillColor = value
	}

	public get inputInfo(): InputInfo {
		return this._inputInfo
	}
	public set inputInfo(value: InputInfo) {
		this._inputInfo = value
	}

	public abstract completeDraw(): Array<ElementShapeItemBase>

	public abstract cancelDraw(): void

	public abstract updateShapes(inputInfo: InputInfo, ...args: Array<any>): void

	public abstract createShapes(x: number, y: number, ...args: Array<any>): void

	public abstract destoryShapes(): void
}
