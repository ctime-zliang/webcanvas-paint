enum ERBTREE_COLOR {
	RED = 'RED',
	BLACK = 'BLACK',
}

function defaultCompare(a: number, b: number): number {
	if (a < b) {
		return -1
	}
	if (a > b) {
		return 1
	}
	return 0
}

function cloneNode(node: RBTreeNode): RBTreeNode {
	return new RBTreeNode(node.color, node.key, node.value, node.left, node.right, node.count)
}

function repaint(color: ERBTREE_COLOR, node: RBTreeNode): RBTreeNode {
	return new RBTreeNode(color, node.key, node.value, node.left, node.right, node.count)
}

function recount(node: RBTreeNode) {
	node.count = 1 + (node.left ? node.left.count : 0) + (node.right ? node.right.count : 0)
}

function doVisit(
	lo: RBTreeNode,
	hi: RBTreeNode,
	compare: (k1: RBTreeNode, k2: RBTreeNode) => number,
	visit: (k: RBTreeNode, v: RBTreeNode) => RBTreeNode | void,
	node: RBTreeNode
) {
	let l: number = compare(lo, node.key)
	let h: number = compare(hi, node.key)
	let v: RBTreeNode = undefined!
	if (l <= 0) {
		if (node.left) {
			v = doVisit(lo, hi, compare, visit, node.left)!
			if (v) {
				return v
			}
		}
		if (h > 0) {
			v = visit(node.key, node.value)!
			if (v) {
				return v
			}
		}
	}
	if (h > 0 && node.right) {
		return doVisit(lo, hi, compare, visit, node.right)
	}
}

function doVisitHalf(
	lo: RBTreeNode,
	compare: (k1: any, k2: any) => number,
	visit: (k: RBTreeNode, v: RBTreeNode) => RBTreeNode | void,
	node: RBTreeNode
): RBTreeNode | void {
	const l: number = compare(lo, node.key)
	if (l <= 0) {
		if (node.left) {
			const v: RBTreeNode = doVisitHalf(lo, compare, visit, node.left)!
			if (v) {
				return v
			}
		}
		const v: RBTreeNode = visit(node.key, node.value)!
		if (v) {
			return v
		}
	}
	if (node.right) {
		return doVisitHalf(lo, compare, visit, node.right)
	}
}

function doVisitFull(visit: (k: RBTreeNode, v: RBTreeNode) => RBTreeNode | void, node: RBTreeNode): any {
	if (node.left) {
		const v: RBTreeNode = doVisitFull(visit, node.left)!
		if (v) {
			return v
		}
	}
	const v: RBTreeNode = visit(node.key, node.value)!
	if (v) {
		return v
	}
	if (node.right) {
		return doVisitFull(visit, node.right)!
	}
}

function swapNode(n: RBTreeNode, v: RBTreeNode): void {
	n.key = v.key
	n.value = v.value
	n.left = v.left
	n.right = v.right
	n.color = v.color
	n.count = v.count
}

function fixDoubleBlack(stack: Array<RBTreeNode>) {
	let n: RBTreeNode = null!
	let p: RBTreeNode = null!
	let s: RBTreeNode = null!
	let z: RBTreeNode = null!
	for (let i: number = stack.length - 1; i >= 0; --i) {
		n = stack[i]
		if (i === 0) {
			n.color = ERBTREE_COLOR.BLACK
			return
		}
		p = stack[i - 1]
		if (p.left === n) {
			s = p.right
			if (s.right && s.right.color === ERBTREE_COLOR.RED) {
				s = p.right = cloneNode(s)
				z = s.right = cloneNode(s.right)
				p.right = s.left
				s.left = p
				s.right = z
				s.color = p.color
				n.color = ERBTREE_COLOR.BLACK
				p.color = ERBTREE_COLOR.BLACK
				z.color = ERBTREE_COLOR.BLACK
				recount(p)
				recount(s)
				if (i > 1) {
					let pp: RBTreeNode = stack[i - 2]
					if (pp.left === p) {
						pp.left = s
					} else {
						pp.right = s
					}
				}
				stack[i - 1] = s
				return
			} else if (s.left && s.left.color === ERBTREE_COLOR.RED) {
				s = p.right = cloneNode(s)
				z = s.left = cloneNode(s.left)
				p.right = z.left
				s.left = z.right
				z.left = p
				z.right = s
				z.color = p.color
				p.color = ERBTREE_COLOR.BLACK
				s.color = ERBTREE_COLOR.BLACK
				n.color = ERBTREE_COLOR.BLACK
				recount(p)
				recount(s)
				recount(z)
				if (i > 1) {
					let pp: RBTreeNode = stack[i - 2]
					if (pp.left === p) {
						pp.left = z
					} else {
						pp.right = z
					}
				}
				stack[i - 1] = z
				return
			}
			if (s.color === ERBTREE_COLOR.BLACK) {
				if (p.color === ERBTREE_COLOR.RED) {
					p.color = ERBTREE_COLOR.BLACK
					p.right = repaint(ERBTREE_COLOR.RED, s)
					return
				} else {
					p.right = repaint(ERBTREE_COLOR.RED, s)
					continue
				}
			} else {
				s = cloneNode(s)
				p.right = s.left
				s.left = p
				s.color = p.color
				p.color = ERBTREE_COLOR.RED
				recount(p)
				recount(s)
				if (i > 1) {
					let pp: RBTreeNode = stack[i - 2]
					if (pp.left === p) {
						pp.left = s
					} else {
						pp.right = s
					}
				}
				stack[i - 1] = s
				stack[i] = p
				if (i + 1 < stack.length) {
					stack[i + 1] = n
				} else {
					stack.push(n)
				}
				i = i + 2
			}
		} else {
			s = p.left
			if (s.left && s.left.color === ERBTREE_COLOR.RED) {
				s = p.left = cloneNode(s)
				z = s.left = cloneNode(s.left)
				p.left = s.right
				s.right = p
				s.left = z
				s.color = p.color
				n.color = ERBTREE_COLOR.BLACK
				p.color = ERBTREE_COLOR.BLACK
				z.color = ERBTREE_COLOR.BLACK
				recount(p)
				recount(s)
				if (i > 1) {
					let pp: RBTreeNode = stack[i - 2]
					if (pp.right === p) {
						pp.right = s
					} else {
						pp.left = s
					}
				}
				stack[i - 1] = s
				return
			} else if (s.right && s.right.color === ERBTREE_COLOR.RED) {
				s = p.left = cloneNode(s)
				z = s.right = cloneNode(s.right)
				p.left = z.right
				s.right = z.left
				z.right = p
				z.left = s
				z.color = p.color
				p.color = ERBTREE_COLOR.BLACK
				s.color = ERBTREE_COLOR.BLACK
				n.color = ERBTREE_COLOR.BLACK
				recount(p)
				recount(s)
				recount(z)
				if (i > 1) {
					let pp: RBTreeNode = stack[i - 2]
					if (pp.right === p) {
						pp.right = z
					} else {
						pp.left = z
					}
				}
				stack[i - 1] = z
				return
			}
			if (s.color === ERBTREE_COLOR.BLACK) {
				if (p.color === ERBTREE_COLOR.RED) {
					p.color = ERBTREE_COLOR.BLACK
					p.left = repaint(ERBTREE_COLOR.RED, s)
					return
				} else {
					p.left = repaint(ERBTREE_COLOR.RED, s)
					continue
				}
			} else {
				s = cloneNode(s)
				p.left = s.right
				s.right = p
				s.color = p.color
				p.color = ERBTREE_COLOR.RED
				recount(p)
				recount(s)
				if (i > 1) {
					let pp: RBTreeNode = stack[i - 2]
					if (pp.right === p) {
						pp.right = s
					} else {
						pp.left = s
					}
				}
				stack[i - 1] = s
				stack[i] = p
				if (i + 1 < stack.length) {
					stack[i + 1] = n
				} else {
					stack.push(n)
				}
				i = i + 2
			}
		}
	}
}

export class RBTreeNode {
	private _color: ERBTREE_COLOR
	private _key: any
	private _value: any
	private _left: RBTreeNode
	private _right: RBTreeNode
	private _count: number
	constructor(color: ERBTREE_COLOR, key: any, value: RBTreeNode, left: RBTreeNode, right: any, count: number) {
		this._color = color
		this._key = key
		this._value = value
		this._left = left
		this._right = right
		this._count = count
	}

	public get color(): ERBTREE_COLOR {
		return this._color
	}
	public set color(value: ERBTREE_COLOR) {
		this._color = value
	}

	public get key(): any {
		return this._key
	}
	public set key(value: any) {
		this._key = value
	}

	public get value(): any {
		return this._value
	}
	public set value(value: any) {
		this._value = value
	}

	public get left(): RBTreeNode {
		return this._left
	}
	public set left(value: RBTreeNode) {
		this._left = value
	}

	public get right(): RBTreeNode {
		return this._right
	}
	public set right(value: RBTreeNode) {
		this._right = value
	}

	public get count(): number {
		return this._count
	}
	public set count(value: number) {
		this._count = value
	}
}

export class RBTree {
	private _compare: (k1: RBTreeNode, k2: RBTreeNode) => number
	private _root: RBTreeNode
	constructor(compare: (k1: RBTreeNode, k2: RBTreeNode) => number, root: RBTreeNode) {
		this._compare = compare
		this._root = root
	}

	public get compare(): (k1: RBTreeNode, k2: RBTreeNode) => number {
		return this._compare
	}
	public set compare(value: (k1: RBTreeNode, k2: RBTreeNode) => number) {
		this._compare = value
	}

	public get root(): RBTreeNode {
		return this._root
	}
	public set root(value: RBTreeNode) {
		this._root = value
	}

	public get keys(): Array<RBTreeNode> {
		const result: Array<RBTreeNode> = []
		this.forEach((k: RBTreeNode, v: RBTreeNode): RBTreeNode | void => {
			result.push(k)
		})
		return result
	}

	public get values(): Array<RBTreeNode> {
		const result: Array<RBTreeNode> = []
		this.forEach((k: RBTreeNode, v: RBTreeNode): RBTreeNode | void => {
			result.push(v)
		})
		return result
	}

	public get length(): number {
		if (this.root) {
			return this.root.count
		}
		return 0
	}

	public get begin(): RedBlackTreeIterator {
		let stack: Array<RBTreeNode> = []
		let n: RBTreeNode = this.root
		while (n) {
			stack.push(n)
			n = n.left
		}
		return new RedBlackTreeIterator(this, stack)
	}

	public get end(): RedBlackTreeIterator {
		let stack: Array<RBTreeNode> = []
		let n: RBTreeNode = this.root
		while (n) {
			stack.push(n)
			n = n.right
		}
		return new RedBlackTreeIterator(this, stack)
	}

	public forEach(visit: (k: RBTreeNode, v: RBTreeNode) => RBTreeNode | void, lo?: RBTreeNode, hi?: RBTreeNode): any {
		if (!this.root) {
			return
		}
		switch (arguments.length) {
			case 1:
				return doVisitFull(visit, this.root)
			case 2:
				return doVisitHalf(lo!, this.compare, visit, this.root)
			case 3:
				if (this.compare(lo!, hi!) >= 0) {
					return
				}
				return doVisit(lo!, hi!, this.compare, visit, this.root)
		}
	}

	public insert(key: RBTreeNode, value: RBTreeNode): RBTree {
		let n: RBTreeNode = this.root
		let n_stack: Array<RBTreeNode> = []
		let d_stack: Array<number> = []
		while (n) {
			let d: number = this.compare(key, n.key)
			n_stack.push(n)
			d_stack.push(d)
			if (d <= 0) {
				n = n.left
			} else {
				n = n.right
			}
		}
		n_stack.push(new RBTreeNode(ERBTREE_COLOR.RED, key, value, null!, null!, 1))
		for (let s: number = n_stack.length - 2; s >= 0; --s) {
			let n: RBTreeNode = n_stack[s]
			if (d_stack[s] <= 0) {
				n_stack[s] = new RBTreeNode(n.color, n.key, n.value, n_stack[s + 1], n.right, n.count + 1)
			} else {
				n_stack[s] = new RBTreeNode(n.color, n.key, n.value, n.left, n_stack[s + 1], n.count + 1)
			}
		}
		for (let s: number = n_stack.length - 1; s > 1; --s) {
			let p: RBTreeNode = n_stack[s - 1]
			let n: RBTreeNode = n_stack[s]
			if (p.color === ERBTREE_COLOR.BLACK || n.color === ERBTREE_COLOR.BLACK) {
				break
			}
			let pp: RBTreeNode = n_stack[s - 2]
			if (pp.left === p) {
				if (p.left === n) {
					let y: RBTreeNode = pp.right
					if (y && y.color === ERBTREE_COLOR.RED) {
						p.color = ERBTREE_COLOR.BLACK
						pp.right = repaint(ERBTREE_COLOR.BLACK, y)
						pp.color = ERBTREE_COLOR.RED
						s -= 1
					} else {
						pp.color = ERBTREE_COLOR.RED
						pp.left = p.right
						p.color = ERBTREE_COLOR.BLACK
						p.right = pp
						n_stack[s - 2] = p
						n_stack[s - 1] = n
						recount(pp)
						recount(p)
						if (s >= 3) {
							let ppp: RBTreeNode = n_stack[s - 3]
							if (ppp.left === pp) {
								ppp.left = p
							} else {
								ppp.right = p
							}
						}
						break
					}
				} else {
					let y: RBTreeNode = pp.right
					if (y && y.color === ERBTREE_COLOR.RED) {
						p.color = ERBTREE_COLOR.BLACK
						pp.right = repaint(ERBTREE_COLOR.BLACK, y)
						pp.color = ERBTREE_COLOR.RED
						s -= 1
					} else {
						p.right = n.left
						pp.color = ERBTREE_COLOR.RED
						pp.left = n.right
						n.color = ERBTREE_COLOR.BLACK
						n.left = p
						n.right = pp
						n_stack[s - 2] = n
						n_stack[s - 1] = p
						recount(pp)
						recount(p)
						recount(n)
						if (s >= 3) {
							let ppp: RBTreeNode = n_stack[s - 3]
							if (ppp.left === pp) {
								ppp.left = n
							} else {
								ppp.right = n
							}
						}
						break
					}
				}
			} else {
				if (p.right === n) {
					let y: RBTreeNode = pp.left
					if (y && y.color === ERBTREE_COLOR.RED) {
						p.color = ERBTREE_COLOR.BLACK
						pp.left = repaint(ERBTREE_COLOR.BLACK, y)
						pp.color = ERBTREE_COLOR.RED
						s -= 1
					} else {
						pp.color = ERBTREE_COLOR.RED
						pp.right = p.left
						p.color = ERBTREE_COLOR.BLACK
						p.left = pp
						n_stack[s - 2] = p
						n_stack[s - 1] = n
						recount(pp)
						recount(p)
						if (s >= 3) {
							let ppp: RBTreeNode = n_stack[s - 3]
							if (ppp.right === pp) {
								ppp.right = p
							} else {
								ppp.left = p
							}
						}
						break
					}
				} else {
					let y: RBTreeNode = pp.left
					if (y && y.color === ERBTREE_COLOR.RED) {
						p.color = ERBTREE_COLOR.BLACK
						pp.left = repaint(ERBTREE_COLOR.BLACK, y)
						pp.color = ERBTREE_COLOR.RED
						s -= 1
					} else {
						p.left = n.right
						pp.color = ERBTREE_COLOR.RED
						pp.right = n.left
						n.color = ERBTREE_COLOR.BLACK
						n.right = p
						n.left = pp
						n_stack[s - 2] = n
						n_stack[s - 1] = p
						recount(pp)
						recount(p)
						recount(n)
						if (s >= 3) {
							let ppp: RBTreeNode = n_stack[s - 3]
							if (ppp.right === pp) {
								ppp.right = n
							} else {
								ppp.left = n
							}
						}
						break
					}
				}
			}
		}
		n_stack[0].color = ERBTREE_COLOR.BLACK
		return new RBTree(this.compare, n_stack[0])
	}

	public at(idx: number): RedBlackTreeIterator {
		if (idx < 0) {
			return new RedBlackTreeIterator(this, [])
		}
		let n: RBTreeNode = this.root
		let stack: Array<RBTreeNode> = []
		while (true) {
			stack.push(n)
			if (n.left) {
				if (idx < n.left.count) {
					n = n.left
					continue
				}
				idx -= n.left.count
			}
			if (!idx) {
				return new RedBlackTreeIterator(this, stack)
			}
			idx -= 1
			if (n.right) {
				if (idx >= n.right.count) {
					break
				}
				n = n.right
			} else {
				break
			}
		}
		return new RedBlackTreeIterator(this, [])
	}

	public ge(key: RBTreeNode): RedBlackTreeIterator {
		let n: RBTreeNode = this.root
		let stack: Array<RBTreeNode> = []
		let last_ptr: number = 0
		while (n) {
			let d: number = this.compare(key, n.key)
			stack.push(n)
			if (d <= 0) {
				last_ptr = stack.length
			}
			if (d <= 0) {
				n = n.left
			} else {
				n = n.right
			}
		}
		stack.length = last_ptr
		return new RedBlackTreeIterator(this, stack)
	}

	public gt(key: RBTreeNode): RedBlackTreeIterator {
		let n: RBTreeNode = this.root
		let stack: Array<RBTreeNode> = []
		let last_ptr: number = 0
		while (n) {
			let d: number = this.compare(key, n.key)
			stack.push(n)
			if (d < 0) {
				last_ptr = stack.length
			}
			if (d < 0) {
				n = n.left
			} else {
				n = n.right
			}
		}
		stack.length = last_ptr
		return new RedBlackTreeIterator(this, stack)
	}

	public lt(key: RBTreeNode): RedBlackTreeIterator {
		let n: RBTreeNode = this.root
		let stack: Array<RBTreeNode> = []
		let last_ptr: number = 0
		while (n) {
			let d: number = this.compare(key, n.key)
			stack.push(n)
			if (d > 0) {
				last_ptr = stack.length
			}
			if (d <= 0) {
				n = n.left
			} else {
				n = n.right
			}
		}
		stack.length = last_ptr
		return new RedBlackTreeIterator(this, stack)
	}

	public le(key: RBTreeNode): RedBlackTreeIterator {
		let n: RBTreeNode = this.root
		let stack: Array<RBTreeNode> = []
		let last_ptr: number = 0
		while (n) {
			let d: number = this.compare(key, n.key)
			stack.push(n)
			if (d >= 0) {
				last_ptr = stack.length
			}
			if (d < 0) {
				n = n.left
			} else {
				n = n.right
			}
		}
		stack.length = last_ptr
		return new RedBlackTreeIterator(this, stack)
	}

	public find(key: RBTreeNode): RedBlackTreeIterator {
		let n: RBTreeNode = this.root
		let stack: Array<RBTreeNode> = []
		while (n) {
			let d: number = this.compare(key, n.key)
			stack.push(n)
			if (d === 0) {
				return new RedBlackTreeIterator(this, stack)
			}
			if (d <= 0) {
				n = n.left
			} else {
				n = n.right
			}
		}
		return new RedBlackTreeIterator(this, [])
	}

	public remove(key: RBTreeNode): RBTree {
		const iter: RedBlackTreeIterator = this.find(key)
		if (iter) {
			return iter.remove()
		}
		return this
	}

	public get(key: RBTreeNode): any {
		let n: RBTreeNode = this.root
		while (n) {
			let d: number = this.compare(key, n.key)
			if (d === 0) {
				return n.value
			}
			if (d <= 0) {
				n = n.left
			} else {
				n = n.right
			}
		}
		return
	}
}

class RedBlackTreeIterator {
	private _tree: RBTree
	private _stack: Array<RBTreeNode>
	constructor(tree: RBTree, stack: Array<RBTreeNode>) {
		this._tree = tree
		this._stack = stack
	}

	public get tree(): RBTree {
		return this._tree
	}
	public set tree(value: RBTree) {
		this._tree = value
	}

	public get stack(): Array<RBTreeNode> {
		return this._stack
	}
	public set stack(value: Array<RBTreeNode>) {
		this._stack = value
	}

	public get valid(): boolean {
		return this._stack.length > 0
	}

	public get hasPrev(): boolean {
		let stack: Array<RBTreeNode> = this.stack
		if (stack.length === 0) {
			return false
		}
		if (stack[stack.length - 1].left) {
			return true
		}
		for (let s: number = stack.length - 1; s > 0; --s) {
			if (stack[s - 1].right === stack[s]) {
				return true
			}
		}
		return false
	}

	public get hasNext(): boolean {
		let stack: Array<RBTreeNode> = this._stack
		if (stack.length === 0) {
			return false
		}
		if (stack[stack.length - 1].right) {
			return true
		}
		for (let s: number = stack.length - 1; s > 0; --s) {
			if (stack[s - 1].left === stack[s]) {
				return true
			}
		}
		return false
	}

	public clone(): RedBlackTreeIterator {
		return new RedBlackTreeIterator(this.tree, this._stack.slice())
	}

	public remove(): RBTree {
		let stack: Array<RBTreeNode> = this.stack
		if (stack.length === 0) {
			return this.tree
		}
		let cstack: Array<RBTreeNode> = new Array(stack.length)
		let n: RBTreeNode = stack[stack.length - 1]
		cstack[cstack.length - 1] = new RBTreeNode(n.color, n.key, n.value, n.left, n.right, n.count)
		for (let i: number = stack.length - 2; i >= 0; --i) {
			let n = stack[i]
			if (n.left === stack[i + 1]) {
				cstack[i] = new RBTreeNode(n.color, n.key, n.value, cstack[i + 1], n.right, n.count)
			} else {
				cstack[i] = new RBTreeNode(n.color, n.key, n.value, n.left, cstack[i + 1], n.count)
			}
		}
		n = cstack[cstack.length - 1]
		if (n.left && n.right) {
			let split: number = cstack.length
			n = n.left
			while (n.right) {
				cstack.push(n)
				n = n.right
			}
			let v: RBTreeNode = cstack[split - 1]
			cstack.push(new RBTreeNode(n.color, v.key, v.value, n.left, n.right, n.count))
			cstack[split - 1].key = n.key
			cstack[split - 1].value = n.value
			for (let i: number = cstack.length - 2; i >= split; --i) {
				n = cstack[i]
				cstack[i] = new RBTreeNode(n.color, n.key, n.value, n.left, cstack[i + 1], n.count)
			}
			cstack[split - 1].left = cstack[split]
		}
		n = cstack[cstack.length - 1]
		if (n.color === ERBTREE_COLOR.RED) {
			let p: RBTreeNode = cstack[cstack.length - 2]
			if (p.left === n) {
				p.left = null!
			} else if (p.right === n) {
				p.right = null!
			}
			cstack.pop()
			for (let i: number = 0; i < cstack.length; i++) {
				cstack[i].count--
			}
			return new RBTree(this.tree.compare, cstack[0])
		} else {
			if (n.left || n.right) {
				if (n.left) {
					swapNode(n, n.left)
				} else if (n.right) {
					swapNode(n, n.right)
				}
				n.color = ERBTREE_COLOR.BLACK
				for (let i: number = 0; i < cstack.length - 1; i++) {
					cstack[i].count--
				}
				return new RBTree(this.tree.compare, cstack[0])
			} else if (cstack.length === 1) {
				return new RBTree(this.tree.compare, null!)
			} else {
				for (let i: number = 0; i < cstack.length; i++) {
					cstack[i].count--
				}
				let parent = cstack[cstack.length - 2]
				fixDoubleBlack(cstack)
				if (parent.left === n) {
					parent.left = null!
				} else {
					parent.right = null!
				}
			}
		}
		return new RBTree(this.tree.compare, cstack[0])
	}

	public next(): void {
		let stack: Array<RBTreeNode> = this._stack
		if (stack.length === 0) {
			return
		}
		let n: RBTreeNode = stack[stack.length - 1]
		if (n.right) {
			n = n.right
			while (n) {
				stack.push(n)
				n = n.left
			}
		} else {
			stack.pop()
			while (stack.length > 0 && stack[stack.length - 1].right === n) {
				n = stack[stack.length - 1]
				stack.pop()
			}
		}
	}

	public prev(): void {
		let stack: Array<RBTreeNode> = this._stack
		if (stack.length === 0) {
			return
		}
		let n: RBTreeNode = stack[stack.length - 1]
		if (n.left) {
			n = n.left
			while (n) {
				stack.push(n)
				n = n.right
			}
		} else {
			stack.pop()
			while (stack.length > 0 && stack[stack.length - 1].left === n) {
				n = stack[stack.length - 1]
				stack.pop()
			}
		}
	}

	public update(value: any): RBTree {
		let stack: Array<RBTreeNode> = this._stack
		if (stack.length === 0) {
			throw new Error("Can't update empty node!")
		}
		let cstack: Array<RBTreeNode> = new Array(stack.length)
		let n: RBTreeNode = stack[stack.length - 1]
		cstack[cstack.length - 1] = new RBTreeNode(n.color, n.key, value, n.left, n.right, n.count)
		for (let i: number = stack.length - 2; i >= 0; --i) {
			n = stack[i]
			if (n.left === stack[i + 1]) {
				cstack[i] = new RBTreeNode(n.color, n.key, n.value, cstack[i + 1], n.right, n.count)
			} else {
				cstack[i] = new RBTreeNode(n.color, n.key, n.value, n.left, cstack[i + 1], n.count)
			}
		}
		return new RBTree(this.tree.compare, cstack[0])
	}
}

Object.defineProperty(RedBlackTreeIterator.prototype, 'node', {
	get: function (): RBTreeNode {
		if (this.stack.length > 0) {
			return this.stack[this.stack.length - 1]
		}
		return null!
	},
	enumerable: true,
})

Object.defineProperty(RedBlackTreeIterator.prototype, 'key', {
	get: function (): string {
		if (this._stack.length > 0) {
			return this._stack[this._stack.length - 1].key
		}
		return undefined!
	},
	enumerable: true,
})

Object.defineProperty(RedBlackTreeIterator.prototype, 'value', {
	get: function (): any {
		if (this._stack.length > 0) {
			return this._stack[this._stack.length - 1].value
		}
		return undefined
	},
	enumerable: true,
})

Object.defineProperty(RedBlackTreeIterator.prototype, 'index', {
	get: function (): number {
		let idx: number = 0
		let stack: Array<RBTreeNode> = this._stack
		if (stack.length === 0) {
			let r: RBTreeNode = this.tree.root
			if (r) {
				return r.count
			}
			return 0
		} else if (stack[stack.length - 1].left) {
			idx = stack[stack.length - 1].left.count
		}
		for (let s: number = stack.length - 2; s >= 0; --s) {
			if (stack[s + 1] === stack[s].right) {
				++idx
				if (stack[s].left) {
					idx += stack[s].left.count
				}
			}
		}
		return idx
	},
	enumerable: true,
})

export function createRBTree(compare: (k1: RBTreeNode, k2: RBTreeNode) => number): RBTree {
	return new RBTree(compare || defaultCompare, null!)
}
