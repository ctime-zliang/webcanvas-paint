export type TDrawLayerItemResult = {
	layerItemName: string
	layerItemId: string
	layerItemStatus: number
	layerItemType: number
	layerItemOpacity: number
}

export type TValtioStore = {
	iframeStatusLoaded: boolean
	iframeElementId: string
	allDrawLayers: ReadonlyArray<TDrawLayerItemResult>
	selectedDrawLayerItemId: string
}
