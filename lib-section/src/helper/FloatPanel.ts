import { CanvasProfileData, InputInfoData, toFixed } from '../Main'

const panelPublicStyle = `
	min-width: 345px;
	margin: 5px 0; 
	padding: 0 10px 1px 10px; 
	font-size: 12px;
	box-shadow: 1px 1px 4px rgba(0, 0, 0, 0.2); 
	background: rgba(25, 25, 25, 0.75); 
	border: 1px solid #666666; 
	border-radius: 3px;
`

export class FloatPanel {
	static createContainer(container: HTMLElement, position: 'LT' | 'RT' | 'LB' | 'RB' = 'RB'): HTMLElement {
		const positionStyle: string = {
			LT: 'left: 0; top: 0;',
			RT: 'right: 0; top: 0;',
			LB: 'left: 0; bottom: 0;',
			RB: 'right: 0; bottom: 0;',
		}[position]
		const elementId: string = `floatPanel${Math.random()}`
		const wrapperHTML: string = `
			<section id="${elementId}" style="
				position: fixed; 
				${positionStyle} 
				z-index: 9999; 
				user-select: none;
				padding: 5px 10px;
			">
			</section>
		`
		container.append(document.createRange().createContextualFragment(wrapperHTML))
		return document.getElementById(elementId) as HTMLElement
	}

	static inputsPanelControl = {
		appendTo(container: HTMLElement): void {
			const wrapperHTML: string = `
				<main style="${panelPublicStyle}">
					<div style="padding: 2px 0; display: flex; justify-content: flex-start; align-items: center; align-content: center; color: #efefef;">
						<div>鼠标实时 DOM 坐标(pixel):&nbsp;&nbsp;</div>
						<div id="infoMouseMoveNativeAbsPos" style="min-width: 75px;">-/-</div>
					</div>
					<div style="padding: 2px 0; display: flex; justify-content: flex-start; align-items: center; align-content: center; color: #efefef;">
						<div>鼠标实时场景坐标(pixel):&nbsp;&nbsp;</div>
						<div id="infoMouseMoveSceneTruthPos" style="min-width: 75px;">-/-</div>
					</div>
					<div style="padding: 2px 0; display: flex; justify-content: flex-start; align-items: center; align-content: center; color:rgb(250, 152, 110); font-weight: bolder;">
						<div>鼠标实时物理坐标(mm):&nbsp;&nbsp;</div>
						<div id="infoMouseMoveScenePhysicsPos" style="min-width: 75px;">-/-</div>
					</div>
				</main>
			`
			container.append(document.createRange().createContextualFragment(wrapperHTML))
		},
		update(data: InputInfoData): void {
			const infoMouseMoveNativeAbsPosElement: HTMLElement = document.getElementById('infoMouseMoveNativeAbsPos') as HTMLElement
			infoMouseMoveNativeAbsPosElement.innerHTML = `${data.moveSourceNativePixelX}/${data.moveSourceNativePixelY}`
			const infoMouseMoveSceneTruthPosElement: HTMLElement = document.getElementById('infoMouseMoveSceneTruthPos') as HTMLElement
			infoMouseMoveSceneTruthPosElement.innerHTML = `${toFixed(data.moveScenePixelX, 8, true)}/${toFixed(data.moveScenePixelY, 8, true)}`
			const infoMouseMoveScenePhysicsPosElement: HTMLElement = document.getElementById('infoMouseMoveScenePhysicsPos') as HTMLElement
			infoMouseMoveScenePhysicsPosElement.innerHTML = `${toFixed(data.moveScenePhysicsX, 8, true)}/${toFixed(data.moveScenePhysicsY, 8, true)}`
		},
	}

	static canvasProfilePanelControl = {
		lastUpdateTimeStamp: 0,
		appendTo(container: HTMLElement): void {
			const wrapperHTML: string = `
				<main style="${panelPublicStyle}">
					<div style="padding: 2px 0; display: flex; justify-content: flex-start; align-items: center; align-content: center; color: #efefef;">
						<div>画布缩放比例:&nbsp;&nbsp;</div>
						<div id="canvasZoomRatio" style="min-width: 75px;">-%</div>
					</div>
					<div style="padding: 2px 0; display: flex; justify-content: flex-start; align-items: center; align-content: center; color: #efefef;">
						<div>画布尺寸/DPI:&nbsp;&nbsp;</div>
						<div id="canvasBoundingRect" style="min-width: 75px;">-%</div>
						<div id="viewDPI" style="min-width: 75px;">-</div>
					</div>
					<div style="padding: 2px 0; display: flex; justify-content: flex-start; align-items: center; align-content: center; color: #efefef;">
						<div>FPS:&nbsp;&nbsp;</div>
						<div id="fpsCount" style="min-width: 75px;">-</div>
					</div>
					<div style="padding: 2px 0; display: flex; justify-content: flex-start; align-items: center; align-content: center; color: #efefef;">
						<div>内存使用:&nbsp;&nbsp;</div>
						<div id="jsMemory" style="min-width: 75px;">-</div>
					</div>
				</main>
			`
			container.append(document.createRange().createContextualFragment(wrapperHTML))
		},
		update(data: CanvasProfileData): void {
			const canvasZoomRatioElement: HTMLElement = document.getElementById('canvasZoomRatio') as HTMLElement
			canvasZoomRatioElement.innerHTML = `${Number((data.zoomRatio * 100).toString().match(/^\d+(?:\.\d{0,2})?/)) + '%'}`
			const canvasBoundingRectElement: HTMLElement = document.getElementById('canvasBoundingRect') as HTMLElement
			canvasBoundingRectElement.innerHTML = `${data.canvasWidth} x ${data.canvasHeight}`
			const viewDPIElement: HTMLElement = document.getElementById('viewDPI') as HTMLElement
			viewDPIElement.innerHTML = `${data.DPI[0]} * ${data.DPI[1]}`
			const fpsCountElement: HTMLElement = document.getElementById('fpsCount') as HTMLElement
			fpsCountElement.innerHTML = `${data.fpsCount}/${data.diffFreshInterval}`
			if (performance.now() - this.lastUpdateTimeStamp >= 500) {
				this.lastUpdateTimeStamp = performance.now()
				const jsMemoryElement: HTMLElement = document.getElementById('jsMemory') as HTMLElement
				const memory = (performance as any).memory || {}
				jsMemoryElement.innerHTML = `${toFixed(memory.usedJSHeapSize / Math.pow(1024, 2), 2, true)}/${toFixed(
					memory.totalJSHeapSize / Math.pow(1024, 2),
					2,
					true
				)}`
			}
		},
	}

	static btnsControl = {
		appendTo(container: HTMLElement): void {
			const wrapperHTML: string = `
				<main style="${panelPublicStyle}">
					<div style="padding: 2px 0; display: flex; justify-content: flex-start; align-items: center; align-content: center; color: #efefef;">
						<button id="quitCanvas" style="background-color: #dcdcdc; border: 1px solid #acacac; border-radius: 3px; color: #333333; height: 24px; margin: 0 5px; padding: 0 5px; cursor: pointer; margin-left: 0;">销毁画布</button>
						<button id="resetCanvasStatus" style="background-color: #dcdcdc; border: 1px solid #acacac; border-radius: 3px; color: #333333; height: 24px; margin: 0 5px; padding: 0 5px; cursor: pointer; margin-left: 0;">重置画布状态</button>
						<button disabled="disabled" id="setRenderMode2D" style="background-color: #dcdcdc; border: 1px solid #acacac; border-radius: 3px; color: #333333; height: 24px; margin: 0 5px; padding: 0 5px; cursor: not-allowed;">2D</button>
						<button disabled="disabled" id="setRenderMode3D" style="background-color: #dcdcdc; border: 1px solid #acacac; border-radius: 3px; color: #333333; height: 24px; margin: 0 5px; padding: 0 5px; cursor: not-allowed;">3D</button>
					</div>
				</main>
			`
			container.append(document.createRange().createContextualFragment(wrapperHTML))
		},
		update(): void {},
		event(optional: { [key: string]: any } = {}): void {
			const quitCanvasElement: HTMLElement = document.getElementById('quitCanvas') as HTMLElement
			quitCanvasElement.addEventListener('click', (e: MouseEvent): void => {
				optional.quitCanvasClickCallback && optional.quitCanvasClickCallback()
			})
			const resetCanvasStatusElement: HTMLElement = document.getElementById('resetCanvasStatus') as HTMLElement
			resetCanvasStatusElement.addEventListener('click', (e: MouseEvent): void => {
				optional.resetCanvasStatusClickCallback && optional.resetCanvasStatusClickCallback()
			})
			const setRenderMode2DElement: HTMLElement = document.getElementById('setRenderMode2D') as HTMLElement
			setRenderMode2DElement.addEventListener('click', (e: MouseEvent): void => {
				optional.setRenderMode2DClickCallback && optional.setRenderMode2DClickCallback()
			})
			const setRenderMode3DElement: HTMLElement = document.getElementById('setRenderMode3D') as HTMLElement
			setRenderMode3DElement.addEventListener('click', (e: MouseEvent): void => {
				optional.setRenderMode3DClickCallback && optional.setRenderMode3DClickCallback()
			})
		},
	}
}
