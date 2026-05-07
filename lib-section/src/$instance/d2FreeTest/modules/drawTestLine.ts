import { CANVAS_LINE_CAP, Color, D2ELEMENT_TYPE, POINT_EVENT_NAME, Vector2, WebCanvas } from '../../../Main'

function getRandomInArea(min: number = 0, max: number = Number.MAX_SAFE_INTEGER): number {
	return Math.floor(Math.random() * (max - min + 1)) + min
}

export function drawTestLineItemStd(webCanvas: WebCanvas, layerItemId: string): void {
	const { d2ElementController } = webCanvas
	const shapeElementItemId: string = d2ElementController.createD2LineElementShapeItem(layerItemId, new Vector2(-70, -70), new Vector2(70, 70), {
		strokeWidth: 40,
		strokeColor: Color.RED,
		lineCap: CANVAS_LINE_CAP.ROUND,
		rectBorderRadius: 0,
	})
	d2ElementController.bindD2ElementShapeItemEvent(
		shapeElementItemId,
		POINT_EVENT_NAME.POINTER_LEFTDOWN,
		(elementItemId: string, eventId: string): void => {
			console.log(d2ElementController.getD2ElementShapeItemJSONData(elementItemId))
		}
	)
}

export function drawTestLineItems(webCanvas: WebCanvas, layerItemId: string): void {
	const ids: Array<string> = []
	const { d2ElementController } = webCanvas
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
		const shapeElementItemId: string = d2ElementController.createD2LineElementShapeItem(layerItemId, new Vector2(sx, sy), new Vector2(ex, ey), {
			strokeWidth: W,
		})
		d2ElementController.updateD2ElementShapeItemAttrByJSONData(shapeElementItemId, {
			strokeColor: Color.RED,
		})
	}
}

export function drawRandomTestLineItems(webCanvas: WebCanvas): void {
	const __start: number = performance.now()
	const count: number = 5 * 1e4
	const W: number = 2
	const { d2ElementController } = webCanvas
	const drawLayerController = webCanvas.drawLayerController
	const layerItemId: string = drawLayerController.createDrawLayerShapeItem(`Random Test-Line Layer A`)
	for (let i: number = 0; i < count; i++) {
		const sx: number = getRandomInArea(-125, 125)
		const sy: number = getRandomInArea(-125, 125)
		const ex: number = getRandomInArea(-125, 125)
		const ey: number = getRandomInArea(-125, 125)
		const shapeElementItemId: string = d2ElementController.createD2LineElementShapeItem(layerItemId, new Vector2(sx, sy), new Vector2(ex, ey), {
			strokeWidth: W,
			strokeColor: Color.RED,
		})
		d2ElementController.updateD2ElementShapeItemAttrByJSONData(
			shapeElementItemId,
			{
				strokeColor: Color.ORIGIN,
			},
			D2ELEMENT_TYPE.D2Line
		)
	}
	const __end: number = performance.now()
	console.log(`绘制线条: ${count}, 耗时: ${__end - __start}ms`)
}
