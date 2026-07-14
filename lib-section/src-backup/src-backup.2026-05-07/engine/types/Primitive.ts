import { TBuildD2TextModelOptionalStyleSettingParam } from '../../objects/models/primitive2d/D2TextModel'
import { TBBox2JSON } from '../algorithm/geometry/bbox/BBox2'
import { TColorRGBAJSON } from '../common/Color'
import { ESweep } from '../config/CommonProfile'
import { ECanvasD2LineCap, ED2FontStyle, ED2PointShape, EPrimitiveStatus } from '../config/PrimitiveProfile'

/****************************************************************************************************/
/****************************************************************************************************/
/****************************************************************************************************/

export type TElementJSONBaseData = {
	type: string
	status: EPrimitiveStatus
	layerItemId: string
	elementItemId: string
	elementItemName: string
	strokeColorData: TColorRGBAJSON
	strokeWidth: number
	modelType: string
	alpha: number
	rotation: number
	isFlipX: boolean
	isFlipY: boolean
	bbox2: TBBox2JSON
}

/****************************************************************************************************/
/****************************************************************************************************/
/****************************************************************************************************/

export type TElementD2LineJSONData = TElementJSONBaseData & {
	startPoint: { x: number; y: number }
	endPoint: { x: number; y: number }
	isSolid: boolean
	lineCap: ECanvasD2LineCap
	segSize: number
	gapSize: number
	rectBorderRadius: number
	isFixedStrokeWidth: boolean
}

export type TElementD2CircleJSONData = TElementJSONBaseData & {
	centerPoint: { x: number; y: number }
	radius: number
	fillColorData: TColorRGBAJSON
	isFill: boolean
	lineCap: ECanvasD2LineCap
	isSolid: boolean
	segSize: number
	gapSize: number
	isFixedStrokeWidth: boolean
}

export type TElementD2PointJSONData = TElementJSONBaseData & {
	centerPoint: { x: number; y: number }
	size: number
	shape: ED2PointShape
	isEnableScale: boolean
	isEnableSelect: boolean
}

export type TElementD2ArcJSONData = TElementJSONBaseData & {
	centerPoint: { x: number; y: number }
	startRadian: number
	endRadian: number
	sweep: ESweep
	radius: number
	fillColorData: TColorRGBAJSON
	isFill: boolean
	lineCap: ECanvasD2LineCap
	isSolid: boolean
	segSize: number
	gapSize: number
	isFixedStrokeWidth: boolean
}

export type TElementD2TextJSONData = TElementJSONBaseData & {
	contentReady: boolean
	position: { x: number; y: number }
	refreshToken: string
	content: string
	fontFamily: string
	fontStyle: ED2FontStyle
	fontSize: number
	fontWeight: number
	strokeColorData: TColorRGBAJSON
	vertexData: {
		indices: Array<number>
		/**
		 * [P1(x1, y1), P2(x2, y2), ...]
		 */
		positions: Array<number>
	}
	width: number
	height: number
	leftUp: { x: number; y: number }
	rightUp: { x: number; y: number }
	leftDown: { x: number; y: number }
	rightDown: { x: number; y: number }
	styleSetting: TBuildD2TextModelOptionalStyleSettingParam
}

export type TElementD2ImageJSONData = TElementJSONBaseData & {
	texImageSource: TexImageSource
	imageDataURL: string
	position: { x: number; y: number }
	fileHashUuid: string
	refreshToken: string
	width: number
	height: number
	isShowStroke: boolean
	leftUp: { x: number; y: number }
	rightUp: { x: number; y: number }
	leftDown: { x: number; y: number }
	rightDown: { x: number; y: number }
}

export type TElementD2RectJSONData = TElementJSONBaseData & {
	position: { x: number; y: number }
	width: number
	height: number
	isFill: boolean
	fillColorData: TColorRGBAJSON
	borderRadius: number
	isSolid: boolean
	segSize: number
	gapSize: number
	isFixedStrokeWidth: boolean
	leftUp: { x: number; y: number }
	rightUp: { x: number; y: number }
	leftDown: { x: number; y: number }
	rightDown: { x: number; y: number }
}
