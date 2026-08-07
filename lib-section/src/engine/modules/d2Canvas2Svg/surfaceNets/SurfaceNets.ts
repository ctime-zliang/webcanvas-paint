import { TD2EdgeItem, TD2PointItem } from '../../../types/Common'
import { View3DUint8Clamped } from '../../../math/NDArray'
import { mallocUint32 } from './Mallocs'

/**
 * SurfaceNets.ts - 2D 等值线提取算法 (Surface Nets)
 *
 * 功能概述:
 *   	- 实现 2D Surface Nets 算法, 从像素化的二值/灰度图像中提取等值线轮廓
 * 		- 将栅格化的文本像素数据转换为由顶点和边组成的矢量轮廓
 *
 * 算法原理 (Surface Nets / Dual Contouring 的 2D 简化版):
 *   	- 遍历图像中每个 2 × 2 像素块(双线性单元)
 *   	- 对每个像素根据阈值 (level) 判定其相位 (phase): 0 = 背景, 1 = 前景
 *   	- 检测相位变化的单元格(即等值线穿过的位置)
 *   	- 对于相位不一致的 2 × 2 块, 使用双线性插值计算等值线穿过的精确位置
 *   	- 在相邻顶点间生成边连接, 形成完整的轮廓多边形
 *
 * 与 Marching Squares 的区别:
 *   	- Marching Squares 将顶点放在网格边上
 *   	- Surface Nets 将顶点放在单元格内部 (Dual 方法)
 *   	- Surface Nets 产生更平滑的轮廓, 顶点位置更优
 *
 * 2 × 2 像素块的 16 种相位组合 (m = p0 | p1 << 1 | p2 << 2 | p3 << 3):
 *   	- p0 = 左上, p1 = 右上, p2 = 左下, p3 = 右下
 *   	- m = 0: 全背景(无顶点)
 *   	- m = 15: 全前景(无顶点)
 *   	m = 1 ~ 14: 等值线穿过, 需要插值计算顶点位置
 *
 * 使用案例:
 *   	- 假设有一个 100 × 50 的灰度图像数据
 *   		const imageData = ctx.getImageData(0, 0, 100, 50)
 *   		const pixels = createCanvasImageDataArray(imageData.data, [100, 50, 4])
 *   		// 提取阈值为 128 的等值线
 *   		const { positions, cells } = SurfaceNets.process(pixels, 128)
 *   		// positions: [[x1, y1], [x2, y2], ...] 轮廓顶点坐标
 *   		// cells: [[0, 1], [1, 2], ...] 边连接(顶点索引对)
 */

/**
 * 顶点生成回调类型
 */
type ICreateSurfaceExtractorArgsVertex = (...args: Array<any>) => void
/**
 * 相位判定回调类型
 */
type ICreateSurfaceExtractorArgsPhase = (...args: Array<any>) => number
/**
 * 边生成回调类型
 */
type ICreateSurfaceExtractorArgsCell = (...args: Array<any>) => void

/**
 * Surface Nets 提取器的参数接口
 * 		- order  // 数据遍历顺序(如 [0, 1] 表示按 行 → 列 遍历)
 * 		- phase  // 相位判定函数: 根据像素值和阈值判断前景/背景
 * 		- vertex  // 顶点生成函数: 根据 2 × 2 块的相位模式插值计算顶点坐标
 * 		- cell  // 边生成函数: 在相邻顶点间建立边连接
 */
interface ICreateSurfaceExtractorArgs {
	order: Array<number>
	phase: ICreateSurfaceExtractorArgsPhase
	vertex: ICreateSurfaceExtractorArgsVertex
	cell: ICreateSurfaceExtractorArgsCell
}

/**
 * 创建 Surface Nets 处理参数(含相位判定、顶点插值、边连接的核心逻辑)
 * 		输入:
 * 			order: 像素数据的维度遍历顺序
 * 		输出:
 * 			包含 phase / vertex / cell 三个核心回调的参数对象
 *
 * 核心算法:
 * 		- phase 函数:
 * 			将像素值 p 与阈值 c 比较:
 *   			- p > c  // 返回 1 (前景)
 *   			- p ≤ c  // 返回 0 (背景)
 * 		- vertex 函数:
 *   		对 2 × 2 像素块进行双线性插值, 计算等值线穿过的精确位置
 *   		像素块布局:
 *     			p0 (左上) | p1 (右上)
 *     			---------|----------
 *     			p2 (左下) | p3 (右下)
 *   		相位掩码 m = p0 | (p1 << 1) | (p2 << 2) | (p3 << 3)
 *   		共 16 种组合(0 ~ 15), 其中 m=0 和 m=15 表示全背景或全前景, 无需生成顶点
 *   		插值公式(以 case 1 为例: 仅左上角为前景):
 *     			x = d0 - 0.25 - 0.25 * (v1 + v0 - 2c) / (v0 - v1)
 *     			y = d1 - 0.25 - 0.25 * (v2 + v0 - 2c) / (v0 - v2)
 *   		其中 v0 ~ v3 为四角像素值, c 为阈值, d0/d1 为网格坐标
 *   		插值本质: 在相邻像素间按值的线性比例确定等值线位置
 * 		- cell 函数:
 *   		当相邻 2 × 2 块的共享边两侧相位不同时, 生成一条连接两个块顶点的边
 *   		边的方向由 p0 的相位决定:
 *   			- p0 = 1  // [v0, v1] (正向)
 *   			- p0 = 0  // [v1, v0] (反向)
 *   		确保轮廓的绕行方向一致(逆时针)
 */
function createHandleParam(order: Array<number>): ICreateSurfaceExtractorArgs {
	const handleParam: ICreateSurfaceExtractorArgs = {
		order,
		/**
		 * 相位判定函数
		 *
		 * 		输入:
		 * 			p: 当前像素值 (0 ~ 255)
		 * 			a: 顶点数组
		 * 			b: 边数组
		 * 			c: 阈值 (level)
		 * 		输出:
		 * 			0 或 1, 表示背景或前景
		 */
		phase: function (p: number, a: number, b: number, c: number): number {
			return +(p > c) | 0
		},
		/**
		 * 顶点插值函数 - 根据 2 × 2 块的 16 种相位组合计算等值线顶点坐标
		 *
		 * 		输入:
		 * 			d0: 当前块的 X 网格坐标
		 * 			d1: 当前块的 Y 网格坐标
		 * 			v0: 左上像素值
		 * 			v1: 右上像素值
		 * 			v2: 左下像素值
		 * 			v3: 右下像素值
		 * 			p0 ~ p3: 对应位置的相位值 (0 / 1)
		 * 			a: 输出顶点数组 (positions)
		 * 			b: 输出边数组 (cells, 此处未使用)
		 * 			c: 阈值 (level)
		 *
		 * 双线性插值原理:
		 *   	- 在 2 × 2 单元格内, 等值线位置由相邻像素值的线性插值确定
		 *   	- 公式核心:
		 * 			offset = 0.25 * (va + vb - 2c) / (va - vb)
		 *   	- 当 va = vb 时趋向无穷(不会发生, 因为此时相位相同不会触发此分支)
		 */
		vertex: function (d0: number, d1: number, v0: number, v1: number, v2: number, v3: number, p0: number, p1: number, p2: number, p3: number, a: Array<Array<number>>, b: Array<Array<number>>, c: number): void {
			/**
			 * 计算 4 位相位掩码: 每个角贡献 1 bit
			 **/
			/**
			 * m 范围 0 ~ 15, 代表 2 × 2 块的 16 种前景/背景组合
			 */
			const m: number = ((p0 << 0) + (p1 << 1) + (p2 << 2) + (p3 << 3)) | 0
			/**
			 * m = 0 (全背景) 或 m = 15 (全前景): 等值线不穿过此块, 不生成顶点
			 */
			if (m === 0 || m === 15) {
				return
			}
			/**
			 * Y 轴翻转系数: Canvas Y向下 → SVG / 数学坐标 Y向上
			 */
			const yFlip: number = -1
			switch (m) {
				case 0: {
					a.push([d0 - 0.5, (d1 - 0.5) * yFlip])
					break
				}
				case 1: {
					/**
					 * 仅左上为前景: 在左上角附近插值
					 */
					a.push([d0 - 0.25 - (0.25 * (v1 + v0 - 2 * c)) / (v0 - v1), (d1 - 0.25 - (0.25 * (v2 + v0 - 2 * c)) / (v0 - v2)) * yFlip])
					break
				}
				case 2: {
					/**
					 * 仅右上为前景: 在右上角附近插值
					 */
					a.push([d0 - 0.75 - (0.25 * (-v1 - v0 + 2 * c)) / (v1 - v0), (d1 - 0.25 - (0.25 * (v3 + v1 - 2 * c)) / (v1 - v3)) * yFlip])
					break
				}

				case 3: {
					/**
					 * 上半行为前景: 顶点在上下中间位置水平插值
					 */
					a.push([d0 - 0.5, (d1 - 0.5 - (0.5 * (v2 + v0 + v3 + v1 - 4 * c)) / (v0 - v2 + v1 - v3)) * yFlip])
					break
				}
				case 4: {
					/**
					 * 仅左下为前景: 在左下角附近插值
					 */
					a.push([d0 - 0.25 - (0.25 * (v3 + v2 - 2 * c)) / (v2 - v3), (d1 - 0.75 - (0.25 * (-v2 - v0 + 2 * c)) / (v2 - v0)) * yFlip])
					break
				}
				case 5: {
					/**
					 * 左列为前景: 顶点在左右中间位置垂直插值
					 */
					a.push([d0 - 0.5 - (0.5 * (v1 + v0 + v3 + v2 - 4 * c)) / (v0 - v1 + v2 - v3), (d1 - 0.5) * yFlip])
					break
				}
				case 6: {
					/**
					 * 右上 + 左下为前景(对角线情况): 综合四角插值
					 */
					a.push([d0 - 0.5 - (0.25 * (-v1 - v0 + v3 + v2)) / (v1 - v0 + v2 - v3), (d1 - 0.5 - (0.25 * (-v2 - v0 + v3 + v1)) / (v2 - v0 + v1 - v3)) * yFlip])
					break
				}
				case 7: {
					/**
					 * 仅右下为背景: 在右下角附近插值(与 case 8 互补)
					 */
					a.push([d0 - 0.75 - (0.25 * (v3 + v2 - 2 * c)) / (v2 - v3), (d1 - 0.75 - (0.25 * (v3 + v1 - 2 * c)) / (v1 - v3)) * yFlip])
					break
				}
				case 8: {
					/**
					 * 仅右下为前景: 在右下角附近插值
					 */
					a.push([d0 - 0.75 - (0.25 * (-v3 - v2 + 2 * c)) / (v3 - v2), (d1 - 0.75 - (0.25 * (-v3 - v1 + 2 * c)) / (v3 - v1)) * yFlip])
					break
				}
				case 9: {
					/**
					 * 左上 + 右下为前景(对角线情况): 综合四角插值(与 case 6 对称)
					 */
					a.push([d0 - 0.5 - (0.25 * (v1 + v0 + -v3 - v2)) / (v0 - v1 + v3 - v2), (d1 - 0.5 - (0.25 * (v2 + v0 + -v3 - v1)) / (v0 - v2 + v3 - v1)) * yFlip])
					break
				}
				case 10: {
					/**
					 * 右列为前景: 顶点在左右中间位置垂直插值(与 case 5 对称)
					 */
					a.push([d0 - 0.5 - (0.5 * (-v1 - v0 + -v3 - v2 + 4 * c)) / (v1 - v0 + v3 - v2), (d1 - 0.5) * yFlip])
					break
				}
				case 11: {
					/**
					 * 仅左下为背景: 在左下角附近插值(与 case 4 互补)
					 */
					a.push([d0 - 0.25 - (0.25 * (-v3 - v2 + 2 * c)) / (v3 - v2), (d1 - 0.75 - (0.25 * (v2 + v0 - 2 * c)) / (v0 - v2)) * yFlip])
					break
				}
				case 12: {
					/**
					 * 下半行为前景: 顶点在上下中间位置水平插值(与 case 3 对称)
					 */
					a.push([d0 - 0.5, (d1 - 0.5 - (0.5 * (-v2 - v0 + -v3 - v1 + 4 * c)) / (v2 - v0 + v3 - v1)) * yFlip])
					break
				}
				case 13: {
					/**
					 * 仅右上为背景: 在右上角附近插值(与 case 2 互补)
					 */
					a.push([d0 - 0.75 - (0.25 * (v1 + v0 - 2 * c)) / (v0 - v1), (d1 - 0.25 - (0.25 * (-v3 - v1 + 2 * c)) / (v3 - v1)) * yFlip])
					break
				}
				case 14: {
					/**
					 * 仅左上为背景: 在左上角附近插值(与 case 1 互补)
					 */
					a.push([d0 - 0.25 - (0.25 * (-v1 - v0 + 2 * c)) / (v1 - v0), (d1 - 0.25 - (0.25 * (-v2 - v0 + 2 * c)) / (v2 - v0)) * yFlip])
					break
				}
				case 15: {
					a.push([d0 - 0.5, (d1 - 0.5) * yFlip])
					break
				}
			}
		},
		/**
		 * 边连接函数 - 当相邻块共享边的两侧相位不同时生成连接边
		 *
		 * 		输入:
		 * 			v0: 第一个顶点索引
		 * 			v1: 第二个顶点索引
		 * 			c0: 边一侧的像素值
		 * 			c1: 边另一侧的像素值
		 * 			p0: 第一个相位值
		 * 			p1: 第二个相位值
		 * 			a: 顶点数组
		 * 			b: 输出边数组 (cells)
		 * 			c: 阈值
		 *
		 * 边方向规则:
		 *  	- p0 = 1 (前景在左 / 上)  // 边方向 [v0, v1]
		 *  	- p0 = 0 (前景在右 / 下)  // 边方向 [v1, v0]
		 *   	确保轮廓始终以逆时针方向环绕前景区域
		 */
		cell: function (v0: number, v1: number, c0: number, c1: number, p0: number, p1: number, a: Array<Array<number>>, b: Array<Array<number>>, c: number): void {
			if (p0) {
				b.push([v0, v1])
			} else {
				b.push([v1, v0])
			}
		},
	}
	return handleParam
}

/**
 * 核心像素遍历与等值线提取函数
 *
 * 		输入:
 * 			handleParam: 包含 phase / vertex / cell 回调的参数对象
 * 			pixels: 3D 像素数据视图 (shape: [width, height, channels])
 * 			verts: 输出顶点数组
 * 			cells: 输出边数组
 * 			level: 等值线阈值(通常为 128, 即灰度图中间值)
 *
 * 算法流程:
 *   	- 首先扫描第一行, 计算每个像素的相位并存入 P[] 数组
 *   	- 从第二行开始, 对每个 2 × 2 块:
 *      	- 计算当前像素的相位 b0
 *      	- 取出左邻 (b1), 上邻 (b2), 左上邻 (b3) 的相位
 *      	- 若四个相位不全相同, 等值线穿过此块
 *      	- 调用 vertex() 计算顶点坐标
 *      	- 检查与左邻 / 上邻块的相位差异, 若有则调用 cell() 生成边
 *   	- 使用双行缓冲技术 (P[], V[]):
 *      	- P[]: 存储相位值(当前行和上一行交替使用)
 *      	- V[]: 存储顶点索引(用于边连接)
 *      	- 通过交换偏移量 (e1 ↔ y1, e2 ↔ y2, e3 ↔ y3) 实现行间切换
 *
 * 内存优化:
 *   	- P[] 和 V[] 仅保存当前行和上一行的数据(2×width)
 *   	- 使用 mallocUint32 分配对齐内存
 *   	- 通过交换指针偏移量而非复制数据来切换行
 */
function fillVertexData(handleParam: ICreateSurfaceExtractorArgs, pixels: View3DUint8Clamped, verts: Array<Array<number>>, cells: Array<Array<number>>, level: number): void {
	/**
	 * 图像维度与步幅信息
	 */
	/**
	 * 图像的宽高
	 **/
	const shape0: number = pixels.shape[0] | 0
	const shape1: number = pixels.shape[1] | 0
	const pixelData: Uint8ClampedArray = pixels.data
	/**
	 * 像素数据在内存中的行方向步幅, 当前在 P[] / V[] 中的写入位置
	 */
	const stride0: number = pixels.stride[0] | 0
	/**
	 * 像素数据在内存中的列方向步幅, 当前在 P[] / V[] 中的写入位置
	 */
	const stride1: number = pixels.stride[1] | 0
	/**
	 * 像素偏移指针
	 **/
	/**
	 * 当前像素的全局偏移, 即当前像素在 data 数组中的偏移
	 */
	let p0: number = pixels.offset | 0
	/**
	 * 2×2 块中相邻像素的相对偏移
	 **/
	/**
	 * 当前像素值(右下)
	 */
	let c0_0: number = 0
	/**
	 * 左邻像素的偏移 (-1 in X)
	 */
	let d0_1: number = -stride0 | 0
	/**
	 * 左邻像素值
	 */
	let c0_1: number = 0
	/**
	 * 上邻像素的偏移 (-1 in Y)
	 */
	let d0_2: number = -stride1 | 0
	/**
	 * 上邻像素值
	 */
	let c0_2: number = 0
	/**
	 * 左上邻像素的偏移
	 */
	let d0_3: number = (-stride0 - stride1) | 0
	/**
	 * 左上邻像素值
	 */
	let c0_3: number = 0
	/**
	 * 遍历步进量
	 **/
	/**
	 * X 方向前进一步
	 */
	let u0_0: number = stride0 | 0
	/**
	 * 换行: Y+1 并回到行首
	 */
	let u0_1: number = (stride1 - stride0 * shape0) | 0
	/**
	 * 循环变量
	 **/
	/**
	 * X 索引
	 */
	let i0: number = 0
	/**
	 * Y 索引
	 */
	let i1: number = 0

	/**
	 * 顶点计数器
	 **/
	/**
	 * 已生成顶点总数
	 */
	let N: number = 0
	/**
	 * 双行缓冲区
	 */
	/**
	 * Q = 2 × 宽度: 存储当前行和上一行的相位 / 顶点索引
	 */
	let Q: number = (2 * shape0) | 0
	/**
	 * 相位缓冲 (0 或 1)
	 */
	let P: Uint32Array = mallocUint32(Q)
	/**
	 * 顶点索引缓冲
	 */
	let V: Uint32Array = mallocUint32(Q)
	/**
	 * 缓冲区写入位置
	 */
	let X: number = 0
	/**
	 * 当前 2 × 2 块四角的相位
	 * 相邻块偏移量(双行交替)
	 **/
	/**
	 * b0: 当前块相位
	 * b1: 左邻
	 * b2: 上邻
	 * b3: 左上邻
	 */
	let b0: number = 0
	let b1: number = 0
	let b2: number = 0
	let b3: number = 0
	/**
	 * 左邻偏移(当前行内), 交替正负
	 */
	let e1: number = -1 | 0
	/**
	 * 左邻偏移, 交替正负
	 */
	let y1: number = -1 | 0
	/**
	 * 上邻偏移(上一行), 交替正负
	 */
	let e2: number = -shape0 | 0
	/**
	 * 上邻偏移, 交替正负
	 */
	let y2: number = shape0 | 0
	/**
	 * 左上邻偏移
	 */
	let e3: number = (-shape0 - 1) | 0
	/**
	 * // 左上邻偏移, 交替正负
	 */
	let y3: number = (shape0 - 1) | 0
	/**
	 * 当前生成的顶点索引
	 */
	let v0: number = 0
	/**
	 * 交换临时变量
	 */
	let T: number = 0
	/**
	 * 第一行: 仅计算相位, 不生成顶点(无上邻参考)
	 */
	for (i0 = 0; i0 < shape0; ++i0) {
		P[X++] = handleParam.phase(pixelData[p0], verts, cells, level)
		p0 += u0_0
	}
	/**
	 * 换行
	 */
	p0 += u0_1
	/**
	 * 开始提取等值线
	 **/
	if (shape1 > 0) {
		i1 = 1
		/**
		 * 第二行第一个像素: 仅计算相位(无左邻参考)
		 */
		P[X++] = handleParam.phase(pixelData[p0], verts, cells, level)
		p0 += u0_0
		if (shape0 > 0) {
			/**
			 * 第二行第二个像素: 第一个可构成完整 2 × 2 块的位置
			 */
			i0 = 1
			c0_0 = pixelData[p0]
			b0 = P[X] = handleParam.phase(c0_0, verts, cells, level)
			/**
			 * 左邻相位
			 */
			b1 = P[X + e1]
			/**
			 * 上邻相位
			 */
			b2 = P[X + e2]
			/**
			 * 左上邻相位
			 */
			b3 = P[X + e3]
			/**
			 * 若四角相位不全相同 → 等值线穿过此 2 × 2 块
			 */
			if (b0 !== b1 || b0 !== b2 || b0 !== b3) {
				/**
				 * 左邻像素值
				 */
				c0_1 = pixelData[p0 + d0_1]
				/**
				 * 上邻像素值
				 */
				c0_2 = pixelData[p0 + d0_2]
				/**
				 * 左上邻像素值
				 */
				c0_3 = pixelData[p0 + d0_3]
				/**
				 * 插值计算顶点坐标
				 */
				handleParam.vertex(i0, i1, c0_0, c0_1, c0_2, c0_3, b0, b1, b2, b3, verts, cells, level)
				/**
				 * 记录顶点索引
				 */
				v0 = V[X] = N++
			}
			X += 1
			p0 += u0_0
			/**
			 * 第二行剩余像素: 可检查左邻边的连接
			 */
			for (i0 = 2; i0 < shape0; ++i0) {
				c0_0 = pixelData[p0]
				b0 = P[X] = handleParam.phase(c0_0, verts, cells, level)
				b1 = P[X + e1]
				b2 = P[X + e2]
				b3 = P[X + e3]
				if (b0 !== b1 || b0 !== b2 || b0 !== b3) {
					c0_1 = pixelData[p0 + d0_1]
					c0_2 = pixelData[p0 + d0_2]
					c0_3 = pixelData[p0 + d0_3]
					handleParam.vertex(i0, i1, c0_0, c0_1, c0_2, c0_3, b0, b1, b2, b3, verts, cells, level)
					v0 = V[X] = N++
					/**
					 * 检查水平方向边连接: 左上邻 ≠ 左邻 → 生成水平边
					 */
					if (b3 !== b1) {
						handleParam.cell(V[X + e1], v0, c0_3, c0_1, b3, b1, verts, cells, level)
					}
				}
				X += 1
				p0 += u0_0
			}
		}
		/**
		 * 换行
		 */
		p0 += u0_1
		/**
		 * 双行缓冲区偏移量交换
		 **/
		/**
		 * 交换 e1 ↔ y1, e2 ↔ y2, e3 ↔ y3, 使得下一行访问的"上一行"数据正确
		 */
		X = 0
		T = e1
		e1 = y1
		y1 = T
		T = e2
		e2 = y2
		y2 = T
		T = e3
		e3 = y3
		y3 = T
		/**
		 * 完整的 2 × 2 块遍历 (可同时检查水平和垂直边)
		 **/
		for (i1 = 2; i1 < shape1; ++i1) {
			/**
			 * 每行第一个像素: 仅计算相位
			 */
			P[X++] = handleParam.phase(pixelData[p0], verts, cells, level)
			p0 += u0_0
			if (shape0 > 0) {
				/**
				 * 每行第二个像素: 首个完整 2×2 块, 检查垂直边
				 */
				i0 = 1
				c0_0 = pixelData[p0]
				b0 = P[X] = handleParam.phase(c0_0, verts, cells, level)
				b1 = P[X + e1]
				b2 = P[X + e2]
				b3 = P[X + e3]
				if (b0 !== b1 || b0 !== b2 || b0 !== b3) {
					c0_1 = pixelData[p0 + d0_1]
					c0_2 = pixelData[p0 + d0_2]
					c0_3 = pixelData[p0 + d0_3]
					handleParam.vertex(i0, i1, c0_0, c0_1, c0_2, c0_3, b0, b1, b2, b3, verts, cells, level)
					v0 = V[X] = N++
					/**
					 * 检查垂直方向边连接: 左上邻 ≠ 上邻 → 生成垂直边
					 */
					if (b3 !== b2) {
						handleParam.cell(V[X + e2], v0, c0_2, c0_3, b2, b3, verts, cells, level)
					}
				}
				X += 1
				p0 += u0_0
				/**
				 * 每行剩余像素: 同时检查水平和垂直两个方向的边连接
				 */
				for (i0 = 2; i0 < shape0; ++i0) {
					c0_0 = pixelData[p0]
					b0 = P[X] = handleParam.phase(c0_0, verts, cells, level)
					b1 = P[X + e1]
					b2 = P[X + e2]
					b3 = P[X + e3]
					if (b0 !== b1 || b0 !== b2 || b0 !== b3) {
						c0_1 = pixelData[p0 + d0_1]
						c0_2 = pixelData[p0 + d0_2]
						c0_3 = pixelData[p0 + d0_3]
						handleParam.vertex(i0, i1, c0_0, c0_1, c0_2, c0_3, b0, b1, b2, b3, verts, cells, level)
						v0 = V[X] = N++
						/**
						 * 垂直边: 上邻块相位 ≠ 左上邻块相位
						 */
						if (b3 !== b2) {
							handleParam.cell(V[X + e2], v0, c0_2, c0_3, b2, b3, verts, cells, level)
						}
						/**
						 * 水平边: 左邻块相位 ≠ 左上邻块相位
						 */
						if (b3 !== b1) {
							handleParam.cell(V[X + e1], v0, c0_3, c0_1, b3, b1, verts, cells, level)
						}
					}
					X += 1
					p0 += u0_0
				}
			}
			/**
			 * 奇偶行切换: 当 i1 为奇数时重置写入位置到缓冲区头部
			 */
			if (i1 & 1) {
				X = 0
			}
			/**
			 * 交换行间偏移量, 实现双行缓冲的交替读写
			 */
			T = e1
			e1 = y1
			y1 = T
			T = e2
			e2 = y2
			y2 = T
			T = e3
			e3 = y3
			y3 = T
			/**
			 * 换行
			 */
			p0 += u0_1
		}
	}
}

/**
 * SurfaceNets 等值线提取控制器
 *
 * 设计模式:
 *   	使用静态缓存 (CACHE) 避免为相同数据类型重复创建提取器
 *   	缓存键 = "order + dtype", 如 "0, 1 - uint8_clamped"
 *
 * 完整使用流程:
 *   	- Canvas 渲染白色文本到黑色背景
 *  	- getImageData() 获取像素数据
 *   	- createCanvasImageDataArray() 包装为 View3DUint8Clamped
 *   	- SurfaceNets.process(pixels, 128) 提取文本轮廓
 *   	- 返回的 positions + cells 构成文本的矢量轮廓线段集合
 *
 * 案例:
 *   	- 提取一个 200×100 像素图像中的文字轮廓
 *   		const ctx = canvas.getContext('2d')
 *   		ctx.fillStyle = '#000'
 *   		ctx.fillRect(0, 0, 200, 100)
 *   		ctx.fillStyle = '#fff'
 *   		ctx.font = '48px Arial'
 *   		ctx.fillText('A', 50, 70)
 *   		const imageData = ctx.getImageData(0, 0, 200, 100)
 *   		const pixels = createCanvasImageDataArray(imageData.data, [200, 100, 4])
 *   		const result = SurfaceNets.process(pixels, 128)
 *   		// result.positions: 字母 "A" 轮廓上的顶点坐标
 *   		// result.cells: 连接这些顶点的边 (形成闭合轮廓)
 */
export class SurfaceNets {
	/**
	 * 按数据类型签名缓存的处理函数
	 */
	private static CACHE: {
		[key: string]: (
			pixels: View3DUint8Clamped,
			level: number
		) => {
			positions: Array<TD2PointItem>
			cells: Array<TD2EdgeItem>
		}
	} = {}

	/**
	 * 将栅格化像素图像分解为矢量轮廓(顶点 + 边)
	 *
	 * 		输入:
	 * 			pixels: 3D 像素数据视图 (View3DUint8Clamped)
	 * 				shape: [width, height, channels(4 = RGBA)]
	 * 				使用第一个通道 (R) 的值进行阈值判定
	 * 			level: 等值线阈值 (0 ~ 255)
	 * 				典型值 128: 将图像二值化为前景 (> 128) 和背景 (≤ 128)
	 * 		输出:
	 * 			{ positions, cells }:
	 * 				positions: 轮廓顶点坐标数组 [[x1, y1], [x2, y2], ...]
	 * 				cells: 边连接数组 [[i, j], [j, k], ...] (顶点索引对)
	 */
	public static process(
		pixels: View3DUint8Clamped,
		level: number
	): {
		positions: Array<TD2PointItem>
		cells: Array<TD2EdgeItem>
	} {
		/**
		 * 生成缓存键: 数据遍历顺序 + 数据类型
		 */
		const typesig: string = pixels.order.join() + '-' + pixels.dtype
		let proc: (
			pixels: View3DUint8Clamped,
			level: number
		) => {
			positions: Array<TD2PointItem>
			cells: Array<TD2EdgeItem>
		} = SurfaceNets.CACHE[typesig]
		level = +level || 0.0
		/**
		 * 若缓存中无此类型的处理函数, 创建并缓存
		 */
		if (!proc) {
			proc = SurfaceNets.CACHE[typesig] = function (
				pixels: View3DUint8Clamped,
				level: number
			): {
				positions: Array<TD2PointItem>
				cells: Array<TD2EdgeItem>
			} {
				const handleParam: ICreateSurfaceExtractorArgs = createHandleParam(pixels.order)
				const verts: Array<TD2PointItem> = []
				const cells: Array<TD2EdgeItem> = []
				fillVertexData(handleParam, pixels, verts, cells, level)
				return {
					positions: verts,
					cells: cells,
				}
			}
		}
		return proc(pixels, level)
	}
}
