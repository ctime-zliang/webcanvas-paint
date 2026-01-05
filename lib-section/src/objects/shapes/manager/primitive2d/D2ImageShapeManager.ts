import { BaseManager } from '../../../../manager/BaseManage'
import { RtreeItem } from '../../../../utils/RtreeItem'
import { TRtreeNodeItem } from '../../../../algorithm/rtree2/Rtree'
import { D2ImageModelManager } from '../../../models/manager/primitive2d/D2ImageModelManager'
import { D2ImageModel } from '../../../models/primitive2d/D2ImageModel'
import { D2ImageShape } from '../../primitive2d/D2ImageShape'
import { EFrameCommand } from '../../../../config/CommandEnum'
import { Color } from '../../../../engine/common/Color'
import { Vector2 } from '../../../../engine/algorithm/geometry/vector/Vector2'
import { Constant } from '../../../../Constant'
import { nextFrameTick } from '../../../../engine/utils/Utils'

export class D2ImageShapeManager extends BaseManager<D2ImageShape> {
	private static instance: D2ImageShapeManager
	public static getInstance(): D2ImageShapeManager {
		if (D2ImageShapeManager.instance === undefined) {
			D2ImageShapeManager.instance = new D2ImageShapeManager()
		}
		return D2ImageShapeManager.instance
	}

	private _rteeItems: Map<string, RtreeItem>
	constructor() {
		super()
		this._rteeItems = new Map()
	}

	public createShapeItem(
		elementItemId: string,
		layerItemId: string,
		position: Vector2,
		fileHashUuid: string,
		imageDataURL: string,
		width: number,
		height: number,
		strokeWidth: number = 0,
		strokeColor: Color = new Color(0, 0, 0, 1),
		alpha: number = 1.0,
		rotation: number = 0,
		isFlipX: boolean = false,
		isFlipY: boolean = false
	): D2ImageShape {
		const elementModelItem: D2ImageModel = D2ImageModelManager.getInstance().createModelItem(
			elementItemId,
			layerItemId,
			fileHashUuid,
			imageDataURL,
			position,
			width,
			height,
			strokeWidth,
			strokeColor,
			alpha,
			rotation,
			isFlipX,
			isFlipY
		)
		const elementShapeItem: D2ImageShape = new D2ImageShape(elementModelItem)
		const op: boolean = this.addCache(elementShapeItem)
		this.refreshTexImageSource(elementModelItem, fileHashUuid)
		return elementShapeItem
	}

	public deleteShapeItem(elementItemId: string): void {
		const elementShapeItem: D2ImageShape = this.items.get(elementItemId)!
		if (!elementShapeItem) {
			return
		}
		const op: boolean = this.deleteCache(elementItemId)
		if (op === false) {
			return
		}
		D2ImageModelManager.getInstance().deleteModelItem(elementItemId)
		elementShapeItem.setDelete()
	}

	private addCache(elementShapeItem: D2ImageShape): boolean {
		this.items.set(elementShapeItem.model.elementItemId, elementShapeItem)
		return true
	}

	private deleteCache(elementItemId: string): boolean {
		const targetShapeItem: D2ImageShape = this.items.get(elementItemId)!
		if (!targetShapeItem) {
			return false
		}
		const rtreeItem: RtreeItem = this._rteeItems.get(elementItemId)!
		if (targetShapeItem.isContentReady()) {
			const deleteResults: Array<TRtreeNodeItem> = Constant.rtree.remove(RtreeItem.getSimpleRectFromModelBbox2(targetShapeItem), rtreeItem)
			if (!deleteResults.length) {
				return false
			}
		}
		this.items.delete(elementItemId)
		this._rteeItems.delete(elementItemId)
		return true
	}

	public refreshTexImageSource(elementModelItem: D2ImageModel, fileHashUuid: string): void {
		Constant.imageReSourceService.addImageLoadTaskItem(
			elementModelItem.elementItemId,
			fileHashUuid,
			elementModelItem.imageDataURL,
			(imageId: string, fileHashUuid: string, texImageSource: TexImageSource): void => {
				const elementShapeItem: D2ImageShape = this.items.get(imageId)!
				if (!elementShapeItem) {
					return
				}
				elementShapeItem.flushTexImageSource(texImageSource)
				elementShapeItem.setContentReadyStatus(true)
				if (elementShapeItem.isContentReady()) {
					const rtreeItem: RtreeItem = new RtreeItem(elementShapeItem)
					this._rteeItems.set(elementShapeItem.model.elementItemId, rtreeItem)
					Constant.rtree.insertItemData(RtreeItem.getSimpleRectFromModelBbox2(elementShapeItem), rtreeItem)
				}
				nextFrameTick((): void => {
					elementShapeItem.updateRender()
					Constant.messageTool.messageBus.publish(EFrameCommand.RENDER_FRAME, null)
				})
			}
		)
	}

	public quit(): void {
		super.quit()
		D2ImageShapeManager.instance = undefined!
	}
}
