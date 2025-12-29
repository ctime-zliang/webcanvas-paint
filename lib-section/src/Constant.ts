import { GlobalIdenManager } from './tool/GlobalIdenManager'
import { D2ElementController } from './controller/D2ElementController'
import { DrawLayerController } from './controller/DrawLayerController'
import { ModifyController } from './presenter/ModifyController'
import { Environment } from './controller/Environment'
import { DropDragTool } from './tool/common/DropDragTool'
import { SelectManager } from './controller/SelectManage'
import { D2FilterController } from './controller/D2FilterController'
import { HandlerControl } from './tool/selection/primitive2d/HandlerControl'
import { RtreeService } from './service/RtreeService'
import { Adsorption } from './tool/Adsorption'
import { CanvasController } from './controller/CanvasController'
import { MessageTool } from './tool/MessageTool'
import { HistoryManager } from './tool/history/HistoryManager'
import { OperationController } from './controller/OperationController'
import { SystemConfig } from './controller/systemConfig/SystemConfig'
import { FPSCount } from './utils/FPSCount'
import { RTree } from './algorithm/rtree2/Rtree'
import { TextFontService } from './service/TextFontService'
import { D2TextElementController } from './controller/D2TextElementController'
import { ImageReSourceService } from './service/ImageReSourceService'
import { D2ArcModelManager } from './objects/models/manager/primitive2d/D2ArcModelManager'
import { D2CircleModelManager } from './objects/models/manager/primitive2d/D2CircleModelManager'
import { D2ImageModelManager } from './objects/models/manager/primitive2d/D2ImageModelManager'
import { D2LineModelManager } from './objects/models/manager/primitive2d/D2LineModelManager'
import { D2RectModelManager } from './objects/models/manager/primitive2d/D2RectModelManager'
import { D2ArcShapeManager } from './objects/shapes/manager/primitive2d/D2ArcShapeManager'
import { D2PointModelManager } from './objects/models/manager/primitive2d/D2PointModelManager'
import { D2TextModelManager } from './objects/models/manager/primitive2d/D2TextModelManager'
import { D2CircleShapeManager } from './objects/shapes/manager/primitive2d/D2CircleShapeManager'
import { D2ImageShapeManager } from './objects/shapes/manager/primitive2d/D2ImageShapeManager'
import { D2PointShapeManager } from './objects/shapes/manager/primitive2d/D2PointShapeManager'
import { D2RectShapeManager } from './objects/shapes/manager/primitive2d/D2RectShapeManager'
import { D2LineShapeManager } from './objects/shapes/manager/primitive2d/D2LineShapeManager'
import { DrawLayerModelManager } from './objects/models/manager/DrawLayerModelManager'
import { D2TextShapeManager } from './objects/shapes/manager/primitive2d/D2TextShapeManager'
import { DrawLayerShapeManager } from './objects/shapes/manager/DrawLayerShapeManager'
import { TexImageSourceManager } from './manager/TexImageSourceManager'
import { EventsManager } from './manager/EventsManager'
import { WorkerManager } from './manager/WorkerManager'
import { TextGraphicsManager } from './manager/TextGraphicsManager'

export const Constant: {
	environment: Environment
	messageTool: MessageTool
	globalIdenManager: GlobalIdenManager
	rtree: RTree
	historyManager: HistoryManager
	operationController: OperationController
	d2ElementController: D2ElementController
	d2TextElementController: D2TextElementController
	drawLayerController: DrawLayerController
	canvasController: CanvasController
	d2FilterController: D2FilterController
	selectManager: SelectManager
	modifyController: ModifyController
	systemConfig: SystemConfig
	/* ... */
	rtreeService: RtreeService
	textFontService: TextFontService
	imageReSourceService: ImageReSourceService
	/* ... */
	dropDragTool: DropDragTool
	adsorption: Adsorption
	handlerControl: HandlerControl
	/* ... */
	fpsCount: FPSCount
} = {
	environment: null!,
	messageTool: null!,
	globalIdenManager: null!,
	rtree: null!,
	historyManager: null!,
	operationController: null!,
	d2ElementController: null!,
	d2TextElementController: null!,
	drawLayerController: null!,
	canvasController: null!,
	d2FilterController: null!,
	selectManager: null!,
	modifyController: null!,
	systemConfig: null!,
	/* ... */
	rtreeService: null!,
	textFontService: null!,
	imageReSourceService: null!,
	/* ... */
	dropDragTool: null!,
	adsorption: null!,
	handlerControl: null!,
	/* ... */
	fpsCount: null!,
}

export const createConstant = (): void => {
	Constant.environment = new Environment()
	Constant.messageTool = new MessageTool()
	Constant.globalIdenManager = new GlobalIdenManager()
	Constant.rtree = new RTree(50)
	Constant.historyManager = new HistoryManager(Number.MAX_SAFE_INTEGER)
	Constant.operationController = new OperationController()
	Constant.d2ElementController = new D2ElementController()
	Constant.d2TextElementController = new D2TextElementController()
	Constant.drawLayerController = new DrawLayerController()
	Constant.canvasController = new CanvasController()
	Constant.d2FilterController = new D2FilterController()
	Constant.selectManager = new SelectManager()
	Constant.modifyController = new ModifyController()
	Constant.systemConfig = new SystemConfig()
	/* ... */
	Constant.rtreeService = new RtreeService()
	Constant.textFontService = new TextFontService()
	Constant.imageReSourceService = new ImageReSourceService()
	/* ... */
	Constant.dropDragTool = new DropDragTool()
	Constant.adsorption = new Adsorption()
	Constant.handlerControl = new HandlerControl()
	/* ... */
	Constant.fpsCount = new FPSCount(200)
}

export const destoryConstant = (): void => {
	D2ArcModelManager.getInstance().quit()
	D2CircleModelManager.getInstance().quit()
	D2ImageModelManager.getInstance().quit()
	D2LineModelManager.getInstance().quit()
	D2PointModelManager.getInstance().quit()
	D2RectModelManager.getInstance().quit()
	D2TextModelManager.getInstance().quit()
	D2ArcShapeManager.getInstance().quit()
	D2CircleShapeManager.getInstance().quit()
	D2ImageShapeManager.getInstance().quit()
	D2LineShapeManager.getInstance().quit()
	D2PointShapeManager.getInstance().quit()
	D2RectShapeManager.getInstance().quit()
	D2TextShapeManager.getInstance().quit()
	/* ... */
	DrawLayerModelManager.getInstance().quit()
	DrawLayerShapeManager.getInstance().quit()
	/* ... */
	EventsManager.getInstance().quit()
	TexImageSourceManager.getInstance().quit()
	TextGraphicsManager.getInstance().quit()
	WorkerManager.getInstance().quit()
	/* ... */
	Constant.environment.quit()
	Constant.environment = undefined!
	Constant.messageTool.quit()
	Constant.messageTool = undefined!
	Constant.globalIdenManager = undefined!
	Constant.rtree.quit()
	Constant.rtree = undefined!
	Constant.historyManager.quit()
	Constant.historyManager = undefined!
	Constant.operationController.quit()
	Constant.operationController = undefined!
	Constant.d2ElementController.quit()
	Constant.d2ElementController = undefined!
	Constant.d2TextElementController.quit()
	Constant.d2TextElementController = undefined!
	Constant.drawLayerController.quit()
	Constant.drawLayerController = undefined!
	Constant.canvasController.quit()
	Constant.canvasController = undefined!
	Constant.d2FilterController.quit()
	Constant.d2FilterController = undefined!
	Constant.selectManager.quit()
	Constant.selectManager = undefined!
	Constant.modifyController.quit()
	Constant.modifyController = undefined!
	Constant.systemConfig.quit()
	Constant.systemConfig = undefined!
	/* ... */
	Constant.rtreeService.quit()
	Constant.rtreeService = undefined!
	Constant.textFontService.quit()
	Constant.textFontService = undefined!
	Constant.imageReSourceService.quit()
	Constant.imageReSourceService = undefined!
	/* ... */
	Constant.dropDragTool = undefined!
	Constant.adsorption = undefined!
	Constant.handlerControl = undefined!
	/* ... */
	Constant.fpsCount = undefined!
}
