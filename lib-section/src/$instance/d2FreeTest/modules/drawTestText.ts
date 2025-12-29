import { ED2FontStyle } from '../../../engine/config/PrimitiveProfile'
import {
	Color,
	D2ElementController,
	D2FONT_STYLE,
	D2TextElementController,
	DrawLayerController,
	POINT_EVENT_NAME,
	Vector2,
	Vector3,
	WebCanvas,
} from '../../../Main'
import { TFontTriangleVertexData } from '../../../manager/TextGraphicsManager'
import { formatDates } from '../../public/formatDates'

const M_TEST_TXT1: string = `
	龘 齉爨麤齾靐 你好 世界
	~!@#$%^&*()_+-={}[]:;"'\|<,>.?/
	￥……！；：“’、《，》。？——（）
	0123456789
	AaBbCcDdEeFfGgHhIiJjKkLlMmNn
	OoPpQqRrSsTtUuVvWwXxYyZz
`

async function createTextVertexData(
	d2TextElementController: D2TextElementController,
	allTexts: Array<string>
): Promise<{
	texts: Array<{
		text: string
		vertexs: Array<
			Array<{
				positions: Array<number>
				indices: Array<number>
			}>
		>
	}>
	fontFamily: string
}> {
	const texts: Array<{
		text: string
		vertexs: Array<
			Array<{
				positions: Array<number>
				indices: Array<number>
			}>
		>
	}> = []
	const fontFamily: string = 'fangsong'
	return new Promise((resolve): void => {
		for (let i: number = 0; i < allTexts.length; i++) {
			d2TextElementController.createD2TextVertexDataItem(allTexts[i], fontFamily, D2FONT_STYLE.NORMAL, 20).then((d2TextVertexData): void => {
				texts.push({
					text: allTexts[i],
					vertexs: d2TextVertexData.vertexDataArray,
				})
				if (i >= allTexts.length - 1) {
					resolve({
						texts,
						fontFamily,
					})
				}
			})
		}
	})
}

export async function drawTestTextItem(webCanvas: WebCanvas, layerItemId: string): Promise<void> {
	const { d2ElementController, d2TextElementController, operationController } = webCanvas
	const drawLayerController = webCanvas.drawLayerController
	const defaultLayerItemId: string = layerItemId
	/* ... */
	d2TextElementController.createD2TextVertexDataItem(M_TEST_TXT1, 'fangsong', D2FONT_STYLE.NORMAL, 20).then((d2TextVertexData): void => {
		console.log(d2TextVertexData)
		window.setTimeout((): void => {
			const shapeElementItemId1: string = d2TextElementController.createD2TextElementItemByVertexData(
				defaultLayerItemId,
				d2TextVertexData.vertexDataArray,
				new Vector2(
					-(d2TextVertexData.bbox2.maxX - d2TextVertexData.bbox2.minX) / 2,
					-(d2TextVertexData.bbox2.maxY - d2TextVertexData.bbox2.minY) / 2
				),
				Color.RED,
				1.0,
				null!
			)
			d2ElementController.bindD2ElementShapeItemEvent(
				shapeElementItemId1,
				POINT_EVENT_NAME.POINTER_DOWN,
				(elementItemId: string, eventId: string): void => {
					console.log(d2ElementController.getD2ElementShapeItemJSONData(elementItemId))
				}
			)
			// window.setTimeout((): void => {
			// 	d2TextElementController.setElementItemContent(shapeElementItemId1, '2')
			// }, 500)
		}, 500)
	})
}

let count: number = 0

function renderTime(
	drawLayerController: DrawLayerController,
	d2TextElementController: D2TextElementController,
	layerItemId: string,
	fontFamily: string
): void {
	drawLayerController.deleteDrawLayerElements(layerItemId)
	d2TextElementController.createD2TextElementItem(
		layerItemId,
		new Vector2(-50, -50),
		String(formatDates()),
		fontFamily,
		ED2FontStyle.ITALIC,
		20,
		100,
		Color.GOLDEN
	)
	// window.requestAnimationFrame((): void => {
	// 	renderTime(drawLayerController, d2TextElementController, layerItemId, fontFamily)
	// })
}

export function drawPresetTestTextItem(webCanvas: WebCanvas, layerItemId: string): void {
	const { d2ElementController, d2TextElementController, operationController } = webCanvas
	const drawLayerController = webCanvas.drawLayerController
	const defaultLayerItemId: string = layerItemId
	/* ... */
	createTextVertexData(d2TextElementController, ['-', ':', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']).then(
		(results: {
			texts: Array<{
				text: string
				vertexs: Array<
					Array<{
						positions: Array<number>
						indices: Array<number>
					}>
				>
			}>
			fontFamily: string
		}) => {
			console.log(results)
			window.setInterval((): void => {
				renderTime(drawLayerController, d2TextElementController, defaultLayerItemId, results.fontFamily)
			}, 1000)
		}
	)
}
