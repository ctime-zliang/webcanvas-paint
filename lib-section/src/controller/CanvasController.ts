import { EDrawD2ToolCommand, EFrameCommand } from '../config/CommandEnum'
import { MAX_ZOOM_RATIO, MIN_ZOOM_RATIO } from '../config/Config'
import { Camera } from '../engine/common/Camera'
import { Vector3 } from '../engine/algorithm/geometry/vector/Vector3'
import { TDrawLayerItemResult } from '../types/Common'
import { BaseInterface } from './BaseInterface'
import { Constant } from '../Constant'

export class CanvasController extends BaseInterface {
	private _camera: Camera
	constructor() {
		super()
		this._camera = Camera.getInstance()
	}

	/**
	 * 重置画布状态(平移状态/缩放状态)
	 * 		- 获取场景原点 SO 在 <DOM-CANVAS /> 上的原生像素坐标 CO
	 * 		- 获取 CO 相对于 <DOM-CANVAS /> 中心点的原生像素坐标 CCO
	 * 		- 将 CCO 设置为相机中心点
	 * 		- 将相机缩放比例设置为 1
	 */
	public resetCanvasStatus(): void {
		const domCanvasPositionOfSceneOrigin: Vector3 = Vector3.ORIGIN.multiplyMatrix4(
			this._camera.getViewMatrix4().getInverseMatrix()
		).multiplyMatrix4(this._camera.getInverseZoomMatrix4().getInverseMatrix())
		const domCanvasCenterPositionOfSceneOrigin: Vector3 = new Vector3(
			Constant.environment.canvasWidth / 2,
			-Constant.environment.canvasHeight / 2,
			0
		).sub(domCanvasPositionOfSceneOrigin)
		this.setCameraCenterBySourceNativePixelPosition(
			new Vector3(domCanvasCenterPositionOfSceneOrigin.x, domCanvasCenterPositionOfSceneOrigin.y, 0)
		)
		this._camera.setZoomRatio(1)
		Constant.messageTool.messageBus.publish(EFrameCommand.RENDER_FRAME, null)
	}

	/**
	 * 重置画布内容
	 */
	public async resetCanvasContent(): Promise<void> {
		return new Promise((_): void => {
			Constant.messageTool.messageBus.publish(EFrameCommand.SWITCH_DRAW_TOOL, { type: EDrawD2ToolCommand.BLANK_DROP })
			Constant.selectManager.clearAllSelectItems()
			Constant.drawLayerController.clearAllDrawLayersSelectedStatus()
			const allDrawLayers: Array<TDrawLayerItemResult> = Constant.drawLayerController.getAllDrawLayerResults()
			allDrawLayers.forEach((item: TDrawLayerItemResult): void => {
				Constant.drawLayerController.deleteDrawLayerShapeItem(item.layerItemId)
			})
			Constant.historyManager.clear()
			Constant.messageTool.messageBus.publish(EFrameCommand.RENDER_FRAME, { elementPriority: true })
			window.requestAnimationFrame((): void => {
				_()
			})
		})
	}

	/**
	 * 将 <DOM-CANVAS /> 上的原生像素坐标点 P(相对位置为 <DOM-CANVAS /> 左上角) 设置为相机中心点
	 */
	public setCameraCenterBySourceNativePixelPosition(domCanvasSourceNativePixelPosition: Vector3): Vector3 {
		const cameraZoomRatio: number = this._camera.getZoomRatio()
		/**
		 * 当前相机中心点坐标 C0(相对位置为 <DOM-CANVAS /> 左上角)
		 */
		const cameraCenterSourcePixelPosition: Vector3 = this._camera.getCenterSourcePixelPosition()
		/**
		 * 相机中心点的位移向量
		 * 		从 C0(相对位置为 <DOM-CANVAS /> 左上角)到 C1(P, 相对位置为 <DOM-CANVAS /> 左上角)的向量
		 */
		const moveOffsetVector3: Vector3 = domCanvasSourceNativePixelPosition.sub(cameraCenterSourcePixelPosition)
		this._camera.setMoveIncrement(new Vector3(-moveOffsetVector3.x / cameraZoomRatio, -moveOffsetVector3.y / cameraZoomRatio, 0))
		return moveOffsetVector3
	}

	/**
	 * 以 <DOM-CANVAS /> 上的原生像素坐标点 P(相对位置为 <DOM-CANVAS /> 左上角) 为中心缩放视图
	 * 		- 将 P 设置为相机中心
	 * 		- 设置相机缩放比例
	 * 		- 将相机中心还原
	 */
	public setZoomCanvasBySourceNativePixelPosition(ratio: number, domCanvasSourceNativePixelPosition: Vector3): void {
		const moveOffsetVector3: Vector3 = this.setCameraCenterBySourceNativePixelPosition(domCanvasSourceNativePixelPosition)
		const newRatio: number = ratio <= MIN_ZOOM_RATIO ? MIN_ZOOM_RATIO : ratio >= MAX_ZOOM_RATIO ? MAX_ZOOM_RATIO : ratio
		this._camera.setZoomRatio(newRatio)
		const cameraZoomRatio: number = this._camera.getZoomRatio()
		this._camera.setMoveIncrement(
			new Vector3(moveOffsetVector3.x / cameraZoomRatio, moveOffsetVector3.y / cameraZoomRatio, moveOffsetVector3.z / cameraZoomRatio)
		)
		Constant.messageTool.messageBus.publish(EFrameCommand.RENDER_FRAME, null)
	}

	public moveCameraCenterByCanvasPosition(domCanvasSourceNativePixelPosition: Vector3): void {
		const cameraZoomRatio: number = this._camera.getZoomRatio()
		this._camera.setMoveTo(
			new Vector3(
				-(domCanvasSourceNativePixelPosition.x - this._camera.width / 2) / cameraZoomRatio,
				(domCanvasSourceNativePixelPosition.y - this._camera.height / 2) / cameraZoomRatio,
				0
			)
		)
		Constant.messageTool.messageBus.publish(EFrameCommand.RENDER_FRAME, null)
	}

	public quit(): void {
		this._camera = undefined!
	}
}
