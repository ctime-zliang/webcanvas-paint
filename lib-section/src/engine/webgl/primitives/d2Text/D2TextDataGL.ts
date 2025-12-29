import { InsConfig } from '../../../common/InsConfig'
import { mm2px } from '../../../math/Calculation'
import { TElementD2TextJSONData } from '../../../types/Primitive'
import { FLOAT_32_ARRAY_BYTESIZE } from '../../buffer/DataBufferGL'
import { PtType } from '../PrimitiveGL'

export class D2TextDataGL {
	static ITEM_SIZE: number = 11
	static STRIDE: number = 11 * FLOAT_32_ARRAY_BYTESIZE
	static createArrayData(primitiveItemValueData: TElementD2TextJSONData, layerAlpha: number = 1.0): Float32Array {
		const sourcePositions: Array<number> = primitiveItemValueData.vertexData.positions
		const allPositions: Array<number> = [PtType.D2_TEXT]
		for (let i: number = 0; i < sourcePositions.length; i++) {
			/**
			 * 参考 primitiveItemValueData.vertexData.positions 点坐标的数值表示形式, 数组中每 2 个项表示 1 个点坐标
			 */
			if (i > 0 && i % 2 === 0) {
				/**
				 * 补充 Z 轴值
				 */
				allPositions.push(0)
				allPositions.push(
					primitiveItemValueData.alpha * layerAlpha,
					primitiveItemValueData.fontSize,
					0,
					0,
					/* ... */
					primitiveItemValueData.strokeColorData.r,
					primitiveItemValueData.strokeColorData.g,
					primitiveItemValueData.strokeColorData.b,
					primitiveItemValueData.strokeColorData.a
				)
			}
			allPositions.push(mm2px(sourcePositions[i], InsConfig.DPI[0]))
		}
		/**
		 * 补充 Z 轴值
		 */
		allPositions.push(0)
		allPositions.push(
			primitiveItemValueData.alpha * layerAlpha,
			primitiveItemValueData.fontSize,
			0,
			0,
			/* ... */
			primitiveItemValueData.strokeColorData.r,
			primitiveItemValueData.strokeColorData.g,
			primitiveItemValueData.strokeColorData.b,
			primitiveItemValueData.strokeColorData.a
		)
		return new Float32Array(allPositions)
	}
	static createIndicesData(primitiveItemValueData: TElementD2TextJSONData): Uint16Array {
		return new Uint16Array(primitiveItemValueData.vertexData.indices)
	}
}
