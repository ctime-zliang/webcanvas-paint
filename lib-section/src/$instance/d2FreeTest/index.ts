import {
	WebCanvas,
	DRAW_D2TOOL_COMMAND,
	DrawLayerItemResult,
	getHashIden,
	OpeartionProfileData,
	OPERATION_ACRION,
	HISTORY_CMD_ACTION,
	Helper,
	Color,
	px2mm,
} from '../../Main'
import { initEventHandle } from '../public/initEventHandle'
import { initFloatPanel } from '../public/initFloatPanel'
import { initWebCanvas } from '../public/initWebCanvas'
import { cdt2dTest01 } from './modules/cdt2dTest'
import { drawTestArcItems } from './modules/drawTestArc'
import { drawTestCircle, drawTestCircles } from './modules/drawTestCircle'
import { drawTestFree1, drawTestFree2, drawTestFree3, drawTestFree4, drawTestFree5 } from './modules/drawTestFree'
import { drawTestImage } from './modules/drawTestImage'
import { drawRandomTestLines, drawTestLineItem, drawTestLines, drawTestLines2 } from './modules/drawTestLine'
import { drawTestMixinItems } from './modules/drawTestMixin'
import { drawTestPoint } from './modules/drawTestPoint'
import { drawTestRectItem, drawTestRects } from './modules/drawTestRect'
import { drawTestTextItem } from './modules/drawTestText'
import { initWebSystemConfig } from './utils/initWebSystemConfig'

async function initMessageHandle(webCanvas: WebCanvas): Promise<void> {
	const { messageTool, drawLayerController, d2ElementController, operationController } = webCanvas
	const DPI: [number, number] = webCanvas.getDPI()
	messageTool.messageBus.subscribe('UI2CAS_EVT-SET_DRAW_LAYER', (params: any): void => {
		const { cmd, targetItemId } = params
		switch (cmd) {
			case 'CREATE_DRAWLAYER_ITEM': {
				drawLayerController.createDrawLayerShapeItem(`drawlayer-${getHashIden(5)}`)
				break
			}
			case 'DELETE_DRAWLAYER_ITEM': {
				if (targetItemId) {
					drawLayerController.deleteDrawLayerShapeItem(targetItemId)
				}
				break
			}
			case 'SWITCH_ACTIVE_DRAWLAYER_ITEM': {
				if (targetItemId === '') {
					drawLayerController.clearAllDrawLayersSelectedStatus()
				} else {
					drawLayerController.setActiveDrawLayerShapeItem(targetItemId)
				}
				break
			}
			default:
		}
	})
	messageTool.messageBus.subscribe('UI2CAS_EVT-SET_DRAW_ELEMENT', (params: any): void => {
		const { cmd, data } = params
		switch (cmd) {
			case 'DRAW_D2LINE': {
				webCanvas.setDrawD2ToolCommand(DRAW_D2TOOL_COMMAND.D2LINE)
				break
			}
			case 'DRWA_D2CIRCLE': {
				webCanvas.setDrawD2ToolCommand(DRAW_D2TOOL_COMMAND.D2CIRCLE)
				break
			}
			case 'DRWA_D2POINT': {
				webCanvas.setDrawD2ToolCommand(DRAW_D2TOOL_COMMAND.D2POINT)
				break
			}
			case 'DRWA_D2ARC': {
				webCanvas.setDrawD2ToolCommand(DRAW_D2TOOL_COMMAND.D2ARC)
				break
			}
			case 'DRWA_D2TEXT': {
				webCanvas.setDrawD2ToolCommand(DRAW_D2TOOL_COMMAND.D2TEXT, data)
				break
			}
			case 'DRWA_D2IMAGE': {
				webCanvas.setDrawD2ToolCommand(DRAW_D2TOOL_COMMAND.D2IMAGE, {
					...data,
					width: px2mm(data.width, DPI[0]),
					height: px2mm(data.height, DPI[1]),
				})
				break
			}
			case 'DRWA_D2RECT': {
				webCanvas.setDrawD2ToolCommand(DRAW_D2TOOL_COMMAND.D2RECT)
				break
			}
			default:
		}
	})
	messageTool.messageBus.subscribe('UI2CAS_EVT-SET_TOOL', async (params: any): Promise<void> => {
		const { cmd, content, targetItemId } = params
		switch (cmd) {
			case 'SET_SELECTION': {
				webCanvas.setDrawD2ToolCommand(DRAW_D2TOOL_COMMAND.BLANK_DROP)
				break
			}
			case 'DO_COPY': {
				console.log(`暂未支持此操作.`)
				break
			}
			case 'DO_UNDO': {
				operationController.undo()
				break
			}
			case 'DO_REDO': {
				operationController.redo()
				break
			}
			case 'EXPORT': {
				console.log(`暂未支持此操作.`)
				break
			}
			case 'IMPORT': {
				console.log(`暂未支持此操作.`)
				break
			}
			case 'DO_DELETE': {
				const allSelectedElementIds: Array<string> = d2ElementController.getAllSelectedD2ElementShapeResults().map((item: any): string => {
					return item.elementItemId
				})
				const commandGroupId: string = String(performance.now())
				allSelectedElementIds.forEach((idItem: string): void => {
					operationController.addHistroyRecord(idItem, HISTORY_CMD_ACTION.DELETE, commandGroupId)
					d2ElementController.deleteD2ElementShapeItemById(idItem)
				})
				allSelectedElementIds.length = 0
				break
			}
			case 'CLEAR_DRAWLAYER_ELEMENTS': {
				drawLayerController.deleteDrawLayerElements(targetItemId)
				break
			}
			case 'CLEAR_CANVAS_ELEMENTS': {
				const allDrawLayers: Array<DrawLayerItemResult> = drawLayerController.getAllDrawLayerResults()
				allDrawLayers.forEach((item: DrawLayerItemResult): void => {
					drawLayerController.deleteDrawLayerElements(item.layerItemId)
				})
				break
			}
			case 'RESET_CANVAS': {
				operationController.resetCanvasContent().then((): void => {
					console.log(`已清除画布所有内容.`)
				})
				break
			}
			default:
		}
	})
	webCanvas.addOperationProfileChangeListener(async (params: OpeartionProfileData): Promise<void> => {
		const { action, allDrawLayers, targetItemId } = params
		switch (action) {
			case OPERATION_ACRION.CREATED_DRAWLAYER:
			case OPERATION_ACRION.REFRESH_DRAWLAYER:
			case OPERATION_ACRION.DELETED_DRAWLAYER:
			case OPERATION_ACRION.SWITCH_ACTIVE_DRAWLAYER:
			case OPERATION_ACRION.CLEAR_ALL_ACTIVE_DRAWLAYER:
			case OPERATION_ACRION.CLEAR_ALL_DRAWLAYER_ELEMENTS: {
				const allDrawLayers: Array<DrawLayerItemResult> = drawLayerController.getAllDrawLayerResults()
				messageTool.windowMessageBridge.publish(
					`CAS2UI_EVT-UPDATE_DRAWLAYER_LIST`,
					{
						allDrawLayers,
						selectedDrawLayerItemId: '',
					},
					window.top!
				)
				break
			}
			default:
		}
	})
}

export function main(): void {
	initWebCanvas().then(async ({ webCanvas, canvasContainerElement }): Promise<void> => {
		const { messageTool } = webCanvas
		initWebSystemConfig(webCanvas)
		initFloatPanel(webCanvas)
		initEventHandle(webCanvas)
		initMessageHandle(webCanvas)
		Helper.FloatPanel.canvasProfilePanelControl.update(webCanvas.getCanvasProfileData())

		const messageResult: any = (await messageTool.windowMessageBridge.asyncRequest(`CAS2UI_SVR-CANVAS_READY`, { ready: true }, window.top)).data
		console.log(`CAS2UI_SVR-CANVAS_READY: `, messageResult)

		const drawLayerController = webCanvas.drawLayerController
		const layerItem01Id: string = drawLayerController.createDrawLayerShapeItem(`Canvas Test Layer 01`)

		// cdt2dTest01(webCanvas, layerItem01Id)

		// drawTestMixinItems(webCanvas, layerItem01Id)

		// drawTestLineItem(webCanvas, layerItem01Id)
		// drawTestLines(webCanvas, layerItem01Id)
		// drawTestLines2(webCanvas, layerItem01Id)
		// drawRandomTestLines(webCanvas)

		// drawTestTextItem(webCanvas, layerItem01Id)
		// drawPresetTestTextItem(webCanvas, layerItem01Id)

		// drawTestRectItem(webCanvas, layerItem01Id)
		// drawTestRects(webCanvas, layerItem01Id)

		// drawTestCircle(webCanvas, layerItem01Id)
		// drawTestCircles(webCanvas, layerItem01Id)

		// drawTestPoint(webCanvas, layerItem01Id)

		// drawTestArcItems(webCanvas, layerItem01Id)

		// drawTestFree1(webCanvas, layerItem01Id)
		// drawTestFree2(webCanvas, layerItem01Id)
		// drawTestFree3(webCanvas, layerItem01Id)
		// drawTestFree4(webCanvas, layerItem01Id)
		// drawTestFree5(webCanvas, layerItem01Id)

		drawTestImage(webCanvas, layerItem01Id)

		console.log(webCanvas)
	})
}

const obj = { a: 1, b: 2, c: 3 }
function fun<T, K extends keyof T>(obj: T, key: K): any {
	return obj[key]
}

type FirstItem<T extends Array<number>> = T extends [infer R, ...infer K] ? R : never
type A = FirstItem<[1, 2, 3]>

const a1: A = 1
