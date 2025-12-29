import { TEarNode } from './Earcut'
import {
	cureLocalIntersections,
	equals,
	filterPoints,
	indexCurve,
	insertNode,
	isEar,
	isEarHashed,
	removeNode,
	signedArea,
	splitEarcut,
} from './Utils'

/**
 * create a circular doubly linked list from polygon points in the specified winding order
 */
export function linkedList(data: Array<number>, start: number, end: number, dim: number, clockwise: boolean): TEarNode {
	let last: TEarNode = null!
	if (clockwise === signedArea(data, start, end, dim) > 0) {
		for (let i: number = start; i < end; i += dim) {
			last = insertNode((i / dim) | 0, data[i], data[i + 1], last)
		}
	} else {
		for (let i: number = end - dim; i >= start; i -= dim) {
			last = insertNode((i / dim) | 0, data[i], data[i + 1], last)
		}
	}
	if (last && equals(last, last.next)) {
		removeNode(last)
		last = last.next
	}
	return last
}

/**
 * main ear slicing loop which triangulates a polygon (given as a linked list)
 */
export function earcutLinked(ear: TEarNode, triangles: Array<number>, dim: number, minX: number, minY: number, invSize: number, pass: number): void {
	if (!ear) {
		return
	}
	/**
	 * interlink polygon nodes in z-order
	 */
	if (!pass && invSize) {
		indexCurve(ear, minX, minY, invSize)
	}
	let stop: TEarNode = ear
	/**
	 * iterate through ears, slicing them one by one
	 */
	while (ear.prev !== ear.next) {
		const prev: TEarNode = ear.prev
		const next: TEarNode = ear.next
		if (invSize ? isEarHashed(ear, minX, minY, invSize) : isEar(ear)) {
			/**
			 * cut off the triangle
			 */
			triangles.push(prev.i, ear.i, next.i)
			removeNode(ear)
			/**
			 * skipping the next vertex leads to less sliver triangles
			 */
			ear = next.next
			stop = next.next
			continue
		}
		ear = next
		/**
		 * if we looped through the whole remaining polygon and can't find any more ears
		 */
		if (ear === stop) {
			/**
			 * try filtering points and slicing again
			 */
			if (!pass) {
				earcutLinked(filterPoints(ear), triangles, dim, minX, minY, invSize, 1)
			} else if (pass === 1) {
				ear = cureLocalIntersections(filterPoints(ear), triangles)
				earcutLinked(ear, triangles, dim, minX, minY, invSize, 2)
			} else if (pass === 2) {
				splitEarcut(ear, triangles, dim, minX, minY, invSize)
			}
			break
		}
	}
}

/**
 * Simon Tatham's linked list merge sort algorithm
 * http://www.chiark.greenend.org.uk/~sgtatham/algorithms/listsort.html
 */
export function sortLinked(list: TEarNode): TEarNode {
	let numMerges: number
	let inSize: number = 1
	do {
		let p: TEarNode = list
		let e: TEarNode = null!
		list = null!
		let tail: TEarNode = null!
		numMerges = 0
		while (p) {
			numMerges++
			let q: TEarNode = p
			let pSize: number = 0
			for (let i: number = 0; i < inSize; i++) {
				pSize++
				q = q.nextZ
				if (!q) {
					break
				}
			}
			let qSize: number = inSize
			while (pSize > 0 || (qSize > 0 && q)) {
				if (pSize !== 0 && (qSize === 0 || !q || p.z <= q.z)) {
					e = p
					p = p.nextZ
					pSize--
				} else {
					e = q
					q = q.nextZ
					qSize--
				}
				if (tail) {
					tail.nextZ = e
				} else {
					list = e
				}
				e.prevZ = tail
				tail = e
			}
			p = q
		}
		tail.nextZ = null!
		inSize *= 2
	} while (numMerges > 1)
	return list
}
