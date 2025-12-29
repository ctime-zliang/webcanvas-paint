import { TElementJSONBaseData } from '../../../engine/types/Primitive'
import { Command } from './Command'
import { ECommandAction } from './Config'

export abstract class ElementCommand<T extends TElementJSONBaseData> extends Command {
	private _action: ECommandAction
	private _itemData: T
	constructor(groupId: string, action: ECommandAction) {
		super(groupId)
		this._action = action
		this._itemData = undefined!
	}

	public get action(): ECommandAction {
		return this._action
	}
	public set action(value: ECommandAction) {
		this.action = value
	}

	public get itemData(): T {
		return this._itemData
	}
	public set itemData(value: T) {
		this._itemData = value
	}

	public undo(): void {
		if (this.action === ECommandAction.MODIFY) {
			this.modify()
			return
		}
		if (this.action === ECommandAction.ADD) {
			this.delete()
			return
		}
		if (this.action === ECommandAction.DELETE) {
			this.rebuild()
			return
		}
	}

	public redo(): void {
		if (this.action === ECommandAction.MODIFY) {
			this.modify()
			return
		}
		if (this.action === ECommandAction.ADD) {
			this.rebuild()
			return
		}
		if (this.action === ECommandAction.DELETE) {
			this.delete()
			return
		}
	}
}
