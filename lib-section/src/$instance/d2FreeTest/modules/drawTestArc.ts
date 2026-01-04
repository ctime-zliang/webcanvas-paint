import { ECanvas2DLineCap } from '../../../engine/config/PrimitiveProfile'
import { Color, ElementJSONData, HISTORY_CMD_ACTION, POINT_EVENT_NAME, Sweep, SWEEP, Vector2, WebCanvas } from '../../../Main'

export function drawTestArcItems(webCanvas: WebCanvas, layerItemId: string): void {
	const { d2ElementController, operationController } = webCanvas
	const drawLayerController = webCanvas.drawLayerController
	const defaultLayerItemId: string = layerItemId
	/* ... */
	const shapeElementItemId1: string = d2ElementController.createD2ArcElementShapeItem(
		defaultLayerItemId,
		new Vector2(-180, 60),
		40,
		0,
		(Math.PI * 1) / 4,
		SWEEP.CCW,
		5
	)
	d2ElementController.updateD2ElementShapeItemByJSONData(shapeElementItemId1, { strokeColor: Color.RED, fillColor: Color.GOLDEN })
	d2ElementController.bindD2ElementShapeItemEvent(
		shapeElementItemId1,
		POINT_EVENT_NAME.POINTER_LEFTDOWN,
		(elementItemId: string, eventId: string): void => {
			console.log(d2ElementController.getD2ElementShapeItemJSONData(elementItemId))
		}
	)
	/* ... */
	const shapeElementItemId2: string = d2ElementController.createD2ArcElementShapeItem(
		defaultLayerItemId,
		new Vector2(-90, 60),
		40,
		0,
		(Math.PI * 2) / 4,
		SWEEP.CCW,
		5
	)
	d2ElementController.updateD2ElementShapeItemByJSONData(shapeElementItemId2, {
		strokeColor: Color.RED,
	})
	d2ElementController.bindD2ElementShapeItemEvent(
		shapeElementItemId2,
		POINT_EVENT_NAME.POINTER_LEFTDOWN,
		(elementItemId: string, eventId: string): void => {
			console.log(d2ElementController.getD2ElementShapeItemJSONData(elementItemId))
		}
	)
	/* ... */
	const shapeElementItemId3: string = d2ElementController.createD2ArcElementShapeItem(
		defaultLayerItemId,
		new Vector2(-0, 60),
		40,
		0,
		(Math.PI * 3) / 4,
		SWEEP.CCW,
		5
	)
	d2ElementController.updateD2ElementShapeItemByJSONData(shapeElementItemId3, {
		strokeColor: Color.RED,
	})
	d2ElementController.bindD2ElementShapeItemEvent(
		shapeElementItemId3,
		POINT_EVENT_NAME.POINTER_LEFTDOWN,
		(elementItemId: string, eventId: string): void => {
			console.log(d2ElementController.getD2ElementShapeItemJSONData(elementItemId))
		}
	)
	/* ... */
	const shapeElementItemId4: string = d2ElementController.createD2ArcElementShapeItem(
		defaultLayerItemId,
		new Vector2(90, 60),
		40,
		0,
		(Math.PI * 4) / 4,
		SWEEP.CCW,
		5
	)
	d2ElementController.updateD2ElementShapeItemByJSONData(shapeElementItemId1, { strokeColor: Color.RED, fillColor: Color.GOLDEN })
	d2ElementController.bindD2ElementShapeItemEvent(
		shapeElementItemId4,
		POINT_EVENT_NAME.POINTER_LEFTDOWN,
		(elementItemId: string, eventId: string): void => {
			console.log(d2ElementController.getD2ElementShapeItemJSONData(elementItemId))
		}
	)
	/* ... */
	const shapeElementItemId5: string = d2ElementController.createD2ArcElementShapeItem(
		defaultLayerItemId,
		new Vector2(180, 60),
		40,
		0,
		(Math.PI * 5) / 4,
		SWEEP.CCW,
		5
	)
	d2ElementController.updateD2ElementShapeItemByJSONData(shapeElementItemId5, {
		strokeColor: Color.RED,
	})
	d2ElementController.bindD2ElementShapeItemEvent(
		shapeElementItemId5,
		POINT_EVENT_NAME.POINTER_LEFTDOWN,
		(elementItemId: string, eventId: string): void => {
			console.log(d2ElementController.getD2ElementShapeItemJSONData(elementItemId))
		}
	)
	/* ... */
	const shapeElementItemId6: string = d2ElementController.createD2ArcElementShapeItem(
		defaultLayerItemId,
		new Vector2(-180, -25),
		40,
		0,
		(Math.PI * 6) / 4,
		SWEEP.CCW,
		5,
		undefined,
		undefined,
		undefined,
		undefined,
		undefined,
		ECanvas2DLineCap.SQUARE
	)
	d2ElementController.updateD2ElementShapeItemByJSONData(shapeElementItemId6, {
		strokeColor: Color.RED,
	})
	d2ElementController.bindD2ElementShapeItemEvent(
		shapeElementItemId6,
		POINT_EVENT_NAME.POINTER_LEFTDOWN,
		(elementItemId: string, eventId: string): void => {
			console.log(d2ElementController.getD2ElementShapeItemJSONData(elementItemId))
		}
	)
	/* ... */
	const shapeElementItemId7: string = d2ElementController.createD2ArcElementShapeItem(
		defaultLayerItemId,
		new Vector2(-90, -25),
		40,
		0,
		(Math.PI * 7) / 4,
		SWEEP.CCW,
		5,
		undefined,
		undefined,
		undefined,
		undefined,
		undefined,
		ECanvas2DLineCap.SQUARE
	)
	d2ElementController.updateD2ElementShapeItemByJSONData(shapeElementItemId1, { strokeColor: Color.RED, fillColor: Color.GOLDEN })
	d2ElementController.bindD2ElementShapeItemEvent(
		shapeElementItemId7,
		POINT_EVENT_NAME.POINTER_LEFTDOWN,
		(elementItemId: string, eventId: string): void => {
			console.log(d2ElementController.getD2ElementShapeItemJSONData(elementItemId))
		}
	)
	/* ... */
	const shapeElementItemId8: string = d2ElementController.createD2ArcElementShapeItem(
		defaultLayerItemId,
		new Vector2(0, -25),
		40,
		0,
		(Math.PI * 8) / 4,
		SWEEP.CCW,
		5
	)
	d2ElementController.updateD2ElementShapeItemByJSONData(shapeElementItemId8, {
		strokeColor: Color.RED,
	})
	d2ElementController.bindD2ElementShapeItemEvent(
		shapeElementItemId8,
		POINT_EVENT_NAME.POINTER_LEFTDOWN,
		(elementItemId: string, eventId: string): void => {
			console.log(d2ElementController.getD2ElementShapeItemJSONData(elementItemId))
		}
	)
}
