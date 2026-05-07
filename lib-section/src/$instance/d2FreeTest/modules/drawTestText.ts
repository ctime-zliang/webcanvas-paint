import {
	Angles,
	BuildD2TextModelOptionalStyleSettingParam,
	Color,
	D2FONT_STYLE,
	D2TextVertexData,
	Element2DTextJSONViewData,
	ElementJSONData,
	nextFrameTick,
	Vector2,
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
const M_TEST_TXT2: string = `
	AjjfjjC
	DggfggF
	GfyyqI
`
const M_TEST_TXT3: string = `
	Görselleri Yükle
	Télécharger des images
	画像をアップロード
`
const M_TEST_TXT4: string = `
	A
`
const M_TEST_TXT5: string = `
	j
`
const M_TEST_TXT6: string = `
	Aj
	jA
`

export async function drawTestTextItemStd(webCanvas: WebCanvas, layerItemId: string): Promise<void> {
	const { d2TextElementController, d2ElementController } = webCanvas
	const styleSetting: Partial<BuildD2TextModelOptionalStyleSettingParam> = {
		padding: { left: 5, top: 5, right: 5, bottom: 5 },
		backgourdColor: Color.createByAlpha(0.25, Color.YELLOW_GREEN),
	}
	const shapeElementItemId1: string = d2TextElementController.createD2TextElementItem(
		layerItemId,
		new Vector2(-100, 30),
		`
		CreateD2TextElementItem
		`,
		{
			fontFamily: '宋体',
			fontSize: 20,
			strokeColor: Color.RED,
			styleSetting,
		},
		(jsonData: Element2DTextJSONViewData) => {
			console.log(`D2TextShape: ${shapeElementItemId1}: `, jsonData)
		}
	)
	d2TextElementController
		.createD2TextVertexDataItem(
			`
			1. CreateD2TextVertexDataItem
			2. CreateD2TextElementItemByVertexData
			`,
			{
				fontFamily: 'fangsong',
				fontSize: 20,
			}
		)
		.then((d2TextVertexData: D2TextVertexData): void => {
			console.log(`D2TextVertexData: `, d2TextVertexData)
			const shapeElementItemId1: string = d2TextElementController.createD2TextElementItemByVertexData(
				layerItemId,
				d2TextVertexData,
				new Vector2(-50, -50),
				{
					strokeColor: Color.RED,
					styleSetting,
				}
			)
			const jsonData: ElementJSONData = d2ElementController.getD2ElementShapeItemJSONData(shapeElementItemId1)
			console.log(`D2TextShape: ${shapeElementItemId1}: `, jsonData)
		})
}

export async function drawTestTextItemSim(webCanvas: WebCanvas, layerItemId: string): Promise<void> {
	const { d2TextElementController, d2ElementController } = webCanvas
	const fontSize: number = 20
	const lineHeight: number = fontSize + 10
	const styleSetting: Partial<BuildD2TextModelOptionalStyleSettingParam> = {
		padding: { left: 10, top: 10, right: 10, bottom: 10 },
		backgourdColor: Color.createByAlpha(0.25, Color.YELLOW_GREEN),
		lineHeight,
		borderRadius: 5,
	}
	const shapeElementItemId1: string = d2TextElementController.createD2TextElementItem(
		layerItemId,
		new Vector2(-50, 50),
		M_TEST_TXT1,
		{
			fontFamily: 'auto',
			fontSize,
			strokeColor: Color.RED,
			rotation: Angles.degreeToRadian(45),
			styleSetting,
		},
		(jsonData: Element2DTextJSONViewData): void => {
			console.log(`D2TextShape: ${shapeElementItemId1}: `, jsonData)
			// let angle: number = 0
			// const f = (): void => {
			// 	angle += 1
			// 	angle = angle % 360
			// 	d2ElementController.updateD2ElementShapeItemAttrByJSONData(shapeElementItemId1, {
			// 		rotation: Angles.degreeToRadian(angle),
			// 	})
			// 	window.requestAnimationFrame(f)
			// }
			// window.requestAnimationFrame(f)
			d2ElementController.createD2PointElementShapeItem(layerItemId, new Vector2(jsonData.bbox2.minX, jsonData.bbox2.maxY), {
				strokeColor: Color.RED,
				isEnableSelect: false,
			})
			d2ElementController.createD2PointElementShapeItem(layerItemId, new Vector2(jsonData.bbox2.maxX, jsonData.bbox2.maxY), {
				strokeColor: Color.RED,
				isEnableSelect: false,
			})
			d2ElementController.createD2PointElementShapeItem(layerItemId, new Vector2(jsonData.bbox2.maxX, jsonData.bbox2.minY), {
				strokeColor: Color.RED,
				isEnableSelect: false,
			})
			d2ElementController.createD2PointElementShapeItem(layerItemId, new Vector2(jsonData.bbox2.minX, jsonData.bbox2.minY), {
				strokeColor: Color.RED,
				isEnableSelect: false,
			})
			d2ElementController.createD2PointElementShapeItem(layerItemId, Vector2.createByJSONData(jsonData.leftUp), {
				strokeColor: Color.BLUE,
				isEnableSelect: false,
			})
			d2ElementController.createD2PointElementShapeItem(layerItemId, Vector2.createByJSONData(jsonData.rightUp), {
				strokeColor: Color.BLUE,
				isEnableSelect: false,
			})
			d2ElementController.createD2PointElementShapeItem(layerItemId, Vector2.createByJSONData(jsonData.rightDown), {
				strokeColor: Color.BLUE,
				isEnableSelect: false,
			})
			d2ElementController.createD2PointElementShapeItem(layerItemId, Vector2.createByJSONData(jsonData.leftDown), {
				strokeColor: Color.BLUE,
				isEnableSelect: false,
			})
			d2TextElementController.createD2TextElementItem(layerItemId, Vector2.createByJSONData(jsonData.leftUp), 'LeftUp', {
				fontFamily: 'auto',
				fontSize: 10,
				strokeColor: Color.BLUE,
			})
			d2TextElementController.createD2TextElementItem(layerItemId, Vector2.createByJSONData(jsonData.rightUp), 'RightUp', {
				fontFamily: 'auto',
				fontSize: 10,
				strokeColor: Color.BLUE,
			})
			d2TextElementController.createD2TextElementItem(layerItemId, Vector2.createByJSONData(jsonData.rightDown), 'RightDown', {
				fontFamily: 'auto',
				fontSize: 10,
				strokeColor: Color.BLUE,
			})
			d2TextElementController.createD2TextElementItem(layerItemId, Vector2.createByJSONData(jsonData.leftDown), 'LeftDown', {
				fontFamily: 'auto',
				fontSize: 10,
				strokeColor: Color.BLUE,
			})
		}
	)
	d2ElementController.createD2LineElementShapeItem(layerItemId, new Vector2(300, -lineHeight * 0), new Vector2(0, -lineHeight * 0), {
		strokeColor: Color.GOLDEN,
		strokeWidth: 0.5,
	})
	d2ElementController.createD2LineElementShapeItem(layerItemId, new Vector2(300, -lineHeight * 1), new Vector2(0, -lineHeight * 1), {
		strokeColor: Color.GOLDEN,
		strokeWidth: 0.5,
	})
	d2ElementController.createD2LineElementShapeItem(layerItemId, new Vector2(300, -lineHeight * 2), new Vector2(0, -lineHeight * 2), {
		strokeColor: Color.GOLDEN,
		strokeWidth: 0.5,
	})
	d2ElementController.createD2LineElementShapeItem(layerItemId, new Vector2(300, -lineHeight * 3), new Vector2(0, -lineHeight * 3), {
		strokeColor: Color.GOLDEN,
		strokeWidth: 0.5,
	})
	d2ElementController.createD2LineElementShapeItem(layerItemId, new Vector2(300, -lineHeight * 4), new Vector2(0, -lineHeight * 4), {
		strokeColor: Color.GOLDEN,
		strokeWidth: 0.5,
	})
	d2ElementController.createD2LineElementShapeItem(layerItemId, new Vector2(300, -lineHeight * 5), new Vector2(0, -lineHeight * 5), {
		strokeColor: Color.GOLDEN,
		strokeWidth: 0.5,
	})
	d2ElementController.createD2LineElementShapeItem(layerItemId, new Vector2(300, -lineHeight * 6), new Vector2(0, -lineHeight * 6), {
		strokeColor: Color.GOLDEN,
		strokeWidth: 0.5,
	})
}
