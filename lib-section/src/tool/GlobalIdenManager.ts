import { getHashIden } from '../engine/utils/Utils'

export class GlobalIdenManager {
	private _commandIdenPrefix: string
	private _drawLayerIdenPrefix: string
	private _elementIdenPrefix: string
	private _componentIdenPrefix: string
	private _eventHandlerIdenPrefix: string
	constructor() {
		this._commandIdenPrefix = `cmd_`
		this._drawLayerIdenPrefix = `draw_`
		this._elementIdenPrefix = `elem_`
		this._componentIdenPrefix = `copt_`
		this._eventHandlerIdenPrefix = `event`
	}

	public getCommandIden(): string {
		return this._commandIdenPrefix + this.getHashIden(12)
	}

	public getDrawLayerIden(): string {
		return this._drawLayerIdenPrefix + this.getHashIden(12)
	}

	public getElementIden(): string {
		return this._elementIdenPrefix + this.getHashIden(12)
	}

	public getComponentIden(): string {
		return this._componentIdenPrefix + this.getHashIden(12)
	}

	public getEventHandlerIden(): string {
		return this._eventHandlerIdenPrefix + +this.getHashIden(12)
	}

	public getHashIden(length: number = 18): string {
		return getHashIden(length)
	}
}
