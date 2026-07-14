export type T2DCoordinatePositionDot = {
	id: number
	x: number
	y: number
}

/**
 * moveSourceNativePixel
 * 		鼠标原生坐标(像素)
 * 		相对于 <canvas /> 左上角
 *
 * moveScenePixel
 * 		鼠标场景坐标(像素)
 * 		相对于场景原点
 *
 * moveScenePhysics
 * 		鼠标物理坐标(毫米)
 * 		相对于场景原点
 */
export abstract class InputContext {
	private _type: string
	private _keyCode: number
	/* ... */
	private _leftDownSourceNativePixelX: number
	private _leftDownSourceNativePixelY: number
	private _middleDownSourceNativePixelX: number
	private _middleDownSourceNativePixelY: number
	private _rightDownSourceNativePixelX: number
	private _rightDownSourceNativePixelY: number
	/* ... */
	private _moveSourceNativePixelX: number
	private _moveSourceNativePixelY: number
	/* ... */
	private _deltaSourceNativePixelX: number
	private _deltaSourceNativePixelY: number
	/* ... */
	private _leftDownScenePixelX: number
	private _leftDownScenePixelY: number
	private _middleDownScenePixelX: number
	private _middleDownScenePixelY: number
	private _rightDownScenePixelX: number
	private _rightDownScenePixelY: number
	/* ... */
	private _moveScenePixelX: number
	private _moveScenePixelY: number
	/* ... */
	private _leftDownScenePhysicsX: number
	private _leftDownScenePhysicsY: number
	private _middleDownScenePhysicsX: number
	private _middleDownScenePhysicsY: number
	private _rightDownScenePhysicsX: number
	private _rightDownScenePhysicsY: number
	/* ... */
	private _moveScenePhysicsX: number
	private _moveScenePhysicsY: number
	/* ... */
	private _leftDownRealScenePhysicsX: number
	private _leftDownRealScenePhysicsY: number
	private _middleDownRealScenePhysicsX: number
	private _middleDownRealScenePhysicsY: number
	private _rightDownRealScenePhysicsX: number
	private _rightDownRealScenePhysicsY: number
	/* ... */
	private _moveRealScenePhysicsX: number
	private _moveRealScenePhysicsY: number
	/* ... */
	private _shiftKey: boolean
	private _ctrlKey: boolean
	private _altKey: boolean
	private _metaKey: boolean
	/* ... */
	private _rightMouseDown: boolean
	private _middleMouseDown: boolean
	private _leftMouseDown: boolean
	/* ... */
	private _mouseTimeStamp: number
	constructor() {
		this._type = ''
		this._keyCode = -1
		/* ... */
		this._leftDownSourceNativePixelX = 0
		this._leftDownSourceNativePixelY = 0
		this._middleDownSourceNativePixelX = 0
		this._middleDownSourceNativePixelY = 0
		this._rightDownSourceNativePixelX = 0
		this._rightDownSourceNativePixelY = 0
		/* ... */
		this._moveSourceNativePixelX = 0
		this._moveSourceNativePixelY = 0
		/* ... */
		this._deltaSourceNativePixelX = 0
		this._deltaSourceNativePixelY = 0
		/* ... */
		this._leftDownScenePixelX = 0
		this._leftDownScenePixelY = 0
		this._middleDownScenePixelX = 0
		this._middleDownScenePixelY = 0
		this._rightDownScenePixelX = 0
		this._rightDownScenePixelY = 0
		/* ... */
		this._moveScenePixelX = 0
		this._moveScenePixelY = 0
		/* ... */
		this._leftDownScenePhysicsX = 0
		this._leftDownScenePhysicsY = 0
		this._middleDownScenePhysicsX = 0
		this._middleDownScenePhysicsY = 0
		this._rightDownScenePhysicsX = 0
		this._rightDownScenePhysicsY = 0
		/* ... */
		this._moveScenePhysicsX = 0
		this._moveScenePhysicsY = 0
		/* ... */
		this._leftDownRealScenePhysicsX = 0
		this._leftDownRealScenePhysicsY = 0
		this._middleDownRealScenePhysicsX = 0
		this._middleDownRealScenePhysicsY = 0
		this._rightDownRealScenePhysicsX = 0
		this._rightDownRealScenePhysicsY = 0
		/* ... */
		this._moveRealScenePhysicsX = 0
		this._moveRealScenePhysicsY = 0
		/* ... */
		this._shiftKey = false
		this._ctrlKey = false
		this._altKey = false
		this._metaKey = false
		/* ... */
		this._rightMouseDown = false
		this._middleMouseDown = false
		this._leftMouseDown = false
		/* ... */
		this._mouseTimeStamp = 0
	}

	public get type(): string {
		return this._type
	}
	public set type(value: string) {
		this._type = value
	}

	public get keyCode(): number {
		return this._keyCode
	}
	public set keyCode(value: number) {
		this._keyCode = value
	}

	/************************************************************/
	/************************************************************/

	public get leftDownSourceNativePixelX(): number {
		return this._leftDownSourceNativePixelX
	}
	public set leftDownSourceNativePixelX(value: number) {
		this._leftDownSourceNativePixelX = value
	}

	public get leftDownSourceNativePixelY(): number {
		return this._leftDownSourceNativePixelY
	}
	public set leftDownSourceNativePixelY(value: number) {
		this._leftDownSourceNativePixelY = value
	}

	public get middleDownSourceNativePixelX(): number {
		return this._middleDownSourceNativePixelX
	}
	public set middleDownSourceNativePixelX(value: number) {
		this._middleDownSourceNativePixelX = value
	}

	public get middleDownSourceNativePixelY(): number {
		return this._middleDownSourceNativePixelY
	}
	public set middleDownSourceNativePixelY(value: number) {
		this._middleDownSourceNativePixelY = value
	}

	public get rightDownSourceNativePixelX(): number {
		return this._rightDownSourceNativePixelX
	}
	public set rightDownSourceNativePixelX(value: number) {
		this._rightDownSourceNativePixelX = value
	}

	public get rightDownSourceNativePixelY(): number {
		return this._rightDownSourceNativePixelY
	}
	public set rightDownSourceNativePixelY(value: number) {
		this._rightDownSourceNativePixelY = value
	}

	/************************************************************/
	/************************************************************/

	public get moveSourceNativePixelX(): number {
		return this._moveSourceNativePixelX
	}
	public set moveSourceNativePixelX(value: number) {
		this._moveSourceNativePixelX = value
	}

	public get moveSourceNativePixelY(): number {
		return this._moveSourceNativePixelY
	}
	public set moveSourceNativePixelY(value: number) {
		this._moveSourceNativePixelY = value
	}

	/************************************************************/
	/************************************************************/

	public get deltaSourceNativePixelX(): number {
		return this._deltaSourceNativePixelX
	}
	public set deltaSourceNativePixelX(value: number) {
		this._deltaSourceNativePixelX = value
	}

	public get deltaSourceNativePixelY(): number {
		return this._deltaSourceNativePixelY
	}
	public set deltaSourceNativePixelY(value: number) {
		this._deltaSourceNativePixelY = value
	}

	/************************************************************/
	/************************************************************/

	public get leftDownScenePixelX(): number {
		return this._leftDownScenePixelX
	}
	public set leftDownScenePixelX(value: number) {
		this._leftDownScenePixelX = value
	}

	public get leftDownScenePixelY(): number {
		return this._leftDownScenePixelY
	}
	public set leftDownScenePixelY(value: number) {
		this._leftDownScenePixelY = value
	}

	public get middleDownScenePixelX(): number {
		return this._middleDownScenePixelX
	}
	public set middleDownScenePixelX(value: number) {
		this._middleDownScenePixelX = value
	}

	public get middleDownScenePixelY(): number {
		return this._middleDownScenePixelY
	}
	public set middleDownScenePixelY(value: number) {
		this._middleDownScenePixelY = value
	}

	public get rightDownScenePixelX(): number {
		return this._rightDownScenePixelX
	}
	public set rightDownScenePixelX(value: number) {
		this._rightDownScenePixelX = value
	}

	public get rightDownScenePixelY(): number {
		return this._rightDownScenePixelY
	}
	public set rightDownScenePixelY(value: number) {
		this._rightDownScenePixelY = value
	}

	/************************************************************/
	/************************************************************/

	public get moveScenePixelX(): number {
		return this._moveScenePixelX
	}
	public set moveScenePixelX(value: number) {
		this._moveScenePixelX = value
	}

	public get moveScenePixelY(): number {
		return this._moveScenePixelY
	}
	public set moveScenePixelY(value: number) {
		this._moveScenePixelY = value
	}

	/************************************************************/
	/************************************************************/

	public get leftDownScenePhysicsX(): number {
		return this._leftDownScenePhysicsX
	}
	public set leftDownScenePhysicsX(value: number) {
		this._leftDownScenePhysicsX = value
	}

	public get leftDownScenePhysicsY(): number {
		return this._leftDownScenePhysicsY
	}
	public set leftDownScenePhysicsY(value: number) {
		this._leftDownScenePhysicsY = value
	}

	public get middleDownScenePhysicsX(): number {
		return this._middleDownScenePhysicsX
	}
	public set middleDownScenePhysicsX(value: number) {
		this._middleDownScenePhysicsX = value
	}

	public get middleDownScenePhysicsY(): number {
		return this._middleDownScenePhysicsY
	}
	public set middleDownScenePhysicsY(value: number) {
		this._middleDownScenePhysicsY = value
	}

	public get rightDownScenePhysicsX(): number {
		return this._rightDownScenePhysicsX
	}
	public set rightDownScenePhysicsX(value: number) {
		this._rightDownScenePhysicsX = value
	}

	public get rightDownScenePhysicsY(): number {
		return this._rightDownScenePhysicsY
	}
	public set rightDownScenePhysicsY(value: number) {
		this._rightDownScenePhysicsY = value
	}

	/************************************************************/
	/************************************************************/

	public get moveScenePhysicsX(): number {
		return this._moveScenePhysicsX
	}
	public set moveScenePhysicsX(value: number) {
		this._moveScenePhysicsX = value
	}

	public get moveScenePhysicsY(): number {
		return this._moveScenePhysicsY
	}
	public set moveScenePhysicsY(value: number) {
		this._moveScenePhysicsY = value
	}

	/************************************************************/
	/************************************************************/

	public get leftDownRealScenePhysicsX(): number {
		return this._leftDownRealScenePhysicsX
	}
	public set leftDownRealScenePhysicsX(value: number) {
		this._leftDownRealScenePhysicsX = value
	}

	public get leftDownRealScenePhysicsY(): number {
		return this._leftDownRealScenePhysicsY
	}
	public set leftDownRealScenePhysicsY(value: number) {
		this._leftDownRealScenePhysicsY = value
	}

	public get middleDownRealScenePhysicsX(): number {
		return this._middleDownRealScenePhysicsX
	}
	public set middleDownRealScenePhysicsX(value: number) {
		this._middleDownRealScenePhysicsX = value
	}

	public get middleDownRealScenePhysicsY(): number {
		return this._middleDownRealScenePhysicsY
	}
	public set middleDownRealScenePhysicsY(value: number) {
		this._middleDownRealScenePhysicsY = value
	}

	public get rightDownRealScenePhysicsX(): number {
		return this._rightDownRealScenePhysicsX
	}
	public set rightDownRealScenePhysicsX(value: number) {
		this._rightDownRealScenePhysicsX = value
	}

	public get rightDownRealScenePhysicsY(): number {
		return this._rightDownRealScenePhysicsY
	}
	public set rightDownRealScenePhysicsY(value: number) {
		this._rightDownRealScenePhysicsY = value
	}

	/************************************************************/
	/************************************************************/

	public get moveRealScenePhysicsX(): number {
		return this._moveRealScenePhysicsX
	}
	public set moveRealScenePhysicsX(value: number) {
		this._moveRealScenePhysicsX = value
	}

	public get moveRealScenePhysicsY(): number {
		return this._moveRealScenePhysicsY
	}
	public set moveRealScenePhysicsY(value: number) {
		this._moveRealScenePhysicsY = value
	}

	/************************************************************/
	/************************************************************/

	public get shiftKey(): boolean {
		return this._shiftKey
	}
	public set shiftKey(value: boolean) {
		this._shiftKey = value
	}

	public get ctrlKey(): boolean {
		return this._ctrlKey
	}
	public set ctrlKey(value: boolean) {
		this._ctrlKey = value
	}

	public get altKey(): boolean {
		return this._altKey
	}
	public set altKey(value: boolean) {
		this._altKey = value
	}

	public get metaKey(): boolean {
		return this._metaKey
	}
	public set metaKey(value: boolean) {
		this._metaKey = value
	}

	/************************************************************/
	/************************************************************/

	public get rightMouseDown(): boolean {
		return this._rightMouseDown
	}
	public set rightMouseDown(value: boolean) {
		this._rightMouseDown = value
	}

	public get middleMouseDown(): boolean {
		return this._middleMouseDown
	}
	public set middleMouseDown(value: boolean) {
		this._middleMouseDown = value
	}

	public get leftMouseDown(): boolean {
		return this._leftMouseDown
	}
	public set leftMouseDown(value: boolean) {
		this._leftMouseDown = value
	}

	/************************************************************/
	/************************************************************/

	public get mouseTimeStamp(): number {
		return this._mouseTimeStamp
	}
	public set mouseTimeStamp(value: number) {
		this._mouseTimeStamp = value
	}
}

export class InputInfo extends InputContext {
	private _pointer: Array<T2DCoordinatePositionDot>
	constructor() {
		super()
		this._pointer = []
	}

	public get pointer(): Array<T2DCoordinatePositionDot> {
		return this._pointer
	}
	public set pointer(value: Array<T2DCoordinatePositionDot>) {
		this._pointer = value
	}

	public toJSON(): any {
		const data: any = {
			type: this.type,
			keyCode: this.keyCode,
			/* ... */
			leftDownSourceNativePixelX: this.leftDownSourceNativePixelX,
			leftDownSourceNativePixelY: this.leftDownSourceNativePixelY,
			middleDownSourceNativePixelX: this.middleDownSourceNativePixelX,
			middleDownSourceNativePixelY: this.middleDownSourceNativePixelY,
			rightDownSourceNativePixelX: this.rightDownSourceNativePixelX,
			rightDownSourceNativePixelY: this.rightDownSourceNativePixelY,
			/* ... */
			moveSourceNativePixelX: this.moveSourceNativePixelX,
			moveSourceNativePixelY: this.moveSourceNativePixelY,
			/* ... */
			deltaSourceNativePixelX: this.deltaSourceNativePixelX,
			deltaSourceNativePixelY: this.deltaSourceNativePixelY,
			/* ... */
			leftDownScenePixelX: this.leftDownScenePixelX,
			leftDownScenePixelY: this.leftDownScenePixelY,
			middleDownScenePixelX: this.middleDownScenePixelX,
			middleDownScenePixelY: this.middleDownScenePixelY,
			rightDownScenePixelX: this.rightDownScenePixelX,
			rightDownScenePixelY: this.rightDownScenePixelY,
			/* ... */
			moveScenePixelX: this.moveScenePixelX,
			moveScenePixelY: this.moveScenePixelY,
			/* ... */
			leftDownScenePhysicsX: this.leftDownScenePhysicsX,
			leftDownScenePhysicsY: this.leftDownScenePhysicsY,
			middleDownScenePhysicsX: this.middleDownScenePhysicsX,
			middleDownScenePhysicsY: this.middleDownScenePhysicsY,
			rightDownScenePhysicsX: this.rightDownScenePhysicsX,
			rightDownScenePhysicsY: this.rightDownScenePhysicsY,
			/* ... */
			moveScenePhysicsX: this.moveScenePhysicsX,
			moveScenePhysicsY: this.moveScenePhysicsY,
			/* ... */
			leftDownRealScenePhysicsX: this.leftDownRealScenePhysicsX,
			leftDownRealScenePhysicsY: this.leftDownRealScenePhysicsY,
			middleDownRealScenePhysicsX: this.middleDownRealScenePhysicsX,
			middleDownRealScenePhysicsY: this.middleDownRealScenePhysicsY,
			rightDownRealScenePhysicsX: this.rightDownRealScenePhysicsX,
			rightDownRealScenePhysicsY: this.rightDownRealScenePhysicsY,
			/* ... */
			moveRealScenePhysicsX: this.moveRealScenePhysicsX,
			moveRealScenePhysicsY: this.moveRealScenePhysicsY,
			/* ... */
			shiftKey: this.shiftKey,
			ctrlKey: this.ctrlKey,
			altKey: this.altKey,
			metaKey: this.metaKey,
			rightMouseDown: this.rightMouseDown,
			middleMouseDown: this.middleMouseDown,
			leftMouseDown: this.leftMouseDown,
			mouseTimeStamp: this.mouseTimeStamp,
		}
		return data
	}
}
