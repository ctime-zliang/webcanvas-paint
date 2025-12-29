module.exports = () => {
	// api
	return {
		/* 在 CSS-in-JS 中启用/禁用 PostCSS Parser 支持 */
		// execute: true,
		sourceMap: true,
		plugins: [
			require('autoprefixer'),
			require('postcss-import'),
			require('postcss-nested'),
			require('postcss-flexbugs-fixes'),
			require('postcss-preset-env'),
			require('postcss-custom-properties'),
			require('postcss-assets'),
			// require('./config/webpack/user-postcss-plugins/postcss-hex-2-rgba'),
		],
	}
}
