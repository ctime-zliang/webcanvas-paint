import { EDrawLayerCode } from '../config/DrawLayerProfile'
import { D2AssistLineShape, buildD2AssistLineShape } from '../objects/assist/primitive2d/D2AssistLineShape'
import { InputInfo } from '../tool/InputInfo'
import { BaseManager } from '../manager/BaseManage'
import { EFrameCommand } from '../config/CommandEnum'
import { TAllElementShapeType } from '../types/Element'
import { Color } from '../engine/common/Color'
import { BBox2 } from '../engine/algorithm/geometry/bbox/BBox2'
import { ElementShapeItemBase } from '../objects/shapes/primitive2d/elementBase/ElementShapeItemBase'
import { EPointerEventName, EventsManager } from '../manager/EventsManager'
import { Camera } from '../engine/common/Camera'
import { ECanvas2DLineCap } from '../engine/config/PrimitiveProfile'
import { px2mm } from '../engine/math/Calculation'
import { InsConfig } from '../engine/common/InsConfig'
import { Vector2 } from '../engine/algorithm/geometry/vector/Vector2'
import { Constant } from '../Constant'

export class SelectManager extends BaseManager<ElementShapeItemBase> {
	private _camera: Camera
	private _selectionBoxLines: Array<D2AssistLineShape>
	private _isBoxSelection: boolean
	private _leftDownRealScenePhysicsX: number
	private _leftDownRealScenePhysicsY: number
	private _strokeWidth: number
	private _segSize: number
	private _gapSize: number
	constructor() {
		super()
		this._camera = Camera.getInstance()
		this._selectionBoxLines = []
		this._isBoxSelection = false
		this._leftDownRealScenePhysicsX = 0
		this._leftDownRealScenePhysicsY = 0
		this._strokeWidth = px2mm(1, InsConfig.DPI[0])
		this._segSize = 1.0
		this._gapSize = 0.5
		Constant.messageTool.messageBus.subscribe(EFrameCommand.CLEAR_ALL_SELECTS, this.clearAllSelectItems.bind(this))
	}

	public get camera(): Camera {
		return this._camera
	}

	/**
	 * 获取所有被选中的图元
	 */
	public getAllSelectItems(): Array<ElementShapeItemBase> {
		const selects: Array<ElementShapeItemBase> = []
		for (let [key, item] of this.items) {
			selects.push(item)
		}
		return selects
	}

	/**
	 * 清除所有选中图元的记录
	 */
	public clearAllSelectItems(): void {
		this.setSelectStatus(new Set([]))
		Constant.handlerControl.clearProcessor()
	}

	/**
	 * 在所有选中图元记录中删除指定图元 ID 对应的图元
	 */
	public clearSelectItemById(elementItemId: string): void {
		if (this.items.has(elementItemId)) {
			const elementItem: ElementShapeItemBase = this.items.get(elementItemId)!
			this.items.delete(elementItem.elementItemId)
			elementItem.setUnSelect()
			Constant.handlerControl.clearProcessor()
		}
	}

	public keyDownHandler(inputInfo: InputInfo): void {
		Constant.handlerControl.keyDownHandler(inputInfo)
	}

	public keyUpHandler(inputInfo: InputInfo): void {
		Constant.handlerControl.keyUpHandler(inputInfo)
	}

	public mouseLeftDownHandler(inputInfo: InputInfo): void {
		const eventsManager: EventsManager = EventsManager.getInstance()
		this._isBoxSelection = false
		this._leftDownRealScenePhysicsX = inputInfo.leftDownRealScenePhysicsX
		this._leftDownRealScenePhysicsY = inputInfo.leftDownRealScenePhysicsY
		if (Constant.systemConfig.interactive.enableCanvasSelection) {
			const clickSelect: TAllElementShapeType = Constant.handlerControl.mouseLeftDownSelect(inputInfo)
			const selectResults: Set<ElementShapeItemBase> = this.pointSelect(inputInfo)
			if (clickSelect) {
				selectResults.add(clickSelect)
			} else {
				Constant.handlerControl.clearProcessor()
			}
			if (this.items.size <= 0) {
				this.setSelectStatus(selectResults)
			} else {
				let hit: boolean = false
				for (let [key, item] of this.items) {
					if (selectResults.has(item)) {
						hit = true
						break
					}
				}
				if (!hit) {
					this.setSelectStatus(selectResults)
				}
			}
			Constant.handlerControl.updateProcessor(inputInfo, clickSelect)
			for (let elementItem of selectResults) {
				eventsManager.triggerEventHandlers(elementItem.elementItemId, EPointerEventName.POINTER_LEFTDOWN)
			}
		}
	}

	public mouseMiddleDownHandler(inputInfo: InputInfo): void {
		this.destorySelectionBox()
	}

	public mouseRightDownHandler(inputInfo: InputInfo): void {
		this.destorySelectionBox()
	}

	public mouseLeftUpHandler(inputInfo: InputInfo): void {
		this.destorySelectionBox()
		Constant.messageTool.messageBus.publish(EFrameCommand.REFRESH_RTREE, null)
		Constant.handlerControl.mouseLeftUpHandler(inputInfo)
		if (Constant.systemConfig.interactive.enableCanvasSelection) {
			if (this._isBoxSelection) {
				const selectResults: Set<ElementShapeItemBase> = this.boxSelect(inputInfo)
				this.setSelectStatus(selectResults)
			}
		}
		this._leftDownRealScenePhysicsX = -Number.MAX_SAFE_INTEGER
		this._leftDownRealScenePhysicsY = -Number.MAX_SAFE_INTEGER
		Constant.handlerControl.updateProcessor(inputInfo, null!)
	}

	public mouseMoveHandler(inputInfo: InputInfo): void {
		if (inputInfo.leftMouseDown) {
			if (Constant.systemConfig.interactive.enableCanvasSelection) {
				if (this.items.size <= 0) {
					if (!inputInfo.middleMouseDown && !inputInfo.rightMouseDown) {
						this._isBoxSelection = true
						this.updateSelectionBox(inputInfo)
					} else {
						this._isBoxSelection = false
						this.destorySelectionBox()
					}
				} else {
					this._isBoxSelection = false
					this.destorySelectionBox()
					Constant.handlerControl.mouseMoveHandler(inputInfo)
				}
			}
		} else {
			Constant.handlerControl.mouseUpMoveHandler(inputInfo)
		}
	}

	public quit(): void {
		super.quit()
	}

	/**
	 * 获取点选图元集合(已过滤)
	 */
	private pointSelect(inputInfo: InputInfo): Set<ElementShapeItemBase> {
		const sourceResults: Set<ElementShapeItemBase> = Constant.d2FilterController.pointSelectBeforeFilter(
			inputInfo.leftDownRealScenePhysicsX,
			inputInfo.leftDownRealScenePhysicsY
		)
		return sourceResults
	}

	/**
	 * 获取框选图元集合(已过滤)
	 */
	private boxSelect(inputInfo: InputInfo): Set<ElementShapeItemBase> {
		const rangeBBox2: BBox2 = new BBox2(
			this._leftDownRealScenePhysicsX,
			this._leftDownRealScenePhysicsY,
			inputInfo.moveRealScenePhysicsX,
			inputInfo.moveRealScenePhysicsY
		)
		const sourceResults: Set<ElementShapeItemBase> = Constant.d2FilterController.boxSelectBeforeFilter(rangeBBox2)
		return sourceResults
	}

	/**
	 * 设置图元的选中样式
	 * 		添加进选中图元集合
	 * 		设置图元的选中样式
	 */
	private setSelectStatus(selectedItems: Set<ElementShapeItemBase>): void {
		for (let [key, item] of this.items) {
			item.setUnSelect()
		}
		this.items.clear()
		for (let selectedItem of selectedItems) {
			selectedItem.setSelect()
			this.items.set(selectedItem.elementItemId, selectedItem)
		}
	}

	/**
	 * 创建或更新框选辅助虚线框
	 */
	private updateSelectionBox(inputInfo: InputInfo): void {
		if (this._selectionBoxLines.length <= 0) {
			const line1: D2AssistLineShape = buildD2AssistLineShape(
				EDrawLayerCode.MaskLayer,
				new Vector2(inputInfo.leftDownRealScenePhysicsX, inputInfo.leftDownRealScenePhysicsY),
				new Vector2(inputInfo.moveRealScenePhysicsX, inputInfo.leftDownRealScenePhysicsY),
				this._strokeWidth,
				Color.LIGHT_STEE_BLUE,
				1.0,
				false,
				ECanvas2DLineCap.ROUND
			)
			const line2: D2AssistLineShape = buildD2AssistLineShape(
				EDrawLayerCode.MaskLayer,
				new Vector2(inputInfo.moveRealScenePhysicsX, inputInfo.leftDownRealScenePhysicsY),
				new Vector2(inputInfo.moveRealScenePhysicsX, inputInfo.moveRealScenePhysicsY),
				this._strokeWidth,
				Color.LIGHT_STEE_BLUE,
				1.0,
				false,
				ECanvas2DLineCap.ROUND
			)
			const line3: D2AssistLineShape = buildD2AssistLineShape(
				EDrawLayerCode.MaskLayer,
				new Vector2(inputInfo.leftDownRealScenePhysicsX, inputInfo.moveRealScenePhysicsY),
				new Vector2(inputInfo.moveRealScenePhysicsX, inputInfo.moveRealScenePhysicsY),
				this._strokeWidth,
				Color.LIGHT_STEE_BLUE,
				1.0,
				false,
				ECanvas2DLineCap.ROUND
			)
			const line4: D2AssistLineShape = buildD2AssistLineShape(
				EDrawLayerCode.MaskLayer,
				new Vector2(inputInfo.leftDownRealScenePhysicsX, inputInfo.leftDownRealScenePhysicsY),
				new Vector2(inputInfo.leftDownRealScenePhysicsX, inputInfo.moveRealScenePhysicsY),
				this._strokeWidth,
				Color.LIGHT_STEE_BLUE,
				1.0,
				false,
				ECanvas2DLineCap.ROUND
			)
			line1.segSize = line2.segSize = line3.segSize = line4.segSize = this._segSize
			line1.gapSize = line2.gapSize = line3.gapSize = line4.gapSize = this._gapSize
			this._selectionBoxLines.push(line1)
			this._selectionBoxLines.push(line2)
			this._selectionBoxLines.push(line3)
			this._selectionBoxLines.push(line4)
		} else {
			this._selectionBoxLines[0].endPoint = new Vector2(inputInfo.moveRealScenePhysicsX, inputInfo.leftDownRealScenePhysicsY)
			this._selectionBoxLines[1].startPoint = new Vector2(inputInfo.moveRealScenePhysicsX, inputInfo.leftDownRealScenePhysicsY)
			this._selectionBoxLines[1].endPoint = new Vector2(inputInfo.moveRealScenePhysicsX, inputInfo.moveRealScenePhysicsY)
			this._selectionBoxLines[2].startPoint = new Vector2(inputInfo.leftDownRealScenePhysicsX, inputInfo.moveRealScenePhysicsY)
			this._selectionBoxLines[2].endPoint = new Vector2(inputInfo.moveRealScenePhysicsX, inputInfo.moveRealScenePhysicsY)
			this._selectionBoxLines[3].endPoint = new Vector2(inputInfo.leftDownRealScenePhysicsX, inputInfo.moveRealScenePhysicsY)
		}
	}

	/**
	 * 销毁框选辅助虚线框
	 */
	private destorySelectionBox(): void {
		for (let i: number = 0; i < this._selectionBoxLines.length; i++) {
			this._selectionBoxLines[i].setDelete()
		}
		this._selectionBoxLines.length = 0
	}
}
