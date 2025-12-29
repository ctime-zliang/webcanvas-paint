import { EOperationAction } from '../config/OperationProfile'
import { Constant } from '../Constant'
import { Camera } from '../engine/common/Camera'
import { InsConfig } from '../engine/common/InsConfig'
import { InputInfo } from '../tool/InputInfo'
import { TDrawLayerItemResult } from '../types/Common'

export enum EOutEventCommand {
	INPUTS_CHANGE = 'INPUTS_CHANGE',
	CANVASPROFILE_CHANGE = 'CANVASPROFILE_CHANGE',
	CANVASINTENSIVEPROFILE_CHANGE = 'CANVASINTENSIVEPROFILE_CHANGE',
	OPERATION_CHANGE = 'OPERATION_CHANGE',
}

export type TCanvasProfileData = {
	zoomRatio: number
	canvasWidth: number
	canvasHeight: number
	DPI: [number, number]
	fpsCount: number
	diffFreshInterval: number
}

export type TOpeartionProfileData = {
	action: EOperationAction
	targetItemId?: string
	allDrawLayers?: Array<TDrawLayerItemResult>
}

export class OutProfileMessage {
	static dispatchInputsChangeMessage(inputInfo: InputInfo): void {
		Constant.messageTool.messageBus.publish(EOutEventCommand.INPUTS_CHANGE, OutProfileMessage.createInputsData(inputInfo))
	}
	static createInputsData(inputInfo: InputInfo): void {
		const data: any = inputInfo.toJSON()
		data.canvasZoom = Camera.getInstance().getZoomRatio()
		return data
	}

	static dispatchCanvasProfileChangeMessage(): void {
		Constant.messageTool.messageBus.publish(EOutEventCommand.CANVASPROFILE_CHANGE, OutProfileMessage.createCanvasProfileData({}))
	}
	static createCanvasProfileData(params: any = {}): TCanvasProfileData {
		return {
			zoomRatio: Camera.getInstance().getZoomRatio(),
			canvasWidth: Camera.getInstance().width,
			canvasHeight: Camera.getInstance().height,
			DPI: InsConfig.DPI,
			fpsCount: Constant.fpsCount.getFPSCount(),
			diffFreshInterval: Constant.fpsCount.getDiffFreshInterval(),
		}
	}

	static dispatchOperationProfileChangeMessage(action: EOperationAction, params: any = {}): void {
		if (!Constant.systemConfig.enbaleOperationMessagesNotify) {
			return
		}
		Constant.messageTool.messageBus.publish(EOutEventCommand.OPERATION_CHANGE, OutProfileMessage.createOperationProfileData(action, params))
	}
	static createOperationProfileData(action: EOperationAction, params: any = {}): TOpeartionProfileData {
		return {
			action,
			...params,
		}
	}
}
