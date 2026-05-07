import { Color, D2POINT_SHAPE, nextFrameTick, Vector2, Vector3, WebCanvas } from '../../../Main'

export function coordinateTest01(webCanvas: WebCanvas, layerItemId: string): void {
	const { d2ElementController } = webCanvas
	nextFrameTick((): void => {
		/**
		 * 在屏幕指定像素位置生成图元
		 */
		const [px0, py0] = [150, -150]
		console.log(`原始像素坐标(pixel): ${[px0, py0]}`)
		const [sx, sy] = webCanvas.setCanvasSourceNativePixelPos2ScenePhysicsPos([px0, py0])
		console.log(`换算物理坐标(mm): ${[sx, sy]}`)
		d2ElementController.createD2PointElementShapeItem(layerItemId, new Vector2(sx, sy), {
			size: 5,
			shape: D2POINT_SHAPE.DOT,
			strokeColor: Color.YELLOW_GREEN,
			isEnableSelect: true,
			isEnableScale: true,
		})
		const [px, py] = webCanvas.setScenePhysicsPos2CanvasSourceNativePixelPos([sx, sy])
		console.log(`还原像素坐标(pixel): ${[px, py]}`)
	}, 1250)
}

export function coordinateTest02(webCanvas: WebCanvas, layerItemId: string): void {
	const { d2ElementController } = webCanvas
	nextFrameTick((): void => {
		const [px0, py0] = [850, -550]
		const [sx, sy] = webCanvas.setCanvasSourceNativePixelPos2ScenePhysicsPos([px0, py0])
		d2ElementController.createD2PointElementShapeItem(layerItemId, new Vector2(sx, sy), {
			size: 5,
			strokeColor: Color.YELLOW_GREEN,
			isEnableScale: true,
		})
		webCanvas.setCanvasZoomRatioByCanvasSourceNativePixelPos(5, new Vector2(px0, py0))
		nextFrameTick((): void => {
			webCanvas.setCanvasZoomRatioByScenePhysicsPos(1, new Vector2(sx, sy))
		}, 750)
	}, 750)
}

export function coordinateTest03(webCanvas: WebCanvas, layerItemId: string): void {
	const { d2ElementController } = webCanvas
	nextFrameTick((): void => {
		const [px0, py0] = [850, -550]
		webCanvas.setCameraCenterByCanvasSourceNativePixelPos(Vector3.createByArray([px0, py0]))
		nextFrameTick((): void => {
			webCanvas.setCameraCenterByScenePhysicsPos(Vector3.ORIGIN)
		}, 750)
	}, 750)
}
