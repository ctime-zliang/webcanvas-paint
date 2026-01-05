import { ECanvas2DLineCap } from '../../../../engine/config/PrimitiveProfile'

export class D2DashedSegUtils {
	static updateDashedSegProfile(
		lineCap: ECanvas2DLineCap,
		strokeWidth: number
	): {
		segSize: number
		gapSize: number
	} {
		let segSize: number = 2
		let gapSize: number = 1.5
		if (lineCap === ECanvas2DLineCap.ROUND) {
			segSize = 2
			gapSize = (strokeWidth / 2) * 5
		}
		return {
			segSize,
			gapSize,
		}
	}
}
