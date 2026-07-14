import { ECanvasD2LineCap } from '../../../engine/config/PrimitiveProfile'
import { Color, POINT_EVENT_NAME, Sweep, SWEEP, Vector2, WebCanvas } from '../../../Main'

export function drawTestArcItems(webCanvas: WebCanvas, layerItemId: string): void {
	const { d2ElementController } = webCanvas
	const defaultLayerItemId: string = layerItemId
	const shapeElementItemId1: string = d2ElementController.createD2ArcElementShapeItem(
		defaultLayerItemId,
		new Vector2(-180, 60),
		40,
		0,
		(Math.PI * 1) / 4,
		SWEEP.CCW,
		{
			strokeWidth: 5,
			strokeColor: Color.RED,
			isSolid: true,
			isFill: true,
			fillColor: Color.GOLDEN,
		}
	)
	const shapeElementItemId2: string = d2ElementController.createD2ArcElementShapeItem(
		defaultLayerItemId,
		new Vector2(-90, 60),
		40,
		0,
		(Math.PI * 2) / 4,
		SWEEP.CCW,
		{
			strokeWidth: 5,
			strokeColor: Color.RED,
			isSolid: true,
			isFill: true,
			fillColor: Color.GOLDEN,
		}
	)
	const shapeElementItemId3: string = d2ElementController.createD2ArcElementShapeItem(
		defaultLayerItemId,
		new Vector2(-0, 60),
		40,
		0,
		(Math.PI * 3) / 4,
		SWEEP.CCW,
		{
			strokeWidth: 5,
			strokeColor: Color.RED,
			isSolid: true,
			isFill: true,
			fillColor: Color.GOLDEN,
		}
	)
	const shapeElementItemId4: string = d2ElementController.createD2ArcElementShapeItem(
		defaultLayerItemId,
		new Vector2(90, 60),
		40,
		0,
		(Math.PI * 4) / 4,
		SWEEP.CCW,
		{
			strokeWidth: 5,
			strokeColor: Color.RED,
			isSolid: true,
			isFill: true,
			fillColor: Color.GOLDEN,
		}
	)
	const shapeElementItemId5: string = d2ElementController.createD2ArcElementShapeItem(
		defaultLayerItemId,
		new Vector2(180, 60),
		40,
		0,
		(Math.PI * 5) / 4,
		SWEEP.CCW,
		{
			strokeWidth: 5,
			strokeColor: Color.RED,
			isSolid: true,
			isFill: true,
			fillColor: Color.GOLDEN,
		}
	)
	const shapeElementItemId6: string = d2ElementController.createD2ArcElementShapeItem(
		defaultLayerItemId,
		new Vector2(-180, -25),
		40,
		0,
		(Math.PI * 6) / 4,
		SWEEP.CCW,
		{
			strokeWidth: 5,
			strokeColor: Color.RED,
			isSolid: true,
			isFill: true,
			fillColor: Color.GOLDEN,
		}
	)
	const shapeElementItemId7: string = d2ElementController.createD2ArcElementShapeItem(
		defaultLayerItemId,
		new Vector2(-90, -25),
		40,
		0,
		(Math.PI * 7) / 4,
		SWEEP.CCW,
		{
			strokeWidth: 5,
			strokeColor: Color.RED,
			isSolid: true,
			isFill: true,
			fillColor: Color.GOLDEN,
		}
	)
	const shapeElementItemId8: string = d2ElementController.createD2ArcElementShapeItem(
		defaultLayerItemId,
		new Vector2(0, -25),
		40,
		0,
		(Math.PI * 8) / 4,
		SWEEP.CCW,
		{
			strokeWidth: 5,
			strokeColor: Color.RED,
			isSolid: true,
			isFill: true,
			fillColor: Color.GOLDEN,
		}
	)
}
