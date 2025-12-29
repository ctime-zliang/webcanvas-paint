import { ECoreEngineType, ECoreRenderMode } from '../config/CommonProfile'
import { SceneGL } from '../webgl/SceneGL'
import { WebGL } from '../webgl/WebGL'
import { AxisParam } from './AxisParam'
import { Camera, EProjectionType } from './Camera'
import { Light } from './Light'
import { Scene } from './Scene'

export async function createEngine(engineType: ECoreEngineType, renderMode: ECoreRenderMode, canvasElement: HTMLCanvasElement): Promise<Scene> {
	Camera.getInstance()
	Light.getInstance()
	AxisParam.getInstance()
	if (engineType === ECoreEngineType.WEBGL) {
		Camera.getInstance().setProjectionType(EProjectionType.ORTH)
		const webGL: WebGL = new WebGL(canvasElement)
		const sceneGL: SceneGL = new SceneGL(webGL)
		sceneGL.renderer.setRenderMode(renderMode)
		return sceneGL
	}
	return null!
}

export function destoryEngine(engineType: ECoreEngineType, scene: Scene): void {
	Camera.getInstance().quit()
	if (engineType === ECoreEngineType.WEBGL) {
		Camera.getInstance().setProjectionType(EProjectionType.ORTH)
		let sceneGL: SceneGL = scene as SceneGL
		let renderer: WebGL = sceneGL.renderer
		sceneGL.quit()
		renderer.quit()
	}
}
