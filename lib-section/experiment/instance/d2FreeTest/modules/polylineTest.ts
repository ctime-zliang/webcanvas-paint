import { Arc, BBox2, Color, Line, Matrix3, Polyline, Vector2, WebCanvas } from '../../../../src/Main'
import { createShapePoints, createShapePrimitivesByPolyline } from '../utils/createPrimitives'

function createPentagramPrimitives(): Array<Line | Arc> {
	const centerPoint: Vector2 = new Vector2(-50, -50)
	/**
	 * [外半径, 内半径]
	 */
	const radius: [number, number] = [100, 40]
	/**
	 * 五角星顶点计算
	 *
	 * 外顶点角度
	 * 		i = 0, 2, 4, 6, 8:
	 * 			PI / 2 + i * PI / 5
	 * 内拐点角度
	 * 		i = 1, 3, 5, 7, 9:
	 * 			PI / 2 + i * PI / 5
	 */
	const outerAngles: Array<number> = Array.from({ length: 5 }, (_, i) => Math.PI / 2 + (i * 2 * Math.PI) / 5)
	const innerAngles: Array<number> = Array.from({ length: 5 }, (_, i) => Math.PI / 2 + ((2 * i + 1) * Math.PI) / 5)
	/**
	 * 外顶点坐标
	 */
	const outerPoints: Array<Vector2> = outerAngles.map((angle: number): Vector2 => {
		return new Vector2(centerPoint.x + radius[0] * Math.cos(angle), centerPoint.y + radius[0] * Math.sin(angle))
	})
	/**
	 * 内拐点圆弧参数
	 * 		圆弧中心点: 五角星中心 (centerPoint.x, centerPoint.y)
	 * 		圆弧半径: radius[1]
	 * 		每个内拐点处用一段圆弧替代尖角
	 * 		圆弧半张角: arcHalfAngle, 取内外相邻角距的一半 (PI / 10)
	 */
	const center: Vector2 = new Vector2(centerPoint.x, centerPoint.y)
	const arcHalfAngle: number = Math.PI / 10
	/**
	 * 构建图元序列:
	 * 		Line → Arc → Line → Arc → ... (闭合)
	 *
	 * 路径顺序 (与原始五角星方向一致):
	 * 		Out0 → In0(arc) → Out1 → In1(arc) → Out2 → In2(arc) → Out3 → In3(arc) → Out4 → In4(arc) → Out0
	 *
	 * 每段:
	 * 		Line: OutI → innerCircle at (innerAngles[I] - arcHalfAngle)  [圆弧起点]
	 * 		Arc:  从 (innerAngles[I] - arcHalfAngle) 到 (innerAngles[I] + arcHalfAngle)  [沿内圆弧]
	 * 		Line: innerCircle at (innerAngles[I] + arcHalfAngle) → Out(I + 1)
	 */
	const primitives: Array<Line | Arc> = []
	for (let i: number = 0; i < 5; i++) {
		const nextI: number = (i + 1) % 5
		/**
		 * 圆弧起止角 (内拐点 i 处)
		 */
		const arcStart: number = innerAngles[i] - arcHalfAngle
		const arcEnd: number = innerAngles[i] + arcHalfAngle
		/**
		 * 圆弧起止点坐标
		 */
		const arcStartPoint: Vector2 = new Vector2(centerPoint.x + radius[1] * Math.cos(arcStart), centerPoint.y + radius[1] * Math.sin(arcStart))
		const arcEndPoint: Vector2 = new Vector2(centerPoint.x + radius[1] * Math.cos(arcEnd), centerPoint.y + radius[1] * Math.sin(arcEnd))
		/**
		 * Line: OutI → 圆弧起点
		 */
		primitives.push(new Line(outerPoints[i], arcStartPoint))
		/**
		 * Arc: 内拐点处圆弧 (CCW, endRadian > startRadian)
		 */
		primitives.push(new Arc(radius[1], center, arcStart, arcEnd))
		/**
		 * Line: 圆弧终点 → Out(I+1)
		 */
		primitives.push(new Line(arcEndPoint, outerPoints[nextI]))
	}
	return primitives
}

export function polylineTest01(webCanvas: WebCanvas, layerItemId: string): void {
	const primitives: Array<Line | Arc> = createPentagramPrimitives()
	/**
	 * 折线构建
	 */
	console.log('%c <T: 折线构建>', 'color: #ff6600')
	const pl: Polyline = Polyline.build1(primitives)
	console.log(pl)
	console.log('%c </T>', 'color: #ff6600')
	createShapePrimitivesByPolyline(webCanvas, layerItemId, pl)
	/* ... */
	const points: Array<{ label: string; position: Vector2 }> = []
	for (let i: number = 0; i < primitives.length; i++) {
		const p: Line | Arc = primitives[i]
		points.push({ label: `P${i}`, position: p.startPoint })
		points.push({ label: `P${i}`, position: p.endPoint })
	}
	createShapePoints(webCanvas, layerItemId, points)
}

export function polylineTest02(webCanvas: WebCanvas, layerItemId: string): void {
	const primitives: Array<Line | Arc> = createPentagramPrimitives()
	/**
	 * 折线矩阵变换
	 */
	console.log('%c <T: 折线矩阵变换>', 'color: #ff6600')
	const pl: Polyline = Polyline.build1(primitives)
	createShapePrimitivesByPolyline(webCanvas, layerItemId, pl)
	console.log(pl)
	const pl1: Polyline = pl.multiplyMatrix3(Matrix3.translate(100, 100).scale(1.5, 1.5))
	createShapePrimitivesByPolyline(webCanvas, layerItemId, pl1, { strokeColor: Color.RED })
	console.log(pl1)
	console.log('%c </T>', 'color: #ff6600')
}

export function polylineTest03(webCanvas: WebCanvas, layerItemId: string): void {
	const primitives: Array<Line | Arc> = createPentagramPrimitives()
	/**
	 * 折线近似采样
	 */
	console.log('%c <T: 折线近似采样>', 'color: #ff6600')
	const pl: Polyline = Polyline.build1(primitives)
	createShapePrimitivesByPolyline(webCanvas, layerItemId, pl)
	console.log(pl)
	const points: Array<{ label: string; position: Vector2 }> = []
	pl.points(1, (point: Vector2, index: number): void => {
		points.push({ label: `P${index}`, position: point })
	})
	console.log(points)
	console.log('%c </T>', 'color: #ff6600')
	/* ... */
	createShapePoints(webCanvas, layerItemId, points)
}

export function polylineTest04(webCanvas: WebCanvas, layerItemId: string): void {
	const primitives: Array<Line | Arc> = createPentagramPrimitives()
	/**
	 * 折线 BBox2
	 */
	console.log('%c <T: 折线 BBox2>', 'color: #ff6600')
	const pl: Polyline = Polyline.build1(primitives)
	createShapePrimitivesByPolyline(webCanvas, layerItemId, pl)
	console.log(pl)
	const bbox21: BBox2 = pl.buildBBox2()
	console.log(bbox21)
	console.log('%c </T>', 'color: #ff6600')
	/* ... */
	createShapePoints(webCanvas, layerItemId, [
		{ label: `Bx21.LeftUp`, position: bbox21.leftUp },
		{ label: `Bx21.RightUp`, position: bbox21.rightUp },
		{ label: `Bx21.LeftDown`, position: bbox21.leftDown },
		{ label: `Bx21.RightDown`, position: bbox21.rightDown },
	])
}

export function polylineTest05(webCanvas: WebCanvas, layerItemId: string): void {
	const primitives1: Array<Line | Arc> = [
		new Line(new Vector2(10, 10), new Vector2(50, 10)),
		new Line(new Vector2(50, 10), new Vector2(50, 50)),
		new Line(new Vector2(50, 50), new Vector2(10, 50)),
		new Line(new Vector2(10, 50), new Vector2(10, 10.01)),
	]
	const primitives2: Array<Line | Arc> = createPentagramPrimitives()
	/**
	 * 折线闭合判定
	 */
	console.log('%c <T: 折线闭合判定>', 'color: #ff6600')
	const pl: Polyline = Polyline.build1(primitives1)
	createShapePrimitivesByPolyline(webCanvas, layerItemId, pl)
	console.log(pl)
	console.log(pl.isClosed(3))
	console.log('%c </T>', 'color: #ff6600')
}

export function polylineTest06(webCanvas: WebCanvas, layerItemId: string): void {
	const primitives1: Array<Line | Arc> = [
		new Line(new Vector2(10, 10), new Vector2(50, 10)),
		new Line(new Vector2(50, 10), new Vector2(50, 50)),
		new Line(new Vector2(50, 50), new Vector2(10, 50)),
		new Line(new Vector2(10, 50), new Vector2(10, 10)),
	]
	const primitives2: Array<Line | Arc> = createPentagramPrimitives()
	/**
	 * 折线面积计算
	 */
	console.log('%c <T: 折线面积计算>', 'color: #ff6600')
	const pl: Polyline = Polyline.build1(primitives2)
	createShapePrimitivesByPolyline(webCanvas, layerItemId, pl)
	console.log(pl)
	console.log(pl.getArea(0))
	console.log('%c </T>', 'color: #ff6600')
}

export function polylineTest07(webCanvas: WebCanvas, layerItemId: string): void {
	const primitives1: Array<Line | Arc> = [new Line(new Vector2(10, 10), new Vector2(50, 10)), new Line(new Vector2(50, 10), new Vector2(50, 50)), new Line(new Vector2(50, 50), new Vector2(-10, 50))]
	/**
	 * 闭合开口折线
	 */
	console.log('%c <T: 闭合开口折线>', 'color: #ff6600')
	const pl: Polyline = Polyline.build1(primitives1)
	createShapePrimitivesByPolyline(webCanvas, layerItemId, pl)
	console.log(pl)
	console.log(pl.asClose())
	createShapePrimitivesByPolyline(webCanvas, layerItemId, pl.multiplyMatrix3(Matrix3.translate(10, 10)), {
		strokeColor: Color.RED,
	})
	console.log('%c </T>', 'color: #ff6600')
}
