import { TD2EdgeItem, TD2PointItem } from '../../../types/Common'
import { orient } from '../../../algorithm/geometry/Orients'

function errorWeight(base: TD2PointItem, a: Array<number>, b: Array<number>): number {
	const area: number = Math.abs(orient(base, a, b))
	const perim: number = Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2))
	return area / perim
}

function compareCells(a: Array<number>, b: Array<number>): number {
	let n: number = a.length
	let t: number = a.length - b.length
	if (t) {
		return t
	}
	switch (n) {
		case 0:
			return 0
		case 1:
			return a[0] - b[0]
		case 2: {
			const d: number = a[0] + a[1] - (b[0] + b[1])
			if (d) {
				return d
			}
			return Math.min(a[0], a[1]) - Math.min(b[0], b[1])
		}
		case 3: {
			const l1: number = a[0] + a[1]
			const m1: number = b[0] + b[1]
			let d: number = l1 + a[2] - (m1 + b[2])
			if (d) {
				return d
			}
			const l0: number = Math.min(a[0], a[1])
			const m0: number = Math.min(b[0], b[1])
			d = Math.min(l0, a[2]) - Math.min(m0, b[2])
			if (d) {
				return d
			}
			return Math.min(l0 + a[2], l1) - Math.min(m0 + b[2], m1)
		}
		default: {
			const as: Array<number> = a.slice(0)
			as.sort()
			const bs: Array<number> = b.slice(0)
			bs.sort()
			for (let i: number = 0; i < n; i++) {
				t = as[i] - bs[i]
				if (t) {
					return t
				}
			}
			return 0
		}
	}
}

function normalize(cells: Array<Array<number>>, attr: Array<Array<number>> = undefined!) {
	if (attr) {
		const len: number = cells.length
		const zipped: Array<Array<Array<number>>> = new Array(len)
		for (let i: number = 0; i < len; i++) {
			zipped[i] = [cells[i], attr[i]]
		}
		zipped.sort((a: Array<Array<number>>, b: Array<Array<number>>): number => {
			return compareCells(a[0], b[0])
		})
		for (let i: number = 0; i < len; i++) {
			cells[i] = zipped[i][0]
			attr[i] = zipped[i][1]
		}
		return cells
	}
	cells.sort(compareCells)
	return cells
}

function unique(cells: Array<Array<number>>): Array<Array<number>> {
	if (cells.length === 0) {
		return []
	}
	let ptr: number = 1
	for (let i: number = 1; i < cells.length; i++) {
		let a: Array<number> = cells[i]
		if (compareCells(a, cells[i - 1])) {
			if (i === ptr) {
				ptr++
				continue
			}
			cells[ptr++] = a
		}
	}
	cells.length = ptr
	return cells
}

export class Simplifys {
	static proecss(
		cells: Array<TD2EdgeItem>,
		positions: Array<TD2PointItem>,
		minArea: number
	): {
		positions: Array<TD2PointItem>
		edges: Array<TD2EdgeItem>
	} {
		const positionsLen: number = positions.length
		const cellsLen: number = cells.length
		const inv: Array<number> = new Array(positionsLen)
		const outv: Array<number> = new Array(positionsLen)
		const weights: Array<number> = new Array(positionsLen)
		const dead: Array<boolean> = new Array(positionsLen)
		const heap: Array<number> = []
		const index: Array<number> = new Array(positionsLen)
		const npositions: Array<TD2PointItem> = []
		const ncells: Array<TD2EdgeItem> = []
		let heapCount: number = heap.length
		const computeWeight = (i: number): number => {
			if (dead[i]) {
				return Infinity
			}
			const s: number = inv[i]
			const t: number = outv[i]
			if (s < 0 || t < 0) {
				return Infinity
			}
			return errorWeight(positions[i], positions[s], positions[t])
		}
		const heapSwap = (i: number, j: number): void => {
			const a: number = heap[i]
			const b: number = heap[j]
			heap[i] = b
			heap[j] = a
			index[a] = j
			index[b] = i
		}
		const heapParent = (i: number): number => {
			if (i & 1) {
				return (i - 1) >> 1
			}
			return (i >> 1) - 1
		}
		const heapDown = (i: number): number => {
			let w: number = weights[heap[i]]
			while (true) {
				let tw: number = w
				let left: number = 2 * i + 1
				let right: number = 2 * (i + 1)
				let next: number = i
				if (left < heapCount) {
					const lw: number = weights[heap[left]]
					if (lw < tw) {
						next = left
						tw = lw
					}
				}
				if (right < heapCount) {
					const rw: number = weights[heap[right]]
					if (rw < tw) {
						next = right
					}
				}
				if (next === i) {
					return i
				}
				heapSwap(i, next)
				i = next
			}
		}
		const heapUp = (i: number): number | undefined => {
			const w: number = weights[heap[i]]
			while (i > 0) {
				const parent: number = heapParent(i)
				if (parent >= 0) {
					const pw: number = weights[heap[parent]]
					if (w < pw) {
						heapSwap(i, parent)
						i = parent
						continue
					}
				}
				return i
			}
		}
		const heapPop = (): number => {
			if (heapCount > 0) {
				const head: number = heap[0]
				heapSwap(0, heapCount - 1)
				heapCount -= 1
				heapDown(0)
				return head
			}
			return -1
		}
		const heapUpdate = (i: number, w: number): number | undefined => {
			const a: number = heap[i]
			if (weights[a] === w) {
				return i
			}
			weights[a] = -Infinity
			heapUp(i)
			heapPop()
			weights[a] = w
			heapCount += 1
			return heapUp(heapCount - 1)
		}
		const kill = (i: number): void => {
			if (dead[i]) {
				return
			}
			dead[i] = true
			const s: number = inv[i]
			const t: number = outv[i]
			if (inv[t] >= 0) {
				inv[t] = s
			}
			if (outv[s] >= 0) {
				outv[s] = t
			}
			if (index[s] >= 0) {
				heapUpdate(index[s], computeWeight(s))
			}
			if (index[t] >= 0) {
				heapUpdate(index[t], computeWeight(t))
			}
		}
		const tortoiseHare = (seq: Array<number>, start: number): number => {
			if (seq[start] < 0) {
				return start
			}
			let t: number = start
			let h: number = start
			do {
				let nh: number = seq[h]
				if (!dead[h] || nh < 0 || nh === h) {
					break
				}
				h = nh
				nh = seq[h]
				if (!dead[h] || nh < 0 || nh === h) {
					break
				}
				h = nh
				t = seq[t]
			} while (t !== h)
			for (let v: number = start; v !== h; v = seq[v]) {
				seq[v] = h
			}
			return h
		}

		for (let i: number = 0; i < positionsLen; i++) {
			inv[i] = outv[i] = -1
			weights[i] = Infinity
			dead[i] = false
		}
		for (let i: number = 0; i < cellsLen; i++) {
			const c: Array<number> = cells[i]
			if (c.length !== 2) {
				throw new Error('input must be a graph.')
			}
			const s: number = c[1]
			const t: number = c[0]
			if (outv[t] !== -1) {
				outv[t] = -2
			} else {
				outv[t] = s
			}
			if (inv[s] !== -1) {
				inv[s] = -2
			} else {
				inv[s] = t
			}
		}
		for (let i: number = 0; i < positionsLen; i++) {
			const w: number = (weights[i] = computeWeight(i))
			if (w < Infinity) {
				index[i] = heap.length
				heap.push(i)
			} else {
				index[i] = -1
			}
		}
		heapCount = heap.length
		for (let i: number = heapCount >> 1; i >= 0; --i) {
			heapDown(i)
		}
		while (true) {
			const hmin: number = heapPop()
			if (hmin < 0 || weights[hmin] > minArea) {
				break
			}
			kill(hmin)
		}
		for (let i: number = 0; i < positionsLen; i++) {
			if (!dead[i]) {
				index[i] = npositions.length
				npositions.push(positions[i].slice() as TD2PointItem)
			}
		}
		for (let i: number = 0; i < cells.length; i++) {
			const c: Array<number> = cells[i]
			const tin: number = tortoiseHare(inv, c[0])
			const tout: number = tortoiseHare(outv, c[1])
			if (tin >= 0 && tout >= 0 && tin !== tout) {
				const cin: number = index[tin]
				const cout: number = index[tout]
				if (cin !== cout) {
					ncells.push([cin, cout])
				}
			}
		}
		unique(normalize(ncells))
		return {
			positions: npositions,
			edges: ncells,
		}
	}
}
