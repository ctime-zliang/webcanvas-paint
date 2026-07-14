'use strict'

module.exports = createText

let vectorizeText = require('./lib/vtext')
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
	return vectorizeText(str, options.canvas || defaultCanvas, options.context || defaultContext, options)
}
