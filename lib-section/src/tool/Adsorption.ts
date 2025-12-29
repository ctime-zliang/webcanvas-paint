import { Constant } from '../Constant'
import { Vector2 } from '../engine/algorithm/geometry/vector/Vector2'
import { Vector3 } from '../engine/algorithm/geometry/vector/Vector3'

export class Adsorption {
	public adsorpGrid(position: Vector2): Vector2 {
		const origin: Vector3 = Constant.environment.origin
		let snapX: number = Constant.systemConfig.canvasAidedDesign.axisSnapX
		let snapY: number = Constant.systemConfig.canvasAidedDesign.axisSnapY
		snapX = snapX || 1
		snapY = snapY || 1
		return new Vector2(this.getAdsValue(position.x - origin.x, snapX) + origin.x, this.getAdsValue(position.y - origin.y, snapY) + origin.y)
	}

	private getAdsValue(delta: number, snap: number): number {
		if (snap === 0) {
			return delta
		}
		const r: number = delta / snap
		let x1: number = Math.floor(r)
		let x2: number = Math.ceil(r)
		let x: number = 0
		if (Math.abs(x1 - r) > Math.abs(x2 - r)) {
			x = x2
		} else {
			x = x1
		}
		return x * snap
	}
}
