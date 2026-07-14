import { Color, TColorRGBAJSON } from '../../../engine/common/Color'

export class MaskColor {
	public static createStrokeColor(alpha: number = 0.65): Color {
		return new Color(255, 255, 255, alpha)
	}

	public static createFillColor(fillColor: TColorRGBAJSON): Color {
		return new Color(255, 255, 255, fillColor.a > 0 ? 0.75 : 0)
	}
}

export class RectBackgroud {
	public static createElementItemId(d2textShapeItemId: string): string {
		return 'bg' + d2textShapeItemId
	}
}
