import { ED2ElementType } from '../../../../config/D2ElementProfile'
import { TElementJSONData, TElementShapeType } from '../../../../types/Element'
import { ECommandAction } from '../Config'
import { ElementCommand } from '../ElementCommand'
import { Helper } from '../../../../utils/Helper'
/* ... */
import { D2LineShapeManager } from '../../../../objects/shapes/manager/primitive2d/D2LineShapeManager'
import { D2LineShapeCommand } from './D2LineShapeCommand'
import { D2CircleShapeManager } from '../../../../objects/shapes/manager/primitive2d/D2CircleShapeManager'
import { D2CircleShapeCommand } from './D2CircleShapeCommand'
import { D2ArcShapeManager } from '../../../../objects/shapes/manager/primitive2d/D2ArcShapeManager'
import { D2ArcShapeCommand } from './D2ArcShapeCommand'
import { D2TextShapeCommand } from './D2TextShapeCommand'
import { D2TextShapeManager } from '../../../../objects/shapes/manager/primitive2d/D2TextShapeManager'
import { D2ImageShapeManager } from '../../../../objects/shapes/manager/primitive2d/D2ImageShapeManager'
import { D2ImageShapeCommand } from './D2ImageShapeCommand'
import { D2PointShapeCommand } from './D2PointShapeCommand'
import { D2PointShapeManager } from '../../../../objects/shapes/manager/primitive2d/D2PointShapeManager'
import { D2RectShapeCommand } from './D2RectShapeCommand'
import { D2RectShapeManager } from '../../../../objects/shapes/manager/primitive2d/D2RectShapeManager'

export class CommandProxy {
	public static getCommandInstance(
		elementItemId: string,
		action: ECommandAction,
		groupId: string = String(performance.now())
	): ElementCommand<TElementJSONData> {
		const elementItem: TElementShapeType = Helper.getElementShapeItemById(elementItemId)
		if (!elementItem) {
			throw new Error(`error in determining the type of occurrence in instantiating entity history records.`)
		}
		const elementItemModelType: ED2ElementType = elementItem.model.modelType
		const setGroupId: string = groupId || String(performance.now())
		if (elementItemModelType === ED2ElementType.D2Line) {
			return new D2LineShapeCommand(D2LineShapeManager.getInstance().getItemById(elementItemId), setGroupId, action)
		}
		if (elementItemModelType === ED2ElementType.D2Circle) {
			return new D2CircleShapeCommand(D2CircleShapeManager.getInstance().getItemById(elementItemId), setGroupId, action)
		}
		if (elementItemModelType === ED2ElementType.D2Point) {
			return new D2PointShapeCommand(D2PointShapeManager.getInstance().getItemById(elementItemId), setGroupId, action)
		}
		if (elementItemModelType === ED2ElementType.D2Arc) {
			return new D2ArcShapeCommand(D2ArcShapeManager.getInstance().getItemById(elementItemId), setGroupId, action)
		}
		if (elementItemModelType === ED2ElementType.D2Text) {
			return new D2TextShapeCommand(D2TextShapeManager.getInstance().getItemById(elementItemId), setGroupId, action)
		}
		if (elementItemModelType === ED2ElementType.D2Image) {
			return new D2ImageShapeCommand(D2ImageShapeManager.getInstance().getItemById(elementItemId), setGroupId, action)
		}
		if (elementItemModelType === ED2ElementType.D2Rect) {
			return new D2RectShapeCommand(D2RectShapeManager.getInstance().getItemById(elementItemId), setGroupId, action)
		}
		throw new Error(`error in determining the type of occurrence in instantiating entity history records.`)
	}
}
