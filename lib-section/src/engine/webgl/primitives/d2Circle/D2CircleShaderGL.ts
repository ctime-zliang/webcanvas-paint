export class D2CircleShaderGL {
	static createVS(): string {
		return `
            precision mediump float;
            attribute lowp float a_index;
            attribute vec4 a_objPosition;  // [cx, cy, cz, r]
            attribute vec4 a_param;  // [alpha, is-round, stroke-width, is-fill]
            attribute vec4 a_strokeColor;  // [red, green, blue, alpha]
            attribute vec4 a_fillColor;  // [red, green, blue, alpha]
            uniform mat4 u_matrix;
            varying vec4 v_objPosition;
            varying vec4 v_param;
            varying vec4 v_position;
            varying vec4 v_strokeColor;
            varying vec4 v_fillColor;

            float getEqual(float value, float refer) {
                return value == refer ? 1.0 : 0.0;
            }

            void main() {
                if (a_objPosition[3] < 0.0) {
                    return;
                }
                float strokeWidth = a_param[2];
                vec4 position = vec4(a_objPosition.x, a_objPosition.y, 0.0, 1.0);
                // 需要将三角形的顶点外扩 strokeWidth 的距离
                vec2 top = 
                    vec2(a_objPosition.x, a_objPosition.y) 
                    + vec2(0, 2.0 * a_objPosition.w + strokeWidth);
                vec2 leftBottom = 
                    vec2(a_objPosition.x, a_objPosition.y) 
                    + vec2(-1.0 * (sqrt(3.0) * a_objPosition.w + sqrt(3.0) * strokeWidth), -1.0 * (a_objPosition.w + strokeWidth / 2.0));
                vec2 rightBottom = 
                    vec2(a_objPosition.x, a_objPosition.y) 
                    + vec2(sqrt(3.0) * a_objPosition.w + sqrt(3.0) * strokeWidth, -1.0 * (a_objPosition.w + strokeWidth / 2.0));
                position.xy = top * getEqual(a_index, 0.0) + leftBottom * getEqual(a_index, 1.0) + rightBottom * getEqual(a_index, 2.0);
                gl_Position = u_matrix * position;
                v_objPosition = a_objPosition;
                v_position = position;
                v_strokeColor = a_strokeColor;
                v_fillColor = a_fillColor;
                v_param = a_param;
            }
        `
	}

	static createFS(): string {
		return `
            precision mediump float;
            varying vec4 v_objPosition;
            varying vec4 v_position;
            varying vec4 v_param;
            varying vec4 v_strokeColor;
            varying vec4 v_fillColor;

            void main() {
                vec2 circleCenter = v_objPosition.xy;
                float strokeWidth = v_param[2];
                float alpha = v_param[0];
                float radius = v_objPosition.w;
                bool isFill = v_param.w == 1.0;
                vec2 circleDirLine = v_position.xy - circleCenter;
                bool isOuter = length(circleDirLine) > radius + strokeWidth / 2.0;
                bool isInner = length(circleDirLine) < radius - strokeWidth / 2.0;
                if (isOuter) {
                    discard;
                    return;
                } else if (isInner) {
                    if (!isFill) {
                        discard;
                        return;
                    }
                    gl_FragColor = vec4(v_fillColor.xyz, v_fillColor.w * alpha);
                } else {
                    gl_FragColor = vec4(v_strokeColor.xyz, v_strokeColor.w * alpha);
                }
            }
        `
	}
}
