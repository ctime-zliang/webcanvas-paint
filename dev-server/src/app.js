const koa = require('koa')
const koaCors = require('koa-cors')
const bodyParser = require('koa-bodyparser')
const config = require('./config')
const { getProjects, execScripts } = require('./script')
const router = require('./router')
const childProcess = require('child_process')

const startApp = () => {
	const app = new koa()
	app.$BUILD_MODE = null
	app.use(
		koaCors({
			origin(ctx) {
				return ctx.header.origin
			},
			exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'],
			credentials: true,
			allowMethods: ['GET', 'POST', 'DELETE'],
			allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
		})
	)
	app.use(bodyParser())
	app.use(async (ctx, next) => {
		if (app.$BUILD_MODE) {
			router(ctx, next, app.$BUILD_MODE)
			return
		}
		await next()
	})
	app.on('error', (error, ctx) => {
		console.log(error, ctx)
	})
	const server = app.listen(config.devServerConfig.port, config.devServerConfig.host, async () => {
		const { address, port } = server.address()
		console.log(`Server Started. http://${address}:${port}`)
		console.log(`Server Started. http://localhost:${port}`)
		setTimeout(() => {
			childProcess.exec(`start http://${address}:${port}/editor`)
		}, 1500)
	})
	const projects = getProjects(process.argv)
	app.$BUILD_MODE = projects.mode
	execScripts(projects)
	return app
}

module.exports = startApp()
