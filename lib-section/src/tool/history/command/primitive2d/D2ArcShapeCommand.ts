import { Vector2 } from '../../../../engine/algorithm/geometry/vector/Vector2'
import { Color } from '../../../../engine/common/Color'
import { D2ArcShapeManager } from '../../../../objects/shapes/manager/primitive2d/D2ArcShapeManager'
import { D2ArcShape } from '../../../../objects/shapes/primitive2d/D2ArcShape'
import { TElement2DArcJSONViewData } from '../../../../types/Element'
import { ECommandAction } from '../Config'
import { ElementCommand } from '../ElementCommand'

export class D2ArcShapeCommand extends ElementCommand<TElement2DArcJSONViewData> {
	private _elementItemId: string
	constructor(elementItem: D2ArcShape, groupId: string, action: ECommandAction) {
		super(groupId, action)
		this.itemData = JSON.parse(JSON.stringify(elementItem))
		this._elementItemId = elementItem.elementItemId
	}

	public quit(): void {
		this.itemData = undefined!
		this._elementItemId = undefined!
	}

	protected modify(): void {
		const {
			type,
			modelType,
			status,
			layerItemId,
			elementItemId,
			elementItemName,
			strokeColorData,
			strokeWidth,
			alpha,
			/* ... */
			centerPoint,
			radius,
			startAngle,
			endAngle,
			sweep,
			fillColorData,
			lineCap,
			isFill,
			isSolid,
		} = this.itemData
		const elementItem: D2ArcShape = D2ArcShapeManager.getInstance().getItemById(elementItemId)
		const elementItemNowData: TElement2DArcJSONViewData = JSON.parse(JSON.stringify(elementItem))
		if (elementItem.centerPoint.x !== centerPoint.x || elementItem.centerPoint.y !== centerPoint.y) {
			elementItem.centerPoint = new Vector2(centerPoint.x, centerPoint.y)
		}
		if (elementItem.radius !== radius) {
			elementItem.radius = radius
		}
		if (elementItem.startAngle !== startAngle) {
			elementItem.startAngle = startAngle
		}
		if (elementItem.endAngle !== endAngle) {
			elementItem.endAngle = endAngle
		}
		if (elementItem.sweep !== sweep) {
			elementItem.sweep = sweep
		}
		if (elementItem.strokeWidth !== strokeWidth) {
			elementItem.strokeWidth = strokeWidth
		}
		if (
			elementItem.strokeColor.r !== strokeColorData.r ||
			elementItem.strokeColor.g !== strokeColorData.g ||
			elementItem.strokeColor.b !== strokeColorData.b ||
			elementItem.strokeColor.a !== strokeColorData.a
		) {
			elementItem.strokeColor = new Color(strokeColorData.r, strokeColorData.g, strokeColorData.b, strokeColorData.a)
		}
		if (
			elementItem.fillColor.r !== fillColorData.r ||
			elementItem.fillColor.g !== fillColorData.g ||
			elementItem.fillColor.b !== fillColorData.b ||
			elementItem.fillColor.a !== fillColorData.a
		) {
			elementItem.fillColor = new Color(fillColorData.r, fillColorData.g, fillColorData.b, fillColorData.a)
		}
		if (elementItem.elementItemName !== elementItemName) {
			elementItem.elementItemName = elementItemName
		}
		if (elementItem.lineCap !== lineCap) {
			elementItem.lineCap = lineCap
		}
		if (elementItem.isFill !== isFill) {
			elementItem.isFill = isFill
		}
		if (elementItem.isSolid !== isSolid) {
			elementItem.isSolid = isSolid
		}
		this.itemData = elementItemNowData
	}

	protected rebuild(): void {
		const {
			type,
			modelType,
			status,
			layerItemId,
			elementItemId,
			elementItemName,
			strokeColorData,
			strokeWidth,
			alpha,
			/* ... */
			centerPoint,
			radius,
			startAngle,
			endAngle,
			sweep,
			fillColorData,
			lineCap,
			isFill,
			isSolid,
		} = this.itemData
		const targetShapeItem: D2ArcShape = D2ArcShapeManager.getInstance().createShapeItem(
			elementItemId,
			layerItemId,
			new Vector2(centerPoint.x, centerPoint.y),
			radius,
			startAngle,
			endAngle,
			sweep,
			strokeWidth,
			new Color(strokeColorData.r, strokeColorData.g, strokeColorData.b, strokeColorData.a),
			isFill,
			new Color(fillColorData.r, fillColorData.g, fillColorData.b, fillColorData.a)
		)
		targetShapeItem.elementItemName = elementItemName
		targetShapeItem.lineCap = lineCap
		targetShapeItem.isSolid = isSolid
	}

	protected delete(): void {
		const { elementItemId } = this.itemData
		D2ArcShapeManager.getInstance().deleteShapeItem(elementItemId)
	}
}
