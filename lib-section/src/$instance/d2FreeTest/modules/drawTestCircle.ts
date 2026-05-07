import { Color, ElementJSONData, POINT_EVENT_NAME, Vector2, WebCanvas } from '../../../Main'

export function drawTestCircleItems(webCanvas: WebCanvas, layerItemId: string): void {
	const { d2ElementController } = webCanvas
	const allCount: number = 10
	const DISTX: number = 50
	const DISTY: number = 50
	const R: number = 20
	const SW: number = 5
	const rowSize: number = 5
	let ri: number = 0
	let ci: number = -1
	for (let i: number = 0; i < allCount; i++) {
		ci++
		if (i >= (ri + 1) * rowSize) {
			ri++
			ci = 0
		}
		const sx: number = -100 + DISTX * (ci - 1)
		const sy: number = 50 - ri * (R * 2 + DISTY)
		const ex: number = -100 + DISTX * (ci - 1)
		const ey: number = 50 - ri * (R * 2 + DISTY) - R * 2
		const shapeElementItemId: string = d2ElementController.createD2CircleElementShapeItem(layerItemId, new Vector2(sx, sy), {
			radius: R,
			strokeWidth: SW,
			isFill: i % 2 === 0,
			fillColor: Color.YELLOW_GREEN,
		})
		d2ElementController.updateD2ElementShapeItemAttrByJSONData(shapeElementItemId, {
			strokeColor: Color.RED,
		})
		const jsonData: ElementJSONData = d2ElementController.getD2ElementShapeItemJSONData(shapeElementItemId)
		console.log(jsonData)
	}
}
