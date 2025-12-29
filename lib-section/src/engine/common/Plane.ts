import { TPlainObject } from '../types/Common'
import { Scene } from './Scene'
import { BaseInterface } from './BaseInterface'

/**
 * 抽象绘制层 基类
 */
export abstract class Plane extends BaseInterface {
	private _planeId: string
	private _scene: Scene
	constructor(planeId: string, sceneInstance: Scene) {
		super()
		this._scene = sceneInstance
		this._planeId = planeId
	}

	protected get scene(): Scene {
		return this._scene
	}

	public get planeId(): string {
		return this._planeId
	}

	public getColorAlpha(): number {
		return 1
	}

	public quit(): void {
		this._scene = undefined!
		this._planeId = undefined!
	}

	public abstract getScene(): Scene

	public abstract deleteD2PointItems(v: Set<string>): void
	public abstract addD2PointItems(v: Map<string, TPlainObject>): void
	public abstract updateD2PointItems(v: Map<string, TPlainObject>): void

	/****************************************************************************************************/

	public abstract deleteD2LineItems(v: Set<string>): void
	public abstract addD2LineItems(v: Map<string, TPlainObject>): void
	public abstract updateD2LineItems(v: Map<string, TPlainObject>): void

	/****************************************************************************************************/

	public abstract deleteD2CircleItems(v: Set<string>): void
	public abstract addD2CircleItems(v: Map<string, TPlainObject>): void
	public abstract updateD2CircleItems(v: Map<string, TPlainObject>): void

	/****************************************************************************************************/

	public abstract deleteD2ArcItems(v: Set<string>): void
	public abstract addD2ArcItems(v: Map<string, TPlainObject>): void
	public abstract updateD2ArcItems(v: Map<string, TPlainObject>): void

	/****************************************************************************************************/

	public abstract deleteD2TextItems(v: Set<string>): void
	public abstract addD2TextItems(v: Map<string, TPlainObject>): void
	public abstract updateD2TextItems(v: Map<string, TPlainObject>): void

	/****************************************************************************************************/

	public abstract deleteD2ImageItems(v: Set<string>): void
	public abstract addD2ImageItems(v: Map<string, TPlainObject>): void
	public abstract updateD2ImageItems(v: Map<string, TPlainObject>): void

	/****************************************************************************************************/

	public abstract render(...args: Array<any>): void
}
