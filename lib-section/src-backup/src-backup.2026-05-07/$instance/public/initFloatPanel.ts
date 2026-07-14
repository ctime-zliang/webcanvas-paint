import { Helper, WebCanvas } from '../../Main'

export function initFloatPanel(webCanvas: WebCanvas): void {
	const floatPanelElement: HTMLElement = Helper.FloatPanel.createContainer(document.body)
	Helper.FloatPanel.inputsPanelControl.appendTo(floatPanelElement)
	Helper.FloatPanel.canvasProfilePanelControl.appendTo(floatPanelElement)
	Helper.FloatPanel.btnsControl.appendTo(floatPanelElement)
	/* ... */
	Helper.FloatPanel.btnsControl.event({
		quitCanvasClickCallback() {
			console.warn(`will quit canvas!!!`)
			webCanvas.quit()
		},
		resetCanvasStatusClickCallback() {
			console.warn(`will reset canvas status.`)
			webCanvas.resetCanvasStatus()
		},
		setRenderMode2DClickCallback() {
			console.warn(`will reset canvas status.`)
			webCanvas.resetCanvasStatus()
		},
		setRenderMode3DClickCallback() {
			console.warn(`will reset canvas status.`)
			webCanvas.resetCanvasStatus()
		},
	})
}
