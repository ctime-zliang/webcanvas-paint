import { Arc, CANVAS_LINE_CAP, Color, Line, Matrix3, Polyline, SWEEP, Vector2, WebCanvas } from '../../../Main'
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
	const [line1, line2, line3]: [Line, Line, Line] = [lineA.mirrorX(10), lineA.mirrorY(-20), lineA.mirrorO(new Vector2(10, 10))]
	console.log(line1, line2, line3)
	console.log('%c </T>', 'color: #ff6600')
	d2ElementController.createD2LineElementShapeItem(layerItemId, line1.startPoint, line1.endPoint, {
		strokeColor: Color.GREEN,
		isEnableSelect: false,
	})
	d2ElementController.createD2LineElementShapeItem(layerItemId, line2.startPoint, line2.endPoint, {
		strokeColor: Color.BLUE,
		isEnableSelect: false,
	})
	d2ElementController.createD2LineElementShapeItem(layerItemId, line3.startPoint, line3.endPoint, {
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

export function lineTest03(webCanvas: WebCanvas, layerItemId: string): void {
	const { d2ElementController } = webCanvas
	const [lineAStartPoint, lineAEndPoint]: [Vector2, Vector2] = [new Vector2(0, 80), new Vector2(50, 0)]
	d2ElementController.createD2LineElementShapeItem(layerItemId, lineAStartPoint, lineAEndPoint, {
		strokeColor: Color.RED,
		isEnableSelect: false,
	})
	/**
	 * 线段矩阵变换(以坐标原点为变换中心)
	 */
	console.log('%c <T: 线段矩阵变换(以坐标原点为变换中心)>', 'color: #ff6600')
	const [lineA]: [Line] = [new Line(lineAStartPoint, lineAEndPoint)]
	const [line1, line2, line3]: [Line, Line, Line] = [
		lineA.multiplyMatrix3(Matrix3.translate(10, 10)),
		lineA.multiplyMatrix3(Matrix3.rotate((Math.PI * 1) / 4)),
		lineA.multiplyMatrix3(Matrix3.scale(2, 2)),
	]
	console.log(line1, line2, line3)
	console.log('%c </T>', 'color: #ff6600')
	d2ElementController.createD2LineElementShapeItem(layerItemId, line1.startPoint, line1.endPoint, {
		strokeColor: Color.GREEN,
		isEnableSelect: false,
	})
	d2ElementController.createD2LineElementShapeItem(layerItemId, line2.startPoint, line2.endPoint, {
		strokeColor: Color.BLUE,
		isEnableSelect: false,
	})
	d2ElementController.createD2LineElementShapeItem(layerItemId, line3.startPoint, line3.endPoint, {
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

export function lineTest04(webCanvas: WebCanvas, layerItemId: string): void {
	const { d2ElementController } = webCanvas
	const [lineAStartPoint, lineAEndPoint]: [Vector2, Vector2] = [new Vector2(0, 80), new Vector2(50, 0)]
	d2ElementController.createD2LineElementShapeItem(layerItemId, lineAStartPoint, lineAEndPoint, {
		strokeColor: Color.RED,
		isEnableSelect: false,
		strokeWidth: 30,
	})
	/**
	 * 线段描边
	 */
	console.log('%c <T: 线段描边>', 'color: #ff6600')
	const [lineA]: [Line] = [new Line(lineAStartPoint, lineAEndPoint)]
	const pl: Polyline = lineA.stroke(30, CANVAS_LINE_CAP.ROUND, SWEEP.CCW)
	console.log(pl)
	for (let item of pl.primitives) {
		if (item instanceof Arc) {
			d2ElementController.createD2ArcElementShapeItem(layerItemId, item.centerPoint, item.radius, item.startRadian, item.endRadian, SWEEP.CCW, {
				isEnableSelect: false,
			})
			continue
		}
		if (item instanceof Line) {
			d2ElementController.createD2LineElementShapeItem(layerItemId, item.startPoint, item.endPoint, {
				isEnableSelect: false,
			})
			continue
		}
	}
	console.log('%c </T>', 'color: #ff6600')
	/* ... */
	createPoints(webCanvas, layerItemId, [
		{ label: `lineAStartPoint`, position: lineAStartPoint },
		{ label: `lineAEndPoint`, position: lineAEndPoint },
	])
	console.log(d2ElementController.getAllD2ElementShapeResults())
}
