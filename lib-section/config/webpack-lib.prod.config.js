const path = require('path')
const { merge } = require('webpack-merge')
const webpackLibInitConfig = require('./webpack-lib.init.config')
const webpackLibPlugins = require('./webpack.plugins')

const webpackConfig = {
	mode: 'production',
	devtool: 'source-map',
	plugins: [
		...webpackLibPlugins({
			mode: `production`,
			htmlTemplateSrc: `./template/index.ejs`,
			htmlTemplateOutputFilename: `../index.html`,
			buildIndexHtmlTitle: `Canvas App`,
		}),
	],
}

module.exports = merge(webpackConfig, webpackLibInitConfig)
