import { ED2FontStyle } from '../../config/PrimitiveProfile'

/**
 * Canvas 绘制文本的标准像素基准尺寸
 */
export const CANVAS_DRAW_TEXT_STD_MM: number = 100

export type TOptional = {
	fontFamily?: string
	fontStyle?: ED2FontStyle
	fontVariant?: string
	fontWeight?: number
}

export function createDefaultOptional(): TOptional {
	return {
		fontFamily: 'normal',
		fontStyle: ED2FontStyle.NORMAL,
		fontVariant: 'normal',
		fontWeight: 100,
	}
}
