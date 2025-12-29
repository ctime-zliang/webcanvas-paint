const path = require('path')
const { merge } = require('webpack-merge')
const utils = require('./utils')
const webpackPlugins = require('./webpack.plugins')
const webpackInitConfig = require('./webpack-ui.init.config')

const webpackDevConfig = {
	mode: `production`,
	output: {
		path: utils.resolveDirectory(`./dist/app/prod`),
		filename: `scripts/ui.[name].js`,
		chunkFilename: `scripts/chunks.[name].js`,
	},
	plugins: [
		...webpackPlugins({
			mode: `production`,
			htmlTemplateSrc: `./src/app/template/index.ejs`,
			htmlTemplateOutputFilename: `./index.html`,
			buildIndexHtmlTitle: `Canvas App`,
		}),
	],
}

module.exports = merge(webpackDevConfig, webpackInitConfig)
