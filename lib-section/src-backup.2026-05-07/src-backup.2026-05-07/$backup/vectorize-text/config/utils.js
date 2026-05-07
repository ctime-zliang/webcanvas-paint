const fs = require('fs')
const path = require('path')
const chalk = require('chalk')

const ApplicationDirectory = fs.realpathSync(process.cwd())

module.exports = {
	resolveDirectory(relativePath) {
		return path.resolve(ApplicationDirectory, relativePath)
	},
	timeStamp() {
		const d = new Date()
		const arr = [d.getFullYear(), d.getMonth() + 1, d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds()]
		return arr
			.map(item => {
				return item > 9 ? String(item) : '0' + String(item)
			})
			.join('')
	},
	deleteFolderRecursive(directory) {
		const self = this
		let files = []
		try {
			if (fs.existsSync(directory)) {
				files = fs.readdirSync(directory)
				files.forEach((file, index) => {
					const curPath = path.join(directory, file)
					if (fs.statSync(curPath).isDirectory()) {
						self.deleteFolderRecursive(curPath)
					} else {
						fs.unlinkSync(curPath)
					}
				})
				fs.rmdirSync(directory)
			} else {
				throw new Error(`exec deleteFolderRecursive error: path error: ${directory}`)
			}
		} catch (e) {
			console.error(e)
		}
	},
}
