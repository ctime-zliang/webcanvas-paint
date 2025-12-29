const path = require('path')
const utils = require('./utils')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const progressBarWebpackPlugin = require('progress-bar-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const ESLintPlugin = require('eslint-webpack-plugin')
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin')
const webpack = require('webpack')
const chalk = require('chalk')

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
		new MiniCssExtractPlugin({
			filename: `assets/styles/style.[name].css`,
			chunkFilename: `assets/styles/chunks.[name].css`,
			ignoreOrder: false,
			attributes: { id: `link${new Date().getTime()}` },
		}),
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': JSON.stringify(mode),
		}),
		// new ESLintPlugin({
		// 	extensions: ['js', 'ts', 'jsx', 'tsx', 'vue'],
		// }),
		// new progressBarWebpackPlugin({
		// 	format: `:msg [:bar] ${chalk.green.bold(':percent')} (:elapsed s)`,
		// }),
		new webpack.HotModuleReplacementPlugin(),
		new ReactRefreshWebpackPlugin(),
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
