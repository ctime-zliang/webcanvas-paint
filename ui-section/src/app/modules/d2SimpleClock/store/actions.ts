import { valtioStore } from './store'

export const valtioAction = {
	setIframeLoadedStatus(value: boolean): void {
		valtioStore.iframeStatusLoaded = value
	},
	setIframeElementId(value: string): void {
		valtioStore.iframeElementId = value
	},
}
