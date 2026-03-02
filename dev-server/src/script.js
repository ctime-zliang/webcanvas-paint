const path = require('path')
const config = require('./config')
const { execDirectoryPromise, execSpawn } = require('./utils')

exports.execBuildScripts = async function () {
	const projectKeys = Object.keys(config.project)
	for (let i = 0; i < projectKeys.length; i++) {
		const projectItem = config.project[projectKeys[i]]
		const rootPath = projectItem.rootPath
		const script = projectItem.script
		const pathAccessResult = execDirectoryPromise(rootPath)
		if (pathAccessResult.err) {
			console.log(pathAccessResult)
			continue
		}
		execSpawn(projectKeys[i], script)
	}
}
