module.exports = {
	devServerConfig: {
		host: '127.0.0.1',
		port: 13001,
	},
	project: {
		'ui-section': {
			rootPath: '..\\ui-section\\',
			script: 'npm run esbuild:dev',
			router: '/editor',
			buildPath: './dist/app',
			indexPath: './index.html',
		},
		'lib-section': {
			rootPath: '..\\lib-section\\',
			script: 'npm run esbuild:dev',
			router: '/canvas',
			buildPath: './dist/app',
			indexPath: './index.html',
		},
	},
}
