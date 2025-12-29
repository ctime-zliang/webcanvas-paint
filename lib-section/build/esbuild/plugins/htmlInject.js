const fs = require('fs-extra')
const path = require('path')

module.exports = function () {
	return {
		name: 'html-inject',
		setup(build) {
			const options = build.initialOptions
			build.onEnd(async result => {
				if (result.errors.length > 0) {
					return
				}
				const templatePath = path.resolve('./template/index.html')
				let html = await fs.readFile(templatePath, 'utf8')
				console.log(options.outdir)
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
				const scriptTags = jsFiles
					.filter(jsFile => !jsFile.includes('D2CanvasPixel2Svg'))
					.map(jsFile => `<script src="./${jsFile}"></script>`)
					.join('\n    ')
				const linkTags = cssFiles.map(cssFile => `<link rel="stylesheet" href="./${cssFile}">`).join('\n    ')
				if (html.includes('</head>')) {
					html = html.replace('</head>', `  ${linkTags}\n  </head>`)
				}
				if (html.includes('</body>')) {
					html = html.replace('</body>', `  ${scriptTags}\n  </body>`)
				}
				await fs.writeFile(path.join(options.outdir, 'index.html'), html)
			})
		},
	}
}
