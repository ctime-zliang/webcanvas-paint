import { ED2FontStyle } from '../../../engine/config/PrimitiveProfile'
import {
	Color,
	D2ElementController,
	D2FONT_STYLE,
	D2TextElementController,
	D2TextVertexData,
	DrawLayerController,
	POINT_EVENT_NAME,
	Vector2,
	Vector3,
	WebCanvas,
} from '../../../Main'

const M_TEST_TXT1: string = `
	龘 齉爨麤齾靐 你好 世界
	~!@#$%^&*()_+-={}[]:;"'\|<,>.?/
	￥……！；：“’、《，》。？——（）
	0123456789
	AaBbCcDdEeFfGgHhIiJjKkLlMmNn
	OoPpQqRrSsTtUuVvWwXxYyZz
`

export async function drawTestTextItem(webCanvas: WebCanvas, layerItemId: string): Promise<void> {
	const { d2ElementController, d2TextElementController, operationController } = webCanvas
	const drawLayerController = webCanvas.drawLayerController
	const defaultLayerItemId: string = layerItemId
	/* ... */
	const d2TextVertexData: D2TextVertexData = await d2TextElementController.createD2TextVertexDataItem(
		M_TEST_TXT1,
		'fangsong',
		D2FONT_STYLE.NORMAL,
		20
	)
	console.log(d2TextVertexData)
	window.setTimeout((): void => {
		const shapeElementItemId1: string = d2TextElementController.createD2TextElementItemByVertexData(
			defaultLayerItemId,
			d2TextVertexData,
			new Vector2(
				-(d2TextVertexData.bbox2.maxX - d2TextVertexData.bbox2.minX) / 2,
				-(d2TextVertexData.bbox2.maxY - d2TextVertexData.bbox2.minY) / 2
			),
			Color.RED,
			1.0,
			null!
		)
	}, 500)
}
