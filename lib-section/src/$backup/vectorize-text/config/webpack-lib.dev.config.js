const path = require('path')
const { merge } = require('webpack-merge')
const webpackLibInitConfig = require('./webpack-lib.init.config')
const webpackLibPlugins = require('./webpack.plugins')

const webpackConfig = {
	mode: 'development',
	devtool: 'source-map',
	plugins: [
		...webpackLibPlugins({
			mode: `development`,
			htmlTemplateSrc: `./template/index.ejs`,
			htmlTemplateOutputFilename: `../index.html`,
			buildIndexHtmlTitle: `Canvas App`,
		}),
	],
}

module.exports = merge(webpackConfig, webpackLibInitConfig)
