import { CanvasMatrix4 } from '../algorithm/geometry/matrix/CanvasMatrix4'
import { Matrix4 } from '../algorithm/geometry/matrix/Matrix4'
import { Vector3 } from '../algorithm/geometry/vector/Vector3'

export enum EProjectionType {
	/**
	 * 正射投影
	 */
	ORTH = 'ORHT',
	/**
	 * 透视投影
	 */
	PERS = 'PERS',
}

export type TOrthoProjection = {
	left: number
	right: number
	bottom: number
	top: number
	near: number
	far: number
}

export type TPersProjection = {
	fovy: number
	aspect: number
	near: number
	far: number
}

/**
 * 相机的主要作用就是将世界坐标系里的坐标映射转换到屏幕坐标系
 * 		世界坐标 -> [相机: GetViewMatrix4] -> WebGL 坐标系
 */
export class Camera {
	private static instance: Camera
	public static getInstance(): Camera {
		if (Camera.instance === undefined) {
			Camera.instance = new Camera(1920, 1080)
		}
		return Camera.instance
	}

	private _width: number
	private _height: number
	private _isNeedUpdate: boolean
	private _lookForEyePosition: Vector3
	private _lookForAtPosition: Vector3
	private _projectionType: EProjectionType
	private _orthoProjection: TOrthoProjection
	private _persProjection: TPersProjection
	private _rectProjectionMatrix4: Matrix4
	private _viewMatrix4: Matrix4
	private _scaleRatio: number
	constructor(width: number = 1920, height: number = 1080) {
		this._width = width
		this._height = height
		this._isNeedUpdate = false
		this._lookForEyePosition = new Vector3(0, 0, 0.1)
		this._lookForAtPosition = new Vector3(0, 0, 0)
		this._projectionType = null!
		/**
		 * 正射投影初始参数
		 */
		this._orthoProjection = {
			left: -1,
			right: 1,
			bottom: -1,
			top: 1,
			near: -100,
			far: 100,
		}
		/**
		 * 透视投影初始参数
		 */
		this._persProjection = {
			fovy: 100,
			aspect: 1,
			near: 1,
			far: 50,
		}
		this._rectProjectionMatrix4 = Matrix4.ORIGIN
		this._viewMatrix4 = Matrix4.ORIGIN
		this._scaleRatio = 1
	}

	public get width(): number {
		return this._width
	}

	public get height(): number {
		return this._height
	}

	public setProjectionType(projectionType: EProjectionType): void {
		if (projectionType !== null) {
			this._projectionType = projectionType
		}
	}

	public updateRect(width: number, height: number): void {
		this._width = width
		this._height = height
		this._isNeedUpdate = true
		this._orthoProjection.left = -width / 2
		this._orthoProjection.right = width / 2
		this._orthoProjection.top = height / 2
		this._orthoProjection.bottom = -height / 2
	}

	getCenterSourcePixelPosition(): Vector3 {
		return new Vector3(this.width / 2, -this.height / 2, 0)
	}

	public getZoomRatio(): number {
		if (this._projectionType === EProjectionType.ORTH) {
			return this._scaleRatio
		}
		return Math.sqrt(this._viewMatrix4.data[0] * this._viewMatrix4.data[0] + this._viewMatrix4.data[1] * this._viewMatrix4.data[1])
	}

	public getZoomMatrix4(): Matrix4 {
		const scale: number = this.getZoomRatio()
		return CanvasMatrix4.setScaleByValue(scale, scale, scale)
	}

	public getInverseZoomMatrix4(): Matrix4 {
		const scale: number = this.getZoomRatio()
		return CanvasMatrix4.setScaleByValue(1 / scale, 1 / scale, 1 / scale)
	}

	public setZoomRatio(value: number): void {
		if (this._projectionType === EProjectionType.ORTH) {
			this._scaleRatio = value
		}
		this._isNeedUpdate = true
	}

	public setMoveIncrement(vector3: Vector3): void {
		this._lookForEyePosition.x -= vector3.x
		this._lookForEyePosition.y -= vector3.y
		this._lookForAtPosition.x -= vector3.x
		this._lookForAtPosition.y -= vector3.y
		this._isNeedUpdate = true
	}

	public setMoveTo(vector3: Vector3): void {
		this._lookForEyePosition.x = -vector3.x
		this._lookForEyePosition.y = -vector3.y
		this._lookForAtPosition.x = -vector3.x
		this._lookForAtPosition.y = -vector3.y
		this._isNeedUpdate = true
	}

	/**
	 * 获取视线矩阵
	 */
	public getLookMatrix4(): Matrix4 {
		return CanvasMatrix4.setLookAt(
			new Vector3(this._lookForEyePosition.x, this._lookForEyePosition.y, this._lookForEyePosition.z),
			new Vector3(this._lookForAtPosition.x, this._lookForAtPosition.y, this._lookForAtPosition.z),
			new Vector3(0, 1, 0)
		)
	}

	/**
	 * 获取透视矩阵
	 */
	public getProjectionMatrix4(): Matrix4 {
		let projectionMatrix4: Matrix4 = null!
		if (this._projectionType === EProjectionType.ORTH) {
			projectionMatrix4 = this.getRectProjectionMatrix4()
			const scaleMatrix4: Matrix4 = CanvasMatrix4.setScaleByValue(this._scaleRatio, this._scaleRatio, this._scaleRatio)
			projectionMatrix4 = projectionMatrix4.multiply4(scaleMatrix4)
		} else {
			projectionMatrix4 = CanvasMatrix4.setPerspective(
				this._persProjection.fovy,
				this._persProjection.aspect,
				this._persProjection.near,
				this._persProjection.far
			)
		}
		return projectionMatrix4
	}

	/**
	 * 获取变换矩阵
	 */
	public getViewMatrix4(prevUpdate: boolean = false): Matrix4 {
		if (prevUpdate) {
			this._isNeedUpdate = true
			this.updateViewMatrix4()
		}
		return this._viewMatrix4
	}

	/**
	 * 获取 Canvas 透视矩阵
	 */
	public getRectProjectionMatrix4(): Matrix4 {
		return CanvasMatrix4.setOrtho(
			this._orthoProjection.left,
			this._orthoProjection.right,
			this._orthoProjection.bottom,
			this._orthoProjection.top,
			this._orthoProjection.near,
			this._orthoProjection.far
		)
	}

	public quit(): void {
		Camera.instance = undefined!
	}

	private updateViewMatrix4(): void {
		if (this._isNeedUpdate) {
			const lookMatrix4: Matrix4 = this.getLookMatrix4()
			const projectionMatrix4: Matrix4 = this.getProjectionMatrix4()
			this._viewMatrix4 = lookMatrix4.multiply4(projectionMatrix4)
			this._isNeedUpdate = false
		}
	}
}
