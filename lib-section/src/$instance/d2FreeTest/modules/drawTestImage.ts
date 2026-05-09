import {
	Angles,
	Color,
	D2POINT_SHAPE,
	Element2DImageJSONViewData,
	ElementJSONData,
	getHashIden,
	nextFrameTick,
	POINT_EVENT_NAME,
	Vector2,
	WebCanvas,
} from '../../../Main'
import { sleep } from '../utils/sleep'
import image01 from '../../public/asserts/dS0vD9wJ5eT7mR9zO2nB6zR8vI2xJ2.jpg'
import image02 from '../../public/asserts/kA2cK1qT4oT6vX4pW5mC8vK2iT0iD9.png'
import image03 from '../../public/asserts/iN5lA1rY4xY1nM9fQ1fH8gX4lX9nZ2.jpg'
import image04 from '../../public/asserts/aG3yX1mO9eS3nF0wH7qY7dY8yB9pR0.png'
import image05 from '../../public/asserts/eP7eA1sP8bW7aM4sF8wE6lZ6uP9rA8.jpg'
import earth01 from '../../public/asserts/earth-01.png'
import { fetchFileByURL, readFileAsImage } from '../../public/utils'

export async function drawTestImageItemStd(webCanvas: WebCanvas, layerItemId: string): Promise<void> {
	const file: File = await fetchFileByURL(image03, 'test-image-1.jpg')
	const readResult: {
		imageDataURL: string
		fileHashUuid: string
		width: number
		height: number
	} = await readFileAsImage(file)
	const sImageWidth: number = readResult.width * 0.1
	const sImageHeight: number = readResult.height * 0.1
	const { d2ElementController, d2TextElementController } = webCanvas
	const shapeElementItemIdA1: string = d2ElementController.createD2ImageElementItem(
		layerItemId,
		new Vector2(-50, 50),
		readResult.fileHashUuid,
		readResult.imageDataURL,
		sImageWidth,
		sImageHeight,
		{
			isFlipX: true,
			isFlipY: true,
			rotation: Angles.degreeToRadian(150),
			isShowStroke: false,
			strokeWidth: 1,
		}
	)
	const jsonData: Element2DImageJSONViewData = d2ElementController.getD2ElementShapeItemJSONData(shapeElementItemIdA1) as Element2DImageJSONViewData
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

export async function drawTestImageItems(webCanvas: WebCanvas, layerItemId: string): Promise<void> {
	const file: File = await fetchFileByURL(image01, 'test-image-1.jpg')
	const readResult: {
		imageDataURL: string
		fileHashUuid: string
		width: number
		height: number
	} = await readFileAsImage(file)
	const sImageWdith: number = readResult.width * 0.05
	const sImageHeight: number = readResult.height * 0.05
	const { d2ElementController } = webCanvas
	const shapeElementItemIdA1: string = d2ElementController.createD2ImageElementItem(
		layerItemId,
		new Vector2(-150, 70),
		readResult.fileHashUuid,
		readResult.imageDataURL,
		sImageWdith,
		sImageHeight,
		{
			isFlipX: false,
			isFlipY: false,
			rotation: Angles.degreeToRadian(0),
		}
	)
	const shapeElementItemIdA2: string = d2ElementController.createD2ImageElementItem(
		layerItemId,
		new Vector2(-50, 70),
		readResult.fileHashUuid,
		readResult.imageDataURL,
		sImageWdith,
		sImageHeight,
		{
			isFlipX: false,
			isFlipY: false,
			rotation: Angles.degreeToRadian(30),
		}
	)
	const shapeElementItemIdA3: string = d2ElementController.createD2ImageElementItem(
		layerItemId,
		new Vector2(50, 70),
		readResult.fileHashUuid,
		readResult.imageDataURL,
		sImageWdith,
		sImageHeight,
		{
			isFlipX: false,
			isFlipY: false,
			rotation: Angles.degreeToRadian(90),
		}
	)
	const shapeElementItemIdA4: string = d2ElementController.createD2ImageElementItem(
		layerItemId,
		new Vector2(150, 70),
		readResult.fileHashUuid,
		readResult.imageDataURL,
		sImageWdith,
		sImageHeight,
		{
			isFlipX: false,
			isFlipY: false,
			rotation: Angles.degreeToRadian(120),
		}
	)
	const shapeElementItemIdB1: string = d2ElementController.createD2ImageElementItem(
		layerItemId,
		new Vector2(-150, -70),
		readResult.fileHashUuid,
		readResult.imageDataURL,
		sImageWdith,
		sImageHeight,
		{
			isFlipX: true,
			isFlipY: true,
			rotation: Angles.degreeToRadian(0),
		}
	)
	const shapeElementItemIdB2: string = d2ElementController.createD2ImageElementItem(
		layerItemId,
		new Vector2(-50, -70),
		readResult.fileHashUuid,
		readResult.imageDataURL,
		sImageWdith,
		sImageHeight,
		{
			isFlipX: true,
			isFlipY: true,
			rotation: Angles.degreeToRadian(30),
		}
	)
	const shapeElementItemIdB3: string = d2ElementController.createD2ImageElementItem(
		layerItemId,
		new Vector2(50, -70),
		readResult.fileHashUuid,
		readResult.imageDataURL,
		sImageWdith,
		sImageHeight,
		{
			isFlipX: true,
			isFlipY: true,
			rotation: Angles.degreeToRadian(90),
		}
	)
	const shapeElementItemIdB4: string = d2ElementController.createD2ImageElementItem(
		layerItemId,
		new Vector2(150, -70),
		readResult.fileHashUuid,
		readResult.imageDataURL,
		sImageWdith,
		sImageHeight,
		{
			isFlipX: true,
			isFlipY: true,
			rotation: Angles.degreeToRadian(120),
		}
	)
	// const jsonData: Element2DImageJSONViewData = d2ElementController.getD2ElementShapeItemJSONData(shapeElementItemId1) as Element2DImageJSONViewData
	// console.log(jsonData)
	// d2ElementController.bindD2ElementShapeItemEvent(shapeElementItemId1, POINT_EVENT_NAME.POINTER_LEFTDOWN, (event: any): void => {
	// 	const jsonData: Element2DImageJSONViewData = d2ElementController.getD2ElementShapeItemJSONData(
	// 		shapeElementItemId1
	// 	) as Element2DImageJSONViewData
	// 	console.log(jsonData)
	// })
	let degree: number = 0
	let degreeStep: number = 5
	let intervalId: number = null!
	let isFlipX: boolean = false
	let isFlipY: boolean = false
	nextFrameTick(async (): Promise<void> => {
		// intervalId = window.setInterval(async (): Promise<void> => {
		// 	d2ElementController.updateD2ElementShapeItemAttrByJSONData(shapeElementItemId1, { rotation: Angles.degreeToRadian(degree), isFlipX: isFlipX })
		// 	degree += degreeStep
		// 	isFlipX = !isFlipX
		// }, 100)
	}, 500)
}
