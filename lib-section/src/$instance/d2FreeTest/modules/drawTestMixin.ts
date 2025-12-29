import { Color, ElementJSONData, HISTORY_CMD_ACTION, nextFrameTick, POINT_EVENT_NAME, px2mm, Vector2, WebCanvas } from '../../../Main'

export function drawTestMixinItems(webCanvas: WebCanvas, layerItemId: string): void {
	const { d2ElementController, operationController } = webCanvas
	const drawLayerController = webCanvas.drawLayerController
	const defaultLayerItemId: string = layerItemId
	const RADIUS: number = 15
	/* ... */
	const shapeElementItemId01: string = d2ElementController.createD2LineElementShapeItem(
		defaultLayerItemId,
		new Vector2(-125, 30),
		new Vector2(-125, 60),
		3,
		Color.GREEN
	)
	const shapeElementItemId02: string = d2ElementController.createD2CircleElementShapeItem(
		defaultLayerItemId,
		new Vector2(-100, 45),
		RADIUS,
		3,
		Color.RED
	)
	const shapeElementItemId03: string = d2ElementController.createD2LineElementShapeItem(
		defaultLayerItemId,
		new Vector2(-75, 30),
		new Vector2(-75, 60),
		3,
		Color.GREEN
	)
	const shapeElementItemId04: string = d2ElementController.createD2CircleElementShapeItem(
		defaultLayerItemId,
		new Vector2(-50, 45),
		RADIUS,
		3,
		Color.RED
	)
	const shapeElementItemId05: string = d2ElementController.createD2LineElementShapeItem(
		defaultLayerItemId,
		new Vector2(-25, 30),
		new Vector2(-25, 60),
		3,
		Color.GREEN
	)
	const shapeElementItemId06: string = d2ElementController.createD2CircleElementShapeItem(
		defaultLayerItemId,
		new Vector2(0, 45),
		RADIUS,
		3,
		Color.RED
	)
	const shapeElementItemId07: string = d2ElementController.createD2LineElementShapeItem(
		defaultLayerItemId,
		new Vector2(25, 30),
		new Vector2(25, 60),
		3,
		Color.GREEN
	)
	const shapeElementItemId08: string = d2ElementController.createD2CircleElementShapeItem(
		defaultLayerItemId,
		new Vector2(50, 45),
		RADIUS,
		3,
		Color.RED
	)
	const shapeElementItemId09: string = d2ElementController.createD2LineElementShapeItem(
		defaultLayerItemId,
		new Vector2(75, 30),
		new Vector2(75, 60),
		3,
		Color.GREEN
	)
	const shapeElementItemId10: string = d2ElementController.createD2CircleElementShapeItem(
		defaultLayerItemId,
		new Vector2(100, 45),
		RADIUS,
		3,
		Color.RED
	)
	const shapeElementItemId11: string = d2ElementController.createD2LineElementShapeItem(
		defaultLayerItemId,
		new Vector2(125, 30),
		new Vector2(125, 60),
		3,
		Color.GREEN
	)
	const shapeElementItemId12: string = d2ElementController.createD2CircleElementShapeItem(
		defaultLayerItemId,
		new Vector2(150, 45),
		RADIUS,
		3,
		Color.RED
	)
	/* ... */
	const shapeElementItemId13: string = d2ElementController.createD2LineElementShapeItem(
		defaultLayerItemId,
		new Vector2(-125, -30),
		new Vector2(-125, -60),
		3,
		Color.GREEN
	)
	const shapeElementItemId14: string = d2ElementController.createD2CircleElementShapeItem(
		defaultLayerItemId,
		new Vector2(-100, -45),
		RADIUS,
		3,
		Color.RED
	)
	const shapeElementItemId15: string = d2ElementController.createD2LineElementShapeItem(
		defaultLayerItemId,
		new Vector2(-75, -30),
		new Vector2(-75, -60),
		3,
		Color.GREEN
	)
	const shapeElementItemId16: string = d2ElementController.createD2CircleElementShapeItem(
		defaultLayerItemId,
		new Vector2(-50, -45),
		RADIUS,
		3,
		Color.RED
	)
	const shapeElementItemId17: string = d2ElementController.createD2LineElementShapeItem(
		defaultLayerItemId,
		new Vector2(-25, -30),
		new Vector2(-25, -60),
		3,
		Color.GREEN
	)
	const shapeElementItemId18: string = d2ElementController.createD2CircleElementShapeItem(
		defaultLayerItemId,
		new Vector2(0, -45),
		RADIUS,
		3,
		Color.RED
	)
	const shapeElementItemId19: string = d2ElementController.createD2LineElementShapeItem(
		defaultLayerItemId,
		new Vector2(25, -30),
		new Vector2(25, -60),
		3,
		Color.GREEN
	)
	const shapeElementItemId20: string = d2ElementController.createD2CircleElementShapeItem(
		defaultLayerItemId,
		new Vector2(50, -45),
		RADIUS,
		3,
		Color.RED
	)
	const shapeElementItemId21: string = d2ElementController.createD2LineElementShapeItem(
		defaultLayerItemId,
		new Vector2(75, -30),
		new Vector2(75, -60),
		3,
		Color.GREEN
	)
	const shapeElementItemId22: string = d2ElementController.createD2CircleElementShapeItem(
		defaultLayerItemId,
		new Vector2(100, -45),
		RADIUS,
		3,
		Color.RED
	)
	const shapeElementItemId23: string = d2ElementController.createD2LineElementShapeItem(
		defaultLayerItemId,
		new Vector2(125, -30),
		new Vector2(125, -60),
		3,
		Color.GREEN
	)
	const shapeElementItemId24: string = d2ElementController.createD2CircleElementShapeItem(
		defaultLayerItemId,
		new Vector2(150, -45),
		RADIUS,
		3,
		Color.RED
	)
}
