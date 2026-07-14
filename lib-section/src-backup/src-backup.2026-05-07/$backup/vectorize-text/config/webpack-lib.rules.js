const path = require('path')

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

module.exports = () => {
	return {
		oneOf: [jsxEsbuildLoader, tsxEsbuildLoader],
	}
}
