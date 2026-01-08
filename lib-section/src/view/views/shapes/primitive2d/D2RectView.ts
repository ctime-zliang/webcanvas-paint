import { ED2ElementType } from '../../../../config/D2ElementProfile'
import { ShapeElementViewBase } from './elementBase/ShapeElementViewBase'
import { BaseD2Line } from '../../structure/primitive2d/BaseD2Line'
import { StructureItemBase } from '../../structure/primitive2d/elementBase/StructureItemBase'
import { MaskColor } from '../../utils/Mask'
import { EDrawLayerCode } from '../../../../config/DrawLayerProfile'
import { TElement2DRectJSONViewData } from '../../../../types/Element'
import { ElementShapeItemBase } from '../../../../objects/shapes/primitive2d/elementBase/ElementShapeItemBase'
import { D2RectShape } from '../../../../objects/shapes/primitive2d/D2RectShape'
import { ECanvas2DLineCap } from '../../../../engine/config/PrimitiveProfile'
import { BaseD2Arc } from '../../structure/primitive2d/BaseD2Arc'
import { ESweep } from '../../../../engine/config/CommonProfile'
import { BBox2 } from '../../../../engine/algorithm/geometry/bbox/BBox2'

export class D2RectView extends ShapeElementViewBase {
	private _mainPrimitives: Array<StructureItemBase>
	private _mainPrimitives2: Array<StructureItemBase>
	private _mainFillPrimitives: Array<StructureItemBase>
	private _maskPrimitives: Array<StructureItemBase>
	private _maskPrimitives2: Array<StructureItemBase>
	private _maskFillPrimitives: Array<StructureItemBase>
	constructor(shapeObject: ElementShapeItemBase) {
		super(shapeObject)
		this.type = shapeObject.getType()
		this.layerItemId = shapeObject.model.layerItemId
		this._mainPrimitives = []
		this._mainPrimitives2 = []
		this._mainFillPrimitives = []
		this._maskPrimitives = []
		this._maskPrimitives2 = []
		this._maskFillPrimitives = []
	}

	public modify(shapeObjectItem: D2RectShape): void {
		const { status } = shapeObjectItem
		const { layerItemId } = shapeObjectItem.model
		const elementItemType: ED2ElementType = shapeObjectItem.getType()
		const mainElementItemData: TElement2DRectJSONViewData = shapeObjectItem.toJSON()
		this.layerItemId = layerItemId
		this.status = status
		if (!this._mainPrimitives.length) {
			this.delete()
			switch (elementItemType) {
				case ED2ElementType.D2Rect: {
					for (let i: number = 0; i < 4; i++) {
						this._mainPrimitives.push(new BaseD2Line(layerItemId, this))
					}
					if (mainElementItemData.borderRadius > 0) {
						for (let i: number = 0; i < 4; i++) {
							this._mainPrimitives2.push(new BaseD2Arc(layerItemId, this))
						}
					}
					if (mainElementItemData.isFill) {
						if (mainElementItemData.borderRadius > 0) {
							this._mainFillPrimitives.push(
								new BaseD2Line(layerItemId, this),
								new BaseD2Line(layerItemId, this),
								new BaseD2Line(layerItemId, this)
							)
						} else {
							this._mainFillPrimitives.push(new BaseD2Line(layerItemId, this))
						}
					}
					break
				}
			}
		}
		if (this.hightlight) {
			this.hightlighting(mainElementItemData)
		} else {
			this.normalview(mainElementItemData)
		}
		this.drawMainPrimitives(mainElementItemData)
		this.drawMaskPrimitives(mainElementItemData)
	}

	public delete(): void {
		for (let i: number = 0; i < this._mainPrimitives.length; i++) {
			this._mainPrimitives[i].delete()
		}
		this._mainPrimitives.length = 0
		for (let i: number = 0; i < this._mainPrimitives2.length; i++) {
			this._mainPrimitives2[i].delete()
		}
		this._mainPrimitives2.length = 0
		for (let i: number = 0; i < this._mainFillPrimitives.length; i++) {
			this._mainFillPrimitives[i].delete()
		}
		this._mainFillPrimitives.length = 0
		for (let i: number = 0; i < this._maskPrimitives.length; i++) {
			this._maskPrimitives[i].delete()
		}
		this._maskPrimitives.length = 0
		for (let i: number = 0; i < this._maskPrimitives2.length; i++) {
			this._maskPrimitives2[i].delete()
		}
		this._maskPrimitives2.length = 0
		for (let i: number = 0; i < this._maskFillPrimitives.length; i++) {
			this._maskFillPrimitives[i].delete()
		}
		this._maskFillPrimitives.length = 0
	}

	public normalview(mainElementItemData: TElement2DRectJSONViewData): void {
		for (let i: number = 0; i < this._maskPrimitives.length; i++) {
			this._maskPrimitives[i].delete()
		}
		this._maskPrimitives.length = 0
		for (let i: number = 0; i < this._maskPrimitives2.length; i++) {
			this._maskPrimitives2[i].delete()
		}
		this._maskPrimitives2.length = 0
		for (let i: number = 0; i < this._maskFillPrimitives.length; i++) {
			this._maskFillPrimitives[i].delete()
		}
		this._maskFillPrimitives.length = 0
	}

	public hightlighting(mainElementItemData: TElement2DRectJSONViewData): void {
		if (!this._maskPrimitives.length) {
			for (let i: number = 0; i < 4; i++) {
				this._maskPrimitives.push(new BaseD2Line(EDrawLayerCode.MaskLayer, this))
			}
		}
		if (mainElementItemData.borderRadius > 0 && !this._maskPrimitives2.length) {
			for (let i: number = 0; i < 4; i++) {
				this._maskPrimitives2.push(new BaseD2Arc(EDrawLayerCode.MaskLayer, this))
			}
		}
		if (!this._maskFillPrimitives.length) {
			if (mainElementItemData.borderRadius > 0) {
				this._maskFillPrimitives.push(
					new BaseD2Line(EDrawLayerCode.MaskLayer, this),
					new BaseD2Line(EDrawLayerCode.MaskLayer, this),
					new BaseD2Line(EDrawLayerCode.MaskLayer, this)
				)
			} else {
				this._maskFillPrimitives.push(new BaseD2Line(EDrawLayerCode.MaskLayer, this))
			}
		}
	}

	private drawMainPrimitives(mainElementItemData: TElement2DRectJSONViewData): void {
		const extendBbox2: BBox2 = BBox2.createByJSONData(mainElementItemData.bbox2).extendByDist(-mainElementItemData.strokeWidth / 2)
		const bboxLeftUp: { x: number; y: number } = {
			x: extendBbox2.minX,
			y: extendBbox2.maxY,
		}
		const bboxRightUp: { x: number; y: number } = {
			x: extendBbox2.maxX,
			y: extendBbox2.maxY,
		}
		const bboxLeftBottom: { x: number; y: number } = {
			x: extendBbox2.minX,
			y: extendBbox2.minY,
		}
		const bboxRightBottom: { x: number; y: number } = {
			x: extendBbox2.maxX,
			y: extendBbox2.minY,
		}
		const bbox2Width: number = bboxRightUp.x - bboxLeftUp.x
		const bbox2Height: number = bboxRightUp.y - bboxRightBottom.y
		let borderRadius: number = mainElementItemData.borderRadius
		if (bbox2Width <= borderRadius * 2) {
			borderRadius = bbox2Width / 2
		}
		if (bbox2Height <= borderRadius * 2) {
			borderRadius = bbox2Height / 2
		}
		if (borderRadius > 0) {
			const baseConfig: any = {
				status: mainElementItemData.status,
				layerItemId: mainElementItemData.layerItemId,
				strokeWidth: mainElementItemData.strokeWidth,
				strokeColorData: mainElementItemData.strokeColorData,
				alpha: mainElementItemData.alpha,
				lineCap: ECanvas2DLineCap.SQUARE,
				isSolid: mainElementItemData.isSolid,
				radius: borderRadius,
				fillColorData: mainElementItemData.fillColorData,
				isFill: mainElementItemData.isFill,
				segSize: mainElementItemData.segSize,
				gapSize: mainElementItemData.gapSize,
				isFixedStrokeWidth: mainElementItemData.isFixedStrokeWidth,
				sweep: ESweep.CCW,
			}
			this._mainPrimitives2[0].modify({
				...baseConfig,
				centerPoint: {
					x: bboxLeftUp.x + borderRadius,
					y: bboxLeftUp.y - borderRadius,
				},
				startAngle: Math.PI / 2,
				endAngle: Math.PI,
			})
			this._mainPrimitives2[1].modify({
				...baseConfig,
				centerPoint: {
					x: bboxRightUp.x - borderRadius,
					y: bboxRightUp.y - borderRadius,
				},
				startAngle: 0,
				endAngle: Math.PI / 2,
			})
			this._mainPrimitives2[2].modify({
				...baseConfig,
				centerPoint: {
					x: bboxRightBottom.x - borderRadius,
					y: bboxRightBottom.y + borderRadius,
				},
				startAngle: (3 * Math.PI) / 2,
				endAngle: 2 * Math.PI,
			})
			this._mainPrimitives2[3].modify({
				...baseConfig,
				centerPoint: {
					x: bboxLeftBottom.x + borderRadius,
					y: bboxLeftBottom.y + borderRadius,
				},
				startAngle: Math.PI,
				endAngle: (3 * Math.PI) / 2,
			})
		}
		const baseConfig: any = {
			status: mainElementItemData.status,
			layerItemId: mainElementItemData.layerItemId,
			strokeWidth: mainElementItemData.strokeWidth,
			strokeColorData: mainElementItemData.strokeColorData,
			alpha: mainElementItemData.alpha,
			lineCap: borderRadius > 0 ? ECanvas2DLineCap.SQUARE : ECanvas2DLineCap.ROUND,
			isSolid: mainElementItemData.isSolid,
			segSize: mainElementItemData.segSize,
			gapSize: mainElementItemData.gapSize,
			isFixedStrokeWidth: mainElementItemData.isFixedStrokeWidth,
		}
		this._mainPrimitives[0].modify({
			...baseConfig,
			/* ... */
			startPoint: {
				x: bboxLeftUp.x + borderRadius,
				y: bboxLeftUp.y,
			},
			endPoint: {
				x: bboxRightUp.x - borderRadius,
				y: bboxRightUp.y,
			},
		})
		this._mainPrimitives[1].modify({
			...baseConfig,
			/* ... */
			startPoint: {
				x: bboxRightUp.x,
				y: bboxRightUp.y - borderRadius,
			},
			endPoint: {
				x: bboxRightBottom.x,
				y: bboxRightBottom.y + borderRadius,
			},
		})
		this._mainPrimitives[2].modify({
			...baseConfig,
			/* ... */
			startPoint: {
				x: bboxLeftBottom.x + borderRadius,
				y: bboxLeftBottom.y,
			},
			endPoint: {
				x: bboxRightBottom.x - borderRadius,
				y: bboxRightBottom.y,
			},
		})
		this._mainPrimitives[3].modify({
			...baseConfig,
			/* ... */
			startPoint: {
				x: bboxLeftUp.x,
				y: bboxLeftUp.y - borderRadius,
			},
			endPoint: {
				x: bboxLeftBottom.x,
				y: bboxLeftBottom.y + borderRadius,
			},
		})
		if (mainElementItemData.isFill && this._mainFillPrimitives.length) {
			if (borderRadius > 0) {
				const baseConfig: any = {
					status: mainElementItemData.status,
					layerItemId: mainElementItemData.layerItemId,
					strokeColorData: mainElementItemData.fillColorData,
					alpha: mainElementItemData.alpha,
					lineCap: ECanvas2DLineCap.SQUARE,
					isSolid: true,
					segSize: 0,
					gapSize: 0,
					isFixedStrokeWidth: false,
				}
				this._mainFillPrimitives[0].modify({
					...baseConfig,
					startPoint: {
						x: bboxLeftUp.x + borderRadius,
						y: bboxLeftUp.y - borderRadius / 2 - mainElementItemData.strokeWidth / 4,
					},
					endPoint: {
						x: bboxRightUp.x - borderRadius,
						y: bboxRightUp.y - borderRadius / 2 - mainElementItemData.strokeWidth / 4,
					},
					strokeWidth: borderRadius - mainElementItemData.strokeWidth / 2,
				})
				this._mainFillPrimitives[1].modify({
					...baseConfig,
					startPoint: {
						x: bboxLeftUp.x + mainElementItemData.strokeWidth / 2,
						y: bboxLeftUp.y - (bboxLeftUp.y - bboxLeftBottom.y) / 2,
					},
					endPoint: {
						x: bboxRightUp.x - mainElementItemData.strokeWidth / 2,
						y: bboxLeftUp.y - (bboxLeftUp.y - bboxLeftBottom.y) / 2,
					},
					strokeWidth: bboxLeftUp.y - bboxLeftBottom.y - borderRadius * 2,
				})
				this._mainFillPrimitives[2].modify({
					...baseConfig,
					startPoint: {
						x: bboxLeftBottom.x + borderRadius,
						y: bboxLeftBottom.y + borderRadius / 2 + mainElementItemData.strokeWidth / 4,
					},
					endPoint: {
						x: bboxRightBottom.x - borderRadius,
						y: bboxRightBottom.y + borderRadius / 2 + mainElementItemData.strokeWidth / 4,
					},
					strokeWidth: borderRadius - mainElementItemData.strokeWidth / 2,
				})
			} else {
				this._mainFillPrimitives[0].modify({
					status: mainElementItemData.status,
					layerItemId: mainElementItemData.layerItemId,
					startPoint: {
						x: bboxLeftUp.x + mainElementItemData.strokeWidth / 2,
						y: bboxLeftUp.y - (bboxLeftUp.y - bboxLeftBottom.y) / 2,
					},
					endPoint: {
						x: bboxRightUp.x - mainElementItemData.strokeWidth / 2,
						y: bboxLeftUp.y - (bboxLeftUp.y - bboxLeftBottom.y) / 2,
					},
					strokeWidth: bboxLeftUp.y - bboxLeftBottom.y - mainElementItemData.strokeWidth,
					strokeColorData: mainElementItemData.fillColorData,
					alpha: mainElementItemData.alpha,
					lineCap: ECanvas2DLineCap.SQUARE,
					isSolid: true,
					segSize: 0,
					gapSize: 0,
					isFixedStrokeWidth: false,
				})
			}
		}
	}

	private drawMaskPrimitives(mainElementItemData: TElement2DRectJSONViewData): void {
		const maskLayerId: string = this._maskPrimitives[0] ? this._maskPrimitives[0].layerItemId : undefined!
		if (!maskLayerId) {
			return
		}
		const extendBbox2: BBox2 = BBox2.createByJSONData(mainElementItemData.bbox2).extendByDist(-mainElementItemData.strokeWidth / 2)
		const bboxLeftUp: { x: number; y: number } = {
			x: extendBbox2.minX,
			y: extendBbox2.maxY,
		}
		const bboxRightUp: { x: number; y: number } = {
			x: extendBbox2.maxX,
			y: extendBbox2.maxY,
		}
		const bboxLeftBottom: { x: number; y: number } = {
			x: extendBbox2.minX,
			y: extendBbox2.minY,
		}
		const bboxRightBottom: { x: number; y: number } = {
			x: extendBbox2.maxX,
			y: extendBbox2.minY,
		}
		const bbox2Width: number = bboxRightUp.x - bboxLeftUp.x
		const bbox2Height: number = bboxRightUp.y - bboxRightBottom.y
		let borderRadius: number = mainElementItemData.borderRadius
		if (bbox2Width <= borderRadius * 2) {
			borderRadius = bbox2Width / 2
		}
		if (bbox2Height <= borderRadius * 2) {
			borderRadius = bbox2Height / 2
		}
		if (borderRadius > 0) {
			const baseConfig: any = {
				status: mainElementItemData.status,
				layerItemId: maskLayerId,
				strokeWidth: mainElementItemData.strokeWidth,
				strokeColorData: MaskColor.createStrokeColor().toRGBAJSON(),
				alpha: mainElementItemData.alpha,
				lineCap: ECanvas2DLineCap.SQUARE,
				isSolid: mainElementItemData.isSolid,
				radius: borderRadius,
				fillColorData: mainElementItemData.isFill ? MaskColor.createFillColor(mainElementItemData.fillColorData).toRGBAJSON() : null!,
				isFill: mainElementItemData.isFill,
				segSize: mainElementItemData.segSize,
				gapSize: mainElementItemData.gapSize,
				isFixedStrokeWidth: mainElementItemData.isFixedStrokeWidth,
				sweep: ESweep.CCW,
			}
			this._maskPrimitives2[0].modify({
				...baseConfig,
				centerPoint: {
					x: bboxLeftUp.x + borderRadius,
					y: bboxLeftUp.y - borderRadius,
				},
				startAngle: Math.PI / 2,
				endAngle: Math.PI,
			})
			this._maskPrimitives2[1].modify({
				...baseConfig,
				centerPoint: {
					x: bboxRightUp.x - borderRadius,
					y: bboxRightUp.y - borderRadius,
				},
				startAngle: 0,
				endAngle: Math.PI / 2,
			})
			this._maskPrimitives2[2].modify({
				...baseConfig,
				centerPoint: {
					x: bboxRightBottom.x - borderRadius,
					y: bboxRightBottom.y + borderRadius,
				},
				startAngle: (3 * Math.PI) / 2,
				endAngle: 2 * Math.PI,
			})
			this._maskPrimitives2[3].modify({
				...baseConfig,
				centerPoint: {
					x: bboxLeftBottom.x + borderRadius,
					y: bboxLeftBottom.y + borderRadius,
				},
				startAngle: Math.PI,
				endAngle: (3 * Math.PI) / 2,
			})
		}
		const baseConfig: any = {
			status: mainElementItemData.status,
			layerItemId: maskLayerId,
			strokeWidth: mainElementItemData.strokeWidth,
			strokeColorData: MaskColor.createStrokeColor().toRGBAJSON(),
			alpha: mainElementItemData.alpha,
			lineCap: borderRadius > 0 ? ECanvas2DLineCap.SQUARE : ECanvas2DLineCap.ROUND,
			isSolid: mainElementItemData.isSolid,
			segSize: mainElementItemData.segSize,
			gapSize: mainElementItemData.gapSize,
			isFixedStrokeWidth: mainElementItemData.isFixedStrokeWidth,
		}
		this._maskPrimitives[0].modify({
			...baseConfig,
			/* ... */
			startPoint: {
				x: bboxLeftUp.x + borderRadius,
				y: bboxLeftUp.y,
			},
			endPoint: {
				x: bboxRightUp.x - borderRadius,
				y: bboxRightUp.y,
			},
		})
		this._maskPrimitives[1].modify({
			...baseConfig,
			/* ... */
			startPoint: {
				x: bboxRightUp.x,
				y: bboxRightUp.y - borderRadius,
			},
			endPoint: {
				x: bboxRightBottom.x,
				y: bboxRightBottom.y + borderRadius,
			},
		})
		this._maskPrimitives[2].modify({
			...baseConfig,
			/* ... */
			startPoint: {
				x: bboxLeftBottom.x + borderRadius,
				y: bboxLeftBottom.y,
			},
			endPoint: {
				x: bboxRightBottom.x - borderRadius,
				y: bboxRightBottom.y,
			},
		})
		this._maskPrimitives[3].modify({
			...baseConfig,
			/* ... */
			startPoint: {
				x: bboxLeftUp.x,
				y: bboxLeftUp.y - borderRadius,
			},
			endPoint: {
				x: bboxLeftBottom.x,
				y: bboxLeftBottom.y + borderRadius,
			},
		})
		if (mainElementItemData.isFill && this._maskFillPrimitives.length) {
			if (borderRadius > 0) {
				const baseConfig: any = {
					status: mainElementItemData.status,
					layerItemId: maskLayerId,
					strokeColorData: MaskColor.createStrokeColor().toRGBAJSON(),
					alpha: mainElementItemData.alpha,
					lineCap: ECanvas2DLineCap.SQUARE,
					isSolid: true,
					segSize: 0,
					gapSize: 0,
					isFixedStrokeWidth: false,
				}
				this._maskFillPrimitives[0].modify({
					...baseConfig,
					startPoint: {
						x: bboxLeftUp.x + mainElementItemData.strokeWidth / 2,
						y: bboxLeftUp.y - (bboxLeftUp.y - bboxLeftBottom.y) / 2,
					},
					endPoint: {
						x: bboxRightUp.x - mainElementItemData.strokeWidth / 2,
						y: bboxLeftUp.y - (bboxLeftUp.y - bboxLeftBottom.y) / 2,
					},
					strokeWidth: bboxLeftUp.y - bboxLeftBottom.y - borderRadius * 2,
				})
				this._maskFillPrimitives[1].modify({
					...baseConfig,
					startPoint: {
						x: bboxLeftUp.x + borderRadius,
						y: bboxLeftUp.y - borderRadius / 2 - mainElementItemData.strokeWidth / 4,
					},
					endPoint: {
						x: bboxRightUp.x - borderRadius,
						y: bboxRightUp.y - borderRadius / 2 - mainElementItemData.strokeWidth / 4,
					},
					strokeWidth: borderRadius - mainElementItemData.strokeWidth / 2,
				})
				this._maskFillPrimitives[2].modify({
					...baseConfig,
					startPoint: {
						x: bboxLeftBottom.x + borderRadius,
						y: bboxLeftBottom.y + borderRadius / 2 + mainElementItemData.strokeWidth / 4,
					},
					endPoint: {
						x: bboxRightBottom.x - borderRadius,
						y: bboxRightBottom.y + borderRadius / 2 + mainElementItemData.strokeWidth / 4,
					},
					strokeWidth: borderRadius - mainElementItemData.strokeWidth / 2,
				})
			} else {
				this._maskFillPrimitives[0].modify({
					status: mainElementItemData.status,
					layerItemId: maskLayerId,
					startPoint: {
						x: bboxLeftUp.x + mainElementItemData.strokeWidth / 2,
						y: bboxLeftUp.y - (bboxLeftUp.y - bboxLeftBottom.y) / 2,
					},
					endPoint: {
						x: bboxRightUp.x - mainElementItemData.strokeWidth / 2,
						y: bboxLeftUp.y - (bboxLeftUp.y - bboxLeftBottom.y) / 2,
					},
					strokeWidth: bboxLeftUp.y - bboxLeftBottom.y - mainElementItemData.strokeWidth,
					strokeColorData: MaskColor.createStrokeColor().toRGBAJSON(),
					alpha: mainElementItemData.alpha,
					lineCap: ECanvas2DLineCap.SQUARE,
					isSolid: true,
					segSize: 0,
					gapSize: 0,
					isFixedStrokeWidth: false,
				})
			}
		}
	}
}
