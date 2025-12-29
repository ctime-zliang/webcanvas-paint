import { Color, SystemConfigJSONData, WebCanvas } from '../../../Main'

export function initWebSystemConfig(webCanvas: WebCanvas): void {
	const systemConfig: SystemConfigJSONData = webCanvas.getSystemConfig()
	webCanvas.setSystemConfig('enbaleFPSCount', true)
	console.log(systemConfig)
}
