const path = require('path')
const config = require('./config')
const { spawn } = require('child_process')
const { execDirectoryPromise, execSpawn } = require('./utils')

exports.getProjects = function (argv = []) {
	const result = {
		mode: undefined,
		projects: [],
	}
	if (argv.includes(config.DEV_MODE)) {
		const startIndex = argv.indexOf(config.DEV_MODE)
		argv.slice(startIndex + 1).forEach(item => {
			result.projects.push(item)
		})
		result.mode = config.DEV_MODE
		return result
	}
	if (argv.includes(config.PROD_MODE)) {
		const startIndex = argv.indexOf(config.PROD_MODE)
		argv.slice(startIndex + 1).forEach(item => {
			result.projects.push(item)
		})
		result.mode = config.PROD_MODE
		return result
	}
	return result
}

exports.execScripts = async function (projectsResult) {
	if (![config.DEV_MODE, config.PROD_MODE].includes(projectsResult.mode)) {
		return
	}
	const projectItems = config.projects[projectsResult.mode]
	for (let i = 0; i < projectsResult.projects.length; i++) {
		const projectName = projectsResult.projects[i]
		const rootPath = projectItems[projectName].rootPath
		const script = projectItems[projectName].script
		const pathAccessResult = await execDirectoryPromise(rootPath)
		if (pathAccessResult.err) {
			console.log(pathAccessResult)
			continue
		}
		execSpawn(projectName, script)
	}
}
