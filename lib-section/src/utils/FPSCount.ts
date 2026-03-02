export class FPSCount {
	private _fps: number
	private _lastFreshTimeStamp: number
	private _freshInterval: number
	private _recordCount: number
	private _diffFreshInterval: number
	constructor(freshInterval: number = 200) {
		this._fps = 0
		this._lastFreshTimeStamp = 0
		this._freshInterval = freshInterval >= 1000 ? 1000 : freshInterval <= 10 ? 10 : freshInterval
		this._recordCount = 0
		this._diffFreshInterval = 0
	}

	public getFPSCount(): number {
		return this._fps
	}

	public getDiffFreshInterval(): number {
		return this._diffFreshInterval >> 0
	}

	public calcFPSCount(nowTimeStamp: number): void {
		const distTimeStamp: number = nowTimeStamp - this._lastFreshTimeStamp
		if (distTimeStamp >= this._freshInterval) {
			this._fps = (1000 / (distTimeStamp / this._recordCount)) >> 0
			this._recordCount = 0
			this._lastFreshTimeStamp = nowTimeStamp
			this._diffFreshInterval = distTimeStamp
		}
		this._recordCount++
	}
}
