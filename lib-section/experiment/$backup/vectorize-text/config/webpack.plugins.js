const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const { ESBuildPlugin } = require('esbuild-loader')

module.exports = ({ mode, htmlTemplateSrc, htmlTemplateOutputFilename, buildIndexHtmlTitle }) => {
	const plugins = [
		new HtmlWebpackPlugin({
			title: buildIndexHtmlTitle,
			filename: htmlTemplateOutputFilename,
			template: htmlTemplateSrc,
			inject: true,
			hash: false,
			cache: true,
			showErrors: true,
			minify: {
				minifyCSS: true,
				minifyJS: true,
			},
		}),
		new ESBuildPlugin(),
		new webpack.ProgressPlugin(),
	]
	if (mode === 'production') {
		plugins.push(
			new BundleAnalyzerPlugin({
				analyzerPort: 0,
			})
		)
	}
	return plugins
}
