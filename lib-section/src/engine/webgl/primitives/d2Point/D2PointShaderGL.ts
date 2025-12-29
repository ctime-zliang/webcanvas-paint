export class D2PointShaderGL {
	static createVS(): string {
		return `
            attribute lowp float a_index;
            attribute vec4 a_objPosition;  // [cx, cy, cz, size]
            attribute vec4 a_param;  // [alpha, is-enable-scale, shape, <un-use>]
            attribute vec4 a_color;  // [red, green, blue, alpha]
            uniform mat4 u_matrix;
            uniform float u_zoomRatio;
            varying vec4 v_objPosition;
            varying vec4 v_param;
            varying vec4 v_position;
            varying vec4 v_color;
            varying float v_zoomRatio;

            float getEqual(float value, float refer) {
                return value == refer ? 1.0 : 0.0;
            }

            void main() {
                if (a_objPosition[3] < 0.0) {
                    return;
                }
                float isEnableScale = a_param[1];
                float radius = a_objPosition.w / (isEnableScale == 1.0 ? 1.0 : u_zoomRatio);
                vec4 position = vec4(a_objPosition.x, a_objPosition.y, 0.0, 1.0);
                if (a_param.z == 2.0) {
                    // 三角形
                    //...
                } else if (a_param.z == 1.0) {
                    // 圆点
                    radius = radius * 2.0;
                }
                vec2 top = vec2(a_objPosition.x, a_objPosition.y) + vec2(0, radius);
                vec2 leftBottom = vec2(a_objPosition.x, a_objPosition.y) + vec2(-1.0 * (sqrt(3.0) * radius / 2.0), -1.0 * (radius / 2.0));
                vec2 rightBottom = vec2(a_objPosition.x, a_objPosition.y) + vec2(sqrt(3.0) * radius / 2.0, -1.0 * (radius / 2.0));
                position.xy = top * getEqual(a_index, 0.0) + leftBottom * getEqual(a_index, 1.0) + rightBottom * getEqual(a_index, 2.0);
                gl_Position = u_matrix * position;
                v_objPosition = a_objPosition;
                v_position = position;
                v_color = a_color;
                v_param = a_param;
                v_zoomRatio = u_zoomRatio;
            }
        `
	}

	static createFS(): string {
		return `
            precision mediump float;
            varying vec4 v_objPosition;
            varying vec4 v_position;
            varying vec4 v_param;
            varying vec4 v_color;
            varying float v_zoomRatio;

            void main() {
                float alpha = v_param[0];
                float isEnableScale = v_param[1];
                float radius = v_objPosition.w / (isEnableScale == 1.0 ? 1.0 : v_zoomRatio);
                if (v_param.z == 2.0) {
                    // 三角形
                    //...
                } else if (v_param.z == 1.0) {
                    // 圆点
                    if (length(v_position.xy - v_objPosition.xy) > radius) {
                        discard;
                    }
                }
                gl_FragColor = vec4(v_color.xyz, v_color.w * alpha);
            }
        `
	}
}
