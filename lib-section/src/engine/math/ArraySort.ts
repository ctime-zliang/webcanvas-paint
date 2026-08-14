/**
 * 混合排序算法 - 结合快速排序和归并排序的优势
 *
 * 整体策略:
 *   - 小规模数据 (≤ 50 个元素):
 * 			使用原地快速排序 (Hoare 分区方案变体), 空间复杂度 O(1)
 *   - 大规模数据 (> 50 个元素):
 * 			使用归并排序, 牺牲 O(n) 空间换取稳定性和最坏情况保证
 *
 * 算法复杂度:
 *   	- 时间: 平均 O(nlog(n)), 最坏 O(n²)(仅在快排退化时, 但由于阈值限制, 实际不会出现)
 *   	- 空间: O(n) (归并排序的缓冲区)
 */

/**
 * 快速排序 - Hoare 分区方案变体
 *
 * 算法原理:
 *   	- 选择 arr[start] 作为基准 (pivot)
 *   	- 使用双指针从两端向中间扫描:
 *      	- 右指针 (j): 从右向左找比 pivot 小的元素
 *      	- 左指针 (i): 从左向右找比 pivot 大的元素
 *   	- 找到后将元素放入 "hole" (空位)中, hole 位置交替在左右两端
 *   	- 最终 pivot 放入 hole, 完成一次分区
 *   	- 递归排序左右两半
 *
 * 当 length > 50 时切换为归并排序, 避免快排的最坏情况 O(n²)
 */
function qsort<T>(arr: Array<T>, cache: Array<T> | null, compara: (i1: T, i2: T) => number, startIndex: number, endIndex: number): void {
	let pivot: T = undefined!
	let i: number = 0
	let j: number = 0
	let hole: number = undefined!
	if (startIndex < endIndex - 1) {
		let length: number = endIndex - startIndex
		if (length > 50) {
			if (!cache) {
				cache = new Array<T>(length + 1)
			}
			mergeSort(arr, cache, compara, startIndex, ((startIndex + endIndex) / 2) | 0, endIndex)
		} else {
			pivot = arr[startIndex]
			i = startIndex
			hole = startIndex
			j = endIndex
			let i2: number = i + 1
			while (i2 < j) {
				if (hole !== j) {
					j = j - 1
					if (compara(pivot, arr[j]) <= 0) {
						continue
					}
					arr[hole] = arr[j]
					hole = j
					continue
				}
				if (compara(pivot, arr[i2]) >= 0) {
					i = i2
					i2 = i + 1
					continue
				}
				arr[hole] = arr[i2]
				i = i2
				hole = i2
				i2 = i + 1
			}
			arr[hole] = pivot
			qsort(arr, cache, compara, startIndex, hole)
			qsort(arr, cache, compara, hole + 1, endIndex)
		}
	}
}

/**
 * 归并排序 - 分治合并
 *
 * 算法原理:
 *   	- 分:
 * 			递归排序左半 [start, mid) 和右半 [mid, end)
 *   	- 合:
 * 			双指针合并两个有序子数组到 cache 缓冲区
 *   	- 将
 * 			cache 中的有序结果写回原数组
 *
 * NaN 处理: 当比较函数返回 NaN 时, 将右侧元素放入结果(防止死循环)
 *
 * 潜在问题:
 * 		当 compara 返回 0 时 (c <= 0 和 c >= 0 同时为真), left 和 right 都会被写入 cache, 但 c === 0 意味着相等, 不应该重复写入
 * 		这会导致:
 *   		- 相等元素被重复写入 (k 多走一步)
 *   		- 后续的 arr[++i] 或 arr[++j] 可能越界
 *
 * 		实际分析: 当 c === 0 时, cache[k++] = left 和 cache[k++] = right 都执行, 等于同时消耗了两个元素, 这是正确行为(两个相等元素各写一次)
 *   	但需要注意 ++i 或 ++j 可能恰好等于 mid 或 end, 此时 left / right 变量
 *   	仍保持旧值, 后面的 for 循环不会再写入多余元素
 * 		即逻辑正确
 */
function mergeSort<T>(arr: Array<T>, cache: Array<T>, compara: (i1: T, i2: T) => number, startIndex: number, midIndex: number, endIndex: number): void {
	qsort(arr, cache, compara, startIndex, midIndex)
	qsort(arr, cache, compara, midIndex, endIndex)
	let i: number = startIndex
	let j: number = midIndex
	let k: number = 0
	let left: T = arr[i]
	let right: T = arr[j]
	while (i < midIndex && j < endIndex) {
		let c: number = compara(left, right)
		if (Number.isNaN(c)) {
			cache[k++] = right
			right = arr[++j]
		} else {
			if (c <= 0) {
				cache[k++] = left
				left = arr[++i]
			}
			if (c >= 0) {
				cache[k++] = right
				right = arr[++j]
			}
		}
	}
	for (; i < midIndex; i++) {
		cache[k++] = arr[i]
	}
	for (; j < endIndex; j++) {
		cache[k++] = arr[j]
	}
	for (i = startIndex, j = 0; j < k; i++, j++) {
		arr[i] = cache[j]
	}
}

/**
 * 数组排序工具类
 */
export class ArraySort {
	public static quickSort<T>(arr: Array<T>, compara: (i1: T, i2: T) => number, startIndex: number = 0, endIndex: number = arr.length): void {
		qsort(arr, null, compara, startIndex, endIndex)
	}
}
