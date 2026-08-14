/**
 * 红黑树 (Red-Black Tree)
 *
 * 红黑树概述:
 * 		红黑树是一种自平衡二叉搜索树 (BST), 通过在每个节点上增加一个颜色属性(红/黑), 并利用一组着色规则来保持树的近似平衡
 *
 * 五大性质 / Invariants
 * 		- 每个节点要么是红色, 要么是黑色
 * 		- 根节点必须是黑色
 * 		- 所有叶子节点 (NIL/null) 都是黑色
 * 		- 红色节点的两个子节点必须是黑色(即不能有连续的红色节点)
 * 		- 从任何节点到其所有后代叶子节点的路径上, 黑色节点数量相同(黑高相等)
 *
 * 时间复杂度:
 * 		- 查找: O(lo(n))
 * 		- 插入: O(log(n))
 * 		- 删除: O(log(n))
 * 		- 遍历: O(n)
 *
 * 本实现特点:
 * 		- 持久化/函数式 (Persistent/Functional): insert 和 remove 返回新树, 不修改原树
 * 		- 使用路径拷贝 (Path Copying) 实现持久化
 * 		- 提供迭代器 (Iterator) 支持双向遍历
 * 		- 支持范围查询 (Range Query)
 *
 * 案例说明 - 插入过程:
 * 		假设依次插入: 10, 20, 30, 15, 25
 * 			插入10: (根节点直接设为黑色)
 *      		10(B)
 * 			插入20: (红色节点挂在右边, 不违反性质)
 *      			10(B)
 *        				\
 *        				20(R)
 * 			插入30: (连续红色, 需要左旋 + 重着色)
 *     					 20(B)
 *     					/    \
 *   				10(R)  30(R)
 * 			插入15: (红色挂在 10 右边, 父叔都红, 重着色即可)
 *     					 20(B)
 *     					/    \
 *   				10(B)  30(B)
 *     							\
 *     							15(R)
 * 			插入25: (红色挂在 30 左边, 叔节点黑, 需要旋转)
 *        				20(B)
 *       				/    \
 *    				10(B)   25(B)
 *      				\     /  \
 *     					15(R) 30(R)  // (RL 旋转后)
 *            			↑ 实际最终结构取决于具体旋转策略
 */

/**
 * 节点颜色枚举
 * 		- RED: 红色 - 新插入的节点默认为红色(因为插入红色节点不会违反性质 5)
 * 		- BLACK: 黑色 - 根节点和用于平衡调整的节点
 */
enum ERBTREE_COLOR {
	RED = 'RED',
	BLACK = 'BLACK',
}

/**
 * 默认比较函数 - 用于数值类型的键
 *
 * 		输出:
 * 			-1 (a < b)
 * 			1 (a > b)
 * 			0 (a === b)
 *
 * 案例:
 * 		- defaultCompare(3, 5) → -1  // 3 在 5 左边
 *		- defaultCompare(7, 2) →  1  // 7 在 2 右边
 * 		- defaultCompare(4, 4) →  0  // 相等
 */
function defaultCompare(a: number, b: number): number {
	if (a < b) {
		return -1
	}
	if (a > b) {
		return 1
	}
	return 0
}

/**
 * 克隆节点 - 创建一个节点的浅拷贝
 * 用于持久化数据结构中的路径拷贝 (Path Copying) 策略
 *
 * 需要克隆:
 * 		持久化红黑树要求每次修改都返回新树, 保留旧树不变
 * 		只需要拷贝从根到修改点路径上的节点 (O(log(n)) 个), 其余节点在新旧树之间共享
 *
 * 案例 - 路径拷贝:
 *     旧树:        新树(插入 X 后):
 *       A             A'  ← 克隆
 *      / \           / \
 *     B   C         B'  C  ← B 被克隆, C 共享
 *    / \           / \
 *   D   E         D   X  ← D 共享, X 是新节点
 */
function cloneNode(node: RBTreeNode): RBTreeNode {
	return new RBTreeNode(node.color, node.key, node.value, node.left, node.right, node.count)
}

/**
 * 重新着色 - 创建一个颜色不同的新节点(其余属性相同)
 * 这是旋转操作中常用的辅助函数, 避免直接修改原节点(保持持久化)
 *
 * 		输入:
 * 			color: 新的颜色
 * 			node: 原节点
 * 		输出:
 * 			仅颜色改变的新节点
 */
function repaint(color: ERBTREE_COLOR, node: RBTreeNode): RBTreeNode {
	return new RBTreeNode(color, node.key, node.value, node.left, node.right, node.count)
}

/**
 * 重新计算节点的子树大小 (count)
 * count = 1(自身) + 左子树大小 + 右子树大小
 *
 * 用途:
 * 在旋转操作后, 被旋转节点的子树结构发生变化, 需要重新统计 count 字段使得 O(log(n)) 的按索引查找 (at) 成为可能
 *
 * 案例:
 *       P (count = 5)
 *      / \
 *     L   R
 *   (2)  (2)
 *   → P.count = 1 + 2 + 2 = 5
 */
function recount(node: RBTreeNode) {
	node.count = 1 + (node.left ? node.left.count : 0) + (node.right ? node.right.count : 0)
}

/**
 * 范围遍历 - 遍历 [lo, hi) 范围内的所有节点
 * 利用 BST 的有序性进行剪枝, 避免访问不在范围内的子树
 *
 * 		输入:
 * 			lo: 范围下界
 * 			hi: 范围上界(不包含)
 * 			compare: 比较函数
 * 			visit: 访问回调, 返回非 undefined 值时提前终止遍历
 * 			node: 当前节点
 *
 * 算法流程:
 * 		对于当前节点 node:
 * 			- 计算 lo 和 hi 与 node.key 的比较结果
 * 			- 如果 lo <= node.key, 则左子树可能有符合条件的节点, 递归左子树
 * 			- 如果 lo <= node.key < hi, 则当前节点在范围内, 访问它
 * 			- 如果 node.key < hi, 则右子树可能有符合条件的节点, 递归右子树
 */
function doVisit(lo: RBTreeNode, hi: RBTreeNode, compare: (k1: RBTreeNode, k2: RBTreeNode) => number, visit: (k: RBTreeNode, v: RBTreeNode) => RBTreeNode | void, node: RBTreeNode): RBTreeNode | undefined {
	let l: number = compare(lo, node.key)
	let h: number = compare(hi, node.key)
	let v: RBTreeNode = undefined!
	if (l <= 0) {
		/**
		 * lo <= node.key, 左子树中可能存在 >= lo 的节点
		 */
		if (node.left) {
			v = doVisit(lo, hi, compare, visit, node.left)!
			if (v) {
				return v
			}
		}
		/**
		 * 当前节点在范围内 (lo <= key < hi)
		 */
		if (h > 0) {
			v = visit(node.key, node.value)!
			if (v) {
				return v
			}
		}
	}
	/**
	 * node.key < hi, 右子树中可能存在 < hi 的节点
	 */
	if (h > 0 && node.right) {
		return doVisit(lo, hi, compare, visit, node.right)
	}
}

/**
 * 半范围遍历 - 遍历 [lo, +∞) 范围内的所有节点
 * 即遍历所有 key >= lo 的节点(中序)
 *
 * 		输入:
 * 			lo: 范围下界
 * 			compare: 比较函数
 * 			visit: 访问回调
 * 			node: 当前节点
 *
 * 算法:
 * 		- 如果 lo <= node.key: 递归左子树, 访问当前节点
 * 		- 无论如何都递归右子树(右子树所有节点都 > node.key)
 */
function doVisitHalf(lo: RBTreeNode, compare: (k1: any, k2: any) => number, visit: (k: RBTreeNode, v: RBTreeNode) => RBTreeNode | void, node: RBTreeNode): RBTreeNode | void {
	const l: number = compare(lo, node.key)
	if (l <= 0) {
		/**
		 * lo <= node.key, 左子树可能有 >= lo 的节点
		 */
		if (node.left) {
			const v: RBTreeNode = doVisitHalf(lo, compare, visit, node.left)!
			if (v) {
				return v
			}
		}
		/**
		 * 当前节点 >= lo, 访问它
		 */
		const v: RBTreeNode = visit(node.key, node.value)!
		if (v) {
			return v
		}
	}
	/**
	 * 右子树的所有节点都 > node.key, 可能 >= lo
	 */
	if (node.right) {
		return doVisitHalf(lo, compare, visit, node.right)
	}
}

/**
 * 完整中序遍历 - 按升序遍历树中所有节点
 * 标准的中序遍历: 左子树 → 当前节点 → 右子树
 *
 * 		输入:
 * 			visit: 访问回调, 返回非 undefined 时提前终止
 * 			node: 当前节点
 *
 * 案例:
 *       	  20
 *      	 /  \
 *   	   10    30
 *   		 /  \
 *  		5   15
 */
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

/**
 * 交换两个节点的数据(不交换结构指针以外的 color)
 * 用于删除操作中, 将要删除的节点与其中序前驱/后继交换
 *
 * 需要 swap 而不是简单删除:
 * 		- 当要删除的节点有两个子节点时, 直接删除会破坏树结构
 * 		- 策略是找到中序前驱(左子树最大节点), 将其值复制过来, 然后转而删除那个最多只有一个子节点的前驱节点
 */
function swapNode(n: RBTreeNode, v: RBTreeNode): void {
	n.key = v.key
	n.value = v.value
	n.left = v.left
	n.right = v.right
	n.color = v.color
	n.count = v.count
}

/**
 * fixDoubleBlack - 修复删除后的"双重黑色"问题
 *
 * 是双重黑色:
 * 		当删除一个黑色节点后, 该位置的"黑高"减少了 1, 为了维持性质 5(所有路径黑高相等), 将该位置标记为"双重黑色" (Double Black), 即它贡献了 2 个黑色计数
 * 		但双重黑色不是合法状态, 需要通过旋转和重着色来消除
 *
 * 修复策略 - 根据兄弟节点 (sibling) 的颜色和其子节点分情况处理
 *
 * 		输入:
 * 			stack: 从根到当前节点的路径栈
 *
 * 设 n = 双重黑色节点, p = 父节点, s = 兄弟节点
 * 		Case 1:
 * 			兄弟 s 是黑色, 且 s 有红色子节点(远侄子红色)
 * 			n 是左孩子, s.right 为红色 - 左旋
 *        		p(?)               s (p 的原色)
 *       		/ \                /    \
 *     		n(BB) s(B)    →    	p(B)   z(B)
 *          	/ \          		/ \
 *        	  ?   z(R)    		  n(B)  ?
 *
 * 			旋转后:
 * 				- s 取代 p 的位置, 继承 p 的颜色
 * 				- p 变黑, z 变黑, n 脱离双重黑色变为普通黑色
 * 				- 所有路径的黑高恢复一致 ✓
 *
 * 		Case 2:
 * 			兄弟 s 是黑色, 且 s 有红色子节点(近侄子红色, 远侄子非红)
 * 			n 是左孩子, s.left 为红色, s.right 非红 - 先右旋 s 再左旋 p
 *        		p(?)               z (p 的原色)
 *       		/ \                /    \
 *     		 n(BB) s(B)    →    p(B)   s(B)
 *            /            		/ \      \
 *         	z(R)              n(B) zL    zR...
 *        	/ \
 *         zL  zR
 * 			RL 双旋转(先对 s 右旋, 再对 p 左旋)
 *
 * 		Case 3:
 * 			兄弟 s 是黑色, s 的两个子节点都是黑色
 * 				子情况 3a: 父节点 p 为红色
 *        				p(R)              p(B)
 *       				/ \        →      / \
 *     				n(BB) s(B)        n(B) s(R)
 * 					将 p 变黑(补偿 n 路径丢失的黑色), s 变红(补偿 s 路径多出的黑色)
 * 					修复完成 ✓
 * 				子情况 3b: 父节点 p 为黑色
 *        				p(B)              p(BB) ← 双重黑色上移
 *       				/ \        →      / \
 *    				 n(BB) s(B)        n(B) s(R)
 * 				s 变红后, p 成为新的双重黑色节点, 继续向上修复 (continue 循环)
 *
 * 		Case 4:
 * 			兄弟 s 是红色
 *        		p(B)               s(B)
 *       		/ \        →       / \
 *     		n(BB) s(R)           p(R) sR
 *          	/ \             / \
 *         		 sL  sR          n(BB) sL
 * 			对 p 左旋, 将红色兄弟转化为黑色兄弟的情况 (Case 1 / 2 / 3), 然后重新处理注意旋转后 n 的新兄弟是 sL (原来 s 的左子), 它是黑色的
 *
 * 		对称情况
 * 			以上所有 case 都有 n 是右孩子的镜像版本(左旋 ↔ 右旋互换)
 */
function fixDoubleBlack(stack: Array<RBTreeNode>) {
	let n: RBTreeNode = null!
	let p: RBTreeNode = null!
	let s: RBTreeNode = null!
	let z: RBTreeNode = null!
	for (let i: number = stack.length - 1; i >= 0; --i) {
		n = stack[i]
		/**
		 * 到达根节点 — 直接将根设为黑色即可(所有路径黑高统一减1)
		 */
		if (i === 0) {
			n.color = ERBTREE_COLOR.BLACK
			return
		}
		p = stack[i - 1]
		/**
		 * 分支 A: n 是 p 的左孩子, 兄弟 s 在右边
		 **/
		if (p.left === n) {
			s = p.right
			/**
			 * Case 1: 兄弟的远侄子 (s.right) 为红色 → 左旋 p
			 **/
			if (s.right && s.right.color === ERBTREE_COLOR.RED) {
				s = p.right = cloneNode(s)
				z = s.right = cloneNode(s.right)
				/**
				 * p 接管 s 的左子树
				 */
				p.right = s.left
				/**
				 * s 成为新的子树根, p 变为 s 的左子
				 */
				s.left = p
				/**
				 * z 保持为 s 的右子
				 */
				s.right = z
				/**
				 * s 继承 p 原来的颜色
				 */
				s.color = p.color
				/**
				 * n 脱离双重黑色
				 */
				n.color = ERBTREE_COLOR.BLACK
				/**
				 * p 变黑
				 */
				p.color = ERBTREE_COLOR.BLACK
				/**
				 * z 变黑
				 */
				z.color = ERBTREE_COLOR.BLACK
				recount(p)
				recount(s)
				/**
				 * 更新祖父节点的指针
				 */
				if (i > 1) {
					let pp: RBTreeNode = stack[i - 2]
					if (pp.left === p) {
						pp.left = s
					} else {
						pp.right = s
					}
				}
				stack[i - 1] = s
				/**
				 * 修复完成
				 */
				return
			} else if (s.left && s.left.color === ERBTREE_COLOR.RED) {
				/**
				 * Case 2: 兄弟的近侄子 (s.left) 为红色 → RL双旋转
				 **/
				s = p.right = cloneNode(s)
				z = s.left = cloneNode(s.left)
				/**
				 * p 接管 z 的左子树
				 */
				p.right = z.left
				/**
				 * s 接管 z 的右子树
				 */
				s.left = z.right
				/**
				 * z 成为新根, p 为左子
				 */
				z.left = p
				/**
				 *  s 为右子
				 */
				z.right = s
				/**
				 * z 继承 p 的颜色
				 */
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
				/**
				 * 修复完成
				 */
				return
			}
			/**
			 * Case 3: 兄弟 s 为黑色, 且 s 的两个子节点都是黑色
			 **/
			if (s.color === ERBTREE_COLOR.BLACK) {
				if (p.color === ERBTREE_COLOR.RED) {
					/**
					 * Case 3a: 父节点为红 → 直接重着色即可
					 */
					p.color = ERBTREE_COLOR.BLACK
					p.right = repaint(ERBTREE_COLOR.RED, s)
					/**
					 * 修复完成
					 */
					return
				} else {
					/**
					 * Case 3b: 父节点也为黑 → 双重黑色上移到父节点
					 */
					p.right = repaint(ERBTREE_COLOR.RED, s)
					/**
					 *  继续向上修复
					 */
					continue
				}
			} else {
				/**
				 * Case 4: 兄弟 s 为红色 → 左旋 p, 转化为 Case 1 / 2 / 3
				 **/
				s = cloneNode(s)
				/**
				 * p 接管 s 的左子
				 */
				p.right = s.left
				/**
				 * s 成为新根
				 */
				s.left = p
				s.color = p.color
				/**
				 * p 变红, 为后续处理创造条件
				 */
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
				/**
				 * 调整栈: s 取代 p 的位置, p 下移, n 再下移
				 */
				stack[i - 1] = s
				stack[i] = p
				if (i + 1 < stack.length) {
					stack[i + 1] = n
				} else {
					stack.push(n)
				}
				/**
				 * 回退索引, 让循环重新处理 n (此时 n 的兄弟已变为黑色)
				 */
				i = i + 2
			}
		} else {
			/**
			 * 分支B: n 是 p 的右孩子, 兄弟 s 在左边(镜像对称)
			 **/
			s = p.left
			/**
			 * Case 1 (镜像): 兄弟的远侄子 (s.left) 为红色 → 右旋 p
			 */
			if (s.left && s.left.color === ERBTREE_COLOR.RED) {
				s = p.left = cloneNode(s)
				z = s.left = cloneNode(s.left)
				/**
				 * p 接管 s 的右子树
				 */
				p.left = s.right
				/**
				 * s 成为新根, p 为右子
				 */
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
				/**
				 * Case 2 (镜像): 兄弟的近侄子 (s.right) 为红色 → LR双旋转
				 **/
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
			/**
			 * Case 3 (镜像): 兄弟 s 为黑色, s 的子节点都黑
			 **/
			if (s.color === ERBTREE_COLOR.BLACK) {
				if (p.color === ERBTREE_COLOR.RED) {
					/**
					 * Case 3a: 父红 → 重着色
					 */
					p.color = ERBTREE_COLOR.BLACK
					p.left = repaint(ERBTREE_COLOR.RED, s)
					return
				} else {
					/**
					 * Case 3b: 父黑 → 双重黑色上移
					 */
					p.left = repaint(ERBTREE_COLOR.RED, s)
					continue
				}
			} else {
				/**
				 * Case 4 (镜像): 兄弟 s 为红色 → 右旋 p
				 */
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

/**
 * RBTreeNode - 红黑树节点
 *
 * 每个节点存储:
 * 		- color: 颜色(红 / 黑), 用于维持平衡
 * 		- key: 键, 用于排序和查找
 * 		- value: 值, 存储的实际数据
 * 		- left:  左子节点引用 (key 小于当前节点的子树)
 * 		- right: 右子节点引用 (key 大于当前节点的子树)
 * 		- count: 以此节点为根的子树节点总数(用于 O(log(n)) 的索引查找)
 *
 * count 字段的作用 - Order Statistic Tree
 * 		count 使红黑树具备了"顺序统计树"的能力:
 * 			- 可以 O(log(n)) 找到第 k 小的元素
 * 			- 可以 O(log(n)) 计算某元素的排名
 */
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

/**
 * RBTree - 持久化红黑树 (Persistent Red-Black Tree)
 *
 * 持久化 (Persistent) 的含义:
 * 		每次 insert/remove 操作都返回一棵新树, 原树保持不变
 * 		通过"路径拷贝"实现的: 只复制从根到修改节点的路径上的节点, 其余节点在新旧树之间共享
 *
 * 空间复杂度: 每次修改 O(log(n)) 额外空间(路径长度)
 *
 * 使用示例：
 * ```typescript
 * // 创建空树
 * let tree = createRBTree((a, b) => a - b)
 *
 * // 插入元素(返回新树, 原树不变)
 * const tree1 = tree.insert(10, "A")
 * const tree2 = tree1.insert(20, "B")
 * const tree3 = tree2.insert(5, "C")
 *
 * // tree 仍然是空的！tree3 有 3 个元素
 * console.log(tree.length)  // 0
 * console.log(tree3.length)  // 3
 *
 * // 查找
 * console.log(tree3.get(10))  // "A"
 * console.log(tree3.get(99))  // undefined
 *
 * // 迭代器 - 找到第一个 >= 15 的元素
 * const iter = tree3.ge(15)
 * console.log(iter.key)  // 20
 *
 * // 范围遍历 [5, 20)
 * tree3.forEach((k, v) => console.log(k, v), 5, 20)  // 输出: 5 "C" 10 "A"
 *
 * // 删除
 * const tree4 = tree3.remove(10)
 * console.log(tree4.length)  // 2
 * console.log(tree3.length)  // 3 (原树不变)
 * ```
 */
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

	/**
	 * 获取所有键的有序数组(中序遍历)
	 */
	public get keys(): Array<RBTreeNode> {
		const result: Array<RBTreeNode> = []
		this.forEach((k: RBTreeNode, v: RBTreeNode): RBTreeNode | void => {
			result.push(k)
		})
		return result
	}

	/**
	 * 获取所有值的有序数组(按键排序)
	 */
	public get values(): Array<RBTreeNode> {
		const result: Array<RBTreeNode> = []
		this.forEach((k: RBTreeNode, v: RBTreeNode): RBTreeNode | void => {
			result.push(v)
		})
		return result
	}

	/**
	 * 树中节点的总数
	 */
	public get length(): number {
		if (this.root) {
			return this.root.count
		}
		return 0
	}

	/**
	 * 获取指向最小元素的迭代器
	 *
	 * 实现:
	 * 		从根一直向左走到底
	 *
	 * 案例：
	 *       20
	 *      /  \
	 *    10    30
	 *   /
	 *  5   ← begin 指向这里
	 */
	public get begin(): RedBlackTreeIterator {
		let stack: Array<RBTreeNode> = []
		let n: RBTreeNode = this.root
		while (n) {
			stack.push(n)
			n = n.left
		}
		return new RedBlackTreeIterator(this, stack)
	}

	/**
	 * 获取指向最大元素的迭代器
	 *
	 * 实现:
	 * 		从根一直向右走到底
	 */
	public get end(): RedBlackTreeIterator {
		let stack: Array<RBTreeNode> = []
		let n: RBTreeNode = this.root
		while (n) {
			stack.push(n)
			n = n.right
		}
		return new RedBlackTreeIterator(this, stack)
	}

	/**
	 * 遍历方法 - 支持三种模式:
	 * 		- forEach(visit)  // 遍历所有节点
	 * 		- forEach(visit, lo)  // 遍历 [lo, +∞) 的节点
	 * 		- forEach(visit, lo, hi)  // 遍历 [lo, hi) 的节点
	 *
	 * 		输入:
	 * 			visit: 访问回调 (key, value) => void | 返回值(提前终止)
	 * 			lo: 可选下界
	 * 			hi: 可选上界(不包含)
	 */
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
					/**
					 * 空范围, lo >= hi
					 */
					return
				}
				return doVisit(lo!, hi!, this.compare, visit, this.root)
		}
	}

	/**
	 * insert - 插入新节点(核心操作)
	 *
	 * 		输入:
	 * 			key: 要插入的键
	 * 			value: 要插入的值
	 * 		输出:
	 * 			包含新节点的新树(原树不变)
	 *
	 * 算法分为三个阶段:
	 * 		- 阶段 1: 查找插入位置
	 * 			像普通 BST 一样沿树向下查找, 记录路径 (n_stack) 和方向 (d_stack)
	 * 			新节点总是作为叶子插入, 颜色为红色
	 * 			新节点是红色:
	 * 				- 插入红色节点不会违反性质5(黑高不变), 只可能违反性质4(连续红色)
	 * 				- 修复性质 4 比修复性质5简单得多
	 * 		- 阶段 2: 路径拷贝
	 * 			从插入点向上, 拷贝路径上的所有节点(持久化要求), 同时将每个祖先节点的 count + 1
	 * 		- 阶段 3: 修复红黑性质
	 * 			从新插入的红色节点开始向上检查, 如果出现"父子都为红色"的违规, 根据叔节点的颜色分情况处理:
	 * 				情况 A:
	 * 					叔节点为红色 → 重着色 (Recoloring)
	 *       				pp(B)              pp(R) ← 可能导致上层违规
	 *      				/    \             /    \
	 *    			 	p(R)   uncle(R) → p(B)   uncle(B)
	 *  			 	/                 /
	 *  		   	  n(R)              n(R)
	 * 					父和叔变黑, 祖父变红, 然后检查祖父是否违规 (s -= 1 继续循环)
	 * 				情况 B:
	 * 					叔节点为黑色 / null → 旋转 (Rotation)
	 * 					B1:
	 * 						LL 型 (n 是 p 的左子, p 是 pp 的左子)→ 右旋 pp
	 *       					pp(B)              p(B)
	 *     						 /    \             /    \
	 *    					 p(R)   uncle  →     n(R)   pp(R)
	 *  			 		/                           /  \
	 *  				 n(R)                         pR   uncle
	 * 					B2:
	 * 						LR 型 (n 是 p 的右子, p 是 pp 的左子)→ 先左旋 p 再右旋 pp
	 *       					pp(B)              n(B)
	 *     						/    \            /    \
	 *    					p(R)   uncle  →   p(R)   pp(R)
	 *      				   \                      /  \
	 *      				   n(R)                 nR   uncle
	 * 					B3:
	 * 						RR 型(镜像 LL) → 左旋 pp
	 * 					B4:
	 * 						RL 型(镜像 LR) → 先右旋 p 再左旋 pp
	 *
	 * 			旋转后修复完成 (break), 最后确保根为黑色
	 */
	public insert(key: RBTreeNode, value: RBTreeNode): RBTree {
		let n: RBTreeNode = this.root
		/**
		 * n_stack: 记录从根到插入位置的路径节点
		 */
		let n_stack: Array<RBTreeNode> = []
		/**
		 * d_stack: 记录每一步的方向 (<= 0 去左, > 0 去右)
		 */
		let d_stack: Array<number> = []
		/**
		 * 阶段 1: 查找插入位置(标准 BST 查找)
		 **/
		while (n) {
			let d: number = this.compare(key, n.key)
			n_stack.push(n)
			d_stack.push(d)
			if (d <= 0) {
				/**
				 * key <= n.key, 往左走
				 */
				n = n.left
			} else {
				/**
				 * key > n.key, 往右走
				 */
				n = n.right
			}
		}
		/**
		 * 创建新的红色叶子节点并推入栈顶
		 */
		n_stack.push(new RBTreeNode(ERBTREE_COLOR.RED, key, value, null!, null!, 1))
		/**
		 * 阶段2: 路径拷贝 + count 更新
		 **/
		/**
		 * 从插入位置向上, 重建路径上所有节点(实现持久化)
		 */
		for (let s: number = n_stack.length - 2; s >= 0; --s) {
			let n: RBTreeNode = n_stack[s]
			if (d_stack[s] <= 0) {
				/**
				 * 新节点在左子树方向, 克隆当前节点并更新左子指针
				 */
				n_stack[s] = new RBTreeNode(n.color, n.key, n.value, n_stack[s + 1], n.right, n.count + 1)
			} else {
				/**
				 * 新节点在右子树方向, 克隆当前节点并更新右子指针
				 */
				n_stack[s] = new RBTreeNode(n.color, n.key, n.value, n.left, n_stack[s + 1], n.count + 1)
			}
		}
		/**
		 * 阶段3: 修复红黑性质(自底向上)
		 **/
		for (let s: number = n_stack.length - 1; s > 1; --s) {
			/**
			 * 父节点
			 */
			let p: RBTreeNode = n_stack[s - 1]
			/**
			 * 当前节点
			 */
			let n: RBTreeNode = n_stack[s]
			/**
			 * 如果父是黑色或当前节点是黑色, 不违反性质 4, 停止
			 */
			if (p.color === ERBTREE_COLOR.BLACK || n.color === ERBTREE_COLOR.BLACK) {
				break
			}
			/**
			 * 此时 p 和 n 都是红色 — 违反性质 4
			 **/
			/**
			 * 祖父节点(必为黑色)
			 */
			let pp: RBTreeNode = n_stack[s - 2]
			/**
			 * p 是 pp 的左孩子
			 **/
			if (pp.left === p) {
				if (p.left === n) {
					/**
					 * LL 型
					 **/
					/**
					 * 叔节点
					 */
					let y: RBTreeNode = pp.right
					if (y && y.color === ERBTREE_COLOR.RED) {
						/**
						 * 情况A: 叔为红 → 重着色
						 */
						p.color = ERBTREE_COLOR.BLACK
						pp.right = repaint(ERBTREE_COLOR.BLACK, y)
						pp.color = ERBTREE_COLOR.RED
						/**
						 *  检查 pp 是否违规
						 */
						s -= 1
					} else {
						/**
						 * 情况 B1: 叔为黑 → 右旋 pp
						 */
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
					/**
					 * LR 型
					 **/
					/**
					 * 叔节点
					 */
					let y: RBTreeNode = pp.right
					if (y && y.color === ERBTREE_COLOR.RED) {
						/**
						 * 情况 A: 叔为红 → 重着色
						 */
						p.color = ERBTREE_COLOR.BLACK
						pp.right = repaint(ERBTREE_COLOR.BLACK, y)
						pp.color = ERBTREE_COLOR.RED
						s -= 1
					} else {
						/**
						 * 情况 B2: 叔为黑 → LR双旋转
						 */
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
				/**
				 * p 是 pp 的右孩子(镜像对称)
				 **/
				if (p.right === n) {
					/**
					 * RR 型
					 */
					/**
					 * 叔节点
					 */
					let y: RBTreeNode = pp.left
					if (y && y.color === ERBTREE_COLOR.RED) {
						/**
						 * 情况 A: 叔为红 → 重着色
						 */
						p.color = ERBTREE_COLOR.BLACK
						pp.left = repaint(ERBTREE_COLOR.BLACK, y)
						pp.color = ERBTREE_COLOR.RED
						s -= 1
					} else {
						/**
						 * 情况 B3: 叔为黑 → 左旋 pp
						 */
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
					/**
					 * RL 型
					 **/
					/**
					 * 叔节点
					 */
					let y: RBTreeNode = pp.left
					if (y && y.color === ERBTREE_COLOR.RED) {
						/**
						 * 情况 A: 叔为红 → 重着色
						 */
						p.color = ERBTREE_COLOR.BLACK
						pp.left = repaint(ERBTREE_COLOR.BLACK, y)
						pp.color = ERBTREE_COLOR.RED
						s -= 1
					} else {
						/**
						 * 情况 B4: 叔为黑 → RL 双旋转
						 */
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
		/**
		 * 性质 2: 根节点必须为黑色
		 */
		n_stack[0].color = ERBTREE_COLOR.BLACK
		return new RBTree(this.compare, n_stack[0])
	}
	/**
	 * 按索引查找 - 返回第 idx 小的元素的迭代器
	 * 利用每个节点的 count 字段实现 O(log(n)) 的索引查找
	 *
	 * 算法:
	 * 		从根开始, 对于当前节点:
	 * 			- 如果 idx < left.count → 目标在左子树, 递归左子树
	 * 			- 否则 idx -= left.count
	 *   			- 如果 idx == 0 → 当前节点就是目标
	 *   			- 否则 idx -= 1, 递归右子树
	 *
	 * 案例:
	 * 		- 树: [5, 10, 15, 20, 30] (按索引 0 ~ 4)
	 *       		  20(count = 5)
	 *      		 /          \
	 *   		10(count = 2)   30(count = 2)
	 *   			/   \           \
	 *  		 5(1)  15(1)     35(1)
	 * 			at(3): 找第 4 小的元素
	 * 				- 根20: left.count = 2, idx = 3 >= 2, idx -= 2 = 1
	 * 				- idx != 0, idx -= 1 = 0 → 不是根(实际这里应该返回 20)
	 * 				- ... (具体取决于树的实际形状)
	 */
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

	/**
	 * ge(Greater than or Equal) - 找到第一个 >= key 的节点
	 *
	 * 算法:
	 * 		沿树向下查找, 每次遇到 >= key 的节点就记录位置 (last_ptr), 最终 stack 截断到 last_ptr 即为答案路径
	 */
	public ge(key: RBTreeNode): RedBlackTreeIterator {
		let n: RBTreeNode = this.root
		let stack: Array<RBTreeNode> = []
		let last_ptr: number = 0
		while (n) {
			let d: number = this.compare(key, n.key)
			stack.push(n)
			if (d <= 0) {
				/**
				 * 当前节点 >= key, 记录为候选
				 */
				last_ptr = stack.length
			}
			if (d <= 0) {
				/**
				 * 尝试找更小的 >= key 的节点
				 */
				n = n.left
			} else {
				/**
				 * 当前节点太小, 往右找
				 */
				n = n.right
			}
		}
		/**
		 * 截断到最后一个候选位置
		 */
		stack.length = last_ptr
		return new RedBlackTreeIterator(this, stack)
	}

	/**
	 * gt(Greater Than) - 找到第一个 > key 的节点
	 * 与 ge 类似, 但条件改为严格大于 (d < 0 表示 key < node.key)
	 */
	public gt(key: RBTreeNode): RedBlackTreeIterator {
		let n: RBTreeNode = this.root
		let stack: Array<RBTreeNode> = []
		let last_ptr: number = 0
		while (n) {
			let d: number = this.compare(key, n.key)
			stack.push(n)
			if (d < 0) {
				/**
				 * node.key > key, 记录候选
				 */
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

	/**
	 * lt(Less Than) - 找到最后一个 < key 的节点
	 */
	public lt(key: RBTreeNode): RedBlackTreeIterator {
		let n: RBTreeNode = this.root
		let stack: Array<RBTreeNode> = []
		let last_ptr: number = 0
		while (n) {
			let d: number = this.compare(key, n.key)
			stack.push(n)
			if (d > 0) {
				/**
				 * node.key < key, 记录候选
				 */
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

	/**
	 * le (Less than or Equal) - 找到最后一个 <= key 的节点
	 */
	public le(key: RBTreeNode): RedBlackTreeIterator {
		let n: RBTreeNode = this.root
		let stack: Array<RBTreeNode> = []
		let last_ptr: number = 0
		while (n) {
			let d: number = this.compare(key, n.key)
			stack.push(n)
			if (d >= 0) {
				/**
				 * node.key <= key, 记录候选
				 */
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

	/**
	 * find - 精确查找, 返回指向 key 的迭代器
	 * 如果找不到, 返回无效迭代器 (stack 为空)
	 */
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

	/**
	 * remove - 删除指定 key 的节点
	 * 先 find 定位, 然后通过迭代器的 remove 方法执行删除
	 */
	public remove(key: RBTreeNode): RBTree {
		const iter: RedBlackTreeIterator = this.find(key)
		if (iter) {
			return iter.remove()
		}
		return this
	}

	/**
	 * get - 根据 key 获取对应的 value
	 * 标准 BST 查找, O(log(n))
	 */
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

/**
 * RedBlackTreeIterator - 红黑树迭代器
 *
 * 设计思路:
 * 		迭代器通过维护一个从根到当前节点的路径栈 (stack) 来记录位置
 * 		stack 的最后一个元素就是当前指向的节点
 *
 * 这种设计允许:
 * 		- O(1) 访问当前节点
 * 		- 均摊 O(1) 的 next/prev 操作
 * 		- O(log(n)) 的 update/remove 操作(需要路径拷贝)
 *
 * 迭代器遍历案例:
 *       			 20
 *     	 			/  \
 *    			  10    30
 *   				/  \
 *  			   5   15
 * 		begin 的 stack: [20, 10, 5] (一直向左)
 * 		调用 next():
 *   		- 5 无右子 → 弹出5
 *   		- 栈顶 10 的 left === 5 → 不弹出(因为还没访问10)
 *   		- stack: [20, 10], 当前指向10
 * 		再次 next():
 *   		- 10 有右子 15 → 进入右子树, push 15
 *   		- 15 无左子 → 停止
 *   		- stack: [20, 10, 15], 当前指向 15
 * 		再次 next():
 *   		- 15 无右子 → 弹出 15
 *   		- 栈顶 10 的 right === 15 → 弹出 10
 *   		- 栈顶 20 的 left === 10 → 不弹出
 *   		- stack: [20], 当前指向 20
 * 		这就是中序遍历: 5 → 10 → 15 → 20 → 30
 */
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

	/**
	 * 迭代器是否指向有效节点
	 */
	public get valid(): boolean {
		return this._stack.length > 0
	}

	/**
	 * 是否有前驱节点(中序遍历的前一个)
	 *
	 * 判断逻辑:
	 * 		- 如果当前节点有左子树 → 一定有前驱(左子树的最右节点)
	 * 		- 否则向上回溯, 如果某个祖先的右子是我们来的方向 → 那个祖先是前驱
	 */
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

	/**
	 * 是否有后继节点(中序遍历的下一个)
	 *
	 * 判断逻辑:
	 * 		- 如果当前节点有右子树 → 一定有后继(右子树的最左节点)
	 * 		- 否则向上回溯, 如果某个祖先的左子是我们来的方向 → 那个祖先是后继
	 */
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

	/**
	 * 克隆迭代器(深拷贝路径栈)
	 */
	public clone(): RedBlackTreeIterator {
		return new RedBlackTreeIterator(this.tree, this._stack.slice())
	}

	/**
	 * remove - 通过迭代器删除当前节点
	 *
	 * 删除算法概述:
	 * 		- 路径拷贝
	 *   		克隆从根到目标节点的整条路径(持久化要求)
	 * 		- 处理双子节点情况
	 *   		如果要删除的节点有两个子节点, 找到其中序前驱(左子树的最右节点), 将前驱的 key/value 复制过来, 转而删除那个前驱节点(它最多只有一个子节点)
	 * 		- 实际删除
	 *   		- 如果目标是红色叶子 → 直接删除(不影响黑高)
	 *   		- 如果目标是黑色且有一个红色子节点 → 用子节点替换, 染黑
	 *   		- 如果目标是黑色叶子 → 删除后出现"双重黑色", 调用 fixDoubleBlack
	 * 		- 步骤4: count 更新
	 *   		路径上所有节点的 count 减 1
	 *
	 * 案例 - 删除有两个子节点的节点:
	 *       		20 (目标)              15 (前驱的值替换过来)
	 *      		/       \             /       \
	 *    		  10         30   →    10         30
	 *   		 /  \                 /  \
	 *  		5   15               5   [删除 15] ← 转而删除这个
	 */
	public remove(): RBTree {
		let stack: Array<RBTreeNode> = this.stack
		if (stack.length === 0) {
			return this.tree
		}
		/**
		 * 路径拷贝
		 **/
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
		/**
		 * 双子节点处理
		 **/
		/**
		 * 如果目标节点有左右两个子节点, 则用中序前驱替换
		 */
		n = cstack[cstack.length - 1]
		if (n.left && n.right) {
			/**
			 * 找中序前驱: 左子树一直往右走到底
			 */
			let split: number = cstack.length
			n = n.left
			while (n.right) {
				cstack.push(n)
				n = n.right
			}
			/**
			 * 将前驱的 key/value 复制到目标节点
			 */
			let v: RBTreeNode = cstack[split - 1]
			cstack.push(new RBTreeNode(n.color, v.key, v.value, n.left, n.right, n.count))
			cstack[split - 1].key = n.key
			cstack[split - 1].value = n.value
			/**
			 * 重建从 split 到末尾的路径
			 */
			for (let i: number = cstack.length - 2; i >= split; --i) {
				n = cstack[i]
				cstack[i] = new RBTreeNode(n.color, n.key, n.value, n.left, cstack[i + 1], n.count)
			}
			cstack[split - 1].left = cstack[split]
		}
		/**
		 * 实际删除
		 **/
		n = cstack[cstack.length - 1]
		/**
		 * Case A: 目标是红色叶子 → 直接移除
		 **/
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
			/**
			 * Case B: 目标是黑色, 且有一个子节点(该子节点必为红色)
			 **/
			/**
			 * 用子节点替换目标, 并将子节点染黑
			 **/
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
				/**
				 * Case C: 目标是黑色叶子 → 双重黑色问题
				 */
				/**
				 * 删除的是根节点(也是唯一节点) → 树变空
				 */
				return new RBTree(this.tree.compare, null!)
			} else {
				/**
				 * 先更新 count, 然后修复双重黑色
				 */
				for (let i: number = 0; i < cstack.length; i++) {
					cstack[i].count--
				}
				let parent = cstack[cstack.length - 2]
				fixDoubleBlack(cstack)
				/**
				 * 修复完成后, 将目标节点从父节点断开
				 */
				if (parent.left === n) {
					parent.left = null!
				} else {
					parent.right = null!
				}
			}
		}
		return new RBTree(this.tree.compare, cstack[0])
	}

	/**
	 * next - 将迭代器移动到中序后继
	 *
	 * 算法:
	 * 		- 如果当前节点有右子树: 进入右子树, 然后一直向左走到底
	 *		- 否则: 向上回溯, 直到找到一个"我们是从左子来的"祖先
	 *
	 * 案例:
	 * 		- 从节点10移动到下一个:
	 *       		 20
	 *      		/  \
	 *   		  [10]   30    → 10 有右子 15, 进入 15
	 *   		  /  \         → 15 无左子, 停在 15
	 *  		 5   15
	 *
	 * 		- 从节点 15 移动到下一个:
	 *       		20
	 *      	   /  \
	 *    		  10    30    → 15 无右子, 弹出 15
	 *   		 /  \         → stack 顶是 10, 10.right === 15, 弹出 10
	 *  		5  [15]       → stack 顶是 20, 20.left === 10 (不是 right), 停在 20
	 */
	public next(): void {
		let stack: Array<RBTreeNode> = this._stack
		if (stack.length === 0) {
			return
		}
		let n: RBTreeNode = stack[stack.length - 1]
		if (n.right) {
			/**
			 * 有右子树: 进入右子树的最左节点
			 */
			n = n.right
			while (n) {
				stack.push(n)
				n = n.left
			}
		} else {
			/**
			 * 无右子树: 向上回溯
			 */
			stack.pop()
			while (stack.length > 0 && stack[stack.length - 1].right === n) {
				n = stack[stack.length - 1]
				stack.pop()
			}
		}
	}

	/**
	 * prev - 将迭代器移动到中序前驱 (next 的镜像操作)
	 *
	 * 算法:
	 * 		- 如果当前节点有左子树: 进入左子树, 然后一直向右走到底
	 * 		- 否则: 向上回溯, 直到找到一个"我们是从右子来的"祖先
	 */
	public prev(): void {
		let stack: Array<RBTreeNode> = this._stack
		if (stack.length === 0) {
			return
		}
		let n: RBTreeNode = stack[stack.length - 1]
		if (n.left) {
			/**
			 * 有左子树: 进入左子树的最右节点
			 */
			n = n.left
			while (n) {
				stack.push(n)
				n = n.right
			}
		} else {
			/**
			 * 无左子树: 向上回溯
			 */
			stack.pop()
			while (stack.length > 0 && stack[stack.length - 1].left === n) {
				n = stack[stack.length - 1]
				stack.pop()
			}
		}
	}

	/**
	 * update - 更新当前迭代器指向节点的 value (不改变 key)
	 * 通过路径拷贝实现持久化, 返回一棵新树
	 */
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

/**
 * 通过 Object.defineProperty 定义的迭代器属性
 *
 * 这些属性提供了对迭代器当前位置的便捷访问:
 * 		- node: 当前节点对象
 * 		- key: 当前节点的键
 * 		- value: 当前节点的值
 * 		- index: 当前节点在树中的排名(从 0 开始)
 */

/** 获取迭代器当前指向的节点 */
Object.defineProperty(RedBlackTreeIterator.prototype, 'node', {
	get: function (): RBTreeNode {
		if (this.stack.length > 0) {
			return this.stack[this.stack.length - 1]
		}
		return null!
	},
	enumerable: true,
})

/**
 * 获取迭代器当前节点的 key
 */
Object.defineProperty(RedBlackTreeIterator.prototype, 'key', {
	get: function (): string {
		if (this._stack.length > 0) {
			return this._stack[this._stack.length - 1].key
		}
		return undefined!
	},
	enumerable: true,
})

/**
 * 获取迭代器当前节点的 value
 */
Object.defineProperty(RedBlackTreeIterator.prototype, 'value', {
	get: function (): any {
		if (this._stack.length > 0) {
			return this._stack[this._stack.length - 1].value
		}
		return undefined
	},
	enumerable: true,
})

/**
 * 获取迭代器当前节点在树中的排名索引 (0 - based)
 *
 * 算法 - 利用 count 字段计算排名:
 * 		- 初始: idx = 当前节点左子树的大小
 * 		- 然后从当前节点向上回溯:
 * 			- 如果当前栈帧是父节点的右孩子, 说明父节点及其左子树都在当前节点前面
 *   			→ idx += 1 + parent.left.count
 *
 * 案例:
 *       		20(count = 5)
 *      		/          \
 *   		10(count = 2)   30(count = 2)
 *   		/               \
 *    	5(count = 1)       35(count = 1)
 * 		- 求节点 30 的 index:
 * 			- idx = 0 (30 无左子)
 * 			- 回溯: 30 是 20 的右孩子 → idx += 1 + 20.left.count = 1 + 2 = 3
 * 		- 到达根, 结束
 * 		- index = 3  // (排序后: 5 = 0, 10 = 1, 20 = 2, 30 = 3, 35 = 4)
 */
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

/**
 * createRBTree - 工厂函数, 创建一棵空的红黑树
 *
 * 		输入:
 * 			compare: 自定义比较函数, 决定元素的排序方式
 *   			- 返回负数: a < b
 *   			- 返回正数: a > b
 *   			- 返回 0: a === b
 *
 * 使用示例:
 * ```typescript
 * // 数值排序的红黑树
 * const numTree = createRBTree((a, b) => a - b)
 *
 * // 字符串排序的红黑树
 * const strTree = createRBTree((a, b) => a.localeCompare(b))
 *
 * // 按对象某个属性排序
 * const objTree = createRBTree((a, b) => a.priority - b.priority)
 *
 * // 插入和查询
 * let tree = createRBTree((a, b) => a - b)
 * tree = tree.insert(10, "hello")
 * tree = tree.insert(5, "world")
 * tree = tree.insert(20, "!")
 *
 * // 区间查询: 找所有 key 在 [6, 15) 范围的节点
 * tree.forEach((k, v) => {
 *   console.log(k, v)  // 输出: 10 "hello"
 * }, 6, 15)
 *
 * // 迭代器遍历
 * for (let it = tree.begin; it.valid; it.next()) {
 *   console.log(it.key, it.value)
 * }
 * // 输出: 5 "world", 10 "hello", 20 "!"
 * ```
 *
 * 在 Canvas 绘图引擎中的应用场景:
 * 		- 红黑树常用于扫描线算法 (Sweep Line Algorithm):
 * 			- 计算几何中的线段交点检测
 * 			- 事件队列的维护(按 x / y 坐标排序)
 * 			- 活动边表 (Active Edge Table) 的维护
 * 			- 区间查询(找到与当前扫描线相交的所有线段)
 *
 * 持久化特性在以下场景特别有用:
 * 		- 撤销/重做 (Undo/Redo): 保留每一步的树状态
 * 		- 并发操作: 不同线程可以同时操作树的不同版本
 * 		- 快照: 零成本保存历史状态
 */
export function createRBTree(compare: (k1: RBTreeNode, k2: RBTreeNode) => number): RBTree {
	return new RBTree(compare || defaultCompare, null!)
}
