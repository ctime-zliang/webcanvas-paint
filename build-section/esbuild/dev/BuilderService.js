const esbuild = require('esbuild')
const fs = require('fs-extra')
const path = require('path')
const htmlInject = require('../plugins/htmlInject')
const stylePlugin = require('esbuild-style-plugin')

module.exports = class BuilderService {
	constructor(name, optional = {}) {
		this._name = name
		this._ctx = null
		this._libCtx = null
		this._startTime = Date.now()
		this._optional = {
			isEnableDevServer: false,
			entryPoints: [],
			workerEntryPoints: [],
			libEntryPoints: [],
			libGlobalName: '',
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
		let libMetafile = null

		// Lib 构建（如果配置了 libEntryPoints）
		if (this._optional.libEntryPoints.length > 0) {
			const libConfig = await this._createLibConfig()
			this._libCtx = await esbuild.context(libConfig)
			console.log(`[${this._name}] 🚀 [${new Date().toLocaleTimeString()}] Lib 构建正在初始化...`)
			const libResult = await this._libCtx.rebuild()
			libMetafile = libResult.metafile
		}

		// 主构建
		const mainConfig = await this._createMainConfig()
		this._ctx = await esbuild.context(mainConfig)
		console.log(`[${this._name}] 🚀 [${new Date().toLocaleTimeString()}] 主构建正在初始化...`)
		const mainResult = await this._ctx.rebuild()

		// 生成 HTML（合并 lib + main 的 metafile）
		if (this._optional.isHTMLInject && libMetafile) {
			await this._generateCombinedHTML(libMetafile, mainResult.metafile)
		}

		// 启动 watch
		if (this._libCtx) {
			await this._libCtx.watch()
			console.log(`[${this._name}] 👀 [${new Date().toLocaleTimeString()}] Lib 构建开始监听文件变化...`)
		}
		await this._ctx.watch()
		console.log(`[${this._name}] 👀 [${new Date().toLocaleTimeString()}] 主构建开始监听文件变化...`)

		// Worker 构建
		if (this._optional.workerEntryPoints.length > 0) {
			const workerConfig = await this._createWorkerConfig()
			this._workerCtx = await esbuild.context(workerConfig)
			console.log(`[${this._name}] 🚀 [${new Date().toLocaleTimeString()}] Worker 构建正在初始化...`)
			await this._workerCtx.rebuild()
			await this._workerCtx.watch()
			console.log(`[${this._name}] 👀 [${new Date().toLocaleTimeString()}] Worker 构建开始监听文件变化...`)
		}
	}

	/**
	 * Lib 构建配置
	 * 将 libEntryPoints 打包为独立 JS 文件，通过 globalName 挂载到全局变量
	 */
	async _createLibConfig() {
		console.log(`[${this._name}] 🚀 [${new Date().toLocaleTimeString()}] 正在初始化 Lib 构建配置...`)
		const outdir = path.resolve(this._optional.outputBasePath, 'assets')

		return {
			entryPoints: this._optional.libEntryPoints,
			bundle: true,
			outdir,
			format: 'iife',
			globalName: this._optional.libGlobalName,
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
			plugins: [
				stylePlugin({
					cssModules: { pattern: '[name]__[local]___[hash:base64:5]' },
					less: { javascriptEnabled: true },
				}),
				{
					name: 'lib-build-reporter',
					setup: build => {
						build.onStart(() => {
							this._startTime = Date.now()
							console.log(`[${this._name}] 🔨 [${new Date().toLocaleTimeString()}] Lib 构建开始...`)
						})
						build.onEnd(result => {
							this._onBuildEnd('Lib 构建', result)
						})
					},
				},
			],
		}
	}

	async _createMainConfig() {
		console.log(`[${this._name}] 🚀 [${new Date().toLocaleTimeString()}] 正在初始化主构建配置...`)
		const outdir = path.resolve(this._optional.outputBasePath, 'assets')
		const plugins = []

		// 当存在 lib 构建时，主构建中拦截对 lib 入口的导入，替换为全局变量引用
		if (this._optional.libEntryPoints.length > 0 && this._optional.libGlobalName) {
			const libGlobalName = this._optional.libGlobalName
			// 解析 lib 入口文件的绝对路径列表，用于匹配
			const libEntryAbsPaths = this._optional.libEntryPoints.map(ep => {
				const entryPath = typeof ep === 'string' ? ep : ep.in
				return path.resolve(entryPath).replace(/\\/g, '/')
			})
			plugins.push({
				name: 'external-lib-global',
				setup(build) {
					build.onResolve({ filter: /.*/ }, args => {
						if (args.kind === 'entry-point') return null
						if (!args.resolveDir) return null
						const resolved = path.resolve(args.resolveDir, args.path).replace(/\\/g, '/')
						// 检查是否匹配 lib 入口路径（带或不带扩展名）
						const matches = libEntryAbsPaths.some(libPath => {
							const libPathNoExt = libPath.replace(/\.[^/.]+$/, '')
							return resolved === libPath || resolved === libPathNoExt
						})
						if (matches) {
							return { path: '__lib_global__', namespace: 'lib-global-ns' }
						}
						return null
					})
					build.onLoad({ filter: /.*/, namespace: 'lib-global-ns' }, () => {
						return {
							contents: `module.exports = ${libGlobalName}`,
							loader: 'js',
						}
					})
				},
			})
		}

		// HTML 注入插件：当没有 lib 构建时使用原始逻辑；有 lib 构建时由 _generateCombinedHTML 处理
		if (this._optional.isHTMLInject && this._optional.libEntryPoints.length === 0) {
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

	/**
	 * 合并 lib 和 main 的 metafile，按 lib → main 的顺序生成 HTML
	 */
	async _generateCombinedHTML(libMetafile, mainMetafile) {
		const outputBasePath = this._optional.outputBasePath
		let html = await fs.readFile(this._optional.htmlTemplatePath, 'utf8')

		const jsFilesFilter = this._optional.htmlInjectPluginOptional.jsFilesFilter || (() => true)
		const cssFilesFilter = this._optional.htmlInjectPluginOptional.cssFilesFilter || (() => true)

		const collectFiles = metafile => {
			const jsFiles = []
			const cssFiles = []
			for (const [filePath] of Object.entries(metafile.outputs)) {
				const relativePath = path.relative(outputBasePath, filePath).replace(/\\/g, '/')
				if (filePath.endsWith('.js') && !filePath.endsWith('.js.map')) {
					jsFiles.push(relativePath)
				} else if (filePath.endsWith('.css') && !filePath.endsWith('.css.map')) {
					cssFiles.push(relativePath)
				}
			}
			return { jsFiles, cssFiles }
		}

		const libFiles = collectFiles(libMetafile)
		const mainFiles = collectFiles(mainMetafile)

		// 顺序：lib CSS → main CSS，lib JS → main JS
		const allCssFiles = [...libFiles.cssFiles, ...mainFiles.cssFiles].filter(cssFilesFilter)
		const allJsFiles = [...libFiles.jsFiles, ...mainFiles.jsFiles].filter(jsFilesFilter)

		const publicPath = this._optional.htmlPublicPath
		const linkTagList = allCssFiles.map(f => `<link rel="stylesheet" href="${publicPath}${f}">`)
		const scriptTagList = allJsFiles.map(f => `<script src="${publicPath}${f}"></script>`)

		if (html.includes('</head>')) {
			html = html.replace('</head>', `  ${linkTagList.join('\n    ')}\n  </head>`)
		}
		if (html.includes('</body>')) {
			html = html.replace('</body>', `  ${scriptTagList.join('\n    ')}\n  </body>`)
		}

		await fs.writeFile(path.join(outputBasePath, 'index.html'), html)
		console.log(`[${this._name}] 📄 [${new Date().toLocaleTimeString()}] HTML 已生成.`)
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
