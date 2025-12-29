function ge(): (...args: Array<any>) => number {
	function A(list: Array<number>, l: number, h: number, target: number): number {
		let i: number = h + 1
		while (l <= h) {
			let m: number = (l + h) >>> 1
			let listItem: number = list[m]
			if (listItem >= target) {
				i = m
				h = m - 1
			} else {
				l = m + 1
			}
		}
		return i
	}
	function P(list: Array<number>, l: number, h: number, target: number, c: (listItem: number, target: number) => number): number {
		let i: number = h + 1
		while (l <= h) {
			let m: number = (l + h) >>> 1
			let listItem: number = list[m]
			if (c(listItem, target) >= 0) {
				i = m
				h = m - 1
			} else {
				l = m + 1
			}
		}
		return i
	}
	return function (list: Array<number>, target: number, c: number, l: number, h: number): number {
		if (typeof c === 'function') {
			return P(list, l === void 0 ? 0 : l | 0, h === void 0 ? list.length - 1 : h | 0, target, c)
		} else {
			return A(list, c === void 0 ? 0 : c | 0, l === void 0 ? list.length - 1 : l | 0, target)
		}
	}
}

function gt(): (...args: Array<any>) => number {
	function A(list: Array<number>, l: number, h: number, target: number): number {
		let i: number = h + 1
		while (l <= h) {
			let m: number = (l + h) >>> 1
			let listItem: number = list[m]
			if (listItem > target) {
				i = m
				h = m - 1
			} else {
				l = m + 1
			}
		}
		return i
	}
	function P(list: Array<number>, l: number, h: number, target: number, c: (listItem: number, target: number) => number): number {
		let i: number = h + 1
		while (l <= h) {
			let m: number = (l + h) >>> 1
			let listItem: number = list[m]
			if (c(listItem, target) > 0) {
				i = m
				h = m - 1
			} else {
				l = m + 1
			}
		}
		return i
	}
	return function (list: Array<number>, target: number, c: number | ((listItem: number, target: number) => number), l: number, h: number): number {
		if (typeof c === 'function') {
			return P(list, l === void 0 ? 0 : l | 0, h === void 0 ? list.length - 1 : h | 0, target, c)
		} else {
			return A(list, c === void 0 ? 0 : c | 0, l === void 0 ? list.length - 1 : l | 0, target)
		}
	}
}

function lt(): (...args: Array<any>) => number {
	function A(list: Array<number>, l: number, h: number, target: number): number {
		let i: number = l - 1
		while (l <= h) {
			let m: number = (l + h) >>> 1
			let listItem: number = list[m]
			if (listItem < target) {
				i = m
				l = m + 1
			} else {
				h = m - 1
			}
		}
		return i
	}
	function P(list: Array<number>, l: number, h: number, target: number, c: (listItem: number, target: number) => number): number {
		let i: number = l - 1
		while (l <= h) {
			let m: number = (l + h) >>> 1
			let listItem: number = list[m]
			if (c(listItem, target) < 0) {
				i = m
				l = m + 1
			} else {
				h = m - 1
			}
		}
		return i
	}
	return function (list: Array<number>, target: number, c: number | ((listItem: number, target: number) => number), l: number, h: number): number {
		if (typeof c === 'function') {
			return P(list, l === void 0 ? 0 : l | 0, h === void 0 ? list.length - 1 : h | 0, target, c)
		} else {
			return A(list, c === void 0 ? 0 : c | 0, l === void 0 ? list.length - 1 : l | 0, target)
		}
	}
}

function le(): (...args: Array<any>) => number {
	function A(list: Array<number>, l: number, h: number, target: number): number {
		let i: number = l - 1
		while (l <= h) {
			let m: number = (l + h) >>> 1
			let listItem: number = list[m]
			if (listItem <= target) {
				i = m
				l = m + 1
			} else {
				h = m - 1
			}
		}
		return i
	}
	function P(list: Array<number>, l: number, h: number, target: number, c: (listItem: number, target: number) => number): number {
		let i: number = l - 1
		while (l <= h) {
			let m: number = (l + h) >>> 1
			let listItem: number = list[m]
			if (c(listItem, target) <= 0) {
				i = m
				l = m + 1
			} else {
				h = m - 1
			}
		}
		return i
	}
	return function (list: Array<number>, target: number, c: number | ((listItem: number, target: number) => number), l: number, h: number): number {
		if (typeof c === 'function') {
			return P(list, l === void 0 ? 0 : l | 0, h === void 0 ? list.length - 1 : h | 0, target, c)
		} else {
			return A(list, c === void 0 ? 0 : c | 0, l === void 0 ? list.length - 1 : l | 0, target)
		}
	}
}

function eq(): (...args: Array<any>) => number {
	function A(list: Array<number>, l: number, h: number, target: number): number {
		let i: number = l - 1
		while (l <= h) {
			let m: number = (l + h) >>> 1
			let listItem: number = list[m]
			if (listItem === target) {
				return m
			} else if (listItem <= target) {
				l = m + 1
			} else {
				h = m - 1
			}
		}
		return -1
	}
	function P(list: Array<number>, l: number, h: number, target: number, c: (listItem: number, target: number) => number): number {
		let i: number = l - 1
		while (l <= h) {
			let m: number = (l + h) >>> 1
			let listItem: number = list[m]
			let p: number = c(listItem, target)
			if (p === 0) {
				return m
			} else if (p <= 0) {
				l = m + 1
			} else {
				h = m - 1
			}
		}
		return -1
	}
	return function (list: Array<number>, target: number, c: number | ((listItem: number, target: number) => number), l: number, h: number): number {
		if (typeof c === 'function') {
			return P(list, l === void 0 ? 0 : l | 0, h === void 0 ? list.length - 1 : h | 0, target, c)
		} else {
			return A(list, c === void 0 ? 0 : c | 0, l === void 0 ? list.length - 1 : l | 0, target)
		}
	}
}

export const bounds = {
	/**
	 * ge(list, target, compare?, lo?, hi?)
	 * 		查找数组 list 中第一个大于或等于目标值 target 的元素索引
	 * 			compare - 比较函数
	 * 				返回 list 中第一个满足 compare(listItem, target) >= 0 的元素索引 i
	 * 				若不存在满足此条件的元素, 返回 list.length
	 * 			lo - 指定起始索引(闭区间)
	 * 			hi - 指定结束索引(开区间)
	 */
	ge: (...args: Array<any>): number => {
		return ge()(...args)
	},
	/**
	 * gt(list, target, compare?, lo?, hi?)
	 * 		查找数组 list 中第一个大于目标值 target 的元素索引
	 * 			compare - 比较函数
	 * 				返回 list 中第一个满足 compare(listItem, target) > 0 的元素索引 i
	 * 				若不存在满足此条件的元素, 返回 list.length
	 * 			lo - 指定起始索引(闭区间)
	 * 			hi - 指定结束索引(开区间)
	 */
	gt: (...args: Array<any>): number => {
		return gt()(...args)
	},
	/**
	 * lt(list, target, compare?, lo?, hi?)
	 * 		查找数组 list 中最后一个小于目标值 target 的元素索引
	 * 			compare - 比较函数
	 * 				返回 list 中最后一个满足 compare(listItem, target) < 0 的元素索引 i
	 * 				若不存在满足此条件的元素, 返回 -1
	 * 			lo - 指定起始索引(闭区间)
	 * 			hi - 指定结束索引(开区间)
	 */
	lt: (...args: Array<any>): number => {
		return lt()(...args)
	},
	/**
	 * le(list, target, compare?, lo?, hi?)
	 * 		查找数组 list 中最后一个小于或等于目标值 target 的元素索引
	 * 			compare - 比较函数
	 * 				返回 list 中最后一个满足 compare(listItem, target) <= 0 的元素索引 i
	 * 				若不存在满足此条件的元素, 返回 -1
	 * 			lo - 指定起始索引(闭区间)
	 * 			hi - 指定结束索引(开区间)
	 */
	le: (...args: Array<any>): number => {
		return le()(...args)
	},
	/**
	 * eq(list, target, compare?, lo?, hi?)
	 * 		查找数组 list 中等于目标值 target 的元素索引
	 * 			compare - 比较函数
	 * 				若 compare(listItem, target) == 0, 返回索引 i
	 * 				若 list 中不存在任何元素满足此条件, 返回 -1
	 * 			lo - 指定起始索引(闭区间)
	 * 			hi - 指定结束索引(开区间)
	 */
	eq: (...args: Array<any>): number => {
		return eq()(...args)
	},
}
