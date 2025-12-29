import { PrimitiveBlock } from '../buffer/PrimitiveDataBuilderGL'
import { PtType } from '../primitives/PrimitiveGL'
import { WebGL } from '../WebGL'
import { ProgramGL } from './ProgramGL'
import { D2ArcInstancedProgramGL } from '../primitives/d2Arc/D2ArcInstancedProgramGL'
import { D2CircleInstancedProgramGL } from '../primitives/d2Circle/D2CircleInstancedProgramGL'
import { D2ImageInstancedProgramGL } from '../primitives/d2Image/D2ImageInstancedProgramGL'
import { D2LineInstancedProgramGL } from '../primitives/d2Line/D2LineInstancedProgramGL'
import { D2PointInstancedProgramGL } from '../primitives/d2Point/D2PointInstancedProgramGL'
import { D2TextProgramGL } from '../primitives/d2Text/D2TextProgramGL'

export class PrimitiveProgramBuilderGL {
	private _webGL: WebGL
	private _arcManager: ProgramGL
	private _circleManager: ProgramGL
	private _imageManager: ProgramGL
	private _lineManager: ProgramGL
	private _pointManager: ProgramGL
	private _textManager: ProgramGL
	constructor(webGL: WebGL) {
		this._webGL = webGL
		this._arcManager = new D2ArcInstancedProgramGL(this._webGL)
		this._circleManager = new D2CircleInstancedProgramGL(this._webGL)
		this._imageManager = new D2ImageInstancedProgramGL(this._webGL)
		this._lineManager = new D2LineInstancedProgramGL(this._webGL)
		this._pointManager = new D2PointInstancedProgramGL(this._webGL)
		this._textManager = new D2TextProgramGL(this._webGL)
	}

	public render(ptType: PtType, blockItem: PrimitiveBlock, viewMatrix4Data: Float32Array, zoomRatio: number): void {
		const ptsNums: number = blockItem.ptIdsBuilder.getUpperItemIndex() + 1
		const indicesNums: number = blockItem.indicesBuilder.getUpperItemIndex() + 1
		switch (ptType) {
			case PtType.D2_ARC: {
				this._arcManager.render(blockItem.ptDatasBuilder.dataBuffer, ptsNums, viewMatrix4Data, zoomRatio)
				break
			}
			case PtType.D2_CIRCLE: {
				this._circleManager.render(blockItem.ptDatasBuilder.dataBuffer, ptsNums, viewMatrix4Data, zoomRatio)
				break
			}
			case PtType.D2_IMAGE: {
				this._imageManager.render(blockItem.ptDatasBuilder.dataBuffer, ptsNums, blockItem.texture, viewMatrix4Data, zoomRatio)
				break
			}
			case PtType.D2_LINE: {
				this._lineManager.render(blockItem.ptDatasBuilder.dataBuffer, ptsNums, viewMatrix4Data, zoomRatio)
				break
			}
			case PtType.D2_POINT: {
				this._pointManager.render(blockItem.ptDatasBuilder.dataBuffer, ptsNums, viewMatrix4Data, zoomRatio)
				break
			}
			case PtType.D2_TEXT: {
				this._textManager.render(
					blockItem.ptDatasBuilder.dataBuffer,
					blockItem.indicesBuilder.dataBuffer,
					indicesNums,
					viewMatrix4Data,
					zoomRatio
				)
				break
			}
		}
	}
}
