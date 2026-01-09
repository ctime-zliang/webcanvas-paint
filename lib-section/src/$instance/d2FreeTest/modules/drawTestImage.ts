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

async function fetchFileByURL(imageUrl: string, fileName: string = 'image.jpg'): Promise<File> {
	try {
		const response: any = await window.fetch(imageUrl)
		const blob: Blob = await response.blob()
		const file: File = new File([blob], fileName, {
			type: blob.type || 'image/jpeg',
			lastModified: Date.now(),
		})
		return file
	} catch (error) {
		return null!
	}
}

async function readFileAsImage(file: File): Promise<{
	imageDataURL: string
	fileHashUuid: string
	width: number
	height: number
}> {
	return new Promise((resolve, reject): void => {
		const fileReader: FileReader = new FileReader()
		fileReader.onload = function (e: ProgressEvent<FileReader>): void {
			const imageDataURL: string = e.target?.result as string
			const image: HTMLImageElement = new Image()
			image.crossOrigin = 'anonymous'
			image.onload = function (e: Event): void {
				resolve({
					imageDataURL,
					fileHashUuid: getHashIden(),
					width: image.width,
					height: image.height,
				})
			}
			image.onerror = function (e: string | Event): void {}
			image.src = imageDataURL
		}
		fileReader.onerror = function (e: string | Event): void {}
		fileReader.readAsDataURL(file)
	})
}

export async function drawTestImage(webCanvas: WebCanvas, layerItemId: string): Promise<void> {
	const file: File = await fetchFileByURL('https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg', 'test-image-1.jpg')
	const readResult: {
		imageDataURL: string
		fileHashUuid: string
		width: number
		height: number
	} = await readFileAsImage(file)
	console.log(readResult)
	const { d2ElementController, operationController } = webCanvas
	const drawLayerController = webCanvas.drawLayerController
	const defaultLayerItemId: string = layerItemId
	/* ... */
	const shapeElementItemIdA1: string = d2ElementController.createD2ImageElementItem(
		defaultLayerItemId,
		new Vector2(-150, 70),
		readResult.fileHashUuid,
		readResult.imageDataURL,
		readResult.width * 0.08,
		readResult.height * 0.08
	)
	d2ElementController.updateD2ElementShapeItemByJSONData(shapeElementItemIdA1, {
		isFlipX: false,
		isFlipY: false,
		rotation: Angles.degreeToRadian(0),
	})
	const shapeElementItemIdA2: string = d2ElementController.createD2ImageElementItem(
		defaultLayerItemId,
		new Vector2(-50, 70),
		readResult.fileHashUuid,
		readResult.imageDataURL,
		readResult.width * 0.08,
		readResult.height * 0.08
	)
	d2ElementController.updateD2ElementShapeItemByJSONData(shapeElementItemIdA2, {
		isFlipX: false,
		isFlipY: false,
		rotation: Angles.degreeToRadian(30),
	})
	const shapeElementItemIdA3: string = d2ElementController.createD2ImageElementItem(
		defaultLayerItemId,
		new Vector2(50, 70),
		readResult.fileHashUuid,
		readResult.imageDataURL,
		readResult.width * 0.08,
		readResult.height * 0.08
	)
	d2ElementController.updateD2ElementShapeItemByJSONData(shapeElementItemIdA3, {
		isFlipX: false,
		isFlipY: false,
		rotation: Angles.degreeToRadian(90),
	})
	const shapeElementItemIdA4: string = d2ElementController.createD2ImageElementItem(
		defaultLayerItemId,
		new Vector2(150, 70),
		readResult.fileHashUuid,
		readResult.imageDataURL,
		readResult.width * 0.08,
		readResult.height * 0.08
	)
	d2ElementController.updateD2ElementShapeItemByJSONData(shapeElementItemIdA4, {
		isFlipX: false,
		isFlipY: false,
		rotation: Angles.degreeToRadian(120),
	})
	const shapeElementItemIdB1: string = d2ElementController.createD2ImageElementItem(
		defaultLayerItemId,
		new Vector2(-150, -70),
		readResult.fileHashUuid,
		readResult.imageDataURL,
		readResult.width * 0.08,
		readResult.height * 0.08
	)
	d2ElementController.updateD2ElementShapeItemByJSONData(shapeElementItemIdB1, {
		isFlipX: true,
		isFlipY: true,
		rotation: Angles.degreeToRadian(0),
	})
	const shapeElementItemIdB2: string = d2ElementController.createD2ImageElementItem(
		defaultLayerItemId,
		new Vector2(-50, -70),
		readResult.fileHashUuid,
		readResult.imageDataURL,
		readResult.width * 0.08,
		readResult.height * 0.08
	)
	d2ElementController.updateD2ElementShapeItemByJSONData(shapeElementItemIdB2, {
		isFlipX: true,
		isFlipY: true,
		rotation: Angles.degreeToRadian(30),
	})
	const shapeElementItemIdB3: string = d2ElementController.createD2ImageElementItem(
		defaultLayerItemId,
		new Vector2(50, -70),
		readResult.fileHashUuid,
		readResult.imageDataURL,
		readResult.width * 0.08,
		readResult.height * 0.08
	)
	d2ElementController.updateD2ElementShapeItemByJSONData(shapeElementItemIdB3, {
		isFlipX: true,
		isFlipY: true,
		rotation: Angles.degreeToRadian(90),
	})
	const shapeElementItemIdB4: string = d2ElementController.createD2ImageElementItem(
		defaultLayerItemId,
		new Vector2(150, -70),
		readResult.fileHashUuid,
		readResult.imageDataURL,
		readResult.width * 0.08,
		readResult.height * 0.08
	)
	d2ElementController.updateD2ElementShapeItemByJSONData(shapeElementItemIdB4, {
		isFlipX: true,
		isFlipY: true,
		rotation: Angles.degreeToRadian(120),
	})
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
		// 	d2ElementController.updateD2ElementShapeItemByJSONData(shapeElementItemId1, { rotation: Angles.degreeToRadian(degree), isFlipX: isFlipX })
		// 	degree += degreeStep
		// 	isFlipX = !isFlipX
		// }, 100)
	}, 500)
}
