import { EDrawLayerCode } from '../../../config/DrawLayerProfile'
import { ED2ElementType } from '../../../config/D2ElementProfile'
import { Vector2 } from '../../../engine/algorithm/geometry/vector/Vector2'
import { EPrimitiveStatus } from '../../../engine/config/PrimitiveProfile'
import { TElement2DTextJSONViewData, TElementShapeType } from '../../../types/Element'
import { Camera } from '../../../engine/common/Camera'
import { D2TextShape } from '../../shapes/primitive2d/D2TextShape'
import {
	buildD2TextModel,
	D2TextModel,
	TBuildD2TextModelOptionalStyleSettingParam,
	TBuildD2TextModelOptionalParam,
} from '../../models/primitive2d/D2TextModel'
import { Constant } from '../../../Constant'
import { EFrameCommand } from '../../../config/CommandEnum'

export function buildD2AssistTextShape(
	position: Vector2,
	content: string,
	optional: Partial<
		TBuildD2TextModelOptionalParam &
			Partial<{ styleSetting: TBuildD2TextModelOptionalStyleSettingParam }> & {
				layerItemId: string
			}
	> = {}
): D2AssistTextShape {
	const layerItemId: string = optional.layerItemId || EDrawLayerCode.MaskLayer
	const elementModelItem: D2TextModel = buildD2TextModel(layerItemId, position, content, optional)
	const elementShapeItem: D2AssistTextShape = new D2AssistTextShape(elementModelItem)
	Constant.textFontService.addVectorizeTextTask(
		elementModelItem.elementItemId,
		elementModelItem.content,
		{
			fontSize: elementModelItem.fontSize,
			lineHeight: elementModelItem.styleSetting.lineHeight,
		},
		{
			fontFamily: elementModelItem.fontFamily,
			fontWeight: elementModelItem.fontWeight,
			fontStyle: elementModelItem.fontStyle,
		},
		({ width, height, initBbox2, vertexDataArray }): void => {
			if (!elementShapeItem || elementShapeItem.killed) {
				return
			}
			elementShapeItem.setContentReadyStatus(true)
			elementShapeItem.flushVertexDataMixins(vertexDataArray, width, height)
			elementShapeItem.updateCacheTransform()
			elementShapeItem.updateRender()
			Constant.messageTool.messageBus.publish(EFrameCommand.RENDER_FRAME, null)
		}
	)
	return elementShapeItem
}

export class D2AssistTextShape extends D2TextShape {
	private _camera: Camera
	constructor(model: D2TextModel) {
		super(model)
		this._camera = Camera.getInstance()
		this.refreshRender()
	}

	public set parent(value: TElementShapeType) {
		this.parent = value
	}

	public isSelect(x: number, y: number): boolean {
		return false
	}

	public quit(): void {
		this._camera = undefined!
		this.setDelete()
	}

	public getType(): ED2ElementType {
		return ED2ElementType.D2Text
	}

	public getStatus(): EPrimitiveStatus {
		return this.status
	}

	public toJSON(): TElement2DTextJSONViewData {
		const elementModelItem: D2TextModel = this.model as D2TextModel
		return {
			type: this.getType(),
			modelType: this.model.modelType,
			status: this.status,
			layerItemId: elementModelItem.layerItemId,
			elementItemId: elementModelItem.elementItemId,
			elementItemName: elementModelItem.elementItemName,
			alpha: elementModelItem.alpha,
			strokeColorData: elementModelItem.strokeColor ? elementModelItem.strokeColor.toRGBAJSON() : null!,
			strokeWidth: 0,
			rotation: elementModelItem.rotation,
			isFlipX: elementModelItem.isFlipX,
			isFlipY: elementModelItem.isFlipY,
			contentReady: elementModelItem.contentReady,
			bbox2: elementModelItem.bbox2.toJSON(),
			/* ... */
			position: elementModelItem.position.toJSON(),
			refreshToken: elementModelItem.refreshToken,
			content: elementModelItem.content,
			fontFamily: elementModelItem.fontFamily,
			fontStyle: elementModelItem.fontStyle,
			fontSize: elementModelItem.fontSize,
			fontWeight: elementModelItem.fontWeight,
			width: elementModelItem.width,
			height: elementModelItem.height,
			leftUp: elementModelItem.leftUp.toJSON(),
			rightUp: elementModelItem.rightUp.toJSON(),
			leftDown: elementModelItem.leftDown.toJSON(),
			rightDown: elementModelItem.rightDown.toJSON(),
			styleSetting: elementModelItem.styleSetting,
			vertexData: elementModelItem.getVertexData(),
		}
	}
}
