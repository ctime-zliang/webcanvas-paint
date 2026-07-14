'use strict'

let vectorizeText = require('../index')
let tape = require('tape')

tape('fuzzing', function (t) {
	vectorizeText('1.9', {
		triangles: true,
		font: ['"Open Sans", verdana, arial, sans-serif', '"Open Sans", verdana, arial, sans-serif', '"Open Sans", verdana, arial, sans-serif'],
		textAlign: 'center',
		textBaseline: 'middle',
	})

	t.end()
})
