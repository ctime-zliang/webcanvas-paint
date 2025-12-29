export class D2ImageShaderGL {
	static createVS(): string {
		return `
			precision highp float;
			precision highp int;
			attribute lowp float a_index;
            attribute vec4 a_leftPosition;  // [upX, upY, downX, downY]
			attribute vec4 a_rightPosition;  // [upX, upY, downX, downY]
            attribute vec4 a_param;  // [alpha, <un-use>, <un-use>, <un-use>]
            uniform mat4 u_matrix;
			uniform float u_zoomRatio;
			varying vec4 v_param;
			varying vec2 v_textureCoord;
			varying float v_zoomRatio;

			float getEqual(float value, float refer) {
                return value == refer ? 1.0 : 0.0;
            }

            void main() {
				float is04 = getEqual(a_index, 0.0) + getEqual(a_index, 4.0);
				float is13 = getEqual(a_index, 1.0) + getEqual(a_index, 3.0);
				float is2 = getEqual(a_index, 2.0);
				float is5 = getEqual(a_index, 5.0);
				vec2 position = a_leftPosition.xy * is04 + a_rightPosition.zw * is13 + a_leftPosition.zw * is2 + a_rightPosition.xy * is5;
				v_textureCoord = vec2(is13 + is5, is04 + is5);
                gl_Position = u_matrix * vec4(position.x, position.y, 0.0, 1.0);
                v_param = a_param;
				v_zoomRatio = u_zoomRatio;
            }
        `
	}

	static createFS(): string {
		return `
            precision mediump float;
			uniform sampler2D u_texture;
            varying vec4 v_param;
			varying vec2 v_textureCoord;
			varying float v_zoomRatio;

            void main() {
				float alpha = v_param[0];
				gl_FragColor = texture2D(u_texture, v_textureCoord);
				gl_FragColor.a = gl_FragColor.a * alpha;
            }
        `
	}
}
