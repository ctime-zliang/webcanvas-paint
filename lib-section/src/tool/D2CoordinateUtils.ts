import { Matrix4 } from '../engine/algorithm/geometry/matrix/Matrix4'
import { Vector3 } from '../engine/algorithm/geometry/vector/Vector3'
import { Camera } from '../engine/common/Camera'
import { InsConfig } from '../engine/common/InsConfig'
import { mm2px, px2mm } from '../engine/math/Calculation'
import { TD2PointItem } from '../engine/types/Common'

export class D2CoordinateUtils {
	private _camera: Camera = Camera.getInstance()
	constructor() {
		this._camera = Camera.getInstance()
	}

	/**
	 * 输入:
	 * 		场景物理坐标
	 * 输出:
	 * 		DOM <canvas /> 像素坐标(左上角原点, Y 轴向上为正)
	 * 			也即: 相机可视范围的像素坐标(左上角原点, Y 轴向上为正)
	 */
	public setScenePhysicsPos2CanvasSourceNativePixelPos(scenePhysicsPoint: TD2PointItem): TD2PointItem {
		const scenePxielX: number = mm2px(scenePhysicsPoint[0], InsConfig.DPI[0])
		const scenePxielY: number = mm2px(scenePhysicsPoint[1], InsConfig.DPI[1])
		const M: Matrix4 = this._camera.getLookMatrix4().multiply4(this._camera.getZoomMatrix4())
		const V1: Vector3 = new Vector3(scenePxielX, scenePxielY, 0).multiplyMatrix4(M)
		const VR: Vector3 = this._camera.getCenterSourceNativePixelPosition().add(V1)
		return [VR.x, VR.y]
	}

	/**
	 * 输入:
	 * 		DOM <canvas /> 像素坐标(左上角原点, Y 轴向上为正)
	 * 			也即: 相机可视范围的像素坐标(左上角原点, Y 轴向上为正)
	 * 输出:
	 * 		场景像素坐标
	 */
	public setCanvasSourceNativePixelPos2ScenePixelPos(canvasDomSourceNativePixelPoint: TD2PointItem): TD2PointItem {
		const V1: Vector3 = new Vector3(canvasDomSourceNativePixelPoint[0], canvasDomSourceNativePixelPoint[1], 0).sub(this._camera.getCenterSourceNativePixelPosition())
		const M: Matrix4 = this._camera.getLookMatrix4().multiply4(this._camera.getZoomMatrix4())
		const VR: Vector3 = V1.multiplyMatrix4(M.getInverseMatrix())
		return [VR.x, VR.y]
	}

	/**
	 * 输入:
	 * 		DOM <canvas /> 像素坐标(左上角原点, Y 轴向上为正)
	 * 			也即: 相机可视范围的像素坐标(左上角原点, Y 轴向上为正)
	 * 输出:
	 * 		场景物理坐标
	 */
	public setCanvasSourceNativePixelPos2ScenePhysicsPos(canvasDomSourceNativePixelPoint: TD2PointItem): TD2PointItem {
		const [scenePixelX, scenePixelY] = this.setCanvasSourceNativePixelPos2ScenePixelPos(canvasDomSourceNativePixelPoint)
		const scenePhysicsX: number = px2mm(scenePixelX, InsConfig.DPI[0])
		const scenePhysicsY: number = px2mm(scenePixelY, InsConfig.DPI[0])
		return [scenePhysicsX, scenePhysicsY]
	}

	public quit(): void {
		this._camera = undefined!
	}
}
