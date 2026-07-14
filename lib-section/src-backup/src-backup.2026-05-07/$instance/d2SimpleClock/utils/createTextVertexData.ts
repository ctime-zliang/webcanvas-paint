import { D2TextElementController, D2TextVertexData } from '../../../Main'

export function createTextVertexData(
	d2TextElementController: D2TextElementController,
	fontFamily: string,
	fontSize: number,
	scaleTextVertexs: Array<{
		textContent: string
		d2TextVertexData: D2TextVertexData
	}>
): void {
	const allTexts: Array<string> = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
	for (let i: number = 0; i < allTexts.length; i++) {
		d2TextElementController
			.createD2TextVertexDataItem(allTexts[i], {
				fontFamily,
				fontSize,
			})
			.then((d2TextVertexData: any): void => {
				scaleTextVertexs.push({
					textContent: allTexts[i],
					d2TextVertexData,
				})
			})
	}
}
