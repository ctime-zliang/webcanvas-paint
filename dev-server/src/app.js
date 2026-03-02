const koa = require('koa')
const koaCors = require('koa-cors')
const bodyParser = require('koa-bodyparser')
const config = require('./config')
const { execBuildScripts } = require('./script')
const router = require('./router')

const startApp = () => {
	const app = new koa()
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
		await router(ctx, next)
	})
	app.on('error', (error, ctx) => {
		console.log(error, ctx)
	})
	const server = app.listen(config.devServerConfig.port, config.devServerConfig.host, async () => {
		const { address, port } = server.address()
		console.log(`Server Started. http://${address}:${port}`)
		console.log(`Server Started. http://localhost:${port}`)
	})
	execBuildScripts()
	return app
}

module.exports = startApp()
