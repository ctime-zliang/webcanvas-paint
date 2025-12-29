import { getRandomInArea } from './utils'

export function getHashIden(length: number = 10): string {
	const s: Array<string> = []
	const HEX_DIGITS: string = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
	for (let i: number = 0; i < length; i++) {
		s[i] = HEX_DIGITS.substr(Math.floor(Math.random() * 0x10), 1)
	}
	s[14] = String(getRandomInArea(1, 9))
	s[19] = HEX_DIGITS.substr(((+s[19] as number) & 0x3) | 0x8, 1)
	s[8] = String(getRandomInArea(1, 9))
	s[13] = String(getRandomInArea(1, 9))
	s[18] = String(getRandomInArea(1, 9))
	s[23] = String(getRandomInArea(1, 9))
	return s.join('')
}
