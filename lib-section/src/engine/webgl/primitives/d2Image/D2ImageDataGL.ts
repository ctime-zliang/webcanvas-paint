import { InsConfig } from '../../../common/InsConfig'
import { mm2px } from '../../../math/Calculation'
import { TElementD2ImageJSONData } from '../../../types/Primitive'
import { FLOAT_32_ARRAY_BYTESIZE } from '../../buffer/DataBufferGL'
import { PtType } from '../PrimitiveGL'

export class D2ImageDataGL {
	static ITEM_SIZE: number = 14
	static STRIDE: number = 14 * FLOAT_32_ARRAY_BYTESIZE
	static createArrayData(primitiveItemValueData: TElementD2ImageJSONData, layerAlpha: number = 1.0): Float32Array {
		const typedArray: Array<number> = [
			PtType.D2_IMAGE, // 0
			/* ... */
			mm2px(primitiveItemValueData.leftUp.x, InsConfig.DPI[0]), // 1
			mm2px(primitiveItemValueData.leftUp.y, InsConfig.DPI[1]), // 2
			mm2px(primitiveItemValueData.leftDown.x, InsConfig.DPI[0]), // 3
			mm2px(primitiveItemValueData.leftDown.y, InsConfig.DPI[1]), // 4
			/* ... */
			mm2px(primitiveItemValueData.rightUp.x, InsConfig.DPI[0]), // 5
			mm2px(primitiveItemValueData.rightUp.y, InsConfig.DPI[1]), // 6
			mm2px(primitiveItemValueData.rightDown.x, InsConfig.DPI[0]), // 7
			mm2px(primitiveItemValueData.rightDown.y, InsConfig.DPI[1]), // 8
			/* ... */
			primitiveItemValueData.alpha * layerAlpha, // 9
			primitiveItemValueData.rotation, // 10
			primitiveItemValueData.isFlipX ? 1 : 0, // 11
			primitiveItemValueData.isFlipY ? 1 : 0, // 12
			/* ... */
			0, // 13
		]
		return new Float32Array(typedArray)
	}
}
