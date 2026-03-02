import { BaseInterface } from '../../../controller/BaseInterface'

export abstract class Command extends BaseInterface {
	private _groupId: string
	constructor(groupId: string) {
		super()
		this._groupId = groupId
	}

	public get groupId(): string {
		return this._groupId
	}
	public set groupId(value: string) {
		this.groupId = value
	}

	public abstract undo(): void

	public abstract redo(): void

	protected abstract modify(...args: Array<any>): void

	protected abstract rebuild(...args: Array<any>): void

	protected abstract delete(...args: Array<any>): void
}
