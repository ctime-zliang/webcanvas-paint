const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const cssLoaderOptions = {
	esModule: false,
	// minimize: false,
	import: true,
	url: true,
	sourceMap: true,
}

const cssLoaderModuleOptions = {
	...cssLoaderOptions,
	modules: {
		mode: 'local',
		localIdentHashSalt: `hash`,
		localIdentHashFunction: `md4`,
		localIdentHashDigest: `base64`,
		localIdentContext: path.resolve(__dirname, `../src`),
		localIdentName: `[name]_-[hash:base64:8]`,
		// exportLocalsConvention: `camelCase`,
		namedExport: false,
	},
}

const lessLoaderOptions = {
	sourceMap: true,
	webpackImporter: true,
	lessOptions(loaderContext) {
		return {
			javascriptEnabled: true,
			strictMath: false,
		}
	},
}

const miniCssExtractPluginLoaderOption = {
	publicPath: `../`,
}

const iniFileLoader = {
	test: /\.ini$/,
	exclude: /node_modules/,
	// include: /src/
	use: [
		{
			loader: `ini-translate-loader`,
			options: {
				loaderTitle: `ini-translate-loader`,
			},
		},
		{
			loader: `ini-parser-loader`,
			options: {
				loaderTitle: `ini-parser-loader`,
			},
		},
	],
}

const jsxEsbuildLoader = {
	test: /\.(js|jsx)$/,
	exclude: /node_modules/,
	loader: 'esbuild-loader',
	options: {
		loader: 'jsx',
		jsxFactory: 'React.createElement',
		jsxFragment: 'React.Fragment',
		tsconfigRaw: require('../tsconfig.json'),
	},
}
const tsxEsbuildLoader = {
	test: /\.(ts|tsx)$/,
	exclude: /node_modules/,
	loader: 'esbuild-loader',
	options: {
		loader: 'tsx',
		jsxFactory: 'React.createElement',
		jsxFragment: 'React.Fragment',
		tsconfigRaw: require('../tsconfig.json'),
	},
}

const lessLoader = {
	test: /\.less$/,
	exclude: /\.module\.less$/,
	use: [
		{
			loader: MiniCssExtractPlugin.loader,
			options: miniCssExtractPluginLoaderOption,
		},
		{
			loader: `css-loader`,
			options: cssLoaderOptions,
		},
		{
			loader: `postcss-loader`,
		},
		{
			loader: `less-loader`,
			options: lessLoaderOptions,
		},
	],
}
const lessModuleLoader = {
	test: /\.module\.less$/,
	use: [
		{
			loader: MiniCssExtractPlugin.loader,
			options: miniCssExtractPluginLoaderOption,
		},
		{
			loader: `css-loader`,
			options: cssLoaderModuleOptions,
		},
		{
			loader: `postcss-loader`,
		},
		{
			loader: `less-loader`,
			options: lessLoaderOptions,
		},
	],
}
const cssLoader = {
	test: /\.css$/,
	exclude: /\.module\.css$/,
	use: [
		{
			loader: MiniCssExtractPlugin.loader,
			options: miniCssExtractPluginLoaderOption,
		},
		{
			loader: `css-loader`,
			options: cssLoaderOptions,
		},
		{
			loader: `postcss-loader`,
		},
		{
			loader: `less-loader`,
			options: lessLoaderOptions,
		},
	],
}
const cssModuleLoader = {
	test: /\.module\.css$/,
	use: [
		{
			loader: MiniCssExtractPlugin.loader,
			options: miniCssExtractPluginLoaderOption,
		},
		{
			loader: `css-loader`,
			options: cssLoaderModuleOptions,
		},
		{
			loader: `postcss-loader`,
		},
	],
}

const urlFileLoader = {
	test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
	// exclude: /node_modules/,
	use: [
		{
			loader: `url-loader`,
			options: {
				name: `[name].[hash:8].[ext]`,
				outputPath: `assets/images/`,
				limit: 1024 * 8,
				esModule: false,
			},
		},
	],
}

const fileLoader = {
	test: /\.(woff|eot|ttf|svg|gif)$/,
	loader: 'url-loader',
	options: {
		limit: 1024 * 8,
		name: `[name].[hash:8].[ext]`,
		esModule: false,
	},
}

module.exports = () => {
	return [
		{
			oneOf: [
				jsxEsbuildLoader,
				tsxEsbuildLoader,
				urlFileLoader,
				lessModuleLoader,
				cssModuleLoader,
				lessLoader,
				cssLoader,
				iniFileLoader,
				fileLoader,
			],
		},
	]
}
