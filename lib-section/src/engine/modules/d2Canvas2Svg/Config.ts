import { ED2FontStyle } from '../../config/PrimitiveProfile'

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
