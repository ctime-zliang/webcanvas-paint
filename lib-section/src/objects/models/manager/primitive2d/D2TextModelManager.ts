import { BaseManager } from '../../../../manager/BaseManage'
import { Color } from '../../../../engine/common/Color'
import { D2TextModel } from '../../primitive2d/D2TextModel'
import { ED2FontStyle } from '../../../../engine/config/PrimitiveProfile'
import { TRectSurrounded } from '../../../../engine/types/Primitive'
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
		fontFamily: string = 'auto',
		fontStyle: ED2FontStyle = ED2FontStyle.NORMAL,
		fontSize: number = 10,
		fontWeight: number = 100,
		strokeColor: Color = Color.WHITE,
		alpha: number = 1.0,
		bgColor: Color | null = null!,
		paddingSurrounded: TRectSurrounded = { top: 1, right: 1, bottom: 1, left: 1 },
		rotation: number = 0,
		isFlipX: boolean = false,
		isFlipY: boolean = false
	): D2TextModel {
		const elementModelItem: D2TextModel = new D2TextModel(
			elementItemId,
			layerItemId,
			position,
			content,
			fontFamily,
			fontStyle,
			fontSize,
			fontWeight,
			strokeColor,
			alpha,
			bgColor,
			paddingSurrounded,
			rotation,
			isFlipX,
			isFlipY
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
