const path = require('path')
const fs = require('fs')
const config = require('./config')

module.exports = async function (ctx, next, buildMode) {
	const requestUrl = ctx.request.path
	if (!buildMode) {
		ctx.body = `<h3>Node App: Compile Mode Error.</h3>`
		await next()
		return
	}
	const projects = config.projects[buildMode]
	const projectItems = Object.values(projects)
	let rootPath = ''
	let buildPath = ''
	let indexPath = ''
	let matchedRouter = ''
	let isRequestIndexPage = false
	for (let i = 0; i < projectItems.length; i++) {
		if (projectItems[i].router === requestUrl) {
			isRequestIndexPage = true
			rootPath = projectItems[i].rootPath
			buildPath = projectItems[i].buildPath
			indexPath = projectItems[i].indexPath
			matchedRouter = projectItems[i].router
			break
		}
		if (requestUrl.startsWith(projectItems[i].router)) {
			isRequestIndexPage = false
			rootPath = projectItems[i].rootPath
			buildPath = projectItems[i].buildPath
			matchedRouter = projectItems[i].router
			break
		}
	}
	if (!matchedRouter) {
		ctx.body = `<h3>Node App: Request URL Error.</h3>`
		await next()
		return
	}
	if (isRequestIndexPage) {
		const fileContent = fs.readFileSync(path.join(rootPath, buildPath, indexPath), 'utf-8')
		const tagString = '<head>'
		const index = fileContent.indexOf('<head>')
		const a = fileContent.substring(0, index + tagString.length)
		const b = fileContent.substring(index + tagString.length + 1, fileContent.length - 1)
		const htmlString = a + `\n<base href="${ctx.request.protocol}://${ctx.request.host}${matchedRouter}/">\n` + b
		ctx.body = htmlString
		await next()
		return
	}
	const assetsPath = requestUrl.substring(matchedRouter.length, requestUrl.length)
	const fileType = assetsPath.split('.').pop().toLowerCase()
	try {
		const fileContent = fs.readFileSync(path.join(rootPath, buildPath, assetsPath), 'utf-8')
		switch (fileType) {
			case 'css': {
				ctx.response.set({
					'Content-Type': `text/css`,
				})
				break
			}
			case 'js': {
				ctx.response.set({
					'Content-Type': `application/javascript`,
				})
				break
			}
			case 'json': {
				ctx.response.set({
					'Content-Type': `application/json`,
				})
				break
			}
		}
		ctx.body = fileContent
		await next()
	} catch (e) {
		ctx.body = `<h3>Node App: Read File Error.</h3>`
		await next()
	}
}
