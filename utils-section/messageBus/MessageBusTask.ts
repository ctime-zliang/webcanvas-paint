import { deepClone } from '../utils/Utils'
import { MessageBusBridge } from './MessageBusBridge'
import { MessageCallback } from './profiles'

export class MessageBusTask {
	private _callback: MessageCallback
	private _isRunning: boolean
	constructor(callback: MessageCallback) {
		this._isRunning = true
		this._callback = callback
	}

	public cancel(): void {
		this._isRunning = false
		this._callback = null!
	}

	public getRunnigStatus(): boolean {
		return this._isRunning
	}

	public execute(data: any, bridge?: MessageBusBridge, source?: any, keepRef?: boolean): void {
		try {
			const _data: any = keepRef ? data : deepClone(data)
			this._callback(_data, bridge, source)
		} catch (e) {
			console.error(e)
		}
	}
}
