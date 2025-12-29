const path = require('path')
const { ESBuildMinifyPlugin } = require('esbuild-loader')

module.exports = () => {
	return {
		// minimize: true,
		minimizer: [
			new ESBuildMinifyPlugin({
				target: `es2018`,
				minify: true,
			}),
		],
		moduleIds: `named`,
		sideEffects: true,
		usedExports: true,
		splitChunks: {
			chunks: `all`,
			minSize: 30000,
			automaticNameDelimiter: `.`,
			cacheGroups: {
				default: {
					name: `common`,
					chunks: `all`,
					minChunks: 2,
					priority: -10,
					reuseExistingChunk: true,
				},
				vendors: {
					test: /[\\/]node_modules[\\/]/,
					name: `vendors`,
					chunks: `all`,
					priority: -9,
					reuseExistingChunk: true,
				},
				public: {
					test: path.resolve('./src/assets/style'),
					// test: /\/src\/assets\/style\/*.(css|scss|sass|less)$/,
					name: `style`,
					chunks: `all`,
					priority: -7,
					reuseExistingChunk: true,
					enforce: true,
				},
			},
		},
	}
}
