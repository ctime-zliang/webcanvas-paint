import { Constant } from '../../../Constant'
import { Plane } from '../../../engine/common/Plane'
import {
	TElement2DArcJSONViewData,
	TElement2DCircleJSONViewData,
	TElement2DImageJSONViewData,
	TElement2DLineJSONViewData,
	TElement2DPointJSONViewData,
	TElement2DTextJSONViewData,
} from '../../../types/Element'
import { DrawLayerView } from './DrawLayerView'

export class DrawLayerViewPayloads {
	private _parent: DrawLayerView
	/* ... */
	private _d2PointsProfileDeleted: Set<string>
	private _d2PointsProfileCreated: Map<string, TElement2DPointJSONViewData>
	private _d2PointsProfileUpdated: Map<string, TElement2DPointJSONViewData>
	/* ... */
	private _d2LinesProfileDeleted: Set<string>
	private _d2LinesProfileCreated: Map<string, TElement2DLineJSONViewData>
	private _d2LinesProfileUpdated: Map<string, TElement2DLineJSONViewData>
	/* ... */
	private _d2CirclesProfileDeleted: Set<string>
	private _d2CirclesProfileCreated: Map<string, TElement2DCircleJSONViewData>
	private _d2CirclesProfileUpdated: Map<string, TElement2DCircleJSONViewData>
	/* ... */
	private _d2ArcsProfileDeleted: Set<string>
	private _d2ArcsProfileCreated: Map<string, TElement2DArcJSONViewData>
	private _d2ArcsProfileUpdated: Map<string, TElement2DArcJSONViewData>
	/* ... */
	private _d2TextsProfileDeleted: Set<string>
	private _d2TextsProfileCreated: Map<string, TElement2DTextJSONViewData>
	private _d2TextsProfileUpdated: Map<string, TElement2DTextJSONViewData>
	/* ... */
	private _d2ImagesProfileDeleted: Set<string>
	private _d2ImagesProfileCreated: Map<string, TElement2DImageJSONViewData & { texture: WebGLTexture }>
	private _d2ImagesProfileUpdated: Map<string, TElement2DImageJSONViewData & { texture: WebGLTexture }>
	constructor(parent: DrawLayerView) {
		this._parent = parent
		this._d2PointsProfileDeleted = new Set()
		this._d2PointsProfileCreated = new Map()
		this._d2PointsProfileUpdated = new Map()
		/* ... */
		this._d2LinesProfileDeleted = new Set()
		this._d2LinesProfileCreated = new Map()
		this._d2LinesProfileUpdated = new Map()
		/* ... */
		this._d2CirclesProfileDeleted = new Set()
		this._d2CirclesProfileCreated = new Map()
		this._d2CirclesProfileUpdated = new Map()
		/* ... */
		this._d2ArcsProfileDeleted = new Set()
		this._d2ArcsProfileCreated = new Map()
		this._d2ArcsProfileUpdated = new Map()
		/* ... */
		this._d2TextsProfileDeleted = new Set()
		this._d2TextsProfileCreated = new Map()
		this._d2TextsProfileUpdated = new Map()
		/* ... */
		this._d2ImagesProfileDeleted = new Set()
		this._d2ImagesProfileCreated = new Map()
		this._d2ImagesProfileUpdated = new Map()
	}

	public get parent(): DrawLayerView {
		return this._parent
	}

	public deletedD2PointProfileItem(id: string): void {
		this._d2PointsProfileDeleted.add(id)
	}
	public addD2PointProfileItem(data: TElement2DPointJSONViewData): string {
		const id: string = Constant.globalIdenManager.getComponentIden()
		this._d2PointsProfileCreated.set(id, data)
		return id
	}
	public updateD2PointProfileItem(id: string, data: TElement2DPointJSONViewData): void {
		this._d2PointsProfileUpdated.set(id, data)
	}

	public deletedD2LineProfileItem(id: string): void {
		this._d2LinesProfileDeleted.add(id)
	}
	public addD2LineProfileItem(data: TElement2DLineJSONViewData): string {
		const id: string = Constant.globalIdenManager.getComponentIden()
		this._d2LinesProfileCreated.set(id, data)
		return id
	}
	public updateD2LineProfileItem(id: string, data: TElement2DLineJSONViewData): void {
		this._d2LinesProfileUpdated.set(id, data)
	}

	public deletedD2CircleProfileItem(id: string): void {
		this._d2CirclesProfileDeleted.add(id)
	}
	public addD2CircleProfileItem(data: TElement2DCircleJSONViewData): string {
		const id: string = Constant.globalIdenManager.getComponentIden()
		this._d2CirclesProfileCreated.set(id, data)
		return id
	}
	public updateD2CircleProfileItem(id: string, data: TElement2DCircleJSONViewData): void {
		this._d2CirclesProfileUpdated.set(id, data)
	}

	public deletedD2ArcProfileItem(id: string): void {
		this._d2ArcsProfileDeleted.add(id)
	}
	public addD2ArcProfileItem(data: TElement2DArcJSONViewData): string {
		const id: string = Constant.globalIdenManager.getComponentIden()
		this._d2ArcsProfileCreated.set(id, data)
		return id
	}
	public updateD2ArcProfileItem(id: string, data: TElement2DArcJSONViewData): void {
		this._d2ArcsProfileUpdated.set(id, data)
	}

	public deletedD2TextProfileItem(id: string): void {
		this._d2TextsProfileDeleted.add(id)
	}
	public addD2TextProfileItem(data: TElement2DTextJSONViewData): string {
		const id: string = Constant.globalIdenManager.getComponentIden()
		this._d2TextsProfileCreated.set(id, data)
		return id
	}
	public updateD2TextProfileItem(id: string, data: TElement2DTextJSONViewData): void {
		this._d2TextsProfileUpdated.set(id, data)
	}

	public deletedD2ImageProfileItem(id: string): void {
		this._d2ImagesProfileDeleted.add(id)
	}
	public addD2ImageProfileItem(data: TElement2DImageJSONViewData & { texture: WebGLTexture }): string {
		const id: string = Constant.globalIdenManager.getComponentIden()
		this._d2ImagesProfileCreated.set(id, data)
		return id
	}
	public updateD2ImageProfileItem(id: string, data: TElement2DImageJSONViewData & { texture: WebGLTexture }): void {
		this._d2ImagesProfileUpdated.set(id, data)
	}

	public notify(): void {
		const plane: Plane = this.parent.plane
		if (this._d2PointsProfileDeleted.size > 0) {
			plane.deleteD2PointItems(this._d2PointsProfileDeleted)
		}
		if (this._d2PointsProfileCreated.size > 0) {
			plane.addD2PointItems(this._d2PointsProfileCreated)
		}
		if (this._d2PointsProfileUpdated.size > 0) {
			plane.updateD2PointItems(this._d2PointsProfileUpdated)
		}
		/* ... */
		if (this._d2LinesProfileDeleted.size > 0) {
			plane.deleteD2LineItems(this._d2LinesProfileDeleted)
		}
		if (this._d2LinesProfileCreated.size > 0) {
			plane.addD2LineItems(this._d2LinesProfileCreated)
		}
		if (this._d2LinesProfileUpdated.size > 0) {
			plane.updateD2LineItems(this._d2LinesProfileUpdated)
		}
		/* ... */
		if (this._d2CirclesProfileDeleted.size > 0) {
			plane.deleteD2CircleItems(this._d2CirclesProfileDeleted)
		}
		if (this._d2CirclesProfileCreated.size > 0) {
			plane.addD2CircleItems(this._d2CirclesProfileCreated)
		}
		if (this._d2CirclesProfileUpdated.size > 0) {
			plane.updateD2CircleItems(this._d2CirclesProfileUpdated)
		}
		/* ... */
		if (this._d2ArcsProfileDeleted.size > 0) {
			plane.deleteD2ArcItems(this._d2ArcsProfileDeleted)
		}
		if (this._d2ArcsProfileCreated.size > 0) {
			plane.addD2ArcItems(this._d2ArcsProfileCreated)
		}
		if (this._d2ArcsProfileUpdated.size > 0) {
			plane.updateD2ArcItems(this._d2ArcsProfileUpdated)
		}
		/* ... */
		if (this._d2TextsProfileDeleted.size > 0) {
			plane.deleteD2TextItems(this._d2TextsProfileDeleted)
		}
		if (this._d2TextsProfileCreated.size > 0) {
			plane.addD2TextItems(this._d2TextsProfileCreated)
		}
		if (this._d2TextsProfileUpdated.size > 0) {
			plane.updateD2TextItems(this._d2TextsProfileUpdated)
		}
		/* ... */
		if (this._d2ImagesProfileDeleted.size > 0) {
			plane.deleteD2ImageItems(this._d2ImagesProfileDeleted)
		}
		if (this._d2ImagesProfileCreated.size > 0) {
			plane.addD2ImageItems(this._d2ImagesProfileCreated)
		}
		if (this._d2ImagesProfileUpdated.size > 0) {
			plane.updateD2ImageItems(this._d2ImagesProfileUpdated)
		}
		/* ... */
		this._d2PointsProfileDeleted.clear()
		this._d2PointsProfileCreated.clear()
		this._d2PointsProfileUpdated.clear()
		/* ... */
		this._d2LinesProfileDeleted.clear()
		this._d2LinesProfileCreated.clear()
		this._d2LinesProfileUpdated.clear()
		/* ... */
		this._d2CirclesProfileDeleted.clear()
		this._d2CirclesProfileCreated.clear()
		this._d2CirclesProfileUpdated.clear()
		/* ... */
		this._d2ArcsProfileDeleted.clear()
		this._d2ArcsProfileCreated.clear()
		this._d2ArcsProfileUpdated.clear()
		/* ... */
		this._d2TextsProfileDeleted.clear()
		this._d2TextsProfileCreated.clear()
		this._d2TextsProfileUpdated.clear()
		/* ... */
		this._d2ImagesProfileDeleted.clear()
		this._d2ImagesProfileCreated.clear()
		this._d2ImagesProfileUpdated.clear()
	}
}
