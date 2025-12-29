export async function test1() {
	console.log('start.')
	const ds = await createBroadcastP2PStream('B001')
	const bs = createBufferByteBufferStream(64 * 1024)
	const tes = new TextEncoderStream()
	tes.readable.pipeThrough(bs).pipeTo(ds.ws)
	const wt = tes.writable.getWriter()
	for (let i = 0; i < 1e4; i++) {
		await wt.write(String(Math.random()))
		if (i % 1e4 === 0) {
			console.log('write progress.', i)
		}
	}
	await wt.close()
	console.log('done.')
}

export async function test2() {
	console.log('start.')
	const ds = await createBroadcastP2PStream('A001')
	const rd = ds.rs.getReader()
	let bytes = 0
	while (true) {
		const { value, done } = await rd.read()
		if (value !== undefined) {
			bytes += String(value).length
			console.log(`received: ${value}`)
		}
		if (done) {
			break
		}
	}
	console.log('done.')
}
