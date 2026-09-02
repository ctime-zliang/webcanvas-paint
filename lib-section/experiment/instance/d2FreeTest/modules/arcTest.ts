import { Arc, BBox2, Color, Line, Matrix3, Polyline, SWEEP, Vector2, WebCanvas } from '../../../../src/Main'
import { createShapePoints } from '../utils/createPrimitives'

export function arcTest01(webCanvas: WebCanvas, layerItemId: string): void {
	const { d2ElementController } = webCanvas
	const centerPoint: Vector2 = new Vector2(10, 0)
	const radius: number = 50
	const startRadian: number = 0
	const endRadian: number = (Math.PI * 5) / 4
	/**
	 * 圆弧基本信息
	 */
	console.log('%c <T: 圆弧基本信息>', 'color: #ff6600')
	const [arc]: [Arc] = [new Arc(radius, centerPoint, startRadian, endRadian)]
	d2ElementController.createD2ArcElementShapeItem(layerItemId, arc.centerPoint, arc.radius, arc.startRadian, arc.endRadian, arc.sweep, {
		isEnableSelect: false,
		strokeWidth: 5,
	})
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
	/**
	 * 圆/圆弧上对应弧度的点坐标
	 */
	console.log('%c <T: 圆/圆弧上对应弧度的点坐标>', 'color: #ff6600')
	const [arc]: [Arc] = [new Arc(radius, centerPoint, startRadian, endRadian)]
	d2ElementController.createD2ArcElementShapeItem(layerItemId, arc.centerPoint, arc.radius, arc.startRadian, arc.endRadian, arc.sweep, {
		isEnableSelect: false,
	})
	console.log(arc)
	const P1: Vector2 = arc.pointOn(-Math.PI * (3 / 4))
	const P2: Vector2 = arc.pointOn(Math.PI * (3 / 4))
	console.log(P1, P2)
	console.log('%c </T>', 'color: #ff6600')
	console.log(d2ElementController.getAllD2ElementShapeResults())
	/* ... */
	createShapePoints(webCanvas, layerItemId, [
		// { label: `Arc.centerPoint`, position: arc.centerPoint },
		// { label: `Arc.StartPoint`, position: arc.startPoint },
		// { label: `Arc.EndPoint`, position: arc.endPoint },
		{ label: `P1`, position: P1 },
		{ label: `P2`, position: P2 },
	])
}

export function arcTest03(webCanvas: WebCanvas, layerItemId: string): void {
	const { d2ElementController } = webCanvas
	const centerPoint: Vector2 = new Vector2(10, 0)
	const radius: number = 50
	const startRadian: number = 0
	const endRadian: number = Math.PI
	/**
	 * 圆弧离散采样
	 */
	console.log('%c <T: 圆弧离散采样>', 'color: #ff6600')
	const [arc]: [Arc] = [new Arc(radius, centerPoint, startRadian, endRadian)]
	d2ElementController.createD2ArcElementShapeItem(layerItemId, arc.centerPoint, arc.radius, arc.startRadian, arc.endRadian, arc.sweep, {
		isEnableSelect: false,
	})
	console.log(arc)
	const points: Array<Vector2> = arc.toPoints(1)
	console.log(points)
	console.log('%c </T>', 'color: #ff6600')
	console.log(d2ElementController.getAllD2ElementShapeResults())
	/* ... */
	createShapePoints(webCanvas, layerItemId, [
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
	const strokeWidth: number = 2
	const radius: number = 50
	const startRadian: number = 0
	const endRadian: number = (Math.PI * 3) / 4
	/**
	 * 圆弧反向
	 */
	console.log('%c <T: 圆弧反向>', 'color: #ff6600')
	const [arc]: [Arc] = [new Arc(radius, centerPoint, startRadian, endRadian)]
	d2ElementController.createD2ArcElementShapeItem(layerItemId, arc.centerPoint, arc.radius, arc.startRadian, arc.endRadian, arc.sweep, {
		isEnableSelect: false,
		strokeWidth,
	})
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
	/* ... */
	createShapePoints(webCanvas, layerItemId, [
		{ label: `P0.StartPoint`, position: arc.startPoint },
		{ label: `P1.StartPoint`, position: arc1.startPoint },
	])
}

export function arcTest05(webCanvas: WebCanvas, layerItemId: string): void {
	const { d2ElementController } = webCanvas
	const centerPoint: Vector2 = new Vector2(10, 0)
	const strokeWidth: number = 10
	const radius: number = 50
	const startRadian: number = 0
	const endRadian: number = (Math.PI * 5) / 4
	/**
	 * 圆弧中点
	 */
	console.log('%c <T: 圆弧中点>', 'color: #ff6600')
	const [arc]: [Arc] = [new Arc(radius, centerPoint, startRadian, endRadian)]
	d2ElementController.createD2ArcElementShapeItem(layerItemId, arc.centerPoint, arc.radius, arc.startRadian, arc.endRadian, arc.sweep, {
		isEnableSelect: false,
		strokeWidth,
	})
	console.log(arc)
	const P1: Vector2 = arc.getMiddlePoint()
	console.log(P1)
	console.log('%c </T>', 'color: #ff6600')
	/* ... */
	createShapePoints(webCanvas, layerItemId, [
		{ label: `Arc.centerPoint`, position: arc.centerPoint },
		{ label: `Arc.StartPoint`, position: arc.startPoint },
		{ label: `Arc.EndPoint`, position: arc.endPoint },
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
	/**
	 * 圆弧 BBox2
	 */
	console.log('%c <T: 圆弧 BBox2>', 'color: #ff6600')
	const [arc]: [Arc] = [new Arc(radius, centerPoint, startRadian, endRadian)]
	d2ElementController.createD2ArcElementShapeItem(layerItemId, arc.centerPoint, arc.radius, arc.startRadian, arc.endRadian, arc.sweep, {
		isEnableSelect: false,
		strokeWidth,
	})
	console.log(arc)
	const bbox21: BBox2 = arc.buildBBox2()
	console.log(bbox21)
	console.log('%c </T>', 'color: #ff6600')
	/* ... */
	createShapePoints(webCanvas, layerItemId, [
		{ label: `Arc.centerPoint`, position: arc.centerPoint },
		{ label: `Arc.startPoint`, position: arc.startPoint },
		{ label: `Arc.endPoint`, position: arc.endPoint },
		{ label: `Bx21.LeftUp`, position: bbox21.leftUp },
		{ label: `Bx21.RightUp`, position: bbox21.rightUp },
		{ label: `Bx21.LeftDown`, position: bbox21.leftDown },
		{ label: `Bx21.RightDown`, position: bbox21.rightDown },
	])
}

export function arcTest07(webCanvas: WebCanvas, layerItemId: string): void {
	const { d2ElementController } = webCanvas
	const centerPoint: Vector2 = new Vector2(20, 20)
	const strokeWidth: number = 5
	const radius: number = 50
	const startRadian: number = 0
	const endRadian: number = (Math.PI * 3) / 4
	/**
	 * 圆弧水平镜像
	 */
	console.log('%c <T: 圆弧水平镜像>', 'color: #ff6600')
	const [arc]: [Arc] = [new Arc(radius, centerPoint, startRadian, endRadian)]
	d2ElementController.createD2ArcElementShapeItem(layerItemId, arc.centerPoint, arc.radius, arc.startRadian, arc.endRadian, arc.sweep, {
		isEnableSelect: false,
		strokeWidth,
	})
	console.log(arc)
	const arc1: Arc = arc.mirrorX(-10)
	d2ElementController.createD2ArcElementShapeItem(layerItemId, arc1.centerPoint, arc1.radius, arc1.startRadian, arc1.endRadian, arc1.sweep, {
		isEnableSelect: false,
		strokeColor: Color.GREEN,
		strokeWidth,
	})
	console.log(arc1)
	console.log('%c </T>', 'color: #ff6600')
}

export function arcTest08(webCanvas: WebCanvas, layerItemId: string): void {
	const { d2ElementController } = webCanvas
	const centerPoint: Vector2 = new Vector2(20, 20)
	const strokeWidth: number = 5
	const radius: number = 50
	const startRadian: number = 0
	const endRadian: number = (Math.PI * 3) / 4
	/**
	 * 圆弧垂直镜像
	 */
	console.log('%c <T: 圆弧垂直镜像>', 'color: #ff6600')
	const [arc]: [Arc] = [new Arc(radius, centerPoint, startRadian, endRadian)]
	d2ElementController.createD2ArcElementShapeItem(layerItemId, arc.centerPoint, arc.radius, arc.startRadian, arc.endRadian, arc.sweep, {
		isEnableSelect: false,
		strokeWidth,
	})
	console.log(arc)
	const arc1: Arc = arc.mirrorY(10)
	d2ElementController.createD2ArcElementShapeItem(layerItemId, arc1.centerPoint, arc1.radius, arc1.startRadian, arc1.endRadian, arc1.sweep, {
		isEnableSelect: false,
		strokeColor: Color.GREEN,
		strokeWidth,
	})
	console.log(arc1)
	console.log('%c </T>', 'color: #ff6600')
}

export function arcTest09(webCanvas: WebCanvas, layerItemId: string): void {
	const { d2ElementController } = webCanvas
	const centerPoint: Vector2 = new Vector2(20, 20)
	const strokeWidth: number = 5
	const radius: number = 50
	const startRadian: number = 0
	const endRadian: number = (Math.PI * 3) / 4
	/**
	 * 圆弧中心镜像
	 */
	console.log('%c <T: 圆弧中心镜像>', 'color: #ff6600')
	const [arc]: [Arc] = [new Arc(radius, centerPoint, startRadian, endRadian)]
	d2ElementController.createD2ArcElementShapeItem(layerItemId, arc.centerPoint, arc.radius, arc.startRadian, arc.endRadian, arc.sweep, {
		isEnableSelect: false,
		strokeWidth,
	})
	console.log(arc)
	const arc1: Arc = arc.mirrorO(centerPoint)
	d2ElementController.createD2ArcElementShapeItem(layerItemId, arc1.centerPoint, arc1.radius, arc1.startRadian, arc1.endRadian, arc1.sweep, {
		isEnableSelect: false,
		strokeColor: Color.GREEN,
		strokeWidth,
	})
	console.log(arc1)
	console.log('%c </T>', 'color: #ff6600')
}

export function arcTest10(webCanvas: WebCanvas, layerItemId: string): void {
	const { d2ElementController } = webCanvas
	const centerPoint: Vector2 = new Vector2(-50, -50)
	const radius: number = 50
	const startRadian: number = (-Math.PI * 1) / 4
	const endRadian: number = (Math.PI * 3) / 4
	/**
	 * 圆弧矩阵变换
	 */
	console.log('%c <T: 圆弧矩阵变换>', 'color: #ff6600')
	const [arc]: [Arc] = [new Arc(radius, centerPoint, startRadian, endRadian)]
	d2ElementController.createD2ArcElementShapeItem(layerItemId, arc.centerPoint, arc.radius, arc.startRadian, arc.endRadian, arc.sweep, {
		isEnableSelect: false,
		strokeColor: Color.YELLOW,
	})
	console.log(arc)
	const arc1: Arc = arc.multiplyMatrix3(Matrix3.translate(50, 50).scale(2, 2))
	d2ElementController.createD2ArcElementShapeItem(layerItemId, arc1.centerPoint, arc1.radius, arc1.startRadian, arc1.endRadian, arc1.sweep, {
		isEnableSelect: false,
		strokeColor: Color.GREEN,
	})
	console.log(arc1)
	console.log('%c </T>', 'color: #ff6600')
	createShapePoints(webCanvas, layerItemId, [
		{ label: `Arc.startPoint`, position: arc.startPoint },
		{ label: `Arc.endPoint`, position: arc.endPoint },
		{ label: `Arc.centerPoint`, position: arc.centerPoint },
		{ label: `Arc1.startPoint`, position: arc1.startPoint },
		{ label: `Arc1.endPoint`, position: arc1.endPoint },
		{ label: `Arc1.centerPoint`, position: arc1.centerPoint },
	])
}
