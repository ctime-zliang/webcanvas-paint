import {
	CANVAS_LINE_CAP,
	Color,
	D2ELEMENT_TYPE,
	ElementJSONData,
	HISTORY_CMD_ACTION,
	nextFrameTick,
	POINT_EVENT_NAME,
	px2mm,
	Vector2,
	WebCanvas,
} from '../../../Main'
import { sleep } from '../utils/sleep'
import { splitRange } from '../utils/splitRange'

function getRandomInArea(min: number = 0, max: number = Number.MAX_SAFE_INTEGER): number {
	return Math.floor(Math.random() * (max - min + 1)) + min
}

export function drawTestLineItem(webCanvas: WebCanvas, layerItemId: string): void {
	const { d2ElementController, operationController } = webCanvas
	const drawLayerController = webCanvas.drawLayerController
	const defaultLayerItemId: string = layerItemId
	/* ... */
	const shapeElementItemId: string = d2ElementController.createD2LineElementShapeItem(
		defaultLayerItemId,
		new Vector2(-80, -80),
		new Vector2(80, 80),
		2,
		undefined,
		undefined,
		false
	)
	d2ElementController.updateD2ElementShapeItemByJSONData(shapeElementItemId, {
		strokeColor: Color.RED,
	})
	d2ElementController.bindD2ElementShapeItemEvent(
		shapeElementItemId,
		POINT_EVENT_NAME.POINTER_DOWN,
		(elementItemId: string, eventId: string): void => {
			console.log(d2ElementController.getD2ElementShapeItemJSONData(elementItemId))
		}
	)
	/* ... */
	// const shapeElementItemId2: string = d2ElementController.createD2LineElementShapeItem(defaultLayerItemId, 110, -80, 150, -20, 5)
	// d2ElementController.updateD2ElementShapeItemByJSONData(shapeElementItemId2, {
	// 	strokeColor: Color.GREEN,
	// })
	// d2ElementController.bindD2ElementShapeItemEvent(shapeElementItemId2, POINT_EVENT_NAME.POINTER_DOWN, (elementItemId: string, eventId: string): void => {
	// 	console.log(d2ElementController.getD2ElementShapeItemJSONData(elementItemId))
	// })
}

export function drawTestLines(webCanvas: WebCanvas, layerItemId: string): void {
	const ids: Array<string> = []
	const { d2ElementController, operationController } = webCanvas
	const drawLayerController = webCanvas.drawLayerController
	const defaultLayerItemId: string = layerItemId
	const allCount: number = 10
	const DISTX: number = 10
	const DISTY: number = 10
	const W: number = 5
	const H: number = 50
	const rowSize: number = 20
	let ri: number = 0
	let ci: number = -1
	for (let i: number = 0; i < allCount; i++) {
		ci++
		if (i >= (ri + 1) * rowSize) {
			ri++
			ci = 0
		}
		const sx: number = -100 + DISTX * (ci - 1) + 20
		const sy: number = 50 - ri * (H + DISTY)
		const ex: number = -100 + DISTX * (ci - 1)
		const ey: number = 50 - ri * (H + DISTY) - H
		const shapeElementItemId: string = d2ElementController.createD2LineElementShapeItem(
			defaultLayerItemId,
			new Vector2(sx, sy),
			new Vector2(ex, ey),
			W
		)
		d2ElementController.updateD2ElementShapeItemByJSONData(shapeElementItemId, {
			strokeColor: Color.RED,
		})
		const jsonData: ElementJSONData = d2ElementController.getD2ElementShapeItemJSONData(shapeElementItemId)
		console.log(jsonData)
		ids.push(shapeElementItemId)
	}
}

export async function drawTestLines2(webCanvas: WebCanvas, layerItemId: string): Promise<void> {
	const { d2ElementController, operationController } = webCanvas
	const drawLayerController = webCanvas.drawLayerController
	const defaultLayerItemId: string = layerItemId
	const allCount: number = 10
	const X0: number = -75
	const ids: Array<string> = []
	const alphas: Array<number> = splitRange(0.2, 1.0, allCount)
	for (let i: number = 0; i < allCount; i++) {
		const shapeElementItemId: string = d2ElementController.createD2LineElementShapeItem(
			defaultLayerItemId,
			new Vector2(X0 + i * 10, -50),
			new Vector2(X0 + i * 10, 50),
			5
		)
		d2ElementController.updateD2ElementShapeItemByJSONData(shapeElementItemId, {
			strokeColor: Color.createByAlpha(alphas[i], Color.RED),
		})
		ids.push(shapeElementItemId)
	}
	nextFrameTick(async (): Promise<void> => {
		// for (let i: number = 0; i < ids.length; i++) {
		// 	d2ElementController.deleteD2ElementShapeItemById(ids[i])
		// 	await sleep(500)
		// }
		// for (let i: number = ids.length - 1; i >= 0; i--) {
		// 	d2ElementController.deleteD2ElementShapeItemById(ids[i])
		// 	await sleep(500)
		// }
	}, 1500)
}

export function drawRandomTestLines(webCanvas: WebCanvas): void {
	const __start: number = performance.now()
	const count: number = 1e5
	const W: number = 2
	const { d2ElementController, operationController } = webCanvas
	const drawLayerController = webCanvas.drawLayerController
	const defaultLayerItemId: string = drawLayerController.createDrawLayerShapeItem(`Random Test-Line Layer A`)
	for (let i: number = 0; i < count; i++) {
		const sx: number = getRandomInArea(-125, 125)
		const sy: number = getRandomInArea(-125, 125)
		const ex: number = getRandomInArea(-125, 125)
		const ey: number = getRandomInArea(-125, 125)
		const shapeElementItemId: string = d2ElementController.createD2LineElementShapeItem(
			defaultLayerItemId,
			new Vector2(sx, sy),
			new Vector2(ex, ey),
			W,
			Color.RED
		)
		d2ElementController.updateD2ElementShapeItemByJSONData(
			shapeElementItemId,
			{
				strokeColor: Color.ORIGIN,
			},
			D2ELEMENT_TYPE.D2Line
		)
		// d2ElementController.bindD2ElementShapeItemEvent(shapeElementItemId, POINT_EVENT_NAME.POINTER_DOWN, (elementItemId: string, eventId: string): void => {
		// 	console.log(d2ElementController.getD2ElementShapeItemJSONData(elementItemId))
		// })
	}
	const __end: number = performance.now()
	console.log(__end - __start)
}
