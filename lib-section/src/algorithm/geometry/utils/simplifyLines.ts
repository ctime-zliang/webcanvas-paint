import { Vector2 } from '../../../engine/algorithm/geometry/vector/Vector2'

export function simplifyLines(points: Array<Vector2>, maxAngleSum: number = 0.05): Array<Vector2> {
	if (points.length < 3) {
		return points.slice()
	}
	let prev: Vector2 = points[0]
	const noClosedPoints: Array<Vector2> = [prev]
	for (let i: number = 1; i < points.length; i++) {
		const curr: Vector2 = points[i]
		if (!prev.equalsWithVector2(curr)) {
			noClosedPoints.push(curr)
		}
		prev = curr
	}
	if (prev !== noClosedPoints[noClosedPoints.length - 1]) {
		if (noClosedPoints.length !== 1) {
			noClosedPoints.pop()
		}
		noClosedPoints.push(prev)
	}
	if (maxAngleSum < 0) {
		return noClosedPoints
	}
	let prev2: Vector2 = noClosedPoints[1]
	let prevVec: Vector2 = prev2.sub(noClosedPoints[0]).normalize()
	let angleSum: number = 0
	const simplifiedPoints: Array<Vector2> = [noClosedPoints[0]]
	for (let i: number = 2; i < noClosedPoints.length; i++) {
		const curr: Vector2 = noClosedPoints[i]
		const currVec: Vector2 = curr.sub(prev2).normalize()
		angleSum += Math.acos(Math.min(1, Math.max(-1, prevVec.dot(currVec))))
		if (angleSum > maxAngleSum) {
			simplifiedPoints.push(prev)
			angleSum = 0
		}
		prev2 = curr
		prevVec = currVec
	}
	simplifiedPoints.push(prev2)
	return simplifiedPoints
}
