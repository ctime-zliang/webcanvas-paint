import { Arc, BBox2, Color, Line, Matrix3, Polyline, Primitive, SWEEP, Vector2, WebCanvas } from '../../../../src/Main'
import { createPoints } from '../utils/createPoints'

export function polylineTest01(webCanvas: WebCanvas, layerItemId: string): void {
	const { d2ElementController } = webCanvas
	const points: Array<Vector2> = [
		new Vector2(0, 0),
		new Vector2(20, 40),
		new Vector2(50, 10),
		new Vector2(70, 60),
		new Vector2(100, 30),
		new Vector2(100, 80),
		new Vector2(150, 50),
		new Vector2(170, 90),
		new Vector2(200, 20),
		new Vector2(230, 70),
	]
	const arcIndex: number = 4
	const arcCenter: Vector2 = points[arcIndex].add(points[arcIndex + 1]).mul(1 / 2)
	const arcRadius: number = arcCenter.distance(points[arcIndex])
	const arcStartRadian: number = Math.atan2(points[arcIndex].y - arcCenter.y, points[arcIndex].x - arcCenter.x)
	const arcEndRadian: number = Math.atan2(points[arcIndex + 1].y - arcCenter.y, points[arcIndex + 1].x - arcCenter.x)
	const arc1: Arc = new Arc(arcRadius, arcCenter, arcStartRadian, arcEndRadian)
	const primitives: Array<Line | Arc> = []
	for (let i: number = 0; i < points.length - 1; i++) {
		if (i === arcIndex) {
			primitives.push(arc1)
		} else {
			primitives.push(new Line(points[i], points[i + 1]))
		}
	}
	/**
	 * 折线构建
	 */
	console.log('%c <T: 折线构建>', 'color: #ff6600')
	const pl: Polyline = Polyline.build1(primitives)
	console.log(pl)
	const bbox2: BBox2 = pl.buildBBox2()
	console.log(bbox2)
	console.log('%c </T>', 'color: #ff6600')
	for (let i: number = 0; i < pl.primitives.length; i++) {
		const p: Primitive = pl.primitives[i]
		if (p instanceof Line) {
			d2ElementController.createD2LineElementShapeItem(layerItemId, p.startPoint, p.endPoint, {
				isEnableSelect: false,
			})
			continue
		}
		if (p instanceof Arc) {
			d2ElementController.createD2ArcElementShapeItem(layerItemId, p.centerPoint, p.radius, p.startRadian, p.endRadian, p.sweep, {
				isEnableSelect: false,
			})
			continue
		}
	}
	createPoints(webCanvas, layerItemId, [
		...points.map((pt: Vector2, i: number): { label: string; position: Vector2 } => {
			return { label: `P${i}`, position: pt }
		}),
		{ label: `Bx2.LeftUp`, position: bbox2.leftUp },
		{ label: `Bx2.RightUp`, position: bbox2.rightUp },
		{ label: `Bx2.LeftDown`, position: bbox2.leftDown },
		{ label: `Bx21RightDown`, position: bbox2.rightDown },
	])
}

export function polylineTest02(webCanvas: WebCanvas, layerItemId: string): void {
	const { d2ElementController } = webCanvas
	const points: Array<Vector2> = [
		new Vector2(0, 0),
		new Vector2(20, 40),
		new Vector2(50, 10),
		new Vector2(70, 60),
		new Vector2(100, 30),
		new Vector2(100, 80),
		new Vector2(150, 50),
		new Vector2(170, 90),
		new Vector2(200, 20),
		new Vector2(230, 70),
	]
	const arcIndex: number = 4
	const arcCenter: Vector2 = points[arcIndex].add(points[arcIndex + 1]).mul(1 / 2)
	const arcRadius: number = arcCenter.distance(points[arcIndex])
	const arcStartRadian: number = Math.atan2(points[arcIndex].y - arcCenter.y, points[arcIndex].x - arcCenter.x)
	const arcEndRadian: number = Math.atan2(points[arcIndex + 1].y - arcCenter.y, points[arcIndex + 1].x - arcCenter.x)
	const arc1: Arc = new Arc(arcRadius, arcCenter, arcStartRadian, arcEndRadian)
	const primitives: Array<Line | Arc> = []
	for (let i: number = 0; i < points.length - 1; i++) {
		if (i === arcIndex) {
			primitives.push(arc1)
		} else {
			primitives.push(new Line(points[i], points[i + 1]))
		}
	}
	/**
	 * 折线矩阵变换
	 */
	console.log('%c <T: 折线矩阵变换>', 'color: #ff6600')
	const pl: Polyline = Polyline.build1(primitives)
	for (let i: number = 0; i < pl.primitives.length; i++) {
		const p: Primitive = pl.primitives[i]
		if (p instanceof Line) {
			d2ElementController.createD2LineElementShapeItem(layerItemId, p.startPoint, p.endPoint, {
				isEnableSelect: false,
			})
			continue
		}
		if (p instanceof Arc) {
			d2ElementController.createD2ArcElementShapeItem(layerItemId, p.centerPoint, p.radius, p.startRadian, p.endRadian, p.sweep, {
				isEnableSelect: false,
			})
			continue
		}
	}
	console.log(pl)
	const pl1: Polyline = pl.multiplyMatrix3(Matrix3.translate(-100, 100))
	console.log(pl1)
	console.log('%c </T>', 'color: #ff6600')
	for (let i: number = 0; i < pl1.primitives.length; i++) {
		const p: Primitive = pl1.primitives[i]
		if (p instanceof Line) {
			d2ElementController.createD2LineElementShapeItem(layerItemId, p.startPoint, p.endPoint, {
				isEnableSelect: false,
				strokeColor: Color.RED,
			})
			continue
		}
		if (p instanceof Arc) {
			d2ElementController.createD2ArcElementShapeItem(layerItemId, p.centerPoint, p.radius, p.startRadian, p.endRadian, p.sweep, {
				isEnableSelect: false,
				strokeColor: Color.RED,
			})
			continue
		}
	}
}
