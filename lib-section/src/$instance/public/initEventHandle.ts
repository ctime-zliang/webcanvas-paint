import { CanvasProfileData, Helper, InputInfoData, WebCanvas } from '../../Main'

export function initEventHandle(webCanvas: WebCanvas): void {
	/**
	 * 监听 WebCanvas 输入变更
	 */
	webCanvas.addInputsChangeListener((data: InputInfoData): void => {
		Helper.FloatPanel.inputsPanelControl.update(data)
	})
	/**
	 * 监听 WebCanvas 配置变更
	 */
	webCanvas.addCanvasProfileChangeListener((data: CanvasProfileData): void => {
		Helper.FloatPanel.canvasProfilePanelControl.update(data)
	})
}
