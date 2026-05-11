import { BBox2, Color, D2LineToolkit, Line, Polyline, Vector2, WebCanvas } from '../../../Main'
import { createPoints } from '../utils/createPoints'

export function d2LineToolkitTest01(webCanvas: WebCanvas, layerItemId: string): void {
	const { d2ElementController } = webCanvas
	const [lineAStartPoint, lineAEndPoint]: [Vector2, Vector2] = [new Vector2(0, 70), new Vector2(50, 0)]
	d2ElementController.createD2LineElementShapeItem(layerItemId, lineAStartPoint, lineAEndPoint, {
		strokeColor: Color.RED,
		isEnableSelect: false,
	})
	const [pointA]: [Vector2] = [new Vector2(100, 50)]
	d2ElementController.createD2PointElementShapeItem(layerItemId, pointA, {
		strokeColor: Color.GREEN,
		isEnableScale: true,
		isEnableSelect: false,
	})
	/**
	 * 计算点到线段的垂线
	 */
	console.log('%c <T: 计算点到线段的垂线>', 'color: #ff6600')
	const [lineA]: [Line] = [new Line(lineAStartPoint, lineAEndPoint)]
	const footRes: { point: Vector2; t: number } = D2LineToolkit.calcFootOfPoint2Line(lineA, pointA)
	console.log(footRes)
	console.log('%c </T>', 'color: #ff6600')
	d2ElementController.createD2LineElementShapeItem(layerItemId, pointA, footRes.point, {
		strokeColor: Color.GOLDEN,
		isEnableSelect: false,
		isSolid: false,
		strokeWidth: 0.5,
	})
	/* ... */
	createPoints(webCanvas, layerItemId, [
		{ label: `lineAStartPoint`, position: lineAStartPoint },
		{ label: `lineAEndPoint`, position: lineAEndPoint },
		{ label: `pointA`, position: pointA },
		{ label: `Foot`, position: footRes.point },
	])
	console.log(d2ElementController.getAllD2ElementShapeResults())
}

export function d2LineToolkitTest02(webCanvas: WebCanvas, layerItemId: string): void {
	const { d2ElementController } = webCanvas
	const [lineAStartPoint, lineAEndPoint]: [Vector2, Vector2] = [new Vector2(0, -30), new Vector2(0, 30)]
	d2ElementController.createD2LineElementShapeItem(layerItemId, lineAStartPoint, lineAEndPoint, {
		strokeColor: Color.RED,
		isEnableSelect: false,
	})
	const [pointA, pointB]: [Vector2, Vector2] = [new Vector2(20, 20), new Vector2(-30, -20)]
	d2ElementController.createD2LineElementShapeItem(layerItemId, pointA, pointB, {
		strokeColor: Color.GREEN,
		isEnableSelect: false,
	})
	/**
	 * 判断点是否在线段上
	 */
	console.log('%c <T: 判断点是否在线段上>', 'color: #ff6600')
	const [lineA]: [Line] = [new Line(lineAStartPoint, lineAEndPoint)]
	const a1: boolean = D2LineToolkit.isPointOnLine(lineA, pointA)
	const a2: boolean = D2LineToolkit.isPointOnLine2(lineA, pointA, 0.5)
	console.log(a1, a2)
	console.log('%c </T>', 'color: #ff6600')
	console.log('%c <T: 计算线段交点>', 'color: #ff6600')
	const ip1: Vector2 = D2LineToolkit.isSegmentIntered(lineA, new Line(pointA, pointB))
	console.log(ip1)
	console.log('%c </T>', 'color: #ff6600')
	/* ... */
	createPoints(webCanvas, layerItemId, [
		{ label: `lineAStartPoint`, position: lineAStartPoint },
		{ label: `lineAEndPoint`, position: lineAEndPoint },
		{ label: `pointA`, position: pointA },
		{ label: `pointB`, position: pointB },
		{ label: `InterPoint`, position: ip1 },
	])
	console.log(d2ElementController.getAllD2ElementShapeResults())
}

export function d2LineToolkitTest03(webCanvas: WebCanvas, layerItemId: string): void {
	const { d2ElementController } = webCanvas
	const [lineAStartPoint, lineAEndPoint]: [Vector2, Vector2] = [new Vector2(-30, -30), new Vector2(0, 30)]
	d2ElementController.createD2LineElementShapeItem(layerItemId, lineAStartPoint, lineAEndPoint, {
		strokeColor: Color.RED,
		isEnableSelect: false,
	})
	/**
	 * 求线段上到线段外的任意点最近的点坐标
	 */
	console.log('%c <T: 求线段上到线段外的任意点最近的点坐标>', 'color: #ff6600')
	const [lineA]: [Line] = [new Line(lineAStartPoint, lineAEndPoint)]
	const [pointA]: [Vector2] = [new Vector2(-75, 20)]
	const closedPoint: Vector2 = D2LineToolkit.getClosedPointOnLineWithPoint(lineA, pointA)
	console.log(closedPoint)
	console.log('%c </T>', 'color: #ff6600')
	d2ElementController.createD2LineElementShapeItem(layerItemId, pointA, closedPoint, {
		strokeColor: Color.GOLDEN,
		isEnableSelect: false,
		isSolid: false,
		strokeWidth: 0.5,
	})
	/* ... */
	createPoints(webCanvas, layerItemId, [
		{ label: `lineAStartPoint`, position: lineAStartPoint },
		{ label: `lineAEndPoint`, position: lineAEndPoint },
		{ label: `pointA`, position: pointA },
		{ label: `closedPoint`, position: closedPoint },
	])
	console.log(d2ElementController.getAllD2ElementShapeResults())
}

export function d2LineToolkitTest04(webCanvas: WebCanvas, layerItemId: string): void {
	const { d2ElementController, d2TextElementController } = webCanvas
	const [lineAStartPoint, lineAEndPoint]: [Vector2, Vector2] = [new Vector2(-30, -30), new Vector2(0, 30)]
	d2ElementController.createD2LineElementShapeItem(layerItemId, lineAStartPoint, lineAEndPoint, {
		strokeColor: Color.RED,
		isEnableSelect: false,
	})
	/**
	 * 求线段上到线段外的任意点最近的点坐标, 并计算最近距离
	 */
	console.log('%c <T: 求线段上到线段外的任意点最近的点坐标, 并计算最近距离>', 'color: #ff6600')
	const [lineA]: [Line] = [new Line(lineAStartPoint, lineAEndPoint)]
	const [pointA]: [Vector2] = [new Vector2(-75, 20)]
	const closedRes: { point: Vector2; d: number } = D2LineToolkit.getClosedPointOnSegmentWithPoint(lineA, pointA)
	console.log(closedRes)
	console.log('%c </T>', 'color: #ff6600')
	d2ElementController.createD2LineElementShapeItem(layerItemId, pointA, closedRes.point, {
		strokeColor: Color.GOLDEN,
		isEnableSelect: false,
		isSolid: false,
		strokeWidth: 0.5,
	})
	d2TextElementController.createD2TextElementItem(layerItemId, new Vector2(closedRes.point.x, closedRes.point.y - 5), `min-dist = ${closedRes.d}`, {
		fontSize: 5,
		strokeColor: Color.GOLDEN,
		isEnableSelect: false,
	})
	/* ... */
	createPoints(webCanvas, layerItemId, [
		{ label: `lineAStartPoint`, position: lineAStartPoint },
		{ label: `lineAEndPoint`, position: lineAEndPoint },
		{ label: `pointA`, position: pointA },
		{ label: `closedPoint`, position: closedRes.point },
	])
	console.log(d2ElementController.getAllD2ElementShapeResults())
}

export function d2LineToolkitTest05(webCanvas: WebCanvas, layerItemId: string): void {
	const { d2ElementController } = webCanvas
	const [lineAStartPoint, lineAEndPoint]: [Vector2, Vector2] = [new Vector2(50, -100), new Vector2(50, 100)]
	d2ElementController.createD2LineElementShapeItem(layerItemId, lineAStartPoint, lineAEndPoint, {
		strokeColor: Color.RED,
		isEnableSelect: false,
	})
	/**
	 * 求线段 line 上距离点 point 距离值为 distance 的点坐标
	 */
	console.log('%c <T: 求线段 line 上距离点 point 距离值为 distance 的点坐标>', 'color: #ff6600')
	const [lineA]: [Line] = [new Line(lineAStartPoint, lineAEndPoint)]
	const [pointA]: [Vector2] = [new Vector2(0, 0)]
	const dist: number = 75
	const targetPoints: Array<Vector2> = D2LineToolkit.getPointsOnLineWithDistance(dist, lineA, pointA)
	console.log(dist, targetPoints)
	console.log('%c </T>', 'color: #ff6600')
	const renderPoints: Array<any> = [
		{ label: `lineAStartPoint`, position: lineAStartPoint },
		{ label: `lineAEndPoint`, position: lineAEndPoint },
		{ label: `pointA`, position: pointA },
	]
	for (let item of targetPoints) {
		d2ElementController.createD2LineElementShapeItem(layerItemId, pointA, item, {
			strokeColor: Color.GOLDEN,
			isEnableSelect: false,
			isSolid: false,
			strokeWidth: 0.5,
		})
		renderPoints.push({ label: `closedPoint`, position: item })
	}
	/* ... */
	createPoints(webCanvas, layerItemId, renderPoints)
	console.log(d2ElementController.getAllD2ElementShapeResults())
}

export function d2LineToolkitTest06(webCanvas: WebCanvas, layerItemId: string): void {
	const { d2ElementController } = webCanvas
	const [lineAStartPoint, lineAEndPoint]: [Vector2, Vector2] = [new Vector2(-50, -50), new Vector2(50, 50)]
	d2ElementController.createD2LineElementShapeItem(layerItemId, lineAStartPoint, lineAEndPoint, {
		strokeColor: Color.RED,
		isEnableSelect: false,
	})
	const [lineBStartPoint, lineBEndPoint]: [Vector2, Vector2] = [new Vector2(-30, 30), new Vector2(30, -30)]
	d2ElementController.createD2LineElementShapeItem(layerItemId, lineBStartPoint, lineBEndPoint, {
		strokeColor: Color.RED,
		isEnableSelect: false,
	})
	/**
	 * 获取线段 lineA 与线段 lineB 的重叠区域(返回 BBox2)
	 */
	console.log('%c <T: 获取线段 lineA 与线段 lineB 的重叠区域(返回 BBox2)>', 'color: #ff6600')
	const [lineA, lineB]: [Line, Line] = [new Line(lineAStartPoint, lineAEndPoint), new Line(lineBStartPoint, lineBEndPoint)]
	const inters: BBox2 = D2LineToolkit.getIntersectionByLines(lineA, lineB)
	console.log(inters)
	console.log('%c </T>', 'color: #ff6600')
	/* ... */
	createPoints(webCanvas, layerItemId, [
		{ label: `lineAStartPoint`, position: lineAStartPoint },
		{ label: `lineAEndPoint`, position: lineAEndPoint },
		{ label: `lineBStartPoint`, position: lineBStartPoint },
		{ label: `lineBEndPoint`, position: lineBEndPoint },
	])
	console.log(d2ElementController.getAllD2ElementShapeResults())
}

export function d2LineToolkitTest07(webCanvas: WebCanvas, layerItemId: string): void {
	const { d2ElementController } = webCanvas
	const [pointA, pointB, pointC]: [Vector2, Vector2, Vector2] = [new Vector2(0, 0), new Vector2(150, 10), new Vector2(80, 80)]
	d2ElementController.createD2LineElementShapeItem(layerItemId, pointA, pointB, {
		strokeColor: Color.RED,
		isEnableSelect: false,
	})
	d2ElementController.createD2LineElementShapeItem(layerItemId, pointA, pointC, {
		strokeColor: Color.GREEN,
		isEnableSelect: false,
	})
	/**
	 * 计算向量投影
	 */
	console.log('%c <T: 计算向量投影>', 'color: #ff6600')
	const line: Vector2 = D2LineToolkit.calculateVectorProjection(pointB, pointC)
	console.log(line)
	console.log('%c </T>', 'color: #ff6600')
	createPoints(webCanvas, layerItemId, [
		{ label: `pointA`, position: pointA },
		{ label: `pointB`, position: pointB },
		{ label: `pointC`, position: pointC },
		{ label: `pointT`, position: line },
	])
	console.log(d2ElementController.getAllD2ElementShapeResults())
}

export function d2LineToolkitTest08(webCanvas: WebCanvas, layerItemId: string): void {
	const { d2ElementController } = webCanvas
	const [pointA, pointB]: [Vector2, Vector2] = [new Vector2(-50, -30), new Vector2(70, 40)]
	d2ElementController.createD2LineElementShapeItem(layerItemId, pointA, pointB, {
		strokeColor: Color.RED,
		isEnableSelect: false,
	})
	/**
	 * 线段绕自镜像翻转
	 */
	console.log('%c <T: 线段绕自镜像翻转>', 'color: #ff6600')
	const lineP: Line = new Line(pointA, pointB)
	const lineA: Line = D2LineToolkit.flipX(lineP)
	console.log(lineA)
	const lineB: Line = D2LineToolkit.flipY(lineP)
	console.log(lineB)
	console.log('%c </T>', 'color: #ff6600')
	d2ElementController.createD2LineElementShapeItem(layerItemId, lineA.startPoint, lineA.endPoint, {
		strokeColor: Color.GOLDEN,
		isEnableSelect: false,
	})
	d2ElementController.createD2LineElementShapeItem(layerItemId, lineB.startPoint, lineB.endPoint, {
		strokeColor: Color.GREEN,
		isEnableSelect: false,
	})
	createPoints(webCanvas, layerItemId, [
		{ label: `pointA`, position: pointA },
		{ label: `pointB`, position: pointB },
	])
	console.log(d2ElementController.getAllD2ElementShapeResults())
}

export function d2LineToolkitTest09(webCanvas: WebCanvas, layerItemId: string): void {
	const { d2ElementController } = webCanvas
	const [pointA, pointB]: [Vector2, Vector2] = [new Vector2(-50, -30), new Vector2(70, 40)]
	const rotation1: number = 0
	d2ElementController.createD2LineElementShapeItem(layerItemId, pointA, pointB, {
		strokeColor: Color.RED,
		isEnableSelect: false,
	})
	/**
	 * 线段绕自旋转
	 */
	console.log('%c <T: 线段绕自旋转>', 'color: #ff6600')
	const lineP: Line = new Line(pointA, pointB)
	const rotation2: number = rotation1 + Math.PI / 4
	const lineN1: Line = D2LineToolkit.rotation(lineP, rotation2, rotation1)
	console.log(lineN1)
	const rotation3: number = rotation2 + Math.PI / 4
	const lineN2: Line = D2LineToolkit.rotation(lineN1, rotation3, rotation2)
	console.log(lineN2)
	console.log('%c </T>', 'color: #ff6600')
	d2ElementController.createD2LineElementShapeItem(layerItemId, lineN1.startPoint, lineN1.endPoint, {
		strokeColor: Color.GOLDEN,
		isEnableSelect: false,
	})
	d2ElementController.createD2LineElementShapeItem(layerItemId, lineN2.startPoint, lineN2.endPoint, {
		strokeColor: Color.YELLOW,
		isEnableSelect: false,
	})
	createPoints(webCanvas, layerItemId, [
		{ label: `pointA`, position: lineP.startPoint },
		{ label: `pointB`, position: lineP.endPoint },
		{ label: `pointC`, position: lineN1.startPoint },
		{ label: `pointD`, position: lineN1.endPoint },
		{ label: `pointE`, position: lineN2.startPoint },
		{ label: `pointF`, position: lineN2.endPoint },
	])
	console.log(d2ElementController.getAllD2ElementShapeResults())
}
