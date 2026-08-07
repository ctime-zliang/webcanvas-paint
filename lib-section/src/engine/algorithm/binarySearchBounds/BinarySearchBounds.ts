type CompareFn = (listItem: number, target: number) => number

/**
 * 在已排序数组中查找第一个大于或等于目标值的元素索引
 *
 * 算法实现:
 * 		- 初始化 i = h + 1 (即默认"未找到"时返回超出右边界的值)
 *   	- 使用二分搜索缩小范围:
 *   		- 若 list[m] >= target, 则 m 是一个候选答案, 记录它并继续向左搜索 (h = m - 1)
 *     		- 若 list[m] < target, 则答案一定在右侧 (l = m + 1)
 *   	- 循环结束时, i 即为第一个 >= target 的元素索引
 *   	- 若数组中所有元素都 < target, 则返回 h + 1 (即数组长度)
 */
function geA(list: Array<number>, l: number, h: number, target: number): number {
	let i: number = h + 1
	while (l <= h) {
		/**
		 * 使用无符号右移代替 Math.floor((l + h) / 2)
		 * 		- 避免浮点运算
		 * 		- 防止 l + h 超过 2^31 时的整数溢出
		 */
		let m: number = (l + h) >>> 1
		let listItem: number = list[m]
		if (listItem >= target) {
			/**
			 * 当前元素满足条件, 记录为候选答案, 继续向左搜索更小的满足条件的索引
			 */
			i = m
			h = m - 1
		} else {
			/**
			 * 当前元素小于目标值, 答案在右半部分
			 */
			l = m + 1
		}
	}
	return i
}
/**
 * geP - 带自定义比较器版本的 "大于等于" 搜索
 *
 * 与 geA 算法相同, 但使用自定义比较函数 c(listItem, target) 替代直接比较:
 *   	- c(listItem, target) >= 0, 即 listItem >= target
 *   	- c(listItem, target) < 0, 即 listItem < target
 *
 * 案例:
 *   	- list = [{v: 1}, {v: 3}, {v: 5}, {v: 7}]
 *   		compare = (item, target) => item.v - target.v
 *   		geP(list, 0, 3, {v: 4}, compare)  // 返回索引 2 (元素 {v: 5}, 第一个 >= 4)
 */
function geP(list: Array<number>, l: number, h: number, target: number, c: CompareFn): number {
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

/**
 * 在已排序数组中查找第一个严格大于目标值的元素索引
 *
 * 算法实现:
 *   	- 初始化 i = h + 1 ("未找到"时返回超出右边界的值)
 *   	- 使用二分搜索:
 *     		- 若 list[m] > target, 则 m 是候选答案, 继续向左搜索
 *     		- 若 list[m] <= target, 答案在右侧
 *   	- 若所有元素都 <= target, 则返回 h + 1
 */
function gtA(list: Array<number>, l: number, h: number, target: number): number {
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
function gtP(list: Array<number>, l: number, h: number, target: number, c: CompareFn): number {
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

/**
 * 在已排序数组中查找最后一个严格小于目标值的元素索引
 *
 * 算法实现:
 *   	- 初始化 i = l - 1 (即默认"未找到"时返回低于左边界的值, 通常为 -1)
 *   	- 使用二分搜索:
 *     		- 若 list[m] < target, 则 m 是候选答案, 继续向右搜索更大的满足条件的索引
 *     		- 若 list[m] >= target, 答案在左侧
 *   	- 循环结束时, i 即为最后一个 < target 的元素索引
 *   	- 若数组中所有元素都 >= target, 则返回 l - 1 (通常为 -1)
 */
function ltA(list: Array<number>, l: number, h: number, target: number): number {
	let i: number = l - 1
	while (l <= h) {
		let m: number = (l + h) >>> 1
		let listItem: number = list[m]
		if (listItem < target) {
			/**
			 * 当前元素满足条件, 记录为候选答案, 继续向右搜索更大的满足条件的索引
			 */
			i = m
			l = m + 1
		} else {
			/**
			 * 当前元素 >= 目标值, 答案在左半部分
			 */
			h = m - 1
		}
	}
	return i
}
function ltP(list: Array<number>, l: number, h: number, target: number, c: CompareFn): number {
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

/**
 * 在已排序数组中查找最后一个小于或等于目标值的元素索引
 *
 * 算法实现:
 *   	- 初始化 i = l - 1
 *   	- 使用二分搜索:
 *     		- 若 list[m] <= target, 则 m 是候选答案, 继续向右搜索
 *     		- 若 list[m] > target, 答案在左侧
 *   	- 若所有元素都 > target, 则返回 l - 1
 */
function leA(list: Array<number>, l: number, h: number, target: number): number {
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
function leP(list: Array<number>, l: number, h: number, target: number, c: CompareFn): number {
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

/**
 * 在已排序数组中查找等于目标值的元素索引
 *
 * 算法实现:
 *   	- 标准二分搜索的精确匹配版本
 *   	- 使用二分搜索:
 *     		- 若 list[m] === target, 直接返回 m
 *     		- 若 list[m] < target, 答案在右侧 (l = m + 1)
 *     		- 若 list[m] > target, 答案在左侧 (h = m - 1)
 *   	- 若找不到匹配元素, 返回 -1
 *
 * 若数组中存在多个等于 target 的元素, 返回的是其中任意一个的索引
 */
function eqA(list: Array<number>, l: number, h: number, target: number): number {
	while (l <= h) {
		let m: number = (l + h) >>> 1
		let listItem: number = list[m]
		if (listItem === target) {
			return m
		} else if (listItem < target) {
			l = m + 1
		} else {
			h = m - 1
		}
	}
	return -1
}
function eqP(list: Array<number>, l: number, h: number, target: number, c: CompareFn): number {
	while (l <= h) {
		let m: number = (l + h) >>> 1
		let listItem: number = list[m]
		let p: number = c(listItem, target)
		if (p === 0) {
			return m
		} else if (p < 0) {
			l = m + 1
		} else {
			h = m - 1
		}
	}
	return -1
}

/**
 * 通用的分发函数: 根据是否传入比较器选择对应的实现
 *
 * 参数重载:
 *   	- 当 c 为函数时: fn(list, target, compareFn, lo?, hi?)
 *   	- 当 c 非函数时: fn(list, target, lo?, hi?)
 *     		此时 c 实际代表 lo, l 实际代表 hi
 */
function makeSearch(fnA: (list: Array<number>, l: number, h: number, target: number) => number, fnP: (list: Array<number>, l: number, h: number, target: number, c: CompareFn) => number): (...args: Array<any>) => number {
	return function (list: Array<number>, target: number, c?: number | CompareFn, l?: number, h?: number): number {
		if (typeof c === 'function') {
			return fnP(list, l === undefined ? 0 : l | 0, h === undefined ? list.length - 1 : h | 0, target, c)
		} else {
			return fnA(list, c === undefined ? 0 : c | 0, l === undefined ? list.length - 1 : l | 0, target)
		}
	}
}

/**
 * BinarySearchBounds - 二分搜索边界查找算法集合
 *
 * 在已排序数组中查找满足特定条件的边界索引:
 *   - ge: 查找第一个 >= target 的元素索引
 *   - gt: 查找第一个 > target 的元素索引
 *   - lt: 查找最后一个 < target 的元素索引
 *   - le: 查找最后一个 <= target 的元素索引
 *   - eq: 查找等于 target 的元素索引
 *
 * 所有方法要求输入数组已按升序排列
 *
 * 支持的调用模式:
 *   	- 直接比较模式: fn(list, target, lo?, hi?)
 *   	- 自定义比较器模式: fn(list, target, compareFn, lo?, hi?)
 */
export const bounds = {
	/**
	 * ge(list, target, compare?, lo?, hi?)
	 * 		查找数组 list 中第一个大于或等于目标值 target 的元素索引, 若不存在返回 list.length
	 *
	 * 		输入:
	 * 			list: 已排序的数字数组
	 * 			target: 目标值
	 * 			compare: (listItem, target) => number
	 * 				返回 list 中第一个满足 compare(listItem, target) >= 0 的元素索引
	 * 			lo: 可选起始索引(闭区间, 默认 0)
	 * 			hi: 可选结束索引(闭区间, 默认 list.length - 1)
	 */
	ge: makeSearch(geA, geP),

	/**
	 * gt(list, target, compare?, lo?, hi?)
	 * 		查找数组 list 中第一个严格大于目标值 target 的元素索引, 若不存在返回 list.length
	 *
	 * 		输入:
	 * 			list: 已排序的数字数组
	 * 			target: 目标值
	 * 			compare: (listItem, target) => number
	 * 				返回 list 中第一个满足 compare(listItem, target) > 0 的元素索引
	 * 			lo: 可选起始索引(闭区间, 默认 0)
	 * 			hi: 可选结束索引(闭区间, 默认 list.length - 1)
	 */
	gt: makeSearch(gtA, gtP),

	/**
	 * lt(list, target, compare?, lo?, hi?)
	 * 		查找数组 list 中最后一个严格小于目标值 target 的元素索引, 若不存在返回 -1
	 * 		输入:
	 * 			list: 已排序的数字数组
	 * 			target: 目标值
	 * 			compare: (listItem, target) => number
	 * 				返回 list 中第一个满足 compare(listItem, target) < 0 的元素索引
	 * 			lo: 可选起始索引(闭区间, 默认 0)
	 * 			hi: 可选结束索引(闭区间, 默认 list.length - 1)
	 */
	lt: makeSearch(ltA, ltP),

	/**
	 * le(list, target, compare?, lo?, hi?)
	 * 		查找数组 list 中最后一个小于或等于目标值 target 的元素索引, 若不存在返回 -1
	 *
	 * 		输入:
	 * 			list: 已排序的数字数组
	 * 			target: 目标值
	 * 			compare: (listItem, target) => number
	 * 				返回 list 中第一个满足 compare(listItem, target) <= 0 的元素索引
	 * 			lo: 可选起始索引(闭区间, 默认 0)
	 * 			hi: 可选结束索引(闭区间, 默认 list.length - 1)
	 */
	le: makeSearch(leA, leP),

	/**
	 * eq(list, target, compare?, lo?, hi?)
	 * 		查找数组 list 中等于目标值 target 的元素索引, 若不存在返回 -1
	 *
	 * 		输入:
	 * 			list: 已排序的数字数组
	 * 			target: 目标值
	 * 			compare: (listItem, target) => number
	 * 				返回 list 中第一个满足 compare(listItem, target) === 0 的元素索引
	 * 			lo: 可选起始索引(闭区间, 默认 0)
	 * 			hi: 可选结束索引(闭区间, 默认 list.length - 1)
	 */
	eq: makeSearch(eqA, eqP),
}
