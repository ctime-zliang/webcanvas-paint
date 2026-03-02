import { Vector2 } from '../algorithm/geometry/vector/Vector2'
import { BaseInterface } from './BaseInterface'
import { Color } from './Color'

export class AxisParam extends BaseInterface {
	private static instance: AxisParam
	public static getInstance(): AxisParam {
		if (AxisParam.instance === undefined) {
			AxisParam.instance = new AxisParam()
		}
		return AxisParam.instance
	}

	private _origin: Vector2
	/* ... */
	private _isShowGrid: boolean
	private _isShowMultiGrid: boolean
	private _isShowGridDot: boolean
	private _isShowAxis: boolean
	private _isAntialias: boolean
	private _isFlip: boolean
	/* ... */
	private _gridColor: Color
	private _gridAlpha: number
	private _multiGridColor: Color
	private _multiGridAlpha: number
	private _gridDotColor: Color
	private _gridDotAlpha: number
	private _axisColor: Color
	private _axisAlpha: number
	/* ... */
	private _axisStepX: number
	private _axisStepY: number
	private _axisSnapX: number
	private _axisSnapY: number
	/* ... */
	private _pattern: boolean
	private _multiRatio: number
	constructor() {
		super()
		this._origin = Vector2.ORIGIN
		/* ... */
		this._isAntialias = true
		this._isFlip = false
		this._isShowGrid = true
		this._isShowMultiGrid = true
		this._isShowGridDot = true
		this._isShowAxis = true
		/* ... */
		this._gridColor = Color.GRAY
		this._gridAlpha = 0.25
		this._multiGridColor = Color.DIM_GRAY
		this._multiGridAlpha = 0.55
		this._gridDotColor = Color.DIM_GRAY
		this._gridDotAlpha = 0.5
		this._axisColor = Color.WHITE
		this._axisAlpha = 0.65
		/* ... */
		this._axisStepX = 0.5
		this._axisStepY = 0.5
		this._axisSnapX = 0.5
		this._axisSnapY = 0.5
		/* ... */
		this._pattern = true
		this._multiRatio = 5
	}

	public get origin(): Vector2 {
		return this._origin
	}
	public set origin(value: Vector2) {
		this._origin = value
	}

	public get isAntialias(): boolean {
		return this._isAntialias
	}
	public set isAntialias(value: boolean) {
		this._isAntialias = value
	}

	public get isShowGrid(): boolean {
		return this._isShowGrid
	}
	public set isShowGrid(value: boolean) {
		this._isShowGrid = value
	}

	public get isShowMultiGrid(): boolean {
		return this._isShowMultiGrid
	}
	public set isShowMultiGrid(value: boolean) {
		this._isShowMultiGrid = value
	}

	public get isShowGridDot(): boolean {
		return this._isShowGridDot
	}
	public set isShowGridDot(value: boolean) {
		this._isShowGridDot = value
	}

	public get isShowAxis(): boolean {
		return this._isShowAxis
	}
	public set isShowAxis(value: boolean) {
		this._isShowAxis = value
	}

	public get isFlip(): boolean {
		return this._isFlip
	}
	public set isFlip(value: boolean) {
		this._isFlip = value
	}

	public get gridColor(): Color {
		return this._gridColor
	}
	public set gridColor(value: Color) {
		this._gridColor = value
	}

	public get gridAlpha(): number {
		return this._gridAlpha
	}
	public set gridAlpha(value: number) {
		this._gridAlpha = value
	}

	public get multiGridColor(): Color {
		return this._multiGridColor
	}
	public set multiGridColor(value: Color) {
		this._multiGridColor = value
	}

	public get multiGridAlpha(): number {
		return this._multiGridAlpha
	}
	public set multiGridAlpha(value: number) {
		this._multiGridAlpha = value
	}

	public get gridDotColor(): Color {
		return this._gridDotColor
	}
	public set gridDotColor(value: Color) {
		this._gridDotColor = value
	}

	public get gridDotAlpha(): number {
		return this._gridDotAlpha
	}
	public set gridDotAlpha(value: number) {
		this._gridDotAlpha = value
	}

	public get axisColor(): Color {
		return this._axisColor
	}
	public set axisColor(value: Color) {
		this._axisColor = value
	}

	public get axisAlpha(): number {
		return this._axisAlpha
	}
	public set axisAlpha(value: number) {
		this._axisAlpha = value
	}

	public get axisStepX(): number {
		return this._axisStepX
	}
	public set axisStepX(value: number) {
		this._axisStepX = value
	}

	public get axisStepY(): number {
		return this._axisStepY
	}
	public set axisStepY(value: number) {
		this._axisStepY = value
	}

	public get axisSnapX(): number {
		return this._axisSnapX
	}
	public set axisSnapX(value: number) {
		this._axisSnapX = value
	}

	public get axisSnapY(): number {
		return this._axisSnapY
	}
	public set axisSnapY(value: number) {
		this._axisSnapY = value
	}

	public get pattern(): boolean {
		return this._pattern
	}
	public set pattern(value: boolean) {
		this._pattern = value
	}

	public get multiRatio(): number {
		return this._multiRatio
	}
	public set multiRatio(value: number) {
		this._multiRatio = value
	}

	public quit(): void {}
}
