import { Vector2 } from '../../../../engine/algorithm/geometry/vector/Vector2'
import { Color } from '../../../../engine/common/Color'
import { D2ImageShapeManager } from '../../../../objects/shapes/manager/primitive2d/D2ImageShapeManager'
import { D2RectShapeManager } from '../../../../objects/shapes/manager/primitive2d/D2RectShapeManager'
import { D2RectShape } from '../../../../objects/shapes/primitive2d/D2RectShape'
import { TElement2DRectJSONViewData } from '../../../../types/Element'
import { ECommandAction } from '../Config'
import { ElementCommand } from '../ElementCommand'

export class D2RectShapeCommand extends ElementCommand<TElement2DRectJSONViewData> {
	private _elementItemId: string
	constructor(elementItem: D2RectShape, groupId: string, action: ECommandAction) {
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
			position,
			width,
			height,
			isFill,
			fillColorData,
			isSolid,
			borderRadius,
			isFixedStrokeWidth,
		} = this.itemData
		const elementItem: D2RectShape = D2RectShapeManager.getInstance().getItemById(elementItemId)
		const elementItemNowData: TElement2DRectJSONViewData = JSON.parse(JSON.stringify(elementItem))
		if (elementItem.position.x !== position.x || elementItem.position.y !== position.y) {
			elementItem.position = new Vector2(position.x, position.y)
		}
		if (elementItem.width !== width) {
			elementItem.width = width
		}
		if (elementItem.height !== height) {
			elementItem.height = height
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
			position,
			width,
			height,
			isFill,
			fillColorData,
			isSolid,
			borderRadius,
			isFixedStrokeWidth,
		} = this.itemData
		const targetShapeItem: D2RectShape = D2RectShapeManager.getInstance().createShapeItem(
			elementItemId,
			layerItemId,
			new Vector2(position.x, position.y),
			width,
			height,
			strokeWidth,
			new Color(strokeColorData.r, strokeColorData.g, strokeColorData.b, strokeColorData.a),
			isFill,
			new Color(fillColorData.r, fillColorData.g, fillColorData.b, fillColorData.a),
			alpha,
			isSolid,
			borderRadius,
			isFixedStrokeWidth
		)
		targetShapeItem.elementItemName = elementItemName
	}

	protected delete(): void {
		const { elementItemId } = this.itemData
		D2ImageShapeManager.getInstance().deleteShapeItem(elementItemId)
	}
}
