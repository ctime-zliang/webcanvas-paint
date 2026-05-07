import { EDrawLayerCode } from '../../../config/DrawLayerProfile'
import { ED2ElementType } from '../../../config/D2ElementProfile'
import { Vector2 } from '../../../engine/algorithm/geometry/vector/Vector2'
import { ECanvasD2LineCap, EPrimitiveStatus } from '../../../engine/config/PrimitiveProfile'
import { TElement2DLineJSONViewData } from '../../../types/Element'
import { buildD2LineModel, D2LineModel, TBuildD2LineModelOptionalParam } from '../../models/primitive2d/D2LineModel'
import { D2LineShape } from '../../shapes/primitive2d/D2LineShape'
import { Camera } from '../../../engine/common/Camera'

export function buildD2AssistLineShape(
	startPoint: Vector2,
	endPoint: Vector2,
	optional: Partial<
		TBuildD2LineModelOptionalParam & {
			layerItemId: string
		}
	> = {}
): D2AssistLineShape {
	const layerItemId: string = optional.layerItemId || EDrawLayerCode.MaskLayer
	const elementModelItem: D2LineModel = buildD2LineModel(layerItemId, startPoint, endPoint, {
		...optional,
		isFixedStrokeWidth: typeof optional.isFixedStrokeWidth !== 'undefined' ? optional.isFixedStrokeWidth : true,
	})
	const elementShapeItem: D2AssistLineShape = new D2AssistLineShape(
		elementModelItem,
		typeof optional.isSolid !== 'undefined' ? optional.isSolid : false,
		typeof optional.lineCap !== 'undefined' ? optional.lineCap : ECanvasD2LineCap.ROUND
	)
	return elementShapeItem
}

export function buildD2AssistLineShapeByPointsArray(
	points: Array<Vector2>,
	optional: Partial<
		TBuildD2LineModelOptionalParam & {
			layerItemId: string
		}
	> = {}
): Array<D2AssistLineShape> {
	if (points.length <= 1) {
		return []
	}
	const assistLineShapes: Array<D2AssistLineShape> = []
	for (let i: number = 0; i < points.length; i++) {
		const startPoint: Vector2 = points[i]
		const endPoint: Vector2 = i + 1 >= points.length ? points[0] : points[i + 1]
		if (!startPoint || !endPoint) {
			continue
		}
		assistLineShapes.push(buildD2AssistLineShape(startPoint, endPoint, optional))
	}
	return assistLineShapes
}

export class D2AssistLineShape extends D2LineShape {
	private _camera: Camera
	constructor(model: D2LineModel, isSolid: boolean = true, lineCap: ECanvasD2LineCap = ECanvasD2LineCap.ROUND) {
		super(model)
		this.isSolid = isSolid
		this.lineCap = lineCap
		this._camera = Camera.getInstance()
		this.refreshRender()
	}

	public quit(): void {
		this._camera = undefined!
		this.setDelete()
	}

	public getType(): ED2ElementType {
		return ED2ElementType.D2AssistLine
	}

	public getStatus(): EPrimitiveStatus {
		return this.status
	}

	public toJSON(): TElement2DLineJSONViewData {
		const elementModelItem: D2LineModel = this.model as D2LineModel
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
			strokeWidth: elementModelItem.strokeWidth,
			bbox2: elementModelItem.bbox2.toJSON(),
			/* ... */
			startPoint: elementModelItem.startPoint.toJSON(),
			endPoint: elementModelItem.endPoint.toJSON(),
			lineCap: elementModelItem.lineCap,
			isSolid: elementModelItem.isSolid,
			segSize: elementModelItem.segSize,
			gapSize: elementModelItem.gapSize,
			rectBorderRadius: 0,
			isFixedStrokeWidth: elementModelItem.isFixedStrokeWidth,
		}
	}
}
