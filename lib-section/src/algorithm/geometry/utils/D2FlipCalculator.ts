import { ED2ElementType } from '../../../config/D2ElementProfile'
import { CanvasMatrix4 } from '../../../engine/algorithm/geometry/matrix/CanvasMatrix4'
import { Vector2 } from '../../../engine/algorithm/geometry/vector/Vector2'
import { Vector3 } from '../../../engine/algorithm/geometry/vector/Vector3'
import { D2ImageModel } from '../../../objects/models/primitive2d/D2ImageModel'
import { ElementModelItemBase } from '../../../objects/models/primitive2d/elementBase/ElementModelItemBase'

export class D2FlipCalculator {
	static d2ElementFlip(d2ElementItemModel: ElementModelItemBase): void {
		switch (d2ElementItemModel.modelType) {
			case ED2ElementType.D2Image: {
				const d2ImageModelItem: D2ImageModel = d2ElementItemModel as D2ImageModel
			}
		}
	}
}
