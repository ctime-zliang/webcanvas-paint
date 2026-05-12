import { Color, Line, Vector2, WebCanvas } from '../../../Main'
import { createPoints } from '../utils/createPoints'

export function lineTest01(webCanvas: WebCanvas, layerItemId: string): void {
	const { d2ElementController } = webCanvas
	const [lineAStartPoint, lineAEndPoint]: [Vector2, Vector2] = [new Vector2(0, 80), new Vector2(80, 0)]
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
	const [lineAStartPoint, lineAEndPoint]: [Vector2, Vector2] = [new Vector2(0, 80), new Vector2(50, 0)]
	d2ElementController.createD2LineElementShapeItem(layerItemId, lineAStartPoint, lineAEndPoint, {
		strokeColor: Color.RED,
		isEnableSelect: false,
	})
	/**
	 * 线段镜像
	 */
	console.log('%c <T: 线段镜像>', 'color: #ff6600')
	const [lineA]: [Line] = [new Line(lineAStartPoint, lineAEndPoint)]
	const [lineM1, lineM2, lineM3]: [Line, Line, Line] = [lineA.mirrorX(10), lineA.mirrorY(-20), lineA.mirrorO(new Vector2(10, 10))]
	console.log(lineM1, lineM2, lineM3)
	console.log('%c </T>', 'color: #ff6600')
	d2ElementController.createD2LineElementShapeItem(layerItemId, lineM1.startPoint, lineM1.endPoint, {
		strokeColor: Color.GREEN,
		isEnableSelect: false,
	})
	d2ElementController.createD2LineElementShapeItem(layerItemId, lineM2.startPoint, lineM2.endPoint, {
		strokeColor: Color.GOLDEN,
		isEnableSelect: false,
	})
	d2ElementController.createD2LineElementShapeItem(layerItemId, lineM3.startPoint, lineM3.endPoint, {
		strokeColor: Color.YELLOW,
		isEnableSelect: false,
	})
	/* ... */
	createPoints(webCanvas, layerItemId, [
		{ label: `lineAStartPoint`, position: lineAStartPoint },
		{ label: `lineAEndPoint`, position: lineAEndPoint },
	])
	console.log(d2ElementController.getAllD2ElementShapeResults())
}
