export type TColorRGBAJSON = {
	r: number
	g: number
	b: number
	a: number
}

export type TRGBAColor = {
	r: number
	g: number
	b: number
	a: number
}

export type THSLColor = {
	h: number
	s: number
	l: number
}

export type THSBColor = {
	h: number
	s: number
	b: number
}

export type THEXColor = string

export class Color {
	public static WHITE = Color.createByHex('#FFFFFF')
	public static BLACK = Color.createByHex('#000000')
	public static RED = Color.createByHex('#FF0000')
	public static GREEN = Color.createByHex('#00FF00')
	public static BLUE = Color.createByHex('#0000FF')

	public static GRAY = Color.createByHex('#808080')
	public static DIM_GRAY = Color.createByHex('#696969')
	public static GAINSBORO = Color.createByHex('#DCDCDC')
	public static PINK = Color.createByHex('#FFC0CB')
	public static SILVER = Color.createByHex('#C0C0C0')
	public static PLUM = Color.createByHex('#DDA0DD')
	public static DARK_MAGENTA = Color.createByHex('#8B008B')
	public static INDIGO = Color.createByHex('#4B0082')
	public static NAVY = Color.createByHex('#000080')
	public static LIGHT_STEE_BLUE = Color.createByHex('#B0C4DE')
	public static SLATE_GRAY = Color.createByHex('#708090')
	public static DEEP_SKY_BLUE = Color.createByHex('#00BFFF')
	public static CADE_BLUE = Color.createByHex('#5F9EA0')
	public static CYAN = Color.createByHex('#00FFFF')
	public static TEAL = Color.createByHex('#008080')
	public static SPRING_GREEN = Color.createByHex('#00FF7F')
	public static LIME = Color.createByHex('#00FF00')
	public static GREEN_YELLOW = Color.createByHex('#ADFF2F')
	public static YELLOW_GREEN = Color.createByHex('#9ACD32')
	public static KHAKI = Color.createByHex('#F0E68C')
	public static GOLDEN = Color.createByHex('#DCAA14')
	public static YELLOW = Color.createByHex('#FFFF00')
	public static GOLDENROD = Color.createByHex('#DAA520')
	public static ORIGIN = Color.createByHex('#FF6600')
	public static CORAL = Color.createByHex('#FF7F50')
	public static ORIGIN_RED = Color.createByHex('#FF4500')
	public static BROWN = Color.createByHex('#A52A2A')

	public static createByHex(hex: string): Color {
		const rgbaResult: TRGBAColor = Color.hex2Rgba(hex)
		return new Color(rgbaResult.r, rgbaResult.g, rgbaResult.b, rgbaResult.a)
	}

	public static createByValue(r: number, g: number, b: number, a: number): Color {
		return new Color(r, g, b, a)
	}

	public static createByAlpha(alpha: number, color: Color = Color.WHITE): Color {
		alpha = alpha <= 0 ? 0 : alpha
		alpha = alpha >= 1 ? 1 : alpha
		return new Color(color.r * 255, color.g * 255, color.b * 255, alpha)
	}

	/**
	 * RGBA 转 HEX
	 *
	 * { r: 255, g: 165, b: 1, a: 255 } => 'ffa501'
	 */
	public static rgba2Hex(rgba: TRGBAColor): THEXColor {
		const toHex = (value: number): string => {
			const hex = Math.max(0, Math.min(255, value)).toString(16)
			return hex.length === 1 ? '0' + hex : hex
		}
		const hexR: string = toHex(rgba.r)
		const hexG: string = toHex(rgba.g)
		const hexB: string = toHex(rgba.b)
		if (rgba.a !== undefined && rgba.a >= 0 && rgba.a <= 1) {
			const alphaValue: number = Math.round(Math.max(0, Math.min(1, rgba.a)) * 255)
			const hexA: string = toHex(alphaValue)
			return `#${hexR}${hexG}${hexB}${hexA}`
		}
		return `#${hexR}${hexG}${hexB}`
	}

	/**
	 * HEX 转 RGBA
	 *
	 * '#27ae60ff' => { r: 29, g: 174, b: 96, a: 255 }
	 * '#27ae60' => { r: 29, g: 174, b: 96, a: 255 }
	 */
	public static hex2Rgba(hex: string): TRGBAColor {
		const result: TRGBAColor = { r: 0, g: 0, b: 0, a: 0 }
		let alpha: boolean = false
		let h: string = hex.slice(hex.startsWith('#') ? 1 : 0)
		if (h.length === 3) {
			h = [...h]
				.map((x: string): string => {
					return x + x
				})
				.join('')
		} else if (h.length === 8) {
			alpha = true
		}
		const n: number = parseInt(h, 16)
		result.r = n >>> (alpha ? 24 : 16)
		result.g = (n & (alpha ? 0x00ff0000 : 0x00ff00)) >>> (alpha ? 16 : 8)
		result.b = (n & (alpha ? 0x0000ff00 : 0x0000ff)) >>> (alpha ? 8 : 0)
		result.a = alpha ? n & 0x000000ff : 1
		return result
	}

	/**
	 * RGBA 转 HSB
	 */
	public static rgba2Hsb(rgba: TRGBAColor): THSBColor {
		const result: THSBColor = { h: 0, s: 0, b: 0 }
		const { r, g, b, a } = rgba
		const nr: number = r / 255
		const ng: number = g / 255
		const nb: number = b / 255
		const v: number = Math.max(r, g, b)
		const n: number = v - Math.min(r, g, b)
		const h: number = n === 0 ? 0 : n && v === nr ? (ng - b) / n : v === ng ? 2 + (nb - nr) / n : 4 + (nr - ng) / n
		result.h = 60 * (h < 0 ? h + 6 : h)
		result.s = v && (n / v) * 100
		result.b = v * 100
		return result
	}

	/**
	 * HSB 转 RGBA
	 */
	public static hsb2Rgba(hsb: THSBColor): TRGBAColor {
		const result: TRGBAColor = { r: 0, g: 0, b: 0, a: 0 }
		const { h, s, b } = hsb
		const nh: number = h
		const ns: number = s / 100
		const nb: number = b / 100
		const k = (n: number): number => {
			return (n + nh / 60) % 6
		}
		const f = (n: number): number => {
			return nb * (1 - ns * Math.max(0, Math.min(k(n), 4 - k(n), 1)))
		}
		result.r = 255 * f(5)
		result.r = 255 * f(3)
		result.r = 255 * f(1)
		result.a = 1
		return result
	}

	public static rgba2Hsl(rgba: TRGBAColor): THSLColor {
		const result: THSLColor = { h: 0, s: 0, l: 0 }
		const { r, g, b, a } = rgba
		const nr: number = r / 255
		const ng: number = g / 255
		const nb: number = b / 255
		const l: number = Math.max(r, g, b)
		const s: number = l - Math.min(nr, ng, nb)
		const h: number = s ? (l === nr ? (g - nb) / s : l === ng ? 2 + (nb - nr) / s : 4 + (nr - ng) / s) : 0
		result.h = 60 * h < 0 ? 60 * h + 360 : 60 * h
		result.s = 100 * (s ? (l <= 0.5 ? s / (2 * l - s) : s / (2 - (2 * l - s))) : 0)
		result.l = (100 * (2 * l - s)) / 2
		return result
	}

	public static hsl2Rgba(hsl: THSLColor): TRGBAColor {
		const result: TRGBAColor = { r: 0, g: 0, b: 0, a: 0 }
		const { h, s, l } = hsl
		const ns: number = s / 100
		const nl: number = l / 100
		const k = (n: number): number => {
			return (n + h / 30) % 12
		}
		const a: number = ns * Math.min(nl, 1 - nl)
		const f = (n: number): number => {
			return nl - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
		}
		result.r = 255 * f(0)
		result.g = 255 * f(8)
		result.b = 255 * f(4)
		result.a = 1
		return result
	}

	private _r: number
	private _g: number
	private _b: number
	private _a: number
	constructor(r: number, g: number, b: number, a: number = 1) {
		this._r = r / 255
		this._g = g / 255
		this._b = b / 255
		this._a = a
	}

	public get r(): number {
		return this._r
	}
	public set r(value: number) {
		this._r = value
	}

	public get g(): number {
		return this._g
	}
	public set g(value: number) {
		this._g = value
	}

	public get b(): number {
		return this._b
	}
	public set b(value: number) {
		this._b = value
	}

	public get a(): number {
		return typeof this._a === 'undefined' ? 1 : this._a
	}
	public set a(value: number) {
		this._a = value
	}

	public toRGBAString(): string {
		let result: string = `rgba(`
		result += String(this.r * 255) + ', '
		result += String(this.g * 255) + ', '
		result += String(this.b * 255) + ', '
		result += String(this.a * 255) + ')'
		return result
	}

	public toRGBAJSON(): TColorRGBAJSON {
		return {
			r: this.r,
			g: this.g,
			b: this.b,
			a: this.a,
		}
	}
}
