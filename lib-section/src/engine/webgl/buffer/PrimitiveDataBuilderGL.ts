import { BitmapIndex } from '../../common/BitmapIndex'
import { PtType, PtTypes } from '../primitives/PrimitiveGL'
import { DataBufferGL } from './DataBufferGL'
import { BufferBuilderGL } from './BufferBuilderGL'
import { WebGL } from '../WebGL'

export interface PrimitiveBlock {
	isChanged: boolean
	isEnableIndices: boolean
	texture: WebGLTexture
	readonly blockSize: number
	readonly ptIdsBuilder: BufferBuilderGL<Float32Array>
	readonly ptDatasRecordBuilder: BufferBuilderGL<Float32Array>
	readonly ptDatasBuilder: BufferBuilderGL<Float32Array>
	readonly indicesBuilder: BufferBuilderGL<Uint16Array>
}

const MAX_DYNAMIC_PT_NUM: number = 3

const PRIMITIVE_BLOCK_PTTYPE_MAXNUM = {
	[PtType.D2_ARC]: MAX_DYNAMIC_PT_NUM,
	[PtType.D2_CIRCLE]: MAX_DYNAMIC_PT_NUM,
	[PtType.D2_IMAGE]: 1,
	[PtType.D2_LINE]: MAX_DYNAMIC_PT_NUM,
	[PtType.D2_POINT]: MAX_DYNAMIC_PT_NUM,
	[PtType.D2_TEXT]: 1,
}

export class PrimitiveDataBuilderGL {
	private _webGL: WebGL
	private _pmBitMapIndex: Map<PtType, BitmapIndex>
	private _pmBlocks: Map<PtType, Array<PrimitiveBlock>>
	private _pmBlockIndex: Map<PtType, number>
	constructor(webGL: WebGL) {
		this._webGL = webGL
		this._pmBitMapIndex = new Map()
		this._pmBlocks = new Map()
		this._pmBlockIndex = new Map()
		this.initPtTypeBlocks()
	}

	public getPmBlocks(): Map<PtType, Array<PrimitiveBlock>> {
		return this._pmBlocks
	}

	private initPtTypeBlocks(): void {
		for (let i: number = 0; i < PtTypes.length; i++) {
			this._pmBitMapIndex.set(PtTypes[i], new BitmapIndex(PRIMITIVE_BLOCK_PTTYPE_MAXNUM[PtTypes[i]]))
			this._pmBlocks.set(PtTypes[i], [this.initBlock(PtTypes[i])])
			this._pmBlockIndex.set(PtTypes[i], 0)
		}
	}

	public updateBlockTexture(blockItem: PrimitiveBlock, texture: WebGLTexture): void {
		blockItem.texture = texture
	}

	public update(blockItem: PrimitiveBlock): void {
		if (blockItem.isChanged) {
			blockItem.ptDatasBuilder.update()
			if (blockItem.isEnableIndices) {
				blockItem.indicesBuilder.update()
			}
		}
		blockItem.isChanged = false
	}

	public addPrimitiveItem(ptType: PtType, ptData: Float32Array, indices?: Uint16Array): { globalIndex: number; blockItem: PrimitiveBlock } {
		if (!this._pmBitMapIndex.has(ptType)) {
			throw new Error('illegal primitive type.')
		}
		let bitMapIndex: BitmapIndex = this._pmBitMapIndex.get(ptType)!
		let globalIndex: number = bitMapIndex.findEmpty()
		const needExtIndexMap: boolean = globalIndex === -1
		if (needExtIndexMap) {
			bitMapIndex = bitMapIndex.extendSize(bitMapIndex.size * 2)
			this._pmBitMapIndex.set(ptType, bitMapIndex)
			globalIndex = bitMapIndex.findEmpty()
		}
		bitMapIndex.markUsed(globalIndex)
		const blockItem: PrimitiveBlock = this.insertPtItem(ptType, globalIndex, ptData, indices)
		return { globalIndex, blockItem }
	}

	public updatePrimitiveItem(ptType: PtType, globalIndex: number, ptData: Float32Array, indices?: Uint16Array): PrimitiveBlock {
		const blockIndex: number = Math.floor(globalIndex / PRIMITIVE_BLOCK_PTTYPE_MAXNUM[ptType])
		const localIndex: number = globalIndex % PRIMITIVE_BLOCK_PTTYPE_MAXNUM[ptType]
		const blocks: Array<PrimitiveBlock> = this._pmBlocks.get(ptType)!
		if (!blocks || !blocks[blockIndex]) {
			throw new Error('illegal primitive pt_type.')
		}
		const blockItem: PrimitiveBlock = blocks[blockIndex]
		const stretchResult: {
			nowStartIndex: number
			nextStartIndex: number
		} = this.stretchBuffer(blockItem, localIndex, ptData, false)
		if (typeof indices !== 'undefined') {
			blockItem.indicesBuilder.setArrByIndex(stretchResult.nowStartIndex, indices)
		}
		blockItem.isChanged = true
		return blockItem
	}

	public deletePrimitiveItem(ptType: PtType, globalIndex: number): PrimitiveBlock {
		const blockIndex: number = Math.floor(globalIndex / PRIMITIVE_BLOCK_PTTYPE_MAXNUM[ptType])
		const localIndex: number = globalIndex % PRIMITIVE_BLOCK_PTTYPE_MAXNUM[ptType]
		const blocks: Array<PrimitiveBlock> = this._pmBlocks.get(ptType)!
		if (!blocks || !blocks[blockIndex]) {
			throw new Error('illegal primitive pt_type.')
		}
		const blockItem: PrimitiveBlock = blocks[blockIndex]
		const bitMapIndex: BitmapIndex = this._pmBitMapIndex.get(ptType)!
		bitMapIndex.markRemove(globalIndex)
		blockItem.ptIdsBuilder.setValueByIndex(localIndex, 0)
		const nowStartIndex: number = blockItem.ptDatasRecordBuilder.getItemByIndex(localIndex * 2)
		const nextStartSize: number = blockItem.ptDatasRecordBuilder.getItemByIndex(localIndex * 2 + 1)
		blockItem.ptDatasRecordBuilder.setValueByIndex(localIndex * 2, 0)
		blockItem.ptDatasRecordBuilder.setValueByIndex(localIndex * 2 + 1, 0)
		blockItem.ptDatasBuilder.setArrByIndex(nowStartIndex, new blockItem.ptDatasBuilder.arrayConstructor(nextStartSize))
		/**
		 * 关于 indicesBuilder 的处理, 后续优化
		 * 		需要依据起始索引和索引长度, 清理索引数据
		 */
		const indicesUpperItemIndex: number = blockItem.indicesBuilder.getUpperItemIndex()
		if (indicesUpperItemIndex >= 0) {
			blockItem.indicesBuilder.clearArr()
		}
		this.arrangeBuffer(ptType, blockItem)
		blockItem.isChanged = true
		return blockItem
	}

	public clearAll(): void {
		for (let [ptType, blocks] of this._pmBlocks) {
			for (let i: number = 0; i < blocks.length; i++) {
				const blockItem: PrimitiveBlock = blocks[i]
				blockItem.ptIdsBuilder.clearArr()
				blockItem.ptDatasBuilder.clearArr()
				blockItem.indicesBuilder.clearArr()
				blockItem.ptDatasBuilder.update()
				blockItem.indicesBuilder.update()
			}
		}
		this._pmBlocks.clear()
		this._pmBitMapIndex.clear()
		this._pmBlockIndex.clear()
	}

	private insertPtItem(ptType: PtType, globalIndex: number, ptData: Float32Array, indices?: Uint16Array): PrimitiveBlock {
		const blockIndex: number = Math.floor(globalIndex / PRIMITIVE_BLOCK_PTTYPE_MAXNUM[ptType])
		const localIndex: number = globalIndex % PRIMITIVE_BLOCK_PTTYPE_MAXNUM[ptType]
		const blocks: Array<PrimitiveBlock> = this._pmBlocks.get(ptType)!
		if (!blocks[blockIndex]) {
			blocks.push(this.initBlock(ptType))
		}
		const blockItem: PrimitiveBlock = blocks[blockIndex]
		blockItem.isEnableIndices = ptType === PtType.D2_TEXT
		/* ... */
		if (localIndex === blockItem.ptIdsBuilder.arrItemSize) {
			blockItem.ptIdsBuilder.setValueByIndex(blockItem.ptIdsBuilder.getUpperItemIndex() + 1, globalIndex)
			blockItem.ptDatasRecordBuilder.setValueByIndex(
				blockItem.ptDatasRecordBuilder.getUpperItemIndex() + 1,
				blockItem.ptDatasBuilder.arrItemSize
			)
			blockItem.ptDatasRecordBuilder.setValueByIndex(blockItem.ptDatasRecordBuilder.getUpperItemIndex() + 1, ptData.length)
			blockItem.ptDatasBuilder.setArrByIndex(blockItem.ptDatasBuilder.getUpperItemIndex() + 1, ptData)
			if (typeof indices !== 'undefined') {
				blockItem.indicesBuilder.setArrByIndex(blockItem.indicesBuilder.getUpperItemIndex() + 1, indices)
			}
		} else {
			blockItem.ptIdsBuilder.setValueByIndex(localIndex, globalIndex)
			const stretchResult: {
				nowStartIndex: number
				nextStartIndex: number
			} = this.stretchBuffer(blockItem, localIndex, ptData, true)
		}
		this._pmBlocks.set(ptType, blocks)
		this._pmBlockIndex.set(ptType, blockIndex)
		blockItem.isChanged = true
		return blockItem
	}

	private stretchBuffer(
		blockItem: PrimitiveBlock,
		localIndex: number,
		ptData: Float32Array,
		isInsert: boolean
	): {
		nowStartIndex: number
		nextStartIndex: number
	} {
		const nowUseSize: number = ptData.length
		const nextStartIndex: number = blockItem.ptDatasRecordBuilder.getItemByIndex((localIndex + 1) * 2)
		let nowStartIndex: number = 0
		if (localIndex === 0) {
			nowStartIndex = 0
		} else {
			nowStartIndex =
				blockItem.ptDatasRecordBuilder.getItemByIndex((localIndex - 1) * 2) +
				blockItem.ptDatasRecordBuilder.getItemByIndex((localIndex - 1) * 2 + 1)
		}
		if (typeof nextStartIndex !== 'undefined' && nextStartIndex > nowStartIndex && nowUseSize > nextStartIndex - nowStartIndex) {
			const stretchSize: number = blockItem.ptDatasBuilder.stretchArr(nowStartIndex, nextStartIndex, nowUseSize)
			blockItem.ptDatasRecordBuilder.setValueByIndex(localIndex * 2, nowStartIndex)
			blockItem.ptDatasRecordBuilder.setValueByIndex(localIndex * 2 + 1, nowUseSize)
			const usedStartSize: number = blockItem.ptDatasRecordBuilder.arrItemSize
			for (let i: number = nextStartIndex; i < usedStartSize; i += 2) {
				blockItem.ptDatasRecordBuilder.setValueByIndex(i, blockItem.ptDatasRecordBuilder.getItemByIndex(i) + stretchSize)
			}
		} else {
			if (isInsert) {
				blockItem.ptDatasRecordBuilder.setValueByIndex(localIndex * 2, nowStartIndex)
				blockItem.ptDatasRecordBuilder.setValueByIndex(localIndex * 2 + 1, nowUseSize)
			}
		}
		blockItem.ptDatasBuilder.setArrByIndex(nowStartIndex, ptData)
		return {
			nowStartIndex,
			nextStartIndex,
		}
	}

	private arrangeBuffer(ptType: PtType, blockItem: PrimitiveBlock): void {
		let idsUpperIndex: number = blockItem.ptIdsBuilder.getUpperItemIndex()
		let ptsUpperIndex: number = -2
		while (idsUpperIndex >= 0) {
			const globalIndex: number = blockItem.ptIdsBuilder.getItemByIndex(idsUpperIndex)
			if (idsUpperIndex === 0) {
				const nowPtSize: number = blockItem.ptDatasRecordBuilder.getItemByIndex(1)
				if (nowPtSize <= 0) {
					ptsUpperIndex = -1
					blockItem.ptIdsBuilder.setUpperItemIndex(-1)
					blockItem.ptDatasRecordBuilder.setUpperItemIndex(-1)
					break
				}
				ptsUpperIndex = nowPtSize - 1
				blockItem.ptIdsBuilder.setUpperItemIndex(0)
				blockItem.ptDatasRecordBuilder.setUpperItemIndex(1)
				break
			}
			const localIndex: number = globalIndex % PRIMITIVE_BLOCK_PTTYPE_MAXNUM[ptType]
			if (localIndex <= 0) {
				blockItem.ptIdsBuilder.setUpperItemIndex(blockItem.ptIdsBuilder.getUpperItemIndex() - 1)
				blockItem.ptDatasRecordBuilder.setUpperItemIndex(blockItem.ptDatasRecordBuilder.getUpperItemIndex() - 2)
				idsUpperIndex--
				continue
			}
			ptsUpperIndex =
				blockItem.ptDatasRecordBuilder.getItemByIndex(localIndex * 2) + blockItem.ptDatasRecordBuilder.getItemByIndex(localIndex * 2 + 1) - 1
			break
		}
		if (ptsUpperIndex >= -1) {
			blockItem.ptDatasBuilder.setUpperItemIndex(ptsUpperIndex)
		}
	}

	private initBlock(ptType: PtType): PrimitiveBlock {
		const arrSize1: number = PRIMITIVE_BLOCK_PTTYPE_MAXNUM[ptType]
		const arrSize2: number = PRIMITIVE_BLOCK_PTTYPE_MAXNUM[ptType] * 2
		const arrSize3: number = PRIMITIVE_BLOCK_PTTYPE_MAXNUM[ptType] * 30
		const blockItem: PrimitiveBlock = {
			isChanged: true,
			isEnableIndices: false,
			blockSize: PRIMITIVE_BLOCK_PTTYPE_MAXNUM[ptType],
			texture: null!,
			ptIdsBuilder: new BufferBuilderGL(
				Float32Array,
				new DataBufferGL(this._webGL, arrSize1, 'ARRAY_BUFFER', this._webGL.gl.STATIC_DRAW),
				new Float32Array(arrSize1),
				arrSize1
			),
			indicesBuilder: new BufferBuilderGL(
				Uint16Array,
				new DataBufferGL(this._webGL, arrSize3, 'ELEMENT_ARRAY_BUFFER', this._webGL.gl.STATIC_DRAW),
				new Uint16Array(arrSize3),
				arrSize3
			),
			ptDatasRecordBuilder: new BufferBuilderGL(
				Float32Array,
				new DataBufferGL(this._webGL, arrSize2, 'ARRAY_BUFFER', this._webGL.gl.STATIC_DRAW),
				new Float32Array(arrSize2),
				arrSize2
			),
			ptDatasBuilder: new BufferBuilderGL(
				Float32Array,
				new DataBufferGL(this._webGL, arrSize3, 'ARRAY_BUFFER', this._webGL.gl.STATIC_DRAW),
				new Float32Array(arrSize3),
				arrSize3
			),
		}
		return blockItem
	}
}
