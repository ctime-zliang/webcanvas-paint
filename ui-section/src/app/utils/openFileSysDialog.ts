export function openFileSysDialog(callback: (e: Event) => void, accept: string = '.txt'): void {
	const inputElement: HTMLInputElement = document.createElement('input')
	inputElement.type = 'file'
	inputElement.accept = accept
	inputElement.addEventListener('change', callback)
	document.body.appendChild(inputElement)
	inputElement.dispatchEvent(new MouseEvent('click'))
}

export function removeInputFileElement(inputElement: HTMLInputElement): void {
	inputElement.remove()
}
