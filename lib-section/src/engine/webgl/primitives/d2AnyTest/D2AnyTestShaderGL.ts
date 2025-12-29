export class D2AnyTestShaderGL {
	static createVS(): string {
		return `
            precision mediump float;
            attribute vec3 a_objPosition;
            attribute vec4 a_color;
            uniform mat4 u_matrix;
            varying vec3 v_objPosition;
            varying vec4 v_color;

            bool nearZero(float n) {
                return abs(n) <= 0.0000001;
            }

            void main() {
                v_objPosition = a_objPosition;
                v_color = a_color;
                gl_Position = vec4(a_objPosition.xyz, 1.0);
            }
        `
	}

	static createFS(): string {
		return `
            precision mediump float;
            varying vec3 v_objPosition;
            varying vec4 v_color;

            bool isLess(float x, float edge) {
                return step(x, edge) == 1.0;
            }

            void main () {
                vec4 color = v_color;
                color.x = smoothstep(0.4, 0.4, color.x);
                gl_FragColor = color;
            }
        `
	}
}
