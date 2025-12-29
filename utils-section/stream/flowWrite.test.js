async function test1() {
	const channelId = String(Math.random())
	flowWrite(channelId, async writer => {
		const list = ['a', 'b', 'c']
		for (let item of list) {
			writer.write(item)
		}
	})
	await flowRead(uuid, {
		update: data => {
			console.log(data)
		},
	})
}
