import { Color, D2POINT_SHAPE, POINT_EVENT_NAME, Vector2, WebCanvas } from '../../../Main'

export function drawTestPoint(webCanvas: WebCanvas, layerItemId: string): void {
	const { d2ElementController, operationController } = webCanvas
	const drawLayerController = webCanvas.drawLayerController
	const defaultLayerItemId: string = layerItemId
	/* ... */
	const shapeElementItemId1: string = d2ElementController.createD2PointElementShapeItem(
		defaultLayerItemId,
		new Vector2(-40, -40),
		10,
		D2POINT_SHAPE.DOT
	)
	d2ElementController.updateD2ElementShapeItemByJSONData(shapeElementItemId1, {
		strokeColor: Color.RED,
	})
	/* ... */
	const shapeElementItemId2: string = d2ElementController.createD2PointElementShapeItem(
		defaultLayerItemId,
		new Vector2(40, 40),
		10,
		D2POINT_SHAPE.TRIANGLE
	)
	d2ElementController.updateD2ElementShapeItemByJSONData(shapeElementItemId1, {
		strokeColor: Color.RED,
	})
}
