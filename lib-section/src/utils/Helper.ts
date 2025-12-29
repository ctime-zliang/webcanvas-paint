import { ED2ElementType } from '../config/D2ElementProfile'
import { D2CircleShapeManager } from '../objects/shapes/manager/primitive2d/D2CircleShapeManager'
import { DrawLayerShapeManager } from '../objects/shapes/manager/DrawLayerShapeManager'
import { D2LineShapeManager } from '../objects/shapes/manager/primitive2d/D2LineShapeManager'
import { TElementShapeType } from '../types/Element'
import { EPlaneType } from '../engine/config/PlaneProfile'
import { DrawLayerShape } from '../objects/shapes/DrawLayerShape'
import { ElementShapeItemBase } from '../objects/shapes/primitive2d/elementBase/ElementShapeItemBase'
import { DrawLayerShapeItemBase } from '../objects/shapes/DrawLayerShapeItemBase'
import { D2ArcShapeManager } from '../objects/shapes/manager/primitive2d/D2ArcShapeManager'
import { D2TextShapeManager } from '../objects/shapes/manager/primitive2d/D2TextShapeManager'
import { D2ImageShapeManager } from '../objects/shapes/manager/primitive2d/D2ImageShapeManager'
import { D2PointShapeManager } from '../objects/shapes/manager/primitive2d/D2PointShapeManager'
import { D2RectShapeManager } from '../objects/shapes/manager/primitive2d/D2RectShapeManager'

export class Helper {
	/**
	 * 获取画布内所有绘制图层
	 */
	public static getAllDrawLayerShapes(): Array<DrawLayerShape> {
		const allDrawLayers: Array<DrawLayerShape> = Array.from(DrawLayerShapeManager.getInstance().items.values())
		return allDrawLayers.filter((item: DrawLayerShape): boolean => {
			return item.model.layerItemType === EPlaneType.ContentPlane
		})
	}

	/**
	 * 获取画布内所有图元
	 */
	public static getAllElementShapes(): Array<TElementShapeType> {
		const targetShapes: Array<TElementShapeType> = [
			...D2LineShapeManager.getInstance().items.values(),
			...D2CircleShapeManager.getInstance().items.values(),
			...D2PointShapeManager.getInstance().items.values(),
			...D2ArcShapeManager.getInstance().items.values(),
			...D2TextShapeManager.getInstance().items.values(),
			...D2ImageShapeManager.getInstance().items.values(),
			...D2RectShapeManager.getInstance().items.values(),
		]
		return targetShapes
	}

	/**
	 * 获取画布内指定图元 ID 对应的图元
	 */
	public static getElementShapeItemById(elementItemId: string): TElementShapeType {
		const allElementShapes: Array<TElementShapeType> = Helper.getAllElementShapes()
		for (let i: number = 0; i < allElementShapes.length; i++) {
			if (allElementShapes[i].elementItemId === elementItemId) {
				return allElementShapes[i]
			}
		}
		return null!
	}

	/**
	 * 获取画布内指定 ShapeType 类型的图元
	 */
	public static getMarkedElementShapeItem(elementItemId: string, markShapeType: ED2ElementType): TElementShapeType {
		if (markShapeType === ED2ElementType.D2Line) {
			return D2LineShapeManager.getInstance().getItemById(elementItemId)
		}
		if (markShapeType === ED2ElementType.D2Circle) {
			return D2CircleShapeManager.getInstance().getItemById(elementItemId)
		}
		if (markShapeType === ED2ElementType.D2Point) {
			return D2PointShapeManager.getInstance().getItemById(elementItemId)
		}
		if (markShapeType === ED2ElementType.D2Arc) {
			return D2ArcShapeManager.getInstance().getItemById(elementItemId)
		}
		if (markShapeType === ED2ElementType.D2Text) {
			return D2TextShapeManager.getInstance().getItemById(elementItemId)
		}
		if (markShapeType === ED2ElementType.D2Image) {
			return D2ImageShapeManager.getInstance().getItemById(elementItemId)
		}
		if (markShapeType === ED2ElementType.D2Rect) {
			return D2RectShapeManager.getInstance().getItemById(elementItemId)
		}
		return null!
	}

	/**
	 * 删除画布内指定图元
	 */
	public static deleteElementShapeItem(elementItem: ElementShapeItemBase): void {
		Helper.deleteMarkedElementShapeItem(elementItem.model.elementItemId, elementItem.getType())
	}

	/**
	 * 删除画布内指定 ShapeType 类型的图元
	 */
	public static deleteMarkedElementShapeItem(elementItemId: string, markShapeType: ED2ElementType): void {
		if (markShapeType === ED2ElementType.D2Line) {
			D2LineShapeManager.getInstance().deleteShapeItem(elementItemId)
			return
		} else if (markShapeType === ED2ElementType.D2Circle) {
			D2CircleShapeManager.getInstance().deleteShapeItem(elementItemId)
			return
		} else if (markShapeType === ED2ElementType.D2Point) {
			D2PointShapeManager.getInstance().deleteShapeItem(elementItemId)
			return
		} else if (markShapeType === ED2ElementType.D2Arc) {
			D2ArcShapeManager.getInstance().deleteShapeItem(elementItemId)
			return
		} else if (markShapeType === ED2ElementType.D2Text) {
			D2TextShapeManager.getInstance().deleteShapeItem(elementItemId)
			return
		} else if (markShapeType === ED2ElementType.D2Image) {
			D2ImageShapeManager.getInstance().deleteShapeItem(elementItemId)
			return
		} else if (markShapeType === ED2ElementType.D2Rect) {
			D2RectShapeManager.getInstance().deleteShapeItem(elementItemId)
			return
		}
	}

	/**
	 * 检测传入的图元 ID 是否合法
	 */
	public static checkDrawLayer(drawLayerItemId: string): { code: number; title: string } {
		const allDrawLayers: Array<DrawLayerShapeItemBase> = Helper.getAllDrawLayerShapes()
		const checkResult: { code: number; title: string } = { code: 0, title: undefined! }
		for (let i: number = 0; i < allDrawLayers.length; i++) {
			if (allDrawLayers[i].model.layerItemId === drawLayerItemId) {
				checkResult.title = allDrawLayers[i].model.layerItemName
				if (allDrawLayers[i].killed) {
					checkResult.code = -1
					return checkResult
				}
				return checkResult
			}
		}
		checkResult.code = -1
		return checkResult
	}
}
