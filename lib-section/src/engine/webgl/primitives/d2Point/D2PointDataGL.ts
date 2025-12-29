import { InsConfig } from '../../../common/InsConfig'
import { mm2px } from '../../../math/Calculation'
import { ED2PointShape } from '../../../config/PrimitiveProfile'
import { TElementD2PointJSONData } from '../../../types/Primitive'
import { FLOAT_32_ARRAY_BYTESIZE } from '../../buffer/DataBufferGL'
import { PtType } from '../PrimitiveGL'

export class D2PointDataGL {
	static ITEM_SIZE: number = 13
	static STRIDE: number = 13 * FLOAT_32_ARRAY_BYTESIZE
	static createArrayData(primitiveItemValueData: TElementD2PointJSONData, layerAlpha: number = 1.0): Float32Array {
		const { isEnableScale, shape } = primitiveItemValueData
		const typedArray: Array<number> = [
			PtType.D2_POINT, // 0
			/* ... */
			mm2px(primitiveItemValueData.centerPoint.x, InsConfig.DPI[0]), // 1
			mm2px(primitiveItemValueData.centerPoint.y, InsConfig.DPI[1]), // 2
			mm2px(0, InsConfig.DPI[0]), // 3
			mm2px(primitiveItemValueData.size, InsConfig.DPI[0]), // 4
			/* ... */
			primitiveItemValueData.alpha * layerAlpha, // 5
			isEnableScale ? 1.0 : 0.0, // 6
			shape === ED2PointShape.DOT ? 1.0 : 2.0, // 7
			0.0, // 8
			/* ... */
			primitiveItemValueData.strokeColorData.r, // 9
			primitiveItemValueData.strokeColorData.g, // 10
			primitiveItemValueData.strokeColorData.b, // 11
			primitiveItemValueData.strokeColorData.a, // 12
		]
		return new Float32Array(typedArray)
	}
}
