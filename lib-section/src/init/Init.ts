import { EDrawLayerCode } from '../config/DrawLayerProfile'
import { Constant } from '../Constant'
import { DrawLayerShapeManager } from '../objects/shapes/manager/DrawLayerShapeManager'
import { DrawD2ToolManager } from '../tool/draw/primitive2d/DrawD2ToolManager'
import { EventsLoader } from '../tool/EventsLoader'
import { D2FrameTool } from '../tool/frameTool/D2FrameTool'
import { TDOMGetBoundingClientRectResult } from '../types/Common'
import { SyncCanvasRect } from '../utils/SyncCanvasRect'
import { ECoreEngineType, ECoreRenderMode } from '../engine/config/CommonProfile'
import { isSupportWebGPU } from '../engine/utils/Utils'

export class CoreInit {
	static async init(): Promise<void> {
		const isSupportWebGPUResult: boolean = await isSupportWebGPU()
		Constant.systemConfig.coreEngineType = ECoreEngineType.WEBGL
		Constant.systemConfig.renderMode = ECoreRenderMode.D2
	}
}

export class EnvirInit {
	static async init(canvasElement: HTMLCanvasElement): Promise<void> {
		SyncCanvasRect.syncCanvasRectByWindow(canvasElement)
		const canvasRect: TDOMGetBoundingClientRectResult = canvasElement.getBoundingClientRect().toJSON()
		Constant.environment.updateCanvasRectSize(canvasRect.width, canvasRect.height, canvasRect.left, canvasRect.top)
	}
}

export class LayerInit {
	static async init(): Promise<void> {
		DrawLayerShapeManager.getInstance().createControlShapeItem(EDrawLayerCode.MaskLayer)
	}
}

export class D2ToolInit {
	static eventsLoader: EventsLoader
	static d2FrameTool: D2FrameTool
	static drawD2ToolManager: DrawD2ToolManager

	static d2Init(canvasElement: HTMLCanvasElement): {
		drawD2ToolManager: DrawD2ToolManager
	} {
		D2ToolInit.eventsLoader = new EventsLoader(canvasElement)
		D2ToolInit.eventsLoader.init()
		D2ToolInit.d2FrameTool = new D2FrameTool()
		D2ToolInit.d2FrameTool.init()
		D2ToolInit.eventsLoader.nextTool = D2ToolInit.d2FrameTool
		D2ToolInit.drawD2ToolManager = new DrawD2ToolManager()
		D2ToolInit.drawD2ToolManager.frameToolHandler = D2ToolInit.d2FrameTool
		return {
			drawD2ToolManager: D2ToolInit.drawD2ToolManager,
		}
	}

	static d2Quit(): void {
		D2ToolInit.eventsLoader.quit()
		D2ToolInit.d2FrameTool.quit()
		D2ToolInit.drawD2ToolManager.quit()
	}
}
