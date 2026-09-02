import { Arc, Color, Line, Polyline, Primitive, Triangle, Vector2, WebCanvas } from '../../../../src/Main'

export function createShapePoints(
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
): { textIds: Array<string>; pointIds: Array<string> } {
	const { d2ElementController, d2TextElementController } = webCanvas
	const result: { textIds: Array<string>; pointIds: Array<string> } = {
		textIds: [],
		pointIds: [],
	}
	for (let i: number = 0; i < points.length; i++) {
		const textId: string = d2TextElementController.createD2TextElementItem(layerItemId, points[i].position, `${points[i].label}(${points[i].position.x}, ${points[i].position.y})`, {
			isEnableSelect: false,
			strokeColor: points[i].labelColor || Color.GOLDEN,
			fontSize: points[i].labelSize || 5,
		})
		const pointId: string = d2ElementController.createD2PointElementShapeItem(layerItemId, points[i].position, {
			strokeColor: points[i].pointColor || Color.GOLDEN,
			isEnableScale: true,
			isEnableSelect: false,
			size: points[i].pointSize || 1,
		})
		result.textIds.push(textId)
		result.pointIds.push(pointId)
	}
	return result
}

export function createShapePrimitivesByPolyline(
	webCanvas: WebCanvas,
	layerItemId: string,
	polyline: Polyline,
	optional?: {
		strokeColor?: Color
		strokeWidth?: number
	}
): { lineIds: Array<string>; arcIds: Array<string> } {
	const { d2ElementController } = webCanvas
	const result: { lineIds: Array<string>; arcIds: Array<string> } = {
		lineIds: [],
		arcIds: [],
	}
	for (let i: number = 0; i < polyline.primitives.length; i++) {
		const p: Primitive = polyline.primitives[i]
		if (p instanceof Line) {
			const lineId: string = d2ElementController.createD2LineElementShapeItem(layerItemId, p.startPoint, p.endPoint, {
				isEnableSelect: false,
				strokeColor: optional ? optional.strokeColor || Color.WHITE : Color.WHITE,
				strokeWidth: optional ? optional.strokeWidth || 1 : 1,
			})
			result.lineIds.push(lineId)
			continue
		}
		if (p instanceof Arc) {
			const arcId: string = d2ElementController.createD2ArcElementShapeItem(layerItemId, p.centerPoint, p.radius, p.startRadian, p.endRadian, p.sweep, {
				isEnableSelect: false,
				strokeColor: optional ? optional.strokeColor || Color.WHITE : Color.WHITE,
			})
			result.arcIds.push(arcId)
			continue
		}
	}
	return result
}

export function createShapePrimitivesByTriangle(
	webCanvas: WebCanvas,
	layerItemId: string,
	triangle: Triangle,
	optional?: {
		strokeColor?: Color
		strokeWidth?: number
	}
): { lineIds: Array<string>; pointIds: Array<string>; textIds: Array<string> } {
	const { d2ElementController } = webCanvas
	const result: { lineIds: Array<string>; pointIds: Array<string>; textIds: Array<string> } = {
		lineIds: [],
		pointIds: [],
		textIds: [],
	}
	result.lineIds.push(
		d2ElementController.createD2LineElementShapeItem(layerItemId, triangle.p1, triangle.p2, {
			isEnableSelect: false,
			strokeColor: optional ? optional.strokeColor || Color.GOLDEN : Color.GOLDEN,
			strokeWidth: optional ? optional.strokeWidth || 1 : 1,
		})
	)
	result.lineIds.push(
		d2ElementController.createD2LineElementShapeItem(layerItemId, triangle.p2, triangle.p3, {
			isEnableSelect: false,
			strokeColor: optional ? optional.strokeColor || Color.GOLDEN : Color.GOLDEN,
			strokeWidth: optional ? optional.strokeWidth || 1 : 1,
		})
	)
	result.lineIds.push(
		d2ElementController.createD2LineElementShapeItem(layerItemId, triangle.p3, triangle.p1, {
			isEnableSelect: false,
			strokeColor: optional ? optional.strokeColor || Color.GOLDEN : Color.GOLDEN,
			strokeWidth: optional ? optional.strokeWidth || 1 : 1,
		})
	)
	const R: { textIds: Array<string>; pointIds: Array<string> } = createShapePoints(webCanvas, layerItemId, [
		{ label: `pointA`, position: triangle.p1 },
		{ label: `pointB`, position: triangle.p2 },
		{ label: `pointC`, position: triangle.p3 },
	])
	result.pointIds = R.pointIds
	result.textIds = R.textIds
	return result
}
