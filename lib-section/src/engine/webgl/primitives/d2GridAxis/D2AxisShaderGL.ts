import { AxisParam } from '../../../common/AxisParam'
import { fillDot, fillLineHorizontal, fillLineVertical } from './Utils'

export class D2AxisShaderGL {
	static createVS(): string {
		return `
            precision mediump float;
            attribute vec3 a_objPosition;
            uniform vec2 u_antialias;
            uniform mat4 u_matrix;
            uniform vec2 u_gridSize;
            uniform vec2 u_moveCount;
            uniform vec2 u_origin;
            uniform vec4 u_gridColor;
            uniform vec4 u_multiGridColor;
            uniform vec4 u_gridDotColor;
            uniform vec4 u_axisColor;
            uniform float u_multiRatio;
            uniform float u_drawType;
            uniform float u_isShowGrid;
            uniform float u_isShowMultiGrid;
            uniform float u_isShowGridDot;
            uniform float u_isShowAxis;
            varying vec4 v_color;

            bool nearZero(float n) {
                return abs(n) <= 0.0000001;
            }

            void main() {
                if (u_antialias.x == 0.5) {
                    gl_PointSize = 1.0 * (1.0 - u_antialias.y) + 1.5 * u_antialias.y;
                } else {
                    gl_PointSize = 2.0 * u_antialias.x;
                }
                vec4 objPosition = u_matrix * vec4(a_objPosition, 1.0);
                if (u_drawType == 2.0) {
                    if (u_isShowGridDot == 1.0) {
                        // #IF: 仅显示网点
                        v_color = u_gridDotColor;
                        gl_Position = objPosition;
                    }
                    return;
                }
                vec4 origin = u_matrix * vec4(u_origin, 1.0, 1.0);
                vec2 pos = vec2(objPosition.xy) - u_origin;
                bool isAxis = false;
                bool isMultiGrid = false;
                float indexVert = a_objPosition.x / u_gridSize.x;
                float indexHori = a_objPosition.y / u_gridSize.y;
                float dx = floor((indexVert - u_moveCount.x) + 0.5);
                float dy = floor((indexHori - u_moveCount.y) + 0.5);
                if (dx > 0.0) {
                    dx = -dx;
                }
                if (dy > 0.0) {
                    dy = -dy;
                }
                if (a_objPosition.z == 0.0) {
                    isAxis = nearZero(pos.x);
                    isMultiGrid = nearZero(mod(dx, u_multiRatio));
                } else if (a_objPosition.z == 0.1) {
                    isAxis = nearZero(pos.y) || nearZero(pos.x);
                    isMultiGrid = nearZero(mod(dy, u_multiRatio));
                } else {
                    isAxis = nearZero(pos.x) || nearZero(pos.y);
                    isMultiGrid = nearZero(mod(dx, u_multiRatio)) || nearZero(mod(dy, u_multiRatio));
                }
                if (isAxis) {
                    if (u_isShowAxis != 1.0) {
                        if (u_isShowGrid == 1.0) {
                            v_color = u_gridColor;
                        }
                    } else {
                        v_color = u_axisColor;
                    }
                }  else {
                    if (u_isShowGrid != 1.0) {
                        return;
                    }
                    if (isMultiGrid) {
                        if (u_isShowMultiGrid != 1.0) {
                            v_color = u_gridColor;
                        } else {
                            v_color = u_multiGridColor;
                        }
                    } else {
                        v_color = u_gridColor;
                    }
                }
                gl_Position = objPosition;
            }
        `
	}

	static createFS(): string {
		return `
            precision mediump float;
            varying vec4 v_color;

            void main () {
                gl_FragColor = v_color;
            }
        `
	}

	static createLinePositionsData(viewWidth: number, viewHeight: number): Array<number> {
		const positionsData: Array<number> = []
		const ratio: number = 30
		const axisParam: AxisParam = AxisParam.getInstance()
		const width: number = (viewWidth / ratio) * axisParam.axisStepX * 4
		const height: number = (viewHeight / ratio) * axisParam.axisStepY * 4
		for (let x: number = 0; x < width; x += axisParam.axisStepX) {
			fillLineVertical(positionsData, x, height)
		}
		for (let x: number = -axisParam.axisStepX; x > -width; x -= axisParam.axisStepX) {
			fillLineVertical(positionsData, x, height)
		}
		for (let y: number = 0; y < height; y += axisParam.axisStepY) {
			fillLineHorizontal(positionsData, y, width)
		}
		for (let y: number = -axisParam.axisStepY; y > -height; y -= axisParam.axisStepY) {
			fillLineHorizontal(positionsData, y, width)
		}
		return positionsData
	}

	static createDotPositionsData(viewWidth: number, viewHeight: number): Array<number> {
		const positionsData: Array<number> = []
		const ratio: number = 30
		const axisParam: AxisParam = AxisParam.getInstance()
		const width: number = (viewWidth / ratio) * axisParam.axisStepX * 4
		const height: number = (viewHeight / ratio) * axisParam.axisStepY * 4
		for (let x: number = 0; x < width; x += axisParam.axisStepX) {
			for (let y: number = 0; y < height; y += axisParam.axisStepY) {
				fillDot(positionsData, x, y)
			}
			for (let y: number = -axisParam.axisStepY; y > -height; y -= axisParam.axisStepY) {
				fillDot(positionsData, x, y)
			}
		}
		for (let x: number = -axisParam.axisStepX; x > -width; x -= axisParam.axisStepX) {
			for (let y: number = 0; y < height; y += axisParam.axisStepY) {
				fillDot(positionsData, x, y)
			}
			for (let y: number = -axisParam.axisStepY; y > -height; y -= axisParam.axisStepY) {
				fillDot(positionsData, x, y)
			}
		}
		return positionsData
	}
}
