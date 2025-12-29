import { ED2ElementType } from '../../config/D2ElementProfile'
import { Scene } from '../../engine/common/Scene'
import { BaseManager } from '../../manager/BaseManage'
import { ElementShapeItemBase } from '../../objects/shapes/primitive2d/elementBase/ElementShapeItemBase'
import { D2ArcView } from '../views/shapes/primitive2d/D2ArcView'
import { D2CircleView } from '../views/shapes/primitive2d/D2CircleView'
import { D2ImageView } from '../views/shapes/primitive2d/D2ImageView'
import { D2LineView } from '../views/shapes/primitive2d/D2LineView'
import { D2PointView } from '../views/shapes/primitive2d/D2PointView'
import { D2RectView } from '../views/shapes/primitive2d/D2RectView'
import { D2TextView } from '../views/shapes/primitive2d/D2TextView'
import { ShapeElementViewBase } from '../views/shapes/primitive2d/elementBase/ShapeElementViewBase'

export class ShapeViewManager extends BaseManager<ShapeElementViewBase> {
	private static instance: ShapeViewManager
	public static getInstance(): ShapeViewManager {
		if (ShapeViewManager.instance === undefined) {
			ShapeViewManager.instance = new ShapeViewManager()
		}
		return ShapeViewManager.instance
	}

	constructor() {
		super()
	}

	public handleModify(scene: Scene, elements: Set<ElementShapeItemBase>): void {
		for (let element of elements) {
			if (element.killed) {
				this.deleteItem(element.elementItemId)
				continue
			}
			this.modifyItem(element)
		}
	}

	public modifyItem(elementShapeObject: ElementShapeItemBase): void {
		const { elementItemId } = elementShapeObject
		const elementType: ED2ElementType = elementShapeObject.getType()
		let elementItem: ShapeElementViewBase = this.items.get(elementItemId) as ShapeElementViewBase
		if (!elementItem) {
			let newElementItem: ShapeElementViewBase = null!
			switch (elementType) {
				case ED2ElementType.D2Point: {
					newElementItem = new D2PointView(elementShapeObject)
					break
				}
				case ED2ElementType.D2AssistLine: {
					newElementItem = new D2LineView(elementShapeObject)
					break
				}
				case ED2ElementType.D2Line: {
					newElementItem = new D2LineView(elementShapeObject)
					break
				}
				case ED2ElementType.D2Circle: {
					newElementItem = new D2CircleView(elementShapeObject)
					break
				}
				case ED2ElementType.D2Arc: {
					newElementItem = new D2ArcView(elementShapeObject)
					break
				}
				case ED2ElementType.D2Text: {
					newElementItem = new D2TextView(elementShapeObject)
					break
				}
				case ED2ElementType.D2Image: {
					newElementItem = new D2ImageView(elementShapeObject)
					break
				}
				case ED2ElementType.D2Rect: {
					newElementItem = new D2RectView(elementShapeObject)
					break
				}
			}
			if (newElementItem) {
				this.items.set(elementShapeObject.elementItemId, newElementItem)
				elementItem = newElementItem
			}
		}
		if (elementItem) {
			elementItem.modify(elementShapeObject)
		}
	}

	public deleteItem(elementItemId: string): void {
		const elementItem: ShapeElementViewBase = this.items.get(elementItemId)!
		if (!elementItem) {
			return
		}
		elementItem.delete()
		this.items.delete(elementItemId)
	}

	public quit(): void {
		super.quit()
		ShapeViewManager.instance = undefined!
	}
}
