export class D2LineShaderGL {
	public static createVS(): string {
		return `
            precision mediump float;
            attribute lowp float a_index;
            attribute vec3 a_objPositionS;  // [sx, sy, sz]
            attribute vec3 a_objPositionE;  // [ex, ey, ez]
            attribute vec4 a_param;  // [alpha, is-round, stroke-width, is-solid]
            attribute vec4 a_profile;  // [seg-size, gap-size, is-fixed-stroke-width, <rect-border-radius>]
            attribute vec4 a_color;  // [red, green, blue, alpha]
            uniform mat4 u_matrix;
            uniform float u_zoomRatio;
            varying vec3 v_objPositionS;
            varying vec3 v_objPositionE;
            varying vec2 v_position;
            varying vec2 v_lineDirect;
            varying vec4 v_param;
            varying vec4 v_profile;
            varying vec4 v_color;
            varying vec4 v_options;  // [half-width, min-w, <un-use>, <un-use>]
            varying float v_zoomRatio;

            float getEqual(float value, float refer) {
                return value == refer ? 1.0 : 0.0;
            }
            float getLess(float a, float b) {
                return a < b ? 1.0 : 0.0;
            }

            void main() {
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
                vec2 v4 = norLineDirect * halfWidth * a_param[1];
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
                v_lineDirect = lineDirect;
                v_objPositionS = a_objPositionS;
                v_objPositionE = a_objPositionE;
                float minW = halfWidth;
                minW = getLess(0.0, minW) * minW;
                v_options = vec4(halfWidth, minW, 0.0, 0.0);
                v_profile = a_profile;
                v_color = a_color;
                v_zoomRatio = u_zoomRatio;
            }
        `
	}

	public static createFS(): string {
		return `
            precision mediump float;
            varying vec3 v_objPositionS;
            varying vec3 v_objPositionE;
            varying vec2 v_position;
            varying vec2 v_lineDirect;
            varying vec4 v_param;
            varying vec4 v_profile;
            varying vec4 v_color;
            varying vec4 v_options;
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

            void rectBorderRadiusFilters(vec2 position, vec2 lineDirect, vec2 lineMiddle, float rectBorderRadius, float halfWidth) {
                vec2 norLineDirect = normalize(lineDirect);
                vec2 point2LineMiddle = v_position - lineMiddle;
                float x = abs(dot(norLineDirect, point2LineMiddle));
                float y = abs(point2LineMiddle.x * norLineDirect.y - point2LineMiddle.y * norLineDirect.x);
                float xEdge = length(lineDirect) * 0.5 - rectBorderRadius;
                float yEdge = halfWidth - rectBorderRadius;
                if (x >= xEdge && y >= yEdge) {
                    float deltaX = x - xEdge;
                    float deltaY = y - yEdge;
                    float dis = length(vec2(deltaX, deltaY));
                    if (dis >= rectBorderRadius) {
                        discard;
                        // gl_FragColor = vec4(0.0, 1.0, 1.0, 1.0);  // 线条所示矩形的四个直角(若为圆角矩形时, 则表示圆弧外侧区域)
                    } else {
                        // gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0);  // 线条所示矩形的四个直角(若为圆角矩形时, 则表示圆弧内测半圆)
                    }
                } else {
                   // gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);  // 线条本体
                }
            }

            void main() {
                float halfWidth = v_options[0];
                float segLength = v_profile[0];
                float gapLength = v_profile[1];
                bool isFixedStrokeWidth = v_profile[2] == 1.0;
                if (isFixedStrokeWidth) {
                    segLength = segLength / v_zoomRatio;
                    gapLength = gapLength / v_zoomRatio;
                }
                float rectBorderRadius = v_profile[3];
                // 线段向量
                vec2 norLineDirect = normalize(v_lineDirect);
                float lineLength = length(v_lineDirect);
                vec2 lineStart2Corner = v_position - v_objPositionS.xy;
                float v = dot(lineStart2Corner, norLineDirect); 
                if (v < 0.0) {
                    // v < 0.0
                    // 此时 lineStart2Corner 位于线段起点外侧的矩形范围内
                    float radiuLen = length(lineStart2Corner);
                    if (radiuLen > halfWidth) {
                        discard;
                    } else {
                        // 对线段起点外侧圆角着色
                        gl_FragColor = vec4(v_color.xyz, v_color.w * v_param[0]);
                    }
                    if (v_param[1] == 0.0) {
                        discard;
                    }
                } else if (v > lineLength) {
                    // v > lineLength
                    // 此时 lineStart2Corner 位于线段终点外侧的矩形范围内
                    float radiuLen = length(v_position - v_objPositionE.xy);
                    if (radiuLen > halfWidth) {
                        discard;
                    } else {
                        // 对线段终点外侧圆角着色
                        gl_FragColor = vec4(v_color.xyz, v_color.w * v_param[0]);
                    }
                    if (v_param[1] == 0.0) {
                        discard;
                    }
                } else {
                    vec2 lineMiddle = (v_objPositionS.xy + v_objPositionE.xy) * 0.5;
                    if (v_param[3] == 1.0) {  // 实线
                        gl_FragColor = vec4(v_color.xyz, v_color.w * v_param[0]);
                        rectBorderRadiusFilters(v_position, v_lineDirect, lineMiddle, rectBorderRadius, halfWidth);
                        return;
                    }
                    vec2 cl = project(lineStart2Corner, norLineDirect);
                    float pLen = length(cl);
                    float m = mod(pLen, (segLength + gapLength));
                    float c = floor(pLen / (segLength + gapLength));
                    if (m <= segLength) {
                        // 对虚线上子短线段进行着色
                        // 若线段为圆角端点, 则此处不包含每个子短线段上的两端圆角部分
                        gl_FragColor = vec4(v_color.xyz, v_color.w * v_param[0]);
                        rectBorderRadiusFilters(v_position, v_lineDirect, lineMiddle, rectBorderRadius, halfWidth);
                        // gl_FragColor = vec4(0.0, 1.0, 1.0, 1.0);
                    } else {
                        vec2 scaleVec1 = norLineDirect * (c * (segLength + gapLength) + segLength);
                        vec2 scaleVec2 = norLineDirect * ((c + 1.0) * (segLength + gapLength));
                        if (length(v_lineDirect) <= length(scaleVec2) + halfWidth * 0.5) {
                            gl_FragColor = vec4(v_color.xyz, v_color.w * v_param[0]);
                            rectBorderRadiusFilters(v_position, v_lineDirect, lineMiddle, rectBorderRadius, halfWidth);
                            // gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0);
                        } else {
                            float radiuLen1 = length(lineStart2Corner - scaleVec1);
                            float radiuLen2 = length(lineStart2Corner - scaleVec2);
                            if (v_param[1] == 1.0 && (radiuLen1 <= halfWidth || radiuLen2 <= halfWidth)) {
                                // 当线段为虚线时, 若线段为圆角端点, 则对每个子短线段的两端圆角部分着色
                                gl_FragColor = vec4(v_color.xyz, v_color.w * v_param[0]);
                            }
                        }
                    }
                }
            }
        `
	}
}
