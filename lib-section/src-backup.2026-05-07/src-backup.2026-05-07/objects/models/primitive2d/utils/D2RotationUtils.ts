import { D2RectToolkit } from '../../../../algorithm/geometry/D2RectToolkit'
import { ED2ElementType } from '../../../../config/D2ElementProfile'
import { Matrix4 } from '../../../../engine/algorithm/geometry/matrix/Matrix4'
import { Vector2 } from '../../../../engine/algorithm/geometry/vector/Vector2'
import { POINT_ARRAY_OCCUPY_SIZE } from '../../../../service/TextFontService'
import { D2ImageModel } from '../D2ImageModel'
import { D2RectModel } from '../D2RectModel'
import { D2TextModel } from '../D2TextModel'
import { D2ElementModelItemBase } from '../elementBase/D2ElementModelItemBase'

export class D2RotationUtils {
	public static d2ElementRotation(
		d2ElementItemModel: D2ElementModelItemBase,
		newRotation: number
	): {
		rotation: number
		matrix4: Matrix4
	} {
		switch (d2ElementItemModel.modelType) {
			case ED2ElementType.D2Text: {
				const d2ModelItem: D2TextModel = d2ElementItemModel as D2TextModel
				if (!d2ModelItem.contentReady || newRotation === d2ModelItem.rotation) {
					return {
						rotation: d2ModelItem.rotation,
						matrix4: d2ElementItemModel.matrix,
					}
				}
				const { rotation, maxtrix4 } = D2RectToolkit.rotationTranslate(
					newRotation,
					d2ModelItem.rotation,
					d2ModelItem.leftUp,
					d2ModelItem.rightUp,
					d2ModelItem.leftDown,
					d2ModelItem.rightDown
				)
				const allPositions: Array<number> = d2ModelItem.getVertexData().positions
				for (let j: number = 0; j < allPositions.length; j += POINT_ARRAY_OCCUPY_SIZE) {
					const v2: Vector2 = new Vector2(allPositions[j], allPositions[j + 1]).multiplyMatrix4(maxtrix4)
					allPositions[j] = v2.x
					allPositions[j + 1] = v2.y
				}
				return {
					rotation,
					matrix4: d2ModelItem.matrix.multiply4(maxtrix4),
				}
			}
			case ED2ElementType.D2Rect: {
				const d2ModelItem: D2RectModel = d2ElementItemModel as D2RectModel
				const { rotation, maxtrix4 } = D2RectToolkit.rotationTranslate(
					newRotation,
					d2ModelItem.rotation,
					d2ModelItem.leftUp,
					d2ModelItem.rightUp,
					d2ModelItem.leftDown,
					d2ModelItem.rightDown
				)
				return {
					rotation,
					matrix4: d2ModelItem.matrix.multiply4(maxtrix4),
				}
			}
			case ED2ElementType.D2Image: {
				const d2ModelItem: D2ImageModel = d2ElementItemModel as D2ImageModel
				const { rotation, maxtrix4 } = D2RectToolkit.rotationTranslate(
					newRotation,
					d2ModelItem.rotation,
					d2ModelItem.leftUp,
					d2ModelItem.rightUp,
					d2ModelItem.leftDown,
					d2ModelItem.rightDown
				)
				return {
					rotation,
					matrix4: d2ModelItem.matrix.multiply4(maxtrix4),
				}
			}
		}
		return {
			rotation: newRotation % (Math.PI * 2),
			matrix4: d2ElementItemModel.matrix,
		}
	}
}
