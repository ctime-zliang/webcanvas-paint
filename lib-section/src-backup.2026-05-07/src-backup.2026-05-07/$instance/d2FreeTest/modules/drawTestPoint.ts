import { Angles, Color, D2POINT_SHAPE, Vector2, WebCanvas } from '../../../Main'

export function drawTestPointItemStd(webCanvas: WebCanvas, layerItemId: string): void {
	const { d2ElementController } = webCanvas
	const defaultLayerItemId: string = layerItemId
	const shapeElementItemId1: string = d2ElementController.createD2PointElementShapeItem(defaultLayerItemId, new Vector2(-30, -30), {
		size: 20,
		shape: D2POINT_SHAPE.DOT,
		strokeColor: Color.YELLOW_GREEN,
		isEnableSelect: true,
	})
	const shapeElementItemId2: string = d2ElementController.createD2PointElementShapeItem(defaultLayerItemId, new Vector2(30, 30), {
		size: 20,
		shape: D2POINT_SHAPE.TRIANGLE,
		strokeColor: Color.YELLOW_GREEN,
	})
	d2ElementController.updateD2ElementShapeItemPropertyByJSONData(shapeElementItemId2, {
		isSelectable: false,
	})
	let angle: number = 0
	const f = (): void => {
		angle += 1
		angle = angle % 360
		d2ElementController.updateD2ElementShapeItemAttrByJSONData(shapeElementItemId2, {
			rotation: Angles.degreeToRadian(angle),
		})
		window.requestAnimationFrame(f)
	}
	window.requestAnimationFrame(f)
}
