export class SyncCanvasRect {
	static syncCanvasRectByWindow(canvasElement: HTMLCanvasElement): void {
		const windowInnerWidth: number = window.innerWidth
		const windowInnerHeight: number = window.innerHeight
		canvasElement.width = windowInnerWidth
		canvasElement.height = windowInnerHeight
	}
}
