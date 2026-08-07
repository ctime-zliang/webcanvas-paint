import { Angles, D2ElementController, Vector2 } from '../../../Main'
import earth01 from '../../public/asserts/earth-01.png'
import { fetchFileByURL, readFileAsImage } from '../../public/utils'

function getTodayProgress(): number {
	const now: Date = new Date()
	const start: Date = new Date(now)
	start.setHours(0, 0, 0, 0)
	const end: Date = new Date(start)
	end.setDate(end.getDate() + 1)
	return (now.getTime() - start.getTime()) / (end.getTime() - start.getTime())
}
export function appendImageElement(d2ElementController: D2ElementController, imageLayerItemId: string, renderSize: number, RUN_PROFILE: Partial<any>): void {
	fetchFileByURL(earth01, 'earth-01.jpg').then((file: File): void => {
		readFileAsImage(file).then((readResult: { imageDataURL: string; fileHashUuid: string; width: number; height: number }): void => {
			const shapeElementItemIdA1: string = d2ElementController.createD2ImageElementItem(
				imageLayerItemId,
				new Vector2(-renderSize * 3.0, -renderSize),
				readResult.fileHashUuid,
				readResult.imageDataURL,
				renderSize,
				renderSize,
				{
					isEnableSelect: false,
				}
			)
			RUN_PROFILE.imageConfig.imageElementItemId = shapeElementItemIdA1
		})
	})
}

export function updateImageElement(d2ElementController: D2ElementController, imageElementItemId: string): void {
	d2ElementController.updateD2ElementShapeItemAttrByJSONData(imageElementItemId, {
		rotation: Angles.degreeToRadian(360 * getTodayProgress() - 120),
	})
}
