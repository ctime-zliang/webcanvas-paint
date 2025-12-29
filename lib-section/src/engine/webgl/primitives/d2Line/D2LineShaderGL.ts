export class D2LineShaderGL {
	static createVS(): string {
		return `
            precision mediump float;
            attribute lowp float a_index;
            attribute vec3 a_objPositionS;  // [sx, sy, sz]
            attribute vec3 a_objPositionE;  // [ex, ey, ez]
            attribute vec4 a_param;  // [alpha, is-round, stroke-width, is-solid]
            attribute vec4 a_profile;  // [seg-size, gap-size, is-fixed-stroke-width, <un-use>]
            attribute vec4 a_color;  // [red, green, blue, alpha]
            uniform mat4 u_matrix;
            uniform float u_zoomRatio;
            varying vec3 v_objPositionS;
            varying vec3 v_objPositionE;
            varying vec2 v_position;
            varying vec4 v_param;
            varying vec4 v_profile;
            varying vec4 v_color;
            varying vec4 v_options;
            varying float v_zoomRatio;

            float getEqual(float value, float refer) {
                return value == refer ? 1.0 : 0.0;
            }
            float getLess(float a, float b) {
                return a < b ? 1.0 : 0.0;
            }

            void main() {
                float round = a_param[1];
                float width = a_param[2];
                bool isFixedStrokeWidth = a_profile[2] == 1.0;
                if (isFixedStrokeWidth) {
                    width = width / u_zoomRatio;
                }
                float halfWidth = width / 2.0;
                v_param = vec4(a_param[0], a_param[1], width, a_param[3]);
                vec4 position = vec4(0.0, 0.0, 0.0, 1.0);
                // 线段的终点向量 - 线段的起点向量
                // 即线段向量
                vec2 lineDirect = a_objPositionE.xy - a_objPositionS.xy;
                vec2 norLineDirect = normalize(lineDirect);
                // 将线段的单位向量绕原点逆时针旋转 90 度
                vec2 vertical = vec2(-norLineDirect.y, norLineDirect.x);
                // 参考 ./doc 图示
                // 求"宽线"矩形四个顶点的坐标
                vec2 v1 = a_objPositionS.xy;
                vec2 v2 = a_objPositionE.xy;
                vec2 v3 = vec2(vertical * halfWidth);
                vec2 v4 = norLineDirect * halfWidth * round;
                vec2 leftTop = v1 - v3 - v4;
                vec2 leftBottom = v2 - v3 + v4;
                vec2 rightBottom = v2 + v3 + v4;
                vec2 rightTop = v1 + v3 - v4;
                position.xy = 
                    leftTop * ((getEqual(a_index, 0.0) + getEqual(a_index, 3.0)))
                    + leftBottom * (getEqual(a_index, 1.0))
                    + rightBottom * (getEqual(a_index, 2.0) + getEqual(a_index, 4.0))
                    + rightTop * (getEqual(a_index, 5.0));
                gl_Position = u_matrix * vec4(position.xy, 0.0, 1.0);
                v_position = position.xy;
                v_objPositionS = a_objPositionS;
                v_objPositionE = a_objPositionE;
                float minW = halfWidth;
                minW = getLess(0.0, minW) * minW;
                v_options = vec4(halfWidth, minW, lineDirect.x, lineDirect.y);
                v_profile = a_profile;
                v_color = a_color;
                v_zoomRatio = u_zoomRatio;
            }
        `
	}

	static createFS(): string {
		return `
            precision mediump float;
            varying vec3 v_objPositionS;
            varying vec3 v_objPositionE;
            varying vec2 v_position;
            varying vec4 v_param;
            varying vec4 v_profile;
            varying vec4 v_color;
            varying vec4 v_options;  // [halfWidth, minW, lineDirect.x, lineDirect.y]
            varying float v_zoomRatio;
        
            // 向量 A 在向量 B 上的投影
            vec2 project(vec2 a, vec2 b) {
                float dotProduct = dot(a, b);
                float squaredLengthB = dot(b, b);
                if (squaredLengthB == 0.0) {
                    return vec2(0.0);
                }
                return dotProduct / squaredLengthB * b;
            }
            // 向量 A 在向量 B 上的投影
            vec2 projectVector(vec2 A, vec2 B) {
                // 计算向量 B 的单位向量
                vec2 unitB = normalize(B);                
                // 计算向量 A 在向量 B 上的投影长度
                float projectionLength = dot(A, unitB);
                if (projectionLength == 0.0) {
                    return vec2(0.0);
                }
                // 计算投影向量
                return projectionLength * unitB;
            }

            void main() {
                float halfWidth = v_options[0];
                float minW = v_options[1];
                float segLength = v_profile[0];
                float gapLength = v_profile[1];
                float alpha = v_param[0];
                bool isFixedStrokeWidth = v_profile[2] == 1.0;
                if (isFixedStrokeWidth) {
                    segLength = segLength / v_zoomRatio;
                    gapLength = gapLength / v_zoomRatio;
                }
                // 线段向量
                vec2 lineDirect = vec2(v_options[2], v_options[3]);
                vec2 norLineDirect = normalize(lineDirect);
                float lineLen = length(lineDirect);
                vec2 lineStart2Corner = v_position - v_objPositionS.xy;
                float v = dot(lineStart2Corner, norLineDirect);
                if (v < 0.0) {
                    // v < 0.0
                    // 此时 lineStart2Corner 位于线段起点外侧的矩形范围内
                    float radiuLen = length(lineStart2Corner);
                    if (radiuLen > halfWidth) {
                        discard;
                    } else {
                        gl_FragColor = vec4(v_color.xyz, v_color.w * alpha);
                    }
                } else if (v > lineLen) {
                    // v > lineLen
                    // 此时 lineStart2Corner 位于线段终点外侧的矩形范围内
                    float radiuLen = length(v_position - v_objPositionE.xy);
                    if (radiuLen > halfWidth) {
                        discard;
                    } else {
                        gl_FragColor = vec4(v_color.xyz, v_color.w * alpha);
                    }
                } else {
                    if (v_param[3] == 1.0) {
                        gl_FragColor = vec4(v_color.xyz, v_color.w * alpha);
                        return;
                    }
                    vec2 cl = project(lineStart2Corner, norLineDirect);
                    float pLen = length(cl);
                    float m = mod(pLen, (segLength + gapLength));
                    float c = floor(pLen / (segLength + gapLength));
                    if (m <= segLength) {
                        gl_FragColor = vec4(v_color.xyz, v_color.w * alpha);
                    } else {
                        vec2 scaleVec1 = norLineDirect * (c * (segLength + gapLength) + segLength);
                        vec2 scaleVec2 = norLineDirect * ((c + 1.0) * (segLength + gapLength));
                        if (length(lineDirect) <= length(scaleVec2)) {
                            gl_FragColor = vec4(v_color.xyz, alpha);
                        } else {
                            float radiuLen1 = length(lineStart2Corner - scaleVec1);
                            float radiuLen2 = length(lineStart2Corner - scaleVec2);
                            if (v_param[1] == 1.0 && (radiuLen1 <= halfWidth || radiuLen2 <= halfWidth)) {
                                gl_FragColor = vec4(v_color.xyz, v_color.w * alpha);
                            } else {
                                discard;
                            }
                        }
                    }
                }
            }
        `
	}
}
