import { WebCanvas, OpeartionProfileData, Helper, CanvasProfileData } from '../../Main'
import { initEventHandle } from '../public/initEventHandle'
import { initFloatPanel } from '../public/initFloatPanel'
import { initWebCanvas } from '../public/initWebCanvas'
import { drawPlaneClockInit } from './modules/planeClock'
import { initWebSystemConfig } from './utils/initWebSystemConfig'

export const DEFAULT_BLANK_DRALAYER_ID: string = '$0'

async function initMessageHandle(webCanvas: WebCanvas): Promise<void> {
	/**
	 * 监听 WebCanvas 操作交互
	 */
	webCanvas.addOperationProfileChangeListener(async (params: OpeartionProfileData): Promise<void> => {})
}

export function main(): void {
	initWebCanvas().then(async ({ webCanvas, canvasContainerElement }): Promise<void> => {
		const { messageTool } = webCanvas
		initWebSystemConfig(webCanvas)
		initFloatPanel(webCanvas)
		initEventHandle(webCanvas)
		initMessageHandle(webCanvas)
		Helper.FloatPanel.canvasProfilePanelControl.update(webCanvas.getCanvasProfileData())

		webCanvas.addCanvasProfileChangeListener((params: CanvasProfileData): void => {})

		const messageResult = await messageTool.windowMessageBridge.asyncRequest(`LIB2UI_SVR-CANVAS_READY`, { ready: true }, window.top)
		console.log(`LIB2UI_SVR-CANVAS_READY: `, messageResult)

		drawPlaneClockInit(webCanvas, canvasContainerElement)

		console.log(webCanvas)
	})
}
