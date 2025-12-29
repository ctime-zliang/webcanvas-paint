/**
 * 填充网格线顶点数据
 * 		用 z 值区分垂直网格线与水平网格线
 */
export function fillLineVertical(posData: Array<number>, x: number, height: number): void {
	posData.push(x, -height, 0, x, height, 0)
}
export function fillLineHorizontal(posData: Array<number>, y: number, width: number): void {
	posData.push(-width, y, 0.1, width, y, 0.1)
}

export function fillDot(posData: Array<number>, x: number, y: number): void {
	posData.push(x, y, 0.1)
}
