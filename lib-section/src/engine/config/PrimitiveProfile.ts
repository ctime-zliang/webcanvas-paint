export const PRIMITIVE_INIT_STATUS: number = 0b00001

export enum ECanvas2DLineCap {
	BUTT = 'BUTT',
	ROUND = 'ROUND',
	SQUARE = 'SQUARE',
}

export enum ED2PointShape {
	TRIANGLE = 'TRIANGLE',
	DOT = 'DOT',
}

export enum ED2FontStyle {
	NORMAL = 'normal',
	ITALIC = 'italic',
}

export enum EPrimitiveStatus {
	VISIBLE = 1 << 0, // 0bxxxx1  // 可见 or 隐藏
	LOCKED = 1 << 1, // 0bxxx1x  // 锁定 or 非锁定
	KILLED = 1 << 2, // 0bxx1xx  // 死亡 or 存活
	HIGHTLIGHT = 1 << 3, // 0bx1xxx  // 高亮 or 非高亮
}
