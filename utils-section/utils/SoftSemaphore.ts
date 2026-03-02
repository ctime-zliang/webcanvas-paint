export class SoftSemaphore {
	private _resources: number
	private _maxResources: number
	private _idles: Array<Function>
	private _closePromise: Promise<void>
	private _closeResolve: Function
	constructor(maxResources: number) {
		this._resources = maxResources
		this._maxResources = maxResources
		this._idles = []
		this._closePromise = null!
		this._closeResolve = null!
	}

	public acquire(callback: Function): void {
		if (this._closePromise !== null) {
			throw new Error(`semaphore is close.`)
		}
		if (this._resources > 0) {
			this._resources--
			callback()
			return
		}
		this._idles.push(callback)
	}

	public acquireSync(): Promise<any> {
		return new Promise<void>((resolve): void => {
			this.acquire(resolve)
		})
	}

	public release(): void {
		const callback: Function = this._idles.shift()!
		if (callback && callback instanceof Function) {
			callback()
		} else {
			this._resources++
		}
		if (this._closePromise !== null && this._resources === this._maxResources) {
			this._closeResolve()
		}
	}

	public async close(): Promise<Function> {
		if (this._closePromise === null) {
			this._closePromise = new Promise<void>((resolve): void => {
				this._closeResolve = resolve
				if (this._resources === this._maxResources) {
					this._closeResolve()
				}
			})
		}
		return this._closeResolve
	}

	public isFull(): boolean {
		return this._resources === 0
	}

	public clear(): void {
		this._resources = 0
		for (let i: number = 0; i < this._idles.length; i++) {
			Promise.resolve(this._idles[i])
		}
		this._idles.length = 0
	}
}
