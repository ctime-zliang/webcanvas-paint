import { Vector2 } from '../../../engine/algorithm/geometry/vector/Vector2'
import { ESweep } from '../../../engine/config/CommonProfile'
import { DoubleKit } from '../../../engine/math/Doublekit'
import { PolygonIdentify } from '../PolygonIdentify'
import { Arc } from '../primitives/Arc'
import { Polyline } from '../primitives/Polyline'

export function scanPolyline(pl: Polyline): boolean {
	const mod: number = pl.primitives[0] instanceof Arc ? pl.primitives[0].sweepAngle % 360 : null!
	if (pl.primitives.length === 1 && pl.primitives[0] instanceof Arc && (DoubleKit.eq(mod, 0) || DoubleKit.eq(Math.abs(mod), 0))) {
		if (pl.primitives[0].sweep === ESweep.CCW) {
			return true
		}
		return false
	}
	const points: Array<Vector2> = []
	pl.points(0.1, (p: Vector2): void => {
		points.push(p)
	})
	return PolygonIdentify.getPolygonSweep(points)
}
