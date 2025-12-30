const esbuild = require('esbuild')
const fs = require('fs-extra')
const path = require('path')
const htmlInject = require('./plugins/htmlInject')
const stylePlugin = require('esbuild-style-plugin')

class BuidlerService {
	constructor(name, optional = {}) {
		this._name = name
		this._ctx = null
		this._startTime = Date.now()
		this._optional = {
			isEnableDevServer: false,
			entryPoints: [],
			outputBasePath: './dist',
			publicPath: './',
			isWriteToDisk: true,
			isHTMLInject: true,
			devServerHost: '127.0.0.1',
			devServerPort: 0,
			devServerFallback: '',
			htmlTemplatePath: '',
			htmlInjetPluginOptional: {},
			...optional,
		}
	}

	async start() {
		try {
			await this._environmentInit()
			const config = await this._createBudilConfig()
			this._ctx = await esbuild.context(config)
			await this._initialBuild()
			await this._setWatching()
			if (this._optional.isEnableDevServer) {
				await this._createServer()
			}
		} catch (error) {
			console.error(`[${this._name}] ❌ [${new Date().toLocaleTimeString()}] 构建服务出错:`, error)
			process.exit(1)
		}
	}

	async _environmentInit() {
		await fs.emptyDir(this._optional.outputBasePath)
		console.log(`[${this._name}] 📁 [${new Date().toLocaleTimeString()}] 输出目录: ${this._optional.outputBasePath} 已就绪.`)
	}

	async _initialBuild() {
		console.log(`[${this._name}] 🚀 [${new Date().toLocaleTimeString()}] 构建服务正在初始化...`)
		await this._ctx.rebuild()
	}

	async _setWatching() {
		await this._ctx.watch()
		console.log(`[${this._name}] 👀 [${new Date().toLocaleTimeString()}] 开始监听文件变化...`)
	}

	async _createBudilConfig() {
		console.log(`[${this._name}] 🚀 [${new Date().toLocaleTimeString()}] 正在初始化配置...`)
		const plugins = []
		if (this._optional.isHTMLInject) {
			plugins.push(htmlInject(this._optional.publicPath, this._optional.htmlTemplatePath, this._optional.htmlInjetPluginOptional))
		}
		plugins.push(
			stylePlugin({
				cssModules: {
					pattern: '[name]__[local]___[hash:base64:5]',
				},
				less: {
					javascriptEnabled: true,
				},
			})
		)
		plugins.push({
			name: `dev-server-plugin`,
			setup: build => {
				build.onEnd(result => {
					this._onBuildEnd(result)
				})
				build.onStart(() => {
					this._startTime = Date.now()
					console.log(`[${this._name}] 🔨 [${new Date().toLocaleTimeString()}] 开始构建...`)
				})
			},
		})
		return {
			entryPoints: this._optional.entryPoints,
			bundle: true,
			outdir: this._optional.outputBasePath,
			format: 'iife',
			platform: 'browser',
			target: 'es2015',
			assetNames: 'assets/[name]-[hash]',
			chunkNames: '[name]-[hash]',
			publicPath: this._optional.publicPath,
			write: this._optional.isWriteToDisk,
			loader: {
				'.ts': 'ts',
				'.tsx': 'tsx',
				'.js': 'jsx',
				'.jsx': 'jsx',
				'.png': 'file',
				'.jpg': 'file',
				'.svg': 'file',
				'.css': 'css',
				'.json': 'json',
			},
			jsx: 'automatic',
			sourcemap: 'linked',
			minify: false,
			metafile: true,
			logLevel: 'info',
			define: {
				'process.env.NODE_ENV': '"development"',
				global: 'window',
			},
			plugins,
		}
	}

	_onBuildEnd(result) {
		const time = new Date().toLocaleTimeString()
		const duration = Date.now() - this._startTime
		if (result.errors.length > 0) {
			console.log(`[${this._name}] ❌ [${time}] 构建失败 | 运行时间: ${duration}ms`)
			result.errors.forEach((error, index) => {
				console.log(`\t\t${index + 1}. ${error.text}`)
			})
		} else {
			const files = Object.keys(result.metafile.outputs)
			const jsFiles = files.filter(f => {
				return f.endsWith('.js')
			})
			const cssFiles = files.filter(f => {
				return f.endsWith('.css')
			})
			console.log(`[${this._name}] ✅ [${time}] 构建成功 | 运行时间: ${duration}ms`)
			console.log(`\t\t📦 JS: ${jsFiles.length} 个, CSS: ${cssFiles.length} 个`)
		}
		this.startTime = Date.now()
	}

	async _createServer() {
		const result = await this._ctx.serve({
			servedir: this._optional.outputBasePath,
			port: this._optional.devServerPort,
			host: this._optional.devServerHost,
			fallback: this._optional.devServerFallback,
		})
		console.log(`[${this._name}] 🌐 [${new Date().toLocaleTimeString()}] 开发服务: http://${result.hosts[0]}:${result.port}`)
	}
}

const bs = new BuidlerService('WebCanvas LIB', {
	isEnableDevServer: false,
	entryPoints: ['./src/index.ts', './src/worker/d2CanvasPixel2Svg/D2CanvasPixel2Svg.ts'],
	outputBasePath: './dist/app',
	publicPath: './',
	isWriteToDisk: true,
	isHTMLInject: true,
	htmlTemplatePath: path.resolve('./template/index.html'),
	htmlInjetPluginOptional: {
		jsFilesFilter(jsFile) {
			return !jsFile.includes('D2CanvasPixel2Svg')
		},
	},
})
bs.start().catch(console.error)
