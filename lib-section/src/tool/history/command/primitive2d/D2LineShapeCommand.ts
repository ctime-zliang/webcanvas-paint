import { Vector2 } from '../../../../engine/algorithm/geometry/vector/Vector2'
import { Color } from '../../../../engine/common/Color'
import { D2LineShapeManager } from '../../../../objects/shapes/manager/primitive2d/D2LineShapeManager'
import { D2LineShape } from '../../../../objects/shapes/primitive2d/D2LineShape'
import { TElement2DLineJSONViewData } from '../../../../types/Element'
import { ECommandAction } from '../Config'
import { ElementCommand } from '../ElementCommand'

export class D2LineShapeCommand extends ElementCommand<TElement2DLineJSONViewData> {
	private _elementItemId: string
	constructor(elementItem: D2LineShape, groupId: string, action: ECommandAction) {
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
			startPoint,
			endPoint,
			lineCap,
			isSolid,
		} = this.itemData
		const elementItem: D2LineShape = D2LineShapeManager.getInstance().getItemById(elementItemId)
		const elementItemNowData: TElement2DLineJSONViewData = JSON.parse(JSON.stringify(elementItem))
		if (elementItem.startPoint.x !== startPoint.x || elementItem.startPoint.y !== startPoint.y) {
			elementItem.startPoint = new Vector2(startPoint.x, startPoint.y)
		}
		if (elementItem.endPoint.x !== endPoint.x || elementItem.endPoint.y !== endPoint.y) {
			elementItem.endPoint = new Vector2(endPoint.x, endPoint.y)
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
		if (elementItem.elementItemName !== elementItemName) {
			elementItem.elementItemName = elementItemName
		}
		if (elementItem.lineCap !== lineCap) {
			elementItem.lineCap = lineCap
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
			startPoint,
			endPoint,
			lineCap,
			isSolid,
		} = this.itemData
		const targetShapeItem: D2LineShape = D2LineShapeManager.getInstance().createShapeItem(
			elementItemId,
			layerItemId,
			new Vector2(startPoint.x, startPoint.y),
			new Vector2(endPoint.x, endPoint.y),
			strokeWidth,
			new Color(strokeColorData.r, strokeColorData.g, strokeColorData.b, strokeColorData.a)
		)
		targetShapeItem.elementItemName = elementItemName
		targetShapeItem.lineCap = lineCap
		targetShapeItem.isSolid = isSolid
	}

	protected delete(): void {
		const { elementItemId } = this.itemData
		D2LineShapeManager.getInstance().deleteShapeItem(elementItemId)
	}
}
