export const PLANE_INIT_STATUS: number = 0b00001

export enum EPlaneStatus {
	VISIBLE = 1 << 0, // 0bxxxx1  // 可见 or 隐藏
	LOCKED = 1 << 1, // 0bxxx1x  // 锁定 or 非锁定
	KILLED = 1 << 2, // 0bxx1xx  // 死亡 or 存活
}

export enum EPlaneType {
	ControlPlane = 1,
	ContentPlane = 2,
}
