import { EDrawLayerCode } from '../../../config/DrawLayerProfile'
import { ED2ElementType } from '../../../config/D2ElementProfile'
import { Vector2 } from '../../../engine/algorithm/geometry/vector/Vector2'
import { Color } from '../../../engine/common/Color'
import { ED2PointShape, EPrimitiveStatus } from '../../../engine/config/PrimitiveProfile'
import { TElement2DPointJSONViewData, TElementShapeType } from '../../../types/Element'
import { buildD2PointModel, D2PointModel } from '../../models/primitive2d/D2PointModel'
import { D2PointShape } from '../../shapes/primitive2d/D2PointShape'
import { Camera } from '../../../engine/common/Camera'

export function buildD2AssistPointShape(
	centerPoint: Vector2,
	parent: TElementShapeType = null!,
	shape: ED2PointShape = ED2PointShape.DOT,
	size: number = 1.2,
	strokeColor: Color = Color.GREEN,
	layerItemId: EDrawLayerCode = EDrawLayerCode.MaskLayer
): D2AssistPointShape {
	const alpha: number = 1.0
	const iSize: number = shape === ED2PointShape.TRIANGLE ? size + 0.2 : size
	const elementModelItem: D2PointModel = buildD2PointModel(layerItemId, centerPoint, iSize, shape, strokeColor, alpha, false)
	const assistLineShapeItem: D2AssistPointShape = new D2AssistPointShape(elementModelItem, parent)
	return assistLineShapeItem
}

export class D2AssistPointShape extends D2PointShape {
	private _parent: TElementShapeType
	private _camera: Camera
	constructor(model: D2PointModel, parent: TElementShapeType = null!) {
		super(model)
		this._parent = parent
		this._camera = Camera.getInstance()
		this.refreshRender()
	}

	public get parent(): TElementShapeType {
		return this._parent
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
