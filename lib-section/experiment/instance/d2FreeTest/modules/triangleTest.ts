import { Arc, CANVAS_LINE_CAP, Color, Line, Matrix3, Polyline, SWEEP, Triangle, Vector2, WebCanvas } from '../../../../src/Main'
import { createShapePoints, createShapePrimitivesByTriangle } from '../utils/createPrimitives'

function createTrianglePoints(): [Vector2, Vector2, Vector2] {
	return [new Vector2(100, -50), new Vector2(-100, -20), new Vector2(40, 80)]
}

export function triangleTest01(webCanvas: WebCanvas, layerItemId: string): void {
	const { d2ElementController } = webCanvas
	const [pointA, pointB, pointC]: [Vector2, Vector2, Vector2] = createTrianglePoints()
	/**
	 * 三角形测试
	 */
	console.log('%c <T: 三角形测试>', 'color: #ff6600')
	const [triangleA]: [Triangle] = [new Triangle(pointA, pointB, pointC)]
	console.log(triangleA)
	const area: number = triangleA.getArea()
	console.log(area)
	/* ... */
	createShapePrimitivesByTriangle(webCanvas, layerItemId, triangleA)
}

export function triangleTest02(webCanvas: WebCanvas, layerItemId: string): void {
	const { d2ElementController } = webCanvas
	const [pointA, pointB, pointC]: [Vector2, Vector2, Vector2] = createTrianglePoints()
	/**
	 * 三角形"五心"
	 */
	console.log('%c <T: 三角形"五心">', 'color: #ff6600')
	const [triangleA]: [Triangle] = [new Triangle(pointA, pointB, pointC)]
	console.log(triangleA)
	const baryCentre: Vector2 = triangleA.getBaryCentre()
	const inCentre: Vector2 = triangleA.getInCentre()
	const circumCentre: Vector2 = triangleA.getCircumCentre()
	const orthoCentre: Vector2 = triangleA.getOrthoCentre()
	const exCentres: [Vector2, Vector2, Vector2] = triangleA.getExCentres()
	const inRadius: number = triangleA.getInRadius()
	const circumRadius: number = triangleA.getCircumRadius()
	/* ... */
	createShapePrimitivesByTriangle(webCanvas, layerItemId, triangleA)
	createShapePoints(webCanvas, layerItemId, [
		{ label: `baryCentre(重心)`, position: baryCentre, pointColor: Color.WHITE, labelColor: Color.WHITE },
		{ label: `inCentre(内心)`, position: inCentre, pointColor: Color.GREEN, labelColor: Color.GREEN },
		{ label: `circumCentre(外心)`, position: circumCentre, pointColor: Color.PINK, labelColor: Color.PINK },
		{ label: `orthoCentre(垂心)`, position: orthoCentre, pointColor: Color.WHITE, labelColor: Color.WHITE },
		{ label: `exCentres(0)(旁心)`, position: exCentres[0], pointColor: Color.WHITE, labelColor: Color.WHITE },
		{ label: `exCentres(1)(旁心)`, position: exCentres[1], pointColor: Color.WHITE, labelColor: Color.WHITE },
		{ label: `exCentres(2)(旁心)`, position: exCentres[2], pointColor: Color.WHITE, labelColor: Color.WHITE },
	])
	d2ElementController.createD2CircleElementShapeItem(layerItemId, inCentre, {
		radius: inRadius,
		strokeColor: Color.GREEN,
	})
	d2ElementController.createD2CircleElementShapeItem(layerItemId, circumCentre, {
		radius: circumRadius,
		strokeColor: Color.PINK,
	})
}
