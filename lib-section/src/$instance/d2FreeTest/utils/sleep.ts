export async function sleep(delay: number = 1000): Promise<void> {
	return new Promise((_): void => {
		window.setTimeout((): void => {
			_(null!)
		}, delay)
	})
}
