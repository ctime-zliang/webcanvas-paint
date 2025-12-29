export class TestD2AxisShaderGL {
	static createVS(): string {
		return `
            precision mediump float;
            attribute vec3 a_objPosition;
            uniform mat4 u_matrix;
            uniform vec2 u_origin;
            uniform vec2 u_deltaSize;
            uniform float u_multiRatio;
            varying vec4 v_color;

            bool nearZero(float n) {
                return abs(n) <= 0.0000001;
            }

            void main() {
                vec2 gridSize = vec2(0.5, 0.5);
                vec4 color1 = vec4(1.0, 0.0, 0.0, 1.0);
                vec4 color2 = vec4(0.0, 1.0, 0.0, 1.0);
                vec4 color3 = vec4(0.0, 0.0, 1.0, 1.0);
                vec4 position = u_matrix * vec4(a_objPosition, 1.0);
                vec2 pos = vec2(position.xy) - u_origin;
                bool isAxis = false;
                bool isBold = false;
                float delX = a_objPosition.x / gridSize.x;
                float delY = a_objPosition.y / gridSize.y;
                float dx = floor((delX - u_deltaSize.x) + 0.5);
                float dy = floor((delY - u_deltaSize.y) + 0.5);
                if (dx > 0.0) {
                    dx = -dx;
                }
                if (dy > 0.0) {
                    dy = -dy;
                }
                if (a_objPosition.z == 0.0) {
                    isAxis = nearZero(pos.x);
                    isBold = nearZero(mod(dx, u_multiRatio));
                } else if (a_objPosition.z == 1.0) {
                    isAxis = nearZero(pos.y) || nearZero(pos.x);
                    isBold = nearZero(mod(dy, u_multiRatio));
                } else {
                    isAxis = nearZero(pos.x) || nearZero(pos.y);
                    isBold = nearZero(mod(dx, u_multiRatio)) || nearZero(mod(dy, u_multiRatio));
                }
                if (isAxis) {
                    v_color = color1;
                } else {
                    v_color = isBold ? color2 : color3;
                }
                gl_Position = vec4(pos, 0.0, 1.0);
                gl_Position = position;
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

	static createObjPositionData(data: any): any {}

	static createParamData(data: any): any {}

	static createColorData(data: any): any {}
}
