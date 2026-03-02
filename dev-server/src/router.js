const path = require('path')
const fs = require('fs')
const config = require('./config')

module.exports = async function (ctx, next) {
	const projectItems = Object.values(config.project)
	let isRequestIndexPage = false
	let rootPath = ''
	let buildPath = ''
	let indexPath = ''
	let matchedRouter = ''
	for (let i = 0; i < projectItems.length; i++) {
		if (projectItems[i].router === ctx.request.path) {
			isRequestIndexPage = true
			rootPath = projectItems[i].rootPath
			buildPath = projectItems[i].buildPath
			indexPath = projectItems[i].indexPath
			matchedRouter = projectItems[i].router
			break
		}
		if (ctx.request.path.startsWith(projectItems[i].router)) {
			isRequestIndexPage = false
			rootPath = projectItems[i].rootPath
			buildPath = projectItems[i].buildPath
			matchedRouter = projectItems[i].router
			break
		}
	}
	if (!matchedRouter) {
		ctx.body = `
            <h3>Node Dev Server Error: Request URL Error.</h3>
            <main>now request url: [${ctx.request.method}]${ctx.request.header.host}/${ctx.request.path}</main>
        `
		await next()
		return
	}
	if (isRequestIndexPage) {
		const fileContent = fs.readFileSync(path.join(rootPath, buildPath, indexPath), 'utf-8')
		const tagString = '<head>'
		const index = fileContent.indexOf('<head>')
		const htmlString =
			fileContent.substring(0, index + tagString.length) +
			`\n<base href="${ctx.request.protocol}://${ctx.request.host}${matchedRouter}/">\n` +
			fileContent.substring(index + tagString.length + 1, fileContent.length - 1)
		ctx.body = htmlString
		await next()
		return
	}
	try {
		const assetsPath = ctx.request.path.substring(matchedRouter.length, ctx.request.path.length)
		const fileType = assetsPath.split('.').pop().toLowerCase()
		const fileContent = fs.readFileSync(path.join(rootPath, buildPath, assetsPath))
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
			case 'pdf': {
				ctx.response.set({
					'Content-Type': `application/pdf`,
				})
				break
			}
			case 'xml': {
				ctx.response.set({
					'Content-Type': `application/xml`,
				})
				break
			}
			case 'zip': {
				ctx.response.set({
					'Content-Type': `application/zip`,
				})
				break
			}
			case 'gzip': {
				ctx.response.set({
					'Content-Type': `application/gzip`,
				})
				break
			}
			case 'dwg': {
				ctx.response.set({
					'Content-Type': `application/x-dwg`,
				})
				break
			}
			case 'jpg':
			case 'jpeg': {
				ctx.response.set({
					'Content-Type': `image/jpeg`,
				})
				break
			}
			case 'png': {
				ctx.response.set({
					'Content-Type': `image/png`,
				})
				break
			}
			case 'gif': {
				ctx.response.set({
					'Content-Type': `image/gif`,
				})
				break
			}
			case 'svg': {
				ctx.response.set({
					'Content-Type': `image/svg+xml`,
				})
				break
			}
			case 'webp': {
				ctx.response.set({
					'Content-Type': `image/webp`,
				})
				break
			}
			case 'mp3': {
				ctx.response.set({
					'Content-Type': `audio/mpeg`,
				})
				break
			}
			case 'wav': {
				ctx.response.set({
					'Content-Type': `audio/wav`,
				})
				break
			}
			case 'ogg': {
				ctx.response.set({
					'Content-Type': `audio/ogg`,
				})
				break
			}
			case 'mp4': {
				ctx.response.set({
					'Content-Type': `video/mp4`,
				})
				break
			}
			case 'mov': {
				ctx.response.set({
					'Content-Type': `video/quicktime`,
				})
				break
			}
			case 'avi': {
				ctx.response.set({
					'Content-Type': `video/x-msvideo`,
				})
				break
			}
			case 'mkv': {
				ctx.response.set({
					'Content-Type': `video/x-matroska`,
				})
				break
			}
			case 'txt': {
				ctx.response.set({
					'Content-Type': `text/plain`,
				})
				break
			}
			case 'html': {
				ctx.response.set({
					'Content-Type': `text/html`,
				})
				break
			}
			case 'ico': {
				ctx.response.set({
					'Content-Type': `image/x-icon`,
				})
				break
			}
			case 'csv': {
				ctx.response.set({
					'Content-Type': `text/csv`,
				})
				break
			}
			case 'md': {
				ctx.response.set({
					'Content-Type': `text/markdown`,
				})
				break
			}
			case 'xls': {
				ctx.response.set({
					'Content-Type': `application/vnd.ms-excel`,
				})
				break
			}
			case 'xlsx': {
				ctx.response.set({
					'Content-Type': `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`,
				})
				break
			}
			case 'doc': {
				ctx.response.set({
					'Content-Type': `application/msword`,
				})
				break
			}
			case 'docx': {
				ctx.response.set({
					'Content-Type': `application/vnd.openxmlformats-officedocument.wordprocessingml.document`,
				})
				break
			}
			case 'ppt': {
				ctx.response.set({
					'Content-Type': `application/vnd.ms-powerpoint`,
				})
				break
			}
			case 'pptx': {
				ctx.response.set({
					'Content-Type': `application/vnd.openxmlformats-officedocument.presentationml.presentation`,
				})
				break
			}
			case 'eot': {
				ctx.response.set({
					'Content-Type': `application/vnd.ms-fontobject`,
				})
				break
			}
			case 'ttf': {
				ctx.response.set({
					'Content-Type': `font/ttf`,
				})
				break
			}
			case 'woff': {
				ctx.response.set({
					'Content-Type': `font/woff`,
				})
				break
			}
			case 'woff2': {
				ctx.response.set({
					'Content-Type': `font/woff2`,
				})
				break
			}
			case 'otf': {
				ctx.response.set({
					'Content-Type': `font/otf`,
				})
				break
			}
			default: {
			}
		}
		ctx.body = fileContent
		await next()
	} catch (e) {
		ctx.body = `
            <h3>Node Dev Server Error: Read File Error.</h3>
            <main>now request url: [${ctx.request.method}]${ctx.request.header.host}/${ctx.request.path}</main>
        `
		await next()
	}
}
