const path = require('path')
const BuilderService = require('../../../build-section/esbuild/dev/BuilderService')

const BASE_DIR = '../ui-section'

const bs = new BuilderService('WebCanvas UI', {
	isEnableDevServer: false,
	entryPoints: [{ in: BASE_DIR + '/src/app/index.tsx', out: 'index' }],
	isWriteToDisk: true,
	isHTMLInject: true,
	htmlTemplatePath: path.resolve(BASE_DIR + '/template/index.html'),
})

bs.start().catch(console.error)
