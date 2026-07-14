import { DrawLayerView } from '../../../shapes/DrawLayerView'

export abstract class StructureBase {
	constructor() {}

	public abstract modify(data: any): void

	public abstract delete(): void

	public abstract getDrawLayerViewItem(layerItemId: string): DrawLayerView
}
