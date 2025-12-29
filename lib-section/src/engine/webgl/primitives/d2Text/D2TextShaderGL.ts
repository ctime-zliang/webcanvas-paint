export class D2TextShaderGL {
	static createVS(): string {
		return `
			precision mediump float;
            attribute vec3 a_objPosition;  // [x, y, z]
            attribute vec4 a_param;  // [alpha, font-size, <un-use>, <un-use>]
            attribute vec4 a_color;  // [red, green, blue, alpha]
            uniform mat4 u_matrix;
			varying vec4 v_param;
            varying vec4 v_color;

            void main() {
                vec4 position = vec4(a_objPosition.x, a_objPosition.y, a_objPosition.z, 1.0);
                gl_Position = u_matrix * position;
                v_color = a_color;
                v_param = a_param;
            }
        `
	}

	static createFS(): string {
		return `
            precision mediump float;
            varying vec4 v_param;
            varying vec4 v_color;

            void main() {
				float alpha = v_param[0];
				gl_FragColor = vec4(v_color.xyz, alpha);
            }
        `
	}
}
