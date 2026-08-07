import { Color, SystemConfigJSONData, WebCanvas } from '../../../../src/Main'

export function initWebSystemConfig(webCanvas: WebCanvas): void {
	const systemConfig: SystemConfigJSONData = webCanvas.getSystemConfig()
	webCanvas.setSystemConfig('enbaleFPSCount', true)
	console.log(systemConfig)
}
