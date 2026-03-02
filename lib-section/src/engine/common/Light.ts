import { Vector3 } from '../algorithm/geometry/vector/Vector3'
import { BaseInterface } from './BaseInterface'
import { Color } from './Color'

export enum EIluType {
	SPOT = 'SPOT',
	PARA = 'PARA',
}

export class Light extends BaseInterface {
	private static instance: Light
	public static getInstance(): Light {
		if (Light.instance === undefined) {
			Light.instance = new Light()
		}
		return Light.instance
	}

	private _iluType: EIluType
	private _direction: Vector3
	private _position: Vector3
	private _color: Color
	private _ambient: Color
	constructor() {
		super()
		this._iluType = EIluType.PARA
		this._direction = new Vector3(-1.0, -2.0, -3.0)
		this._position = new Vector3(0, 0, 0)
		this._color = Color.WHITE
		this._ambient = Color.WHITE
	}

	public get iluType(): EIluType {
		return this._iluType
	}
	public set iluType(value: EIluType) {
		this._iluType = value
	}

	public get direction(): Vector3 {
		return this._direction
	}
	public set direction(value: Vector3) {
		this._direction = value
	}

	public get position(): Vector3 {
		return this._position
	}
	public set position(value: Vector3) {
		this._position = value
	}

	public get color(): Color {
		return this._color
	}
	public set color(value: Color) {
		this._color = value
	}

	public get ambient(): Color {
		return this._ambient
	}
	public set ambient(value: Color) {
		this._ambient = value
	}

	public quit(): void {
		Light.instance = undefined!
	}
}
