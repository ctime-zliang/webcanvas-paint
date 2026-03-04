import { Color, D2LineToolkit, Line, Vector2, WebCanvas } from '../../../Main'
import { createPoints } from '../utils/createPoints'

export function geometryTest01(webCanvas: WebCanvas, layerItemId: string): void {
	const { d2ElementController, d2TextElementController } = webCanvas
	const defaultLayerItemId: string = layerItemId
	const [lineAStartPoint, lineAEndPoint]: [Vector2, Vector2] = [new Vector2(0, 70), new Vector2(50, 0)]
	d2ElementController.createD2LineElementShapeItem(defaultLayerItemId, lineAStartPoint, lineAEndPoint, {
		strokeColor: Color.RED,
		isEnableSelect: false,
	})
	const pointA: Vector2 = new Vector2(100, 50)
	d2ElementController.createD2PointElementShapeItem(defaultLayerItemId, pointA, {
		strokeColor: Color.GREEN,
		isEnableScale: true,
		isEnableSelect: false,
	})
	/**
	 * 计算点到线段的垂线
	 */
	const lineA: Line = new Line(lineAStartPoint, lineAEndPoint)
	const footRes: { point: Vector2; t: number } = D2LineToolkit.calcFootOfPoint2Line(lineA, pointA)
	console.log(footRes)
	d2ElementController.createD2LineElementShapeItem(defaultLayerItemId, pointA, footRes.point, {
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
}

export function geometryTest02(webCanvas: WebCanvas, layerItemId: string): void {
	const { d2ElementController } = webCanvas
	const defaultLayerItemId: string = layerItemId
	const [lineAStartPoint, lineAEndPoint]: [Vector2, Vector2] = [new Vector2(0, -30), new Vector2(0, 30)]
	d2ElementController.createD2LineElementShapeItem(defaultLayerItemId, lineAStartPoint, lineAEndPoint, {
		strokeColor: Color.RED,
		isEnableSelect: false,
	})
	/**
	 * 判断点是否在线段上
	 */
	const lineA: Line = new Line(lineAStartPoint, lineAEndPoint)
	const pointA: Vector2 = new Vector2(20, 20)
	const pointB: Vector2 = new Vector2(-30, -20)
	d2ElementController.createD2LineElementShapeItem(defaultLayerItemId, pointA, pointB, {
		strokeColor: Color.GREEN,
		isEnableSelect: false,
	})
	const a1: boolean = D2LineToolkit.isPointOnLine(lineA, pointA)
	const a2: boolean = D2LineToolkit.isPointOnLine2(lineA, pointA, 0.5)
	console.log(a1, a2)
	const b1: boolean = D2LineToolkit.isSegmentIntered(lineA.startPoint, lineA.endPoint, pointA, pointB)
	console.log(b1)
	/* ... */
	createPoints(webCanvas, layerItemId, [
		{ label: `lineAStartPoint`, position: lineAStartPoint },
		{ label: `lineAEndPoint`, position: lineAEndPoint },
		{ label: `pointA`, position: pointA },
		{ label: `pointB`, position: pointB },
	])
}

export function geometryTest03(webCanvas: WebCanvas, layerItemId: string): void {
	const { d2ElementController } = webCanvas
	const defaultLayerItemId: string = layerItemId
	const [lineAStartPoint, lineAEndPoint]: [Vector2, Vector2] = [new Vector2(-30, -30), new Vector2(0, 30)]
	d2ElementController.createD2LineElementShapeItem(defaultLayerItemId, lineAStartPoint, lineAEndPoint, {
		strokeColor: Color.RED,
		isEnableSelect: false,
	})
	/**
	 * 求线段上到线段外的任意点最近的点坐标
	 */
	const lineA: Line = new Line(lineAStartPoint, lineAEndPoint)
	const pointA: Vector2 = new Vector2(-75, 20)
	const closedPoint: Vector2 = D2LineToolkit.getClosedPointOnLineWithPoint(lineA, pointA)
	console.log(closedPoint)
	d2ElementController.createD2LineElementShapeItem(defaultLayerItemId, pointA, closedPoint, {
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
}
