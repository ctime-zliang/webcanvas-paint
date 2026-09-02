const path = require('path')
const BuilderService = require('../../../build-section/esbuild/dev/BuilderService')

const BASE_DIR = '../lib-section'

const bs = new BuilderService('WebCanvas LIB', {
	isEnableDevServer: false,
	libEntryPoints: [{ in: BASE_DIR + '/src/Main.ts', out: 'canvas-lib' }],
	libGlobalName: 'WebCanvasLib',
	entryPoints: [{ in: BASE_DIR + '/experiment/index.ts', out: 'index' }],
	workerEntryPoints: [
		{
			in: BASE_DIR + '/src/worker/d2CanvasPixel2Svg/D2CanvasPixel2Svg.ts',
			out: 'd2CanvasPixel2Svg/D2CanvasPixel2Svg',
		},
	],
	isWriteToDisk: true,
	isHTMLInject: true,
	htmlTemplatePath: path.resolve(BASE_DIR + '/template/index.html'),
	htmlInjectPluginOptional: {
		jsFilesFilter(jsFile) {
			return !jsFile.includes('D2CanvasPixel2Svg')
		},
	},
})

bs.start().catch(console.error)
