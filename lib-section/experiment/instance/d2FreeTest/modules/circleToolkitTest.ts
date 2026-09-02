import { Sweep, Color, D2CircleToolkit, Vector2, WebCanvas } from '../../../../src/Main'
import { createShapePoints } from '../utils/createPrimitives'

export function circleToolkitTest01(webCanvas: WebCanvas, layerItemId: string): void {
	const { d2ElementController } = webCanvas
	const [pointA, pointB, pointC]: [Vector2, Vector2, Vector2] = [new Vector2(-50, -50), new Vector2(-40, 30), new Vector2(50, 0)]
	/**
	 * 非共线三点计算圆参数
	 */
	console.log('%c <T: 非共线三点计算圆参数>', 'color: #ff6600')
	const circleParams: {
		centerPoint: Vector2
		radius: number
		sweep: Sweep
	} = D2CircleToolkit.calculateCircleProfileByByThreePoint(pointA, pointB, pointC)
	console.log(circleParams)
	console.log('%c </T>', 'color: #ff6600')
	if (!circleParams) {
		console.error(`当前三点无法生成唯一圆`)
		return
	}
	d2ElementController.createD2CircleElementShapeItem(layerItemId, circleParams.centerPoint, {
		radius: circleParams.radius,
		strokeWidth: circleParams.sweep,
		strokeColor: Color.RED,
		isEnableSelect: false,
	})
	/* ... */
	createShapePoints(webCanvas, layerItemId, [
		{ label: `pointA`, position: pointA },
		{ label: `pointB`, position: pointB },
		{ label: `pointC`, position: pointC },
	])
	console.log(d2ElementController.getAllD2ElementShapeResults())
}
