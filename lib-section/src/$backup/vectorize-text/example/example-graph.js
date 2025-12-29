'use strict'

let graph = window.vectorizeText('Hello world! 你好', {
	width: 500,
	font: 'normal',
	textBaseline: 'top',
})

console.log(graph)

let svg = ['<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"  width="500"  height="80" >']
graph.edges.forEach(function (e) {
	let p0 = graph.positions[e[0]]
	let p1 = graph.positions[e[1]]
	svg.push('<line x1="' + p0[0] + '" y1="' + p0[1] + '" x2="' + p1[0] + '" y2="' + p1[1] + '" stroke-width="1" stroke="black" />')
})
svg.push('</svg>')

if (typeof window !== 'undefined') {
	document.body.innerHTML = svg.join('')
} else {
	console.log(svg.join(''))
}
