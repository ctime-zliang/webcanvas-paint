import { earcutLinked, linkedList } from './Link'
import { eliminateHoles } from './Utils'

export type TEarNode = {
	i: number
	x: number
	y: number
	z: number
	prev: TEarNode
	next: TEarNode
	prevZ: TEarNode
	nextZ: TEarNode
	steiner: boolean
}

export class Earcut {
	static convert(data: Array<number>, holeIndices: Array<number> = null!, dim: number = 2): Array<number> {
		const hasHoles: number = holeIndices && holeIndices.length
		const outerLen: number = hasHoles ? holeIndices[0] * dim : data.length
		const triangles: Array<number> = []
		let outerNode: TEarNode = linkedList(data, 0, outerLen, dim, true)
		if (!outerNode || outerNode.next === outerNode.prev) {
			return triangles
		}
		let minX: number = undefined!
		let minY: number = undefined!
		let invSize: number = undefined!
		if (hasHoles) {
			outerNode = eliminateHoles(data, holeIndices, outerNode, dim)
		}
		/**
		 * if the shape is not too simple, we'll use z-order curve hash later; calculate polygon bbox
		 */
		if (data.length > 80 * dim) {
			minX = Infinity
			minY = Infinity
			let maxX: number = -Infinity
			let maxY: number = -Infinity
			for (let i: number = dim; i < outerLen; i += dim) {
				const x: number = data[i]
				const y: number = data[i + 1]
				if (x < minX) {
					minX = x
				}
				if (y < minY) {
					minY = y
				}
				if (x > maxX) {
					maxX = x
				}
				if (y > maxY) {
					maxY = y
				}
			}
			/**
			 * minX, minY and invSize are later used to transform coords into integers for z-order calculation
			 */
			invSize = Math.max(maxX - minX, maxY - minY)
			invSize = invSize !== 0 ? 32767 / invSize : 0
		}
		earcutLinked(outerNode, triangles, dim, minX, minY, invSize, 0)
		return triangles
	}
}
