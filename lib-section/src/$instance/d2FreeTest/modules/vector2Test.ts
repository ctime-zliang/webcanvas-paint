import { Color, Vector2, WebCanvas } from '../../../Main'
import { createPoints } from '../utils/createPoints'

export function vector2Test01(webCanvas: WebCanvas, layerItemId: string): void {
	const { d2ElementController } = webCanvas
	const [pointA, pointB]: [Vector2, Vector2] = [new Vector2(50, 0), new Vector2(0, 50)]
	/**
	 * 计算两点连成的向量与 X 轴的夹角
	 */
	console.log('%c <T: 计算两点构成的向量与 X 轴的夹角>', 'color: #ff6600')
	console.log(pointA.getRadianByVector2(pointB))
	console.log('%c </T>', 'color: #ff6600')
	/**
	 * 计算两个向量所构成的夹角
	 */
	console.log('%c <T: 计算两个向量所构成的夹角>', 'color: #ff6600')
	console.log(Vector2.calculateRadianCCWByTwoVector2(pointA, pointB))
	console.log('%c </T>', 'color: #ff6600')
	/* ... */
	createPoints(webCanvas, layerItemId, [
		{ label: `pointA`, position: pointA },
		{ label: `pointB`, position: pointB },
	])
}
