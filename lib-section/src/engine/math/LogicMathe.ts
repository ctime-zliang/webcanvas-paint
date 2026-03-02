export class LogicMathe {
	public static sign(value: number): number {
		if (value > 0) {
			return 1
		}
		if (value === 0) {
			return 0
		}
		return -1
	}
}
