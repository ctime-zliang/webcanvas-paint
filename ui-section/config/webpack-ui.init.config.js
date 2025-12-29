const path = require('path')
const utils = require('./utils')
const webpackRules = require('./webpack.rules')
const webpackStats = require('./webpack.stats')
const webpackOptimization = require('./webpack.optimization')

const webpackBaseConfig = {
	name: `app`,
	target: `web`,
	cache: {
		type: `filesystem`,
	},
	entry: {
		main: utils.resolveDirectory(`./src/app/index.tsx`),
	},
	module: {
		rules: webpackRules(),
	},
	resolve: {
		alias: {
			'@': path.resolve('./src/'),
		},
		extensions: ['.js', '.jsx', '.ts', '.tsx', '.json', 'vue'],
		enforceExtension: false,
	},
	performance: {
		hints: `warning`,
		maxAssetSize: 40000000,
		maxEntrypointSize: 60000000,
	},
	optimization: webpackOptimization(),
	stats: webpackStats(),
}

module.exports = webpackBaseConfig
