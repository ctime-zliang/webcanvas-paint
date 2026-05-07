import { ESweep } from '../../../engine/config/CommonProfile'
import { Arc, Color, D2ArcToolkit, SWEEP, Vector2, WebCanvas } from '../../../Main'
import { createPoints } from '../utils/createPoints'

export function d2ArcToolkitTest01(webCanvas: WebCanvas, layerItemId: string): void {
	const { d2ElementController } = webCanvas
	const defaultLayerItemId: string = layerItemId
	const pointA: Vector2 = new Vector2(0, 50)
	const centerPoint: Vector2 = new Vector2(0, 0)
	const radius: number = 50
	const startRadian: number = 0
	const sweepRadian: number = Math.PI
	d2ElementController.createD2ArcElementShapeItem(defaultLayerItemId, centerPoint, radius, startRadian, startRadian + sweepRadian, SWEEP.CCW, {
		isEnableSelect: false,
		isFill: true,
		fillColor: new Color(255, 0, 0, 0.5),
	})
	/**
	 * 判断点是否位于圆弧上
	 */
	console.log('%c <T: 判断点是否位于圆弧上>', 'color: #ff6600')
	const arc: Arc = new Arc(radius, radius, centerPoint, startRadian, sweepRadian)
	const a1: boolean = D2ArcToolkit.isPointOnArc(arc, pointA)
	console.log(a1)
	console.log('%c </T>', 'color: #ff6600')
	/* ... */
	createPoints(webCanvas, layerItemId, [
		{ label: `pointA`, position: pointA },
		{ label: `CenterPoint`, position: centerPoint },
	])
	console.log(d2ElementController.getAllD2ElementShapeResults())
}

export function d2ArcToolkitTest02(webCanvas: WebCanvas, layerItemId: string): void {
	const { d2ElementController } = webCanvas
	const defaultLayerItemId: string = layerItemId
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
		sweep: ESweep
	} = D2ArcToolkit.calculateD2ArcProfileByThreePoint(startPoint, endPoint, thirdPoint)
	console.log(arcParams)
	console.log('%c </T>', 'color: #ff6600')
	if (!arcParams) {
		console.error(`当前三点无法生成唯一圆弧`)
		return
	}
	d2ElementController.createD2ArcElementShapeItem(
		defaultLayerItemId,
		arcParams.centerPoint,
		arcParams.radius,
		arcParams.startRadian,
		arcParams.endRadian,
		arcParams.sweep,
		{
			isEnableSelect: false,
			isFill: true,
			fillColor: new Color(255, 0, 0, 0.5),
		}
	)
	/* ... */
	createPoints(webCanvas, layerItemId, [
		{ label: `StartPoint`, position: startPoint },
		{ label: `ThirdPoint`, position: thirdPoint },
		{ label: `EndPoint`, position: endPoint },
	])
	console.log(d2ElementController.getAllD2ElementShapeResults())
}

export function d2ArcToolkitTest03(webCanvas: WebCanvas, layerItemId: string): void {
	const { d2ElementController } = webCanvas
	const defaultLayerItemId: string = layerItemId
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
	createPoints(webCanvas, layerItemId, [
		{ label: `StartPoint`, position: arcParams.startPoint },
		{ label: `MiddlePoint`, position: arcParams.middlePoint },
		{ label: `EndPoint`, position: arcParams.endPoint },
	])
	console.log(d2ElementController.getAllD2ElementShapeResults())
}

export function d2ArcToolkitTest04(webCanvas: WebCanvas, layerItemId: string): void {
	const { d2ElementController } = webCanvas
	const defaultLayerItemId: string = layerItemId
	const [centerPoint, startPoint, endPoint]: [Vector2, Vector2, Vector2] = [new Vector2(0, 0), new Vector2(50, 10), new Vector2(0, 50)]
	/**
	 * 计算圆弧参数: 已知圆心/起始结束坐标点求圆弧参数
	 */
	console.log('%c <T: 计算圆弧参数: 已知圆心/起始结束坐标点求圆弧参数>', 'color: #ff6600')
	const arcParams: {
		startRadian: number
		endRadian: number
	} = D2ArcToolkit.calculateRadianProfileByPoint(centerPoint, startPoint, endPoint, ESweep.CCW)
	console.log(arcParams)
	console.log('%c </T>', 'color: #ff6600')
	if (!arcParams) {
		console.error(`当前参数无法生成唯一圆弧`)
		return
	}
	/* ... */
	createPoints(webCanvas, layerItemId, [
		{ label: `StartPoint`, position: startPoint },
		{ label: `CenterPoint`, position: centerPoint },
		{ label: `EndPoint`, position: endPoint },
	])
	console.log(d2ElementController.getAllD2ElementShapeResults())
}

export function d2ArcToolkitTest05(webCanvas: WebCanvas, layerItemId: string): void {
	const { d2ElementController } = webCanvas
	const defaultLayerItemId: string = layerItemId
	const [sweepRadian, startPoint, endPoint]: [number, Vector2, Vector2] = [Math.PI, new Vector2(50, 50), new Vector2(-20, -20)]
	/**
	 * 计算圆弧参数: 已知旋转弧度/起始结束坐标点求圆弧参数
	 */
	console.log('%c <T: 计算圆弧参数: 已知旋转弧度/起始结束坐标点求圆弧参数>', 'color: #ff6600')
	const arcParams: {
		centerPoint: Vector2
		radius: number
		startRadian: number
		endRadian: number
		sweep: ESweep
	} = D2ArcToolkit.calculateD2ArcProfileTwoPointsAndRadian(sweepRadian, startPoint, endPoint)
	console.log(arcParams)
	console.log('%c </T>', 'color: #ff6600')
	if (!arcParams) {
		console.error(`当前参数无法生成唯一圆弧`)
		return
	}
	d2ElementController.createD2ArcElementShapeItem(
		defaultLayerItemId,
		arcParams.centerPoint,
		arcParams.radius,
		arcParams.startRadian,
		arcParams.endRadian,
		arcParams.sweep,
		{
			isEnableSelect: false,
			isFill: true,
			fillColor: new Color(255, 0, 0, 0.5),
		}
	)
	/* ... */
	createPoints(webCanvas, layerItemId, [
		{ label: `StartPoint`, position: startPoint },
		{ label: `CenterPoint`, position: arcParams.centerPoint },
		{ label: `EndPoint`, position: endPoint },
	])
	console.log(d2ElementController.getAllD2ElementShapeResults())
}
