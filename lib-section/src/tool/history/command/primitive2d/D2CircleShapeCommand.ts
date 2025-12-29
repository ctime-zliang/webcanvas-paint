import { Vector2 } from '../../../../engine/algorithm/geometry/vector/Vector2'
import { Color } from '../../../../engine/common/Color'
import { D2CircleShapeManager } from '../../../../objects/shapes/manager/primitive2d/D2CircleShapeManager'
import { D2CircleShape } from '../../../../objects/shapes/primitive2d/D2CircleShape'
import { TElement2DCircleJSONViewData } from '../../../../types/Element'
import { ECommandAction } from '../Config'
import { ElementCommand } from '../ElementCommand'

export class D2CircleShapeCommand extends ElementCommand<TElement2DCircleJSONViewData> {
	private _elementItemId: string
	constructor(elementItem: D2CircleShape, groupId: string, action: ECommandAction) {
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
			fillColorData,
			lineCap,
			isFill,
			isSolid,
		} = this.itemData
		const elementItem: D2CircleShape = D2CircleShapeManager.getInstance().getItemById(elementItemId)
		const elementItemNowData: TElement2DCircleJSONViewData = JSON.parse(JSON.stringify(elementItem))
		if (elementItem.centerPoint.x !== centerPoint.x || elementItem.centerPoint.y !== centerPoint.y) {
			elementItem.centerPoint = new Vector2(centerPoint.x, centerPoint.y)
		}
		if (elementItem.radius !== radius) {
			elementItem.radius = radius
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
			fillColorData,
			lineCap,
			isFill,
			isSolid,
		} = this.itemData
		const targetShapeItem: D2CircleShape = D2CircleShapeManager.getInstance().createShapeItem(
			elementItemId,
			layerItemId,
			new Vector2(centerPoint.x, centerPoint.y),
			radius,
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
		D2CircleShapeManager.getInstance().deleteShapeItem(elementItemId)
	}
}
