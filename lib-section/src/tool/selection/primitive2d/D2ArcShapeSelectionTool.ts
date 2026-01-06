import { DIRECTION_KEY_MOVE_STEP } from '../../../config/Config'
import { EDIRECTION_KEY } from '../../../config/NativeProfile'
import { EOperationAction } from '../../../config/OperationProfile'
import { Matrix4 } from '../../../engine/algorithm/geometry/matrix/Matrix4'
import { Vector2 } from '../../../engine/algorithm/geometry/vector/Vector2'
import { D2AssistPointShape, buildD2AssistPointShape } from '../../../objects/assist/primitive2d/D2AssistPointShape'
import { TAllElementShapeType } from '../../../types/Element'
import { D2ArcShapeCommand } from '../../history/command/primitive2d/D2ArcShapeCommand'
import { CommandProxy } from '../../history/command/primitive2d/CommandProxy'
import { ECommandAction } from '../../history/command/Config'
import { InputInfo } from '../../InputInfo'
import { D2ArcShape } from '../../../objects/shapes/primitive2d/D2ArcShape'
import { ED2PointShape } from '../../../engine/config/PrimitiveProfile'
import { CanvasMatrix4 } from '../../../engine/algorithm/geometry/matrix/CanvasMatrix4'
import { D2ArcTransform } from '../../../algorithm/geometry/D2ArcTransform'
import { D2SelectionTool } from './D2SelectionTool'
import { D2LineTransform } from '../../../algorithm/geometry/D2LineTransform'
import { Constant } from '../../../Constant'
import { OutProfileMessage } from '../../../utils/OutMessage'

export class D2ArcShapeSelectionTool extends D2SelectionTool {
	private _shapeItemCommand: D2ArcShapeCommand
	private _selectedItem: D2ArcShape
	private _pointCenter: D2AssistPointShape
	private _pointStart: D2AssistPointShape
	private _pointEnd: D2AssistPointShape
	private _pointMiddle: D2AssistPointShape
	private _isSelectedPointCenter: boolean
	private _isSelectedPointStart: boolean
	private _isSelectedPointEnd: boolean
	private _isSelectedPointMiddle: boolean
	constructor(selectedItem: D2ArcShape) {
		super()
		this._shapeItemCommand = null!
		this._selectedItem = selectedItem
		this._pointCenter = null!
		this._pointStart = null!
		this._pointEnd = null!
		this._pointMiddle = null!
		this._isSelectedPointCenter = false
		this._isSelectedPointStart = false
		this._isSelectedPointEnd = false
		this._isSelectedPointMiddle = false
		this.initPointsPosition()
	}

	public mouseLeftDownSelect(inputInfo: InputInfo): TAllElementShapeType {
		const allControlAssistPoints: Array<D2AssistPointShape> = [this._pointCenter, this._pointStart, this._pointEnd, this._pointMiddle]
		let hitItem: D2AssistPointShape = null!
		for (let i: number = 0; i < allControlAssistPoints.length; i++) {
			if (allControlAssistPoints[i].isSelect(inputInfo.moveScenePhysicsX, inputInfo.moveScenePhysicsY)) {
				hitItem = allControlAssistPoints[i]
				break
			}
		}
		return hitItem ? hitItem.parent : null!
	}

	public keyDownHandler(inputInfo: InputInfo): void {
		switch (inputInfo.keyCode) {
			case EDIRECTION_KEY.LEFT: {
				this.moveSelectedItem(-DIRECTION_KEY_MOVE_STEP, 0)
				break
			}
			case EDIRECTION_KEY.UP: {
				this.moveSelectedItem(0, DIRECTION_KEY_MOVE_STEP)
				break
			}
			case EDIRECTION_KEY.RIGHT: {
				this.moveSelectedItem(DIRECTION_KEY_MOVE_STEP, 0)
				break
			}
			case EDIRECTION_KEY.DOWN: {
				this.moveSelectedItem(0, -DIRECTION_KEY_MOVE_STEP)
				break
			}
			default:
		}
	}

	public keyUpHandler(inputInfo: InputInfo): void {}

	public mouseLeftDownHandler(inputInfo: InputInfo): void {
		this.moveScenePhysicsX = inputInfo.leftDownScenePhysicsX
		this.moveScenePhysicsY = inputInfo.leftDownScenePhysicsY
		if (this._selectedItem) {
			this._shapeItemCommand = CommandProxy.getCommandInstance(
				this._selectedItem.elementItemId,
				ECommandAction.MODIFY,
				Constant.globalIdenManager.getCommandIden()
			) as D2ArcShapeCommand
		}
		this._isSelectedPointCenter = this._pointCenter.isSelect(inputInfo.leftDownScenePhysicsX, inputInfo.leftDownScenePhysicsY)
		this._isSelectedPointStart = this._pointStart.isSelect(inputInfo.leftDownScenePhysicsX, inputInfo.leftDownScenePhysicsY)
		this._isSelectedPointEnd = this._pointEnd.isSelect(inputInfo.leftDownScenePhysicsX, inputInfo.leftDownScenePhysicsY)
		this._isSelectedPointMiddle = this._pointMiddle.isSelect(inputInfo.leftDownScenePhysicsX, inputInfo.leftDownScenePhysicsY)
	}

	public mouseLeftUpHandler(inputInfo: InputInfo): void {
		if (this._selectedItem) {
			this._selectedItem.model.updateBBox2()
			if (this._shapeItemCommand) {
				Constant.historyManager.add(this._shapeItemCommand)
			}
			OutProfileMessage.dispatchOperationProfileChangeMessage(EOperationAction.MODIFY_ELEMENT, {})
		}
		this._shapeItemCommand = null!
	}

	public mouseMoveHandler(inputInfo: InputInfo): void {
		const diffX: number = inputInfo.moveScenePhysicsX - this.moveScenePhysicsX
		const diffY: number = inputInfo.moveScenePhysicsY - this.moveScenePhysicsY
		const matrix4: Matrix4 = CanvasMatrix4.setTranslateByVector3(new Vector2(diffX, diffY).toVector3())
		if (this._isSelectedPointCenter) {
			this.moveSelectedItem(diffX, diffY)
		} else if (this._isSelectedPointStart) {
			const newStartPoint: Vector2 = this._pointStart.centerPoint.multiplyMatrix4(matrix4)
			const { startAngle, endAngle, radius, centerPoint, sweep } = D2ArcTransform.calculateD2ArcProfileByThreePoint(
				newStartPoint,
				this._pointEnd.centerPoint,
				this._pointMiddle.centerPoint
			)
			this._selectedItem.radius = radius
			this._selectedItem.centerPoint = centerPoint
			this._selectedItem.startAngle = startAngle
			this._selectedItem.endAngle = endAngle
			this._selectedItem.sweep = sweep
		} else if (this._isSelectedPointEnd) {
			const newEndPoint: Vector2 = this._pointEnd.centerPoint.multiplyMatrix4(matrix4)
			const { startAngle, endAngle, radius, centerPoint, sweep } = D2ArcTransform.calculateD2ArcProfileByThreePoint(
				this._pointStart.centerPoint,
				newEndPoint,
				this._pointMiddle.centerPoint
			)
			this._selectedItem.radius = radius
			this._selectedItem.centerPoint = centerPoint
			this._selectedItem.startAngle = startAngle
			this._selectedItem.endAngle = endAngle
			this._selectedItem.sweep = sweep
		} else if (this._isSelectedPointMiddle) {
			/**
			 * 计算当前线段的垂线向量 B
			 * 计算当前鼠标的移动向量 A
			 * 计算向量 A 在向量 B 上的投影 C
			 */
			const perpendicular: { v1: Vector2; v2: Vector2 } = D2LineTransform.calculatePerpendicular(
				this._pointEnd.centerPoint.sub(this._pointStart.centerPoint)
			)
			const B: Vector2 = perpendicular.v1
			const A: Vector2 = new Vector2(diffX, diffY)
			const C: Vector2 = new Vector2(
				((A.x * B.x + A.y * B.y) * B.x) / (B.x * B.x + B.y * B.y),
				((A.x * B.x + A.y * B.y) * B.y) / (B.x * B.x + B.y * B.y)
			)
			const matrix4: Matrix4 = CanvasMatrix4.setTranslateByVector3(new Vector2(C.x, C.y).toVector3())
			const newMiddlePoint: Vector2 = this._pointMiddle.centerPoint.multiplyMatrix4(matrix4)
			const { startAngle, endAngle, radius, centerPoint, sweep } = D2ArcTransform.calculateD2ArcProfileByThreePoint(
				this._pointStart.centerPoint,
				this._pointEnd.centerPoint,
				newMiddlePoint
			)
			this._selectedItem.radius = radius
			this._selectedItem.centerPoint = centerPoint
			this._selectedItem.startAngle = startAngle
			this._selectedItem.endAngle = endAngle
			this._selectedItem.sweep = sweep
		} else {
			this.moveSelectedItem(diffX, diffY)
		}
		this.updatePointsPosition()
		this.moveScenePhysicsX = inputInfo.moveScenePhysicsX
		this.moveScenePhysicsY = inputInfo.moveScenePhysicsY
	}

	public mouseUpMoveHandler(inputInfo: InputInfo): void {
		const allControlAssistPoints: Array<D2AssistPointShape> = [this._pointCenter, this._pointStart, this._pointEnd, this._pointMiddle]
		let hit: boolean = false
		for (let i: number = 0; i < allControlAssistPoints.length; i++) {
			if (this.isSelectAssistPoint(allControlAssistPoints[i], inputInfo.moveScenePhysicsX, inputInfo.moveScenePhysicsY)) {
				hit = true
				break
			}
		}
		if (hit) {
			Constant.environment.updateCanvasMouseCursor('pointer')
		} else {
			Constant.environment.updateCanvasMouseCursor('default')
		}
	}

	public clear(): void {
		this._selectedItem = null!
		this._pointCenter.setDelete()
		this._pointStart.setDelete()
		this._pointEnd.setDelete()
		this._pointMiddle.setDelete()
		this._pointCenter = null!
		this._pointStart = null!
		this._pointEnd = null!
		this._pointMiddle = null!
		this._isSelectedPointCenter = false
		this._isSelectedPointStart = false
		this._isSelectedPointEnd = false
		this._isSelectedPointMiddle = false
	}

	public quit(): void {
		this._shapeItemCommand = undefined!
		this._selectedItem = undefined!
		super.quit()
	}

	private initPointsPosition(): void {
		const arcCenterPoint: Vector2 = this._selectedItem.centerPoint
		const { startPoint, endPoint, middlePoint } = D2ArcTransform.calculateThreePointByArcProfile(
			this._selectedItem.radius,
			this._selectedItem.startAngle,
			this._selectedItem.endAngle
		)
		this._pointCenter = buildD2AssistPointShape(arcCenterPoint.copy(), this._selectedItem)
		this._pointStart = buildD2AssistPointShape(arcCenterPoint.add(startPoint), this._selectedItem)
		this._pointEnd = buildD2AssistPointShape(arcCenterPoint.add(endPoint), this._selectedItem)
		this._pointMiddle = buildD2AssistPointShape(arcCenterPoint.add(middlePoint), this._selectedItem, ED2PointShape.TRIANGLE, 1.6)
	}

	private updatePointsPosition(): void {
		const arcCenterPoint: Vector2 = this._selectedItem.centerPoint
		const { startPoint, endPoint, middlePoint } = D2ArcTransform.calculateThreePointByArcProfile(
			this._selectedItem.radius,
			this._selectedItem.startAngle,
			this._selectedItem.endAngle
		)
		this._pointCenter.centerPoint = this._selectedItem.centerPoint.copy()
		this._pointStart.centerPoint = arcCenterPoint.add(startPoint)
		this._pointEnd.centerPoint = arcCenterPoint.add(endPoint)
		this._pointMiddle.centerPoint = arcCenterPoint.add(middlePoint)
	}

	private moveSelectedItem(diffX: number, diffY: number): void {
		const moveMatrix4: Matrix4 = CanvasMatrix4.setTranslateByVector3(new Vector2(diffX, diffY).toVector3())
		this._selectedItem.transform(moveMatrix4)
	}
}
