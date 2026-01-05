import { D2RectTransform } from '../../../../algorithm/geometry/D2RectTransform'
import { ED2ElementType } from '../../../../config/D2ElementProfile'
import { Matrix4 } from '../../../../engine/algorithm/geometry/matrix/Matrix4'
import { D2ImageModel } from '../D2ImageModel'
import { ElementModelItemBase } from '../elementBase/ElementModelItemBase'

export class D2FlipUtils {
	static d2ElementFlipX(d2ElementItemModel: ElementModelItemBase): {
		matrix4: Matrix4
	} {
		switch (d2ElementItemModel.modelType) {
			case ED2ElementType.D2Image: {
				const d2ImageModelItem: D2ImageModel = d2ElementItemModel as D2ImageModel
				const { maxtrix4 } = D2RectTransform.flipXTranslate(
					d2ImageModelItem.leftUp,
					d2ImageModelItem.rightUp,
					d2ImageModelItem.leftDown,
					d2ImageModelItem.rightDown
				)
				return {
					matrix4: d2ImageModelItem.matrix.multiply4(maxtrix4),
				}
			}
		}
		return {
			matrix4: d2ElementItemModel.matrix,
		}
	}

	static d2ElementFlipY(d2ElementItemModel: ElementModelItemBase): {
		matrix4: Matrix4
	} {
		switch (d2ElementItemModel.modelType) {
			case ED2ElementType.D2Image: {
				const d2ImageModelItem: D2ImageModel = d2ElementItemModel as D2ImageModel
				const { maxtrix4 } = D2RectTransform.flipYTranslate(
					d2ImageModelItem.leftUp,
					d2ImageModelItem.rightUp,
					d2ImageModelItem.leftDown,
					d2ImageModelItem.rightDown
				)
				return {
					matrix4: d2ImageModelItem.matrix.multiply4(maxtrix4),
				}
			}
		}
		return {
			matrix4: d2ElementItemModel.matrix,
		}
	}
}
