import { Color, Vector2, WebCanvas } from '../../../Main'
import { createPoints } from '../utils/createPoints'

export function vector2Test01(webCanvas: WebCanvas, layerItemId: string): void {
	const { d2ElementController } = webCanvas
	const [pointA, pointB]: [Vector2, Vector2] = [new Vector2(50, 0), new Vector2(0, 50)]
	console.log(pointA.getRadianByVector2(pointB))
	console.log(Vector2.calculateRadianCCWByTwoVector2(pointA, pointB))
	/* ... */
	createPoints(webCanvas, layerItemId, [
		{ label: `pointA`, position: pointA },
		{ label: `pointB`, position: pointB },
	])
}
