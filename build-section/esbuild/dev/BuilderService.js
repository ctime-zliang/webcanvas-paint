const esbuild = require('esbuild')
const fs = require('fs-extra')
const path = require('path')
const htmlInject = require('../plugins/htmlInject')
const stylePlugin = require('esbuild-style-plugin')

module.exports = class BuilderService {
	constructor(name, optional = {}) {
		this._name = name
		this._ctx = null
		this._startTime = Date.now()
		this._optional = {
			isEnableDevServer: false,
			entryPoints: [],
			workerEntryPoints: [],
			outputBasePath: './dist/app',
			publicPath: './assets/',
			htmlPublicPath: './',
			isWriteToDisk: true,
			isHTMLInject: true,
			devServerHost: '127.0.0.1',
			devServerPort: 0,
			devServerFallback: '',
			htmlTemplatePath: '',
			htmlInjectPluginOptional: {},
			...optional,
		}
	}

	async start() {
		try {
			await this._environmentInit()
			await this._buildAll()
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

	async _buildAll() {
		const mainConfig = await this._createMainConfig()
		this._ctx = await esbuild.context(mainConfig)
		console.log(`[${this._name}] 🚀 [${new Date().toLocaleTimeString()}] 主构建正在初始化...`)
		await this._ctx.rebuild()
		await this._ctx.watch()
		console.log(`[${this._name}] 👀 [${new Date().toLocaleTimeString()}] 主构建开始监听文件变化...`)
		if (this._optional.workerEntryPoints.length > 0) {
			const workerConfig = await this._createWorkerConfig()
			this._workerCtx = await esbuild.context(workerConfig)
			console.log(`[${this._name}] 🚀 [${new Date().toLocaleTimeString()}] Worker 构建正在初始化...`)
			await this._workerCtx.rebuild()
			await this._workerCtx.watch()
			console.log(`[${this._name}] 👀 [${new Date().toLocaleTimeString()}] Worker 构建开始监听文件变化...`)
		}
	}

	async _createMainConfig() {
		console.log(`[${this._name}] 🚀 [${new Date().toLocaleTimeString()}] 正在初始化主构建配置...`)
		const outdir = path.resolve(this._optional.outputBasePath, 'assets')
		const plugins = []
		if (this._optional.isHTMLInject) {
			plugins.push(htmlInject(this._optional.htmlPublicPath, this._optional.htmlTemplatePath, this._optional.htmlInjectPluginOptional))
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
			name: 'main-build-reporter',
			setup: build => {
				build.onStart(() => {
					this._startTime = Date.now()
					console.log(`[${this._name}] 🔨 [${new Date().toLocaleTimeString()}] 主构建开始...`)
				})
				build.onEnd(result => {
					this._onBuildEnd('主构建', result)
				})
			},
		})
		return {
			entryPoints: this._optional.entryPoints,
			bundle: true,
			outdir,
			format: 'iife',
			platform: 'browser',
			target: 'es2015',
			entryNames: '[name]',
			assetNames: '[name]-[hash]',
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
				'.jpeg': 'file',
				'.gif': 'file',
				'.svg': 'file',
				'.webp': 'file',
				'.woff': 'file',
				'.woff2': 'file',
				'.ttf': 'file',
				'.eot': 'file',
				'.mp4': 'file',
				'.webm': 'file',
				'.ogg': 'file',
				'.mp3': 'file',
				'.wav': 'file',
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

	async _createWorkerConfig() {
		console.log(`[${this._name}] 🚀 [${new Date().toLocaleTimeString()}] 正在初始化 Worker 构建配置...`)
		const outdir = path.resolve(this._optional.outputBasePath, 'worker')

		return {
			entryPoints: this._optional.workerEntryPoints,
			bundle: true,
			outdir,
			format: 'iife',
			platform: 'browser',
			target: 'es2015',
			entryNames: '[dir]/[name]',
			write: this._optional.isWriteToDisk,
			loader: {
				'.ts': 'ts',
				'.tsx': 'tsx',
				'.js': 'jsx',
				'.jsx': 'jsx',
				'.json': 'json',
			},
			sourcemap: 'linked',
			minify: false,
			metafile: true,
			logLevel: 'info',
			define: {
				'process.env.NODE_ENV': '"development"',
				global: 'self',
			},
			plugins: [
				{
					name: 'worker-build-reporter',
					setup: build => {
						let workerStartTime = Date.now()
						build.onStart(() => {
							workerStartTime = Date.now()
							console.log(`[${this._name}] 🔨 [${new Date().toLocaleTimeString()}] Worker 构建开始...`)
						})
						build.onEnd(result => {
							this._onBuildEnd('Worker', result, workerStartTime)
						})
					},
				},
			],
		}
	}

	_onBuildEnd(label, result, startTime) {
		const time = new Date().toLocaleTimeString()
		const duration = Date.now() - (startTime || this._startTime)

		if (result.errors.length > 0) {
			console.log(`[${this._name}] ❌ [${time}] ${label}失败 | 运行时间: ${duration}ms`)
			result.errors.forEach((error, index) => {
				console.log(`\t\t${index + 1}. ${error.text}`)
			})
		} else {
			const files = Object.keys(result.metafile.outputs)
			const jsFiles = files.filter(f => f.endsWith('.js'))
			const cssFiles = files.filter(f => f.endsWith('.css'))
			console.log(`[${this._name}] ✅ [${time}] ${label}成功 | 运行时间: ${duration}ms`)
			console.log(`\t\t📦 JS: ${jsFiles.length} 个, CSS: ${cssFiles.length} 个`)
		}
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
