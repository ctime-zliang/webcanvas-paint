import { BBox2 } from '../../engine/algorithm/geometry/bbox/BBox2'
import { TFontCanvasRenderMetrics } from '../../engine/modules/d2Canvas2Svg/Canvas'
import { CANVAS_DRAW_TEXT_STD_MM } from '../../engine/modules/d2Canvas2Svg/Config'
import { TFontPolygonBbox2, TFontTriangleVertexData } from '../../manager/TextGraphicsManager'
import { POINT_ARRAY_OCCUPY_SIZE } from '../../service/TextFontService'

/**
 * TextLayout - 文本排版布局
 *
 * 设计原理与数学基础:
 * 		将已经三角化的字符顶点数据, 按照排版规则(字号、行高), 组合成完整的段落文本
 * 		核心任务是计算每个字符在世界坐标系中的最终位置
 *
 * 坐标系约定:
 * 		- X 轴: 向右为正方向(水平排列方向)
 * 		- Y 轴: 向下为负方向 (Canvas 坐标系转换后)
 * 		- 原点: 文本块的左上角
 *
 * 缩放变换:
 * 		字符在 Canvas 中是以固定的基准像素尺寸 (CANVAS_DRAW_TEXT_STD_MM) 渲染的,  而外部指定的 fontSize 可能不同, 因此需要进行缩放变换:
 *   		FONT_SCALE = fontSize / CANVAS_DRAW_TEXT_STD_MM
 * 		每个顶点坐标需要乘以 FONT_SCALE 才能映射到正确的世界坐标尺寸
 *
 * 布局算法概述:
 *   对于多行多列的字符数组 textArray[row][col]:
 *   	- 计算所有字符的全局包围盒 outerRectBbox2 (用于坐标归一化)
 *   	- 逐行逐列遍历字符:
 *      	- 将顶点减去全局包围盒的 (minX, maxY) → 归一化到原点附近
 *      	- 乘以 FONT_SCALE → 缩放到目标字号
 *      	- 加上 (offsetX, -offsetY) → 平移到排版位置
 *   	- 计算最终的整体包围盒
 *
 * 行高数学模型:
 *   	lineHeight2 = lineHeight || fontSize  (默认行高等于字号)
 *   		第一行 offsetY = |lineHeight2 - fontSize| / 2  // 垂直居中补偿
 *   		后续行 offsetY += lineHeight2  // 逐行递增
 *   	这保证了当 lineHeight > fontSize 时, 首行文字垂直居中于行高区域
 *
 * 水平偏移计算:
 *   	每个字符的 x 偏移由前一个字符的宽度决定:
 *   			offsetX += fontSize * textCanvasRenderMetricsArray[row][col - 1].fontCanvasRenderWidthRatio
 *   		其中 fontCanvasRenderWidthRatio 是字符宽度与标准字号的比值
 *   	第一个字符的 offsetX = 0(左对齐)
 */

/**
 * 文本布局配置参数
 */
export type TTextLayoutFontProfile = {
	fontSize: number
	lineHeight: number
}

export class TextLayout {
	/**
	 * 段落文本字符排版 - 世界坐标组合
	 *
	 * 算法流程:
	 * 		- 计算缩放因子
	 *   			FONT_SCALE = fontSize / CANVAS_DRAW_TEXT_STD_MM
	 *   		将 Canvas 渲染的像素坐标映射到目标字号的世界坐标
	 * 		- 计算全局包围盒 outerRectBbox2
	 *   		所有字符在未排版状态下的最大包围范围, 用于后续坐标归一化(消除不同字符间的基线偏移差异)
	 * 		- 逐字符变换
	 *   		对每个顶点 (px, py) 执行以下变换:
	 *     			- 归一化: 减去全局包围盒左下角, 使所有字符对齐到统一原点
	 *     				px' = px - outerRectBbox2.minX
	 *     				py' = py - outerRectBbox2.maxY
	 *     			- 缩放: 从 Canvas 像素空间缩放到世界坐标空间
	 *     				px'' = px' * FONT_SCALE
	 *     				py'' = py' * FONT_SCALE
	 *     			- 平移: 移动到当前字符在段落中的排版位置
	 *     				px_final = px'' + offsetX
	 *     				py_final = py'' - offsetY
	 * 		- 计算整体包围盒
	 *   		遍历所有变换后的顶点, 得到整个文本块的 AABB 包围盒
	 * 			最后修正 minY 减去首行的垂直居中补偿量
	 *
	 * 偏移量计算规则:
	 * 		- offsetX (水平偏移):
	 *   		- 每行第一个字符: offsetX = 0 (重置为行首)
	 *   		- 后续字符: offsetX += fontSize * 前一字符的宽度比
	 *     			offsetX += fontSize * metrics[row][col - 1].fontCanvasRenderWidthRatio
	 *		- offsetY (垂直偏移, 累加值):
	 *   		- 第一行: offsetY = |lineHeight - fontSize| / 2
	 *     			这是行高大于字号时的垂直居中补偿
	 *   		- 后续行: offsetY += lineHeight
	 *     			每换一行, y 方向递增一个行高的距离
	 */
	public static worldComposing(
		textArray: Array<Array<string>>,
		textPolygonBbox2Arrays: Array<Array<TFontPolygonBbox2>>,
		textCanvasRenderMetricsArray: Array<Array<TFontCanvasRenderMetrics>>,
		vertexDataArray: Array<Array<TFontTriangleVertexData>>,
		profile: TTextLayoutFontProfile
	): {
		width: number
		height: number
		initBbox2: BBox2
		vertexDataArray: Array<Array<TFontTriangleVertexData>>
	} {
		const { fontSize, lineHeight } = profile
		/**
		 * 缩放因子: 将 Canvas 渲染坐标映射到世界坐标
		 * 		例:
		 * 			Canvas 基准为 64px, 目标字号为 12mm
		 *     		则 FONT_SCALE = 12 / 64 = 0.1875
		 *     		每个像素对应 0.1875mm 的世界距离
		 */
		const FONT_SCALE: number = fontSize / CANVAS_DRAW_TEXT_STD_MM
		/**
		 * 获取所有字符未排版状态下的全局包围盒
		 * 用于坐标归一化 —— 消除不同字符轮廓的绝对位置差异
		 */
		const { outerRectBbox2 } = TextLayout.calculateOuterRectBbox2(textPolygonBbox2Arrays)
		/**
		 * 实际行高: 如果未指定 lineHeight 则默认等于 fontSize
		 */
		const lineHeight2: number = lineHeight || fontSize
		Bbox2Calculator.clear()
		/**
		 * offsetX: 当前字符的水平偏移(每行内累加)
		 * offsetY: 当前行的垂直偏移(跨行累加)
		 */
		let [offsetX, offsetY]: [number, number] = [0, 0]
		for (let rowIndex: number = 0; rowIndex < textArray.length; rowIndex++) {
			const colSize: number = textArray[rowIndex].length
			/**
			 * 每行开头重置水平偏移
			 */
			offsetX = 0
			/**
			 * 垂直偏移计算:
			 * 		- 第一行 (rowIndex === 0):
			 *   			offsetY = |lineHeight2 - fontSize| / 2
			 *   		这是垂直居中补偿: 当行高 > 字号时, 文字在行高区域内垂直居中
			 *   		数学含义: (行高 - 字号) / 2 = 上方空白 = 下方空白
			 * 		- 后续行 (rowIndex > 0):
			 *   			offsetY += lineHeight2
			 *   		每换一行, y 方向增加一个完整行高
			 */
			offsetY += rowIndex <= 0 ? Math.abs(lineHeight2 - fontSize) / 2 : lineHeight2
			for (let colIndex: number = 0; colIndex < colSize; colIndex++) {
				/**
				 * 水平偏移计算:
				 * 		- 第一个字符 (colIndex === 0): offsetX 重置为 0(-offsetX 等于清零)
				 * 		- 后续字符: 累加前一个字符的实际渲染宽度
				 *   		宽度 = fontSize * 前一字符的宽度比 (fontCanvasRenderWidthRatio)
				 *
				 * fontCanvasRenderWidthRatio 是字符宽度与标准字号的比值, 例如 'W' 可能为 0.8, 'i' 可能为 0.3, 空格为 0.5
				 */
				offsetX += colIndex <= 0 ? -offsetX : fontSize * textCanvasRenderMetricsArray[rowIndex][colIndex - 1].fontCanvasRenderWidthRatio
				const vertextData: TFontTriangleVertexData = vertexDataArray[rowIndex][colIndex]
				/**
				 * 逐顶点坐标变换(就地修改 positions 数组)
				 * 		positions 数组结构: [x0, y0, x1, y1, x2, y2, ...]
				 * 		每 POINT_ARRAY_OCCUPY_SIZE(= 2) 个元素为一个顶点的 (x, y)
				 */
				for (let j: number = 0; j < vertextData.positions.length; j += POINT_ARRAY_OCCUPY_SIZE) {
					/**
					 * 坐标归一化 —— 减去全局包围盒的参考点
					 **/
					/**
					 * 减去 minX: 将所有字符的左边界对齐到 x = 0
					 * 减去 maxY: 将所有字符的上边界对齐到 y = 0 (Y 轴向下为负)
					 */
					vertextData.positions[j] -= outerRectBbox2.minX
					vertextData.positions[j + 1] -= outerRectBbox2.maxY
					/**
					 * 缩放变换 —— 从 Canvas 像素空间映射到世界坐标空间
					 **/
					/**
					 * 数学: p_world = p_normalized * (fontSize / CANVAS_DRAW_TEXT_STD_MM)
					 */
					vertextData.positions[j] *= FONT_SCALE
					vertextData.positions[j + 1] *= FONT_SCALE
					/**
					 * 平移变换 —— 移动到字符在段落中的排版位置
					 **/
					/**
					 * X 方向: 向右偏移 offsetX (字符在行内的水平位置)
					 * Y 方向: 向下偏移 -offsetY (Y 轴方向取反, 因为向下为负)
					 */
					vertextData.positions[j] += offsetX
					vertextData.positions[j + 1] -= offsetY
					/**
					 * 将变换后的顶点坐标纳入包围盒计算
					 * 初始参考点为 (0, 0), 即文本块的左上角原点
					 */
					Bbox2Calculator.calculate(0, 0, vertextData.positions[j], vertextData.positions[j + 1])
				}
			}
		}
		/**
		 * 包围盒修正:
		 * 		减去首行的垂直居中补偿量, 使包围盒的 minY 包含首行上方的空白区域
		 * 		确保了最终的 height 能正确反映包含行高间距的完整文本块高度
		 *
		 * 数学: bbox.minY -= |lineHeight - fontSize| / 2
		 */
		Bbox2Calculator.cache.d2TextShapeBboxMinY -= Math.abs(lineHeight2 - fontSize) / 2
		const bbox2: BBox2 = Bbox2Calculator.generateBbox2()
		return {
			/**
			 * 文本块总宽度
			 */
			width: bbox2.width,
			/**
			 * 文本块总高度(含行间距)
			 */
			height: bbox2.height,
			/**
			 * 完整包围盒(用于后续碰撞检测等)
			 */
			initBbox2: bbox2,
			/**
			 * 已变换的顶点数据(就地修改, 引用不变)
			 */
			vertexDataArray,
		}
	}

	/**
	 * 计算所有字符在未排版状态下的全局包围盒
	 *
	 * 		输入:
	 * 			textPolygonBbox2Arrays: 每个字符的轮廓包围盒数组 [行][列]
	 * 		输出:
	 * 			包含全局包围盒的对象
	 *
	 * 原理说明:
	 * 		在字符矢量化阶段, 每个字符的三角形顶点坐标是基于 Canvas 渲染时的 绝对像素坐标
	 * 		不同字符因为笔画形态不同, 其包围盒的 min/max 各不相同
	 *
	 * 本方法计算所有字符包围盒的"外接矩形"——即包含所有字符的最小 AABB:
	 *   	globalMinX = min (所有字符的 minX)
	 *   	globalMaxX = max (所有字符的 maxX)
	 *   	globalMinY = min (所有字符的 minY)
	 *   	globalMaxY = max (所有字符的 maxY)
	 *
	 * 这个全局包围盒用于后续的坐标归一化:
	 * 		- 减去 globalMinX: 消除水平方向的绝对偏移
	 * 		- 减去 globalMaxY: 消除垂直方向的绝对偏移 (Y 轴翻转)
	 *
	 * 归一化后, 所有字符的顶点坐标都相对于同一个参考点, 便于后续统一缩放和排版
	 */
	public static calculateOuterRectBbox2(textPolygonBbox2Arrays: Array<Array<TFontPolygonBbox2>>): {
		outerRectBbox2: { minX: number; minY: number; maxX: number; maxY: number }
	} {
		let [minX, minY, maxX, maxY]: [number, number, number, number] = [0, 0, 0, 0]
		for (let rowIndex: number = 0; rowIndex < textPolygonBbox2Arrays.length; rowIndex++) {
			const colSize: number = textPolygonBbox2Arrays[rowIndex].length
			for (let colIndex: number = 0; colIndex < colSize; colIndex++) {
				const textPolygonBbox2: TFontPolygonBbox2 = textPolygonBbox2Arrays[rowIndex][colIndex]
				if (textPolygonBbox2) {
					if (rowIndex === 0 && colIndex === 0) {
						minX = textPolygonBbox2.minX
						maxX = textPolygonBbox2.maxX
						minY = textPolygonBbox2.minY
						maxY = textPolygonBbox2.maxY
					}
					minX = minX >= textPolygonBbox2.minX ? textPolygonBbox2.minX : minX
					maxX = maxX <= textPolygonBbox2.maxX ? textPolygonBbox2.maxX : maxX
					minY = minY >= textPolygonBbox2.minY ? textPolygonBbox2.minY : minY
					maxY = maxY <= textPolygonBbox2.maxY ? textPolygonBbox2.maxY : maxY
				}
			}
		}
		return {
			outerRectBbox2: {
				minX,
				maxX,
				minY,
				maxY,
			},
		}
	}

	/**
	 * 复制并平移顶点数据, 同时计算整体包围盒
	 *
	 * 		输入:
	 * 			vertexDataArray: 源顶点数据数组 [行][列]
	 * 		输出:
	 * 			包含深拷贝的顶点数据和计算得到的包围盒
	 *
	 * 原理说明:
	 * 		与 worldComposing 不同, 本方法不做缩放和排版偏移,  而是对已排版的顶点数据做一次深拷贝(避免修改原始数据),  并在遍历过程中计算所有顶点的 AABB 包围盒
	 *
	 * 使用场景:
	 * 		当需要基于已排版的文本数据创建副本(例如编辑态的预览、碰撞检测用的独立数据等), 而不希望影响原始顶点数组时使用
	 *
	 * 数据拷贝策略:
	 * 		- indices: 浅拷贝(扩展运算符 [...]), 三角形索引不会被修改
	 * 		- positions: 逐元素复制到新数组, 确保完全独立
	 */
	public static translateVertexData(vertexDataArray: Array<Array<TFontTriangleVertexData>>): {
		bbox2: BBox2
		vertexDataArray: Array<Array<TFontTriangleVertexData>>
	} {
		const vertexDataArray2: Array<Array<TFontTriangleVertexData>> = []
		let [d2TextShapeBboxMinX, d2TextShapeBboxMaxX, d2TextShapeBboxMinY, d2TextShapeBboxMaxY]: [number, number, number, number] = [undefined!, undefined!, undefined!, undefined!]
		for (let rowIndex: number = 0; rowIndex < vertexDataArray.length; rowIndex++) {
			vertexDataArray2[rowIndex] = []
			for (let colIndex: number = 0; colIndex < vertexDataArray[rowIndex].length; colIndex++) {
				const vertextData: TFontTriangleVertexData = vertexDataArray[rowIndex][colIndex]
				/**
				 * 创建新的顶点数据对象(深拷贝)
				 */
				const vertextData2: TFontTriangleVertexData = {
					indices: [...vertextData.indices],
					positions: [],
				}
				/**
				 * 逐顶点复制坐标并更新包围盒边界
				 **/
				for (let j: number = 0; j < vertextData.positions.length; j += POINT_ARRAY_OCCUPY_SIZE) {
					/**
					 * 复制 (x, y) 坐标对到新数组
					 */
					vertextData2.positions.push(vertextData.positions[j], vertextData.positions[j + 1])
					const x: number = vertextData2.positions[j]
					const y: number = vertextData2.positions[j + 1]
					if (typeof d2TextShapeBboxMinX === 'undefined') {
						d2TextShapeBboxMinX = d2TextShapeBboxMaxX = x
						d2TextShapeBboxMinY = d2TextShapeBboxMaxY = y
					}
					d2TextShapeBboxMinX = d2TextShapeBboxMinX >= x ? x : d2TextShapeBboxMinX
					d2TextShapeBboxMaxX = d2TextShapeBboxMaxX <= x ? x : d2TextShapeBboxMaxX
					d2TextShapeBboxMinY = d2TextShapeBboxMinY >= y ? y : d2TextShapeBboxMinY
					d2TextShapeBboxMaxY = d2TextShapeBboxMaxY <= y ? y : d2TextShapeBboxMaxY
				}
				vertexDataArray2[rowIndex][colIndex] = vertextData2
			}
		}
		return {
			bbox2: new BBox2(d2TextShapeBboxMinX, d2TextShapeBboxMinY, d2TextShapeBboxMaxX, d2TextShapeBboxMaxY),
			vertexDataArray: vertexDataArray2,
		}
	}
}

class Bbox2Calculator {
	public static cache: {
		d2TextShapeBboxMinX: number
		d2TextShapeBboxMaxX: number
		d2TextShapeBboxMinY: number
		d2TextShapeBboxMaxY: number
	} = {
		d2TextShapeBboxMinX: undefined!,
		d2TextShapeBboxMaxX: undefined!,
		d2TextShapeBboxMinY: undefined!,
		d2TextShapeBboxMaxY: undefined!,
	}

	public static calculate(initX: number, initY: number, setX: number, setY: number): void {
		if (typeof Bbox2Calculator.cache.d2TextShapeBboxMinX === 'undefined') {
			Bbox2Calculator.cache.d2TextShapeBboxMinX = Bbox2Calculator.cache.d2TextShapeBboxMaxX = initX
			Bbox2Calculator.cache.d2TextShapeBboxMinY = Bbox2Calculator.cache.d2TextShapeBboxMaxY = initY
		}
		Bbox2Calculator.cache.d2TextShapeBboxMinX = Bbox2Calculator.cache.d2TextShapeBboxMinX >= setX ? setX : Bbox2Calculator.cache.d2TextShapeBboxMinX
		Bbox2Calculator.cache.d2TextShapeBboxMaxX = Bbox2Calculator.cache.d2TextShapeBboxMaxX <= setX ? setX : Bbox2Calculator.cache.d2TextShapeBboxMaxX
		Bbox2Calculator.cache.d2TextShapeBboxMinY = Bbox2Calculator.cache.d2TextShapeBboxMinY >= setY ? setY : Bbox2Calculator.cache.d2TextShapeBboxMinY
		Bbox2Calculator.cache.d2TextShapeBboxMaxY = Bbox2Calculator.cache.d2TextShapeBboxMaxY <= setY ? setY : Bbox2Calculator.cache.d2TextShapeBboxMaxY
	}

	public static generateBbox2(): BBox2 {
		return new BBox2(Bbox2Calculator.cache.d2TextShapeBboxMinX, Bbox2Calculator.cache.d2TextShapeBboxMinY, Bbox2Calculator.cache.d2TextShapeBboxMaxX, Bbox2Calculator.cache.d2TextShapeBboxMaxY)
	}

	public static clear(): void {
		Bbox2Calculator.cache.d2TextShapeBboxMinX = undefined!
		Bbox2Calculator.cache.d2TextShapeBboxMaxX = undefined!
		Bbox2Calculator.cache.d2TextShapeBboxMinY = undefined!
		Bbox2Calculator.cache.d2TextShapeBboxMaxY = undefined!
	}
}
