import { getHashIden } from './hashIden'

export type TInitIframeElementResult = {
	element: HTMLIFrameElement
	id: string
}
export async function initIframeElement(containerElement: HTMLElement, loadURL: string): Promise<TInitIframeElementResult> {
	return new Promise((resolve): void => {
		const iframeElement: HTMLIFrameElement = document.createElement('iframe')
		const elementId: string = getHashIden()
		iframeElement.src = loadURL
		iframeElement.style.width = '100%'
		iframeElement.style.height = '100%'
		iframeElement.style.border = '0'
		iframeElement.style.backgroundColor = '#000000'
		iframeElement.onload = function (): void {
			resolve({ element: iframeElement, id: elementId })
		}
		iframeElement.id = elementId
		containerElement.appendChild(iframeElement)
	})
}
