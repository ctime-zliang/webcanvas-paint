import { EDrawLayerCode } from '../../../config/DrawLayerProfile'
import { ED2ElementType } from '../../../config/D2ElementProfile'
import { Vector2 } from '../../../engine/algorithm/geometry/vector/Vector2'
import { Color } from '../../../engine/common/Color'
import { ECanvas2DLineCap, EPrimitiveStatus } from '../../../engine/config/PrimitiveProfile'
import { TElement2DLineJSONViewData, TElementShapeType } from '../../../types/Element'
import { buildD2LineModel, D2LineModel } from '../../models/primitive2d/D2LineModel'
import { D2LineShape } from '../../shapes/primitive2d/D2LineShape'

export function buildD2AssistLineShapeSimplify(
	startPoint: Vector2,
	endPoint: Vector2,
	strokeColor: Color = Color.WHITE,
	baseStrokeWidth: number = 0.5,
	isSolid: boolean = false,
	layerItemId: string = EDrawLayerCode.MaskLayer
): D2AssistLineShape {
	const alpha: number = 1.0
	const lineCap: ECanvas2DLineCap = ECanvas2DLineCap.SQUARE
	const lineModelItem: D2LineModel = buildD2LineModel(
		layerItemId,
		startPoint,
		endPoint,
		baseStrokeWidth,
		strokeColor,
		alpha,
		isSolid,
		lineCap,
		true
	)
	const assistLineShapeItem: D2AssistLineShape = new D2AssistLineShape(lineModelItem, isSolid, lineCap, null!)
	return assistLineShapeItem
}

export function buildD2AssistLineShape(
	layerItemId: string,
	startPoint: Vector2,
	endPoint: Vector2,
	baseStrokeWidth: number = 0.5,
	strokeColor: Color = Color.WHITE,
	alpha: number = 1.0,
	isSolid: boolean = false,
	lineCap: ECanvas2DLineCap = ECanvas2DLineCap.SQUARE,
	parent: TElementShapeType = null!,
	isFixedStrokeWidth: boolean = true
): D2AssistLineShape {
	const lineModelItem: D2LineModel = buildD2LineModel(
		layerItemId,
		startPoint,
		endPoint,
		baseStrokeWidth,
		strokeColor,
		alpha,
		isSolid,
		lineCap,
		isFixedStrokeWidth
	)
	const assistLineShapeItem: D2AssistLineShape = new D2AssistLineShape(lineModelItem, isSolid, lineCap, parent)
	return assistLineShapeItem
}

export class D2AssistLineShape extends D2LineShape {
	private _parent: TElementShapeType
	constructor(model: D2LineModel, isSolid: boolean = true, lineCap: ECanvas2DLineCap, parent: TElementShapeType = null!) {
		super(model)
		this.isSolid = isSolid
		this.lineCap = lineCap
		this._parent = parent
		this.refreshRender()
	}

	public get parent(): TElementShapeType {
		return this._parent
	}
	public set parent(value: TElementShapeType) {
		this.parent = value
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
			isFixedStrokeWidth: elementModelItem.isFixedStrokeWidth,
		}
	}
}
