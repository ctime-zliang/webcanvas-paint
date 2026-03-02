const { spawn } = require('child_process')

exports.execDirectoryPromise = function (cmd) {
	try {
		process.chdir(cmd)
		return { err: null, stdout: null, stderr: null }
	} catch (e) {}
	return { err: e, stdout: null, stderr: e }
}

exports.execSpawn = function (tagName, script) {
	const ls = spawn(script, {
		shell: true,
	})
	ls.stdout.on('data', data => {
		console.log(`[${tagName}]: stdout: ${data}`)
	})
	ls.stderr.on('data', data => {
		console.log(`[${tagName}]: stderr: ${data}`)
	})
	ls.on('close', code => {
		console.log(`[${tagName}]: child process exited with code ${code}`)
	})
}
