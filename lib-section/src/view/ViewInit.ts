import { Constant } from '../Constant'
import { OutProfileMessage } from '../utils/OutMessage'

export class ViewInit {
	static async init(): Promise<void> {
		window.setTimeout((): void => {
			render(performance.now())
		})

		function render(timestamp: number): void {
			Constant.environment.launcher.renderFrame(timestamp)
			if (Constant.systemConfig.enbaleFPSCount) {
				Constant.fpsCount.calcFPSCount(timestamp)
			}
			Constant.environment.launcher.rAFId = window.requestAnimationFrame(render)
			OutProfileMessage.dispatchCanvasProfileChangeMessage()
		}
	}
}
