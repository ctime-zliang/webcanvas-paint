import { Vector2 } from '../../../../engine/algorithm/geometry/vector/Vector2'
import { Color } from '../../../../engine/common/Color'
import { D2TextShapeManager } from '../../../../objects/shapes/manager/primitive2d/D2TextShapeManager'
import { D2TextShape } from '../../../../objects/shapes/primitive2d/D2TextShape'
import { TElement2DTextJSONViewData } from '../../../../types/Element'
import { ECommandAction } from '../Config'
import { ElementCommand } from '../ElementCommand'

export class D2TextShapeCommand extends ElementCommand<TElement2DTextJSONViewData> {
	private _elementItemId: string
	constructor(elementItem: D2TextShape, groupId: string, action: ECommandAction) {
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
			content,
			fontFamily,
			fontStyle,
			fontSize,
			fontWeight,
		} = this.itemData
		const elementItem: D2TextShape = D2TextShapeManager.getInstance().getItemById(elementItemId)
		const elementItemNowData: TElement2DTextJSONViewData = JSON.parse(JSON.stringify(elementItem))
		if (elementItem.position.x !== position.x || elementItem.position.y !== position.y) {
			elementItem.position = new Vector2(position.x, position.y)
		}
		if (elementItem.content !== content) {
			elementItem.content = content
		}
		if (elementItem.fontFamily !== fontFamily) {
			elementItem.fontFamily = fontFamily
		}
		if (elementItem.fontStyle !== fontStyle) {
			elementItem.fontStyle = fontStyle
		}
		if (elementItem.fontSize !== fontSize) {
			elementItem.fontSize = fontSize
		}
		if (elementItem.fontWeight !== fontWeight) {
			elementItem.fontWeight = fontWeight
		}
		if (
			elementItem.strokeColor.r !== strokeColorData.r ||
			elementItem.strokeColor.g !== strokeColorData.g ||
			elementItem.strokeColor.b !== strokeColorData.b ||
			elementItem.strokeColor.a !== strokeColorData.a
		) {
			elementItem.strokeColor = new Color(strokeColorData.r, strokeColorData.g, strokeColorData.b, strokeColorData.a)
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
			content,
			fontFamily,
			fontStyle,
			fontSize,
			fontWeight,
		} = this.itemData
		const targetShapeItem: D2TextShape = D2TextShapeManager.getInstance().createShapeItem(
			elementItemId,
			layerItemId,
			new Vector2(position.x, position.y),
			content,
			fontFamily,
			fontStyle,
			fontSize,
			fontWeight,
			new Color(strokeColorData.r, strokeColorData.g, strokeColorData.b, strokeColorData.a)
		)
		targetShapeItem.elementItemName = elementItemName
	}

	protected delete(): void {
		const { elementItemId } = this.itemData
		D2TextShapeManager.getInstance().deleteShapeItem(elementItemId)
	}
}
