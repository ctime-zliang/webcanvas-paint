import { BaseInterface } from '../../controller/BaseInterface'
import { Command } from './command/Command'
import { removeFromTo } from './Utils'

export class HistoryManager extends BaseInterface {
	private _commands: Array<Command>
	private _index: number
	private _limit: number
	private _isExecuting: boolean
	private _callback: () => void | null
	constructor(limit: number = 20) {
		super()
		this._commands = []
		this._index = 0
		this._limit = limit
		this._callback = null!
	}

	public get index(): number {
		return this._index
	}
	public set index(value: number) {
		this._index = value
	}

	public get isExecuting(): boolean {
		return this._isExecuting
	}

	private execute(command: Command, action: 'undo' | 'redo'): void {
		if (!command || typeof command[action] !== 'function') {
			throw new Error(`[history-manager][excute] parameter error.`)
		}
		this._isExecuting = true
		command[action]()
		this._isExecuting = false
	}

	public add(command: Command): HistoryManager {
		if (this._isExecuting) {
			return this
		}
		this._commands.splice(this.index + 1, this._commands.length - this.index)
		this._commands.push(command)
		if (this._limit && this._commands.length > this._limit) {
			removeFromTo(this._commands, 0, -(this._limit + 1))
		}
		this.index = this._commands.length - 1
		this._callback && this._callback()
		return this
	}

	public setCallback(callback: () => void | null): HistoryManager {
		this._callback = callback
		return this
	}

	public undo(): HistoryManager {
		let command: Command = this._commands[this.index]
		if (!command) {
			return this
		}
		const groupId: string = command.groupId
		while (command.groupId === groupId) {
			this.execute(command, 'undo')
			this.index -= 1
			command = this._commands[this.index]
			if (!command || !command.groupId) {
				break
			}
		}
		this._callback && this._callback()
		return this
	}

	public redo(): HistoryManager {
		let command: any = this._commands[this.index + 1]
		if (!command) {
			return this
		}
		const groupId: string = command.groupId
		while (command.groupId === groupId) {
			this.execute(command, 'redo')
			this.index += 1
			command = this._commands[this.index + 1]
			if (!command || !command.groupId) {
				break
			}
		}
		this._callback && this._callback()
		return this
	}

	public clear(): void {
		let prevSize: number = this._commands.length
		this._commands = []
		this.index = -1
		if (this._callback && prevSize > 0) {
			this._callback()
		}
	}

	public hasUndo(): boolean {
		return this.index !== -1 && this._commands.length >= 1
	}

	public hasRedo(): boolean {
		return this.index < this._commands.length - 1
	}

	public getCommands(groupId: string): Array<any> {
		return groupId
			? this._commands.filter((cItem: Command): boolean => {
					return cItem.groupId === groupId
			  })
			: this._commands
	}

	public quit(...args: Array<any>): void {
		this._commands.length = 0
		this._callback = undefined!
	}
}
