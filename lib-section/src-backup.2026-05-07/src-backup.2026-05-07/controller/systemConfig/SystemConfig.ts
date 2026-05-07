import { ECoreEngineType, ECoreRenderMode } from '../../engine/config/CommonProfile'
import { BaseInterface } from '../BaseInterface'
import { CanvasAidedDesign, TCanvasAidedDesignProfile } from './CanvasAidedDesign'
import { Interactive, TInteractiveProfile } from './Interactive'
import { Theme, TThemeProfile } from './Theme'

export type TSystemConfigJSONData = {
	enbaleOperationMessagesNotify: boolean
	coreEngineType: ECoreEngineType
	renderMode: ECoreRenderMode
	interactive: TInteractiveProfile
	canvasAidedDesign: TCanvasAidedDesignProfile
	theme: TThemeProfile
}

export class SystemConfig extends BaseInterface {
	private _interactive: Interactive
	private _canvasAidedDesign: CanvasAidedDesign
	private _theme: Theme
	private _enbaleOperationMessagesNotify: boolean
	private _enbaleFPSCount: boolean
	private _coreEngineType: ECoreEngineType
	private _renderMode: ECoreRenderMode
	constructor() {
		super()
		this._interactive = new Interactive()
		this._canvasAidedDesign = new CanvasAidedDesign()
		this._theme = new Theme()
		this._enbaleOperationMessagesNotify = true
		this._enbaleFPSCount = false
		this._coreEngineType = ECoreEngineType.WEBGL
		this._renderMode = ECoreRenderMode.D2
	}

	public get renderMode(): ECoreRenderMode {
		return this._renderMode
	}
	public set renderMode(value: ECoreRenderMode) {
		this._renderMode = value
	}

	public get interactive(): Interactive {
		return this._interactive
	}

	public get canvasAidedDesign(): CanvasAidedDesign {
		return this._canvasAidedDesign
	}

	public get theme(): Theme {
		return this._theme
	}

	public get enbaleOperationMessagesNotify(): boolean {
		return this._enbaleOperationMessagesNotify
	}
	public set enbaleOperationMessagesNotify(value: boolean) {
		this._enbaleOperationMessagesNotify = value
	}

	public get enbaleFPSCount(): boolean {
		return this._enbaleFPSCount
	}
	public set enbaleFPSCount(value: boolean) {
		this._enbaleFPSCount = value
	}

	public get coreEngineType(): ECoreEngineType {
		return this._coreEngineType
	}
	public set coreEngineType(value: ECoreEngineType) {
		this._coreEngineType = value
	}

	public toJSON(): TSystemConfigJSONData {
		return {
			enbaleOperationMessagesNotify: this.enbaleOperationMessagesNotify,
			coreEngineType: this.coreEngineType,
			renderMode: this.renderMode,
			interactive: this.interactive.toJSON(),
			canvasAidedDesign: this.canvasAidedDesign.toJSON(),
			theme: this.theme.toJSON(),
		}
	}

	public update(moduleName: 'Interactive' | 'CanvasAidedDesign' | 'Theme' | string, key: string, value: any): void {
		if (moduleName === 'Interactive') {
			if (key && typeof this.interactive[key as keyof Interactive] !== 'undefined') {
				// @ts-ignore
				this.interactive[key as keyof Interactive] = value
			}
			return
		}
		if (moduleName === 'CanvasAidedDesign') {
			if (key && typeof this.canvasAidedDesign[key as keyof CanvasAidedDesign] !== 'undefined') {
				// @ts-ignore
				this.canvasAidedDesign[key as keyof CanvasAidedDesign] = value
			}
			return
		}
		if (moduleName === 'Theme') {
			if (key && typeof this.theme[key as keyof Theme] !== 'undefined') {
				// @ts-ignore
				this.theme[key as keyof Theme] = value
			}
			return
		}
		if (moduleName && typeof (this as any)[moduleName] !== 'undefined') {
			// @ts-ignore
			this[moduleName] = key as any
		}
	}

	public quit(): void {
		this._interactive.quit()
		this._interactive = undefined!
		this._canvasAidedDesign.quit()
		this._canvasAidedDesign = undefined!
		this._theme.quit()
		this._theme = undefined!
	}
}
