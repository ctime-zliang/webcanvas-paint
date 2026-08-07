import { Vector2 } from '../../engine/algorithm/geometry/vector/Vector2'
import { LinkedList } from '../../engine/algorithm/linkList/LinkedList'
import { ESweep } from '../../engine/config/CommonProfile'
import { D2ArcToolkit } from './D2ArcToolkit'
import { D2PrimitiveToolkit } from './D2PrimitiveToolkit'
import { Arc } from './primitives/Arc'
import { Line } from './primitives/Line'
import { Polyline } from './primitives/Polyline'
import { Primitive } from './primitives/Primitive'

function mulRatio(paths: Array<Array<string | number>>, ratio: number = 1): Array<Array<string | number>> {
	if (ratio <= 0 || ratio === 1) {
		return paths
	}
	const result: Array<Array<string | number>> = new Array(paths.length)
	for (let i: number = 0; i < paths.length; i++) {
		const pl: Array<string | number> = paths[i]
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

export class D2PolygonToolkit {
	public static getPolygonsPath(pls: Array<Polyline>, ratio: number = 1): Array<Array<string | number>> {
		const result: Array<Array<string | number>> = []
		for (let i: number = 0; i < pls.length; i++) {
			let pl: Polyline = pls[i]
			if (pl.primitives.length === 1) {
				const pt: Primitive = pl.primitives[0]
				if (pt instanceof Arc && Math.abs(pt.sweepRadian) === Math.PI * 2) {
					if (!(pt.sweep === ESweep.CCW)) {
						result.push(['CIRCLE', pt.centerPoint.x * ratio, pt.centerPoint.y * ratio, pt.rx * ratio])
						continue
					}
					const swp2: number = pt.sweepRadian / 2
					pl = new Polyline([Arc.build3(pt.centerPoint, 0, swp2, pt.rx, pt.ry)].concat([Arc.build3(pt.centerPoint, swp2, swp2, pt.rx, pt.ry)]))
				}
			}
			const path: Array<string | number> = []
			const pts: Array<Primitive> = pl.primitives
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
				if (pt instanceof Arc && D2PrimitiveToolkit.getPrimitiveItemLength(pt) > 1e-8) {
					isLine = false
					path.push(pt.startPoint.x * ratio, pt.startPoint.y * ratio)
					path.push('Arc')
					path.push(pt.sweepRadian)
					continue
				}
			}
			if (path.length > 2) {
				path.push(pts[pts.length - 1].endPoint.x * ratio, pts[pts.length - 1].endPoint.y * ratio)
				result.push(path)
			}
		}
		return result
	}

	public static parsePolygonPaths(paths: Array<Array<string | number>>, ratio: number = 1): Array<Polyline> {
		const paths2: Array<Array<string | number>> = mulRatio(paths, ratio)
		const result: Array<Polyline> = new Array(paths2.length)
		const pts: LinkedList<Primitive> = new LinkedList<Primitive>()
		let [startPoint, endPoint]: [Vector2, Vector2] = [null!, null!]
		let isLine: boolean = false
		let pt: Primitive = null!
		let radian: number = undefined!
		for (let k: number = 0; k < paths2.length; k++) {
			const polygon: Array<string | number> = paths2[k]
			if (polygon[0] === 'CIRCLE') {
				const pl: Polyline = new Polyline([Arc.build2(new Vector2(polygon[1] as number, polygon[2] as number), 0, Math.PI * 2, polygon[3] as number, polygon[3] as number, ESweep.CW)])
				result[k] = pl
				continue
			}
			startPoint = new Vector2(polygon[0] as number, polygon[1] as number)
			isLine = false
			const len: number = polygon.length
			for (let i: number = 2; i < len; ) {
				const curr: string | number = polygon[i]
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
						radian = ((polygon[i + 1] as number) / 180) * Math.PI
						endPoint = new Vector2(polygon[i + 2] as number, polygon[i + 3] as number)
						if (Math.abs(radian) > 1e-8 && !startPoint.equalsWithPoint(endPoint)) {
							const { centerPoint, radius, startRadian, endRadian, sweep } = D2ArcToolkit.calculateD2ArcProfileTwoPointsAndRadian(radian, startPoint, endPoint)
							pt = Arc.build2(centerPoint, (startRadian / Math.PI) * 180, (endRadian / Math.PI) * 180, radius, radius, sweep)
							pts.addLastValue(pt)
						}
						startPoint = endPoint
						i += 4
						break
					}
					case 'C': {
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

	/**
	 * 计算任意 Polygon 面积
	 *      顶点列表按照顺时针或逆时针排序
	 */
	public static calcPolygonArea(points: Array<Vector2>): number {
		const len: number = points.length
		if (len <= 2) {
			return 0
		}
		let area: number = points[0].x * (points[len - 1].y - points[1].y)
		for (let i: number = 0; i < len - 1; i++) {
			area += points[i].x * (points[i - 1].y - points[i + 1].y)
		}
		area += points[len - 1].x * (points[len - 2].y - points[0].y)
		return Math.abs(area / 2.0)
	}

	/**
	 * 计算任意 Polygon (带洞)面积
	 */
	public static calcPolygonsArea(points: Array<Array<Vector2>>): number {
		const len: number = points.length
		if (len <= 0) {
			return 0
		}
		let outlineArea: number = D2PolygonToolkit.calcPolygonArea(points[0])
		for (let i: number = 1; i < len; i++) {
			outlineArea -= D2PolygonToolkit.calcPolygonArea(points[i])
		}
		return outlineArea
	}
}
