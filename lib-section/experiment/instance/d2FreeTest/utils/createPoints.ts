import { Color, Vector2, WebCanvas } from '../../../../src/Main'

export function createPoints(
	webCanvas: WebCanvas,
	layerItemId: string,
	points: Array<{
		label: string
		position: Vector2
		labelColor?: Color
		labelSize?: number
		pointColor?: Color
		pointSize?: number
	}>
): { tIds: Array<string>; pIds: Array<string> } {
	const { d2ElementController, d2TextElementController } = webCanvas
	const result: { tIds: Array<string>; pIds: Array<string> } = {
		tIds: [],
		pIds: [],
	}
	for (let i: number = 0; i < points.length; i++) {
		const tId: string = d2TextElementController.createD2TextElementItem(layerItemId, points[i].position, `${points[i].label}(${points[i].position.x}, ${points[i].position.y})`, {
			isEnableSelect: false,
			strokeColor: points[i].labelColor || Color.GOLDEN,
			fontSize: points[i].labelSize || 5,
		})
		const pId: string = d2ElementController.createD2PointElementShapeItem(layerItemId, points[i].position, {
			strokeColor: points[i].pointColor || Color.GOLDEN,
			isEnableScale: true,
			isEnableSelect: false,
			size: points[i].pointSize || 1,
		})
		result.tIds.push(tId)
		result.pIds.push(pId)
	}
	return result
}
