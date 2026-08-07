import { BaseManager } from '../../../../manager/BaseManage'
import {
	D2TextModel,
	TBuildD2TextModelOptionalStyleSettingParam,
	TBuildD2TextModelOptionalParam,
	createD2TextModelStyleDefaultSetting,
	DEFAULT_FONT_SIZE,
	createBuildD2TextModelOptionalParam,
} from '../../primitive2d/D2TextModel'
import { Vector2 } from '../../../../engine/algorithm/geometry/vector/Vector2'

export class D2TextModelManager extends BaseManager<D2TextModel> {
	private static instance: D2TextModelManager
	public static getInstance(): D2TextModelManager {
		if (D2TextModelManager.instance === undefined) {
			D2TextModelManager.instance = new D2TextModelManager()
		}
		return D2TextModelManager.instance
	}

	constructor() {
		super()
	}

	public createModelItem(
		elementItemId: string,
		layerItemId: string,
		position: Vector2,
		content: string,
		optional: Partial<TBuildD2TextModelOptionalParam> & Partial<{ styleSetting: TBuildD2TextModelOptionalStyleSettingParam }> = {}
	): D2TextModel {
		const fontSize: number = optional.fontSize || DEFAULT_FONT_SIZE
		const styleSetting: TBuildD2TextModelOptionalStyleSettingParam = {
			...createD2TextModelStyleDefaultSetting(fontSize),
			...(optional.styleSetting || {}),
		}
		const locSetting: TBuildD2TextModelOptionalParam & Partial<{ styleSetting: TBuildD2TextModelOptionalStyleSettingParam }> = createBuildD2TextModelOptionalParam(optional, fontSize, styleSetting)
		const elementModelItem: D2TextModel = new D2TextModel(
			elementItemId,
			layerItemId,
			position,
			content,
			locSetting.fontFamily,
			locSetting.fontStyle,
			locSetting.fontSize,
			locSetting.fontWeight,
			locSetting.strokeColor,
			locSetting.alpha,
			locSetting.styleSetting,
			locSetting.rotation,
			false,
			false,
			locSetting.isEnableSelect
		)
		this.items.set(elementModelItem.elementItemId, elementModelItem)
		return elementModelItem
	}

	public deleteModelItem(elementItemId: string): void {
		const elementModelItem: D2TextModel = this.items.get(elementItemId)!
		if (!elementModelItem) {
			return
		}
		this.items.delete(elementModelItem.elementItemId)
	}

	public quit(): void {
		super.quit()
		D2TextModelManager.instance = undefined!
	}
}
