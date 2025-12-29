import { EFrameCommand } from '../../config/CommandEnum'
import { Constant } from '../../Constant'
import { Color } from '../../engine/common/Color'
import { BaseInterface } from '../BaseInterface'

export type TThemeProfile = {
	canvasBackgroundColor: Color
}

/**
 * 主题
 */
export class Theme extends BaseInterface {
	private _canvasBackgroundColor: Color
	constructor() {
		super()
		this._canvasBackgroundColor = Color.BLACK
	}

	public set canvasBackgroundColor(value: Color) {
		this._canvasBackgroundColor = value
		Constant.environment.launcher.scene.canvasBackgroundColor = value
		Constant.messageTool.messageBus.publish(EFrameCommand.RENDER_FRAME, null)
	}
	public get canvasBackgroundColor(): Color {
		return this._canvasBackgroundColor
	}

	public toJSON(): TThemeProfile {
		return {
			canvasBackgroundColor: this.canvasBackgroundColor,
		}
	}

	public quit(): void {}
}
