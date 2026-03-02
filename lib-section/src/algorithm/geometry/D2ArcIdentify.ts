import { Vector2 } from '../../engine/algorithm/geometry/vector/Vector2'
import { ESweep } from '../../engine/config/CommonProfile'

export class D2ArcIdentify {
	private readonly _deltaRadian: number
	private _minLength: number
	constructor() {
		this._deltaRadian = (0.001 / 180) * Math.PI
		this._minLength = 0.01
	}

	/**
	 * start = ...fixStartPoint(start, this.end, this.center, this.radius, this.sweep)
	 */
	public fixStartPoint(start: Vector2, end: Vector2, center: Vector2, radius: number, sweep: ESweep): Vector2 {
		const [OS, OE]: [Vector2, Vector2] = [start.sub(center).normalize(), end.sub(center).normalize()]
		const radian: number = Math.acos(OS.dot(OE))
		const len: number = Math.abs(radius * radian)
		if (len > this._minLength && radian > this._deltaRadian) {
			return start
		}
		const min: number = this._minLength / radius
		const minRadian: number = Math.max(min, this._deltaRadian)
		let [startRadian, endRadian]: [number, number] = [start.getRadianByVector2(center), end.getRadianByVector2(center)]
		let sweepRadian: number = this.getRadian(sweep, startRadian, endRadian)
		if (Math.abs(sweepRadian) > Math.PI) {
			if (sweep === ESweep.CCW) {
				startRadian = endRadian + minRadian
			} else {
				startRadian = endRadian - minRadian
			}
		} else {
			if (sweep === ESweep.CCW) {
				startRadian = endRadian - minRadian
			} else {
				startRadian = endRadian + minRadian
			}
		}
		let newStart: Vector2 = new Vector2(Math.cos(startRadian), Math.sin(startRadian)).mul(radius).add(center)
		return newStart
	}

	/**
	 * end = ...fixStartPoint(end, this.start, this.center, this.radius, this.sweep)
	 */
	public fixEndPoint(end: Vector2, start: Vector2, center: Vector2, radius: number, sweep: ESweep): Vector2 {
		const [OS, OE]: [Vector2, Vector2] = [start.sub(center).normalize(), end.sub(center).normalize()]
		const radian: number = Math.acos(OS.dot(OE))
		const len: number = Math.abs(radius * radian)
		if (len > this._minLength && radian > this._deltaRadian) {
			return start
		}
		const min: number = this._minLength / radius
		const minRadian: number = Math.max(min, this._deltaRadian)
		let [startRadian, endRadian]: [number, number] = [start.getRadianByVector2(center), end.getRadianByVector2(center)]
		let sweepRadian: number = this.getRadian(sweep, startRadian, endRadian)
		if (Math.abs(sweepRadian) > Math.PI) {
			if (sweep === ESweep.CCW) {
				endRadian = startRadian - minRadian
			} else {
				endRadian = startRadian + minRadian
			}
		} else {
			if (sweep === ESweep.CCW) {
				endRadian = startRadian + minRadian
			} else {
				endRadian = startRadian - minRadian
			}
		}
		let newEnd: Vector2 = new Vector2(Math.cos(endRadian), Math.sin(endRadian)).mul(radius).add(center)
		return newEnd
	}

	public fixStartRadian(startRadian: number, endRadian: number, radius: number, sweep: ESweep): number {
		let startRadian2: number = startRadian
		let sweepRadian: number = this.getRadian(sweep, startRadian2, endRadian)
		let radian: number = Math.PI * 2 - sweepRadian
		radian = Math.min(radian, sweepRadian)
		let len: number = Math.abs(radius * radian)
		if (len > this._minLength && radian > this._deltaRadian) {
			return startRadian2
		}
		let min: number = this._minLength / radius
		let minRadian: number = Math.max(min, this._deltaRadian)
		if (Math.abs(sweepRadian) > Math.PI) {
			if (sweep === ESweep.CCW) {
				startRadian2 = endRadian + minRadian
			} else {
				startRadian2 = endRadian - minRadian
			}
		} else {
			if (sweep === ESweep.CCW) {
				startRadian2 = endRadian - minRadian
			} else {
				startRadian2 = endRadian + minRadian
			}
		}
		return startRadian2
	}

	public fixEndRadian(endRadian: number, startRadian: number, radius: number, sweep: ESweep): number {
		let endRadian2: number = endRadian
		let sweepRadian: number = this.getRadian(sweep, startRadian, endRadian2)
		let radian: number = Math.PI * 2 - sweepRadian
		radian = Math.min(radian, sweepRadian)
		let len: number = Math.abs(radius * radian)
		if (len > this._minLength && radian > this._deltaRadian) {
			return endRadian2
		}
		let min: number = this._minLength / radius
		let minRadian: number = Math.max(min, this._deltaRadian)
		if (Math.abs(sweepRadian) > Math.PI) {
			if (sweep === ESweep.CCW) {
				endRadian2 = startRadian - minRadian
			} else {
				endRadian2 = startRadian + minRadian
			}
		} else {
			if (sweep === ESweep.CCW) {
				endRadian2 = startRadian + minRadian
			} else {
				endRadian2 = startRadian - minRadian
			}
		}
		return endRadian2
	}

	private getRadian(sweep: ESweep, startRadian: number, endRadian: number): number {
		let startRadian2: number = (((startRadian % Math.PI) * 2 + Math.PI * 2) % Math.PI) * 2
		let endRadian2: number = (((endRadian % Math.PI) * 2 + Math.PI * 2) % Math.PI) * 2
		let radian: number = 0
		if (sweep === ESweep.CCW) {
			radian = ((endRadian2 - startRadian2 + Math.PI * 2) % Math.PI) * 2
		} else {
			radian = ((startRadian2 - endRadian2 + Math.PI * 2) % Math.PI) * 2
		}
		return (((radian % Math.PI) * 2 + Math.PI * 2) % Math.PI) * 2
	}
}
