import { ED2ElementType } from '../../../config/D2ElementProfile'
import { InputInfo } from '../../InputInfo'
import { D2LineShapeSelectionTool } from './D2LineShapeSelectionTool'
import { BaseSelectionTool } from '../BaseSelectionTool'
import { D2CircleShapeSelectionTool } from './D2CircleShapeSelectionTool'
import { MoveOperSelectionTool } from './MoveOperSelectionTool'
import { TAllElementShapeType } from '../../../types/Element'
import { ElementShapeItemBase } from '../../../objects/shapes/primitive2d/elementBase/ElementShapeItemBase'
import { D2LineShape } from '../../../objects/shapes/primitive2d/D2LineShape'
import { D2CircleShape } from '../../../objects/shapes/primitive2d/D2CircleShape'
import { D2ArcShape } from '../../../objects/shapes/primitive2d/D2ArcShape'
import { D2ArcShapeSelectionTool } from './D2ArcShapeSelectionTool'
import { D2TextShapeSelectionTool } from './D2TextShapeSelectionTool'
import { D2TextShape } from '../../../objects/shapes/primitive2d/D2TextShape'
import { D2ImageShapeSelectionTool } from './D2ImageShapeSelectionTool'
import { D2ImageShape } from '../../../objects/shapes/primitive2d/D2ImageShape'
import { D2PointShapeSelectionTool } from './D2PointShapeSelectionTool'
import { D2PointShape } from '../../../objects/shapes/primitive2d/D2PointShape'
import { D2RectShapeSelectionTool } from './D2RectShapeSelectionTool'
import { D2RectShape } from '../../../objects/shapes/primitive2d/D2RectShape'
import { Constant } from '../../../Constant'

export class HandlerControl {
	private _processor: BaseSelectionTool
	constructor() {
		this._processor = null!
	}

	public mouseLeftDownSelect(inputInfo: InputInfo): TAllElementShapeType {
		if (!this.hasProcessor()) {
			return null!
		}
		return this._processor.mouseLeftDownSelect(inputInfo)
	}

	public hasProcessor(): boolean {
		return this._processor !== null
	}

	public clearProcessor(): void {
		if (this._processor) {
			this._processor.clear()
		}
		this._processor = null!
	}

	public updateProcessor(inputInfo: InputInfo, clickSelect: TAllElementShapeType): void {
		const selectedItems: Array<ElementShapeItemBase> = Constant.selectManager.getAllItems()
		if (selectedItems.length <= 0 && !clickSelect) {
			this.clearProcessor()
			return
		}
		if (this._processor) {
			this._processor.mouseLeftDownHandler(inputInfo)
			return
		}
		if (selectedItems.length >= 2) {
			this._processor = new MoveOperSelectionTool()
			this._processor.mouseLeftDownHandler(inputInfo)
			return
		}
		const selectItem: ElementShapeItemBase = selectedItems[0]
		if (selectItem.getType() === ED2ElementType.D2Line) {
			this._processor = new D2LineShapeSelectionTool(selectItem as D2LineShape)
			this._processor.mouseLeftDownHandler(inputInfo)
			return
		}
		if (selectItem.getType() === ED2ElementType.D2Circle) {
			this._processor = new D2CircleShapeSelectionTool(selectItem as D2CircleShape)
			this._processor.mouseLeftDownHandler(inputInfo)
			return
		}
		if (selectItem.getType() === ED2ElementType.D2Point) {
			this._processor = new D2PointShapeSelectionTool(selectItem as D2PointShape)
			this._processor.mouseLeftDownHandler(inputInfo)
			return
		}
		if (selectItem.getType() === ED2ElementType.D2Arc) {
			this._processor = new D2ArcShapeSelectionTool(selectItem as D2ArcShape)
			this._processor.mouseLeftDownHandler(inputInfo)
			return
		}
		if (selectItem.getType() === ED2ElementType.D2Text) {
			this._processor = new D2TextShapeSelectionTool(selectItem as D2TextShape)
			this._processor.mouseLeftDownHandler(inputInfo)
			return
		}
		if (selectItem.getType() === ED2ElementType.D2Image) {
			this._processor = new D2ImageShapeSelectionTool(selectItem as D2ImageShape)
			this._processor.mouseLeftDownHandler(inputInfo)
			return
		}
		if (selectItem.getType() === ED2ElementType.D2Rect) {
			this._processor = new D2RectShapeSelectionTool(selectItem as D2RectShape)
			this._processor.mouseLeftDownHandler(inputInfo)
			return
		}
	}

	public keyDownHandler(inputInfo: InputInfo): void {
		this._processor && this._processor.keyDownHandler(inputInfo)
	}

	public keyUpHandler(inputInfo: InputInfo): void {
		this._processor && this._processor.keyUpHandler(inputInfo)
	}

	public mouseLeftDownHandler(inputInfo: InputInfo): void {
		this._processor && this._processor.mouseLeftDownHandler(inputInfo)
	}

	public mouseLeftUpHandler(inputInfo: InputInfo): void {
		this._processor && this._processor.mouseLeftUpHandler(inputInfo)
	}

	public mouseMoveHandler(inputInfo: InputInfo): void {
		this._processor && this._processor.mouseMoveHandler(inputInfo)
	}

	public mouseUpMoveHandler(inputInfo: InputInfo): void {
		this._processor && this._processor.mouseUpMoveHandler(inputInfo)
	}
}
