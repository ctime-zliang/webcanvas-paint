import { ED2ElementType } from '../../../config/D2ElementProfile'
import { CanvasMatrix4 } from '../../../engine/algorithm/geometry/matrix/CanvasMatrix4'
import { Matrix4 } from '../../../engine/algorithm/geometry/matrix/Matrix4'
import { Vector3 } from '../../../engine/algorithm/geometry/vector/Vector3'
import { D2ImageModel } from '../../../objects/models/primitive2d/D2ImageModel'
import { ElementModelItemBase } from '../../../objects/models/primitive2d/elementBase/ElementModelItemBase'

type TD2ElementFlipResult = {
	matrix: Matrix4
}
export class D2FlipCalculator {
	static d2ElementFlipX(d2ElementItemModel: ElementModelItemBase): TD2ElementFlipResult {
		const result: TD2ElementFlipResult = {
			matrix: d2ElementItemModel.matrix,
		}
		switch (d2ElementItemModel.modelType) {
			case ED2ElementType.D2Image: {
				const d2ImageModelItem: D2ImageModel = d2ElementItemModel as D2ImageModel
				result.matrix = d2ImageModelItem.matrix.multiply4(
					CanvasMatrix4.setFlipByLine(
						new Vector3(
							(d2ImageModelItem.leftUp.x + d2ImageModelItem.rightUp.x) / 2,
							(d2ImageModelItem.leftUp.y + d2ImageModelItem.rightUp.y) / 2,
							0
						),
						new Vector3(
							(d2ImageModelItem.leftDown.x + d2ImageModelItem.rightDown.x) / 2,
							(d2ImageModelItem.leftDown.y + d2ImageModelItem.rightDown.y) / 2,
							1
						)
					)
				)
				return result
			}
		}
		return result
	}
	static d2ElementFlipY(d2ElementItemModel: ElementModelItemBase): TD2ElementFlipResult {
		const result: TD2ElementFlipResult = {
			matrix: d2ElementItemModel.matrix,
		}
		switch (d2ElementItemModel.modelType) {
			case ED2ElementType.D2Image: {
				const d2ImageModelItem: D2ImageModel = d2ElementItemModel as D2ImageModel
				result.matrix = d2ImageModelItem.matrix.multiply4(
					CanvasMatrix4.setFlipByLine(
						new Vector3(
							(d2ImageModelItem.leftUp.x + d2ImageModelItem.leftDown.x) / 2,
							(d2ImageModelItem.leftUp.y + d2ImageModelItem.leftDown.y) / 2,
							0
						),
						new Vector3(
							(d2ImageModelItem.rightUp.x + d2ImageModelItem.rightDown.x) / 2,
							(d2ImageModelItem.rightUp.y + d2ImageModelItem.rightDown.y) / 2,
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
