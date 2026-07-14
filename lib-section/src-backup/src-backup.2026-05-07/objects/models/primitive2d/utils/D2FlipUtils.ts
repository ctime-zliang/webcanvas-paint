import { D2RectToolkit } from '../../../../algorithm/geometry/D2RectToolkit'
import { ED2ElementType } from '../../../../config/D2ElementProfile'
import { Matrix4 } from '../../../../engine/algorithm/geometry/matrix/Matrix4'
import { D2ImageModel } from '../D2ImageModel'
import { D2RectModel } from '../D2RectModel'
import { D2TextModel } from '../D2TextModel'
import { D2ElementModelItemBase } from '../elementBase/D2ElementModelItemBase'

export class D2FlipUtils {
	public static d2ElementFlipX(d2ElementItemModel: D2ElementModelItemBase): {
		matrix4: Matrix4
	} {
		switch (d2ElementItemModel.modelType) {
			case ED2ElementType.D2Text: {
				const d2ModelItem: D2TextModel = d2ElementItemModel as D2TextModel
				if (!d2ModelItem.contentReady) {
					return {
						matrix4: d2ModelItem.matrix,
					}
				}
				const { maxtrix4 } = D2RectToolkit.flipXTranslate(
					d2ModelItem.leftUp,
					d2ModelItem.rightUp,
					d2ModelItem.leftDown,
					d2ModelItem.rightDown
				)
				return {
					matrix4: d2ModelItem.matrix.multiply4(maxtrix4),
				}
			}
			case ED2ElementType.D2Rect: {
				const d2ModelItem: D2RectModel = d2ElementItemModel as D2RectModel
				const { maxtrix4 } = D2RectToolkit.flipXTranslate(
					d2ModelItem.leftUp,
					d2ModelItem.rightUp,
					d2ModelItem.leftDown,
					d2ModelItem.rightDown
				)
				return {
					matrix4: d2ModelItem.matrix.multiply4(maxtrix4),
				}
			}
			case ED2ElementType.D2Image: {
				const d2ModelItem: D2ImageModel = d2ElementItemModel as D2ImageModel
				const { maxtrix4 } = D2RectToolkit.flipXTranslate(
					d2ModelItem.leftUp,
					d2ModelItem.rightUp,
					d2ModelItem.leftDown,
					d2ModelItem.rightDown
				)
				return {
					matrix4: d2ModelItem.matrix.multiply4(maxtrix4),
				}
			}
		}
		return {
			matrix4: d2ElementItemModel.matrix,
		}
	}

	public static d2ElementFlipY(d2ElementItemModel: D2ElementModelItemBase): {
		matrix4: Matrix4
	} {
		switch (d2ElementItemModel.modelType) {
			case ED2ElementType.D2Text: {
				const d2ModelItem: D2TextModel = d2ElementItemModel as D2TextModel
				if (!d2ModelItem.contentReady) {
					return {
						matrix4: d2ModelItem.matrix,
					}
				}
				const { maxtrix4 } = D2RectToolkit.flipYTranslate(
					d2ModelItem.leftUp,
					d2ModelItem.rightUp,
					d2ModelItem.leftDown,
					d2ModelItem.rightDown
				)
				return {
					matrix4: d2ModelItem.matrix.multiply4(maxtrix4),
				}
			}
			case ED2ElementType.D2Rect: {
				const d2ModelItem: D2RectModel = d2ElementItemModel as D2RectModel
				const { maxtrix4 } = D2RectToolkit.flipYTranslate(
					d2ModelItem.leftUp,
					d2ModelItem.rightUp,
					d2ModelItem.leftDown,
					d2ModelItem.rightDown
				)
				return {
					matrix4: d2ModelItem.matrix.multiply4(maxtrix4),
				}
			}
			case ED2ElementType.D2Image: {
				const d2ModelItem: D2ImageModel = d2ElementItemModel as D2ImageModel
				const { maxtrix4 } = D2RectToolkit.flipYTranslate(
					d2ModelItem.leftUp,
					d2ModelItem.rightUp,
					d2ModelItem.leftDown,
					d2ModelItem.rightDown
				)
				return {
					matrix4: d2ModelItem.matrix.multiply4(maxtrix4),
				}
			}
		}
		return {
			matrix4: d2ElementItemModel.matrix,
		}
	}
}
