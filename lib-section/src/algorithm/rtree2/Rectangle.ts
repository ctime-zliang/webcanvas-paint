import { TSimpleRect } from './Rtree'

export class Rectangle {
	/**
	 * 判断 a 与 b 是否有重叠
	 */
	static overlapRectangle(a: TSimpleRect, b: TSimpleRect): boolean {
		if ((a.h === 0 && a.w === 0) || (b.h === 0 && b.w === 0)) {
			return a.x <= b.x + b.w && a.x + a.w >= b.x && a.y <= b.y + b.h && a.y + a.h >= b.y
		}
		return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
	}

	/**
	 * 判断 a 是否包含于 b 中
	 */
	static containsRectangle(a: TSimpleRect, b: TSimpleRect): boolean {
		return a.x + a.w <= b.x + b.w && a.x >= b.x && a.y + a.h <= b.y + b.h && a.y >= b.y
	}

	/**
	 * 读取 nodes 中各项的矩形尺寸, 重新修改 expandRect 的矩形尺寸
	 * 以使得 expandRect 能够包含所有 nodes[i]
	 */
	static makeMBR(expandRect: TSimpleRect, nodes: Array<TSimpleRect>): TSimpleRect {
		if (!nodes.length) {
			return {
				x: 0,
				y: 0,
				w: 0,
				h: 0,
			}
		}
		expandRect.x = nodes[0].x
		expandRect.y = nodes[0].y
		expandRect.w = nodes[0].w
		expandRect.h = nodes[0].h
		let len: number = nodes.length
		for (let i: number = 1; i < len; i++) {
			Rectangle.expandRectangle(expandRect, nodes[i])
		}
		return expandRect
	}

	/**
	 * 读取 b 的尺寸数据来修改 a 的尺寸数据
	 * 使得 a 占用范围能够"包裹" b
	 *
	 * a - 待扩展的矩形
	 * b - 被覆盖的矩形
	 */
	static expandRectangle(a: TSimpleRect, b: TSimpleRect): TSimpleRect {
		let nx: number = 0
		let ny: number = 0
		let axw: number = a.x + a.w
		let bxw: number = b.x + b.w
		let ayh: number = a.y + a.h
		let byh: number = b.y + b.h
		nx = a.x > b.x ? b.x : a.x
		ny = a.y > b.y ? b.y : a.y
		a.w = axw > bxw ? axw - nx : bxw - nx
		a.h = ayh > byh ? ayh - ny : byh - ny
		a.x = nx
		a.y = ny
		return a
	}

	static squarifiedRatio(l: number, w: number, fill: number): number {
		// const lperi = (l + w) / 2
		// const larea = l * w
		// const lgeo = larea / (lperi * lperi)
		// return (larea * fill) / lgeo
		const a = (l + w) / 2
		return a * a * fill
	}
}
