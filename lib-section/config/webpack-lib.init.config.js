const path = require('path')
const webpack = require('webpack')
const utils = require('./utils')
const rules = require('./webpack-lib.rules')

const webpackLibInitConfig = {
	target: 'web',
	resolve: {
		extensions: ['.js', '.ts', '.tsx', '.jsx'],
	},
	entry: {
		main: utils.resolveDirectory(`./src/index.ts`),
		D2CanvasPixel2Svg: utils.resolveDirectory(`./src/worker/d2CanvasPixel2Svg/D2CanvasPixel2Svg.ts`),
	},
	output: {
		path: utils.resolveDirectory(`./dist/app/script`),
		publicPath: `./script`,
		filename: `[name].js`,
		libraryExport: 'default',
		libraryTarget: 'umd',
		globalObject: 'this',
	},
	module: {
		rules: [rules()],
	},
	resolve: {
		alias: {
			'@': path.resolve('./src/'),
		},
		extensions: ['.js', '.jsx', '.ts', '.tsx', '.json', 'vue'],
		enforceExtension: false,
	},
}

module.exports = webpackLibInitConfig
