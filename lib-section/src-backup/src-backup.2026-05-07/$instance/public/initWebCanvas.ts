import { createCanvasElement, WebCanvas } from '../../Main'

export async function initWebCanvas(): Promise<{
	webCanvas: WebCanvas
	canvasContainerElement: HTMLElement
}> {
	const canvasContainerElement: HTMLElement = document.getElementById('canvasContainer')!
	const webCanvas: WebCanvas = new WebCanvas(createCanvasElement(canvasContainerElement))
	await webCanvas.init()
	return {
		webCanvas,
		canvasContainerElement,
	}
}
