import { Camera } from '../common/Camera'
import { Matrix4 } from '../algorithm/geometry/matrix/Matrix4'
import { Plane } from '../common/Plane'
import {
	TElementD2LineJSONData,
	TElementD2ArcJSONData,
	TElementD2CircleJSONData,
	TElementD2ImageJSONData,
	TElementD2PointJSONData,
	TElementD2TextJSONData,
} from '../types/Primitive'
import { PrimitiveBlock, PrimitiveDataBuilderGL } from './buffer/PrimitiveDataBuilderGL'
import { D2ArcDataGL } from './primitives/d2Arc/D2ArcDataGL'
import { D2CircleDataGL } from './primitives/d2Circle/D2CircleDataGL'
import { D2ImageDataGL } from './primitives/d2Image/D2ImageDataGL'
import { D2LineDataGL } from './primitives/d2Line/D2LineDataGL'
import { D2PointDataGL } from './primitives/d2Point/D2PointDataGL'
import { D2TextDataGL } from './primitives/d2Text/D2TextDataGL'
import { PtType } from './primitives/PrimitiveGL'
import { PrimitiveProgramBuilderGL } from './program/PrimitiveProgramBuilderGL'
import { SceneGL } from './SceneGL'

export class PlaneGL extends Plane {
	private _sceneGL: SceneGL
	private _dataBuilder: PrimitiveDataBuilderGL
	private _programBuilder: PrimitiveProgramBuilderGL
	private _elementsMap: Map<string, { ptType: PtType; globalIndex: number }>
	constructor(planeId: string, sceneGL: SceneGL) {
		super(planeId, sceneGL)
		this._sceneGL = sceneGL
		this._dataBuilder = new PrimitiveDataBuilderGL(this._sceneGL.renderer)
		this._programBuilder = new PrimitiveProgramBuilderGL(this._sceneGL.renderer)
		this._elementsMap = new Map()
	}

	public getScene(): SceneGL {
		return this.scene as SceneGL
	}

	public deleteD2ArcItems(targetIds: Set<string>): void {
		const arrTargetIds: Array<string> = Array.from(targetIds)
		for (let i: number = 0; i < arrTargetIds.length; i++) {
			const { ptType, globalIndex } = this._elementsMap.get(arrTargetIds[i])!
			const blockItem: PrimitiveBlock = this.deletePrimitiveItem(ptType, globalIndex)
			this._elementsMap.delete(arrTargetIds[i])
		}
	}
	public addD2ArcItems(targetPrimitives: Map<string, TElementD2ArcJSONData>): void {
		for (let [key, primitiveItemValueData] of targetPrimitives) {
			const { globalIndex, blockItem } = this.addPrimitiveItem(PtType.D2_ARC, D2ArcDataGL.createArrayData(primitiveItemValueData))
			this._elementsMap.set(key, { ptType: PtType.D2_ARC, globalIndex })
		}
	}
	public updateD2ArcItems(targetPrimitives: Map<string, TElementD2ArcJSONData>): void {
		for (let [key, primitiveItemValueData] of targetPrimitives) {
			const { ptType, globalIndex } = this._elementsMap.get(key)!
			const blockItem: PrimitiveBlock = this.updatePrimitiveItem(ptType, globalIndex, D2ArcDataGL.createArrayData(primitiveItemValueData))
		}
	}

	public deleteD2CircleItems(targetIds: Set<string>): void {
		const arrTargetIds: Array<string> = Array.from(targetIds)
		for (let i: number = 0; i < arrTargetIds.length; i++) {
			const { ptType, globalIndex } = this._elementsMap.get(arrTargetIds[i])!
			const blockItem: PrimitiveBlock = this.deletePrimitiveItem(ptType, globalIndex)
			this._elementsMap.delete(arrTargetIds[i])
		}
	}
	public addD2CircleItems(targetPrimitives: Map<string, TElementD2CircleJSONData>): void {
		for (let [key, primitiveItemValueData] of targetPrimitives) {
			const { globalIndex, blockItem } = this.addPrimitiveItem(PtType.D2_CIRCLE, D2CircleDataGL.createArrayData(primitiveItemValueData))
			this._elementsMap.set(key, { ptType: PtType.D2_CIRCLE, globalIndex })
		}
	}
	public updateD2CircleItems(targetPrimitives: Map<string, TElementD2CircleJSONData>): void {
		for (let [key, primitiveItemValueData] of targetPrimitives) {
			const { ptType, globalIndex } = this._elementsMap.get(key)!
			const blockItem: PrimitiveBlock = this.updatePrimitiveItem(ptType, globalIndex, D2CircleDataGL.createArrayData(primitiveItemValueData))
		}
	}

	public deleteD2ImageItems(targetIds: Set<string>): void {
		const arrTargetIds: Array<string> = Array.from(targetIds)
		for (let i: number = 0; i < arrTargetIds.length; i++) {
			const { ptType, globalIndex } = this._elementsMap.get(arrTargetIds[i])!
			const blockItem: PrimitiveBlock = this.deletePrimitiveItem(ptType, globalIndex)
			this._dataBuilder.updateBlockTexture(blockItem, null!)
			this._elementsMap.delete(arrTargetIds[i])
		}
	}
	public addD2ImageItems(targetPrimitives: Map<string, TElementD2ImageJSONData & { texture: WebGLTexture }>): void {
		for (let [key, primitiveItemValueData] of targetPrimitives) {
			const { globalIndex, blockItem } = this.addPrimitiveItem(PtType.D2_IMAGE, D2ImageDataGL.createArrayData(primitiveItemValueData))
			this._dataBuilder.updateBlockTexture(blockItem, primitiveItemValueData.texture)
			this._elementsMap.set(key, { ptType: PtType.D2_IMAGE, globalIndex })
		}
	}
	public updateD2ImageItems(targetPrimitives: Map<string, TElementD2ImageJSONData & { texture: WebGLTexture }>): void {
		for (let [key, primitiveItemValueData] of targetPrimitives) {
			const { ptType, globalIndex } = this._elementsMap.get(key)!
			const blockItem: PrimitiveBlock = this.updatePrimitiveItem(ptType, globalIndex, D2ImageDataGL.createArrayData(primitiveItemValueData))
		}
	}

	public deleteD2LineItems(targetIds: Set<string>): void {
		const arrTargetIds: Array<string> = Array.from(targetIds)
		for (let i: number = 0; i < arrTargetIds.length; i++) {
			const { ptType, globalIndex } = this._elementsMap.get(arrTargetIds[i])!
			const blockItem: PrimitiveBlock = this.deletePrimitiveItem(ptType, globalIndex)
			this._elementsMap.delete(arrTargetIds[i])
		}
	}
	public addD2LineItems(targetPrimitives: Map<string, TElementD2LineJSONData>): void {
		for (let [key, primitiveItemValueData] of targetPrimitives) {
			const { globalIndex, blockItem } = this.addPrimitiveItem(PtType.D2_LINE, D2LineDataGL.createArrayData(primitiveItemValueData))
			this._elementsMap.set(key, { ptType: PtType.D2_LINE, globalIndex })
		}
	}
	public updateD2LineItems(targetPrimitives: Map<string, TElementD2LineJSONData>): void {
		for (let [key, primitiveItemValueData] of targetPrimitives) {
			const { ptType, globalIndex } = this._elementsMap.get(key)!
			const blockItem: PrimitiveBlock = this.updatePrimitiveItem(ptType, globalIndex, D2LineDataGL.createArrayData(primitiveItemValueData))
		}
	}

	public deleteD2PointItems(targetIds: Set<string>): void {
		const arrTargetIds: Array<string> = Array.from(targetIds)
		for (let i: number = 0; i < arrTargetIds.length; i++) {
			const { ptType, globalIndex } = this._elementsMap.get(arrTargetIds[i])!
			const blockItem: PrimitiveBlock = this.deletePrimitiveItem(ptType, globalIndex)
			this._elementsMap.delete(arrTargetIds[i])
		}
	}
	public addD2PointItems(targetPrimitives: Map<string, TElementD2PointJSONData>): void {
		for (let [key, primitiveItemValueData] of targetPrimitives) {
			const { globalIndex, blockItem } = this.addPrimitiveItem(PtType.D2_POINT, D2PointDataGL.createArrayData(primitiveItemValueData))
			this._elementsMap.set(key, { ptType: PtType.D2_POINT, globalIndex })
		}
	}
	public updateD2PointItems(targetPrimitives: Map<string, TElementD2PointJSONData>): void {
		for (let [key, primitiveItemValueData] of targetPrimitives) {
			const { ptType, globalIndex } = this._elementsMap.get(key)!
			const blockItem: PrimitiveBlock = this.updatePrimitiveItem(ptType, globalIndex, D2PointDataGL.createArrayData(primitiveItemValueData))
		}
	}

	public deleteD2TextItems(targetIds: Set<string>): void {
		const arrTargetIds: Array<string> = Array.from(targetIds)
		for (let i: number = 0; i < arrTargetIds.length; i++) {
			const { ptType, globalIndex } = this._elementsMap.get(arrTargetIds[i])!
			const blockItem: PrimitiveBlock = this.deletePrimitiveItem(ptType, globalIndex)
			this._elementsMap.delete(arrTargetIds[i])
		}
	}
	public addD2TextItems(targetPrimitives: Map<string, TElementD2TextJSONData>): void {
		for (let [key, primitiveItemValueData] of targetPrimitives) {
			const arrayData: Float32Array = D2TextDataGL.createArrayData(primitiveItemValueData)
			const indicesData: Uint16Array = D2TextDataGL.createIndicesData(primitiveItemValueData)
			const { globalIndex, blockItem } = this.addPrimitiveItem(PtType.D2_TEXT, arrayData, indicesData)
			this._elementsMap.set(key, { ptType: PtType.D2_TEXT, globalIndex })
		}
	}
	public updateD2TextItems(targetPrimitives: Map<string, TElementD2TextJSONData>): void {
		for (let [key, primitiveItemValueData] of targetPrimitives) {
			const { ptType, globalIndex } = this._elementsMap.get(key)!
			const arrayData: Float32Array = D2TextDataGL.createArrayData(primitiveItemValueData)
			const indicesData: Uint16Array = D2TextDataGL.createIndicesData(primitiveItemValueData)
			const blockItem: PrimitiveBlock = this.updatePrimitiveItem(ptType, globalIndex, arrayData, indicesData)
		}
	}

	public render(): void {
		const viewMatrix4: Matrix4 = Camera.getInstance().getViewMatrix4(true)
		const viewMatrix4Data: Float32Array = new Float32Array(viewMatrix4.data)
		const zoomRatio: number = Camera.getInstance().getZoomRatio()
		const pmBlocks: Map<PtType, Array<PrimitiveBlock>> = this._dataBuilder.getPmBlocks()
		for (let [ptType, blocks] of pmBlocks) {
			for (let i: number = 0; i < blocks.length; i++) {
				this._dataBuilder.update(blocks[i])
				this._programBuilder.render(ptType, blocks[i], viewMatrix4Data, zoomRatio)
			}
		}
	}

	public quit(): void {
		this._dataBuilder.clearAll()
		this._dataBuilder = undefined!
		this._programBuilder = undefined!
		this._elementsMap.clear()
		this._elementsMap = undefined!
		super.quit()
	}

	private addPrimitiveItem(ptType: PtType, ptData: Float32Array, indices?: Uint16Array): { globalIndex: number; blockItem: PrimitiveBlock } {
		const { globalIndex, blockItem } = this._dataBuilder.addPrimitiveItem(ptType, ptData, indices)
		return { globalIndex, blockItem }
	}

	private updatePrimitiveItem(ptType: PtType, globalIndex: number, ptData: Float32Array, indices?: Uint16Array): PrimitiveBlock {
		const blockItem: PrimitiveBlock = this._dataBuilder.updatePrimitiveItem(ptType, globalIndex, ptData, indices)
		return blockItem
	}

	private deletePrimitiveItem(ptType: PtType, globalIndex: number): PrimitiveBlock {
		const blockItem: PrimitiveBlock = this._dataBuilder.deletePrimitiveItem(ptType, globalIndex)
		return blockItem
	}
}
