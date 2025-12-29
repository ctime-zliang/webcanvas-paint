import { Vector2 } from '../../../engine/algorithm/geometry/vector/Vector2'
import { LinkedList } from '../../../engine/algorithm/linkList/LinkedList'
import { ESweep } from '../../../engine/config/CommonProfile'
import { ArcTransition } from '../ArcTransition'
import { Arc } from '../primitives/Arc'
import { Bezier } from '../primitives/Bezier'
import { Line } from '../primitives/Line'
import { Polyline } from '../primitives/Polyline'
import { Primitive } from '../primitives/Primitive'
import { getPrimitiveItemLength } from './primitivesUtils'

export function getPolygonsPath(pls: Array<Polyline>, ratio: number = 1): Array<Array<string | number>> {
	const result: Array<Array<string | number>> = []
	for (let i: number = 0; i < pls.length; i++) {
		let pl: Polyline = pls[i]
		if (pl.primitives.length === 1) {
			const pt: Primitive = pl.primitives[0]
			if (pt instanceof Arc && Math.abs(pt.sweepAngle) === 360) {
				if (!(pt.sweep === ESweep.CCW)) {
					result.push(['CIRCLE', pt.centerPoint.x * ratio, pt.centerPoint.y * ratio, pt.rx * ratio])
					continue
				}
				const swp2: number = pt.sweepAngle / 2
				pl = new Polyline([Arc.build3(pt.centerPoint, 0, swp2, pt.rx, pt.ry)].concat([Arc.build3(pt.centerPoint, swp2, swp2, pt.rx, pt.ry)]))
			}
		}
		const path: Array<string | number> = []
		let pts: Array<Primitive> = pl.primitives
		let isLine: boolean = false
		for (let pt of pts) {
			if (pt instanceof Line) {
				path.push(pt.startPoint.x * ratio, pt.startPoint.y * ratio)
				if (!isLine) {
					path.push('L')
					isLine = true
				}
				continue
			}
			if (pt instanceof Arc && getPrimitiveItemLength(pt) > 1e-8) {
				isLine = false
				path.push(pt.startPoint.x * ratio, pt.startPoint.y * ratio)
				path.push('Arc')
				path.push(pt.sweepAngle)
				continue
			}
			if (pt instanceof Bezier) {
				isLine = false
				path.push(pt.startPoint.x * ratio, pt.startPoint.y * ratio)
				path.push('C')
				for (let j: number = 1; j < pt.controls.length - 1; j++) {
					path.push(pt.controls[j].x * ratio, pt.controls[j].y * ratio)
				}
			}
		}
		if (path.length > 2) {
			path.push(pts[pts.length - 1].endPoint.x * ratio, pts[pts.length - 1].endPoint.y * ratio)
			result.push(path)
		}
	}
	return result
}

export function parsePolygonPaths(paths: Array<Array<string | number>>, ratio: number = 1): Array<Polyline> {
	const paths2: Array<Array<string | number>> = mulRatio(paths, ratio)
	const result: Array<Polyline> = new Array(paths2.length)
	const pts: LinkedList<Primitive> = new LinkedList<Primitive>()
	let startPoint: Vector2 = null!
	let endPoint: Vector2 = null!
	let isLine: boolean = false
	let pt: Primitive = null!
	let angle: number = undefined!
	for (let k: number = 0; k < paths2.length; k++) {
		const polygon: Array<string | number> = paths2[k]
		if (polygon[0] === 'CIRCLE') {
			const pl: Polyline = new Polyline([
				Arc.build2(new Vector2(polygon[1] as number, polygon[2] as number), 0, 360, polygon[3] as number, polygon[3] as number, ESweep.CW),
			])
			result[k] = pl
			continue
		}
		startPoint = new Vector2(polygon[0] as number, polygon[1] as number)
		isLine = false
		const len: number = polygon.length
		for (let i: number = 2; i < len; ) {
			let curr: string | number = polygon[i]
			switch (curr) {
				case 'L': {
					endPoint = new Vector2(polygon[i + 1] as number, polygon[i + 2] as number)
					pt = new Line(startPoint, endPoint)
					pts.addLastValue(pt)
					i += 3
					isLine = true
					break
				}
				case 'ARC': {
					isLine = false
					angle = ((polygon[i + 1] as number) / 180) * Math.PI
					endPoint = new Vector2(polygon[i + 2] as number, polygon[i + 3] as number)
					if (Math.abs(angle) > 1e-8 && !startPoint.equalsWithPoint(endPoint)) {
						const { center, radius, startAngle, endAngle, sweep } = ArcTransition.towPoint2Arc(startPoint, endPoint, angle)
						pt = Arc.build2(center, (startAngle / Math.PI) * 180, (endAngle / Math.PI) * 180, radius, radius, sweep)
						pts.addLastValue(pt)
					}
					startPoint = endPoint
					i += 4
					break
				}
				case 'C': {
					isLine = false
					const points: Array<Vector2> = []
					points.push(startPoint)
					i++
					while (true) {
						const p: Vector2 = new Vector2(polygon[i] as number, polygon[i + 1] as number)
						points.push(p)
						i++
						if (typeof points[i + 2] === 'string') {
							startPoint = p
							i += 2
							break
						}
						i += 2
						if (i >= len) {
							break
						}
					}
					pt = new Bezier(points)
					pts.addLastValue(pt)
					break
				}
				default: {
					if (isLine) {
						endPoint = new Vector2(polygon[i] as number, polygon[i + 1] as number)
						pt = new Line(startPoint, endPoint)
						pts.addLastValue(pt)
						startPoint = endPoint
						i += 2
					} else {
						i++
					}
					break
				}
			}
		}
		if (pts.getSize() > 0) {
			result[k] = new Polyline(pts.toArray())
		}
	}
	pts.clear()
	return result
}

export function mulRatio(paths: Array<Array<string | number>>, ratio: number = 1): Array<Array<string | number>> {
	if (ratio <= 0 || ratio === 1) {
		return paths
	}
	const result: Array<Array<string | number>> = new Array(paths.length)
	for (let i: number = 0; i < paths.length; i++) {
		let pl: Array<string | number> = paths[i]
		const ta: Array<string | number> = new Array(pl.length)
		for (let j: number = 0; j < pl.length; j++) {
			if (typeof pl[j] === 'number') {
				ta[j] = (pl[j] as number) / ratio
				continue
			}
			ta[j] = pl[j]
		}
		result[i] = ta
	}
	return result
}
