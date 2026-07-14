import { TEarNode } from './Earcut'
import { earcutLinked, linkedList, sortLinked } from './Link'

/**
 * turn a polygon in a multi-dimensional array form (e.g. as in GeoJSON) into a form Earcut accepts
 */
export function flatten(data: Array<any>): {
	vertices: Array<any>
	holes: Array<number>
	dimensions: number
} {
	const vertices: Array<any> = []
	const holes: Array<number> = []
	const dimensions: number = data[0][0].length
	let holeIndex: number = 0
	let prevLen: number = 0
	for (const ring of data) {
		for (const p of ring) {
			for (let d: number = 0; d < dimensions; d++) {
				vertices.push(p[d])
			}
		}
		if (prevLen) {
			holeIndex += prevLen
			holes.push(holeIndex)
		}
		prevLen = ring.length
	}
	return { vertices, holes, dimensions }
}

export function signedArea(data: Array<any>, start: number, end: number, dim: number): number {
	let sum: number = 0
	for (let i: number = start, j = end - dim; i < end; i += dim) {
		sum += (data[j] - data[i]) * (data[i + 1] + data[j + 1])
		j = i
	}
	return sum
}

/**
 * return a percentage difference between the polygon area and its triangulation area
 * used to verify correctness of triangulation
 */
export function deviation(data: Array<any>, holeIndices: Array<number>, dim: number, triangles: Array<number>): number {
	const hasHoles: number = holeIndices && holeIndices.length
	const outerLen: number = hasHoles ? holeIndices[0] * dim : data.length
	let polygonArea: number = Math.abs(signedArea(data, 0, outerLen, dim))
	if (hasHoles) {
		for (let i: number = 0, len = holeIndices.length; i < len; i++) {
			const start: number = holeIndices[i] * dim
			const end: number = i < len - 1 ? holeIndices[i + 1] * dim : data.length
			polygonArea -= Math.abs(signedArea(data, start, end, dim))
		}
	}
	let trianglesArea: number = 0
	for (let i: number = 0; i < triangles.length; i += 3) {
		const a: number = triangles[i] * dim
		const b: number = triangles[i + 1] * dim
		const c: number = triangles[i + 2] * dim
		trianglesArea += Math.abs((data[a] - data[c]) * (data[b + 1] - data[a + 1]) - (data[a] - data[b]) * (data[c + 1] - data[a + 1]))
	}
	return polygonArea === 0 && trianglesArea === 0 ? 0 : Math.abs((trianglesArea - polygonArea) / polygonArea)
}

export function createNode(i: number, x: number, y: number): TEarNode {
	return {
		i, // vertex index in coordinates array
		x,
		y, // vertex coordinates
		prev: null!, // previous and next vertex nodes in a polygon ring
		next: null!,
		z: 0, // z-order curve value
		prevZ: null!, // previous and next nodes in z-order
		nextZ: null!,
		steiner: false, // indicates whether this is a steiner point
	}
}

export function removeNode(p: TEarNode): void {
	p.next.prev = p.prev
	p.prev.next = p.next
	if (p.prevZ) {
		p.prevZ.nextZ = p.nextZ
	}
	if (p.nextZ) {
		p.nextZ.prevZ = p.prevZ
	}
}

/**
 * create a node and optionally link it with previous one (in a circular doubly linked list)
 */
export function insertNode(i: number, x: number, y: number, last: TEarNode): TEarNode {
	const p: TEarNode = createNode(i, x, y)
	if (!last) {
		p.prev = p
		p.next = p
	} else {
		p.next = last.next
		p.prev = last
		last.next.prev = p
		last.next = p
	}
	return p
}

/**
 * link two polygon vertices with a bridge; if the vertices belong to the same ring, it splits polygon into two
 * if one belongs to the outer ring and another to a hole, it merges it into a single ring
 */
export function splitPolygon(a: TEarNode, b: TEarNode): TEarNode {
	const a2: TEarNode = createNode(a.i, a.x, a.y)
	const b2: TEarNode = createNode(b.i, b.x, b.y)
	const an: TEarNode = a.next
	const bp: TEarNode = b.prev
	a.next = b
	b.prev = a
	a2.next = an
	an.prev = a2
	b2.next = a2
	a2.prev = b2
	bp.next = b2
	b2.prev = bp
	return b2
}

/**
 * check if the middle point of a polygon diagonal is inside the polygon
 */
export function middleInside(a: TEarNode, b: TEarNode): boolean {
	const px: number = (a.x + b.x) / 2
	const py: number = (a.y + b.y) / 2
	let p: TEarNode = a
	let inside: boolean = false
	do {
		if (p.y > py !== p.next.y > py && p.next.y !== p.y && px < ((p.next.x - p.x) * (py - p.y)) / (p.next.y - p.y) + p.x) {
			inside = !inside
		}
		p = p.next
	} while (p !== a)
	return inside
}

/**
 * check if a polygon diagonal is locally inside the polygon
 */
export function locallyInside(a: TEarNode, b: TEarNode): boolean {
	return area(a.prev, a, a.next) < 0 ? area(a, b, a.next) >= 0 && area(a, a.prev, b) >= 0 : area(a, b, a.prev) < 0 || area(a, a.next, b) < 0
}

/**
 * for collinear points p, q, r, check if point q lies on segment pr
 */
export function onSegment(p: TEarNode, q: TEarNode, r: TEarNode): boolean {
	return q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) && q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y)
}

export function sign(num: number): number {
	return num > 0 ? 1 : num < 0 ? -1 : 0
}

/**
 * check if a polygon diagonal intersects any polygon segments
 */
export function intersectsPolygon(a: TEarNode, b: TEarNode): boolean {
	let p: TEarNode = a
	do {
		if (p.i !== a.i && p.next.i !== a.i && p.i !== b.i && p.next.i !== b.i && intersects(p, p.next, a, b)) {
			return true
		}
		p = p.next
	} while (p !== a)
	return false
}

/**
 * signed area of a triangle
 */
export function area(p: TEarNode, q: TEarNode, r: TEarNode): number {
	return (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y)
}

/**
 * check if two points are equal
 */
export function equals(p1: TEarNode, p2: TEarNode): boolean {
	return p1.x === p2.x && p1.y === p2.y
}

/**
 * check if two segments intersect
 */
export function intersects(p1: TEarNode, q1: TEarNode, p2: TEarNode, q2: TEarNode): boolean {
	const o1: number = sign(area(p1, q1, p2))
	const o2: number = sign(area(p1, q1, q2))
	const o3: number = sign(area(p2, q2, p1))
	const o4: number = sign(area(p2, q2, q1))
	if (o1 !== o2 && o3 !== o4) {
		/**
		 * general case
		 */
		return true
	}
	if (o1 === 0 && onSegment(p1, p2, q1)) {
		/**
		 * p1, q1 and p2 are collinear and p2 lies on p1q1
		 */
		return true
	}
	if (o2 === 0 && onSegment(p1, q2, q1)) {
		/**
		 * p1, q1 and q2 are collinear and q2 lies on p1q1
		 */
		return true
	}
	if (o3 === 0 && onSegment(p2, p1, q2)) {
		/**
		 * p2, q2 and p1 are collinear and p1 lies on p2q2
		 */
		return true
	}
	if (o4 === 0 && onSegment(p2, q1, q2)) {
		/**
		 * p2, q2 and q1 are collinear and q1 lies on p2q2
		 */
		return true
	}
	return false
}

/**
 * check if a point lies within a convex triangle but false if its equal to the first point of the triangle
 */
export function pointInTriangleExceptFirst(ax: number, ay: number, bx: number, by: number, cx: number, cy: number, px: number, py: number): boolean {
	return !(ax === px && ay === py) && pointInTriangle(ax, ay, bx, by, cx, cy, px, py)
}

/**
 * check if a diagonal between two polygon nodes is valid (lies in polygon interior)
 */
export function isValidDiagonal(a: TEarNode, b: TEarNode): number | boolean {
	return (
		a.next.i !== b.i &&
		a.prev.i !== b.i &&
		!intersectsPolygon(a, b) && // dones't intersect other edges
		((locallyInside(a, b) &&
			locallyInside(b, a) &&
			middleInside(a, b) && // locally visible
			(area(a.prev, a, b.prev) || area(a, b.prev, b))) || // does not create opposite-facing sectors
			(equals(a, b) && area(a.prev, a, a.next) > 0 && area(b.prev, b, b.next) > 0))
	) // special zero-length case
}

/**
 * z-order of a point given coords and inverse of the longer side of data bbox
 */
export function zOrder(x: number, y: number, minX: number, minY: number, invSize: number): number {
	/**
	 * coords are transformed into non-negative 15-bit integer range
	 */
	x = ((x - minX) * invSize) | 0
	y = ((y - minY) * invSize) | 0
	x = (x | (x << 8)) & 0x00ff00ff
	x = (x | (x << 4)) & 0x0f0f0f0f
	x = (x | (x << 2)) & 0x33333333
	x = (x | (x << 1)) & 0x55555555
	y = (y | (y << 8)) & 0x00ff00ff
	y = (y | (y << 4)) & 0x0f0f0f0f
	y = (y | (y << 2)) & 0x33333333
	y = (y | (y << 1)) & 0x55555555
	return x | (y << 1)
}

/**
 * find the leftmost node of a polygon ring
 */
export function getLeftmost(start: TEarNode): TEarNode {
	let p: TEarNode = start
	let leftmost: TEarNode = start
	do {
		if (p.x < leftmost.x || (p.x === leftmost.x && p.y < leftmost.y)) {
			leftmost = p
		}
		p = p.next
	} while (p !== start)
	return leftmost
}

/**
 * check if a point lies within a convex triangle
 */
export function pointInTriangle(ax: number, ay: number, bx: number, by: number, cx: number, cy: number, px: number, py: number): boolean {
	return (
		(cx - px) * (ay - py) >= (ax - px) * (cy - py) &&
		(ax - px) * (by - py) >= (bx - px) * (ay - py) &&
		(bx - px) * (cy - py) >= (cx - px) * (by - py)
	)
}

/**
 * whether sector in vertex m contains sector in vertex p in the same coordinates
 */
export function sectorContainsSector(m: TEarNode, p: TEarNode): boolean {
	return area(m.prev, m, p.prev) < 0 && area(p.next, m, m.next) < 0
}

/**
 * interlink polygon nodes in z-order
 */
export function indexCurve(start: TEarNode, minX: number, minY: number, invSize: number): void {
	let p: TEarNode = start
	do {
		if (p.z === 0) {
			p.z = zOrder(p.x, p.y, minX, minY, invSize)
		}
		p.prevZ = p.prev
		p.nextZ = p.next
		p = p.next
	} while (p !== start)
	p.prevZ.nextZ = null!
	p.prevZ = null!
	sortLinked(p)
}

/**
 * David Eberly's algorithm for finding a bridge between hole and outer polygon
 */
export function findHoleBridge(hole: TEarNode, outerNode: TEarNode): TEarNode {
	let p: TEarNode = outerNode
	const hx: number = hole.x
	const hy: number = hole.y
	let qx: number = -Infinity
	let m: TEarNode = undefined!
	/**
	 * find a segment intersected by a ray from the hole's leftmost point to the left
	 * segment's endpoint with lesser x will be potential connection point
	 * unless they intersect at a vertex, then choose the vertex
	 */
	if (equals(hole, p)) {
		return p
	}
	do {
		if (equals(hole, p.next)) {
			return p.next
		} else if (hy <= p.y && hy >= p.next.y && p.next.y !== p.y) {
			const x: number = p.x + ((hy - p.y) * (p.next.x - p.x)) / (p.next.y - p.y)
			if (x <= hx && x > qx) {
				qx = x
				m = p.x < p.next.x ? p : p.next
				if (x === hx) {
					return m // hole touches outer segment; pick leftmost endpoint
				}
			}
		}
		p = p.next
	} while (p !== outerNode)
	if (!m) {
		return null!
	}
	/**
	 * look for points inside the triangle of hole point, segment intersection and endpoint
	 * if there are no points found, we have a valid connection
	 * otherwise choose the point of the minimum angle with the ray as connection point
	 */
	const stop: TEarNode = m
	const mx: number = m.x
	const my: number = m.y
	let tanMin: number = Infinity
	p = m
	do {
		if (hx >= p.x && p.x >= mx && hx !== p.x && pointInTriangle(hy < my ? hx : qx, hy, mx, my, hy < my ? qx : hx, hy, p.x, p.y)) {
			const tan: number = Math.abs(hy - p.y) / (hx - p.x) // tangential
			if (locallyInside(p, hole) && (tan < tanMin || (tan === tanMin && (p.x > m.x || (p.x === m.x && sectorContainsSector(m, p)))))) {
				m = p
				tanMin = tan
			}
		}
		p = p.next
	} while (p !== stop)
	return m
}

export function compareXYSlope(a: TEarNode, b: TEarNode): number {
	let result: number = a.x - b.x
	/**
	 * when the left-most point of 2 holes meet at a vertex, sort the holes counterclockwise so that when we find
	 * the bridge to the outer shell is always the point that they meet at
	 */
	if (result === 0) {
		result = a.y - b.y
		if (result === 0) {
			const aSlope: number = (a.next.y - a.y) / (a.next.x - a.x)
			const bSlope: number = (b.next.y - b.y) / (b.next.x - b.x)
			result = aSlope - bSlope
		}
	}
	return result
}

/**
 * find a bridge between vertices that connects hole with an outer ring and and link it
 */
export function eliminateHole(hole: TEarNode, outerNode: TEarNode): TEarNode {
	const bridge: TEarNode = findHoleBridge(hole, outerNode)
	if (!bridge) {
		return outerNode
	}
	const bridgeReverse: TEarNode = splitPolygon(bridge, hole)
	/**
	 * filter collinear points around the cuts
	 */
	filterPoints(bridgeReverse, bridgeReverse.next)
	return filterPoints(bridge, bridge.next)
}

/**
 * link every hole into the outer loop, producing a single-ring polygon without holes
 */
export function eliminateHoles(data: Array<number>, holeIndices: Array<number>, outerNode: TEarNode, dim: number): TEarNode {
	const queue: Array<any> = []
	for (let i: number = 0, len: number = holeIndices.length; i < len; i++) {
		const start: number = holeIndices[i] * dim
		const end: number = i < len - 1 ? holeIndices[i + 1] * dim : data.length
		const list: TEarNode = linkedList(data, start, end, dim, false)
		if (list === list.next) {
			list.steiner = true
		}
		queue.push(getLeftmost(list))
	}
	queue.sort(compareXYSlope)
	/**
	 * process holes from left to right
	 */
	for (let i: number = 0; i < queue.length; i++) {
		outerNode = eliminateHole(queue[i], outerNode)
	}
	return outerNode
}

/**
 * go through all polygon nodes and cure small local self-intersections
 */
export function cureLocalIntersections(start: TEarNode, triangles: Array<number>): TEarNode {
	let p: TEarNode = start
	do {
		const a: TEarNode = p.prev
		const b: TEarNode = p.next.next
		if (!equals(a, b) && intersects(a, p, p.next, b) && locallyInside(a, b) && locallyInside(b, a)) {
			triangles.push(a.i, p.i, b.i)
			/**
			 * remove two nodes involved
			 */
			removeNode(p)
			removeNode(p.next)
			p = start = b
		}
		p = p.next
	} while (p !== start)
	return filterPoints(p)
}

/**
 * try splitting polygon into two and triangulate them independently
 */
export function splitEarcut(start: TEarNode, triangles: Array<number>, dim: number, minX: number, minY: number, invSize: number): void {
	/**
	 * look for a valid diagonal that divides the polygon into two
	 */
	let a: TEarNode = start
	do {
		let b: TEarNode = a.next.next
		while (b !== a.prev) {
			if (a.i !== b.i && isValidDiagonal(a, b)) {
				/**
				 * split the polygon in two by the diagonal
				 */
				let c: TEarNode = splitPolygon(a, b)
				/**
				 * filter colinear points around the cuts
				 */
				a = filterPoints(a, a.next)
				c = filterPoints(c, c.next)
				/**
				 * run earcut on each half
				 */
				earcutLinked(a, triangles, dim, minX, minY, invSize, 0)
				earcutLinked(c, triangles, dim, minX, minY, invSize, 0)
				return
			}
			b = b.next
		}
		a = a.next
	} while (a !== start)
}

export function isEarHashed(ear: TEarNode, minX: number, minY: number, invSize: number): boolean {
	const a: TEarNode = ear.prev
	const b: TEarNode = ear
	const c: TEarNode = ear.next
	if (area(a, b, c) >= 0) {
		/**
		 * reflex, can't be an ear
		 */
		return false
	}
	const ax: number = a.x
	const bx: number = b.x
	const cx: number = c.x
	const ay: number = a.y
	const by: number = b.y
	const cy: number = c.y
	/**
	 * triangle bbox
	 */
	const x0: number = Math.min(ax, bx, cx)
	const y0: number = Math.min(ay, by, cy)
	const x1: number = Math.max(ax, bx, cx)
	const y1: number = Math.max(ay, by, cy)
	/**
	 * z-order range for the current triangle bbox;
	 */
	const minZ: number = zOrder(x0, y0, minX, minY, invSize)
	const maxZ: number = zOrder(x1, y1, minX, minY, invSize)
	let p: TEarNode = ear.prevZ
	let n: TEarNode = ear.nextZ
	/**
	 * look for points inside the triangle in both directions
	 */
	while (p && p.z >= minZ && n && n.z <= maxZ) {
		if (
			p.x >= x0 &&
			p.x <= x1 &&
			p.y >= y0 &&
			p.y <= y1 &&
			p !== a &&
			p !== c &&
			pointInTriangleExceptFirst(ax, ay, bx, by, cx, cy, p.x, p.y) &&
			area(p.prev, p, p.next) >= 0
		) {
			return false
		}
		p = p.prevZ
		if (
			n.x >= x0 &&
			n.x <= x1 &&
			n.y >= y0 &&
			n.y <= y1 &&
			n !== a &&
			n !== c &&
			pointInTriangleExceptFirst(ax, ay, bx, by, cx, cy, n.x, n.y) &&
			area(n.prev, n, n.next) >= 0
		) {
			return false
		}
		n = n.nextZ
	}
	/**
	 * look for remaining points in decreasing z-order
	 */
	while (p && p.z >= minZ) {
		if (
			p.x >= x0 &&
			p.x <= x1 &&
			p.y >= y0 &&
			p.y <= y1 &&
			p !== a &&
			p !== c &&
			pointInTriangleExceptFirst(ax, ay, bx, by, cx, cy, p.x, p.y) &&
			area(p.prev, p, p.next) >= 0
		) {
			return false
		}
		p = p.prevZ
	}
	/**
	 * look for remaining points in increasing z-order
	 */
	while (n && n.z <= maxZ) {
		if (
			n.x >= x0 &&
			n.x <= x1 &&
			n.y >= y0 &&
			n.y <= y1 &&
			n !== a &&
			n !== c &&
			pointInTriangleExceptFirst(ax, ay, bx, by, cx, cy, n.x, n.y) &&
			area(n.prev, n, n.next) >= 0
		) {
			return false
		}
		n = n.nextZ
	}
	return true
}

/**
 * check whether a polygon node forms a valid ear with adjacent nodes
 */
export function isEar(ear: TEarNode): boolean {
	const a: TEarNode = ear.prev
	const b: TEarNode = ear
	const c: TEarNode = ear.next
	if (area(a, b, c) >= 0) {
		/**
		 * reflex, can't be an ear
		 */
		return false
	}
	/**
	 * now make sure we don't have other points inside the potential ear
	 */
	const ax: number = a.x
	const bx: number = b.x
	const cx: number = c.x
	const ay: number = a.y
	const by: number = b.y
	const cy: number = c.y
	/**
	 * triangle bbox
	 */
	const x0: number = Math.min(ax, bx, cx)
	const y0: number = Math.min(ay, by, cy)
	const x1: number = Math.max(ax, bx, cx)
	const y1: number = Math.max(ay, by, cy)
	let p: TEarNode = c.next
	while (p !== a) {
		if (
			p.x >= x0 &&
			p.x <= x1 &&
			p.y >= y0 &&
			p.y <= y1 &&
			pointInTriangleExceptFirst(ax, ay, bx, by, cx, cy, p.x, p.y) &&
			area(p.prev, p, p.next) >= 0
		) {
			return false
		}
		p = p.next
	}
	return true
}

/**
 * eliminate colinear or duplicate points
 */
export function filterPoints(start: TEarNode, end: TEarNode = null!): TEarNode {
	if (!start) {
		return start
	}
	if (!end) {
		end = start
	}
	let p: TEarNode = start
	let again: boolean
	do {
		again = false
		if (!p.steiner && (equals(p, p.next) || area(p.prev, p, p.next) === 0)) {
			removeNode(p)
			p = end = p.prev
			if (p === p.next) {
				break
			}
			again = true
		} else {
			p = p.next
		}
	} while (again || p !== end)
	return end
}
