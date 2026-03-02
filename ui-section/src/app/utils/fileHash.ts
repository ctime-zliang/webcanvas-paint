export async function calculateFileHash(
	file: File,
	algorithm: string = 'SHA-256'
): Promise<{ hashId: string; file: File; success: boolean; error: any }> {
	return new Promise((resolve, reject): void => {
		const reader: FileReader = new FileReader()
		reader.onload = async (e: ProgressEvent<FileReader>): Promise<void> => {
			const buffer: string | ArrayBuffer = (e.target as any).result!
			try {
				const hashBuffer: ArrayBuffer = await crypto.subtle.digest(algorithm, buffer as ArrayBuffer)
				const hashArray: Array<number> = Array.from(new Uint8Array(hashBuffer))
				const hashHex: string = hashArray
					.map((b: number): string => {
						return b.toString(16).padStart(2, '0')
					})
					.join('')
				resolve({ hashId: hashHex, file, success: true, error: null })
			} catch (error) {
				resolve({ hashId: undefined!, file, success: false, error })
			}
		}
		reader.onerror = reject
		reader.readAsArrayBuffer(file)
	})
}
