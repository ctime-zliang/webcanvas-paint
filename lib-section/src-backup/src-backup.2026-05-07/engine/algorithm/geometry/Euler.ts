import { Matrix4 } from './matrix/Matrix4'

export enum EEulerOrder {
	XYZ = 'XYZ',
	YXZ = 'YXZ',
	ZXY = 'ZXY',
	ZYX = 'ZYX',
	YZX = 'YZX',
	XZY = 'XZY',
}

export class Euler {
	public static initEuler(): Euler {
		return new Euler()
	}

	public static setFromRotationMatrix(matrix4: Matrix4, order: EEulerOrder): Euler {
		const euler: Euler = new Euler()
		const clamp = (value: number, min: number, max: number): number => {
			return Math.max(min, Math.min(value, max))
		}
		const m11: number = matrix4.data[0]
		const m12: number = matrix4.data[4]
		const m13: number = matrix4.data[8]
		const m21: number = matrix4.data[1]
		const m22: number = matrix4.data[5]
		const m23: number = matrix4.data[9]
		const m31: number = matrix4.data[2]
		const m32: number = matrix4.data[6]
		const m33: number = matrix4.data[10]
		const iOrder: EEulerOrder = order || euler.order
		if (iOrder === EEulerOrder.XYZ) {
			euler.y = Math.asin(clamp(m13, -1, 1))
			if (Math.abs(m13) < 0.99999) {
				euler.x = Math.atan2(-m23, m33)
				euler.z = Math.atan2(-m12, m11)
			} else {
				euler.x = Math.atan2(m32, m22)
				euler.z = 0
			}
		} else if (iOrder === EEulerOrder.YXZ) {
			euler.x = Math.asin(-clamp(m23, -1, 1))
			if (Math.abs(m23) < 0.99999) {
				euler.y = Math.atan2(m13, m33)
				euler.z = Math.atan2(m21, m22)
			} else {
				euler.y = Math.atan2(-m31, m11)
				euler.z = 0
			}
		} else if (iOrder === EEulerOrder.ZXY) {
			euler.x = Math.asin(clamp(m32, -1, 1))
			if (Math.abs(m32) < 0.99999) {
				euler.y = Math.atan2(-m31, m33)
				euler.z = Math.atan2(-m12, m22)
			} else {
				euler.y = 0
				euler.z = Math.atan2(m21, m11)
			}
		} else if (iOrder === EEulerOrder.ZYX) {
			euler.y = Math.asin(-clamp(m31, -1, 1))
			if (Math.abs(m31) < 0.99999) {
				euler.x = Math.atan2(m32, m33)
				euler.z = Math.atan2(m21, m11)
			} else {
				euler.x = 0
				euler.z = Math.atan2(-m12, m22)
			}
		} else if (iOrder === EEulerOrder.YZX) {
			euler.z = Math.asin(clamp(m21, -1, 1))
			if (Math.abs(m21) < 0.99999) {
				euler.x = Math.atan2(-m23, m22)
				euler.y = Math.atan2(-m31, m11)
			} else {
				euler.x = 0
				euler.y = Math.atan2(m13, m33)
			}
		} else if (iOrder === EEulerOrder.XZY) {
			euler.z = Math.asin(-clamp(m12, -1, 1))
			if (Math.abs(m12) < 0.99999) {
				euler.x = Math.atan2(m32, m22)
				euler.y = Math.atan2(m13, m11)
			} else {
				euler.x = Math.atan2(-m23, m33)
				euler.y = 0
			}
		} else {
			console.warn('[Euler] unsupported order: ' + iOrder)
		}
		euler.order = iOrder
		return euler
	}

	private _x: number
	private _y: number
	private _z: number
	private _order: EEulerOrder
	constructor(x: number = 0, y: number = 0, z: number = 0, order: EEulerOrder = EEulerOrder.XYZ) {
		this._x = x
		this._y = y
		this._z = z
		this._order = order
	}

	public get x(): number {
		return this._x
	}
	public set x(value: number) {
		this._x = value
	}

	public get y(): number {
		return this._y
	}
	public set y(value: number) {
		this._y = value
	}

	public get z(): number {
		return this._z
	}
	public set z(value: number) {
		this._z = value
	}

	public get order(): EEulerOrder {
		return this._order
	}
	public set order(value: EEulerOrder) {
		this._order = value
	}

	public resetBy(euler: Euler): void {
		this.x = euler.x
		this.y = euler.y
		this.z = euler.z
		this.order = euler.order
	}

	public toString(): string {
		return `Euler(${this.x}, ${this.y}, ${this.z}, ${this.order})`
	}
}
