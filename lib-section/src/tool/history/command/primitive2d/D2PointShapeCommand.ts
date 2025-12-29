import { Vector2 } from '../../../../engine/algorithm/geometry/vector/Vector2'
import { Color } from '../../../../engine/common/Color'
import { D2PointShapeManager } from '../../../../objects/shapes/manager/primitive2d/D2PointShapeManager'
import { D2PointShape } from '../../../../objects/shapes/primitive2d/D2PointShape'
import { TElement2DPointJSONViewData } from '../../../../types/Element'
import { ECommandAction } from '../Config'
import { ElementCommand } from '../ElementCommand'

export class D2PointShapeCommand extends ElementCommand<TElement2DPointJSONViewData> {
	private _elementItemId: string
	constructor(elementItem: D2PointShape, groupId: string, action: ECommandAction) {
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
			size,
			shape,
			isEnableScale,
			isEnableSelect,
		} = this.itemData
		const elementItem: D2PointShape = D2PointShapeManager.getInstance().getItemById(elementItemId)
		const elementItemNowData: TElement2DPointJSONViewData = JSON.parse(JSON.stringify(elementItem))
		if (elementItem.centerPoint.x !== centerPoint.x || elementItem.centerPoint.y !== centerPoint.y) {
			elementItem.centerPoint = new Vector2(centerPoint.x, centerPoint.y)
		}
		if (elementItem.size !== size) {
			elementItem.size = size
		}
		if (elementItem.shape !== shape) {
			elementItem.shape = shape
		}
		if (
			elementItem.strokeColor.r !== strokeColorData.r ||
			elementItem.strokeColor.g !== strokeColorData.g ||
			elementItem.strokeColor.b !== strokeColorData.b ||
			elementItem.strokeColor.a !== strokeColorData.a
		) {
			elementItem.strokeColor = new Color(strokeColorData.r, strokeColorData.g, strokeColorData.b, strokeColorData.a)
		}
		if (elementItem.elementItemName !== elementItemName) {
			elementItem.elementItemName = elementItemName
		}
		if (elementItem.isEnableScale !== isEnableScale) {
			elementItem.isEnableScale = isEnableScale
		}
		if (elementItem.isEnableSelect !== isEnableSelect) {
			elementItem.isEnableSelect = isEnableSelect
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
			size,
			shape,
			isEnableScale,
			isEnableSelect,
		} = this.itemData
		const targetShapeItem: D2PointShape = D2PointShapeManager.getInstance().createShapeItem(
			elementItemId,
			layerItemId,
			new Vector2(centerPoint.x, centerPoint.y),
			size,
			shape,
			new Color(strokeColorData.r, strokeColorData.g, strokeColorData.b, strokeColorData.a),
			alpha,
			isEnableScale,
			isEnableSelect
		)
		targetShapeItem.elementItemName = elementItemName
	}

	protected delete(): void {
		const { elementItemId } = this.itemData
		D2PointShapeManager.getInstance().deleteShapeItem(elementItemId)
	}
}
