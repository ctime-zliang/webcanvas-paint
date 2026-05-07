import { main as d2FreeTestMain } from './$instance/d2FreeTest'
import { main as d2SimpleClockMain } from './$instance/d2SimpleClock'

window.addEventListener('DOMContentLoaded', (): void => {
	const insValue: string = new URLSearchParams(window.location.search).get('instance')!
	switch (insValue) {
		case 'd2FreeTest': {
			d2FreeTestMain()
			break
		}
		case 'd2SimpleClock': {
			d2SimpleClockMain()
			break
		}
		default: {
			console.warn('unspecified initialization type.')
		}
	}
})
