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
					if (filePath.endsWith('.js')) {
						jsFiles.push(path.basename(filePath))
					} else if (filePath.endsWith('.css')) {
						cssFiles.push(path.basename(filePath))
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
				await fs.writeFile(path.join(options.outdir, 'index.html'), html)
			})
		},
	}
}
