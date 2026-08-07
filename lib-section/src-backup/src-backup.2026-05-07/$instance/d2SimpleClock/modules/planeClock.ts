import { ED2FontStyle } from '../../../engine/config/PrimitiveProfile'
import { Angles, CANVAS_LINE_CAP, CanvasMatrix4, Color, DOMGetBoundingClientRectResult, Matrix4, px2mm, Vector3, WebCanvas, Vector2, D2TextVertexData, SWEEP } from '../../../Main'
import { formatDates } from '../../public/formatDates'
import { createTextVertexData } from '../utils/createTextVertexData'
import { appendImageElement, updateImageElement } from '../utils/renderImage'

const RUN_PROFILE = {
	isShowSecondHand: true,
	isShowMinuteHand: true,
	isShowHourHand: true,
	isShowMinuteScaleLine: true,
	isShowHourScaleLine: true,
	isShowScaleText: true,
	isShowRipple: true,
	isShowDateTime: true,
	/* ... */
	baseLength: 0,
	outCircleRadius: 0,
	/* ... */
	scaleFontFamily: 'auto',
	scaleTextVertexs: [] as Array<{
		textContent: string
		d2TextVertexData: D2TextVertexData
	}>,
	/* ... */
	imageConfig: {
		imageElementItemId: undefined,
	},
	/* ... */
	nowTimeStamp: 0,
	lastTimeStamp: 0,
	distTimeStamp: 0,
}

const RIPPLE_PROFILE = {
	maxRadius: 0,
	radius: 0,
	duration: 2000,
	speed: 0,
}

function drawPlaneClock(webCanvas: WebCanvas, canvasContainerElement: HTMLElement, timeStamp: number, clockPlaneLayerItemId: string, clockPointerLayerItemId: string, clockPointerCenterLayerItemId: string): void {
	if (webCanvas.isQuit) {
		canvasContainerElement.remove()
		return
	}
	/**
	 * 记录时间 & 时间差
	 */
	RUN_PROFILE.nowTimeStamp = timeStamp
	RUN_PROFILE.distTimeStamp = RUN_PROFILE.nowTimeStamp - RUN_PROFILE.lastTimeStamp
	RUN_PROFILE.lastTimeStamp = RUN_PROFILE.nowTimeStamp

	/**
	 * 清理当前图层的所有图元
	 */
	const { drawLayerController, d2TextElementController, d2ElementController } = webCanvas
	drawLayerController.deleteDrawLayerElements(clockPlaneLayerItemId)
	drawLayerController.deleteDrawLayerElements(clockPointerLayerItemId)
	drawLayerController.deleteDrawLayerElements(clockPointerCenterLayerItemId)

	const timeString: string = formatDates()
	const nowHours: number = new Date().getHours()
	const nowMinutes: number = new Date().getMinutes()
	const nowSeconds: number = new Date().getSeconds()
	const nowMilliSeconds: number = new Date().getMilliseconds()
	const totalMillSecOfHou: number = (nowHours % 12) * 60 * 60 * 1000 + nowMinutes * 60 * 1000 + nowSeconds * 1000 + nowMilliSeconds * 1
	const totalMillSecOfMin: number = nowMinutes * 60 * 1000 + nowSeconds * 1000 + nowMilliSeconds * 1
	const totalMillSecOfSec: number = nowSeconds * 1000 + nowMilliSeconds * 1
	const rotationOfHou: number = totalMillSecOfHou * -Angles.degreeToRadian(360 / 12 / 60 / 60 / 1000)
	const rotationOfMin: number = totalMillSecOfMin * -Angles.degreeToRadian(360 / 60 / 60 / 1000)
	const rotationOfSec: number = totalMillSecOfSec * -Angles.degreeToRadian(360 / 60 / 1000)

	const outCircleRadius1: number = RUN_PROFILE.outCircleRadius
	const outCircleRadius2: number = RUN_PROFILE.outCircleRadius - 2

	/**
	 * 绘制外层圆弧
	 */
	const outArcElementId1: string = d2ElementController.createD2ArcElementShapeItem(clockPlaneLayerItemId, new Vector2(0, 0), outCircleRadius1 + 10, -(Math.PI * 1) / 4, (Math.PI * 1) / 4, SWEEP.CCW, {
		strokeWidth: 1,
		strokeColor: Color.GOLDEN,
		isSolid: true,
	})
	const outArcElementId2: string = d2ElementController.createD2ArcElementShapeItem(clockPlaneLayerItemId, new Vector2(0, 0), outCircleRadius1 + 10, (3 * (Math.PI * 1)) / 4, (5 * (Math.PI * 1)) / 4, SWEEP.CCW, {
		strokeWidth: 1,
		strokeColor: Color.GOLDEN,
		isSolid: true,
	})

	/**
	 * 绘制外层大圆
	 */
	const outCircleElementId1: string = d2ElementController.createD2CircleElementShapeItem(clockPlaneLayerItemId, new Vector2(0, 0), {
		radius: outCircleRadius1,
		strokeWidth: 0.5,
	})
	d2ElementController.updateD2ElementShapeItemAttrByJSONData(outCircleElementId1, {
		elementItemName: `外层大圆 1`,
		strokeColor: Color.createByAlpha(0.7, Color.YELLOW_GREEN),
	})
	const outCircleElementId2: string = d2ElementController.createD2CircleElementShapeItem(clockPlaneLayerItemId, new Vector2(0, 0), {
		radius: outCircleRadius2,
		strokeWidth: 0.5,
	})
	d2ElementController.updateD2ElementShapeItemAttrByJSONData(outCircleElementId2, {
		elementItemName: `外层大圆 2`,
		strokeColor: Color.createByAlpha(0.7, Color.GOLDEN),
	})

	/**
	 * 绘制刻度数字
	 */
	if (RUN_PROFILE.isShowScaleText && RUN_PROFILE.scaleTextVertexs.length >= 12) {
		const baseEndPosition: Vector3 = new Vector3(0, outCircleRadius2 * 0.84, 0)
		for (let i: number = 0; i < RUN_PROFILE.scaleTextVertexs.length; i++) {
			const { d2TextVertexData } = RUN_PROFILE.scaleTextVertexs[i]
			const rotationMatrix4: Matrix4 = CanvasMatrix4.setRotationByVector3(-Angles.degreeToRadian(30 * (i + 1)), new Vector3(0, 0, 1))
			const endPosition: Vector3 = baseEndPosition.multiplyMatrix4(rotationMatrix4)
			d2TextElementController.createD2TextElementItemByVertexData(
				clockPlaneLayerItemId,
				d2TextVertexData,
				new Vector2(endPosition.x - (d2TextVertexData.initBbox2.maxX - d2TextVertexData.initBbox2.minX) / 2, endPosition.y + (d2TextVertexData.initBbox2.maxY - d2TextVertexData.initBbox2.minY) / 2),
				{
					strokeColor: Color.GREEN_YELLOW,
					alpha: 1.0,
				}
			)
		}
	}

	/**
	 * 绘制矩形框
	 */
	d2ElementController.createD2RectElementShapeItem(clockPlaneLayerItemId, new Vector2((-RUN_PROFILE.outCircleRadius / 12) * 3.5, RUN_PROFILE.outCircleRadius * 0.25), (RUN_PROFILE.outCircleRadius / 12) * 3.5 * 2, 10, {
		strokeColor: Color.GOLDEN,
		strokeWidth: 0.5,
		isFill: false,
		alpha: 0.5,
		borderRadius: 2,
	})

	/**
	 * 绘制数字日期时间
	 * 绘制数字日期时间边框线
	 */
	if (RUN_PROFILE.isShowDateTime) {
		d2TextElementController.createD2TextElementItem(clockPlaneLayerItemId, new Vector2((-RUN_PROFILE.outCircleRadius / 12) * 4.5, -RUN_PROFILE.outCircleRadius * 0.45), timeString, {
			fontFamily: RUN_PROFILE.scaleFontFamily,
			fontStyle: ED2FontStyle.ITALIC,
			fontSize: RUN_PROFILE.outCircleRadius / 12,
			strokeColor: Color.GOLDEN,
			fontWeight: 100,
			styleSetting: {
				backgourdColor: Color.createByAlpha(0.25, Color.YELLOW_GREEN),
				padding: { left: 3, top: 3, right: 3, bottom: 3 },
				borderRadius: 3,
			},
		})
	}

	/**
	 * 绘制波纹圆
	 */
	if (RUN_PROFILE.isShowRipple) {
		RIPPLE_PROFILE.radius += RUN_PROFILE.distTimeStamp * RIPPLE_PROFILE.speed
		if (RIPPLE_PROFILE.radius > RIPPLE_PROFILE.maxRadius) {
			RIPPLE_PROFILE.radius = 0
		}
		const rippleRadiusDist: number = RIPPLE_PROFILE.maxRadius - RIPPLE_PROFILE.radius
		const setRippleCircleFillColorAlpha: number = 0.25 * (rippleRadiusDist / RIPPLE_PROFILE.maxRadius)
		const setRippleCircleStrokeColorAlpha: number = 0.25 * (rippleRadiusDist / RIPPLE_PROFILE.maxRadius)
		const rippleCircleElementId: string = d2ElementController.createD2CircleElementShapeItem(clockPlaneLayerItemId, new Vector2(0, 0), {
			radius: RIPPLE_PROFILE.radius,
			strokeWidth: 0.3,
		})
		d2ElementController.updateD2ElementShapeItemAttrByJSONData(rippleCircleElementId, {
			elementItemName: `波纹圆`,
			strokeColor: new Color(Color.YELLOW_GREEN.r * 255, Color.YELLOW_GREEN.g * 255, Color.YELLOW_GREEN.b * 255, setRippleCircleStrokeColorAlpha),
			fillColor: new Color(Color.YELLOW_GREEN.r * 255, Color.YELLOW_GREEN.g * 255, Color.YELLOW_GREEN.b * 255, setRippleCircleFillColorAlpha),
		})
	}

	/**
	 * 绘制时钟刻度线
	 */
	if (RUN_PROFILE.isShowHourScaleLine) {
		for (let i: number = 1; i <= 12; i++) {
			const baseStartPosition: Vector3 = new Vector3(0, 0, 0)
			const baseEndPosition: Vector3 = new Vector3(0, 8, 0)
			const translateMatrix4: Matrix4 = CanvasMatrix4.setTranslateByVector3(new Vector3(0, outCircleRadius2 - 8, 0))
			const rotationMatrix4: Matrix4 = CanvasMatrix4.setRotationByVector3(-Angles.degreeToRadian(30 * i), new Vector3(0, 0, 1))
			const startPosition: Vector3 = baseStartPosition.multiplyMatrix4(translateMatrix4.multiply4(rotationMatrix4))
			const endPosition: Vector3 = baseEndPosition.multiplyMatrix4(translateMatrix4.multiply4(rotationMatrix4))
			const lineElementId: string = d2ElementController.createD2LineElementShapeItem(clockPointerLayerItemId, startPosition.toVector2(), endPosition.toVector2(), {
				strokeWidth: 1,
			})
			let setColor: Color = Color.GOLDEN
			if ((nowSeconds === i * 5 - 1 && nowMilliSeconds >= 900) || (nowSeconds === i * 5 && nowMilliSeconds <= 150)) {
				setColor = Color.ORIGIN
			}
			d2ElementController.updateD2ElementShapeItemAttrByJSONData(lineElementId, {
				elementItemName: `时钟刻度 ${i}`,
				lineCap: CANVAS_LINE_CAP.SQUARE,
				strokeColor: setColor,
			})
		}
	}

	/**
	 * 绘制分钟刻度线
	 */
	if (RUN_PROFILE.isShowMinuteScaleLine) {
		for (let i: number = 1; i <= 60; i++) {
			if (i % 5 === 0) {
				continue
			}
			const baseStartPosition: Vector3 = new Vector3(0, 0, 0)
			const baseEndPosition: Vector3 = new Vector3(0, 5, 0)
			const translateMatrix4: Matrix4 = CanvasMatrix4.setTranslateByVector3(new Vector3(0, outCircleRadius2 - 5, 0))
			const rotationMatrix4: Matrix4 = CanvasMatrix4.setRotationByVector3(-Angles.degreeToRadian(6 * i), new Vector3(0, 0, 1))
			const startPosition: Vector3 = baseStartPosition.multiplyMatrix4(translateMatrix4.multiply4(rotationMatrix4))
			const endPosition: Vector3 = baseEndPosition.multiplyMatrix4(translateMatrix4.multiply4(rotationMatrix4))
			const lineElementId: string = d2ElementController.createD2LineElementShapeItem(clockPointerLayerItemId, startPosition.toVector2(), endPosition.toVector2(), {
				strokeWidth: 0.5,
			})
			let setColor: Color = Color.GOLDEN
			if ((nowSeconds === i - 1 && nowMilliSeconds >= 900) || (nowSeconds === i && nowMilliSeconds <= 150)) {
				setColor = Color.ORIGIN
			}
			d2ElementController.updateD2ElementShapeItemAttrByJSONData(lineElementId, {
				elementItemName: `分钟刻度 ${i}`,
				lineCap: CANVAS_LINE_CAP.SQUARE,
				strokeColor: setColor,
			})
		}
	}

	/**
	 * 绘制三针
	 */
	let rotationMatrix4: Matrix4 = null!
	let startPosition: Vector3 = null!
	let endPosition: Vector3 = null!
	let lineElementId: string = null!
	if (RUN_PROFILE.isShowHourHand) {
		rotationMatrix4 = CanvasMatrix4.setRotationByVector3(rotationOfHou, new Vector3(0, 0, 1))
		startPosition = new Vector3(0, 0, 0).multiplyMatrix4(rotationMatrix4)
		endPosition = new Vector3(0, outCircleRadius2 - 40, 0).multiplyMatrix4(rotationMatrix4)
		lineElementId = d2ElementController.createD2LineElementShapeItem(clockPointerLayerItemId, startPosition.toVector2(), endPosition.toVector2(), {
			strokeWidth: 3.5,
		})
		d2ElementController.updateD2ElementShapeItemAttrByJSONData(lineElementId, { elementItemName: `时针`, strokeColor: Color.GREEN })
		rotationMatrix4 = CanvasMatrix4.setRotationByVector3(rotationOfHou + Math.PI, new Vector3(0, 0, 1))
		startPosition = new Vector3(0, 0, 0).multiplyMatrix4(rotationMatrix4)
		endPosition = new Vector3(0, 18, 0).multiplyMatrix4(rotationMatrix4)
		lineElementId = d2ElementController.createD2LineElementShapeItem(clockPointerLayerItemId, startPosition.toVector2(), endPosition.toVector2(), {
			strokeWidth: 3.5,
		})
		d2ElementController.updateD2ElementShapeItemAttrByJSONData(lineElementId, { elementItemName: `时针尾`, strokeColor: Color.GREEN })
	}
	if (RUN_PROFILE.isShowMinuteHand) {
		rotationMatrix4 = CanvasMatrix4.setRotationByVector3(rotationOfMin, new Vector3(0, 0, 1))
		startPosition = new Vector3(0, 0, 0).multiplyMatrix4(rotationMatrix4)
		endPosition = new Vector3(0, outCircleRadius2 - 25, 0).multiplyMatrix4(rotationMatrix4)
		lineElementId = d2ElementController.createD2LineElementShapeItem(clockPointerLayerItemId, startPosition.toVector2(), endPosition.toVector2(), {
			strokeWidth: 3.5,
		})
		d2ElementController.updateD2ElementShapeItemAttrByJSONData(lineElementId, { elementItemName: `分针`, strokeColor: Color.YELLOW })
		rotationMatrix4 = CanvasMatrix4.setRotationByVector3(rotationOfMin + Math.PI, new Vector3(0, 0, 1))
		startPosition = new Vector3(0, 0, 0).multiplyMatrix4(rotationMatrix4)
		endPosition = new Vector3(0, 25, 0).multiplyMatrix4(rotationMatrix4)
		lineElementId = d2ElementController.createD2LineElementShapeItem(clockPointerLayerItemId, startPosition.toVector2(), endPosition.toVector2(), {
			strokeWidth: 3.5,
		})
		d2ElementController.updateD2ElementShapeItemAttrByJSONData(lineElementId, { elementItemName: `分针尾`, strokeColor: Color.YELLOW })
	}
	if (RUN_PROFILE.isShowSecondHand) {
		rotationMatrix4 = CanvasMatrix4.setRotationByVector3(rotationOfSec, new Vector3(0, 0, 1))
		startPosition = new Vector3(0, 0, 0).multiplyMatrix4(rotationMatrix4)
		endPosition = new Vector3(0, outCircleRadius2 - 10, 0).multiplyMatrix4(rotationMatrix4)
		lineElementId = d2ElementController.createD2LineElementShapeItem(clockPointerLayerItemId, startPosition.toVector2(), endPosition.toVector2(), {
			strokeWidth: 2.5,
		})
		d2ElementController.updateD2ElementShapeItemAttrByJSONData(lineElementId, { elementItemName: `秒针`, strokeColor: Color.RED })
		rotationMatrix4 = CanvasMatrix4.setRotationByVector3(rotationOfSec + Math.PI, new Vector3(0, 0, 1))
		startPosition = new Vector3(0, 0, 0).multiplyMatrix4(rotationMatrix4)
		endPosition = new Vector3(0, 32, 0).multiplyMatrix4(rotationMatrix4)
		lineElementId = d2ElementController.createD2LineElementShapeItem(clockPointerLayerItemId, startPosition.toVector2(), endPosition.toVector2(), {
			strokeWidth: 2.5,
		})
		d2ElementController.updateD2ElementShapeItemAttrByJSONData(lineElementId, { elementItemName: `秒针尾`, strokeColor: Color.RED })
	}
	/**
	 * 绘制中心实心圆
	 */
	const centerCircleElementItem1: string = d2ElementController.createD2CircleElementShapeItem(clockPointerCenterLayerItemId, new Vector2(0, 0), {
		radius: 4,
		strokeWidth: 0.5,
	})
	d2ElementController.updateD2ElementShapeItemAttrByJSONData(centerCircleElementItem1, {
		elementItemName: `中心外圆`,
		strokeColor: Color.ORIGIN,
		fillColor: Color.ORIGIN,
	})
	const centerCircleElementItem2: string = d2ElementController.createD2CircleElementShapeItem(clockPointerCenterLayerItemId, new Vector2(0, 0), {
		radius: 2,
		strokeWidth: 0.5,
	})
	d2ElementController.updateD2ElementShapeItemAttrByJSONData(centerCircleElementItem2, {
		elementItemName: `中心内圆`,
		strokeColor: Color.GOLDEN,
		fillColor: Color.GOLDEN,
	})

	window.requestAnimationFrame((timeStamp: number): void => {
		updateImageElement(d2ElementController, RUN_PROFILE.imageConfig.imageElementItemId!)
		drawPlaneClock(webCanvas, canvasContainerElement, timeStamp, clockPlaneLayerItemId, clockPointerLayerItemId, clockPointerCenterLayerItemId)
	})
}

export function drawPlaneClockInit(webCanvas: WebCanvas, canvasContainerElement: HTMLElement): void {
	const { d2ElementController, d2TextElementController, drawLayerController } = webCanvas
	const clockPlaneLayerItemId: string = drawLayerController.createDrawLayerShapeItem(`Clock Plane`)
	const clockPointerLayerItemId: string = drawLayerController.createDrawLayerShapeItem(`Clock Pointer`)
	const clockPointerCenterLayerItemId: string = drawLayerController.createDrawLayerShapeItem(`Clock Pointer Center`)
	const earthLayerItemId: string = drawLayerController.createDrawLayerShapeItem(`Earth Image`)

	drawLayerController.clearAllDrawLayersSelectedStatus()

	const DPI: [number, number] = webCanvas.getDPI()
	const canvasRect: DOMGetBoundingClientRectResult = webCanvas.getCanvasRect()
	const isWidthLess: boolean = canvasRect.width < canvasRect.height
	const shorterSideSize: number = isWidthLess ? canvasRect.width : canvasRect.height
	const shorterSideSizePhysics: number = px2mm(+shorterSideSize, isWidthLess ? DPI[0] : DPI[1])

	RUN_PROFILE.baseLength = (shorterSideSizePhysics / 2) * 0.7
	RUN_PROFILE.outCircleRadius = RUN_PROFILE.baseLength + 5
	RIPPLE_PROFILE.maxRadius = RUN_PROFILE.outCircleRadius
	RIPPLE_PROFILE.speed = RIPPLE_PROFILE.maxRadius / RIPPLE_PROFILE.duration

	createTextVertexData(d2TextElementController, RUN_PROFILE.scaleFontFamily, RUN_PROFILE.outCircleRadius / 7, RUN_PROFILE.scaleTextVertexs)
	appendImageElement(d2ElementController, earthLayerItemId, RIPPLE_PROFILE.maxRadius * 0.6, RUN_PROFILE)

	window.requestAnimationFrame((timeStamp: number): void => {
		RUN_PROFILE.lastTimeStamp = timeStamp
		drawPlaneClock(webCanvas, canvasContainerElement, timeStamp, clockPlaneLayerItemId, clockPointerLayerItemId, clockPointerCenterLayerItemId)
	})
}
