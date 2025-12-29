import { Vector2 } from '../../engine/algorithm/geometry/vector/Vector2'
import { ESweep } from '../../engine/config/CommonProfile'

export class ArcIdentify {
	private readonly _deltaAngle: number
	private _minLength: number
	constructor() {
		this._deltaAngle = (0.001 / 180) * Math.PI
		this._minLength = 0.01
	}

	/**
	 * start = ...fixStartPoint(start, this.end, this.center, this.radius, this.sweep)
	 */
	public fixStartPoint(start: Vector2, end: Vector2, center: Vector2, radius: number, sweep: ESweep): Vector2 {
		const OS: Vector2 = start.sub(center).normalize()
		const OE: Vector2 = end.sub(center).normalize()
		const angle: number = Math.acos(OS.dot(OE))
		const len: number = Math.abs(radius * angle)
		if (len > this._minLength && angle > this._deltaAngle) {
			return start
		}
		const min: number = this._minLength / radius
		const minAngle: number = Math.max(min, this._deltaAngle)
		let startAngle: number = start.getRadianByVector2(center)
		let endAngle: number = end.getRadianByVector2(center)
		let sweepAngle: number = this.getAngle(sweep, startAngle, endAngle)
		if (Math.abs(sweepAngle) > Math.PI) {
			if (sweep === ESweep.CCW) {
				startAngle = endAngle + minAngle
			} else {
				startAngle = endAngle - minAngle
			}
		} else {
			if (sweep === ESweep.CCW) {
				startAngle = endAngle - minAngle
			} else {
				startAngle = endAngle + minAngle
			}
		}
		let newStart: Vector2 = new Vector2(Math.cos(startAngle), Math.sin(startAngle)).mul(radius).add(center)
		return newStart
	}

	/**
	 * end = ...fixStartPoint(end, this.start, this.center, this.radius, this.sweep)
	 */
	public fixEndPoint(end: Vector2, start: Vector2, center: Vector2, radius: number, sweep: ESweep): Vector2 {
		const OS: Vector2 = start.sub(center).normalize()
		const OE: Vector2 = end.sub(center).normalize()
		const angle: number = Math.acos(OS.dot(OE))
		const len: number = Math.abs(radius * angle)
		if (len > this._minLength && angle > this._deltaAngle) {
			return start
		}
		const min: number = this._minLength / radius
		const minAngle: number = Math.max(min, this._deltaAngle)
		let startAngle: number = start.getRadianByVector2(center)
		let endAngle: number = end.getRadianByVector2(center)
		let sweepAngle: number = this.getAngle(sweep, startAngle, endAngle)
		if (Math.abs(sweepAngle) > Math.PI) {
			if (sweep === ESweep.CCW) {
				endAngle = startAngle - minAngle
			} else {
				endAngle = startAngle + minAngle
			}
		} else {
			if (sweep === ESweep.CCW) {
				endAngle = startAngle + minAngle
			} else {
				endAngle = startAngle - minAngle
			}
		}
		let newEnd: Vector2 = new Vector2(Math.cos(endAngle), Math.sin(endAngle)).mul(radius).add(center)
		return newEnd
	}

	public fixStartAngle(startAngle: number, endAngle: number, radius: number, sweep: ESweep): number {
		let startAngle2: number = startAngle
		let sweepAngle: number = this.getAngle(sweep, startAngle2, endAngle)
		let angle: number = Math.PI * 2 - sweepAngle
		angle = Math.min(angle, sweepAngle)
		let len: number = Math.abs(radius * angle)
		if (len > this._minLength && angle > this._deltaAngle) {
			return startAngle2
		}
		let min: number = this._minLength / radius
		let minAngle: number = Math.max(min, this._deltaAngle)
		if (Math.abs(sweepAngle) > Math.PI) {
			if (sweep === ESweep.CCW) {
				startAngle2 = endAngle + minAngle
			} else {
				startAngle2 = endAngle - minAngle
			}
		} else {
			if (sweep === ESweep.CCW) {
				startAngle2 = endAngle - minAngle
			} else {
				startAngle2 = endAngle + minAngle
			}
		}
		return startAngle2
	}

	public fixEndAngle(endAngle: number, startAngle: number, radius: number, sweep: ESweep): number {
		let endAngle2: number = endAngle
		let sweepAngle: number = this.getAngle(sweep, startAngle, endAngle2)
		let angle: number = Math.PI * 2 - sweepAngle
		angle = Math.min(angle, sweepAngle)
		let len: number = Math.abs(radius * angle)
		if (len > this._minLength && angle > this._deltaAngle) {
			return endAngle2
		}
		let min: number = this._minLength / radius
		let minAngle: number = Math.max(min, this._deltaAngle)
		if (Math.abs(sweepAngle) > Math.PI) {
			if (sweep === ESweep.CCW) {
				endAngle2 = startAngle - minAngle
			} else {
				endAngle2 = startAngle + minAngle
			}
		} else {
			if (sweep === ESweep.CCW) {
				endAngle2 = startAngle + minAngle
			} else {
				endAngle2 = startAngle - minAngle
			}
		}
		return endAngle2
	}

	private getAngle(sweep: ESweep, startAngle: number, endAngle: number): number {
		let startAngle2: number = (((startAngle % Math.PI) * 2 + Math.PI * 2) % Math.PI) * 2
		let endAngle2: number = (((endAngle % Math.PI) * 2 + Math.PI * 2) % Math.PI) * 2
		let angle: number = 0
		if (sweep === ESweep.CCW) {
			angle = ((endAngle2 - startAngle2 + Math.PI * 2) % Math.PI) * 2
		} else {
			angle = ((startAngle2 - endAngle2 + Math.PI * 2) % Math.PI) * 2
		}
		return (((angle % Math.PI) * 2 + Math.PI * 2) % Math.PI) * 2
	}
}
