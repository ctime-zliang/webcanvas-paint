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
		main: utils.resolveDirectory(`./src/main.js`),
	},
	output: {
		path: utils.resolveDirectory(`./dist/script`),
		publicPath: `./script`,
		filename: `vtext.js`,
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
