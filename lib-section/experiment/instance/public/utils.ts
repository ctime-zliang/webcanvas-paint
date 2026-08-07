import { getHashIden } from '../../../src/Main'

export async function fetchFileByURL(imageUrl: string, fileName: string = 'image.jpg'): Promise<File> {
	try {
		const response: any = await window.fetch(imageUrl)
		const blob: Blob = await response.blob()
		const file: File = new File([blob], fileName, {
			type: blob.type || 'image/jpeg',
			lastModified: Date.now(),
		})
		return file
	} catch (error) {
		return null!
	}
}

export async function readFileAsImage(file: File): Promise<{
	imageDataURL: string
	fileHashUuid: string
	width: number
	height: number
}> {
	return new Promise((resolve, reject): void => {
		const fileReader: FileReader = new FileReader()
		fileReader.onload = function (e: ProgressEvent<FileReader>): void {
			const imageDataURL: string = e.target?.result as string
			const image: HTMLImageElement = new Image()
			image.crossOrigin = 'anonymous'
			image.onload = function (e: Event): void {
				resolve({
					imageDataURL,
					fileHashUuid: getHashIden(),
					width: image.width,
					height: image.height,
				})
			}
			image.onerror = function (e: string | Event): void {
				console.error(`[ReadFileAsImage] Image Error: `, e)
			}
			image.src = imageDataURL
		}
		fileReader.onerror = function (e: string | Event): void {
			console.error(`[ReadFileAsImage] FileReader Error: `, e)
		}
		fileReader.readAsDataURL(file)
	})
}
