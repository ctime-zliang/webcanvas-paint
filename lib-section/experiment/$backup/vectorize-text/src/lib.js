import surfaceNets from 'surface-nets'
import ndarray from 'ndarray'
import simplify from 'simplify-planar-graph'
import cleanPSLG from 'clean-pslg'
import cdt2d from 'cdt2d'
import toPolygonCrappy from 'planar-graph-to-polyline'

let TAG_bold = 'b'
let CHR_bold = 'b|'

let TAG_italic = 'i'
let CHR_italic = 'i|'

let TAG_super = 'sup'
let CHR_super0 = '+'
let CHR_super = '+1'

let TAG_sub = 'sub'
let CHR_sub0 = '-'
let CHR_sub = '-1'

function parseTag(tag, TAG_CHR, str, map) {
	let opnTag = '<' + tag + '>'
	let clsTag = '</' + tag + '>'

	let nOPN = opnTag.length
	let nCLS = clsTag.length

	let isRecursive = TAG_CHR[0] === CHR_super0 || TAG_CHR[0] === CHR_sub0

	let a = 0
	let b = -nCLS
	while (a > -1) {
		a = str.indexOf(opnTag, a)
		if (a === -1) break

		b = str.indexOf(clsTag, a + nOPN)
		if (b === -1) break

		if (b <= a) break

		for (let i = a; i < b + nCLS; ++i) {
			if (i < a + nOPN || i >= b) {
				map[i] = null
				str = str.substr(0, i) + ' ' + str.substr(i + 1)
			} else {
				if (map[i] !== null) {
					let pos = map[i].indexOf(TAG_CHR[0])
					if (pos === -1) {
						map[i] += TAG_CHR
					} else {
						// i.e. to handle multiple sub/super-scripts
						if (isRecursive) {
							// i.e to increase the sub/sup number
							map[i] = map[i].substr(0, pos + 1) + (1 + parseInt(map[i][pos + 1])) + map[i].substr(pos + 2)
						}
					}
				}
			}
		}

		let start = a + nOPN
		let remainingStr = str.substr(start, b - start)

		let c = remainingStr.indexOf(opnTag)
		if (c !== -1) a = c
		else a = b + nCLS
	}

	return map
}

function transformPositions(positions, options, size) {
	let align = options.textAlign || 'start'
	let baseline = options.textBaseline || 'alphabetic'

	let lo = [1 << 30, 1 << 30]
	let hi = [0, 0]
	let n = positions.length
	for (let i = 0; i < n; ++i) {
		let p = positions[i]
		for (let j = 0; j < 2; ++j) {
			lo[j] = Math.min(lo[j], p[j]) | 0
			hi[j] = Math.max(hi[j], p[j]) | 0
		}
	}

	let xShift = 0
	switch (align) {
		case 'center':
			xShift = -0.5 * (lo[0] + hi[0])
			break

		case 'right':
		case 'end':
			xShift = -hi[0]
			break

		case 'left':
		case 'start':
			xShift = -lo[0]
			break

		default:
			throw new Error("vectorize-text: Unrecognized textAlign: '" + align + "'")
	}

	let yShift = 0
	switch (baseline) {
		case 'hanging':
		case 'top':
			yShift = -lo[1]
			break

		case 'middle':
			yShift = -0.5 * (lo[1] + hi[1])
			break

		case 'alphabetic':
		case 'ideographic':
			yShift = -3 * size
			break

		case 'bottom':
			yShift = -hi[1]
			break

		default:
			throw new Error("vectorize-text: Unrecoginized textBaseline: '" + baseline + "'")
	}

	let scale = 1.0 / size
	if ('lineHeight' in options) {
		scale *= +options.lineHeight
	} else if ('width' in options) {
		scale = options.width / (hi[0] - lo[0])
	} else if ('height' in options) {
		scale = options.height / (hi[1] - lo[1])
	}

	return positions.map(function (p) {
		return [scale * (p[0] + xShift), scale * (p[1] + yShift)]
	})
}

function getPixels(canvas, context, rawString, fontSize, lineSpacing, styletags) {
	rawString = rawString.replace(/\n/g, '') // don't accept \n in the input

	if (styletags.breaklines === true) {
		rawString = rawString.replace(/\<br\>/g, '\n') // replace <br> tags with \n in the string
	} else {
		rawString = rawString.replace(/\<br\>/g, ' ') // don't accept <br> tags in the input and replace with space in this case
	}

	let activeStyle = ''
	let map = []
	for (j = 0; j < rawString.length; ++j) {
		map[j] = activeStyle
	}

	if (styletags.bolds === true) map = parseTag(TAG_bold, CHR_bold, rawString, map)
	if (styletags.italics === true) map = parseTag(TAG_italic, CHR_italic, rawString, map)
	if (styletags.superscripts === true) map = parseTag(TAG_super, CHR_super, rawString, map)
	if (styletags.subscripts === true) map = parseTag(TAG_sub, CHR_sub, rawString, map)

	let allStyles = []
	let plainText = ''
	for (j = 0; j < rawString.length; ++j) {
		if (map[j] !== null) {
			plainText += rawString[j]
			allStyles.push(map[j])
		}
	}

	let allTexts = plainText.split('\n')

	let numberOfLines = allTexts.length
	let lineHeight = Math.round(lineSpacing * fontSize)
	let offsetX = fontSize
	let offsetY = fontSize * 2
	let maxWidth = 0
	let minHeight = numberOfLines * lineHeight + offsetY

	if (canvas.height < minHeight) {
		canvas.height = minHeight
	}

	context.fillStyle = '#000'
	context.fillRect(0, 0, canvas.width, canvas.height)

	context.fillStyle = '#fff'
	let i, j, xPos, yPos, zPos
	let nDone = 0

	let buffer = ''
	function writeBuffer() {
		if (buffer !== '') {
			let delta = context.measureText(buffer).width

			context.fillText(buffer, offsetX + xPos, offsetY + yPos)
			xPos += delta
		}
	}

	function getTextFontSize() {
		return '' + Math.round(zPos) + 'px '
	}

	function changeStyle(oldStyle, newStyle) {
		let ctxFont = '' + context.font

		if (styletags.subscripts === true) {
			let oldIndex_Sub = oldStyle.indexOf(CHR_sub0)
			let newIndex_Sub = newStyle.indexOf(CHR_sub0)

			let oldSub = oldIndex_Sub > -1 ? parseInt(oldStyle[1 + oldIndex_Sub]) : 0
			let newSub = newIndex_Sub > -1 ? parseInt(newStyle[1 + newIndex_Sub]) : 0

			if (oldSub !== newSub) {
				ctxFont = ctxFont.replace(getTextFontSize(), '?px ')
				zPos *= Math.pow(0.75, newSub - oldSub)
				ctxFont = ctxFont.replace('?px ', getTextFontSize())
			}
			yPos += 0.25 * lineHeight * (newSub - oldSub)
		}

		if (styletags.superscripts === true) {
			let oldIndex_Super = oldStyle.indexOf(CHR_super0)
			let newIndex_Super = newStyle.indexOf(CHR_super0)

			let oldSuper = oldIndex_Super > -1 ? parseInt(oldStyle[1 + oldIndex_Super]) : 0
			let newSuper = newIndex_Super > -1 ? parseInt(newStyle[1 + newIndex_Super]) : 0

			if (oldSuper !== newSuper) {
				ctxFont = ctxFont.replace(getTextFontSize(), '?px ')
				zPos *= Math.pow(0.75, newSuper - oldSuper)
				ctxFont = ctxFont.replace('?px ', getTextFontSize())
			}
			yPos -= 0.25 * lineHeight * (newSuper - oldSuper)
		}

		if (styletags.bolds === true) {
			let wasBold = oldStyle.indexOf(CHR_bold) > -1
			let is_Bold = newStyle.indexOf(CHR_bold) > -1

			if (!wasBold && is_Bold) {
				if (wasItalic) {
					ctxFont = ctxFont.replace('italic ', 'italic bold ')
				} else {
					ctxFont = 'bold ' + ctxFont
				}
			}
			if (wasBold && !is_Bold) {
				ctxFont = ctxFont.replace('bold ', '')
			}
		}

		if (styletags.italics === true) {
			let wasItalic = oldStyle.indexOf(CHR_italic) > -1
			let is_Italic = newStyle.indexOf(CHR_italic) > -1
			if (!wasItalic && is_Italic) {
				ctxFont = 'italic ' + ctxFont
			}
			if (wasItalic && !is_Italic) {
				ctxFont = ctxFont.replace('italic ', '')
			}
		}
		context.font = ctxFont
	}

	for (i = 0; i < numberOfLines; ++i) {
		let txt = allTexts[i] + '\n'
		xPos = 0
		yPos = i * lineHeight
		zPos = fontSize

		buffer = ''

		for (j = 0; j < txt.length; ++j) {
			let style = j + nDone < allStyles.length ? allStyles[j + nDone] : allStyles[allStyles.length - 1]
			if (activeStyle === style) {
				buffer += txt[j]
			} else {
				writeBuffer()
				buffer = txt[j]

				if (style !== undefined) {
					changeStyle(activeStyle, style)
					activeStyle = style
				}
			}
		}
		writeBuffer()

		nDone += txt.length

		let width = Math.round(xPos + 2 * offsetX) | 0
		if (maxWidth < width) maxWidth = width
	}

	//Cut pixels from image
	let xCut = maxWidth
	let yCut = offsetY + lineHeight * numberOfLines
	let pixels = ndarray(context.getImageData(0, 0, xCut, yCut).data, [yCut, xCut, 4])
	return pixels.pick(-1, -1, 0).transpose(1, 0)
}

function getContour(pixels, doSimplify) {
	let contour = surfaceNets(pixels, 128)
	if (doSimplify) {
		return simplify(contour.cells, contour.positions, 0.25)
	}
	return {
		edges: contour.cells,
		positions: contour.positions,
	}
}

function processPixelsImpl(pixels, options, size, simplify) {
	//Extract contour
	let contour = getContour(pixels, simplify)

	//Apply warp to positions
	let positions = transformPositions(contour.positions, options, size)
	let edges = contour.edges
	let flip = 'ccw' === options.orientation

	//Clean up the PSLG, resolve self intersections, etc.
	cleanPSLG(positions, edges)

	//If triangulate flag passed, triangulate the result
	if (options.polygons || options.polygon || options.polyline) {
		let result = toPolygonCrappy(edges, positions)
		let nresult = new Array(result.length)
		for (let i = 0; i < result.length; ++i) {
			let loops = result[i]
			let nloops = new Array(loops.length)
			for (let j = 0; j < loops.length; ++j) {
				let loop = loops[j]
				let nloop = new Array(loop.length)
				for (let k = 0; k < loop.length; ++k) {
					nloop[k] = positions[loop[k]].slice()
				}
				if (flip) {
					nloop.reverse()
				}
				nloops[j] = nloop
			}
			nresult[i] = nloops
		}
		return nresult
	} else if (options.triangles || options.triangulate || options.triangle) {
		return {
			cells: cdt2d(positions, edges, {
				delaunay: false,
				exterior: false,
				interior: true,
			}),
			positions: positions,
		}
	} else {
		return {
			edges: edges,
			positions: positions,
		}
	}
}

function processPixels(pixels, options, size) {
	try {
		return processPixelsImpl(pixels, options, size, true)
	} catch (e) {
		console.error(e)
	}
	try {
		return processPixelsImpl(pixels, options, size, false)
	} catch (e) {
		console.error(e)
	}
	if (options.polygons || options.polyline || options.polygon) {
		return []
	}
	if (options.triangles || options.triangulate || options.triangle) {
		return {
			cells: [],
			positions: [],
		}
	}
	return {
		edges: [],
		positions: [],
	}
}

function vectorizeText(str, canvas, context, options) {
	let size = 64
	let lineSpacing = 1.25
	let styletags = {
		breaklines: false,
		bolds: false,
		italics: false,
		subscripts: false,
		superscripts: false,
	}

	if (options) {
		if (options.size && options.size > 0) size = options.size

		if (options.lineSpacing && options.lineSpacing > 0) lineSpacing = options.lineSpacing

		if (options.styletags && options.styletags.breaklines) styletags.breaklines = options.styletags.breaklines ? true : false

		if (options.styletags && options.styletags.bolds) styletags.bolds = options.styletags.bolds ? true : false

		if (options.styletags && options.styletags.italics) styletags.italics = options.styletags.italics ? true : false

		if (options.styletags && options.styletags.subscripts) styletags.subscripts = options.styletags.subscripts ? true : false

		if (options.styletags && options.styletags.superscripts) styletags.superscripts = options.styletags.superscripts ? true : false
	}

	context.font = [options.fontStyle, options.fontVariant, options.fontWeight, size + 'px', options.font]
		.filter(function (d) {
			return d
		})
		.join(' ')
	context.textAlign = 'start'
	context.textBaseline = 'alphabetic'
	context.direction = 'ltr'

	let pixels = getPixels(canvas, context, str, size, lineSpacing, styletags)

	return processPixels(pixels, options, size)
}

export const VText = {
	vectorizeText,
	processPixels,
}
