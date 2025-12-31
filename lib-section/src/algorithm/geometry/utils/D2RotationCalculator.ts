import { ED2ElementType } from '../../../config/D2ElementProfile'
import { CanvasMatrix4 } from '../../../engine/algorithm/geometry/matrix/CanvasMatrix4'
import { Matrix4 } from '../../../engine/algorithm/geometry/matrix/Matrix4'
import { Vector3 } from '../../../engine/algorithm/geometry/vector/Vector3'
import { D2ImageModel } from '../../../objects/models/primitive2d/D2ImageModel'
import { ElementModelItemBase } from '../../../objects/models/primitive2d/elementBase/ElementModelItemBase'

type TD2ElementRotationResult = {
	rotation: number
	matrix: Matrix4
}
export class D2RotationCalculator {
	static d2ElementRotation(d2ElementItemModel: ElementModelItemBase, newRotation: number): TD2ElementRotationResult {
		const result: TD2ElementRotationResult = {
			rotation: 0,
			matrix: d2ElementItemModel.matrix,
		}
		switch (d2ElementItemModel.modelType) {
			case ED2ElementType.D2Image: {
				const d2ImageModelItem: D2ImageModel = d2ElementItemModel as D2ImageModel
				const prevRation: number = d2ImageModelItem.rotation
				result.rotation = newRotation % (Math.PI * 2)
				result.matrix = d2ImageModelItem.matrix.multiply4(
					CanvasMatrix4.setRotationByLine(
						result.rotation - prevRation,
						new Vector3(
							(d2ImageModelItem.leftUp.x + d2ImageModelItem.leftDown.x + d2ImageModelItem.rightUp.x + d2ImageModelItem.rightDown.x) / 4,
							(d2ImageModelItem.leftUp.y + d2ImageModelItem.leftDown.y + d2ImageModelItem.rightUp.y + d2ImageModelItem.rightDown.y) / 4,
							0
						),
						new Vector3(
							(d2ImageModelItem.leftUp.x + d2ImageModelItem.leftDown.x + d2ImageModelItem.rightUp.x + d2ImageModelItem.rightDown.x) / 4,
							(d2ImageModelItem.leftUp.y + d2ImageModelItem.leftDown.y + d2ImageModelItem.rightUp.y + d2ImageModelItem.rightDown.y) / 4,
							1
						)
					)
				)
				return result
			}
		}
		return result
	}
}
