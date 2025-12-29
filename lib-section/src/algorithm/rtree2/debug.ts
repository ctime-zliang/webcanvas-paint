import { RtreeDebug_profile } from './config'
import { TRtreeNodeItem, TSimpleRect } from './Rtree'

const RtreeDebug_storageAuxiliary: { ids: Array<string> } = {
	ids: [],
}

export function RtreeDebug_getRandomInArea(min: number = 0, max: number = Number.MAX_SAFE_INTEGER): number {
	return Math.floor(Math.random() * (max - min + 1)) + min
}

export function RtreeDebug_getHashIden(length: number = 18): string {
	const s: Array<string> = []
	const HEX_DIGITS: string = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
	for (let i: number = 0; i < length; i++) {
		s[i] = HEX_DIGITS.substr(Math.floor(Math.random() * 0x10), 1)
	}
	s[14] = String(RtreeDebug_getRandomInArea(1, 9))
	s[19] = HEX_DIGITS.substr((+s[19] & 0x3) | 0x8, 1)
	s[8] = String(RtreeDebug_getRandomInArea(1, 9))
	s[13] = String(RtreeDebug_getRandomInArea(1, 9))
	s[18] = String(RtreeDebug_getRandomInArea(1, 9))
	s[23] = String(RtreeDebug_getRandomInArea(1, 9))
	return s.join('')
}

/**
 * 创建 DEBUG 显示视图容器元素
 */
export function RtreeDebug_appendContainerViewArea(container: HTMLElement): void {
	const id: string = RtreeDebug_profile.debugContainerId
	const style: string = `
		position: fixed; 
		left: 0; top: 0; 
		right: 0; 
		bottom: 0; 
		z-index: 999999; 
		background-color: rgba(255, 255, 255, 1.0);
		box-sizing: border-box;
	`
	const htmlString: string = `
        <div id="${id}" style="${style}"></div></div>
    `
	container.appendChild(document.createRange().createContextualFragment(htmlString))
}

/**
 * 创建 DEBUG 各区块 RECT 信息显示区域视图元素
 */
export function RtreeDebug_appendRectViewSection(rectList: Array<[TSimpleRect, any]>, viewContainerId: string): void {
	let wrapper: DocumentFragment = document.createDocumentFragment()
	for (let i: number = 0; i < rectList.length; i++) {
		const item: [TSimpleRect, any] = rectList[i]
		const pos: TSimpleRect = item[0]
		const data: any = item[1]
		let htmlString = `
			<div id="${data.id}" style="position: absolute; overflow: hidden; font-size: 12px; width: ${pos.w}px; height: ${pos.h}px; left: ${pos.x}px; top: ${pos.y}px; background-color: rgba(128, 128, 128, 0.5);">
				<div>${i}. ${data.id}</div>
				<div>sx = ${pos.x}</div>
				<div>sy = ${pos.y}</div>
				<div>w = ${pos.w}</div>
				<div>h = ${pos.h}</div>
			</div>
		`
		let itemElement: DocumentFragment = document.createRange().createContextualFragment(htmlString)
		wrapper.appendChild(itemElement)
	}
	;(document.getElementById(RtreeDebug_profile.debugContainerId) as HTMLElement).appendChild(wrapper)
}

/**
 * 显示或移除 RECT 辅助 DOM 元素
 */
export function RtreeDebug_updateRectangleAuxiliary(id: string, node: TRtreeNodeItem, borderColor: string = 'red'): void {
	if (RtreeDebug_storageAuxiliary.ids.indexOf(id) <= -1) {
		RtreeDebug_storageAuxiliary.ids.push(id)
	}
	const mixinId: string = `auxiliary_${id}`
	let targetElement: HTMLElement = document.getElementById(mixinId) as HTMLElement
	if (!targetElement) {
		const newElement: HTMLElement = document.createElement('div') as HTMLElement
		newElement.id = mixinId
		newElement.setAttribute('id', mixinId)
		;(document.getElementById(RtreeDebug_profile.debugContainerId) as HTMLElement).appendChild(newElement)
		targetElement = newElement
	}
	targetElement.style.border = `1px dashed ${borderColor}`
	targetElement.style.position = 'absolute'
	targetElement.style.boxSizing = `border-box`
	targetElement.style.left = `${node.x}px`
	targetElement.style.top = `${node.y}px`
	targetElement.style.width = `${node.w}px`
	targetElement.style.height = `${node.h}px`
}
export function RtreeDebug_removeRectangleAuxiliary(id: string): void {
	const idx: number = RtreeDebug_storageAuxiliary.ids.indexOf(id)
	if (idx >= 0) {
		RtreeDebug_storageAuxiliary.ids.splice(idx, 1)
	}
	const mixinId: string = `auxiliary_${id}`
	let targetElement: HTMLElement = document.getElementById(mixinId) as HTMLElement
	if (!targetElement) {
		return
	}
	targetElement.remove()
}
