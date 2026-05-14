import { Arc, Color, Line, SWEEP, Vector2, WebCanvas } from '../../../Main'
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
	console.log(arc.toPoints(1))
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
