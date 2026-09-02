import { Arc, Color, D2ArcToolkit, Sweep, SWEEP, Vector2, WebCanvas } from '../../../../src/Main'
import { createShapePoints } from '../utils/createPrimitives'

export function arcToolkitTest01(webCanvas: WebCanvas, layerItemId: string): void {
	const { d2ElementController } = webCanvas
	const pointA: Vector2 = new Vector2(0, 50)
	const centerPoint: Vector2 = new Vector2(0, 0)
	const radius: number = 50
	const startRadian: number = 0
	const endRadian: number = Math.PI
	/**
	 * 判断点是否位于圆弧上
	 */
	console.log('%c <T: 判断点是否位于圆弧上>', 'color: #ff6600')
	const arc: Arc = new Arc(radius, centerPoint, startRadian, endRadian)
	d2ElementController.createD2ArcElementShapeItem(layerItemId, arc.centerPoint, arc.radius, arc.startRadian, arc.endRadian, arc.sweep, {
		isEnableSelect: false,
		isFill: true,
		fillColor: new Color(255, 0, 0, 0.5),
	})
	const a1: boolean = D2ArcToolkit.isPointOnArc(arc, pointA)
	console.log(a1)
	console.log('%c </T>', 'color: #ff6600')
	/* ... */
	createShapePoints(webCanvas, layerItemId, [
		{ label: `pointA`, position: pointA },
		{ label: `centerPoint`, position: centerPoint },
	])
	console.log(d2ElementController.getAllD2ElementShapeResults())
}

export function arcToolkitTest02(webCanvas: WebCanvas, layerItemId: string): void {
	const { d2ElementController } = webCanvas
	const [startPoint, endPoint, thirdPoint]: [Vector2, Vector2, Vector2] = [new Vector2(50, 10), new Vector2(-20, -20), new Vector2(0, 50)]
	/**
	 * 计算圆弧参数: 已知任意三点求圆弧参数
	 */
	console.log('%c <T: 计算圆弧参数: 已知任意三点求圆弧参数>', 'color: #ff6600')
	const arcParams: {
		startRadian: number
		endRadian: number
		radius: number
		centerPoint: Vector2
		sweep: Sweep
	} = D2ArcToolkit.calculateD2ArcProfileByThreePoint(startPoint, endPoint, thirdPoint)
	console.log(arcParams)
	console.log('%c </T>', 'color: #ff6600')
	if (!arcParams) {
		console.error(`当前三点无法生成唯一圆弧`)
		return
	}
	d2ElementController.createD2ArcElementShapeItem(layerItemId, arcParams.centerPoint, arcParams.radius, arcParams.startRadian, arcParams.endRadian, arcParams.sweep, {
		isEnableSelect: false,
		isFill: true,
		fillColor: new Color(255, 0, 0, 0.5),
	})
	/* ... */
	createShapePoints(webCanvas, layerItemId, [
		{ label: `startPoint`, position: startPoint },
		{ label: `thirdPoint`, position: thirdPoint },
		{ label: `endPoint`, position: endPoint },
	])
	console.log(d2ElementController.getAllD2ElementShapeResults())
}

export function arcToolkitTest03(webCanvas: WebCanvas, layerItemId: string): void {
	const { d2ElementController } = webCanvas
	const [radius, startRadian, sweepRadian]: [number, number, number] = [50, 0, (Math.PI * 4) / 3]
	/**
	 * 计算圆弧参数: 已知半径/弧度求圆弧参数
	 */
	console.log('%c <T: 计算圆弧参数: 已知半径/弧度求圆弧参数>', 'color: #ff6600')
	const arcParams: {
		startPoint: Vector2
		endPoint: Vector2
		middlePoint: Vector2
	} = D2ArcToolkit.calculateThreePointByArcProfile(radius, startRadian, sweepRadian)
	console.log(arcParams)
	console.log('%c </T>', 'color: #ff6600')
	/* ... */
	createShapePoints(webCanvas, layerItemId, [
		{ label: `startPoint`, position: arcParams.startPoint },
		{ label: `middlePoint`, position: arcParams.middlePoint },
		{ label: `endPoint`, position: arcParams.endPoint },
	])
	console.log(d2ElementController.getAllD2ElementShapeResults())
}

export function arcToolkitTest04(webCanvas: WebCanvas, layerItemId: string): void {
	const { d2ElementController } = webCanvas
	const [centerPoint, startPoint, endPoint]: [Vector2, Vector2, Vector2] = [new Vector2(0, 0), new Vector2(50, 10), new Vector2(0, 50)]
	/**
	 * 计算圆弧参数: 已知圆心/起始结束坐标点求圆弧参数
	 */
	console.log('%c <T: 计算圆弧参数: 已知圆心/起始结束坐标点求圆弧参数>', 'color: #ff6600')
	const arcParams: {
		startRadian: number
		endRadian: number
	} = D2ArcToolkit.calculateRadianProfileByPoint(centerPoint, startPoint, endPoint, SWEEP.CCW)
	console.log(arcParams)
	console.log('%c </T>', 'color: #ff6600')
	if (!arcParams) {
		console.error(`当前参数无法生成唯一圆弧`)
		return
	}
	/* ... */
	createShapePoints(webCanvas, layerItemId, [
		{ label: `startPoint`, position: startPoint },
		{ label: `centerPoint`, position: centerPoint },
		{ label: `endPoint`, position: endPoint },
	])
	console.log(d2ElementController.getAllD2ElementShapeResults())
}

export function arcToolkitTest05(webCanvas: WebCanvas, layerItemId: string): void {
	const { d2ElementController } = webCanvas
	const [sweepRadian, startPoint, endPoint]: [number, Vector2, Vector2] = [Math.PI / 2, new Vector2(50, 70), new Vector2(-20, -20)]
	/**
	 * 计算圆弧参数: 已知旋转弧度/起始结束坐标点求圆弧参数
	 */
	console.log('%c <T: 计算圆弧参数: 已知旋转弧度/起始结束坐标点求圆弧参数>', 'color: #ff6600')
	const arcParams: {
		centerPoint: Vector2
		radius: number
		startRadian: number
		endRadian: number
		sweep: Sweep
	} = D2ArcToolkit.calculateD2ArcProfileTwoPointsAndRadian(sweepRadian, startPoint, endPoint)
	console.log(arcParams)
	console.log('%c </T>', 'color: #ff6600')
	if (!arcParams) {
		console.error(`当前参数无法生成唯一圆弧`)
		return
	}
	d2ElementController.createD2ArcElementShapeItem(layerItemId, arcParams.centerPoint, arcParams.radius, arcParams.startRadian, arcParams.endRadian, arcParams.sweep, {
		isEnableSelect: false,
		isFill: true,
		fillColor: new Color(255, 0, 0, 0.5),
	})
	/* ... */
	createShapePoints(webCanvas, layerItemId, [
		{ label: `startPoint`, position: startPoint },
		{ label: `centerPoint`, position: arcParams.centerPoint },
		{ label: `endPoint`, position: endPoint },
	])
	console.log(d2ElementController.getAllD2ElementShapeResults())
}
