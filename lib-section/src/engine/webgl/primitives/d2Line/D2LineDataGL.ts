import { InsConfig } from '../../../common/InsConfig'
import { mm2px } from '../../../math/Calculation'
import { ECanvas2DLineCap } from '../../../config/PrimitiveProfile'
import { TElementD2LineJSONData } from '../../../types/Primitive'
import { FLOAT_32_ARRAY_BYTESIZE } from '../../buffer/DataBufferGL'
import { PtType } from '../PrimitiveGL'

export class D2LineDataGL {
	static ITEM_SIZE: number = 19
	static STRIDE: number = 19 * FLOAT_32_ARRAY_BYTESIZE
	static createArrayData(primitiveItemValueData: TElementD2LineJSONData, layerAlpha: number = 1.0): Float32Array {
		const typedArray: Array<number> = [
			PtType.D2_LINE, // 0
			/* ... */
			mm2px(primitiveItemValueData.startPoint.x, InsConfig.DPI[0]), // 1
			mm2px(primitiveItemValueData.startPoint.y, InsConfig.DPI[1]), // 2
			mm2px(0, InsConfig.DPI[0]), // 3
			mm2px(primitiveItemValueData.endPoint.x, InsConfig.DPI[0]), // 4
			mm2px(primitiveItemValueData.endPoint.y, InsConfig.DPI[1]), // 5
			mm2px(0, InsConfig.DPI[0]), // 6
			/* ... */
			primitiveItemValueData.alpha * layerAlpha, // 7
			primitiveItemValueData.lineCap === ECanvas2DLineCap.ROUND ? 1.0 : 0.0, // 8
			mm2px(primitiveItemValueData.strokeWidth, InsConfig.DPI[0]), // 9
			primitiveItemValueData.isSolid ? 1 : 0, // 10
			/* ... */
			mm2px(primitiveItemValueData.segSize, InsConfig.DPI[0]), // 11
			mm2px(primitiveItemValueData.gapSize, InsConfig.DPI[0]), // 12
			primitiveItemValueData.isFixedStrokeWidth ? 1 : 0, // 13
			0, // 14
			/* ... */
			primitiveItemValueData.strokeColorData.r, // 15
			primitiveItemValueData.strokeColorData.g, // 16
			primitiveItemValueData.strokeColorData.b, // 17
			primitiveItemValueData.strokeColorData.a, // 18
		]
		return new Float32Array(typedArray)
	}
}
