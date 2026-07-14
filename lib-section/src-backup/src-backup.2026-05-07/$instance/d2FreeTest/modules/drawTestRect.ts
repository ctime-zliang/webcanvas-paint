import { Angles, BBox2, Color, Element2DRectJSONViewData, nextFrameTick, Vector2, WebCanvas } from '../../../Main'

export async function drawTestRectItemStd(webCanvas: WebCanvas, layerItemId: string): Promise<void> {
	const { d2ElementController, d2TextElementController } = webCanvas
	const defaultLayerItemId: string = layerItemId
	const shapeElementItemIdA1: string = d2ElementController.createD2RectElementShapeItem(defaultLayerItemId, new Vector2(-50, 50), 125, 75, {
		strokeWidth: 5,
		strokeColor: Color.RED,
		isFill: true,
		fillColor: Color.createByAlpha(0.7, Color.GOLDEN),
		isFlipX: true,
		isFlipY: true,
		rotation: Angles.degreeToRadian(120),
		borderRadius: 10,
	})
	const jsonData: Element2DRectJSONViewData = d2ElementController.getD2ElementShapeItemJSONData(shapeElementItemIdA1) as Element2DRectJSONViewData
	console.log(jsonData)
	// let angle: number = 0
	// const f = (): void => {
	// 	angle += 1
	// 	angle = angle % 360
	// 	d2ElementController.updateD2ElementShapeItemAttrByJSONData(shapeElementItemIdA1, {
	// 		rotation: Angles.degreeToRadian(angle),
	// 	})
	// 	window.requestAnimationFrame(f)
	// }
	// window.requestAnimationFrame(f)
	d2ElementController.createD2PointElementShapeItem(defaultLayerItemId, new Vector2(jsonData.bbox2.minX, jsonData.bbox2.maxY), {
		strokeColor: Color.RED,
		isEnableSelect: false,
	})
	d2ElementController.createD2PointElementShapeItem(defaultLayerItemId, new Vector2(jsonData.bbox2.maxX, jsonData.bbox2.maxY), {
		strokeColor: Color.RED,
		isEnableSelect: false,
	})
	d2ElementController.createD2PointElementShapeItem(defaultLayerItemId, new Vector2(jsonData.bbox2.maxX, jsonData.bbox2.minY), {
		strokeColor: Color.RED,
		isEnableSelect: false,
	})
	d2ElementController.createD2PointElementShapeItem(defaultLayerItemId, new Vector2(jsonData.bbox2.minX, jsonData.bbox2.minY), {
		strokeColor: Color.RED,
		isEnableSelect: false,
	})
	d2ElementController.createD2PointElementShapeItem(defaultLayerItemId, Vector2.createByJSONData(jsonData.leftUp), {
		strokeColor: Color.BLUE,
		isEnableSelect: false,
	})
	d2ElementController.createD2PointElementShapeItem(defaultLayerItemId, Vector2.createByJSONData(jsonData.rightUp), {
		strokeColor: Color.BLUE,
		isEnableSelect: false,
	})
	d2ElementController.createD2PointElementShapeItem(defaultLayerItemId, Vector2.createByJSONData(jsonData.rightDown), {
		strokeColor: Color.BLUE,
		isEnableSelect: false,
	})
	d2ElementController.createD2PointElementShapeItem(defaultLayerItemId, Vector2.createByJSONData(jsonData.leftDown), {
		strokeColor: Color.BLUE,
		isEnableSelect: false,
	})
	d2TextElementController.createD2TextElementItem(defaultLayerItemId, Vector2.createByJSONData(jsonData.leftUp), 'LeftUp', {
		fontFamily: 'auto',
		fontSize: 10,
		strokeColor: Color.BLUE,
	})
	d2TextElementController.createD2TextElementItem(defaultLayerItemId, Vector2.createByJSONData(jsonData.rightUp), 'RightUp', {
		fontFamily: 'auto',
		fontSize: 10,
		strokeColor: Color.BLUE,
	})
	d2TextElementController.createD2TextElementItem(defaultLayerItemId, Vector2.createByJSONData(jsonData.rightDown), 'RightDown', {
		fontFamily: 'auto',
		fontSize: 10,
		strokeColor: Color.BLUE,
	})
	d2TextElementController.createD2TextElementItem(defaultLayerItemId, Vector2.createByJSONData(jsonData.leftDown), 'LeftDown', {
		fontFamily: 'auto',
		fontSize: 10,
		strokeColor: Color.BLUE,
	})
}

export async function drawTestRectItems(webCanvas: WebCanvas, layerItemId: string): Promise<void> {
	const { d2ElementController } = webCanvas
	const defaultLayerItemId: string = layerItemId
	d2ElementController.createD2PointElementShapeItem(defaultLayerItemId, new Vector2(40, 40), {
		size: 10,
		strokeColor: Color.YELLOW_GREEN,
		isEnableScale: true,
	})
	const shapeElementItemIdA1: string = d2ElementController.createD2RectElementShapeItem(defaultLayerItemId, new Vector2(-150, 70), 75, 50, {
		strokeWidth: 5,
		strokeColor: Color.RED,
		isFill: true,
		fillColor: Color.createByAlpha(0.7, Color.GOLDEN),
	})
	d2ElementController.updateD2ElementShapeItemAttrByJSONData(shapeElementItemIdA1, {
		isFlipX: false,
		isFlipY: false,
		rotation: Angles.degreeToRadian(0),
		borderRadius: 10,
	})
	const shapeElementItemIdA2: string = d2ElementController.createD2RectElementShapeItem(defaultLayerItemId, new Vector2(-50, 70), 75, 50, {
		strokeWidth: 5,
		strokeColor: Color.RED,
		isFill: true,
		fillColor: Color.createByAlpha(0.7, Color.GOLDEN),
	})
	d2ElementController.updateD2ElementShapeItemAttrByJSONData(shapeElementItemIdA2, {
		isFlipX: false,
		isFlipY: false,
		rotation: Angles.degreeToRadian(30),
		borderRadius: 10,
	})
	const shapeElementItemIdA3: string = d2ElementController.createD2RectElementShapeItem(defaultLayerItemId, new Vector2(50, 70), 75, 50, {
		strokeWidth: 5,
		strokeColor: Color.RED,
		isFill: true,
		fillColor: Color.createByAlpha(0.7, Color.GOLDEN),
	})
	d2ElementController.updateD2ElementShapeItemAttrByJSONData(shapeElementItemIdA3, {
		isFlipX: false,
		isFlipY: false,
		rotation: Angles.degreeToRadian(90),
		borderRadius: 10,
	})
	const shapeElementItemIdA4: string = d2ElementController.createD2RectElementShapeItem(defaultLayerItemId, new Vector2(150, 70), 75, 50, {
		strokeWidth: 5,
		strokeColor: Color.RED,
		isFill: true,
		fillColor: Color.createByAlpha(0.7, Color.GOLDEN),
	})
	d2ElementController.updateD2ElementShapeItemAttrByJSONData(shapeElementItemIdA4, {
		isFlipX: false,
		isFlipY: false,
		rotation: Angles.degreeToRadian(120),
		borderRadius: 10,
	})
	const shapeElementItemIdB1: string = d2ElementController.createD2RectElementShapeItem(defaultLayerItemId, new Vector2(-150, -30), 75, 50, {
		strokeWidth: 5,
		strokeColor: Color.RED,
		isFill: true,
		fillColor: Color.createByAlpha(0.7, Color.GOLDEN),
	})
	d2ElementController.updateD2ElementShapeItemAttrByJSONData(shapeElementItemIdB1, {
		isFlipX: true,
		isFlipY: true,
		rotation: Angles.degreeToRadian(0),
		borderRadius: 10,
	})
	const shapeElementItemIdB2: string = d2ElementController.createD2RectElementShapeItem(defaultLayerItemId, new Vector2(-50, -30), 75, 50, {
		strokeWidth: 5,
		strokeColor: Color.RED,
		isFill: true,
		fillColor: Color.createByAlpha(0.7, Color.GOLDEN),
	})
	d2ElementController.updateD2ElementShapeItemAttrByJSONData(shapeElementItemIdB2, {
		isFlipX: true,
		isFlipY: true,
		rotation: Angles.degreeToRadian(30),
		borderRadius: 10,
	})
	const shapeElementItemIdB3: string = d2ElementController.createD2RectElementShapeItem(defaultLayerItemId, new Vector2(50, -30), 75, 50, {
		strokeWidth: 5,
		strokeColor: Color.RED,
		isFill: true,
		fillColor: Color.createByAlpha(0.7, Color.GOLDEN),
	})
	d2ElementController.updateD2ElementShapeItemAttrByJSONData(shapeElementItemIdB3, {
		isFlipX: true,
		isFlipY: true,
		rotation: Angles.degreeToRadian(90),
		borderRadius: 10,
	})
	const shapeElementItemIdB4: string = d2ElementController.createD2RectElementShapeItem(defaultLayerItemId, new Vector2(150, -30), 75, 50, {
		strokeWidth: 5,
		strokeColor: Color.RED,
		isFill: true,
		fillColor: Color.createByAlpha(0.7, Color.GOLDEN),
	})
	d2ElementController.updateD2ElementShapeItemAttrByJSONData(shapeElementItemIdB4, {
		isFlipX: true,
		isFlipY: true,
		rotation: Angles.degreeToRadian(120),
		borderRadius: 10,
	})
	const jsonData: Element2DRectJSONViewData = d2ElementController.getD2ElementShapeItemJSONData(shapeElementItemIdB4) as Element2DRectJSONViewData
	const bbox2: BBox2 = BBox2.createByJSONData(jsonData.bbox2)
	d2ElementController.createD2RectElementShapeItem(defaultLayerItemId, bbox2.leftUp, bbox2.width, bbox2.height, {
		strokeColor: Color.GRAY,
	})
}

export async function drawTestRectModify(webCanvas: WebCanvas, layerItemId: string): Promise<void> {
	const { d2ElementController } = webCanvas
	const defaultLayerItemId: string = layerItemId
	const shapeElementItemIdA1: string = d2ElementController.createD2RectElementShapeItem(defaultLayerItemId, new Vector2(-100, 50), 200, 100, {
		strokeWidth: 5,
		strokeColor: Color.RED,
		isFill: true,
		fillColor: Color.createByAlpha(0.7, Color.GOLDEN),
	})
	nextFrameTick((): void => {
		d2ElementController.updateD2ElementShapeItemAttrByJSONData(shapeElementItemIdA1, {
			isFlipX: false,
			isFlipY: false,
			rotation: Angles.degreeToRadian(0),
			borderRadius: 30,
			position: new Vector2(-200, 100),
			strokeColor: Color.GRAY,
			fillColor: Color.YELLOW_GREEN,
		})
		webCanvas.flushShapesStorage()
	}, 1000)
}
