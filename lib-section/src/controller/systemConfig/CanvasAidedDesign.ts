import { AxisParam } from '../../engine/common/AxisParam'
import { Color, TColorRGBAJSON } from '../../engine/common/Color'
import { BaseInterface } from '../BaseInterface'

export type TCanvasAidedDesignProfile = {
	enableGrid: boolean
	enableMultiGrid: boolean
	enableGridDot: boolean
	enableAxis: boolean
	/* ... */
	alignGrid: boolean
	/* ... */
	axisStepX: number
	axisStepY: number
	axisSnapX: number
	axisSnapY: number
	/* ... */
	gridColor: TColorRGBAJSON
	gridAlpha: number
	multiGridColor: TColorRGBAJSON
	multiGridAlpha: number
	gridDotColor: TColorRGBAJSON
	gridDotAlpha: number
	axisColor: TColorRGBAJSON
	axisAlpha: number
}

/**
 * 辅助设计
 */
export class CanvasAidedDesign extends BaseInterface {
	private _alignGrid: boolean
	constructor() {
		super()
		this._alignGrid = true
	}

	public set enableGrid(value: boolean) {
		AxisParam.getInstance().isShowGrid = value
	}
	public get enableGrid(): boolean {
		return AxisParam.getInstance().isShowGrid
	}

	public set enableMultiGrid(value: boolean) {
		if (!AxisParam.getInstance().isShowGrid && value) {
			console.warn(`when enabling bold grids, the universal grid must be enabled first.`)
		}
		AxisParam.getInstance().isShowMultiGrid = value
	}
	public get enableMultiGrid(): boolean {
		return AxisParam.getInstance().isShowMultiGrid
	}

	public set enableGridDot(value: boolean) {
		AxisParam.getInstance().isShowGridDot = value
	}
	public get enableGridDot(): boolean {
		return AxisParam.getInstance().isShowGridDot
	}

	public set enableAxis(value: boolean) {
		AxisParam.getInstance().isShowAxis = value
	}
	public get enableAxis(): boolean {
		return AxisParam.getInstance().isShowAxis
	}

	public set alignGrid(value: boolean) {
		this._alignGrid = value
	}
	public get alignGrid(): boolean {
		return this._alignGrid
	}

	public get gridColor(): Color {
		return AxisParam.getInstance().gridColor
	}
	public set gridColor(value: Color) {
		AxisParam.getInstance().gridColor = value
	}

	public get gridAlpha(): number {
		return AxisParam.getInstance().gridAlpha
	}
	public set gridAlpha(value: number) {
		AxisParam.getInstance().gridAlpha = value
	}

	public get multiGridColor(): Color {
		return AxisParam.getInstance().multiGridColor
	}
	public set multiGridColor(value: Color) {
		AxisParam.getInstance().multiGridColor = value
	}

	public get multiGridAlpha(): number {
		return AxisParam.getInstance().multiGridAlpha
	}
	public set multiGridAlpha(value: number) {
		AxisParam.getInstance().multiGridAlpha = value
	}

	public get gridDotColor(): Color {
		return AxisParam.getInstance().gridDotColor
	}
	public set gridDotColor(value: Color) {
		AxisParam.getInstance().gridDotColor = value
	}

	public get gridDotAlpha(): number {
		return AxisParam.getInstance().gridAlpha
	}
	public set gridDotAlpha(value: number) {
		AxisParam.getInstance().gridAlpha = value
	}

	public get axisColor(): Color {
		return AxisParam.getInstance().axisColor
	}
	public set axisColor(value: Color) {
		AxisParam.getInstance().axisColor = value
	}

	public get axisAlpha(): number {
		return AxisParam.getInstance().axisAlpha
	}
	public set axisAlpha(value: number) {
		AxisParam.getInstance().axisAlpha = value
	}

	public get axisStepX(): number {
		return AxisParam.getInstance().axisStepX
	}
	public set axisStepX(value: number) {
		AxisParam.getInstance().axisStepX = value
	}

	public get axisStepY(): number {
		return AxisParam.getInstance().axisStepY
	}
	public set axisStepY(value: number) {
		AxisParam.getInstance().axisStepY = value
	}

	public get axisSnapX(): number {
		return AxisParam.getInstance().axisSnapX
	}
	public set axisSnapX(value: number) {
		AxisParam.getInstance().axisSnapX = value
	}

	public get axisSnapY(): number {
		return AxisParam.getInstance().axisSnapY
	}
	public set axisSnapY(value: number) {
		AxisParam.getInstance().axisSnapY = value
	}

	public toJSON(): TCanvasAidedDesignProfile {
		return {
			enableGrid: this.enableGrid,
			enableMultiGrid: this.enableMultiGrid,
			enableGridDot: this.enableGridDot,
			enableAxis: this.enableAxis,
			/* ... */
			alignGrid: this.alignGrid,
			axisStepX: this.axisStepX,
			axisStepY: this.axisStepY,
			axisSnapX: this.axisSnapX,
			axisSnapY: this.axisSnapY,
			/* ... */
			gridColor: AxisParam.getInstance().gridColor,
			gridAlpha: AxisParam.getInstance().gridAlpha,
			multiGridColor: AxisParam.getInstance().multiGridColor,
			multiGridAlpha: AxisParam.getInstance().multiGridAlpha,
			gridDotColor: AxisParam.getInstance().gridDotColor,
			gridDotAlpha: AxisParam.getInstance().gridDotAlpha,
			axisColor: AxisParam.getInstance().axisColor,
			axisAlpha: AxisParam.getInstance().axisAlpha,
		}
	}

	public quit(): void {}
}
