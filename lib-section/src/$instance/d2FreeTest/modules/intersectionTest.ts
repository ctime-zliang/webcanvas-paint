import { Arc, Color, D2Intersection, Line, SWEEP, Vector2, WebCanvas } from '../../../Main'
import { createPoints } from '../utils/createPoints'

export function intersectionTest01(webCanvas: WebCanvas, layerItemId: string): void {
	const { d2ElementController } = webCanvas
	const [lineAStartPoint, lineAEndPoint]: [Vector2, Vector2] = [new Vector2(0, 70), new Vector2(70, 0)]
	d2ElementController.createD2LineElementShapeItem(layerItemId, lineAStartPoint, lineAEndPoint, {
		strokeColor: Color.RED,
	})
	const [lineBStartPoint, lineBEndPoint]: [Vector2, Vector2] = [new Vector2(0, 0), new Vector2(50, 50)]
	d2ElementController.createD2LineElementShapeItem(layerItemId, lineBStartPoint, lineBEndPoint, {
		strokeColor: Color.GREEN,
	})
	/* ... */
	const lineA: Line = new Line(lineAStartPoint, lineAEndPoint)
	const lineB: Line = new Line(lineBStartPoint, lineBEndPoint)
	const intersections: { count: number; points: Array<Vector2> } = D2Intersection.getIntersectionsOfPrimitives(lineA, lineB)
	console.log(intersections)
	for (let i: number = 0; i < intersections.points.length; i++) {
		d2ElementController.createD2PointElementShapeItem(layerItemId, intersections.points[i], {
			strokeColor: Color.GOLDEN,
			isEnableScale: true,
		})
	}
	/* ... */
	createPoints(webCanvas, layerItemId, [
		{ label: `lineAStartPoint`, position: lineAStartPoint },
		{ label: `lineAEndPoint`, position: lineAEndPoint },
		{ label: `lineBStartPoint`, position: lineBStartPoint },
		{ label: `lineBEndPoint`, position: lineBEndPoint },
	])
}

export function intersectionTest02(webCanvas: WebCanvas, layerItemId: string): void {
	const { d2ElementController } = webCanvas
	const [lineAStartPoint, lineAEndPoint]: [Vector2, Vector2] = [new Vector2(-50, 40), new Vector2(70, 0)]
	d2ElementController.createD2LineElementShapeItem(layerItemId, lineAStartPoint, lineAEndPoint, {
		strokeColor: Color.RED,
	})
	const [arcCenterA, arcRadiusA, startRadianA, endRadianA]: [Vector2, number, number, number] = [new Vector2(0, 0), 40, 0, Math.PI]
	d2ElementController.createD2ArcElementShapeItem(layerItemId, arcCenterA, arcRadiusA, startRadianA, endRadianA, SWEEP.CCW, {
		strokeColor: Color.GREEN,
	})
	/* ... */
	const lineA: Line = new Line(lineAStartPoint, lineAEndPoint)
	const arcA: Arc = new Arc(arcRadiusA, arcCenterA, startRadianA, endRadianA)
	console.log(lineA, arcA)
	const intersections: { count: number; points: Array<Vector2> } = D2Intersection.getIntersectionsOfPrimitives(lineA, arcA)
	console.log(intersections)
	for (let i: number = 0; i < intersections.points.length; i++) {
		createPoints(webCanvas, layerItemId, [{ label: `Inter${i}`, position: intersections.points[i] }])
	}
}

export function intersectionTest03(webCanvas: WebCanvas, layerItemId: string): void {
	const { d2ElementController } = webCanvas
	const [arcCenterA, arcRadiusA, startRadianA, endRadianA]: [Vector2, number, number, number] = [new Vector2(0, 0), 40, 0, Math.PI]
	d2ElementController.createD2ArcElementShapeItem(layerItemId, arcCenterA, arcRadiusA, startRadianA, endRadianA, SWEEP.CCW, {
		strokeColor: Color.RED,
	})
	const [arcCenterB, arcRadiusB, startRadianB, endRadianB]: [Vector2, number, number, number] = [new Vector2(0, 50), 40, 0, Math.PI]
	d2ElementController.createD2ArcElementShapeItem(layerItemId, arcCenterB, arcRadiusB, startRadianB, endRadianB, SWEEP.CCW, {
		strokeColor: Color.GREEN,
	})
	/* ... */
	const arcA: Arc = new Arc(arcRadiusA, arcCenterA, startRadianA, endRadianA)
	const arcB: Arc = new Arc(arcRadiusB, arcCenterB, startRadianB, endRadianB)
	console.log(arcA, arcB)
	const intersections: { count: number; points: Array<Vector2> } = D2Intersection.getIntersectionsOfPrimitives(arcA, arcB)
	console.log(intersections)
	for (let i: number = 0; i < intersections.points.length; i++) {
		createPoints(webCanvas, layerItemId, [{ label: `Inter${i}`, position: intersections.points[i] }])
	}
}
