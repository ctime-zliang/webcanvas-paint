const fs = require('fs-extra')
const path = require('path')

module.exports = function (publicPath, templatePath, optional = {}) {
	const jsFilesFilter =
		optional.jsFilesFilter ||
		(jsFile => {
			return true
		})
	const cssFilesFilter =
		optional.cssFilesFilter ||
		(cssFile => {
			return true
		})
	return {
		name: 'html-inject',
		setup(build) {
			const options = build.initialOptions
			build.onEnd(async result => {
				if (result.errors.length > 0) {
					return
				}
				let html = await fs.readFile(templatePath, 'utf8')
				const outputFiles = result.metafile?.outputs || {}
				const jsFiles = []
				const cssFiles = []
				for (const [filePath, info] of Object.entries(outputFiles)) {
					const relativePath = path.relative(path.resolve(options.outdir, '..'), filePath).replace(/\\/g, '/')
					if (filePath.endsWith('.js') && !filePath.endsWith('.js.map')) {
						jsFiles.push(relativePath)
					} else if (filePath.endsWith('.css') && !filePath.endsWith('.css.map')) {
						cssFiles.push(relativePath)
					}
				}
				const linkTagList = []
				for (let i = 0; i < cssFiles.length; i++) {
					if (cssFilesFilter(cssFiles[i])) {
						linkTagList.push(`<link rel="stylesheet" href="${publicPath}${cssFiles[i]}">`)
					}
				}
				const scriptTagList = []
				for (let i = 0; i < jsFiles.length; i++) {
					if (jsFilesFilter(jsFiles[i])) {
						scriptTagList.push(`<script src="${publicPath}${jsFiles[i]}"></script>`)
					}
				}
				if (html.includes('</head>')) {
					html = html.replace('</head>', `  ${linkTagList.join('\n    ')}\n  </head>`)
				}
				if (html.includes('</body>')) {
					html = html.replace('</body>', `  ${scriptTagList.join('\n    ')}\n  </body>`)
				}
				const htmlOutDir = path.resolve(options.outdir, '..')
				await fs.writeFile(path.join(htmlOutDir, 'index.html'), html)
			})
		},
	}
}
