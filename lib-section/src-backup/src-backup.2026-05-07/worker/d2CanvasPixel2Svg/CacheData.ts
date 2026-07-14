import { TFontCanvasRenderMetrics } from '../../engine/modules/d2Canvas2Svg/Canvas'
import { TOptional } from '../../engine/modules/d2Canvas2Svg/Config'
import { EPixelFilterResult, PixelFilter } from '../../engine/modules/d2Canvas2Svg/pixelFilter/PixelFilter'
import { TFontPolygonBbox2, TFontTriangleVertexData } from '../../manager/TextGraphicsManager'

type TTextFontServiceProfile = {
	fontSize: number
	lineHeight: number
	rotation: number
	isFlipX: boolean
	isFlipY: boolean
}
export type TWorkeRequestBody = {
	taskId: string
	textStrId: string
	optional: TOptional
	pixelFilterType: EPixelFilterResult
	profile: TTextFontServiceProfile
	textArray: Array<Array<string>>
	textPolygonBbox2Arrays: Array<Array<TFontPolygonBbox2>>
	textCanvasRenderMetricsArray: Array<Array<TFontCanvasRenderMetrics>>
	vertexDataArray: Array<Array<TFontTriangleVertexData>>
	imagePixelArray: Array<Array<Uint8ClampedArray>>
	imageCutArray: Array<Array<{ xCut: number; yCut: number }>>
}

export type TTaskDataItem = TWorkeRequestBody & {
	isRuning: boolean
	pixelFilter: PixelFilter
}

export const taskDataList: Array<TTaskDataItem> = []
