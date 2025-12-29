import { Color, ElementJSONData, HISTORY_CMD_ACTION, nextFrameTick, POINT_EVENT_NAME, px2mm, Vector2, WebCanvas } from '../../../Main'

export function drawTestRectItem(webCanvas: WebCanvas, layerItemId: string): void {
	const { d2ElementController, operationController } = webCanvas
	const drawLayerController = webCanvas.drawLayerController
	const defaultLayerItemId: string = layerItemId
	/* ... */
	const shapeElementItemId1: string = d2ElementController.createD2RectElementShapeItem(
		defaultLayerItemId,
		new Vector2(-70, 50),
		60,
		40,
		2,
		Color.RED,
		false,
		null!,
		1.0,
		true,
		10
	)
	d2ElementController.bindD2ElementShapeItemEvent(
		shapeElementItemId1,
		POINT_EVENT_NAME.POINTER_DOWN,
		(elementItemId: string, eventId: string): void => {
			console.log(d2ElementController.getD2ElementShapeItemJSONData(elementItemId))
		}
	)
	/* ... */
	const shapeElementItemId2: string = d2ElementController.createD2RectElementShapeItem(
		defaultLayerItemId,
		new Vector2(-70, 0),
		60,
		40,
		2,
		Color.YELLOW,
		false
	)
	d2ElementController.bindD2ElementShapeItemEvent(
		shapeElementItemId2,
		POINT_EVENT_NAME.POINTER_DOWN,
		(elementItemId: string, eventId: string): void => {
			console.log(d2ElementController.getD2ElementShapeItemJSONData(elementItemId))
		}
	)
	const shapeElementItemId3: string = d2ElementController.createD2RectElementShapeItem(
		defaultLayerItemId,
		new Vector2(0, 50),
		60,
		40,
		2,
		Color.GOLDEN,
		true,
		Color.CYAN
	)
	/* ... */
	d2ElementController.bindD2ElementShapeItemEvent(
		shapeElementItemId3,
		POINT_EVENT_NAME.POINTER_DOWN,
		(elementItemId: string, eventId: string): void => {
			console.log(d2ElementController.getD2ElementShapeItemJSONData(elementItemId))
		}
	)
	// /* ... */
	const shapeElementItemId0: string = d2ElementController.createD2RectElementShapeItem(
		defaultLayerItemId,
		new Vector2(0, 0),
		60,
		40,
		2,
		Color.PINK,
		true,
		Color.GREEN,
		1.0,
		true,
		10
	)
	/* ... */
	d2ElementController.bindD2ElementShapeItemEvent(
		shapeElementItemId0,
		POINT_EVENT_NAME.POINTER_DOWN,
		(elementItemId: string, eventId: string): void => {
			console.log(d2ElementController.getD2ElementShapeItemJSONData(elementItemId))
		}
	)
}

export function drawTestRects(webCanvas: WebCanvas, layerItemId?: string): void {
	const { d2ElementController, operationController } = webCanvas
	const drawLayerController = webCanvas.drawLayerController
	const defaultLayerItemId: string = layerItemId || drawLayerController.createDrawLayerShapeItem(`TestRect Layer A`)
	const allCoutn: number = 25
	const X0: number = -125
	const Y0: number = 80
	const W: number = 10
	const H: number = 125
	for (let i = 0; i < allCoutn; i++) {
		const shapeElementItemId1: string = d2ElementController.createD2RectElementShapeItem(
			defaultLayerItemId,
			new Vector2(X0 + i * (W + 10), Y0),
			W,
			H,
			2,
			Color.RED
		)
	}
}
