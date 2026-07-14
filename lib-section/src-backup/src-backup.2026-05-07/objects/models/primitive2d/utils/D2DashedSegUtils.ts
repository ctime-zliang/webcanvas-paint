import { ECanvasD2LineCap } from '../../../../engine/config/PrimitiveProfile'

export class D2DashedSegUtils {
	public static updateDashedSegProfile(
		lineCap: ECanvasD2LineCap,
		strokeWidth: number
	): {
		segSize: number
		gapSize: number
	} {
		let segSize: number = (strokeWidth / 2) * 2
		let gapSize: number = strokeWidth / 2
		if (lineCap === ECanvasD2LineCap.ROUND) {
			segSize = (strokeWidth / 2) * 2
			gapSize = (strokeWidth / 2) * 5
		}
		return {
			segSize,
			gapSize,
		}
	}
}
