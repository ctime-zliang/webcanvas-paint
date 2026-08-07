import { Cdt2ds } from '../../../../src/engine/modules/d2Canvas2Svg/cdt2ds/Cdt2ds'
import { Color, D2EdgeItem, D2PointItem, nextFrameTick, Vector2, WebCanvas } from '../../../../src/Main'

const POINTS: Array<D2PointItem> = [
	// Outer
	[-60, -40],
	[-40, 0],
	[-50, 40],
	[0, 60],
	[50, 40],
	[40, 0],
	[60, -40],
	[0, -60],
	// Inner
	[20, 0],
	[0, 20],
	[-20, 0],
	[0, -20],
]
const EDGES: Array<D2EdgeItem> = [
	// Outer
	[0, 1],
	[1, 2],
	[2, 3],
	[3, 4],
	[4, 5],
	[5, 6],
	[6, 7],
	[7, 0],
	// Inner
	[8, 9],
	[9, 10],
	[10, 11],
	[11, 8],
]

export function cdt2dTest01(webCanvas: WebCanvas, layerItemId: string): void {
	const { d2ElementController, d2TextElementController } = webCanvas
	const layerItemAId: string = layerItemId
	for (let i: number = 0; i < POINTS.length; i++) {
		d2ElementController.createD2PointElementShapeItem(layerItemAId, new Vector2(POINTS[i][0], POINTS[i][1]), {
			size: 1.6,
			strokeColor: Color.YELLOW,
		})
		d2TextElementController.createD2TextVertexDataItem(`${String(i)} (${POINTS[i][0]}, ${POINTS[i][1]})`, {}).then((d2textVertexData): void => {
			const shapeElementItemId1: string = d2TextElementController.createD2TextElementItemByVertexData(layerItemAId, d2textVertexData, new Vector2(POINTS[i][0] + 2.5, POINTS[i][1]))
		})
	}
	for (let i: number = 0; i < EDGES.length; i++) {
		const p0: Array<number> = POINTS[EDGES[i][0]]
		const p1: Array<number> = POINTS[EDGES[i][1]]
		d2ElementController.createD2LineElementShapeItem(layerItemAId, new Vector2(p0[0], p0[1]), new Vector2(p1[0], p1[1]), {
			strokeWidth: 1.5,
			strokeColor: Color.RED,
		})
	}
	nextFrameTick((): void => {
		const indices: Array<Array<number>> = Cdt2ds.process(POINTS, EDGES)
		console.log(indices)
		let edgeItem: Array<number> = []
		for (let i: number = 0; i < indices.length; i++) {
			for (let j: number = 0; j < indices[i].length; j++) {
				edgeItem[0] = indices[i][j]
				edgeItem[1] = j + 1 >= indices[i].length ? indices[i][0] : indices[i][j + 1]
				const p0: Array<number> = POINTS[edgeItem[0]]
				const p1: Array<number> = POINTS[edgeItem[1]]
				d2ElementController.createD2LineElementShapeItem(layerItemAId, new Vector2(p0[0], p0[1]), new Vector2(p1[0], p1[1]), {
					strokeWidth: 0.5,
					strokeColor: Color.SILVER,
				})
			}
		}
	}, 1500)
}
