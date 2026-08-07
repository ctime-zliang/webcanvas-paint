import { Vector2 } from '../../engine/algorithm/geometry/vector/Vector2'
import { ESweep } from '../../engine/config/CommonProfile'

export class D2ArcIdentify {
	private static DELTA_RADIAN: number = (0.001 / 180) * Math.PI
	private static MIN_LENGTH: number = 1e-2

	/**
	 * start = ...fixStartPoint(start, this.end, this.center, this.radius, this.sweep)
	 */
	public static fixStartPoint(start: Vector2, end: Vector2, center: Vector2, radius: number, sweep: ESweep): Vector2 {
		const [OS, OE]: [Vector2, Vector2] = [start.sub(center).normalize(), end.sub(center).normalize()]
		const radian: number = Math.acos(OS.dot(OE))
		if (Math.abs(radius * radian) > D2ArcIdentify.MIN_LENGTH && radian > D2ArcIdentify.DELTA_RADIAN) {
			return start
		}
		const minRadian: number = Math.max(D2ArcIdentify.MIN_LENGTH / radius, D2ArcIdentify.DELTA_RADIAN)
		let [startRadian, endRadian]: [number, number] = [start.getRadianByVector2(center), end.getRadianByVector2(center)]
		const sweepRadian: number = D2ArcIdentify.getRadian(sweep, startRadian, endRadian)
		if (Math.abs(sweepRadian) > Math.PI) {
			startRadian = sweep === ESweep.CCW ? endRadian + minRadian : endRadian - minRadian
		} else {
			startRadian = sweep === ESweep.CCW ? endRadian - minRadian : endRadian + minRadian
		}
		const newStart: Vector2 = new Vector2(Math.cos(startRadian), Math.sin(startRadian)).mul(radius).add(center)
		return newStart
	}

	/**
	 * end = ...fixStartPoint(end, this.start, this.center, this.radius, this.sweep)
	 */
	public static fixEndPoint(end: Vector2, start: Vector2, center: Vector2, radius: number, sweep: ESweep): Vector2 {
		const [OS, OE]: [Vector2, Vector2] = [start.sub(center).normalize(), end.sub(center).normalize()]
		const radian: number = Math.acos(OS.dot(OE))
		if (Math.abs(radius * radian) > D2ArcIdentify.MIN_LENGTH && radian > D2ArcIdentify.DELTA_RADIAN) {
			return start
		}
		const minRadian: number = Math.max(D2ArcIdentify.MIN_LENGTH / radius, D2ArcIdentify.DELTA_RADIAN)
		let [startRadian, endRadian]: [number, number] = [start.getRadianByVector2(center), end.getRadianByVector2(center)]
		const sweepRadian: number = D2ArcIdentify.getRadian(sweep, startRadian, endRadian)
		if (Math.abs(sweepRadian) > Math.PI) {
			endRadian = sweep === ESweep.CCW ? startRadian - minRadian : startRadian + minRadian
		} else {
			endRadian = sweep === ESweep.CCW ? startRadian + minRadian : startRadian - minRadian
		}
		const newEnd: Vector2 = new Vector2(Math.cos(endRadian), Math.sin(endRadian)).mul(radius).add(center)
		return newEnd
	}

	public static fixStartRadian(startRadian: number, endRadian: number, radius: number, sweep: ESweep): number {
		const _startRadian: number = startRadian
		const sweepRadian: number = D2ArcIdentify.getRadian(sweep, _startRadian, endRadian)
		let radian: number = Math.PI * 2 - sweepRadian
		radian = Math.min(radian, sweepRadian)
		if (Math.abs(radius * radian) > D2ArcIdentify.MIN_LENGTH && radian > D2ArcIdentify.DELTA_RADIAN) {
			return _startRadian
		}
		const minRadian: number = Math.max(D2ArcIdentify.MIN_LENGTH / radius)
		if (Math.abs(sweepRadian) > Math.PI) {
			if (sweep === ESweep.CCW) {
				return endRadian + minRadian
			}
			return endRadian - minRadian
		}
		if (sweep === ESweep.CCW) {
			return endRadian - minRadian
		}
		return endRadian + minRadian
	}

	public static fixEndRadian(endRadian: number, startRadian: number, radius: number, sweep: ESweep): number {
		const _endRadian: number = endRadian
		const sweepRadian: number = D2ArcIdentify.getRadian(sweep, startRadian, _endRadian)
		let radian: number = Math.PI * 2 - sweepRadian
		radian = Math.min(radian, sweepRadian)
		if (Math.abs(radius * radian) > D2ArcIdentify.MIN_LENGTH && radian > D2ArcIdentify.DELTA_RADIAN) {
			return _endRadian
		}
		const minRadian: number = Math.max(D2ArcIdentify.MIN_LENGTH / radius, D2ArcIdentify.DELTA_RADIAN)
		if (Math.abs(sweepRadian) > Math.PI) {
			if (sweep === ESweep.CCW) {
				return startRadian - minRadian
			}
			return startRadian + minRadian
		}
		if (sweep === ESweep.CCW) {
			return startRadian + minRadian
		}
		return startRadian - minRadian
	}

	private static getRadian(sweep: ESweep, startRadian: number, endRadian: number): number {
		const _startRadian: number = (((startRadian % Math.PI) * 2 + Math.PI * 2) % Math.PI) * 2
		const _endRadian: number = (((endRadian % Math.PI) * 2 + Math.PI * 2) % Math.PI) * 2
		const radian: number = sweep === ESweep.CCW ? ((_endRadian - _startRadian + Math.PI * 2) % Math.PI) * 2 : ((_startRadian - _endRadian + Math.PI * 2) % Math.PI) * 2
		return (((radian % Math.PI) * 2 + Math.PI * 2) % Math.PI) * 2
	}
}
