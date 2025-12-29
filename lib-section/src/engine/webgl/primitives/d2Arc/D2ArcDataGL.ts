import { InsConfig } from '../../../common/InsConfig'
import { mm2px } from '../../../math/Calculation'
import { TColorRGBAJSON } from '../../../common/Color'
import { ESweep } from '../../../config/CommonProfile'
import { ECanvas2DLineCap } from '../../../config/PrimitiveProfile'
import { TElementD2ArcJSONData } from '../../../types/Primitive'
import { FLOAT_32_ARRAY_BYTESIZE } from '../../buffer/DataBufferGL'
import { PtType } from '../PrimitiveGL'

export class D2ArcDataGL {
	static ITEM_SIZE: number = 21
	static STRIDE: number = 21 * FLOAT_32_ARRAY_BYTESIZE
	static createArrayData(primitiveItemValueData: TElementD2ArcJSONData, layerAlpha: number = 1.0): Float32Array {
		const { startAngle, endAngle, sweep } = primitiveItemValueData
		let sng: number = startAngle % (Math.PI * 2)
		let eng: number = endAngle % (Math.PI * 2)
		let sng1: number = sweep === ESweep.CCW ? sng : eng
		let eng1: number = sweep === ESweep.CCW ? eng : sng
		const fillColorData: TColorRGBAJSON = primitiveItemValueData.fillColorData ? primitiveItemValueData.fillColorData : { r: 0, g: 0, b: 0, a: 0 }
		const typedArray: Array<number> = [
			PtType.D2_ARC, // 0
			/* ... */
			mm2px(primitiveItemValueData.centerPoint.x, InsConfig.DPI[0]), // 1
			mm2px(primitiveItemValueData.centerPoint.y, InsConfig.DPI[1]), // 2
			mm2px(0, InsConfig.DPI[0]), // 3
			mm2px(primitiveItemValueData.radius, InsConfig.DPI[0]), // 4
			/* ... */
			sng1, // 5
			eng1, // 6
			eng1 > sng1 ? eng1 - sng1 : eng1 - sng1 + Math.PI, // 7
			0, // 8
			/* ... */
			primitiveItemValueData.alpha * layerAlpha, // 9
			primitiveItemValueData.lineCap === ECanvas2DLineCap.ROUND ? 1.0 : 0.0, // 10
			mm2px(primitiveItemValueData.strokeWidth, InsConfig.DPI[0]), // 11
			primitiveItemValueData.isFill ? 1.0 : 0.0, // 12
			/* ... */
			primitiveItemValueData.strokeColorData.r, // 13
			primitiveItemValueData.strokeColorData.g, // 14
			primitiveItemValueData.strokeColorData.b, // 15
			primitiveItemValueData.strokeColorData.a, // 16
			/* ... */
			fillColorData.r, // 17
			fillColorData.g, // 18
			fillColorData.b, // 19
			fillColorData.a, // 20
			/* ... */
			// primitiveItemValueData.isSolid ? 1 : 0,  // 21
			// mm2px(primitiveItemValueData.gapSize, InsConfig.DPI[0]),  // 22
			// mm2px(primitiveItemValueData.segSize, InsConfig.DPI[0]),  // 23
			// primitiveItemValueData.isFixedStrokeWidth ? 1 : 0,  // 24
		]
		return new Float32Array(typedArray)
	}
}
