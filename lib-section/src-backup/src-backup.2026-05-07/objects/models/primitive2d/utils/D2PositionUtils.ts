import { ED2ElementType } from '../../../../config/D2ElementProfile'
import { CanvasMatrix4 } from '../../../../engine/algorithm/geometry/matrix/CanvasMatrix4'
import { Matrix4 } from '../../../../engine/algorithm/geometry/matrix/Matrix4'
import { Vector2 } from '../../../../engine/algorithm/geometry/vector/Vector2'
import { Vector3 } from '../../../../engine/algorithm/geometry/vector/Vector3'
import { POINT_ARRAY_OCCUPY_SIZE } from '../../../../service/TextFontService'
import { D2TextModel } from '../D2TextModel'
import { D2ElementModelItemBase } from '../elementBase/D2ElementModelItemBase'

export class D2PositionUtils {
	public static d2ElementPosition(
		d2ElementItemModel: D2ElementModelItemBase,
		newPosition: Vector2
	): {
		position: Vector2
		matrix4: Matrix4
	} {
		const prevPosition: Vector2 = d2ElementItemModel.position
		const diffX: number = newPosition.x - prevPosition.x
		const diffY: number = newPosition.y - prevPosition.y
		switch (d2ElementItemModel.modelType) {
			case ED2ElementType.D2Text: {
				const d2ModelItem: D2TextModel = d2ElementItemModel as D2TextModel
				if (!d2ModelItem.contentReady || (diffX === 0 && diffY === 0)) {
					return {
						position: d2ModelItem.position,
						matrix4: d2ModelItem.matrix,
					}
				}
				const allPositions: Array<number> = d2ModelItem.getVertexData().positions
				for (let j: number = 0; j < allPositions.length; j += POINT_ARRAY_OCCUPY_SIZE) {
					allPositions[j] += diffX
					allPositions[j + 1] += diffY
				}
				const matrix4: Matrix4 = CanvasMatrix4.setTranslateByVector3(new Vector3(diffX, diffY, 0))
				return {
					position: newPosition,
					matrix4: d2ModelItem.matrix.multiply4(matrix4),
				}
			}
			default: {
				const matrix4: Matrix4 = CanvasMatrix4.setTranslateByVector3(new Vector3(diffX, diffY, 0))
				return {
					position: newPosition,
					matrix4: d2ElementItemModel.matrix.multiply4(matrix4),
				}
			}
		}
	}
}
