import { Constant } from '../../../Constant'
import { EDrawD2ToolCommand, EFrameCommand } from '../../../config/CommandEnum'
import { DrawLayerShapeManager } from '../../../objects/shapes/manager/DrawLayerShapeManager'
import { DrawLayerShape } from '../../../objects/shapes/DrawLayerShape'
import { DrawD2LineShapeTool } from './drawD2LineShape/DrawD2LineShapeTool'
import { DrawD2CircleShapeTool } from './drawD2CircleShape/DrawD2CircleShapeTool'
import { DrawD2ArcShapeTool } from './drawD2ArcShape/DrawD2ArcShapeTool'
import { BaseDrawToolManager } from '../BaseDrawToolManager'
import { DrawD2TextShapeTool } from './drawD2TextShape/DrawD2TextShapeTool'
import { DrawD2ImageShapeTool } from './drawD2ImageShape/DrawD2ImageShapeTool'
import { DrawD2PointShapeTool } from './drawD2PointShape/DrawD2PointShapeTool'
import { DrawD2RectShapeTool } from './drawD2RectShape/DrawD2RectShapeTool'

export class DrawD2ToolManager extends BaseDrawToolManager {
	constructor() {
		super()
		Constant.messageTool.messageBus.subscribe(EFrameCommand.SWITCH_DRAW_TOOL, this.update.bind(this))
	}

	public update(params: any): void {
		const { type, data } = params
		switch (type) {
			case EDrawD2ToolCommand.BLANK_DROP: {
				const selectedDrawLayerShapeItem: DrawLayerShape = DrawLayerShapeManager.getInstance().getFirstSelectedItem()
				if (!selectedDrawLayerShapeItem) {
					console.warn(`[${type}] please activate a draw-layer first.`)
					break
				}
				console.warn(`进入选择模式.`)
				Constant.selectManager.clearAllSelectItems()
				this.frameToolHandler.nextTool = Constant.dropDragTool
				this.frameToolHandler.nextTool.drawing = false
				if (this.frameToolHandler.auxiliaryTool) {
					this.frameToolHandler.auxiliaryTool.destory()
					this.frameToolHandler.auxiliaryTool = null!
				}
				break
			}
			case EDrawD2ToolCommand.D2LINE: {
				const selectedDrawLayerShapeItem: DrawLayerShape = DrawLayerShapeManager.getInstance().getFirstSelectedItem()
				if (!selectedDrawLayerShapeItem) {
					console.warn(`[${type}] please activate a draw-layer first.`)
					break
				}
				console.warn(`进入绘制模式: 绘制 ${type}.`)
				Constant.selectManager.clearAllSelectItems()
				if (!(this.frameToolHandler.nextTool instanceof DrawD2LineShapeTool)) {
					if (this.frameToolHandler.auxiliaryTool) {
						this.frameToolHandler.auxiliaryTool.destory()
					}
					const newNextTool: DrawD2LineShapeTool = new DrawD2LineShapeTool()
					this.frameToolHandler.auxiliaryTool = newNextTool.initAuxiliaryTools()
					this.frameToolHandler.nextTool = newNextTool
					this.frameToolHandler.nextTool.drawing = true
				}
				break
			}
			case EDrawD2ToolCommand.D2CIRCLE: {
				const selectedDrawLayerShapeItem: DrawLayerShape = DrawLayerShapeManager.getInstance().getFirstSelectedItem()
				if (!selectedDrawLayerShapeItem) {
					console.warn(`[${type}] please activate a draw-layer first.`)
					break
				}
				console.warn(`进入绘制模式: 绘制 ${type}.`)
				Constant.selectManager.clearAllSelectItems()
				if (!(this.frameToolHandler.nextTool instanceof DrawD2CircleShapeTool)) {
					if (this.frameToolHandler.auxiliaryTool) {
						this.frameToolHandler.auxiliaryTool.destory()
					}
					const newNextTool: DrawD2CircleShapeTool = new DrawD2CircleShapeTool()
					this.frameToolHandler.auxiliaryTool = newNextTool.initAuxiliaryTools()
					this.frameToolHandler.nextTool = newNextTool
					this.frameToolHandler.nextTool.drawing = true
				}
				break
			}
			case EDrawD2ToolCommand.D2POINT: {
				const selectedDrawLayerShapeItem: DrawLayerShape = DrawLayerShapeManager.getInstance().getFirstSelectedItem()
				if (!selectedDrawLayerShapeItem) {
					console.warn(`[${type}] please activate a draw-layer first.`)
					break
				}
				console.warn(`进入绘制模式: 绘制 ${type}.`)
				Constant.selectManager.clearAllSelectItems()
				if (!(this.frameToolHandler.nextTool instanceof DrawD2PointShapeTool)) {
					if (this.frameToolHandler.auxiliaryTool) {
						this.frameToolHandler.auxiliaryTool.destory()
					}
					const newNextTool: DrawD2PointShapeTool = new DrawD2PointShapeTool()
					this.frameToolHandler.auxiliaryTool = newNextTool.initAuxiliaryTools()
					this.frameToolHandler.nextTool = newNextTool
					this.frameToolHandler.nextTool.drawing = true
				}
				break
			}
			case EDrawD2ToolCommand.D2ARC: {
				const selectedDrawLayerShapeItem: DrawLayerShape = DrawLayerShapeManager.getInstance().getFirstSelectedItem()
				if (!selectedDrawLayerShapeItem) {
					console.warn(`[${type}] please activate a draw-layer first.`)
					break
				}
				console.warn(`进入绘制模式: 绘制 ${type}.`)
				Constant.selectManager.clearAllSelectItems()
				if (!(this.frameToolHandler.nextTool instanceof DrawD2ArcShapeTool)) {
					if (this.frameToolHandler.auxiliaryTool) {
						this.frameToolHandler.auxiliaryTool.destory()
					}
					const newNextTool: DrawD2ArcShapeTool = new DrawD2ArcShapeTool()
					this.frameToolHandler.auxiliaryTool = newNextTool.initAuxiliaryTools()
					this.frameToolHandler.nextTool = newNextTool
					this.frameToolHandler.nextTool.drawing = true
				}
				break
			}
			case EDrawD2ToolCommand.D2TEXT: {
				const selectedDrawLayerShapeItem: DrawLayerShape = DrawLayerShapeManager.getInstance().getFirstSelectedItem()
				if (!selectedDrawLayerShapeItem) {
					console.warn(`[${type}] please activate a draw-layer first.`)
					break
				}
				console.warn(`进入绘制模式: 绘制 ${type}.`)
				Constant.selectManager.clearAllSelectItems()
				if (!(this.frameToolHandler.nextTool instanceof DrawD2TextShapeTool)) {
					if (this.frameToolHandler.auxiliaryTool) {
						this.frameToolHandler.auxiliaryTool.destory()
					}
					const newNextTool: DrawD2TextShapeTool = new DrawD2TextShapeTool(data)
					this.frameToolHandler.auxiliaryTool = newNextTool.initAuxiliaryTools()
					this.frameToolHandler.nextTool = newNextTool
					this.frameToolHandler.nextTool.drawing = true
				}
				break
			}
			case EDrawD2ToolCommand.D2IMAGE: {
				const selectedDrawLayerShapeItem: DrawLayerShape = DrawLayerShapeManager.getInstance().getFirstSelectedItem()
				if (!selectedDrawLayerShapeItem) {
					console.warn(`[${type}] please activate a draw-layer first.`)
					break
				}
				console.warn(`进入绘制模式: 绘制 ${type}.`)
				Constant.selectManager.clearAllSelectItems()
				if (!(this.frameToolHandler.nextTool instanceof DrawD2ImageShapeTool)) {
					if (this.frameToolHandler.auxiliaryTool) {
						this.frameToolHandler.auxiliaryTool.destory()
					}
					const newNextTool: DrawD2ImageShapeTool = new DrawD2ImageShapeTool(data)
					this.frameToolHandler.auxiliaryTool = newNextTool.initAuxiliaryTools()
					this.frameToolHandler.nextTool = newNextTool
					this.frameToolHandler.nextTool.drawing = true
				}
				break
			}
			case EDrawD2ToolCommand.D2RECT: {
				const selectedDrawLayerShapeItem: DrawLayerShape = DrawLayerShapeManager.getInstance().getFirstSelectedItem()
				if (!selectedDrawLayerShapeItem) {
					console.warn(`[${type}] please activate a draw-layer first.`)
					break
				}
				console.warn(`进入绘制模式: 绘制 ${type}.`)
				Constant.selectManager.clearAllSelectItems()
				if (!(this.frameToolHandler.nextTool instanceof DrawD2RectShapeTool)) {
					if (this.frameToolHandler.auxiliaryTool) {
						this.frameToolHandler.auxiliaryTool.destory()
					}
					const newNextTool: DrawD2RectShapeTool = new DrawD2RectShapeTool()
					this.frameToolHandler.auxiliaryTool = newNextTool.initAuxiliaryTools()
					this.frameToolHandler.nextTool = newNextTool
					this.frameToolHandler.nextTool.drawing = true
				}
				break
			}
			default:
		}
		Constant.messageTool.messageBus.publish(EFrameCommand.RENDER_FRAME, null)
	}

	public quit(): void {}
}
