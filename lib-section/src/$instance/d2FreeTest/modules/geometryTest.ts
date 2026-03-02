import { Color, D2LineToolkit, Line, Vector2, WebCanvas } from '../../../Main'

export function geometryTest01(webCanvas: WebCanvas, layerItemId: string): void {
	const { d2ElementController, d2TextElementController } = webCanvas
	const defaultLayerItemId: string = layerItemId
	const [lineAStartPoint, lineAEndPoint]: [Vector2, Vector2] = [new Vector2(0, 70), new Vector2(50, 0)]
	d2ElementController.createD2LineElementShapeItem(defaultLayerItemId, lineAStartPoint, lineAEndPoint, {
		strokeColor: Color.RED,
		isEnableSelect: false,
	})
	const pointA: Vector2 = new Vector2(100, 50)
	d2ElementController.createD2PointElementShapeItem(defaultLayerItemId, pointA, {
		strokeColor: Color.GREEN,
		isEnableScale: true,
		isEnableSelect: false,
	})
	/**
	 * 计算点到线段的垂线
	 */
	const lineA: Line = new Line(lineAStartPoint, lineAEndPoint)
	const footRes: { point: Vector2; t: number } = D2LineToolkit.calcFootOfPoint2Line(lineA, pointA)
	console.log(footRes)
	d2ElementController.createD2LineElementShapeItem(defaultLayerItemId, pointA, footRes.point, {
		strokeColor: Color.GOLDEN,
		isEnableSelect: false,
		isSolid: false,
	})
	d2ElementController.createD2PointElementShapeItem(defaultLayerItemId, footRes.point, {
		strokeColor: Color.GOLDEN,
		isEnableScale: true,
		isEnableSelect: false,
	})
	d2TextElementController.createD2TextElementItem(defaultLayerItemId, footRes.point, `P(${footRes.point.x}, ${footRes.point.y})`, {
		isEnableSelect: false,
	})
	/**
	 * 判断点是否在线段上
	 */
	const pointB: Vector2 = new Vector2(14.25, 50)
	d2ElementController.createD2PointElementShapeItem(defaultLayerItemId, pointB, {
		strokeColor: Color.PINK,
		isEnableScale: true,
		isEnableSelect: false,
	})
	const b1: boolean = D2LineToolkit.isPointOnLine(lineA, pointB)
	const b2: boolean = D2LineToolkit.isPointOnLine2(lineA, pointB, 0)
	const b3: boolean = D2LineToolkit.isPointOnSegment(lineA.startPoint, lineA.endPoint, pointB)
	console.log(b1, b2, b3)
}

export function geometryTest02(webCanvas: WebCanvas, layerItemId: string): void {
	const { d2ElementController } = webCanvas
	const defaultLayerItemId: string = layerItemId
	webCanvas.setCanvasZoomRatioByScenePhysicsPos(4.5)
	const [lineAStartPoint, lineAEndPoint]: [Vector2, Vector2] = [new Vector2(0, 0), new Vector2(50, 0)]
	d2ElementController.createD2LineElementShapeItem(defaultLayerItemId, lineAStartPoint, lineAEndPoint, {
		strokeColor: Color.RED,
		isEnableSelect: false,
	})
	/**
	 * 判断点是否在线段上
	 */
	const lineA: Line = new Line(lineAStartPoint, lineAEndPoint)
	const pointB: Vector2 = new Vector2(20, 20)
	d2ElementController.createD2PointElementShapeItem(defaultLayerItemId, pointB, {
		strokeColor: Color.PINK,
		isEnableScale: true,
		isEnableSelect: false,
	})
	const b1: boolean = D2LineToolkit.isPointOnLine(lineA, pointB)
	const b2: boolean = D2LineToolkit.isPointOnLine2(lineA, pointB, 0)
	const b3: boolean = D2LineToolkit.isPointOnSegment(lineA.startPoint, lineA.endPoint, pointB)
	console.log(b1, b2, b3)
}
