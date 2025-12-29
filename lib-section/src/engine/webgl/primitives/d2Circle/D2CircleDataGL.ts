import { InsConfig } from '../../../common/InsConfig'
import { mm2px } from '../../../math/Calculation'
import { TColorRGBAJSON } from '../../../common/Color'
import { ECanvas2DLineCap } from '../../../config/PrimitiveProfile'
import { TElementD2CircleJSONData } from '../../../types/Primitive'
import { FLOAT_32_ARRAY_BYTESIZE } from '../../buffer/DataBufferGL'
import { PtType } from '../PrimitiveGL'

export class D2CircleDataGL {
	static ITEM_SIZE: number = 17
	static STRIDE: number = 17 * FLOAT_32_ARRAY_BYTESIZE
	static createArrayData(primitiveItemValueData: TElementD2CircleJSONData, layerAlpha: number = 1.0): Float32Array {
		const fillColorData: TColorRGBAJSON = primitiveItemValueData.fillColorData ? primitiveItemValueData.fillColorData : { r: 0, g: 0, b: 0, a: 0 }
		const typedArray: Array<number> = [
			PtType.D2_CIRCLE, // 0
			/* ... */
			mm2px(primitiveItemValueData.centerPoint.x, InsConfig.DPI[0]), // 1
			mm2px(primitiveItemValueData.centerPoint.y, InsConfig.DPI[1]), // 2
			mm2px(0, InsConfig.DPI[0]), // 3
			mm2px(primitiveItemValueData.radius, InsConfig.DPI[0]), // 4
			/* ... */
			primitiveItemValueData.alpha * layerAlpha, // 5
			primitiveItemValueData.lineCap === ECanvas2DLineCap.ROUND ? 1.0 : 0.0, // 6
			mm2px(primitiveItemValueData.strokeWidth, InsConfig.DPI[0]), // 7
			primitiveItemValueData.isFill ? 1.0 : 0.0, // 8
			/* ... */
			primitiveItemValueData.strokeColorData.r, // 9
			primitiveItemValueData.strokeColorData.g, // 10
			primitiveItemValueData.strokeColorData.b, // 11
			primitiveItemValueData.strokeColorData.a, // 12
			/* ... */
			fillColorData.r, // 13
			fillColorData.g, // 14
			fillColorData.b, // 15
			fillColorData.a, // 16
			/* ... */
			// primitiveItemValueData.isSolid ? 1 : 0,  // 17
			// mm2px(primitiveItemValueData.gapSize, InsConfig.DPI[0]),  // 18
			// mm2px(primitiveItemValueData.segSize, InsConfig.DPI[0]),  // 19
			// primitiveItemValueData.isFixedStrokeWidth ? 1 : 0,  // 20
		]
		return new Float32Array(typedArray)
	}
}
