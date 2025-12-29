async function test1() {
	await flowRead(uuid, {
		update: data => {
			console.log(data)
		},
	})
}
