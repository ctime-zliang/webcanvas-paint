export class D2ArcShaderGL {
	static createVS(): string {
		return `
			precision mediump float;
			attribute lowp float a_index;
			attribute vec4 a_objPosition;  // [cx, cy, cz, radius]
			attribute vec4 a_angle;  // [startAngle, endAngle, sweepAngle, <un-use>]
			attribute vec4 a_param;  // [alpha, is-round, stroke-width, is-fill]
			attribute vec4 a_strokeColor;  // [red, green, blue, alpha]
			attribute vec4 a_fillColor;  // [red, green, blue, alpha]
			uniform mat4 u_matrix;
			varying vec4 v_objPosition;
			varying vec4 v_position;
			varying vec4 v_strokeColor;
			varying vec4 v_fillColor;
			varying vec4 v_angle;
			varying vec4 v_param;
			varying float R;
			varying float r;

			float getLess(float a, float b) {
                return a < b ? 1.0 : 0.0;
            }
			float getEqual(float value, float refer) {
                return value == refer ? 1.0 : 0.0;
            }

			void main() {
				if (a_angle[2] == 0.0) {
					return;
				}
				R = a_objPosition[3] + a_param[2] / 2.0;
				r = a_objPosition[3] - a_param[2] / 2.0;
				float strokeWidth = a_param[2];
				if (strokeWidth < 0.0 || r < 0.0 ) {
					return;
				}
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
				v_angle = a_angle;
				v_param = a_param;
				v_position = position;
				v_strokeColor = a_strokeColor;
				v_fillColor = a_fillColor;
			}
        `
	}

	static createFS(): string {
		return `
			precision mediump float;
			varying vec4 v_objPosition;
			varying vec4 v_position;
			varying vec4 v_strokeColor;
			varying vec4 v_fillColor;
			varying vec4 v_angle;
			varying vec4 v_param;
			varying float R;
			varying float r;

			void main() {
				float startAngle = v_angle[0];
				float endAngle = v_angle[1];
				float sweepAngle = v_angle[2];
				float radius = v_objPosition[3];
				float strokeWidth = v_param[2];
				vec2 circleCenter = v_objPosition.xy;
				bool isFill = v_param[3] == 1.0;
				float alpha = v_param[0];
				// 圆心到三角面上任意点的向量, 并计算其单位向量
				vec2 circleDirLine = v_position.xy - circleCenter;
				vec2 norCircleDirLine = normalize(circleDirLine);
				// 圆心到三角面上任意点的距离
				float d = length(circleDirLine);
				if (d > R) {
					discard;
				} else {
					// 圆心到 startAngle 对应的圆上的点的向量, 并计算其单位向量
					// 圆心到 endAngle 对应的圆上的点的向量, 并计算其单位向量
					vec2 circleStartLine = vec2(radius * cos(startAngle), radius * sin(startAngle));
					vec2 circleEndLine = vec2(radius * cos(endAngle), radius * sin(endAngle));
					vec2 norCircleStartLine = normalize(circleStartLine);
					vec2 norCircleEndLine = normalize(circleEndLine);
					// startAngle 对应的角度在圆上的坐标(相对于坐标原点)
					// endAngle 对应的角度在圆上的坐标(相对于坐标原点)
					vec2 startLine = circleCenter.xy + circleStartLine;
					vec2 endLine = circleCenter.xy + circleEndLine;
					// 三角面上任意一点到 startAngle 对应的圆上的点的距离
					// 三角面上任意一点到 endAngle 对应的圆上的点的距离
					float d1 = length(v_position.xy - startLine);
					float d2 = length(v_position.xy - endLine);
					// 向量 norCircleStartLine x norCircleDirLine
					// 即 norCircleStartLine 与 norCircleDirLine 所构成的平行四边形的有向面积 SA
					// SA 大于 0, 即 norCircleDirLine 位于 norCircleStartLine 的逆时针旋转方位
					float SA = norCircleStartLine.x * norCircleDirLine.y - norCircleStartLine.y * norCircleDirLine.x;
					// 向量 norCircleEndLine x norCircleDirLine
					// 即 norCircleEndLine 与 norCircleDirLine 所构成的平行四边形的有向面积 EA
					// EA 小于 0, 即 norCircleDirLine 位于 norCircleEndLine 的顺时针旋转方位
					float EA = norCircleEndLine.x * norCircleDirLine.y - norCircleEndLine.y * norCircleDirLine.x;
					float PI = 3.1415926535897932384626433832795;
					if ((sweepAngle < PI && SA > 0.0 && EA < 0.0) || (sweepAngle >= PI && (SA > 0.0 || EA < 0.0))) {
						// 圆弧主段
						if (d < r) {
							// 圆弧面
							if (isFill) {
								gl_FragColor = vec4(v_fillColor.xyz, v_fillColor.w * alpha);
							}
							return;
						}
						gl_FragColor = vec4(v_strokeColor.xyz, v_strokeColor.w * alpha);
						// if (d < r) {
						// 	gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
						// 	return;
						// }
						// gl_FragColor = vec4(1.0, 0.0, 0.0, 0.5);
					} else if (d1 < strokeWidth / 2.0 && SA <= 0.0) {
						// 起始点圆角
					 	if (v_param[1] == 0.0) {
							discard;
							return;
						}
						if (d < r) {
							// 圆弧面
							return;
						}
						gl_FragColor = vec4(v_strokeColor.xyz, v_strokeColor.w * alpha);
						// if (d < r) {
						// 	gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);
						// 	return;
						// }
						// gl_FragColor = vec4(0.0, 1.0, 0.0, 0.5);
					} else if (d2 < strokeWidth / 2.0 && EA >= 0.0) {
						// 结束点圆角
					 	if (v_param[1] == 0.0) {
							discard;
							return;
						}
						if (d < r) {
							// 圆弧面
							return;
						}
						gl_FragColor = vec4(v_strokeColor.xyz, v_strokeColor.w * alpha);
						// if (d < r) {
						// 	gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0);
						// 	return;
						// }
						// gl_FragColor = vec4(0.0, 0.0, 1.0, 0.5);
					} else {
						// discard;
					}
				}
			}
        `
	}
}
