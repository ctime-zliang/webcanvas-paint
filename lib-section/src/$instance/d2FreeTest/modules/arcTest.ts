import { Arc, BBox2, Color, Line, Polyline, SWEEP, Vector2, WebCanvas } from '../../../Main'
import { createPoints } from '../utils/createPoints'

export function arcTest01(webCanvas: WebCanvas, layerItemId: string): void {
	const { d2ElementController } = webCanvas
	const centerPoint: Vector2 = new Vector2(10, 0)
	const radius: number = 50
	const startRadian: number = 0
	const endRadian: number = (Math.PI * 5) / 4
	d2ElementController.createD2ArcElementShapeItem(layerItemId, centerPoint, radius, startRadian, endRadian, SWEEP.CCW, {
		isEnableSelect: false,
		strokeWidth: 5,
	})
	/**
	 * 圆弧基本信息
	 */
	console.log('%c <T: 圆弧基本信息>', 'color: #ff6600')
	const [arc]: [Arc] = [new Arc(radius, centerPoint, startRadian, endRadian)]
	console.log(arc)
	console.log(arc.toString())
	console.log('%c </T>', 'color: #ff6600')
	console.log(d2ElementController.getAllD2ElementShapeResults())
}

export function arcTest02(webCanvas: WebCanvas, layerItemId: string): void {
	const { d2ElementController } = webCanvas
	const centerPoint: Vector2 = new Vector2(10, 0)
	const radius: number = 50
	const startRadian: number = 0
	const endRadian: number = Math.PI
	d2ElementController.createD2ArcElementShapeItem(layerItemId, centerPoint, radius, startRadian, endRadian, SWEEP.CCW, {
		isEnableSelect: false,
	})
	/**
	 * 圆/圆弧上对应弧度的点坐标
	 */
	console.log('%c <T: 圆/圆弧上对应弧度的点坐标>', 'color: #ff6600')
	const [arc]: [Arc] = [new Arc(radius, centerPoint, startRadian, endRadian)]
	console.log(arc)
	const P1: Vector2 = arc.pointOn(-Math.PI * (9 / 10))
	console.log(P1)
	console.log('%c </T>', 'color: #ff6600')
	console.log(d2ElementController.getAllD2ElementShapeResults())
	/* ... */
	createPoints(webCanvas, layerItemId, [
		{ label: `centerPoint`, position: centerPoint },
		{ label: `startPoint`, position: arc.startPoint },
		{ label: `endPoint`, position: arc.endPoint },
		{ label: `P1`, position: P1 },
	])
}

export function arcTest03(webCanvas: WebCanvas, layerItemId: string): void {
	const { d2ElementController } = webCanvas
	const centerPoint: Vector2 = new Vector2(10, 0)
	const radius: number = 50
	const startRadian: number = 0
	const endRadian: number = Math.PI
	d2ElementController.createD2ArcElementShapeItem(layerItemId, centerPoint, radius, startRadian, endRadian, SWEEP.CCW, {
		isEnableSelect: false,
	})
	/**
	 * 圆弧离散采样
	 */
	console.log('%c <T: 圆弧离散采样>', 'color: #ff6600')
	const [arc]: [Arc] = [new Arc(radius, centerPoint, startRadian, endRadian)]
	console.log(arc)
	const points: Array<Vector2> = arc.toPoints(1)
	console.log(points)
	console.log('%c </T>', 'color: #ff6600')
	console.log(d2ElementController.getAllD2ElementShapeResults())
	/* ... */
	createPoints(webCanvas, layerItemId, [
		// { label: `centerPoint`, position: centerPoint },
		// { label: `startPoint`, position: arc.startPoint },
		// { label: `endPoint`, position: arc.endPoint },
		...points.map(
			(
				p: Vector2,
				idx: number
			): {
				label: string
				position: Vector2
			} => {
				return {
					label: `P${idx}`,
					position: p,
				}
			}
		),
	])
}

export function arcTest04(webCanvas: WebCanvas, layerItemId: string): void {
	const { d2ElementController } = webCanvas
	const centerPoint: Vector2 = new Vector2(10, 0)
	const strokeWidth: number = 10
	const radius: number = 50
	const startRadian: number = 0
	const endRadian: number = (Math.PI * 3) / 4
	d2ElementController.createD2ArcElementShapeItem(layerItemId, centerPoint, radius, startRadian, endRadian, SWEEP.CCW, {
		isEnableSelect: false,
		strokeWidth,
	})
	/**
	 * 圆弧反向
	 */
	console.log('%c <T: 圆弧反向>', 'color: #ff6600')
	const [arc]: [Arc] = [new Arc(radius, centerPoint, startRadian, endRadian)]
	console.log(arc)
	const arc1: Arc = arc.exchangeSweep()
	d2ElementController.createD2ArcElementShapeItem(layerItemId, arc1.centerPoint, arc1.radius, arc1.startRadian, arc1.endRadian, arc1.sweep, {
		isEnableSelect: false,
		strokeWidth,
		strokeColor: Color.GOLDEN,
	})
	console.log(arc1)
	console.log('%c </T>', 'color: #ff6600')
	console.log(d2ElementController.getAllD2ElementShapeResults())
}

export function arcTest05(webCanvas: WebCanvas, layerItemId: string): void {
	const { d2ElementController } = webCanvas
	const centerPoint: Vector2 = new Vector2(10, 0)
	const strokeWidth: number = 10
	const radius: number = 50
	const startRadian: number = 0
	const endRadian: number = (Math.PI * 5) / 4
	d2ElementController.createD2ArcElementShapeItem(layerItemId, centerPoint, radius, startRadian, endRadian, SWEEP.CCW, {
		isEnableSelect: false,
		strokeWidth,
	})
	/**
	 * 圆弧中点
	 */
	console.log('%c <T: 圆弧中点>', 'color: #ff6600')
	const [arc]: [Arc] = [new Arc(radius, centerPoint, startRadian, endRadian)]
	console.log(arc)
	const P1: Vector2 = arc.getMiddlePoint()
	/* ... */
	createPoints(webCanvas, layerItemId, [
		{ label: `centerPoint`, position: centerPoint },
		{ label: `startPoint`, position: arc.startPoint },
		{ label: `endPoint`, position: arc.endPoint },
		{ label: `P1`, position: P1 },
	])
}

export function arcTest06(webCanvas: WebCanvas, layerItemId: string): void {
	const { d2ElementController } = webCanvas
	const centerPoint: Vector2 = new Vector2(0, 0)
	const strokeWidth: number = 10
	const radius: number = 50
	const startRadian: number = 0
	const endRadian: number = (Math.PI * 5) / 4
	d2ElementController.createD2ArcElementShapeItem(layerItemId, centerPoint, radius, startRadian, endRadian, SWEEP.CCW, {
		isEnableSelect: false,
		strokeWidth,
	})
	/**
	 * 圆弧 BBox2
	 */
	console.log('%c <T: 圆弧 BBox2>', 'color: #ff6600')
	const [arc]: [Arc] = [new Arc(radius, centerPoint, startRadian, endRadian)]
	console.log(arc)
	const bbox2: BBox2 = arc.buildBBox2()
	console.log(bbox2)
	/* ... */
	createPoints(webCanvas, layerItemId, [
		{ label: `centerPoint`, position: centerPoint },
		{ label: `startPoint`, position: arc.startPoint },
		{ label: `endPoint`, position: arc.endPoint },
		{ label: `bboxLeftUp`, position: bbox2.leftUp },
		{ label: `bboxRightUp`, position: bbox2.rightUp },
		{ label: `bboxLeftDown`, position: bbox2.leftDown },
		{ label: `bboxRightDown`, position: bbox2.rightDown },
	])
}
