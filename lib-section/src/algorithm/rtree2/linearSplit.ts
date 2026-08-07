import { RtreeDebug_profile } from './config'
import { RtreeDebug_getHashIden, RtreeDebug_removeRectangleAuxiliary, RtreeDebug_updateRectangleAuxiliary } from './debug'
import { Rectangle } from './Rectangle'
import { TRtreeNodeItem } from './Rtree'

/**
 * R-Tree 线性分裂算法 (Linear Split)
 *
 * 实现 R-Tree 节点溢出时的分裂策略, 采用 Guttman 1984 年论文中的"线性代价分裂" (Linear Cost Split) 算法变体
 *
 * 算法概述:
 * 		当一个节点的子节点数超过 maxWidth 限制时, 需要将其子节点集合拆分为两组,并为每组创建一个新的内部节点, 使得:
 * 			- 每组至少包含 minWidth 个节点(保证树的填充率)
 * 			- 两组的 MBR 面积之和尽可能小(减少空间浪费)
 *
 * 分裂分为两个阶段:
 * 		- pickLinear (选择种子节点):
 * 			目标: 从 nodes 中选出两个距离最远的节点作为两个分组的初始"种子"
 * 			策略: 分别在 X 轴和 Y 轴上寻找"最极端"的节点对:
 *   			- X 轴: 右边界最小的节点 (indexLowestEndX) vs 左边界最大的节点 (indexHighestStartX)
 *   			- Y 轴: 下边界最小的节点 (indexLowestEndY) vs 上边界最大的节点 (indexHighestStartY)
 * 			选择分离距离较大的轴上的节点对作为种子:
 *   			dx = |lowestEndX - highestStartX|
 *   			dy = |lowestEndY - highestStartY|
 *   			if dx > dy  // 使用 X 轴上的节点对
 *   			else  // 使用 Y 轴上的节点对
 *		- pickNext (分配剩余节点):
 * 			目标: 将剩余节点逐个分配到两个组 A 和 B 中
 * 			策略: 对每个剩余节点 N, 计算:
 *   			- 将 N 加入 A 后, A 的 MBR 的 squarifiedRatio 变化量 changeA
 *   			- 将 N 加入 B 后, B 的 MBR 的 squarifiedRatio 变化量 changeB
 *   			- delta = |changeB - changeA|
 * 			选择 delta 最大的节点 N*:
 *   			- 如果 changeB < changeA, N* 加入 B(加入 B 的代价更小)
 *   			- 否则, N* 加入 A
 *
 * 最小填充约束:
 *   	如果某组加上所有剩余节点后才刚好达到 minWidth, 则强制将后续节点分配到该组
 */

function pickLinear(nodes: Array<TRtreeNodeItem>): Array<TRtreeNodeItem> {
	/**
	 * 在一个平面上分布着 nodes[i] 元素
	 * nodes 的长度即为其父节点当前的子节点个数, 且父节点存在一个最大子节点个数限制 M
	 * 当 nodes.length 值在某一个处理过程中已经大于了 M, 则会立即开始分裂
	 * 因此 [0, nodes.length - 2] 区间内的元素个数即等于 M
	 * 遍历 [0, nodes.length - 2] 区间内的元素
	 * 		找到起始 X 坐标 (x) 最大的元素对应的索引 indexHighestStartX
	 * 		找到起始 Y 坐标 (y) 最大的元素对应的索引 indexHighestStartY
	 * 		找到结束 X 坐标 (ex) 最小的元素对应的索引 indexLowestEndX
	 * 		找到结束 Y 坐标 (ey) 最小的元素对应的索引 indexLowestEndY
	 */
	/**
	 * 种子选择 (Seed Selection):
	 * 初始化:
	 * 		- indexLowestEndX 初始为最后一个元素(nodes.length - 1)
	 * 		- indexHighestStartX 初始为第一个元素(0)
	 * 		- 从 nodes.length - 2 开始倒序遍历以覆盖 [0, M-1] 范围
	 *
	 * 遍历策略:
	 * 		使用 if-else 分支分别更新 highest 和 lowest, 这意味着同一个元素不会同时成为两个极端值(这在大多数情况下是合理的, 但当某个矩形特别大时, 可能会同时拥有最大起始值和最小结束值, 此时 else 分支会使其只记录一种极端)
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
	/**
	 * 轴选择与种子提取:
	 * 		计算两轴上的分离距离:
	 *   			dx = |lowestEndX - highestStartX| (X 轴上两个极端节点的间距)
	 *   			dy = |lowestEndY - highestStartY| (Y 轴上两个极端节点的间距)
	 * 选择分离距离更大的轴:
	 *   	- 较大的分离距离意味着该轴上的节点分布更分散, 沿此轴分裂能产生更紧凑的两个 MBR
	 *
	 * 提取顺序:
	 *   	从 nodes 中 splice 移除种子节点时, 必须先移除索引较大的元素, 以避免数组移位导致较小索引失效
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
	/**
	 * 构造两个初始分组节点:
	 * 		- 第一个分组以 itemLowestEnd 为种子(在选定轴上边界最"内缩"的节点)
	 * 		- 第二个分组以 itemHighestStart 为种子(在选定轴上起始最"外扩"的节点)
	 *
	 * 每个分组节点的 MBR 初始化为其种子节点的 MBR, 种子节点作为唯一子节点存入 nodes 数组
	 */
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
	/**
	 * 节点分配 (Node Assignment):
	 *
	 * 目标:
	 * 		从 nodes (剩余待分配节点) 中选出一个"最具决定性"的节点, 将其分配到代价增长更小的分组中
	 *
	 * "最具决定性"的含义:
	 * 		该节点在两个分组之间的代价差异最大, 即它明显更适合某一个分组
	 * 		优先分配这类节点可以减少后续分配的歧义性
	 *
	 * 代价计算:
	 *   	areaA = squarifiedRatio(a.w, a.h, a.nodes.length + 1)  // 分组 A 当前的代价
	 *   	areaB = squarifiedRatio(b.w, b.h, b.nodes.length + 1)  // 分组 B 当前的代价
	 *
	 *   	对于每个候选节点 nodes[i]:
	 *     		newMBR_A = MBR(a, nodes[i])
	 *     		changeA = |squarifiedRatio(newMBR_A) - areaA|  // 加入 A 的代价增量
	 *     		newMBR_B = MBR(b, nodes[i])
	 *     		changeB = |squarifiedRatio(newMBR_B) - areaB|  // 加入 B 的代价增量
	 *     		delta = |changeB - changeA|
	 *   	选择 delta 最小的节点(即两个分组的代价差异最明显的节点), 将其分配到代价增量较小的分组
	 */
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
		/**
		 * 计算将 l 合并入分组 A 后的新 MBR: newAreaA = MBR(a, l)
		 */
		let newAreaA: { x: number; y: number; w: number; h: number } = { x: 0, y: 0, w: 0, h: 0 }
		newAreaA.x = Math.min(a.x, l.x)
		newAreaA.y = Math.min(a.y, l.y)
		newAreaA.w = Math.max(a.x + a.w, l.x + l.w) - newAreaA.x
		newAreaA.h = Math.max(a.y + a.h, l.y + l.h) - newAreaA.y

		// if (RtreeDebug_profile.isEnableDebug) {
		// 	RtreeDebug_updateRectangleAuxiliary(debugId0, newAreaA as any, '#444400')
		// }
		let changeNewAreaA = Math.abs(Rectangle.squarifiedRatio(newAreaA.w, newAreaA.h, a.nodes.length + 2) - areaA)
		/**
		 * 计算将 l 合并入分组 B 后的新 MBR:  newAreaB = MBR(b, l)
		 */
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
	/**
	 * 最小填充约束处理:
	 * 		从 nodes 中取出选中的节点后, 检查是否有某个分组面临"欠填充"风险:
	 * 			- 如果 a.nodes.length + 剩余节点数 + 1 <= minWidth:
	 * 			  分组 A 加上所有剩余节点才刚好达到最小值, 强制分配到 A
	 * 			- 如果 b.nodes.length + 剩余节点数 + 1 <= minWidth:
	 *   			分组 B 同理, 强制分配到 B
	 * 			- 否则: 分配到代价增长更小的分组(lowestGrowthGroup)
	 *
	 * 这确保了分裂后每个子树至少包含 minWidth 个节点, 维持 R-Tree 的填充率不变式
	 */
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
	/**
	 * 线性分裂主流程:
	 * 		- pickLinear: 选出两个种子节点, 构建两个初始分组 n[0] 和 n[1] (此操作会从 nodes 数组中 splice 移除两个种子节点)
	 * 		- 循环调用 pickNext: 每次从 nodes 中选出并移除一个节点, 分配到某个分组, 直到 nodes 为空
	 *
	 * 注意:
	 * 		- linearSplit 会通过 splice 逐步清空传入的 nodes 数组
	 * 		- 调用者 (insertSubtree) 应在调用前确保 bc.nodes 即为此处的 nodes, 分裂完成后 bc.nodes 将变为空数组
	 *
	 * 返回值:
	 * 		包含两个新内部节点的数组 [groupA, groupB]
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
