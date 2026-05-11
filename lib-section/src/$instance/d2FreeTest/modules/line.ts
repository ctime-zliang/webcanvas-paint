import { BBox2, Color, D2LineToolkit, Line, Polyline, Vector2, WebCanvas } from '../../../Main'
import { createPoints } from '../utils/createPoints'

export function lineTest01(webCanvas: WebCanvas, layerItemId: string): void {
	const { d2ElementController } = webCanvas
	const [lineAStartPoint, lineAEndPoint]: [Vector2, Vector2] = [new Vector2(0, 80), new Vector2(80)]
	d2ElementController.createD2LineElementShapeItem(layerItemId, lineAStartPoint, lineAEndPoint, {
		strokeColor: Color.RED,
		isEnableSelect: false,
	})
	const [lineBStartPoint, lineBEndPoint]: [Vector2, Vector2] = [new Vector2(0, 60), new Vector2(60, 0)]
	d2ElementController.createD2LineElementShapeItem(layerItemId, lineBStartPoint, lineBEndPoint, {
		strokeColor: Color.RED,
		isEnableSelect: false,
	})
	const [pointA]: [Vector2] = [new Vector2(0, 0)]
	/**
	 * 线段测试
	 */
	console.log('%c <T: 线段测试>', 'color: #ff6600')
	const [lineA, lineB]: [Line, Line] = [new Line(lineAStartPoint, lineAEndPoint), new Line(lineBStartPoint, lineBEndPoint)]
	console.log(lineA, lineB)
	console.log(lineA.toString())
	console.log(lineA.distance(pointA))
	console.log(lineA.isParallel(lineB))
	/* ... */
	createPoints(webCanvas, layerItemId, [
		{ label: `lineAStartPoint`, position: lineAStartPoint },
		{ label: `lineAEndPoint`, position: lineAEndPoint },
		{ label: `lineBStartPoint`, position: lineBStartPoint },
		{ label: `lineBEndPoint`, position: lineBEndPoint },
		{ label: `pointA`, position: pointA },
	])
	console.log(d2ElementController.getAllD2ElementShapeResults())
}

export function lineTest02(webCanvas: WebCanvas, layerItemId: string): void {
	const { d2ElementController } = webCanvas
	const [lineAStartPoint, lineAEndPoint]: [Vector2, Vector2] = [new Vector2(0, 80), new Vector2(80)]
	d2ElementController.createD2LineElementShapeItem(layerItemId, lineAStartPoint, lineAEndPoint, {
		strokeColor: Color.RED,
		isEnableSelect: false,
	})
	const [pointA]: [Vector2] = [new Vector2(0, 0)]
	/**
	 * 沿坐标轴镜像测试
	 */
	console.log('%c <T: 沿坐标轴镜像测试>', 'color: #ff6600')
	const [lineA]: [Line] = [new Line(lineAStartPoint, lineAEndPoint)]
	const [lineMX, lineMY]: [Line, Line] = [lineA.mirrorX(), lineA.mirrorY()]
	console.log(lineMX, lineMY)
	console.log('%c </T>', 'color: #ff6600')
	d2ElementController.createD2LineElementShapeItem(layerItemId, lineMX.startPoint, lineMX.endPoint, {
		strokeColor: Color.GREEN,
		isEnableSelect: false,
	})
	d2ElementController.createD2LineElementShapeItem(layerItemId, lineMY.startPoint, lineMY.endPoint, {
		strokeColor: Color.GOLDEN,
		isEnableSelect: false,
	})
	/* ... */
	createPoints(webCanvas, layerItemId, [
		{ label: `lineAStartPoint`, position: lineAStartPoint },
		{ label: `lineAEndPoint`, position: lineAEndPoint },
		{ label: `pointA`, position: pointA },
	])
	console.log(d2ElementController.getAllD2ElementShapeResults())
}
