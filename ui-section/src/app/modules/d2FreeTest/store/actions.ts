import { proxy, useSnapshot } from 'valtio'
import { TDrawLayerItemResult } from './types'
import { valtioStore } from './store'
import { EDrwaAction } from '@/app/config/drawAction'
import { topRightErrorToast, topRightInfoToast } from '@/app/utils/toast'
import { messageTool } from '@/app/utils/MessageTool'
import { openFileSysDialog, removeInputFileElement } from '@/app/utils/openFileSysDialog'
import { selectFile } from '@/app/utils/selectFile'
import { calculateFileHash } from '@/app/utils/fileHash'

export const valtioAction = {
	setIframeLoadedStatus(value: boolean): void {
		valtioStore.iframeStatusLoaded = value
	},
	setIframeElementId(value: string): void {
		valtioStore.iframeElementId = value
	},
	setAllDrawLayers(value: ReadonlyArray<TDrawLayerItemResult>): void {
		const allDrawLayers: ReadonlyArray<TDrawLayerItemResult> = [
			{
				layerItemName: '',
				layerItemId: '',
				layerItemStatus: 0,
				layerItemType: 0,
				layerItemOpacity: 0,
			},
			...value,
		]
		if (value.length <= 0) {
			valtioAction.setSelectedDrawLayerItemId('-')
		}
		valtioStore.allDrawLayers = allDrawLayers
	},
	setSelectedDrawLayerItemId(value: string): void {
		valtioStore.selectedDrawLayerItemId = value
	},
	async dispatchCanvasAction(cmd: string, value: string): Promise<void> {
		const iframeElement: HTMLIFrameElement = document.getElementById(valtioStore.iframeElementId) as HTMLIFrameElement
		if (!iframeElement) {
			return
		}
		const iframeContentWindow: Window = iframeElement.contentWindow!
		switch (cmd) {
			case EDrwaAction.CREATE_DRAWLAYER_ITEM: {
				topRightInfoToast(`New Draw-Layer: ${cmd}`)
				messageTool.windowMessageBridge.publish(`UI2CAS_EVT-SET_DRAW_LAYER`, { cmd }, iframeContentWindow)
				break
			}
			case EDrwaAction.DELETE_DRAWLAYER_ITEM: {
				topRightInfoToast(`Delete Draw-Layer: ${cmd}`)
				messageTool.windowMessageBridge.publish(
					`UI2CAS_EVT-SET_DRAW_LAYER`,
					{ cmd, targetItemId: valtioStore.selectedDrawLayerItemId },
					iframeContentWindow
				)
				break
			}
			case EDrwaAction.SWITCH_ACTIVE_DRAWLAYER_ITEM: {
				if (value === '') {
					topRightInfoToast(`Clear Draw-Layer Selection: ${cmd}`)
				} else {
					topRightInfoToast(`Toggle Selected Draw-Layer: ${cmd}`)
				}
				messageTool.windowMessageBridge.publish(`UI2CAS_EVT-SET_DRAW_LAYER`, { cmd, targetItemId: value }, iframeContentWindow)
				break
			}
			/****************************************************************************************************/
			/****************************************************************************************************/
			/****************************************************************************************************/
			case EDrwaAction.DRAW_D2LINE:
			case EDrwaAction.DRWA_D2CIRCLE:
			case EDrwaAction.DRWA_D2POINT:
			case EDrwaAction.DRWA_D2ARC:
			case EDrwaAction.DRWA_D2RECT: {
				topRightInfoToast(`Switch to Drawing: ${cmd}`)
				messageTool.windowMessageBridge.publish(`UI2CAS_EVT-SET_DRAW_ELEMENT`, { cmd }, iframeContentWindow)
				break
			}
			case EDrwaAction.DRWA_D2TEXT: {
				topRightInfoToast(`Switch to Drawing: ${cmd}`)
				const textContent: string = `
				龘 齉爨麤齾靐䨻𠔻𡔚𪚥䯂𦧄䖇 𩇔
				~!@#$%^&*()_+-={}[]:;"'\|<,>.?/
				￥……！；：“’、《，》。？——（）
				0123456789
				AaBbCcDdEeFfGgHhIiJjKkLlMmNn
				OoPpQqRrSsTtUuVvWwXxYyZz
				`
				messageTool.windowMessageBridge.publish(`UI2CAS_EVT-SET_DRAW_ELEMENT`, { cmd, data: { textContent } }, iframeContentWindow)
				break
			}
			case EDrwaAction.DRWA_D2IMAGE: {
				topRightInfoToast(`Switch to Drawing: ${cmd}`)
				selectFile('image/*', (file: File): void => {
					if (file) {
						topRightInfoToast(`Processing file...`)
						calculateFileHash(file).then((hashRes: { hashId: string; file: File; success: boolean; error: any }): void => {
							const fileReader: FileReader = new FileReader()
							fileReader.onload = function (e: ProgressEvent<FileReader>): void {
								const imageDataURL: string = e.target?.result as string
								const image: HTMLImageElement = new Image()
								image.crossOrigin = 'anonymous'
								image.onload = function (e: Event): void {
									messageTool.windowMessageBridge.publish(
										`UI2CAS_EVT-SET_DRAW_ELEMENT`,
										{
											cmd,
											data: {
												imageDataURL,
												fileHashUuid: hashRes.hashId,
												width: image.width,
												height: image.height,
											},
										},
										iframeContentWindow
									)
									topRightInfoToast(`Submitting file data...`)
								}
								image.onerror = function (e: string | Event): void {
									topRightErrorToast(`Load image file error...`)
								}
								image.src = imageDataURL
							}
							fileReader.onerror = function (e: string | Event): void {
								topRightErrorToast(`Read image file error...`)
							}
							fileReader.readAsDataURL(file)
						})
					}
				})
				break
			}
			/****************************************************************************************************/
			/****************************************************************************************************/
			/****************************************************************************************************/
			case EDrwaAction.SET_SELECTION: {
				topRightInfoToast(`Switch to action: ${cmd}`)
				messageTool.windowMessageBridge.publish(`UI2CAS_EVT-SET_TOOL`, { cmd }, iframeContentWindow)
				break
			}
			case EDrwaAction.CLEAR_DRAWLAYER_ELEMENTS: {
				topRightInfoToast(`Perform an action: ${cmd}`)
				messageTool.windowMessageBridge.publish(
					`UI2CAS_EVT-SET_TOOL`,
					{ cmd, targetItemId: valtioStore.selectedDrawLayerItemId },
					iframeContentWindow
				)
				break
			}
			case EDrwaAction.CLEAR_CANVAS_ELEMENTS: {
				topRightInfoToast(`Perform an action: ${cmd}`)
				messageTool.windowMessageBridge.publish(`UI2CAS_EVT-SET_TOOL`, { cmd }, iframeContentWindow)
				break
			}
			case EDrwaAction.DO_COPY: {
				topRightInfoToast(`Unsupported Operation: ${cmd}`)
				messageTool.windowMessageBridge.publish(`UI2CAS_EVT-SET_TOOL`, { cmd }, iframeContentWindow)
				break
			}
			case EDrwaAction.DO_DELETE: {
				topRightInfoToast(`Perform an action: ${cmd}`)
				messageTool.windowMessageBridge.publish(`UI2CAS_EVT-SET_TOOL`, { cmd }, iframeContentWindow)
				break
			}
			case EDrwaAction.DO_UNDO: {
				topRightInfoToast(`Perform an action: ${cmd}`)
				messageTool.windowMessageBridge.publish(`UI2CAS_EVT-SET_TOOL`, { cmd }, iframeContentWindow)
				break
			}
			case EDrwaAction.DO_REDO: {
				topRightInfoToast(`Perform an action: ${cmd}`)
				messageTool.windowMessageBridge.publish(`UI2CAS_EVT-SET_TOOL`, { cmd }, iframeContentWindow)
				break
			}
			case EDrwaAction.IMPORT: {
				topRightInfoToast(`Perform an action: ${cmd}`)
				openFileSysDialog((e: Event): void => {
					const inputElement: HTMLInputElement = e.target as HTMLInputElement
					window.setTimeout((): void => {
						removeInputFileElement(inputElement)
					})
					const fileItem: File = inputElement.files ? (inputElement.files[0] as File) : null!
					if (!fileItem) {
						return
					}
					topRightInfoToast(`Reading Source File: ${cmd}`)
					const reader: FileReader = new FileReader()
					reader.readAsText(fileItem, 'UTF-8')
					reader.onload = function (e: ProgressEvent<FileReader>): void {
						topRightInfoToast(`Parsing Source Files: ${cmd}`)
						const content: string | ArrayBuffer = (e.target ? e.target.result : null!) as string | ArrayBuffer
						messageTool.windowMessageBridge.publish(`UI2CAS_EVT-SET_TOOL`, { cmd, content }, iframeContentWindow)
					}
				})
				break
			}
			case EDrwaAction.EXPORT: {
				topRightInfoToast(`Exporting Source File: ${cmd}`)
				messageTool.windowMessageBridge.publish(`UI2CAS_EVT-SET_TOOL`, { cmd }, iframeContentWindow)
				break
			}
			default: {
				topRightInfoToast(`Unknown Operation: ${cmd}`)
			}
		}
	},
}
