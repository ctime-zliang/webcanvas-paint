import { Vector2 } from '../../../../engine/algorithm/geometry/vector/Vector2'
import { D2ImageShapeManager } from '../../../../objects/shapes/manager/primitive2d/D2ImageShapeManager'
import { D2ImageShape } from '../../../../objects/shapes/primitive2d/D2ImageShape'
import { TElement2DImageJSONViewData } from '../../../../types/Element'
import { ECommandAction } from '../Config'
import { ElementCommand } from '../ElementCommand'

export class D2ImageShapeCommand extends ElementCommand<TElement2DImageJSONViewData> {
	private _elementItemId: string
	constructor(elementItem: D2ImageShape, groupId: string, action: ECommandAction) {
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
			fileHashUuid,
			imageDataURL,
			position,
			width,
			height,
		} = this.itemData
		const elementItem: D2ImageShape = D2ImageShapeManager.getInstance().getItemById(elementItemId)
		const elementItemNowData: TElement2DImageJSONViewData = JSON.parse(JSON.stringify(elementItem))
		if (elementItem.imageDataURL !== imageDataURL) {
			elementItem.imageDataURL = imageDataURL
		}
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
			imageDataURL,
			position,
			fileHashUuid,
			width,
			height,
		} = this.itemData
		const targetShapeItem: D2ImageShape = D2ImageShapeManager.getInstance().createShapeItem(
			elementItemId,
			layerItemId,
			new Vector2(position.x, position.y),
			imageDataURL,
			fileHashUuid,
			width,
			height,
			alpha
		)
		targetShapeItem.elementItemName = elementItemName
	}

	protected delete(): void {
		const { elementItemId } = this.itemData
		D2ImageShapeManager.getInstance().deleteShapeItem(elementItemId)
	}
}
