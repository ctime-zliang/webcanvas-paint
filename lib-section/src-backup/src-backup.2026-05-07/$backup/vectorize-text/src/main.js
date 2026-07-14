import { VText } from './lib'
import robustOrientation from 'robust-orientation'

let defaultCanvas = null
let defaultContext = null

if (typeof document !== 'undefined') {
	defaultCanvas = document.createElement('canvas')
	defaultCanvas.width = 8192
	defaultCanvas.height = 1024
	defaultContext = defaultCanvas.getContext('2d')
}

function createText(str, options) {
	if (typeof options !== 'object' || options === null) {
		options = {}
	}
	return VText.vectorizeText(str, options.canvas || defaultCanvas, options.context || defaultContext, options)
}

console.log(robustOrientation([0, 0], [1, 0], [0, 1]))

window.vectorizeText = createText
