import { EDrawLayerCode } from '../../../config/DrawLayerProfile'
import { ED2ElementType } from '../../../config/D2ElementProfile'
import { Vector2 } from '../../../engine/algorithm/geometry/vector/Vector2'
import { EPrimitiveStatus } from '../../../engine/config/PrimitiveProfile'
import { TElement2DRectJSONViewData } from '../../../types/Element'
import { Camera } from '../../../engine/common/Camera'
import { buildD2RectModel, D2RectModel, TBuildD2RectModelOptionalParam } from '../../models/primitive2d/D2RectModel'
import { D2RectShape } from '../../shapes/primitive2d/D2RectShape'

export function buildD2AssistRectShape(
	position: Vector2,
	width: number,
	height: number,
	optional: Partial<
		TBuildD2RectModelOptionalParam & {
			layerItemId: string
		}
	> = {}
): D2AssistRectShape {
	const layerItemId: string = optional.layerItemId || EDrawLayerCode.MaskLayer
	const elementModelItem: D2RectModel = buildD2RectModel(layerItemId, position, width, height, optional)
	const elementShapeItem: D2AssistRectShape = new D2AssistRectShape(
		elementModelItem,
		typeof optional.isSolid !== 'undefined' ? optional.isSolid : false
	)
	return elementShapeItem
}

export class D2AssistRectShape extends D2RectShape {
	private _camera: Camera
	constructor(model: D2RectModel, isSolid: boolean = true) {
		super(model)
		this.isSolid = isSolid
		this._camera = Camera.getInstance()
		this.refreshRender()
	}

	public quit(): void {
		this._camera = undefined!
		this.setDelete()
	}

	public getType(): ED2ElementType {
		return ED2ElementType.D2AssistRect
	}

	public getStatus(): EPrimitiveStatus {
		return this.status
	}

	public toJSON(): TElement2DRectJSONViewData {
		const elementModelItem: D2RectModel = this.model as D2RectModel
		return {
			type: this.getType(),
			modelType: this.model.modelType,
			status: this.status,
			layerItemId: elementModelItem.layerItemId,
			elementItemId: elementModelItem.elementItemId,
			elementItemName: elementModelItem.elementItemName,
			alpha: elementModelItem.alpha,
			rotation: elementModelItem.rotation,
			isFlipX: elementModelItem.isFlipX,
			isFlipY: elementModelItem.isFlipY,
			strokeColorData: elementModelItem.strokeColor ? elementModelItem.strokeColor.toRGBAJSON() : null!,
			strokeWidth: elementModelItem.strokeWidth,
			bbox2: elementModelItem.bbox2.toJSON(),
			/* ... */
			position: elementModelItem.position.toJSON(),
			width: elementModelItem.width,
			height: elementModelItem.height,
			fillColorData: elementModelItem.isFill && elementModelItem.fillColor ? elementModelItem.fillColor.toRGBAJSON() : null!,
			isFill: elementModelItem.isFill,
			borderRadius: elementModelItem.borderRadius,
			isSolid: elementModelItem.isSolid,
			segSize: elementModelItem.segSize,
			gapSize: elementModelItem.gapSize,
			isFixedStrokeWidth: elementModelItem.isFixedStrokeWidth,
			leftUp: elementModelItem.leftUp.toJSON(),
			rightUp: elementModelItem.rightUp.toJSON(),
			leftDown: elementModelItem.leftDown.toJSON(),
			rightDown: elementModelItem.rightDown.toJSON(),
		}
	}
}
