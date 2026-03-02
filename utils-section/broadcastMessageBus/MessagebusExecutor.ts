import { deepClone } from '../utils/Utils'
import { MessageCallback } from './profiles'

export class MessagebusExecutor {
	private readonly _keepRef: boolean
	private _isRunning: boolean
	private _callback: MessageCallback
	constructor(callback: MessageCallback, keepRef: boolean) {
		this._callback = callback
		this._keepRef = keepRef
	}

	public cancel(): void {
		this._callback = null!
		this._isRunning = false
	}

	public getRunnigStatus(): boolean {
		return this._isRunning
	}

	public async execute(data: any): Promise<void> {
		try {
			const _data: any = this._keepRef ? data : deepClone(data)
			this._callback(_data)
		} catch (e) {
			console.error(e)
		}
	}
}
