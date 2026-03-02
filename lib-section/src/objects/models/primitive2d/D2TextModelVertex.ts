import { ED2ElementType } from '../../../config/D2ElementProfile'
import { BBox2 } from '../../../engine/algorithm/geometry/bbox/BBox2'
import { Vector2 } from '../../../engine/algorithm/geometry/vector/Vector2'
import { ED2FontStyle } from '../../../engine/config/PrimitiveProfile'
import { TFontTriangleVertexData } from '../../../manager/TextGraphicsManager'
import { POINT_ARRAY_OCCUPY_SIZE } from '../../../service/TextFontService'
import { D2ElementModelItemBase } from './elementBase/D2ElementModelItemBase'

export class D2TextModelVertex extends D2ElementModelItemBase {
	private _contentReady: boolean
	private _vertexData: {
		indices: Array<number>
		positions: Array<number>
	}
	private _content: string
	private _fontSize: number
	private _fontFamily: string
	private _fontStyle: ED2FontStyle
	private _fontWeight: number
	constructor(
		content: string,
		fontSize: number = 10,
		fontFamily: string = 'auto',
		fontStyle: ED2FontStyle = ED2FontStyle.NORMAL,
		fontWeight: number = 100
	) {
		super(undefined!, undefined!)
		this._contentReady = false
		this._vertexData = {
			indices: [],
			positions: [],
		}
		this._content = content
		this._fontSize = fontSize
		this._fontFamily = fontFamily
		this._fontStyle = fontStyle
		this._fontWeight = fontWeight
		this.modelType = ED2ElementType.D2Text
		this.bbox2 = new BBox2(0, 0, 0, 0)
	}

	public get contentReady(): boolean {
		return this._contentReady
	}
	public set contentReady(value: boolean) {
		this._contentReady = value
	}

	public get fontSize(): number {
		return this._fontSize
	}
	public set fontSize(value: number) {
		this._fontSize = value
	}

	public get fontFamily(): string {
		return this._fontFamily
	}
	public set fontFamily(value: string) {
		this._fontFamily = value
	}

	public get fontStyle(): ED2FontStyle {
		return this._fontStyle
	}
	public set fontStyle(value: ED2FontStyle) {
		this._fontStyle = value
	}

	public get fontWeight(): number {
		return this._fontWeight
	}
	public set fontWeight(value: number) {
		this._fontWeight = value
	}

	public get content(): string {
		return this._content
	}

	public getBBox2(): BBox2 {
		return this.bbox2
	}

	public updatePosition(value: Vector2): void {}

	public updateRotation(value: number): void {}

	public updateIsFlipX(value: boolean): void {}

	public updateIsFlipY(value: boolean): void {}

	public updateBBox2(): BBox2 {
		return this.bbox2
	}

	public isInGraphical(x: number, y: number): boolean {
		return false
	}

	public updateContent(content: string): void {
		this.contentReady = false
		this._content = content
		this._vertexData = {
			indices: [],
			positions: [],
		}
	}

	public getVertexData(): {
		indices: Array<number>
		positions: Array<number>
	} {
		return this._vertexData
	}

	public updateVertexData(vertexDataArray: Array<Array<TFontTriangleVertexData>>): void {
		const allIndices: Array<number> = []
		const allPositions: Array<number> = []
		let addtionOffsets: Array<number> = []
		let addtionCounter: number = 0
		for (let rowIndex: number = 0; rowIndex < vertexDataArray.length; rowIndex++) {
			for (let colIndex: number = 0; colIndex < vertexDataArray[rowIndex].length; colIndex++) {
				const { positions, indices } = vertexDataArray[rowIndex][colIndex]
				addtionOffsets.push(positions.length / POINT_ARRAY_OCCUPY_SIZE)
				for (let k: number = 0; k < positions.length; k++) {
					allPositions.push(positions[k])
				}
				if (rowIndex <= 0 && colIndex <= 0) {
					for (let k: number = 0; k < indices.length; k++) {
						allIndices.push(indices[k])
					}
				} else {
					addtionCounter += addtionOffsets[addtionOffsets.length - 2]
					for (let k: number = 0; k < indices.length; k++) {
						allIndices.push(indices[k] + addtionCounter)
					}
				}
			}
		}
		this._vertexData.indices = allIndices
		this._vertexData.positions = allPositions
	}
}
