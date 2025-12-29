import { Color, SystemConfigJSONData, WebCanvas } from '../../../Main'

export function initWebSystemConfig(webCanvas: WebCanvas): void {
	const systemConfig: SystemConfigJSONData = webCanvas.getSystemConfig()
	webCanvas.setSystemConfig('Interactive', 'enableCanvasSelection', false)
	webCanvas.setSystemConfig('Interactive', 'enableCanvasTranslateByLeftDownMove', true)
	webCanvas.setSystemConfig('Interactive', 'enableCanvasTranslateByRightDownMove', true)
	webCanvas.setSystemConfig('CanvasAidedDesign', 'enableAxis', true)
	webCanvas.setSystemConfig('CanvasAidedDesign', 'enableGridDot', true)
	webCanvas.setSystemConfig('CanvasAidedDesign', 'enableGrid', true)
	webCanvas.setSystemConfig('CanvasAidedDesign', 'enableMultiGrid', true)
	webCanvas.setSystemConfig('enbaleFPSCount', true)
	// webCanvas.setSystemConfig('Theme', 'canvasBackgroundColor', Color.WHITE)
	console.log(systemConfig)
}
