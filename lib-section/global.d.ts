declare type PlainObject<T = any> = Record<string, T>

declare interface Window {
	IS_DESKTOP: boolean
	CAPTURE_SCREEN_SOURCEID: string
}

declare module 'process'

declare module '*.bmp' {
	const src: string
	export default src
}

declare module '*.gif' {
	const src: string
	export default src
}

declare module '*.jpg' {
	const src: string
	export default src
}

declare module '*.jpeg' {
	const src: string
	export default src
}

declare module '*.png' {
	const src: string
	export default src
}

declare module '*.webp' {
	const src: string
	export default src
}

declare module '*.svg' {
	const src: string
	export default src
}

declare module '*.css' {
	const content: { [className: string]: string }
	export = content
}

declare module '*.module.css' {
	const content: { [className: string]: string }
	export = content
}

declare module '*.module.less' {
	const content: { [className: string]: string }
	export = content
}

declare module '*.ini' {
	const content: string
	export = content
}
