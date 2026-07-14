import { Vector2 } from '../../../engine/algorithm/geometry/vector/Vector2'
import { D2AssistPointShape } from '../../../objects/assist/primitive2d/D2AssistPointShape'
import { BaseSelectionTool } from '../BaseSelectionTool'

export abstract class D2SelectionTool extends BaseSelectionTool {
	constructor() {
		super()
	}

	protected isSelectAssistPoint(assistPoint: D2AssistPointShape, x: number, y: number): boolean {
		const zoomRatio: number = this.camrea.getZoomRatio()
		const point: Vector2 = new Vector2(x, y)
		const centerPoint: Vector2 = new Vector2(assistPoint.centerPoint.x, assistPoint.centerPoint.y)
		const distOfClickPointAndCenterPoint: number = point.sub(centerPoint).length
		if (distOfClickPointAndCenterPoint <= assistPoint.size / zoomRatio) {
			return true
		}
		return false
	}
}
