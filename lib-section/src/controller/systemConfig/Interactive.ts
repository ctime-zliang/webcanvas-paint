import { BaseInterface } from '../BaseInterface'

export type TInteractiveProfile = {
	enableCanvasZoomChange: boolean
	enableCanvasTranslate: boolean
	enableCanvasTranslateByLeftDownMove: boolean
	enableCanvasTranslateByRightDownMove: boolean
	enableCanvasSelection: boolean
}

/**
 * 交互
 */
export class Interactive extends BaseInterface {
	private _enableCanvasZoomChange: boolean
	private _enableCanvasTranslate: boolean
	private _enableCanvasTranslateByLeftDownMove: boolean
	private _enableCanvasTranslateByRightDownMove: boolean
	private _enableCanvasSelection: boolean
	constructor() {
		super()
		this._enableCanvasZoomChange = true
		this._enableCanvasTranslate = true
		this._enableCanvasTranslateByLeftDownMove = false
		this._enableCanvasTranslateByRightDownMove = true
		this._enableCanvasSelection = true
	}

	public set enableCanvasZoomChange(value: boolean) {
		this._enableCanvasZoomChange = value
	}
	public get enableCanvasZoomChange(): boolean {
		return this._enableCanvasZoomChange
	}

	public set enableCanvasTranslate(value: boolean) {
		this._enableCanvasTranslate = value
	}
	public get enableCanvasTranslate(): boolean {
		return this._enableCanvasTranslate
	}

	public set enableCanvasTranslateByLeftDownMove(value: boolean) {
		this._enableCanvasTranslateByLeftDownMove = value
	}
	public get enableCanvasTranslateByLeftDownMove(): boolean {
		return this._enableCanvasTranslateByLeftDownMove
	}

	public set enableCanvasTranslateByRightDownMove(value: boolean) {
		this._enableCanvasTranslateByRightDownMove = value
	}
	public get enableCanvasTranslateByRightDownMove(): boolean {
		return this._enableCanvasTranslateByRightDownMove
	}

	public set enableCanvasSelection(value: boolean) {
		this._enableCanvasSelection = value
	}
	public get enableCanvasSelection(): boolean {
		return this._enableCanvasSelection
	}

	public toJSON(): TInteractiveProfile {
		return {
			enableCanvasZoomChange: this.enableCanvasZoomChange,
			enableCanvasTranslate: this.enableCanvasTranslate,
			enableCanvasTranslateByLeftDownMove: this.enableCanvasTranslateByLeftDownMove,
			enableCanvasTranslateByRightDownMove: this.enableCanvasTranslateByRightDownMove,
			enableCanvasSelection: this.enableCanvasSelection,
		}
	}

	public quit(): void {}
}
