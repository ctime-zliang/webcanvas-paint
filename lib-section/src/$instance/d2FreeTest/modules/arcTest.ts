import { Primitive } from '../../../algorithm/geometry/primitives/Primitive'
import { ECanvasD2LineCap } from '../../../engine/config/PrimitiveProfile'
import { Arc, Color, Line, Polyline, SWEEP, Vector2, WebCanvas } from '../../../Main'
import { createPoints } from '../utils/createPoints'

export function arcTest01(webCanvas: WebCanvas, layerItemId: string): void {
	const { d2ElementController } = webCanvas
	const centerPoint: Vector2 = new Vector2(10, 0)
	const radius: number = 50
	const startRadian: number = 0
	const endRadian: number = Math.PI
	d2ElementController.createD2ArcElementShapeItem(layerItemId, centerPoint, radius, startRadian, endRadian, SWEEP.CCW, {
		isEnableSelect: false,
	})
	/**
	 * 圆弧测试
	 */
	console.log('%c <T: 圆弧测试>', 'color: #ff6600')
	const [arc]: [Arc] = [new Arc(radius, centerPoint, startRadian, endRadian - startRadian)]
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
	 * 圆弧离散采样
	 */
	console.log('%c <T: 圆弧离散采样>', 'color: #ff6600')
	const [arc]: [Arc] = [new Arc(radius, centerPoint, startRadian, endRadian - startRadian)]
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

export function arcTest03(webCanvas: WebCanvas, layerItemId: string): void {
	const { d2ElementController } = webCanvas
	const centerPoint: Vector2 = new Vector2(10, 0)
	const radius: number = 50
	const startRadian: number = Math.PI * (1 / 4)
	const endRadian: number = Math.PI * (5 / 4)
	d2ElementController.createD2ArcElementShapeItem(layerItemId, centerPoint, radius, startRadian, endRadian, SWEEP.CCW, {
		isEnableSelect: false,
	})
	/**
	 * 计算圆弧弧线中点
	 */
	console.log('%c <T: 计算圆弧弧线中点>', 'color: #ff6600')
	const [arc]: [Arc] = [new Arc(radius, centerPoint, startRadian, endRadian - startRadian)]
	console.log(arc)
	const P1: Vector2 = arc.getMidPoint()
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
	const [arc]: [Arc] = [new Arc(radius, centerPoint, startRadian, endRadian - startRadian)]
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
	const endRadian: number = Math.PI * 1
	d2ElementController.createD2ArcElementShapeItem(layerItemId, centerPoint, radius, startRadian, endRadian, SWEEP.CCW, {
		isEnableSelect: false,
		strokeWidth,
		strokeColor: Color.RED,
	})
	/**
	 * 圆弧镜像
	 */
	console.log('%c <T: 圆弧镜像>', 'color: #ff6600')
	const [arc]: [Arc] = [new Arc(radius, centerPoint, startRadian, endRadian - startRadian)]
	console.log(arc)
	const [arc1, arc2, arc3]: [Arc, Arc, Arc] = [arc.mirrorX(1), arc.mirrorY(1), arc.mirrorO(new Vector2(1, 1))]
	d2ElementController.createD2ArcElementShapeItem(layerItemId, arc1.centerPoint, arc1.radius, arc1.startRadian, arc1.endRadian, arc1.sweep, {
		isEnableSelect: false,
		strokeWidth,
		strokeColor: Color.GOLDEN,
	})
	d2ElementController.createD2ArcElementShapeItem(layerItemId, arc2.centerPoint, arc2.radius, arc2.startRadian, arc2.endRadian, arc2.sweep, {
		isEnableSelect: false,
		strokeWidth,
		strokeColor: Color.YELLOW_GREEN,
	})
	d2ElementController.createD2ArcElementShapeItem(layerItemId, arc3.centerPoint, arc3.radius, arc3.startRadian, arc3.endRadian, arc3.sweep, {
		isEnableSelect: false,
		strokeWidth,
		strokeColor: Color.BLUE,
	})
	console.log(arc1, arc2, arc3)
	console.log('%c </T>', 'color: #ff6600')
	console.log(d2ElementController.getAllD2ElementShapeResults())
}
