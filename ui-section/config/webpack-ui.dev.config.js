const path = require('path')
const { merge } = require('webpack-merge')
const utils = require('./utils')
const webpackPlugins = require('./webpack.plugins')
const webpackInitConfig = require('./webpack-ui.init.config')

const webpackDevConfig = {
	mode: `development`,
	output: {
		path: utils.resolveDirectory(`./dist/app/dev`),
		filename: `scripts/ui.[name].js`,
		chunkFilename: `scripts/chunks.[name].js`,
	},
	plugins: [
		...webpackPlugins({
			mode: `development`,
			htmlTemplateSrc: `./src/app/template/index.ejs`,
			htmlTemplateOutputFilename: `./index.html`,
			buildIndexHtmlTitle: `Canvas App`,
		}),
	],
}

module.exports = merge(webpackDevConfig, webpackInitConfig)
