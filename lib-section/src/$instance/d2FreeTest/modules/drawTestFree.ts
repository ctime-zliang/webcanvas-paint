import { Distance } from '../../../algorithm/geometry/Distance'
import { intersPP } from '../../../algorithm/geometry/intersection/Intersection'
import { Arc, Color, Line, nextFrameTick, SWEEP, Vector2, WebCanvas } from '../../../Main'

function getMidPerpendicular(
	p1: Vector2,
	p2: Vector2
): {
	s: Vector2
	e: Vector2
} {
	const mid = {
		x: (p1.x + p2.x) / 2,
		y: (p1.y + p2.y) / 2,
	}
	const vec = {
		x: p2.x - p1.x,
		y: p2.y - p1.y,
	}
	const perpVec = {
		x: -vec.y,
		y: vec.x,
	}
	return {
		s: new Vector2(mid.x, mid.y),
		e: new Vector2(mid.x + perpVec.x, mid.y + perpVec.y),
	}
}

export function drawTestFree1(webCanvas: WebCanvas, layerItemId: string): void {
	const { d2ElementController, operationController } = webCanvas
	const drawLayerController = webCanvas.drawLayerController
	const defaultLayerItemId: string = layerItemId
	/* ... */
	const P1: Vector2 = new Vector2(-50, 0)
	const P2: Vector2 = new Vector2(0, -30)
	const P3: Vector2 = new Vector2(50, 0)
	const shapeElementItemId1: string = d2ElementController.createD2LineElementShapeItem(defaultLayerItemId, P1, P2, 2, Color.RED)
	const shapeElementItemId2: string = d2ElementController.createD2LineElementShapeItem(defaultLayerItemId, P2, P3, 2, Color.RED)
	const lr1: {
		s: Vector2
		e: Vector2
	} = getMidPerpendicular(P1, P2)
	d2ElementController.createD2LineElementShapeItem(defaultLayerItemId, lr1.s, lr1.e, 2, Color.GOLDEN)
}

export function drawTestFree2(webCanvas: WebCanvas, layerItemId: string): void {
	const { d2ElementController, operationController } = webCanvas
	const drawLayerController = webCanvas.drawLayerController
	const defaultLayerItemId: string = layerItemId
	/* ... */
	const P1: Vector2 = new Vector2(-50, 10)
	const P2: Vector2 = new Vector2(10, -30)
	const P3: Vector2 = new Vector2(20, 50)
	const P4: Vector2 = new Vector2(-50, -50)
	d2ElementController.createD2LineElementShapeItem(defaultLayerItemId, P1, P2, 2, Color.RED)
	d2ElementController.createD2LineElementShapeItem(defaultLayerItemId, P3, P4, 2, Color.RED)
	nextFrameTick((): void => {
		const line1: Line = new Line(P1, P2)
		const line2: Line = new Line(P3, P4)
		const result1 = intersPP(line1, line2)
		console.log(result1)
	}, 1000)
}

export function drawTestFree3(webCanvas: WebCanvas, layerItemId: string): void {
	const { d2ElementController, operationController } = webCanvas
	const drawLayerController = webCanvas.drawLayerController
	const defaultLayerItemId: string = layerItemId
	/* ... */
	const P1: Vector2 = new Vector2(-50, 50)
	const P2: Vector2 = new Vector2(50, -50)
	const P3: Vector2 = new Vector2(20, 20)
	const R: number = 40
	const SW: number = (Math.PI * 2 * 7) / 8
	d2ElementController.createD2LineElementShapeItem(defaultLayerItemId, P1, P2, 2, Color.RED)
	d2ElementController.createD2ArcElementShapeItem(defaultLayerItemId, P3, R, 0, SW, SWEEP.CCW, 5, Color.CYAN)
	nextFrameTick((): void => {
		const line1: Line = new Line(P1, P2)
		const arc2: Arc = new Arc(R, R, P3, 0, SW)
		const result1 = intersPP(line1, arc2)
		console.log(result1)
	}, 1000)
}

export function drawTestFree4(webCanvas: WebCanvas, layerItemId: string): void {
	const { d2ElementController, operationController } = webCanvas
	const drawLayerController = webCanvas.drawLayerController
	const defaultLayerItemId: string = layerItemId
	/* ... */
	const P1: Vector2 = new Vector2(30, 30)
	const R1: number = 40
	const SW1: number = (Math.PI * 2 * 7) / 8
	const P2: Vector2 = new Vector2(-15, -15)
	const R2: number = 40
	const SW2: number = (Math.PI * 2 * 7) / 8
	d2ElementController.createD2ArcElementShapeItem(defaultLayerItemId, P1, R1, 0, SW1, SWEEP.CCW, 2, Color.GREEN)
	d2ElementController.createD2ArcElementShapeItem(defaultLayerItemId, P2, R2, 0, SW2, SWEEP.CCW, 2, Color.CYAN)
	nextFrameTick((): void => {
		const arc1: Arc = new Arc(R1, R1, P1, 0, SW1)
		const arc2: Arc = new Arc(R2, R2, P2, 0, SW2)
		const result1 = intersPP(arc1, arc2)
		console.log(result1)
	}, 1000)
}

export function drawTestFree5(webCanvas: WebCanvas, layerItemId: string): void {
	const { d2ElementController, operationController } = webCanvas
	const drawLayerController = webCanvas.drawLayerController
	const defaultLayerItemId: string = layerItemId
	/* ... */
	const P1: Vector2 = new Vector2(-50, 50)
	const P2: Vector2 = new Vector2(-100, 0)
	const P3: Vector2 = new Vector2(50, 50)
	const P4: Vector2 = new Vector2(10, 0)
	d2ElementController.createD2LineElementShapeItem(defaultLayerItemId, P1, P2, 2, Color.RED)
	d2ElementController.createD2LineElementShapeItem(defaultLayerItemId, P3, P4, 2, Color.RED)
	nextFrameTick((): void => {
		const line1: Line = new Line(P1, P2)
		const line2: Line = new Line(P3, P4)
		const distance: Distance = new Distance(line1, line2)
		const ls: Vector2 = distance.minLine.startPoint
		const le: Vector2 = distance.minLine.endPoint
		d2ElementController.createD2LineElementShapeItem(defaultLayerItemId, ls, le, 1, Color.YELLOW)
		console.log(distance)
	}, 1000)
}
