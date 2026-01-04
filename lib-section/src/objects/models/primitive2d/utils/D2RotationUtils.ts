import { D2RectTransform } from '../../../../algorithm/geometry/D2RectTransform'
import { ED2ElementType } from '../../../../config/D2ElementProfile'
import { BBox2 } from '../../../../engine/algorithm/geometry/bbox/BBox2'
import { Matrix4 } from '../../../../engine/algorithm/geometry/matrix/Matrix4'
import { D2ImageModel } from '../D2ImageModel'
import { ElementModelItemBase } from '../elementBase/ElementModelItemBase'

export class D2RotationUtils {
	static d2ElementRotation(
		d2ElementItemModel: ElementModelItemBase,
		newRotation: number
	): {
		rotation: number
		matrix4: Matrix4
		bbox2: BBox2
	} {
		switch (d2ElementItemModel.modelType) {
			case ED2ElementType.D2Image: {
				const d2ImageModelItem: D2ImageModel = d2ElementItemModel as D2ImageModel
				const { rotation, maxtrix4, bbox2 } = D2RectTransform.rotationTranslate(
					newRotation,
					d2ImageModelItem.rotation,
					d2ImageModelItem.leftUp,
					d2ImageModelItem.rightUp,
					d2ImageModelItem.leftDown,
					d2ImageModelItem.rightDown
				)
				return {
					rotation,
					matrix4: d2ImageModelItem.matrix.multiply4(maxtrix4),
					bbox2,
				}
			}
		}
		return {
			rotation: 0,
			matrix4: d2ElementItemModel.matrix,
			bbox2: d2ElementItemModel.bbox2,
		}
	}
}
