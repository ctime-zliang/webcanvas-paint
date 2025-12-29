import { Status } from './Status'

export class Context {
	private _status: number
	constructor(status: number) {
		this._status = status
	}

	public get status(): number {
		return this._status
	}
	public set status(status: number) {
		this._status = status
	}

	public isStatusMatch(bitIndex: number): boolean {
		return Status.isStatusMatch(this._status, bitIndex)
	}

	public setStatusMatch(bitIndex: number, value: boolean): number {
		const statusResult: number = Status.setStatusMatch(bitIndex, this._status, value)
		this._status = statusResult
		return statusResult
	}
}
