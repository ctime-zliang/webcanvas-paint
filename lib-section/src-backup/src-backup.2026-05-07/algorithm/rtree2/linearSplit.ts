import { RtreeDebug_profile } from './config'
import { RtreeDebug_getHashIden, RtreeDebug_removeRectangleAuxiliary, RtreeDebug_updateRectangleAuxiliary } from './debug'
import { Rectangle } from './Rectangle'
import { TRtreeNodeItem } from './Rtree'

function pickLinear(nodes: Array<TRtreeNodeItem>): Array<TRtreeNodeItem> {
	/**
	 * 在一个平面上分布着 nodes[i] 元素
	 * nodes 的长度即为其父节点当前的子节点个数, 且父节点存在一个最大子节点个数限制 M
	 * 当 nodes.length 值在某一个处理过程中已经大于了 M, 则会立即开始分裂
	 * 因此 [0, nodes.length - 2] 区间内的元素个数即等于 M
	 * 遍历 [0, nodes.length - 2] 区间内的元素
	 * 		找到起始 X 坐标(x)最大的元素对应的索引 indexHighestStartX
	 * 		找到起始 Y 坐标(y)最大的元素对应的索引 indexHighestStartY
	 * 		找到结束 X 坐标(ex)最小的元素对应的索引 indexLowestEndX
	 * 		找到结束 Y 坐标(ey)最小的元素对应的索引 indexLowestEndY
	 */
	let indexLowestEndX = nodes.length - 1
	let indexHighestStartX = 0
	let indexLowestEndY = nodes.length - 1
	let indexHighestStartY = 0
	for (let i = nodes.length - 2; i >= 0; i--) {
		const childItem = nodes[i]
		if (childItem.x > nodes[indexHighestStartX].x) {
			indexHighestStartX = i
		} else if (childItem.x + childItem.w < nodes[indexLowestEndX].x + nodes[indexLowestEndX].w) {
			indexLowestEndX = i
		}
		if (childItem.y > nodes[indexHighestStartY].y) {
			indexHighestStartY = i
		} else if (childItem.y + childItem.h < nodes[indexLowestEndY].y + nodes[indexLowestEndY].h) {
			indexLowestEndY = i
		}
	}
	/**
	 * 存在一个由
	 * 		x1 = lowestEndX
	 * 		x2 = highestStartX
	 * 		y1 = lowestEndY
	 * 		y2 = highestStartY
	 * 4 条直线构成的矩形 R
	 *
	 * 获取该矩形 R 的两条短边 L1 与 L2
	 * 找到 L1 和 L2 所在的直线 x1 和 x2(或 y1 和 y2)
	 * 继续在 nodes 依据索引定位到决定 x1 和 x2(或 y1 和 y2) 直线坐标的元素 nodes[idx1] 和 nodes[idx2], 记作 A 和 B
	 * 分别由 A 和 B 的尺寸数据生成 MBR 节点 MA 和 MB, 并将 A 和 B 作为其子节点
	 * 返回 MA 和 MB
	 *
	 * 通过 index 使用 splice 方法删除数组元素并获取 index 对应的元素
	 * 需要从较大的 index 开始查找并删除, 以防止 splice 方法修改原数组导致后续的 index 查找元素出错
	 */
	const lowestEndX = nodes[indexLowestEndX].x + nodes[indexLowestEndX].w
	const lowestEndY = nodes[indexLowestEndY].y + nodes[indexLowestEndY].h
	const highestStartX = nodes[indexHighestStartX].x
	const highestStartY = nodes[indexHighestStartY].y
	const dx = Math.abs(lowestEndX - highestStartX)
	const dy = Math.abs(lowestEndY - highestStartY)
	let itemLowestEnd
	let itemHighestStart
	if (dx > dy) {
		if (indexLowestEndX > indexHighestStartX) {
			itemLowestEnd = nodes.splice(indexLowestEndX, 1)[0]
			itemHighestStart = nodes.splice(indexHighestStartX, 1)[0]
		} else {
			itemHighestStart = nodes.splice(indexHighestStartX, 1)[0]
			itemLowestEnd = nodes.splice(indexLowestEndX, 1)[0]
		}
	} else {
		if (indexLowestEndY > indexHighestStartY) {
			itemLowestEnd = nodes.splice(indexLowestEndY, 1)[0]
			itemHighestStart = nodes.splice(indexHighestStartY, 1)[0]
		} else {
			itemHighestStart = nodes.splice(indexHighestStartY, 1)[0]
			itemLowestEnd = nodes.splice(indexLowestEndY, 1)[0]
		}
	}
	return [
		{
			x: itemLowestEnd.x,
			y: itemLowestEnd.y,
			w: itemLowestEnd.w,
			h: itemLowestEnd.h,
			nodes: [itemLowestEnd],
		},
		{
			x: itemHighestStart.x,
			y: itemHighestStart.y,
			w: itemHighestStart.w,
			h: itemHighestStart.h,
			nodes: [itemHighestStart],
		},
	]
}

function pickNext(nodes: Array<TRtreeNodeItem>, a: TRtreeNodeItem, b: TRtreeNodeItem, minWidth: number): void {
	// Area of new enlarged rectangle
	let areaA: number = Rectangle.squarifiedRatio(a.w, a.h, a.nodes.length + 1)
	let areaB: number = Rectangle.squarifiedRatio(b.w, b.h, b.nodes.length + 1)

	/**
	 * "正方化"起始节点 a, 记作 SQ(A)
	 * "正方化"起始节点 b, 记作 SQ(B)
	 *
	 * 逐一遍历 nodes
	 * 取任意的 nodes[i] 并"正方化"后取值记作 SQ(nodes[i])
	 * 计算 SQ(nodes[i]) 和 SQ(A) 的差的绝对值, 记作 DA
	 * 计算 SQ(nodes[i]) 和 SQ(B) 的差的绝对值, 记作 DB
	 * 取整个遍历周期内 DA 和 DB 的差的最小值 m, 并记录对应的索引 highAreaNodeIndex = i
	 *
	 * 从 nodes 中删除 highAreaNodeIndex 位置处的元素, 并将该元素插入到 a 或 b 的子节点列表中
	 */
	let highAreaDelta: number = undefined!
	let highAreaNode: number = undefined!
	let lowestGrowthGroup: TRtreeNodeItem = undefined!

	// let debugId0: string = ''
	// let debugId1: string = ''
	// if (RtreeDebug_profile.isEnableDebug) {
	// 	debugId0 = RtreeDebug_getHashIden()
	// 	debugId1 = RtreeDebug_getHashIden()
	// }

	for (let i: number = nodes.length - 1; i >= 0; i--) {
		let l: TRtreeNodeItem = nodes[i]
		let newAreaA: { x: number; y: number; w: number; h: number } = { x: 0, y: 0, w: 0, h: 0 }
		newAreaA.x = Math.min(a.x, l.x)
		newAreaA.y = Math.min(a.y, l.y)
		newAreaA.w = Math.max(a.x + a.w, l.x + l.w) - newAreaA.x
		newAreaA.h = Math.max(a.y + a.h, l.y + l.h) - newAreaA.y

		// if (RtreeDebug_profile.isEnableDebug) {
		// 	RtreeDebug_updateRectangleAuxiliary(debugId0, newAreaA as any, '#444400')
		// }
		let changeNewAreaA = Math.abs(Rectangle.squarifiedRatio(newAreaA.w, newAreaA.h, a.nodes.length + 2) - areaA)

		let newAreaB: { x: number; y: number; w: number; h: number } = { x: 0, y: 0, w: 0, h: 0 }
		newAreaB.x = Math.min(b.x, l.x)
		newAreaB.y = Math.min(b.y, l.y)
		newAreaB.w = Math.max(b.x + b.w, l.x + l.w) - newAreaB.x
		newAreaB.h = Math.max(b.y + b.h, l.y + l.h) - newAreaB.y

		// if (RtreeDebug_profile.isEnableDebug) {
		// 	RtreeDebug_updateRectangleAuxiliary(debugId1, newAreaB as any, '#448800')
		// }
		let changeNewAreaB = Math.abs(Rectangle.squarifiedRatio(newAreaB.w, newAreaB.h, b.nodes.length + 2) - areaB)

		if (!highAreaNode || !highAreaDelta || Math.abs(changeNewAreaB - changeNewAreaA) < highAreaDelta) {
			highAreaNode = i
			highAreaDelta = Math.abs(changeNewAreaB - changeNewAreaA)
			lowestGrowthGroup = changeNewAreaB < changeNewAreaA ? b : a
		}
	}

	// if (RtreeDebug_profile.isEnableDebug) {
	// 	RtreeDebug_removeRectangleAuxiliary(debugId1)
	// 	RtreeDebug_removeRectangleAuxiliary(debugId1)
	// }
	let tempNode: TRtreeNodeItem = nodes.splice(highAreaNode, 1)[0]
	if (a.nodes.length + nodes.length + 1 <= minWidth) {
		a.nodes.push(tempNode)
		Rectangle.expandRectangle(a, tempNode)
	} else if (b.nodes.length + nodes.length + 1 <= minWidth) {
		b.nodes.push(tempNode)
		Rectangle.expandRectangle(b, tempNode)
	} else {
		lowestGrowthGroup.nodes.push(tempNode)
		Rectangle.expandRectangle(lowestGrowthGroup, tempNode)
	}
}

export function linearSplit(nodes: Array<TRtreeNodeItem>, minWidth: number): Array<TRtreeNodeItem> {
	/**
	 * 将 nodes 分割成两棵树
	 * 先通过构建矩形策略从 nodes 中选择两个节点生成两棵树的根节点
	 * 将剩下的节点分配到两棵树
	 */
	let n: Array<TRtreeNodeItem> = pickLinear(nodes)
	// let debugId0: string = ''
	// let debugId1: string = ''
	// if (RtreeDebug_profile.isEnableDebug) {
	// 	debugId0 = RtreeDebug_getHashIden()
	// 	debugId1 = RtreeDebug_getHashIden()
	// 	RtreeDebug_updateRectangleAuxiliary(debugId0, n[0], '#440000')
	// 	RtreeDebug_updateRectangleAuxiliary(debugId1, n[1], '#880000')
	// }
	while (nodes.length > 0) {
		pickNext(nodes, n[0], n[1], minWidth)
		// if (RtreeDebug_profile.isEnableDebug) {
		// 	RtreeDebug_updateRectangleAuxiliary(debugId0, n[0], '#440000')
		// 	RtreeDebug_updateRectangleAuxiliary(debugId1, n[1], '#880000')
		// }
	}
	// if (RtreeDebug_profile.isEnableDebug) {
	// 	RtreeDebug_removeRectangleAuxiliary(debugId0)
	// 	RtreeDebug_removeRectangleAuxiliary(debugId1)
	// }
	return n
}
