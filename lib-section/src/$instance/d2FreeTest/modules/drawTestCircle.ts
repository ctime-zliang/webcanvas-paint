import { Color, ElementJSONData, HISTORY_CMD_ACTION, POINT_EVENT_NAME, Vector2, WebCanvas } from '../../../Main'

export function drawTestCircle(webCanvas: WebCanvas, layerItemId: string): void {
	const { d2ElementController, operationController } = webCanvas
	const drawLayerController = webCanvas.drawLayerController
	const defaultLayerItemId: string = layerItemId
	/* ... */
	const shapeElementItemId1: string = d2ElementController.createD2CircleElementShapeItem(defaultLayerItemId, new Vector2(-120, -100), 30, 5)
	d2ElementController.updateD2ElementShapeItemByJSONData(shapeElementItemId1, {
		strokeColor: Color.RED,
	})
	d2ElementController.bindD2ElementShapeItemEvent(
		shapeElementItemId1,
		POINT_EVENT_NAME.POINTER_DOWN,
		(elementItemId: string, eventId: string): void => {
			console.log(d2ElementController.getD2ElementShapeItemJSONData(elementItemId))
		}
	)
	/* ... */
	const shapeElementItemId2: string = d2ElementController.createD2CircleElementShapeItem(
		defaultLayerItemId,
		new Vector2(-40, -100),
		30,
		5,
		Color.BLUE,
		true
	)
	d2ElementController.updateD2ElementShapeItemByJSONData(shapeElementItemId1, {
		strokeColor: Color.createByAlpha(0.5, Color.GREEN_YELLOW),
		fillColor: Color.createByAlpha(0.5, Color.BROWN),
	})
	d2ElementController.bindD2ElementShapeItemEvent(
		shapeElementItemId2,
		POINT_EVENT_NAME.POINTER_DOWN,
		(elementItemId: string, eventId: string): void => {
			console.log(d2ElementController.getD2ElementShapeItemJSONData(elementItemId))
		}
	)
}

export function drawTestCircles(webCanvas: WebCanvas, layerItemId: string): void {
	const { d2ElementController, operationController } = webCanvas
	const drawLayerController = webCanvas.drawLayerController
	const defaultLayerItemId: string = layerItemId
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
		const shapeElementItemId: string = d2ElementController.createD2CircleElementShapeItem(defaultLayerItemId, new Vector2(sx, sy), R, SW)
		d2ElementController.updateD2ElementShapeItemByJSONData(shapeElementItemId, {
			strokeColor: Color.RED,
		})
		const jsonData: ElementJSONData = d2ElementController.getD2ElementShapeItemJSONData(shapeElementItemId)
		console.log(jsonData)
	}
}
