import { EDrawLayerCode } from '../../../config/DrawLayerProfile'
import { ED2ElementType } from '../../../config/D2ElementProfile'
import { Vector2 } from '../../../engine/algorithm/geometry/vector/Vector2'
import { ED2PointShape, EPrimitiveStatus } from '../../../engine/config/PrimitiveProfile'
import { TElement2DPointJSONViewData, TElementShapeType } from '../../../types/Element'
import { buildD2PointModel, D2PointModel, TBuildD2PointModelOptionalParam } from '../../models/primitive2d/D2PointModel'
import { D2PointShape } from '../../shapes/primitive2d/D2PointShape'
import { Camera } from '../../../engine/common/Camera'

export function buildD2AssistPointShape(
	centerPoint: Vector2,
	optional: Partial<
		TBuildD2PointModelOptionalParam & {
			layerItemId: string
		}
	> = {}
): D2AssistPointShape {
	const layerItemId: string = optional.layerItemId || EDrawLayerCode.MaskLayer
	const alpha: number = optional.alpha || 1.0
	const size: number = optional.size || 1.2
	const iSize: number = optional.shape === ED2PointShape.TRIANGLE ? size + 0.2 : size
	const elementModelItem: D2PointModel = buildD2PointModel(layerItemId, centerPoint, {
		...optional,
		alpha,
		size: iSize,
	})
	const elementShapeItem: D2AssistPointShape = new D2AssistPointShape(elementModelItem)
	return elementShapeItem
}

export class D2AssistPointShape extends D2PointShape {
	private _camera: Camera
	constructor(model: D2PointModel) {
		super(model)
		this._camera = Camera.getInstance()
		this.refreshRender()
	}

	public set parent(value: TElementShapeType) {
		this.parent = value
	}

	public isSelect(x: number, y: number): boolean {
		const zoomRatio: number = this._camera.getZoomRatio()
		const point: Vector2 = new Vector2(x, y)
		const centerPoint: Vector2 = this.centerPoint
		const distOfClickPointAndCenterPoint: number = point.sub(centerPoint).length
		if (distOfClickPointAndCenterPoint <= this.size / zoomRatio) {
			return true
		}
		return false
	}

	public quit(): void {
		this._camera = undefined!
		this.setDelete()
	}

	public getType(): ED2ElementType {
		return ED2ElementType.D2Point
	}

	public getStatus(): EPrimitiveStatus {
		return this.status
	}

	public toJSON(): TElement2DPointJSONViewData {
		const elementModelItem: D2PointModel = this.model as D2PointModel
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
			strokeColorData: elementModelItem.strokeColor.toRGBAJSON(),
			strokeWidth: 0,
			bbox2: null!,
			/* ... */
			centerPoint: elementModelItem.centerPoint.toJSON(),
			size: elementModelItem.size,
			shape: elementModelItem.shape,
			isEnableScale: elementModelItem.isEnableScale,
			isEnableSelect: elementModelItem.isEnableSelect,
		}
	}
}
