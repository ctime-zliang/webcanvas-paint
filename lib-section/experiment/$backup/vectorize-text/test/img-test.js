let getPixels = require('get-pixels')
let savePixels = require('save-pixels')
let tape = require('tape')
let dataURL = require('./image.json')
let processPixels = require('../lib/vtext').processPixels
let imshow = require('ndarray-imshow')
let fs = require('fs')

tape('image-test', function (t) {
	getPixels(dataURL, function (err, data) {
		let graph = processPixels(
			data.pick(-1, -1, 0).transpose(1, 0),
			{
				triangles: true,
				font: ['"Open Sans", verdana, arial, sans-serif', '"Open Sans", verdana, arial, sans-serif', '"Open Sans", verdana, arial, sans-serif'],
				textAlign: 'left',
				textBaseline: 'top',
			},
			64
		)
		t.end()
	})
})
