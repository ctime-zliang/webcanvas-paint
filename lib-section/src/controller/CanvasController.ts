import { EDrawD2ToolCommand, EFrameCommand } from '../config/CommandEnum'
import { MAX_ZOOM_RATIO, MIN_ZOOM_RATIO } from '../config/Config'
import { Camera } from '../engine/common/Camera'
import { Vector3 } from '../engine/algorithm/geometry/vector/Vector3'
import { TDrawLayerItemResult } from '../types/Common'
import { BaseInterface } from './BaseInterface'
import { Constant } from '../Constant'
import { TD2PointItem } from '../engine/types/Common'

export class CanvasController extends BaseInterface {
	private _camera: Camera
	constructor() {
		super()
		this._camera = Camera.getInstance()
	}

	/**
	 * 重置画布内容
	 */
	public resetCanvasContent(): void {
		Constant.messageTool.messageBus.publish(EFrameCommand.SWITCH_DRAW_TOOL, { type: EDrawD2ToolCommand.BLANK_DROP })
		Constant.selectManager.clearAllSelectItems()
		Constant.drawLayerController.clearAllDrawLayersSelectedStatus()
		const allDrawLayers: Array<TDrawLayerItemResult> = Constant.drawLayerController.getAllDrawLayerResults()
		for (let i: number = 0; i < allDrawLayers.length; i++) {
			Constant.drawLayerController.deleteDrawLayerShapeItem(allDrawLayers[i].layerItemId)
		}
		Constant.historyManager.clear()
		Constant.messageTool.messageBus.publish(EFrameCommand.RENDER_FRAME, { elementPriority: true })
	}

	/**
	 * 重置画布视图状态
	 */
	public resetCanvasStatus(): void {
		this.setCameraCenterByScenePhysicsPos(Vector3.ORIGIN)
		this._camera.setZoomRatio(1)
		Constant.messageTool.messageBus.publish(EFrameCommand.RENDER_FRAME, null)
	}

	/**
	 * 以指定的
	 * 			1. DOM <canvas /> 像素坐标(左上角原点, Y 轴向上为正)
	 * 			2. 场景物理坐标
	 * 		为中心点
	 * 设置画布缩放倍率
	 */
	public setCanvasZoomRatioByCanvasSourceNativePixelPos(ratio: number, canvasDomSourceNativePixelPosition?: Vector3): void {
		if (!canvasDomSourceNativePixelPosition) {
			canvasDomSourceNativePixelPosition = new Vector3(this._camera.width / 2, -this._camera.height / 2, 0)
		}
		const moveOffsetVector3: Vector3 = this.setCameraCenterByCanvasSourceNativePixelPos(canvasDomSourceNativePixelPosition)
		const newRatio: number = ratio <= MIN_ZOOM_RATIO ? MIN_ZOOM_RATIO : ratio >= MAX_ZOOM_RATIO ? MAX_ZOOM_RATIO : ratio
		this._camera.setZoomRatio(newRatio)
		const cameraZoomRatio: number = this._camera.getZoomRatio()
		this._camera.setMoveIncrement(new Vector3(moveOffsetVector3.x / cameraZoomRatio, moveOffsetVector3.y / cameraZoomRatio, moveOffsetVector3.z / cameraZoomRatio))
		Constant.messageTool.messageBus.publish(EFrameCommand.RENDER_FRAME, null)
	}
	public setCanvasZoomRatioByScenePhysicsPos(ratio: number, scenePhysicsPosition?: Vector3): void {
		if (!scenePhysicsPosition) {
			scenePhysicsPosition = Vector3.ORIGIN
		}
		const d2R: TD2PointItem = Constant.d2CoordinateUtils.setScenePhysicsPos2CanvasSourceNativePixelPos(scenePhysicsPosition.toArray() as TD2PointItem)
		this.setCanvasZoomRatioByCanvasSourceNativePixelPos(ratio, Vector3.createByArray(d2R))
	}

	/**
	 * 将指定的
	 * 			1. DOM <canvas /> 像素坐标(左上角原点, Y 轴向上为正)
	 * 			2. 场景物理坐标
	 * 		设置为
	 * 相机中心点
	 */
	public setCameraCenterByCanvasSourceNativePixelPos(canvasDomSourceNativePixelPosition: Vector3): Vector3 {
		const cameraZoomRatio: number = this._camera.getZoomRatio()
		const cameraCenterSourceNativePixelPosition: Vector3 = this._camera.getCenterSourceNativePixelPosition()
		const moveOffsetVector3: Vector3 = canvasDomSourceNativePixelPosition.sub(cameraCenterSourceNativePixelPosition)
		this._camera.setMoveIncrement(new Vector3(-moveOffsetVector3.x / cameraZoomRatio, -moveOffsetVector3.y / cameraZoomRatio, 0))
		return moveOffsetVector3
	}
	public setCameraCenterByScenePhysicsPos(scenePhysicsPosition: Vector3): Vector3 {
		const d2R: TD2PointItem = Constant.d2CoordinateUtils.setScenePhysicsPos2CanvasSourceNativePixelPos(scenePhysicsPosition.toArray() as TD2PointItem)
		return this.setCameraCenterByCanvasSourceNativePixelPos(Vector3.createByArray(d2R))
	}

	public moveCameraCenterByCanvasPosition(canvasDomSourceNativePixelPosition: Vector3): void {
		const cameraZoomRatio: number = this._camera.getZoomRatio()
		this._camera.setMoveTo(new Vector3(-(canvasDomSourceNativePixelPosition.x - this._camera.width / 2) / cameraZoomRatio, (canvasDomSourceNativePixelPosition.y - this._camera.height / 2) / cameraZoomRatio, 0))
		Constant.messageTool.messageBus.publish(EFrameCommand.RENDER_FRAME, null)
	}

	public quit(): void {
		this._camera = undefined!
	}
}
