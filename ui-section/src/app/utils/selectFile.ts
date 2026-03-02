export function selectFile(accept: string, calback: (file: File) => void): void {
	const fileInput = document.createElement('input')
	fileInput.type = 'file'
	fileInput.accept = 'image/*'
	// fileInput.accept = 'image/jpeg, image/png, image/gif, image/webp, image/svg+xml';
	fileInput.addEventListener('change', function (e: Event): void {
		const file: File = (e.target as any).files[0]
		calback(file)
	})
	fileInput.click()
}
