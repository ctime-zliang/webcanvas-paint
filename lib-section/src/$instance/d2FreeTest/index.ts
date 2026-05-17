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
	nextFrameTick,
	Vector2,
	Vector3,
	D2POINT_SHAPE,
} from '../../Main'
import { initEventHandle } from '../public/initEventHandle'
import { initFloatPanel } from '../public/initFloatPanel'
import { initWebCanvas } from '../public/initWebCanvas'
import { cdt2dTest01 } from './modules/cdt2dTest'
import { coordinateTest01, coordinateTest02, coordinateTest03 } from './modules/coordinateTest'
import { intersectionTest01, intersectionTest02, intersectionTest03 } from './modules/intersectionTest'
import { drawArcItemsTest01 } from './modules/drawArcTest'
import { drawCircleItemsTest01 } from './modules/drawCircleTest'
import { drawImageItemsTest01, drawImageItemStdTest01 } from './modules/drawImageTest'
import { drawRandomLineItemsTest01, drawLineItemsTest01, drawLineItemStdTest01 } from './modules/drawLineTest'
import { drawMixinItemsTest01 } from './modules/drawMixinElementsTest'
import { drawPointItemStdTest01 } from './modules/drawPointTest'
import { drawRectItemsTest01, drawRectItemStdTest01 } from './modules/drawRectTest'
import { drawTextItemSimTest01, drawTextItemStdTest01 } from './modules/drawTextTest'
import { initWebSystemConfig } from './utils/initWebSystemConfig'
import {
	d2LineToolkitTest01,
	d2LineToolkitTest02,
	d2LineToolkitTest03,
	d2LineToolkitTest04,
	d2LineToolkitTest05,
	d2LineToolkitTest06,
	d2LineToolkitTest07,
	d2LineToolkitTest08,
	d2LineToolkitTest09,
	d2LineToolkitTest10,
} from './modules/d2LineToolkitTest'
import { d2CircleToolkitTest01 } from './modules/d2CircleToolkitTest'
import { d2ArcToolkitTest01, d2ArcToolkitTest02, d2ArcToolkitTest03, d2ArcToolkitTest04, d2ArcToolkitTest05 } from './modules/d2ArcToolkitTest'
import { vector2Test01 } from './modules/vector2Test'
import { lineTest01, lineTest02 } from './modules/lineTest'
import { arcTest01, arcTest02 } from './modules/arcTest'

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
				operationController.resetCanvasContent()
				console.log(`已清除画布所有内容.`)
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
		const { messageTool, d2ElementController } = webCanvas
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

		// coordinateTest01(webCanvas, layerItem01Id)
		// coordinateTest02(webCanvas, layerItem01Id)
		// coordinateTest03(webCanvas, layerItem01Id)

		// drawArcItemsTest01(webCanvas, layerItem01Id)

		// drawCircleItemsTest01(webCanvas, layerItem01Id)

		// drawImageItemStdTest01(webCanvas, layerItem01Id)
		// drawImageItemsTest01(webCanvas, layerItem01Id)

		// drawLineItemStdTest01(webCanvas, layerItem01Id)
		// drawLineItemsTest01(webCanvas, layerItem01Id)
		// drawRandomLineItemsTest01(webCanvas)

		// drawMixinItemsTest01(webCanvas, layerItem01Id)

		// drawPointItemStdTest01(webCanvas, layerItem01Id)

		// drawRectItemStdTest01(webCanvas, layerItem01Id)
		// drawRectItemsTest01(webCanvas, layerItem01Id)

		// drawTextItemStdTest01(webCanvas, layerItem01Id)
		// drawTextItemSimTest01(webCanvas, layerItem01Id)

		// lineTest01(webCanvas, layerItem01Id)
		// lineTest02(webCanvas, layerItem01Id)

		// arcTest01(webCanvas, layerItem01Id)
		arcTest02(webCanvas, layerItem01Id)

		// d2LineToolkitTest01(webCanvas, layerItem01Id)
		// d2LineToolkitTest02(webCanvas, layerItem01Id)
		// d2LineToolkitTest03(webCanvas, layerItem01Id)
		// d2LineToolkitTest04(webCanvas, layerItem01Id)
		// d2LineToolkitTest05(webCanvas, layerItem01Id)
		// d2LineToolkitTest06(webCanvas, layerItem01Id)
		// d2LineToolkitTest07(webCanvas, layerItem01Id)
		// d2LineToolkitTest08(webCanvas, layerItem01Id)
		// d2LineToolkitTest09(webCanvas, layerItem01Id)
		// d2LineToolkitTest10(webCanvas, layerItem01Id)

		// d2CircleToolkitTest01(webCanvas, layerItem01Id)

		// d2ArcToolkitTest01(webCanvas, layerItem01Id)
		// d2ArcToolkitTest02(webCanvas, layerItem01Id)
		// d2ArcToolkitTest03(webCanvas, layerItem01Id)
		// d2ArcToolkitTest04(webCanvas, layerItem01Id)
		// d2ArcToolkitTest05(webCanvas, layerItem01Id)

		// intersectionTest01(webCanvas, layerItem01Id)
		// intersectionTest02(webCanvas, layerItem01Id)
		// intersectionTest03(webCanvas, layerItem01Id)

		// vector2Test01(webCanvas, layerItem01Id)

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
