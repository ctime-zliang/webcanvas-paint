import { ED2ElementType } from '../config/D2ElementProfile'
import {
	TElementD2ArcJSONData,
	TElementD2CircleJSONData,
	TElementD2ImageJSONData,
	TElementD2LineJSONData,
	TElementD2RectJSONData,
	TElementD2TextJSONData,
	TElementD2PointJSONData,
} from '../engine/types/Primitive'
import { D2AssistLineShape } from '../objects/assist/primitive2d/D2AssistLineShape'
import { D2AssistPointShape } from '../objects/assist/primitive2d/D2AssistPointShape'
import { D2ArcShape } from '../objects/shapes/primitive2d/D2ArcShape'
import { D2CircleShape } from '../objects/shapes/primitive2d/D2CircleShape'
import { D2ImageShape } from '../objects/shapes/primitive2d/D2ImageShape'
import { D2LineShape } from '../objects/shapes/primitive2d/D2LineShape'
import { D2PointShape } from '../objects/shapes/primitive2d/D2PointShape'
import { D2RectShape } from '../objects/shapes/primitive2d/D2RectShape'
import { D2TextShape } from '../objects/shapes/primitive2d/D2TextShape'

export type TElementShapeType = D2LineShape | D2CircleShape | D2PointShape | D2ArcShape | D2TextShape | D2ImageShape | D2RectShape
export type TAllElementShapeType = TElementShapeType | D2AssistLineShape | D2AssistPointShape

/****************************************************************************************************/
/****************************************************************************************************/
/****************************************************************************************************/

export type TFillElementShapeType = D2CircleShape | D2ArcShape

/****************************************************************************************************/
/****************************************************************************************************/
/****************************************************************************************************/

export type TElement2DLineJSONViewData = TElementD2LineJSONData & {
	modelType: ED2ElementType
}

export type TElement2DCircleJSONViewData = TElementD2CircleJSONData & {
	modelType: ED2ElementType
}

export type TElement2DPointJSONViewData = TElementD2PointJSONData & {
	modelType: ED2ElementType
}

export type TElement2DArcJSONViewData = TElementD2ArcJSONData & {
	modelType: ED2ElementType
}

export type TElement2DTextJSONViewData = TElementD2TextJSONData & {
	modelType: ED2ElementType
}

export type TElement2DImageJSONViewData = TElementD2ImageJSONData & {
	modelType: ED2ElementType
}

export type TElement2DRectJSONViewData = TElementD2RectJSONData & {
	modelType: ED2ElementType
}

/****************************************************************************************************/
/****************************************************************************************************/
/****************************************************************************************************/

export type TElementJSONData =
	| TElement2DLineJSONViewData
	| TElement2DCircleJSONViewData
	| TElement2DPointJSONViewData
	| TElement2DArcJSONViewData
	| TElement2DTextJSONViewData
	| TElement2DImageJSONViewData
	| TElement2DRectJSONViewData
